---
title: "【Terraform】CloudFront Functions を使用して Basic 認証を設定する"
emoji: "🛡️"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["terraform", "aws", "cloudfront"]
published: true
---

たまに必要になるのでメモ。

# 検証環境

- Terraform v1.3.7
- AWS Provider v4.49.0

# サンプルコード

今回紹介するサンプルコードは下記リポジトリで管理しています。

https://github.com/koki-develop/cloudfront-basic-auth-example

# 準備

今回は例として S3 バケットのオブジェクトを配信する CloudFront Distribution を作成します。
主題ではないので気になる方のみ読んでください。

:::details サンプルコード

```tf:provider.tf
# AWS Provider の設定
provider "aws" {
  region = "us-east-1"
}
```

```tf:s3.tf
# S3 バケット
resource "aws_s3_bucket" "main" {
  bucket = "example"
}

# S3 バケットのパブリックアクセスを全てブロック
resource "aws_s3_bucket_public_access_block" "main" {
  bucket                  = aws_s3_bucket.main.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# 配信するサンプルオブジェクト
resource "aws_s3_object" "hello_txt" {
  bucket       = aws_s3_bucket.main.id
  key          = "hello.txt"
  content      = "Hello, World"
  content_type = "text/plain"
}

# バケットポリシー
resource "aws_s3_bucket_policy" "main" {
  bucket = aws_s3_bucket.main.id
  policy = data.aws_iam_policy_document.s3_main_policy.json
}

# CloudFront 経由でのみアクセスできるようにする
data "aws_iam_policy_document" "s3_main_policy" {
  statement {
    principals {
      type        = "Service"
      identifiers = ["cloudfront.amazonaws.com"]
    }
    actions   = ["s3:GetObject"]
    resources = ["${aws_s3_bucket.main.arn}/*"]
    condition {
      test     = "StringEquals"
      variable = "aws:SourceArn"
      values   = [aws_cloudfront_distribution.main.arn]
    }
  }
}
```

```tf:cloudfront.tf
data "aws_cloudfront_origin_request_policy" "cors_s3_origin" {
  name = "Managed-CORS-S3Origin"
}

data "aws_cloudfront_cache_policy" "caching_disabled" {
  name = "Managed-CachingDisabled"
}

# S3 バケット内のオブジェクトを配信する CloudFront
resource "aws_cloudfront_distribution" "main" {
  enabled = true

  origin {
    origin_id                = aws_s3_bucket.main.id
    domain_name              = aws_s3_bucket.main.bucket_regional_domain_name
    origin_access_control_id = aws_cloudfront_origin_access_control.main.id
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }

  default_cache_behavior {
    target_origin_id         = aws_s3_bucket.main.id
    viewer_protocol_policy   = "redirect-to-https"
    cached_methods           = ["GET", "HEAD"]
    allowed_methods          = ["GET", "HEAD"]
    origin_request_policy_id = data.aws_cloudfront_origin_request_policy.cors_s3_origin.id
    cache_policy_id          = data.aws_cloudfront_cache_policy.caching_disabled.id
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }
}

# OAC
resource "aws_cloudfront_origin_access_control" "main" {
  name                              = "example"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}
```

:::

# CloudFront Functions を使用して Basic 認証を設定する

## ユーザー名・パスワードを定義する

とりあえず Basic 認証に使用するユーザー名とパスワードを変数として定義しておきます。

```tf:variables.tf
variable "basicauth_username" {
  type = string
}

variable "basicauth_password" {
  type      = string
  sensitive = true
}
```

`terraform.tfvars` で任意の値を設定しておきます。

```tf:terraform.tfvars
basicauth_username = "user"
basicauth_password = "p@ssw0rd"
```

## CloudFront Function を作成する

まず CloudFront Function のソースコードを作成します。
ファイル名は今回は `basicauth.js` としておきます。

:::message
CloudFront Function でサポートされている JavaScript runtime 環境は ES5.1 に準拠しており、また、 ES6 ~ 9 の一部の機能をサポートしています。
例えば `const` や `let` などはサポートされていないことに注意してください。
詳しくは下記ドキュメントをご参照ください。
- [CloudFront Functions の JavaScript runtime 機能](https://docs.aws.amazon.com/ja_jp/AmazonCloudFront/latest/DeveloperGuide/functions-javascript-runtime-features.html)
:::

```js:basicauth.js
function handler(event) {
  var request = event.request;
  var headers = request.headers;

  // ${authString} の部分は Terraform から埋め込まれる
  var authString = "Basic ${authString}";

  // Authorization ヘッダを検証
  if (
    typeof headers.authorization === "undefined" ||
    headers.authorization.value !== authString
  ) {
    return {
      statusCode: 401,
      statusDescription: "Unauthorized",
      headers: {
        "www-authenticate": { value: "Basic" },
      },
    };
  }

  return request;
}
```

続いて CloudFront Function を作成します。
先ほど作成した `basicauth.js` を `templatefile` 関数で読み込み、 `${authString}` の部分に `<ユーザー名>:<パスワード>` を Base64 エンコードした値を埋め込んでいます。

```diff tf:cloudfront.tf
 # ...省略

 # Basic 認証を行う CloudFront Function
+resource "aws_cloudfront_function" "basicauth" {
+  name    = "example"
+  runtime = "cloudfront-js-1.0"
+  publish = true
+  code = templatefile(
+    "${path.module}/basicauth.js",
+    {
+      authString = base64encode("${var.basicauth_username}:${var.basicauth_password}")
+    }
+  )
+}
```

## 作成した CloudFront Function を CloudFront Distribution に関連付ける

続いて先ほど作成した CloudFront Function を CloudFront Distribution に関連付けます。
CloudFront Distribution の `default_cache_behavior` ブロック内に `function_association` ブロックを追加します。

```diff tf:cloudfront.tf
 # S3 バケット内のオブジェクトを配信する CloudFront
 resource "aws_cloudfront_distribution" "main" {
   # ...省略

   default_cache_behavior {
     # ...省略

+    function_association {
+      event_type   = "viewer-request"
+      function_arn = aws_cloudfront_function.basicauth.arn
+    }
   }

   # ...省略
 }
```

## `terraform apply` を実行する

CloudFront Distribution のドメイン名を確認しやすくするために `output` を作成しておきます。

```tf:output.tf
output "cloudfront_distribution_url" {
  value = "https://${aws_cloudfront_distribution.main.domain_name}"
}
```

`terraform apply` を実行してリソースを作成します。

```sh
$ terraform apply
# ...省略

Apply complete! Resources: 7 added, 0 changed, 0 destroyed.

Outputs:

cloudfront_distribution_url = "https://<CloudFront Distributionのドメイン名>"
```

これでリソースの作成が完了しました。

## 動作確認する

今回は例として CloudFront Distribution のオリジンの S3 バケットに `hello.txt` というオブジェクトを作成しました。
`https://<CloudFront Distributionのドメイン名>/hello.txt` にブラウザからアクセスしてみると Basic 認証のユーザー名とパスワードの入力ダイアログが表示されます。

![](/images/tf-cloudfront-basicauth/access.png)

ユーザー名とパスワードを入力して `hello.txt` の内容が表示されれば成功です。

![](/images/tf-cloudfront-basicauth/accessed.png)

# まとめ

さくっと設定できるので便利！！

# 参考

https://dev.classmethod.jp/articles/apply-basic-authentication-password-with-cloudfront-functions/

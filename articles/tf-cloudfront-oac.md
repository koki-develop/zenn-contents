---
title: "【Terraform】CloudFront から S3 へのアクセス制御に Origin Access Control を利用する"
emoji: "🪣"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["terraform", "aws", "cloudfront"]
published: true
published_at: 2022-09-02 19:00
---

CloudFront から S3 へのアクセス制御方法として新しく Origin Access Control (OAC) というものが発表されました。
これにより従来の Origin Access Identity (OAI) によるアクセス制御は Legacy となりました。
詳しくは次の記事をご参照ください。

https://dev.classmethod.jp/articles/amazon-cloudfront-origin-access-control/

Terraform の [AWS Provider](https://github.com/hashicorp/terraform-provider-aws) も本日リリースされた [v4.29.0](https://registry.terraform.io/providers/hashicorp/aws/4.29.0) から [OAC](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/cloudfront_origin_access_control) をサポートしたので、 CloudFront から S3 へのアクセス制御に OAC を利用する Terraform のサンプルコードを備忘録として残しておきます。

https://github.com/koki-develop/cloudfront-oac-with-terraform-example

# 前提

[AWS Provider](https://github.com/hashicorp/terraform-provider-aws) のバージョンが [v4.29.0](https://registry.terraform.io/providers/hashicorp/aws/4.29.0) 以降である必要があります。

# サンプルコード

## Origin Access Identity を利用したアクセス制御 ( レガシー )

今まで CloudFront から S3 へのアクセス制御に OAI を使う場合は次のように書いていました。

```tf:cloudfront.tf
resource "aws_cloudfront_distribution" "main" {
  enabled = true

  # オリジンの設定
  origin {
    origin_id   = aws_s3_bucket.main.id
    domain_name = aws_s3_bucket.main.bucket_regional_domain_name
    # OAI を設定
    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.main.cloudfront_access_identity_path
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }

  default_cache_behavior {
    target_origin_id       = aws_s3_bucket.main.id
    viewer_protocol_policy = "redirect-to-https"
    cached_methods         = ["GET", "HEAD"]
    allowed_methods        = ["GET", "HEAD"]
    forwarded_values {
      query_string = false
      headers      = []
      cookies {
        forward = "none"
      }
    }
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }
}

# OAI を作成
resource "aws_cloudfront_origin_access_identity" "main" {}
```

```tf:s3.tf
# CloudFront 経由で配信する S3 バケット
resource "aws_s3_bucket" "main" {
  bucket = "cf-oac-with-tf-example"
}

resource "aws_s3_bucket_public_access_block" "main" {
  bucket                  = aws_s3_bucket.main.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# バケットポリシー
resource "aws_s3_bucket_policy" "main" {
  bucket = aws_s3_bucket.main.id
  policy = data.aws_iam_policy_document.s3_main_policy.json
}

data "aws_iam_policy_document" "s3_main_policy" {
  # OAI からのアクセスのみ許可
  statement {
    principals {
      type        = "AWS"
      identifiers = [aws_cloudfront_origin_access_identity.main.iam_arn]
    }
    actions   = ["s3:GetObject"]
    resources = ["${aws_s3_bucket.main.arn}/*"]
  }
}
```

## Origin Access Control を利用したアクセス制御

OAC を利用してアクセス制御を行う場合は次のように設定します。

```tf diff:cloudfront.tf
 resource "aws_cloudfront_distribution" "main" {
   enabled = true

   # オリジンの設定
   origin {
     origin_id   = aws_s3_bucket.main.id
     domain_name = aws_s3_bucket.main.bucket_regional_domain_name
     # OAC を設定
+    origin_access_control_id = aws_cloudfront_origin_access_control.main.id
-    s3_origin_config {
-      origin_access_identity = aws_cloudfront_origin_access_identity.main.cloudfront_access_identity_path
-    }
   }

   viewer_certificate {
     cloudfront_default_certificate = true
   }

   default_cache_behavior {
     target_origin_id       = aws_s3_bucket.main.id
     viewer_protocol_policy = "redirect-to-https"
     cached_methods         = ["GET", "HEAD"]
     allowed_methods        = ["GET", "HEAD"]
     forwarded_values {
       query_string = false
       headers      = []
       cookies {
         forward = "none"
       }
     }
   }

   restrictions {
     geo_restriction {
       restriction_type = "none"
     }
   }
 }

 # OAC を作成
+resource "aws_cloudfront_origin_access_control" "main" {
+  name                              = "cf-oac-with-tf-example"
+  origin_access_control_origin_type = "s3"
+  signing_behavior                  = "always"
+  signing_protocol                  = "sigv4"
+}
-resource "aws_cloudfront_origin_access_identity" "main" {}
```

```tf diff:s3.tf
# CloudFront 経由で配信する S3 バケット
 resource "aws_s3_bucket" "main" {
   bucket = "cf-oac-with-tf-example"
 }

 resource "aws_s3_bucket_public_access_block" "main" {
   bucket                  = aws_s3_bucket.main.id
   block_public_acls       = true
   block_public_policy     = true
   ignore_public_acls      = true
   restrict_public_buckets = true
 }

 # バケットポリシー
 resource "aws_s3_bucket_policy" "main" {
   bucket = aws_s3_bucket.main.id
   policy = data.aws_iam_policy_document.s3_main_policy.json
 }

 data "aws_iam_policy_document" "s3_main_policy" {
   # CloudFront Distribution からのアクセスのみ許可
   statement {
     principals {
+      type        = "Service"
+      identifiers = ["cloudfront.amazonaws.com"]
-      type        = "AWS"
-      identifiers = [aws_cloudfront_origin_access_identity.main.iam_arn]
     }
     actions   = ["s3:GetObject"]
     resources = ["${aws_s3_bucket.main.arn}/*"]
+    condition {
+      test     = "StringEquals"
+      variable = "aws:SourceArn"
+      values   = [aws_cloudfront_distribution.main.arn]
+    }
   }
 }
```

# まとめ

今後は OAC を使いましょう。

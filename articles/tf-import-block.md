---
title: "Terraform 1.5 で追加される import ブロックの使い方"
emoji: "📥"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["terraform"]
published: true
published_at: 2023-05-22 18:00
---

先日 Terraform v1.5.0-beta1 がリリースされました。

https://github.com/hashicorp/terraform/releases/tag/v1.5.0-beta1

`NEW FEATURES` を眺めてみると、どうやら `import` ブロックというものが追加されているみたいです。
今までは既存のリソースを Terraform の管理下に追加するためには `terraform import` コマンドを使用して 1 つ 1 つ import する必要がありました。
`import` ブロックを使用することでリソースの import を宣言的に実行することができるようになりました。

というわけで試してみました。
( この記事とは関係ないですが `check` ブロックも気になりますね。 )

# 検証環境

- Terraform v1.5.0-beta1

# サンプルコード

今回紹介するコードは以下のリポジトリで管理しています。

https://github.com/koki-develop/tf-import-example

# 試してみる

## 準備

### 手作業でリソースを作成

検証するための AWS リソースを作成します。
今回は `terraform-import-example` という名前の S3 バケットを作成しました。

```sh
$ aws s3 mb s3://terraform-import-example
make_bucket: terraform-import-example
```

続いて AWS Provider の設定を記述した `provider.tf` を作成します。

```hcl:provider.tf
provider "aws" {
  region = "ap-northeast-1"
}
```

`terraform init` を実行します。

```sh
$ terraform init
```

### リソースを Terraform コードに追加

事前に作成した S3 バケットを Terraform コードに追加します。
次のような内容で `main.tf` を作成します。

```hcl:main.tf
resource "aws_s3_bucket" "main" {
  bucket = "terraform-import-example" # 事前に作成したバケットと同じ名前
}
```

当然ですが、この段階では事前に作成した S3 バケットは Terraform 管理下に含まれていません。
なので `terraform apply` を実行してみると Terraform は S3 バケットを新しく作成しようとするため、エラー ( 名前の重複 ) になります。

```sh
$ terraform apply

Terraform used the selected providers to generate the following execution plan. Resource actions are indicated with
the following symbols:
  + create

Terraform will perform the following actions:

  # aws_s3_bucket.main will be created
  + resource "aws_s3_bucket" "main" {
      + acceleration_status         = (known after apply)
      + acl                         = (known after apply)
      + arn                         = (known after apply)
      + bucket                      = "terraform-import-example"
      + bucket_domain_name          = (known after apply)
      + bucket_prefix               = (known after apply)
      + bucket_regional_domain_name = (known after apply)
      + force_destroy               = false
      + hosted_zone_id              = (known after apply)
      + id                          = (known after apply)
      + object_lock_enabled         = (known after apply)
      + policy                      = (known after apply)
      + region                      = (known after apply)
      + request_payer               = (known after apply)
      + tags_all                    = (known after apply)
      + website_domain              = (known after apply)
      + website_endpoint            = (known after apply)
    }

Plan: 1 to add, 0 to change, 0 to destroy.

Do you want to perform these actions?
  Terraform will perform the actions described above.
  Only 'yes' will be accepted to approve.

  Enter a value: yes

aws_s3_bucket.main: Creating...
╷
│ Error: creating Amazon S3 (Simple Storage) Bucket (terraform-import-example): BucketAlreadyOwnedByYou: Your previous request to create the named bucket succeeded and you already own it.
│       status code: 409, request id: ****************, host id: ****************************************************************************************
│
│   with aws_s3_bucket.main,
│   on main.tf line 1, in resource "aws_s3_bucket" "main":
│    1: resource "aws_s3_bucket" "main" {
│
╵
```

## `import` ブロックを使用してリソースを import する

それでは `main.tf` を編集して `import` ブロックを追加してみます。
`id` にはリソースの識別子を、 `to` にはインポート先のリソース定義の識別子を指定します。

```hcl diff:main.tf
+import {
+  id = "terraform-import-example" # リソースの識別子
+  to = aws_s3_bucket.main         # import 先
+}

 resource "aws_s3_bucket" "main" {
   bucket = "terraform-import-example"
 }
```

`terraform plan` を実行してみます。

```sh
$ terraform plan
aws_s3_bucket.main: Preparing import... [id=terraform-import-example]
aws_s3_bucket.main: Refreshing state... [id=terraform-import-example]

Terraform will perform the following actions:

  # aws_s3_bucket.main will be imported
    resource "aws_s3_bucket" "main" {
        arn                         = "arn:aws:s3:::terraform-import-example"
        bucket                      = "terraform-import-example"
        bucket_domain_name          = "terraform-import-example.s3.amazonaws.com"
        bucket_regional_domain_name = "terraform-import-example.s3.ap-northeast-1.amazonaws.com"
        hosted_zone_id              = "Z2M4EHUR26P7ZW"
        id                          = "terraform-import-example"
        object_lock_enabled         = false
        region                      = "ap-northeast-1"
        request_payer               = "BucketOwner"
        tags                        = {}
        tags_all                    = {}

        grant {
            id          = "****************************************************************"
            permissions = [
                "FULL_CONTROL",
            ]
            type        = "CanonicalUser"
        }

        server_side_encryption_configuration {
            rule {
                bucket_key_enabled = false

                apply_server_side_encryption_by_default {
                    sse_algorithm = "AES256"
                }
            }
        }

        versioning {
            enabled    = false
            mfa_delete = false
        }
    }

Plan: 1 to import, 0 to add, 0 to change, 0 to destroy.

─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

Note: You didn't use the -out option to save this plan, so Terraform can't guarantee to take exactly these actions if
you run "terraform apply" now.
```

`# aws_s3_bucket.main will be imported`, `Plan: 1 to import, ...` などのように import のプランが出力されていることが確認できます。
続けて `terraform apply` を実行してみます。

```sh
$ terraform apply
aws_s3_bucket.main: Preparing import... [id=terraform-import-example]
aws_s3_bucket.main: Refreshing state... [id=terraform-import-example]

Terraform will perform the following actions:

  # aws_s3_bucket.main will be imported
    resource "aws_s3_bucket" "main" {
        arn                         = "arn:aws:s3:::terraform-import-example"
        bucket                      = "terraform-import-example"
        bucket_domain_name          = "terraform-import-example.s3.amazonaws.com"
        bucket_regional_domain_name = "terraform-import-example.s3.ap-northeast-1.amazonaws.com"
        hosted_zone_id              = "Z2M4EHUR26P7ZW"
        id                          = "terraform-import-example"
        object_lock_enabled         = false
        region                      = "ap-northeast-1"
        request_payer               = "BucketOwner"
        tags                        = {}
        tags_all                    = {}

        grant {
            id          = "****************************************************************"
            permissions = [
                "FULL_CONTROL",
            ]
            type        = "CanonicalUser"
        }

        server_side_encryption_configuration {
            rule {
                bucket_key_enabled = false

                apply_server_side_encryption_by_default {
                    sse_algorithm = "AES256"
                }
            }
        }

        versioning {
            enabled    = false
            mfa_delete = false
        }
    }

Plan: 1 to import, 0 to add, 0 to change, 0 to destroy.

Do you want to perform these actions?
  Terraform will perform the actions described above.
  Only 'yes' will be accepted to approve.

  Enter a value: yes

aws_s3_bucket.main: Importing... [id=terraform-import-example]
aws_s3_bucket.main: Import complete [id=terraform-import-example]

Apply complete! Resources: 1 imported, 0 added, 0 changed, 0 destroyed.
```

`Apply complete! Resources: 1 imported, ...` のように、 S3 バケットが import されたことが出力されています。
実際に tfstate を確認してみます。

```sh
$ terraform state pull
{
  # ...省略
  "resources": [
    {
      "mode": "managed",
      "type": "aws_s3_bucket",
      "name": "main",
      "provider": "provider[\"registry.terraform.io/hashicorp/aws\"]",
      "instances": [
        {
          "schema_version": 0,
          "attributes": {
            "acceleration_status": "",
            "acl": null,
            "arn": "arn:aws:s3:::terraform-import-example",
            "bucket": "terraform-import-example",
            "bucket_domain_name": "terraform-import-example.s3.amazonaws.com",
            # ...省略
          },
          # ...省略
        }
      ]
    }
  ],
  # ...省略
}
```

S3 バケットが tfstate に追加されていることが確認できます。

このように `import` ブロックを使用することで、事前に import の内容を確認したり、複数のリソースをまとめて import するなどの操作が可能になりました。

# その他

## import 実行後の `import` ブロックについて

import を実行したあとの `import` ブロックは削除して構いません。
残しておいても影響はありませんが、何もしない無意味なブロックになります。

## `import` ブロックの制約

Terraform v1.5.0-beta1 時点では `import` ブロックの `id` には文字列リテラルしか指定できません。
Variable や Local Value 、リソースの attribute なども使用することはできないため注意してください。

:::message

Terraform v1.6.0 からは文字列リテラル以外も指定できるようになりました 🎉

- [Terraform 1.6 adds a test framework for enhanced code validation](https://www.hashicorp.com/blog/terraform-1-6-adds-a-test-framework-for-enhanced-code-validation)

:::

```hcl:main.tf
variable "name" {
  type    = string
  default = "terraform-import-example"
}

import {
  id = var.name # Variable を使用
  to = aws_s3_bucket.main
}

# ...省略
```

```sh
# エラーが起きる
$ terraform plan
╷
│ Error: Variables not allowed
│
│   on main.tf line 7, in import:
│    7:   id = var.name
│
│ Variables may not be used here.
╵
╷
│ Error: Unsuitable value type
│
│   on main.tf line 7, in import:
│    7:   id = var.name
│
│ Unsuitable value: value must be known
```

# まとめ

config-driven で実行できる操作がどんどん増えて便利になっていきますね。

# 参考

https://github.com/hashicorp/terraform/releases/tag/v1.5.0-beta1

---
title: "Terraform 1.7 から import ブロックで for_each が使えるようになった"
emoji: "📥"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["terraform"]
published: true
published_at: 2024-01-18 18:00
---

Terraform 1.7 がリリースされました 🎉

https://www.hashicorp.com/blog/terraform-1-7-adds-test-mocking-and-config-driven-remove
https://github.com/hashicorp/terraform/releases/tag/v1.7.0

> Terraform 1.7 also includes an enhancement for config-driven import: the ability to expand `import` blocks using `for_each` loops.

`import` ブロックで `for_each` が使えるようになったとのことなので試してみます。

:::message

`import` ブロックの基本的な使い方については以下の記事をご参照ください。

- [Terraform 1.5 で追加される import ブロックの使い方](https://zenn.dev/kou_pg_0131/articles/tf-import-block)
- [Terraform 1.5 で既存リソースからの HCL 生成ができるようになるので試してみる](https://zenn.dev/kou_pg_0131/articles/tf-generate-config)

:::

ちなみに他にも Terraform 1.7 ではテストでモックが使えるようになったり `removed` ブロックが追加されたりと、様々な機能追加や改善が含まれています。

:::message

`removed` ブロックの使い方については以下の記事をご参照ください。

- [Terraform 1.7 で追加されそうな removed ブロックの使い方](https://zenn.dev/kou_pg_0131/articles/tf-removed-block)

:::

# 検証環境

- Terraform v1.7.0

# 試してみる

## 準備

下記の名前で 3 つの S3 バケットを作成しておきます。

- `tf-import-for-each-example-1`
- `tf-import-for-each-example-2`
- `tf-import-for-each-example-3`

```sh
$ aws s3 mb s3://tf-import-for-each-example-1
$ aws s3 mb s3://tf-import-for-each-example-2
$ aws s3 mb s3://tf-import-for-each-example-3
```

続いて AWS Provider の設定を記述した `provider.tf` を作成します。

```tf:provider.tf
provider "aws" {
  region = "ap-northeast-1"
}
```

`terraform init` を実行します。

```sh
$ terraform init
```

## リソースを Terraform コードに追加

事前に作成した S3 バケットの定義を Terraform に追加します。
バケットの一覧を `locals` で定義し、 `aws_s3_bucket.main` 内の `for_each` で指定しています。

```tf:s3.tf
locals {
  buckets = {
    "first"  = "tf-import-for-each-example-1"
    "second" = "tf-import-for-each-example-2"
    "third"  = "tf-import-for-each-example-3"
  }
}

resource "aws_s3_bucket" "main" {
  for_each = local.buckets
  bucket   = each.value
}
```

この段階ではリソースをまだ import していないため、 `terraform apply` を実行しても `BucketAlreadyExists` エラーが発生します。

```sh
# 新しくバケットを作ろうとして失敗する
$ terraform apply
```

:::details エラーログ

```sh
Terraform used the selected providers to generate the following execution plan.
Resource actions are indicated with the following symbols:
  + create

Terraform will perform the following actions:

  # aws_s3_bucket.main["first"] will be created
  + resource "aws_s3_bucket" "main" {
      + bucket                      = "tf-import-for-each-example-1"
      # ...省略
    }

  # aws_s3_bucket.main["second"] will be created
  + resource "aws_s3_bucket" "main" {
      + bucket                      = "tf-import-for-each-example-2"
      # ...省略
    }

  # aws_s3_bucket.main["third"] will be created
  + resource "aws_s3_bucket" "main" {
      + bucket                      = "tf-import-for-each-example-3"
      # ...省略
    }

Plan: 3 to add, 0 to change, 0 to destroy.

Do you want to perform these actions?
  Terraform will perform the actions described above.
  Only 'yes' will be accepted to approve.

  Enter a value: yes

aws_s3_bucket.main["third"]: Creating...
aws_s3_bucket.main["second"]: Creating...
aws_s3_bucket.main["first"]: Creating...
╷
│ Error: creating S3 Bucket (tf-import-for-each-example-2): BucketAlreadyExists
│
│   with aws_s3_bucket.main["second"],
│   on s3.tf line 9, in resource "aws_s3_bucket" "main":
│    9: resource "aws_s3_bucket" "main" {
│
╵
╷
│ Error: creating S3 Bucket (tf-import-for-each-example-1): BucketAlreadyExists
│
│   with aws_s3_bucket.main["first"],
│   on s3.tf line 9, in resource "aws_s3_bucket" "main":
│    9: resource "aws_s3_bucket" "main" {
│
╵
╷
│ Error: creating S3 Bucket (tf-import-for-each-example-3): BucketAlreadyExists
│
│   with aws_s3_bucket.main["third"],
│   on s3.tf line 9, in resource "aws_s3_bucket" "main":
│    9: resource "aws_s3_bucket" "main" {
│
╵
```

:::

## `import` ブロックを記述

`import` ブロックを追記し、 `for_each` に `local.buckets` を指定します。

```tf diff:s3.tf
 locals {
   buckets = {
     "first"  = "tf-import-for-each-example-1"
     "second" = "tf-import-for-each-example-2"
     "third"  = "tf-import-for-each-example-3"
   }
 }

 resource "aws_s3_bucket" "main" {
   for_each = local.buckets
   bucket   = each.value
 }

+import {
+  for_each = local.buckets # resource の for_each で指定しているものと同じものを指定する
+  to       = aws_s3_bucket.main[each.key]
+  id       = each.value
+}
```

## インポートを実行

それでは `terraform apply` を実行してリソースをインポートします。

```sh
$ terraform apply
# ...省略

Terraform will perform the following actions:

  # aws_s3_bucket.main["first"] will be imported
    resource "aws_s3_bucket" "main" {
        bucket                      = "tf-import-for-each-example-1"
        # ...省略
    }

  # aws_s3_bucket.main["second"] will be imported
    resource "aws_s3_bucket" "main" {
        bucket                      = "tf-import-for-each-example-2"
        # ...省略
    }

  # aws_s3_bucket.main["third"] will be imported
    resource "aws_s3_bucket" "main" {
        bucket                      = "tf-import-for-each-example-3"
        # ...省略
    }

Plan: 3 to import, 0 to add, 0 to change, 0 to destroy.

Do you want to perform these actions?
  Terraform will perform the actions described above.
  Only 'yes' will be accepted to approve.

  Enter a value: yes

# ...省略

Apply complete! Resources: 3 imported, 0 added, 0 changed, 0 destroyed.
```

3 つのリソースがインポートされました。

```sh
$ terraform state list
aws_s3_bucket.main["first"]
aws_s3_bucket.main["second"]
aws_s3_bucket.main["third"]
```

素敵です！！！！！
この後はもう実行済みの `import` ブロックは削除して大丈夫です。

# 注意点

今のところ、 `for_each` を使用する場合はコード生成ができないようです。

```sh
$ terraform plan -generate-config-out=generated.tf
╷
│ Error: Cannot generate configuration
│
│   on import.tf line 11, in import:
│   11:   to       = aws_s3_bucket.main[each.key]
│
│ The given import block is not compatible with config generation. The
│ -generate-config-out option cannot be used with import blocks which use
│ for_each, or resources which use for_each or count.
```

# まとめ

捗りが止まらない！！！！！

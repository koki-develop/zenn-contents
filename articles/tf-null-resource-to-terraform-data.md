---
title: "Terraform v1.9 では null_resource を安全に terraform_data に置き換えることができる"
emoji: "🌱"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["terraform"]
publication_name: "terraform_jp"
published: true
published_at: 2024-06-24 18:00
---

`terraform_data` は Terraform v1.4 で追加されたリソースです。

https://developer.hashicorp.com/terraform/language/resources/terraform-data

`terraform_data` は `null_resource` を置き換えるものであり、さらに異なる用途にも使用できます。
また、 `null_resource` が [null Provider](https://registry.terraform.io/providers/hashicorp/null) のリソースであるのに対して、 `terraform_data` は組み込みのリソースであるため、 Provider をインストールせずに使用できるのもメリットです。

`terraform_data` について詳しくは以下の記事をご参照ください。

https://zenn.dev/kou_pg_0131/articles/tf-1_4-terraform-data

# `null_resource` を `terraform_data` に置き換える際の問題

既に `null_resource` を使用している箇所をそのまま `terraform_data` に置き換えると、 `local-exec` などの provisioner が再実行されてしまうという問題があります。

例えば次のコードは、 EC2 インスタンスが作成されたときに `null_resource` の provisioner を利用してローカルで `echo` コマンドを実行する例です。

```tf
# EC2 インスタンス
resource "aws_instance" "main" {
  # ...
}

resource "null_resource" "main" {
  # インスタンスの ID が変わった (インスタンスが作成or作り直しされた) ときにコマンドを実行する
  triggers = {
    instance_id = aws_instance.main.id
  }

  provisioner "local-exec" {
    # 実行するコマンド
    command = "echo hoge"
  }
}
```

```sh
$ terraform apply
# ...省略
null_resource.main: Creating...
# ↓ provisioner が実行される
null_resource.main: Provisioning with 'local-exec'...
null_resource.main (local-exec): Executing: ["/bin/sh" "-c" "echo hoge"]
null_resource.main (local-exec): hoge
null_resource.main: Creation complete after 0s [id=******************]
# ...省略
```

`null_resource` をそのまま `terraform_data` に置き換えてみます。

```tf diff
 # EC2 インスタンス
 resource "aws_instance" "main" {
   # ...
 }

-resource "null_resource" "main" {
+resource "terraform_data" "main" {
   # インスタンスの ID が変わった (インスタンスが作成or作り直しされた) ときにコマンドを実行する
-  triggers = {
+  triggers_replace = {
     instance_id = aws_instance.main.id
   }

   provisioner "local-exec" {
     # 実行するコマンド
     command = "echo hoge"
   }
 }
```

この状態で `terraform apply` を実行すると、 EC2 インスタンスは何も更新していないにも関わらず、新しく作成される `terraform_data` によって再度 provisioner が実行されてしまいます。

```sh
$ terraform apply
# ...省略
# `null_resource` が削除される
null_resource.main: Destroying... [id=*******************]
null_resource.main: Destruction complete after 0s
# `terraform_data` が作成される
terraform_data.main: Creating...
terraform_data.main: Provisioning with 'local-exec'...
# ↓ provisioner が実行される
terraform_data.main (local-exec): Executing: ["/bin/sh" "-c" "echo hoge"]
terraform_data.main (local-exec): hoge
terraform_data.main: Creation complete after 0s [id=********-****-****-****-************]
# ...省略
```

provisioner の内容が繰り返し実行されても大丈夫な内容であれば問題ありませんが、そうでない場合は困ります。

Terraform v1.9 ではこの問題が解消され、 `moved` ブロックを使って `null_resource` を `terraform_data` に安全に置き換えることができるようになります。

# 検証環境

- Terraform 1.9.0-rc3

# `moved` ブロックを使用して `null_resource` を `terraform_data` に安全に置き換える

先程の例を使って、今度は `moved` ブロックを使用して `null_resource` を `terraform_data` に置き換えてみます。

まずは置き換え前のコードです。

```tf
# EC2 インスタンス
resource "aws_instance" "main" {
  # ...
}

resource "null_resource" "main" {
  # インスタンスの ID が変わった (インスタンスが作成or作り直しされた) ときにコマンドを実行する
  triggers = {
    instance_id = aws_instance.main.id
  }

  provisioner "local-exec" {
    # 実行するコマンド
    command = "echo hoge"
  }
}
```

`null_resource` を `terraform_data` に置き換えます。
( ここまでは先ほどまでと同じ )

```tf diff
 # EC2 インスタンス
 resource "aws_instance" "main" {
   # ...
 }

-resource "null_resource" "main" {
+resource "terraform_data" "main" {
   # インスタンスの ID が変わった (インスタンスが作成or作り直しされた) ときにコマンドを実行する
-  triggers = {
+  triggers_replace = {
     instance_id = aws_instance.main.id
   }

   provisioner "local-exec" {
     # 実行するコマンド
     command = "echo hoge"
   }
 }
```

`moved` ブロックを追加します。

```tf diff
 # EC2 インスタンス
 resource "aws_instance" "main" {
   # ...
 }

 resource "terraform_data" "main" {
   # インスタンスの ID が変わった (インスタンスが作成or作り直しされた) ときにコマンドを実行する
   triggers_replace = {
     instance_id = aws_instance.main.id
   }

   provisioner "local-exec" {
     # 実行するコマンド
     command = "echo hoge"
   }
 }

+moved {
+  from = null_resource.main  # 置き換え元の `null_resource` の識別子
+  to   = terraform_data.main # 置き換え先の `terraform_data` の識別子
+}
```

`terraform apply` を実行してみます。

```sh
$ terraform apply
# ...省略
Terraform will perform the following actions:

  # null_resource.main has moved to terraform_data.main
    resource "terraform_data" "main" {
        id               = "*******************"
        # (1 unchanged attribute hidden)
    }

Plan: 0 to add, 0 to change, 0 to destroy.

# ...省略

Apply complete! Resources: 0 added, 0 changed, 0 destroyed.
```

> null_resource.main has moved to terraform_data.main

> Resources: 0 added, 0 changed, 0 destroyed.

provisioner が再実行されることなく、安全に `null_resource` が `terraform_data` に置き換えられたことが確認できます。

:::message

Terraform v1.8 以前の場合、異なるリソースタイプ間での `moved` ブロックの使用としてエラーが発生します。

```sh
$ terraform apply
╷
│ Error: Unsupported `moved` across resource types
│
│   on main.tf line 31:
│   31: moved {
│
│ The provider "terraform.io/builtin/terraform" does not support moved operations
│ across resource types and providers.
╵
```

:::

# まとめ

脱 null Provider が捗りますね。

# 参考

https://github.com/hashicorp/terraform/releases/tag/v1.9.0-beta1

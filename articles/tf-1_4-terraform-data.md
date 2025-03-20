---
title: "Terraform 1.4 で導入された terraform_data リソースの使い方"
emoji: "🎉"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["terraform", "iac", "hashicorp"]
published: true
---

Terraform 1.4 が GA になりました 🎉🎉🎉

https://www.hashicorp.com/blog/terraform-1-4-improves-the-cli-experience-for-terraform-cloud

Terraform 1.4 では新しく `terraform_data` リソースが導入されました。
`terraform_data` リソースは `null_resource` を置き換えるものであり、さらに異なる用途にも使用できます。

https://developer.hashicorp.com/terraform/language/resources/terraform-data

この記事では `terraform_data` リソースの使い方についてまとめます。

- [`null_resource` の代わりに使う](#null_resource-の代わりに使う)
- [`replace_triggered_by` に使用する](#replace_triggered_by-に使用する)

# サンプルコード

この記事で紹介するサンプルコードは以下のリポジトリで管理しています。

https://github.com/koki-develop/terraform-data-resource-example

# 検証環境

- Terraform v1.4.0

# 使い方

## `null_resource` の代わりに使う

前提知識として、 `null_resource` は何も作成しないリソースです。
[Provisioner](https://developer.hashicorp.com/terraform/language/resources/provisioners/syntax) と合わせて使用することで、他のリソースの状態変化をトリガーに任意のコマンドを実行するなどといった使い方ができます。

https://registry.terraform.io/providers/hashicorp/null/latest/docs/resources/resource

例えば次のコードは、 EC2 インスタンスが作成されたときにローカルで `echo` コマンドを実行する例です。

```tf
# EC2 インスタンス
resource "aws_instance" "main" {
  # ...
}

resource "null_resource" "main" {
  # インスタンスの ID が変わった ( インスタンスが作成or作り直しされた ) ときにコマンドを実行する例
  triggers = {
    instance_id = aws_instance.main.id
  }

  provisioner "local-exec" {
    # 実行するコマンド
    command = "echo null resource"
  }
}
```

先ほどの例を `terraform_data` リソースを使用するように書き換えると次のようになります。
`triggers_replace` が `null_resource` における `triggers` にあたるものになります ( `map` 型ではなく `list` 型になります ) 。

```tf
# EC2 インスタンス
resource "aws_instance" "main" {
  # ...
}

resource "terraform_data" "main" {
  # インスタンスの ID が変わった ( インスタンスが作成or作り直しされた ) ときにコマンドを実行する例
  triggers_replace = [
    aws_instance.main.id
  ]

  # 実行するコマンド
  provisioner "local-exec" {
    command = "echo terraform data"
  }
}
```

このように、 `terraform_data` リソースは `null_resource` と全く同じ用途で使用することができます。

`null_resource` が [null Provider](https://registry.terraform.io/providers/hashicorp/null) のリソースであるのに対して、 `terraform_data` リソースは組み込みのリソースです。
そのため、 Provider をインストールせずに使えるというのが嬉しいポイントです。

## `replace_triggered_by` に使用する

Terraform の lifecycle の設定のひとつに `replace_triggered_by` というものがあります。

https://developer.hashicorp.com/terraform/language/meta-arguments/lifecycle#replace_triggered_by

`replace_triggered_by` を設定すると、指定したリソースや属性に変化があったときに、リソースを replace ( 作り直し ) するように設定することができます。
次のコードは `second` EC2 インスタンスが作り直されたときに `main` EC2 インスタンスも作り直す例です。

```tf
resource "aws_instance" "second" {
  # ...
}

resource "aws_instance" "main" {
  # ...

  lifecycle {
    # `second` EC2 インスタンスが作り直されたときに一緒に作り直す
    replace_triggered_by = [
      aws_instance.second.id,
    ]
  }
}
```

この `replace_triggered_by` には「リソースへの参照もしくはリソースの属性しか指定できない」という制限があります。
つまり、単純な文字列や数値などの値を指定することはできません。
次のコードは `replace_triggered_by` に `revision` 変数 ( `number` 型 ) を指定していますが、これはエラーになってしまいます。

```tf
variable "revision" {
  default = 1
}

resource "aws_instance" "main" {
  # ...

  lifecycle {
    replace_triggered_by = [
      # Error: Invalid replace_triggered_by expression
      var.revision,
    ]
  }
}
```

とはいえ `replace_triggered_by` にリソースではなくシンプルな値を指定したいケースはあると思いますが、そんなときに `terraform_data` リソースが便利です。

次のコードは `revision` 変数の値が変化するたびに EC2 インスタンスを作り直す例です。
`revision` 変数の値を `terraform_data` リソースの `input` に指定して、 EC2 インスタンスの `replace_triggered_by` にはこの `terraform_data` リソースへの参照を指定します。
これで `revision` 変数が変化するたびに作り直すことができます。

```tf
variable "revision" {
  default = 1
}

resource "terraform_data" "replacement" {
  input = var.revision
}

resource "aws_instance" "main" {
  # ...

  lifecycle {
    # `var.revision` が変化するたびに作り直される
    replace_triggered_by = [
      terraform_data.replacement,
    ]
  }
}
```

# まとめ

便利！！
複数の使い方があるので混乱しないように気をつけたいですね。

# 参考

https://developer.hashicorp.com/terraform/language/resources/terraform-data
https://registry.terraform.io/providers/hashicorp/null/latest/docs/resources/resource

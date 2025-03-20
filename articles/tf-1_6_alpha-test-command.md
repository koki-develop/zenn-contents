---
title: "Terraform 1.6 で追加されそうな terraform test コマンドを試してみる"
emoji: "🧪"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["terraform"]
published: true
published_at: 2023-08-04 18:00
---

最近 Terraform 1.6 のアルファ版がリリースされています。

https://github.com/hashicorp/terraform/releases/tag/v1.6.0-alpha20230719
https://github.com/hashicorp/terraform/releases/tag/v1.6.0-alpha20230802

リリースノートを読んでみると `terraform test` なるコマンドが含まれているではありませんか！
これは試してみるっきゃないと思い、ちょっとだけ触ってみました。

:::message

この記事はあくまで v1.6.0-alpha20230802 時点での内容であり、今後仕様が大きく変更される可能性もあるので注意してください。

:::

# サンプルコード

今回紹介するサンプルコードは以下のリポジトリで管理しています。

https://github.com/koki-develop/terraform-test-example

# `terraform test` コマンドを試してみる

## シンプルなテスト

`terraform_data` リソースを使ってさっくりとシンプルなテストを書いてみます。
テストファイルの拡張子は `*.tftest.hcl` にする必要があります。

:::message

`terraform_data` リソースについては以下の記事をご参照ください。

- [Terraform 1.4 で導入された terraform_data リソースの使い方](https://zenn.dev/kou_pg_0131/articles/tf-1_4-terraform-data)

:::

```tf:main.tf
resource "terraform_data" "main" {
  input = "Hello, World!"
}
```

テストは `run` ブロックを使用してこんな感じで書けます。

```tf:main.tftest.hcl
run "simple test" {
  assert {
    condition = terraform_data.main.output == "Hello, World!" # テストする内容
    error_message = "error message" # 失敗したときのメッセージ
  }
}
```

それでは `terraform test` コマンドを実行してみます。

```sh:コンソール
$ terraform test
```

```:出力
main.tftest.hcl... pass
  run "simple test"... pass

Success! 1 passed, 0 failed.
```

おぉ〜。

テストが失敗したときの挙動も見てみます。
`main.tf` の内容を次のように書き換えます。

```tf diff:main.tf
 resource "terraform_data" "main" {
-  input = "Hello, World!"
+  input = "Goodbye, World!"
 }
```

再度 `terraform test` コマンドを実行してみます。

```sh:コンソール
$ terraform test
```

```:出力
main.tftest.hcl... fail
  run "simple test"... fail
╷
│ Error: Test assertion failed
│
│   on main.tftest.hcl line 3, in run "simple test":
│    3:     condition = terraform_data.main.output == "Hello, World!"
│     ├────────────────
│     │ terraform_data.main.output is "Goodbye, World!"
│
│ error message
╵

Failure! 0 passed, 1 failed.
```

おぉ〜。

## 変数を設定する

テストコード内で変数を設定するには `variables` ブロックを使用することができます。

例えば、次のように `message` 変数が定義されている Terraform コードをテストするとします。

```tf:main.tf
variable "message" {
  type = string
}

resource "terraform_data" "main" {
  input = var.message
}
```

テストコードでは次のように `variables` ブロックを使用することで `message` 変数を設定することができます。

```tf:main.tftest.hcl
variables {
  message = "Hello, World!" # message 変数の値を設定
}

run "variables test" {
  assert {
    condition = terraform_data.main.output == "Hello, World!"
    error_message = "error message"
  }
}
```

```sh:コンソール
$ terraform test
```

```:出力
main.tftest.hcl... pass
  run "variables test"... pass

Success! 1 passed, 0 failed.
```

おぉ〜。

ちなみに変数は他にも次のような方法で設定することも可能です。

- [`*.tfvars` ファイル](https://developer.hashicorp.com/terraform/language/values/variables#variable-definitions-tfvars-files)を使用する
- `terraform test` コマンド実行時に `-var` フラグで指定する

## テストファイル用のディレクトリを使用する

テストファイルをディレクトリにまとめることも可能です。
デフォルトは `tests` ディレクトリですが、 `-test-directory` フラグで任意のディレクトリ名を指定することも可能です。

例えば次のようなディレクトリ構造でテストファイルを配置することが可能です。

```
.
├── main.tf
└── tests
   └── main.tftest.hcl
```

```tf:main.tf
resource "terraform_data" "main" {
  input = "Hello, World!"
}
```

```tf:tests/main.tftest.hcl
run "nested test" {
  assert {
    condition = terraform_data.main.output == "Hello, World!"
    error_message = "error message"
  }
}
```

テストを実行してみます。

```:コンソール
$ terraform test
```

```出力
tests/main.tftest.hcl... pass
  run "nested test"... pass

Success! 1 passed, 0 failed.
```

おぉ〜。

# まとめ

[1.5 の HCL 生成](https://zenn.dev/kou_pg_0131/articles/tf-generate-config)に引き続き、 1.6 もアツいことになりそうですね〜〜〜〜〜〜〜〜〜
今回は本当にシンプルな使い方のみ紹介しましたが、下記の中身を見る限り他にも色々なことができるみたいです。

https://github.com/hashicorp/terraform/tree/v1.6.0-alpha20230802/internal/command/testdata/test

楽しみですね〜〜〜〜〜〜〜〜〜〜〜〜〜

---
title: "【JavaScript × Terraform】次世代のモダン AltJS「JS.tf」の紹介"
emoji: "⚡"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["terraform", "javascript"]
publication_name: "terraform_jp"
published: true
published_at: 2024-11-25 18:00
---

人類は HCL (HashiCorp Configuration Language) で JavaScript を記述するべきなので、次世代のモダン AltJS である「JS.tf」をリリースしました。

https://github.com/koki-develop/terraform-provider-js
https://registry.terraform.io/providers/koki-develop/js/latest/docs

例えば次のコードは標準出力に `hello world` と出力する JS.tf の**プログラム**です。

```hcl:example.tf
data "js_function_call" "hello_world" {
  caller   = "console"
  function = "log"
  args     = ["hello world"]
}

data "js_program" "main" {
  statements = [data.js_function_call.hello_world.statement]
}

# index.js としてファイル出力
resource "local_file" "main" {
  filename = "index.js"
  content  = data.js_program.main.content
}
```

`terraform apply` を実行するとこの HCL が JavaScript として**トランスパイル**されます。

```sh
$ terraform apply
# index.js が生成される
```

生成されるのは普通の JavaScript のコードなので、任意の JavaScript ランタイムで実行可能です。

```sh
$ node index.js
hello world
```

---

この記事では JS.tf の基本的な使い方やメリットについて紹介します。

- [基本的な使い方](#基本的な使い方)
- [JS.tf を使うメリット](#js.tf-を使うメリット)
- [まとめ](#まとめ)

:::message

HTML はこっち。

- [【HTML × Terraform】次世代のモダン HTML ビルダー「HTML.tf」の紹介](https://zenn.dev/terraform_jp/articles/htmltf-introduction)

:::

# 基本的な使い方

JS.tf の実体は Terraform プロバイダーです。使用するためには `required_providers` ブロックに `koki-develop/js` を追加する必要があります。

```hcl
terraform {
  required_providers {
    js = {
      source = "koki-develop/js"
      version = "0.11.0" # 任意のバージョン
    }
  }
}

provider "js" {}
```

この状態で `terraform init` を実行すると JS.tf がインストールされます。

```sh
$ terraform init
```

## `js_program`

JS.tf において最も重要な DataSource は [`js_program`](https://registry.terraform.io/providers/koki-develop/js/latest/docs/data-sources/program) DataSource です。
`js_program` DataSource はステートメントのリストを受け取り、最終的な JavaScript のコードを生成します。

```hcl
data "js_program" "main" {
  statements = [
    # ...
  ]
}
```

例として、次のプログラムを見てみましょう。

```hcl
# 定数定義
data "js_const" "example" {
  name  = "example"
  value = 1
}

# 関数呼び出し
data "js_function_call" "log_example" {
  caller   = "console"
  function = "log"
  args     = [data.js_const.example.id]
}

# プログラム
data "js_program" "main" {
  statements = [
    data.js_const.example.statement,
    data.js_function_call.log_example.statement,
  ]
}

# 出力
output "source" {
  value = data.js_program.main.content
}
```

順に内容を追っていきます。

まず最初に `js_const` DataSource を使用して `example` という定数を定義して 1 を代入しています。

```hcl
# 定数定義
data "js_const" "example" {
  name  = "example"
  value = 1
}
```

続いて `js_function_call` DataSource を使用して `console.log` 関数を呼び出しています。先ほど定義した `example` 定数を引数として渡しています。

```hcl
# 関数呼び出し
data "js_function_call" "log_example" {
  caller   = "console"
  function = "log"
  args     = [data.js_const.example.id]
}
```

最後にそれらの DataSource のステートメントを `js_program` DataSource に渡すことで、 JavaScript のコードを生成しています。生成された JavaScript のコードは `js_program` DataSource の `content` から取得できます。

```hcl
# プログラム
data "js_program" "main" {
  statements = [
    data.js_const.example.statement,
    data.js_function_call.log_example.statement,
  ]
}

# 出力
output "source" {
  value = data.js_program.main.content
}
```

これが JS.tf を使ってプログラムを記述する基本的な流れです。

上記の例では生成された JavaScript を `output` で出力していますが、他にも以下のような活用方法が考えられます。

- [`local_file`](https://registry.terraform.io/providers/hashicorp/local/latest/docs/resources/file) リソースを使用してファイルに出力する
- AWS プロバイダーの [`aws_lambda_function`](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/lambda_function) リソースと連携して Lambda 関数を作成する
  - 例: [`examples/others/aws_lambda/main.tf`](https://github.com/koki-develop/terraform-provider-js/blob/main/examples/others/aws_lambda/main.tf)

## 変数 / 定数の定義

変数 / 定数の定義には [`js_var`](https://registry.terraform.io/providers/koki-develop/js/latest/docs/data-sources/var), [`js_const`](https://registry.terraform.io/providers/koki-develop/js/latest/docs/data-sources/const), [`js_let`](https://registry.terraform.io/providers/koki-develop/js/latest/docs/data-sources/let) DataSource を使用します。

```hcl
data "js_var" "a" {
  name  = "a" # 変数名
  value = 1
}
# => var a = 1

data "js_const" "b" {
  name  = "b"
  value = "hoge"
}
# => const b = "hoge"

data "js_let" "c" {
  name  = "c"
  value = true
}
# => let c = true
```

変数 / 定数を参照するときは DataSource の `id` を使用します。

```hcl
data "js_const" "example" {
  name  = "example"
  value = 1
}

data "js_function_call" "log_example" {
  caller   = "console"
  function = "log"
  args     = [data.js_const.example.id] # `example` 定数を参照している
}
# => console.log(example)
```

## 演算

演算には [`js_operation`](https://registry.terraform.io/providers/koki-develop/js/latest/docs/data-sources/operation) DataSource を使用します。

```hcl
data "js_operation" "one_plus_one" {
  left     = 1
  operator = "+"
  right    = 1
}
# => 1 + 1
```

```hcl:定数を使用する例
data "js_const" "a" {
  name  = "a"
  value = 1
}

data "js_operation" "a_times_2" {
  left     = data.js_const.a.id
  operator = "*"
  right    = 2
}
# => a * 2
```

```hcl:代入なども可能
data "js_let" "a" {
  name  = "a"
  value = 1
}

data "js_operation" "a_times_2" {
  left     = data.js_let.a.id
  operator = "*="
  right    = 2
}
# => a *= 2
```

## 関数定義 / 関数呼び出し

[`js_function`](https://registry.terraform.io/providers/koki-develop/js/latest/docs/data-sources/function) DataSource で関数を定義することができます。
仮引数の定義には [`js_function_param`](https://registry.terraform.io/providers/koki-develop/js/latest/docs/data-sources/function_param) DataSource を使用し、戻り値を返す場合は [`js_return`](https://registry.terraform.io/providers/koki-develop/js/latest/docs/data-sources/return) DataSource を使用します。

```hcl
# `add` 関数を定義
data "js_function" "add" {
  name = "add"
  params = [
    data.js_function_param.a.id,
    data.js_function_param.b.id,
  ]
  body = [data.js_return.a_plus_b.statement]
}
# => function add(a, b) {
#      return a + b;
#    }

# 仮引数 `a` を定義
data "js_function_param" "a" {
  name = "a"
}

# 仮引数 `b` を定義
data "js_function_param" "b" {
  name = "b"
}

# a + b
data "js_operation" "a_plus_b" {
  left     = data.js_function_param.a.id
  operator = "+"
  right    = data.js_function_param.b.id
}

# return a + b
data "js_return" "a_plus_b" {
  value = data.js_operation.a_plus_b.expression
}
```

関数呼び出しには [`js_function_call`](https://registry.terraform.io/providers/koki-develop/js/latest/docs/data-sources/function_call) DataSource を使用します。
`caller` を指定することでメソッド呼び出しも可能です。

```hcl
# 先ほど定義した `add` 関数を呼び出す
data "js_function_call" "add" {
  function = data.js_function.add.id
  args     = [1, 2]
}
# => add(1, 2)
```

```hcl:メソッド呼び出しの例
data "js_const" "array" {
  name  = "array"
  value = [2, 1, 3]
}

data "js_function_call" "sort" {
  caller   = data.js_const.array.id
  function = "sort"
}
# => array.sort()
```

## その他

その他にも JS.tf では様々な DataSource が用意されています。

- [`js_for`](https://registry.terraform.io/providers/koki-develop/js/latest/docs/data-sources/for), [`js_while`](https://registry.terraform.io/providers/koki-develop/js/latest/docs/data-sources/while) : for 文 / while 文
- [`js_if`](https://registry.terraform.io/providers/koki-develop/js/latest/docs/data-sources/if) : if 文
- [`js_increment`](https://registry.terraform.io/providers/koki-develop/js/latest/docs/data-sources/increment), [`js_decrement`](https://registry.terraform.io/providers/koki-develop/js/latest/docs/data-sources/decrement) : インクリメント / デクリメント
- [`js_index`](https://registry.terraform.io/providers/koki-develop/js/latest/docs/data-sources/index) : 添字アクセス
- etc...

詳細については[公式ドキュメント](https://registry.terraform.io/providers/koki-develop/js/latest/docs)をご参照ください。

https://registry.terraform.io/providers/koki-develop/js/latest/docs

また、 [GitHub リポジトリ](https://github.com/koki-develop/terraform-provider-js)の [`examples/`](https://github.com/koki-develop/terraform-provider-js/tree/main/examples) ディレクトリにも様々なサンプルコードが置いてありますので、こちらも参考にしてください。

https://github.com/koki-develop/terraform-provider-js/tree/main/examples

# JS.tf を使うメリット

**なぜ JS.tf を使うべきなのか**、そのメリットについて考えてみます。

JS.tf ではプログラムを全て HCL で記述するため、単純なプログラムを書くだけでもコード量はどうしても多くなってしまいがちです。そのため、「書きやすさ」という点においては他のプログラミング言語と比べて劣っているかもしれません。

しかしプログラムというものは書いてる時間よりも**読む時間の方が圧倒的に多い**ものです。つまり、プログラムは「書きやすさ」よりも「**読みやすさ**」の方が**重要**と言ってしまっても決して過言ではありません。チーム開発などで他の人が書いたコードを読むことが多い場合、その重要性はさらに高まります。
その点において、 JS.tf は別に読みやすいということもなく、むしろ単純な処理の流れを追うだけでもソースコード上のあっちこっちに飛び回ることになるので非常に読みにくいです。

さらに、プログラムの「**型安全性**」という点においてはどうでしょうか？
例えば代表的な AltJS の 1 つである TypeScript は静的型付け言語であり、非常に多機能な型システムを活用して型安全性の高いプログラムを書くことが可能です。
それに対して JS.tf には独自の型システムなども一切ありません。なんなら JavaScript の構文チェックすらもできないので、素の JavaScript 以上にガバガバで安全性は非常に低いと言っていいでしょう。

ここまで聞けば、**もはや JS.tf を使わない理由は無いはずです**。

# まとめ

モダンとは？

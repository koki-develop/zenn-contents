---
title: "バックエンドもフロントエンドもインフラも Terraform でつくってみた"
emoji: "🌍"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["terraform", "javascript", "html"]
publication_name: "terraform_jp"
published: true
published_at: 2024-12-09 18:00
---

この記事は [terraform Advent Calendar 2024](https://qiita.com/advent-calendar/2024/terraform) の 9 日目の記事です。
Terraform だけでアプリケーションのバックエンド・フロントエンド・インフラをつくったので紹介します。

- [つくったもの](#つくったもの)
- [利用技術](#利用技術)
  - [バックエンド](#バックエンド)
  - [フロントエンド](#フロントエンド)
  - [インフラ](#インフラ)
- [まとめ](#まとめ)

# つくったもの

画像を表示するだけのサンプルアプリケーションです。

https://tftftf.gallery

![](/images/tftftf-introduction/demo.gif)
_[Gallery](https://tftftf.gallery)_

リポジトリはこちら。

https://github.com/koki-develop/gallery

![](/images/tftftf-introduction/language.png)
_使用言語_

# 利用技術

## バックエンド

バックエンドの実装には**次世代のモダン AltJS である [JS.tf](https://registry.terraform.io/providers/koki-develop/js/latest/docs)** を使用しています。

https://registry.terraform.io/providers/koki-develop/js/latest/docs

JS.tf を使うと HCL で JavaScript プログラムを記述することができます。

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

サンプルアプリケーションにおけるバックエンドのソースコードはこちらです。

https://github.com/koki-develop/gallery/tree/main/terraform/modules/backend

JS.tf についての詳細はこちらの記事をご参照ください。

https://zenn.dev/terraform_jp/articles/jstf-introduction

## フロントエンド

フロントエンドの実装には**次世代のモダン HTML ビルダーである [HTML.tf](https://registry.terraform.io/providers/koki-develop/html/latest/docs)** を使用しています。

https://registry.terraform.io/providers/koki-develop/html/latest/docs

HTML.tf を使うと HCL で HTML を記述することができます。

```hcl:example.tf
data "html_html" "main" {
  children = [data.html_body.main.html]
}

data "html_body" "main" {
  children = [
    data.html_h1.hello.html,
    data.html_a.example.html,
  ]
}

data "html_h1" "hello" {
  children = ["Hello, HTML.tf!"]
}

data "html_a" "example" {
  children = ["Click me!"]
  href     = "https://example.com"
}

# index.html としてファイル出力
resource "local_file" "main" {
  filename = "index.html"
  content  = data.html_html.main.html
}
```

サンプルアプリケーションにおけるフロントエンドのソースコードはこちらです。

https://github.com/koki-develop/gallery/tree/main/terraform/modules/frontend

HTML.tf についての詳細はこちらの記事をご参照ください。

https://zenn.dev/terraform_jp/articles/htmltf-introduction

## インフラ

普通に [AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs) を使って構築してます。
サンプルアプリケーションにおけるインフラのソースコードはこちらです。

https://github.com/koki-develop/gallery/tree/main/terraform/modules/infrastructure

# まとめ

❌ アプリケーションと同じ言語でインフラを構築する
⭕ **インフラと同じ言語でアプリケーションを実装する**

Terraform だけでアプリケーションがつくれる時代がきましたね。
二度とやりません ( めちゃくちゃ大変だった )。

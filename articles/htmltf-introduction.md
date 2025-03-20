---
title: "【HTML × Terraform】次世代のモダン HTML ビルダー「HTML.tf」の紹介"
emoji: "📜"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["terraform", "html"]
publication_name: "terraform_jp"
published: true
published_at: 2024-12-02 18:00
---

人類は HCL (Hashicorp Configuration Language) で HTML を記述するべきなので、次世代のモダン HTML ビルダーである「HTML.tf」をリリースしました。

https://github.com/koki-develop/terraform-provider-html
https://registry.terraform.io/providers/koki-develop/html/latest/docs

例えば次のコードはシンプルな HTML を生成する HTML.tf のコードです。

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

`terraform apply` を実行すると HTML が生成されます。

```sh
$ terraform apply
# index.html が生成される
```

![](/images/htmltf-introduction/demo.png)
_実際に生成された HTML_

---

この記事では HTML.tf の基本的な使い方やメリットについて紹介します。

- [基本的な使い方](#基本的な使い方)
- [HTML.tf を使うメリット](#html.tf-を使うメリット)
- [まとめ](#まとめ)

:::message

JavaScript はこっち。

- [【JavaScript × Terraform】次世代のモダン AltJS「JS.tf」の紹介](https://zenn.dev/terraform_jp/articles/jstf-introduction)

:::

# 基本的な使い方

HTML.tf の実体は Terraform プロバイダーです。使用するためには `required_providers` ブロックに `koki-develop/html` を追加する必要があります。

```hcl
terraform {
  required_providers {
    html = {
      source = "koki-develop/html"
      version = "0.3.0" # 任意のバージョン
    }
  }
}

provider "html" {}
```

この状態で `terraform init` を実行すると HTML.tf がインストールされます。

```sh
$ terraform init
```

## HTML を生成する

HTML.tf では `html_<要素名>` DataSource を使って HTML を生成します。

```hcl
data "html_<要素名>" "example" {
  # ...
}
```

生成された HTML は `html` 属性から取得できます。

```hcl
data "html_h1" "hello" {
  children = ["Hello, HTML.tf!"]
}

output "html" {
  value = data.html_h1.hello.html
}
# => <h1>Hello, HTML.tf!</h1>
```

## 子要素

子となる HTML 要素は `children` 属性に文字列として渡します。

```hcl
data "html_h1" "child" {
  children = ["Hello, HTML.tf!"]
}
# => <h1>Hello, HTML.tf!</h1>

data "html_div" "parent" {
  children = [data.html_h1.child.html]
}
# => <div><h1>Hello, HTML.tf!</h1></div>
```

## 属性

HTML 要素の属性も DataSource の属性として渡すことができます。

```hcl
data "html_img" "example" {
  src    = "https://example.com/image.png"
  width  = 100
}
# => <img src="https://example.com/image.png" width="100">

data "html_a" "example" {
  children = ["Click me!"]
  href     = "https://example.com"
  download = true
}
# => <a href="https://example.com" download>Click me!</a>
```

---

HTML.tf でサポートされている HTML 要素や属性については[公式ドキュメント](https://registry.terraform.io/providers/koki-develop/html/latest/docs)をご参照ください。

https://registry.terraform.io/providers/koki-develop/html/latest/docs

# HTML.tf を使うメリット

特にないです。

# まとめ

最近「一体なにを目指してるんですか？」と聞かれることが多いです。

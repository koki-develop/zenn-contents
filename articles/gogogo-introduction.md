---
title: "インフラもバックエンドもフロントエンドも Go で書いてみた"
emoji: "🦔"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["go", "gin", "vecty", "cdktf"]
published: true
---

先日 CDK for Terraform が GA になりました。

https://www.hashicorp.com/blog/cdk-for-terraform-now-generally-available

CDK for Terraform を使うことにより、 TypeScript や Go などといったプログラミング言語を使って Terraform エコシステムを利用したインフラの定義やプロビジョニングを行うことができます。

「Go でインフラが書ける」と聞き、ふと思ったことがこちらです。

@[tweet](https://twitter.com/koki_develop/status/1554430612483624962)

というわけで書きました。

(2022/10/27 追記) CI/CD も Go で書いた記事を公開しました。

https://zenn.dev/kou_pg_0131/articles/gogogo-cicd-introduction

# 作ったもの

![](/images/gogogo-introduction/screenshot.png)
*GoGoGo*

:::message alert

GoGoGo はサービスを終了しました 🐱

:::

https://github.com/koki-develop/gogogo

猫の画像をランダムで表示するサンプルアプリです。
主な利用技術について簡単に紹介します。

# 利用技術

## Go

https://go.dev/

説明不要ですね。
Google 様が作ったプログラミング言語です。

## Gin

https://gin-gonic.com/

Go の軽量な Web フレームワークです。
[公式の紹介](https://gin-gonic.com/docs/#what-is-gin)に「パフォーマンスは Martini の最大 40 倍です」と書かれているように、速さが売りのようです。

こんな感じでシンプルに小さく始められます。

```go:main.go
// 引用: https://github.com/gin-gonic/gin#quick-start
package main

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func main() {
	r := gin.Default()
	r.GET("/ping", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"message": "pong",
		})
	})
	r.Run() // listen and serve on 0.0.0.0:8080 (for windows "localhost:8080")
}
```

類似のフレームワークとしては [echo](https://echo.labstack.com/) や [Iris](https://www.iris-go.com/) などがあります。

## Vecty

https://github.com/hexops/vecty

Go + WebAssembly を使用してフロントエンドを構築することができるパッケージです。
「[Near-zero dependencies](https://github.com/hexops/vecty#near-zero-dependencies)」と謳っているように、標準ライブラリである [`reflect`](https://pkg.go.dev/reflect) と [`strings`](https://pkg.go.dev/strings) にしか依存しておらず、そのため生成されるバイナリファイルのサイズが小さくなっています。

:::message
[README](https://github.com/hexops/vecty#near-zero-dependencies) には「it only relies on `reflect` from the Go stdlib.」と書いてありますが、 [pkg.go.dev](https://pkg.go.dev/github.com/hexops/vecty?tab=imports) を見ればわかるように、正確には [`strings`](https://pkg.go.dev/strings) にも依存しています。
:::

類似のパッケージとしては [Vugu](https://github.com/vugu/vugu) があります。
「[Vecty vs. Vugu](https://github.com/hexops/vecty#vecty-vs-vugu)」で紹介されている[ツイート](https://twitter.com/JohanBrandhorst/status/1452393594283831297?s=20&t=rhGRfDzK8LjfnIH_5Gptkw)によると、「Vecty は React に近く、 Vugu は Vue.js に近い」とのことです。
個人的に React が好きなので今回は Vecty を採用してみました。

こんな感じで書けます。

```go:main.go
package main

import (
	"github.com/hexops/vecty"
	"github.com/hexops/vecty/elem"
)

type View struct {
	vecty.Core
}

func (c *View) Render() vecty.ComponentOrHTML {
	// <body>
	//   <h1>Title</h1>
	//   <p>hello world</p>
	// </body>
	return elem.Body(
		elem.Heading1(vecty.Text("Title")),
		elem.Paragraph(vecty.Text("hello world")),
	)
}

func main() {
	v := &View{}
	vecty.RenderBody(v)
}
```

これを WebAssembly にコンパイルしてブラウザ上で実行することでフロントエンドを構築することができます。

## CDK for Terraform

https://www.terraform.io/cdktf

使い慣れたプログラミング言語を使って Terraform エコシステムを利用したインフラの定義やプロビジョニングを行うことができます。
2022年08月12日現在、次の言語をサポートしています。

- TypeScript
- Python
- Java
- C#
- Go

CDK for Terraform は [cdktf-cli](https://www.npmjs.com/package/cdktf-cli) を使って開発を行います。

```sh
# go テンプレートでプロジェクトを作成する
$ cdktf init --template=go
```

例えば AWS で S3 バケットを作成する場合はこんな感じに書きます。

```go:main.go
package main

import (
	"github.com/aws/constructs-go/constructs/v10"
	"github.com/aws/jsii-runtime-go"
	"github.com/hashicorp/cdktf-provider-aws-go/aws/v9"
	"github.com/hashicorp/cdktf-provider-aws-go/aws/v9/s3"
	"github.com/hashicorp/terraform-cdk-go/cdktf"
)

func NewMyStack(scope constructs.Construct, id string) cdktf.TerraformStack {
	stack := cdktf.NewTerraformStack(scope, &id)

	// provider
	aws.NewAwsProvider(stack, jsii.String("AWS"), &aws.AwsProviderConfig{
		Region: jsii.String("us-east-1"),
	})

	// s3 バケットを作成
	b := s3.NewS3Bucket(stack, jsii.String("test-bucket"), &s3.S3BucketConfig{
		Bucket: jsii.String("test-bucket"),
	})
	// パブリックアクセスブロックを設定
	s3.NewS3BucketPublicAccessBlock(stack, jsii.String("test-bucket-public-access-block"), &s3.S3BucketPublicAccessBlockConfig{
		Bucket:                b.Bucket(),
		BlockPublicAcls:       jsii.Bool(true),
		BlockPublicPolicy:     jsii.Bool(true),
		IgnorePublicAcls:      jsii.Bool(true),
		RestrictPublicBuckets: jsii.Bool(true),
	})

	return stack
}

func main() {
	app := cdktf.NewApp(nil)

	NewMyStack(app, "example")

	app.Synth()
}
```

これで `cdktf plan` で差分を確認 ( = `terraform plan` ) したり、 `cdktf apply` でリソースを作成・更新・削除 ( = `terraform apply` ) したりできます。

また、ユニットテスト用のライブラリも公式から提供されており、これでインフラコードのテストを書くこともできるみたいです。

https://www.terraform.io/cdktf/test/unit-tests

# まとめ

結構面白かったです。

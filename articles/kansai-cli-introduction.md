---
title: "AI でテキストを関西弁に翻訳する「kansAI」の紹介 with Gemini"
emoji: "💭"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["gc24", "googlecloud", "gemini", "ai", "cli"]
published: true
published_at: 2024-02-26 18:00
---

唐突に「関西 + AI = **kansAI**」という名前を思いついてしまったので作らざるを得ませんでした。

[![](/images/kansai-cli-introduction/card.png)](https://github.com/koki-develop/kansai)

![](/images/kansai-cli-introduction/demo.gif)
_こういうの_

https://github.com/koki-develop/kansai

この記事では kansAI の使い方と、技術的な話についてまとめます。

- [kansAI の使い方](#kansai-の使い方)
	- [インストール](#インストール)
	- [使い方](#使い方)
- [技術的な話](#技術的な話)
	- [プログラムから Gemini を利用する](#プログラムから-gemini-を利用する)
	- [Go で Gemini API を使う](#go-で-gemini-api-を使う)
		- [モデルを初期化する](#モデルを初期化する)
		- [テキストを生成する](#テキストを生成する)
		- [画像を扱う](#画像を扱う)
		- [チャット形式で対話する](#チャット形式で対話する)
		- [さらに高度な使い方](#さらに高度な使い方)
- [まとめ](#まとめ)
- [参考](#参考)


# kansAI の使い方

## インストール

Homebrew を使用している場合は `brew install` でインストールできます。

```sh
$ brew install koki-develop/tap/kansai
```

もしくは `go install` でインストールすることもできます。

```sh
$ go install github.com/koki-develop/kansai@latest
```

## 使い方

### 1. Gemini API の API キーを取得

kansAI では内部的に Google の [Gemini API](https://ai.google.dev/) を使用しています。

https://ai.google.dev/

そのため、まずは Gemini API を使用するための API キーを取得する必要があります。

Google AI Studio の 「[Get API Key](https://makersuite.google.com/app/apikey)」 にアクセスします。

https://makersuite.google.com/app/apikey

`Create API Key` をクリックします。

![](/images/kansai-cli-introduction/to-create-api-key.png)

するとダイアログが表示されるので、今回は `Create API key in new project` をクリックして、新しいプロジェクトで API キーを作成します。
成功すると API キーが表示されるのでひかえておきます。

:::message

既存の Google Cloud プロジェクトで API キーを作成することも可能です。

:::

![](/images/kansai-cli-introduction/create-api-key.png)

### 2. 設定

`kansai` コマンドを `--configure` フラグを付けて実行すると、 kansAI で使用する Gemini の API キーを設定することができます。

```sh
$ kansai --configure
Enter your Gemini API key:
```

設定が完了すると `~/.kansai/api_key` に API キーが保存されます。

:::message

他にも API キーは次のような方法で設定することも可能です。

- `KANSAI_API_KEY` 環境変数に API キーを設定する
- `kansai` コマンド実行時に `--api-key` フラグに API キーを指定する

:::

### 3. 実行

ここまでくれば kansAI を使う準備は整っています。
あとは関西弁に変換したいテキストを標準入力から渡すだけです。

```sh
$ echo 'こんにちは。僕の名前は koki です。好きな食べ物はラーメンです。' | kansai
こんちゃ。おれ、名前はこうきっちゅうねん。好きなもんはラーメンやで。
```

![](/images/kansai-cli-introduction/demo.gif)

便利ですね。

# 技術的な話

## プログラムから Gemini を利用する

上述したように、 kansAI では Google の Gemini API を使用しています。
Gemini API を使えば、 Google が開発している生成 AI モデルである Gemini を API 経由で簡単に利用することができます。

様々な言語の SDK for Generative AI が公式から提供されており、これらを使えば簡単に Gemini API を利用することができます。

- [Python](https://ai.google.dev/tutorials/python_quickstart)
- [Go](https://ai.google.dev/tutorials/go_quickstart)
- [Node.js](https://ai.google.dev/tutorials/node_quickstart)
- [Web](https://ai.google.dev/tutorials/web_quickstart)
- [Swift](https://ai.google.dev/tutorials/swift_quickstart)
- [Android](https://ai.google.dev/tutorials/android_quickstart)
- [Android ( オンデバイス )](https://ai.google.dev/tutorials/android_aicore)

また、 `curl` などの HTTP クライアントを使用して直接 REST API 経由で利用することも可能です。

- [REST API](https://ai.google.dev/tutorials/rest_quickstart)

ちなみに kansAI では Go SDK を利用しています。

## Go で Gemini API を使う

実際に公式の Go SDK を使って Gemini API を使う方法を紹介します。

### モデルを初期化する

まずは使用するモデルを初期化する必要があります。

```go
package main

import (
	"context"

	"github.com/google/generative-ai-go/genai"
	"google.golang.org/api/option"
)

func main() {
	// Gemini API の API キー
	apiKey := "YOUR_API_KEY"

	// クライアントを初期化
	ctx := context.Background()
	client, err := genai.NewClient(ctx, option.WithAPIKey(apiKey))
	if err != nil {
		panic(err)
	}
	defer client.Close()

	// モデルを初期化
	model := client.GenerativeModel("gemini-pro")

	// ...モデルを使用した操作
}
```

まずは `genai.NewClient` でクライアントを初期化します。
API キーはここで渡します。

```go
client, err := genai.NewClient(ctx, option.WithAPIKey(apiKey))
if err != nil {
	// ...エラー処理
}
defer client.Close()
```

初期化したクライアントの `GenerativeModel` メソッドでモデルを初期化することができます。
引数には使用するモデルの名前を指定します。

```go
model := client.GenerativeModel("MODEL_NAME")
```

例えば Gemini Pro を使いたい場合は `"gemini-pro"` を指定します。

```go
model := client.GenerativeModel("gemini-pro")
```

:::message

kansAI では Gemini Pro を使用しています。

:::

使用できるモデルの一覧については公式ドキュメントをご参照ください。

https://ai.google.dev/models/gemini?hl=ja

ここで初期化したモデルを使って様々な操作を行うことができます。

### テキストを生成する

まずはシンプルにプロンプトを送信してテキストを生成するサンプルコードを紹介します。

```go
func main() {
	// ...省略

	model := client.GenerativeModel("gemini-pro")

	resp, err := model.GenerateContent(ctx, genai.Text("カレーライスとはなんですか？簡潔に説明してください。"))
	if err != nil {
		panic(err)
	}

	for _, c := range resp.Candidates {
		for _, p := range c.Content.Parts {
			fmt.Print(p)
		}
	}
}
```

```:出力
ごはんの上にカレーをかけて食べる料理です
```

:::details ソースコード全文

```go
package main

import (
	"context"
	"fmt"

	"github.com/google/generative-ai-go/genai"
	"google.golang.org/api/option"
)

func main() {
	apiKey := "YOUR_API_KEY"

	ctx := context.Background()
	client, err := genai.NewClient(ctx, option.WithAPIKey(apiKey))
	if err != nil {
		panic(err)
	}
	defer client.Close()

	model := client.GenerativeModel("gemini-pro")

	resp, err := model.GenerateContent(ctx, genai.Text("カレーライスとはなんですか？簡潔に説明してください。"))
	if err != nil {
		panic(err)
	}

	for _, c := range resp.Candidates {
		for _, p := range c.Content.Parts {
			fmt.Print(p)
		}
	}
}
```

:::

初期化したモデルの `GenerateContent` メソッドでテキストを生成することができます。

```go
resp, err := model.GenerateContent(ctx, genai.Text("カレーライスとはなんですか？簡潔に説明してください。"))
if err != nil {
	// ...エラー処理
}
```

生成されたテキストはレスポンスの `Candidates` から取得できます。

```go
for _, c := range resp.Candidates {
	for _, p := range c.Content.Parts {
		fmt.Print(p)
	}
}
```

#### ストリーミングを使用する

`GenerateContent` メソッドはテキスト生成が全て最後まで完了してからレスポンスを返します。
`GenerateContentStream` メソッドを使うと、生成されたテキストをストリーミングを使用してリアルタイムで取得することができます。

```go
// 戻り値はイテレータ
iter := model.GenerateContentStream(ctx, genai.Text("カレーライスとはなんですか？簡潔に説明してください。"))
for {
	resp, err := iter.Next()
	if err == iterator.Done {
		// 最後まで取得したらループを抜ける
		break
	}
	if err != nil {
		panic(err)
	}

	// レスポンスの扱いは変わらない
	for _, c := range resp.Candidates {
		for _, p := range c.Content.Parts {
			fmt.Print(p)
		}
	}
}
```

:::details ソースコード全文

```go
package main

import (
	"context"
	"fmt"

	"github.com/google/generative-ai-go/genai"
	"google.golang.org/api/iterator"
	"google.golang.org/api/option"
)

func main() {
	apiKey := "YOUR_API_KEY"

	ctx := context.Background()
	client, err := genai.NewClient(ctx, option.WithAPIKey(apiKey))
	if err != nil {
		panic(err)
	}
	defer client.Close()

	model := client.GenerativeModel("gemini-pro")

	iter := model.GenerateContentStream(ctx, genai.Text("カレーライスとはなんですか？簡潔に説明してください。"))
	for {
		resp, err := iter.Next()
		if err == iterator.Done {
			break
		}
		if err != nil {
			panic(err)
		}

		for _, c := range resp.Candidates {
			for _, p := range c.Content.Parts {
				fmt.Print(p)
			}
		}
	}
}
```

:::

### 画像を扱う

画像を扱うこともできます。
今回は次の画像について Gemini に説明させてみます。

![](/images/kansai-cli-introduction/hiyoko.jpg =250x)
_image.jpg_

```go
func main() {
	// ...省略

	model := client.GenerativeModel("gemini-pro-vision")

	img, err := os.ReadFile("./image.jpg")
	if err != nil {
		panic(err)
	}

	resp, err := model.GenerateContent(
		ctx,
		genai.ImageData("jpeg", img),
		genai.Text("この画像について説明してください。"),
	)
	if err != nil {
		panic(err)
	}

	for _, c := range resp.Candidates {
		for _, p := range c.Content.Parts {
			fmt.Print(p)
		}
	}
}
```

```:出力
これは眼鏡をかけた黄色いひよこのイラストです。
```

:::details ソースコード全文

```go
package main

import (
	"context"
	"fmt"
	"os"

	"github.com/google/generative-ai-go/genai"
	"google.golang.org/api/option"
)

func main() {
	apiKey := "YOUR_API_KEY"

	ctx := context.Background()
	client, err := genai.NewClient(ctx, option.WithAPIKey(apiKey))
	if err != nil {
		panic(err)
	}
	defer client.Close()

	model := client.GenerativeModel("gemini-pro-vision")

	img, err := os.ReadFile("./image.jpg")
	if err != nil {
		panic(err)
	}

	resp, err := model.GenerateContent(
		ctx,
		genai.ImageData("jpeg", img),
		genai.Text("この画像について説明してください。"),
	)
	if err != nil {
		panic(err)
	}

	for _, c := range resp.Candidates {
		for _, p := range c.Content.Parts {
			fmt.Print(p)
		}
	}
}
```

:::

まずモデルの初期化部分ですが、画像を扱う場合は `gemini-pro-vision` モデルを指定する必要があります。

```go
model := client.GenerativeModel("gemini-pro-vision")
```

続いて画像データを読み込みます。
今回はローカルにある画像を読み込むので `os.ReadFile` を使用します。

```go
// img は []byte 型
img, err := os.ReadFile("./image.jpg")
if err != nil {
	// ...エラー処理
}
```

最後の `GenerateContent` メソッドの引数に `genai.ImageData` を使用して画像データを渡します。

```go
resp, err := model.GenerateContent(
	ctx,
	genai.ImageData("jpeg", img), // 画像データを一緒に渡す
	genai.Text("この画像について説明してください。"),
)
if err != nil {
	// ...エラー処理
}
```

レスポンスの扱いはテキスト生成の場合と同じです。
同様に `GenerateContentStream` メソッドを使ってストリーミングを使用することも可能です。

### チャット形式で対話する

チャット形式で対話するための機能も提供されています。

```go
func main() {
	// ...省略

	model := client.GenerativeModel("gemini-pro")

	cs := model.StartChat()
	cs.History = []*genai.Content{
		{
			Role:  "user",
			Parts: []genai.Part{genai.Text("カレーライスとはなんですか？簡潔に説明してください。")},
		},
		{
			Role:  "model",
			Parts: []genai.Part{genai.Text("ごはんの上にカレーをかけて食べる料理です")},
		},
	}

	resp, err := cs.SendMessage(ctx, genai.Text("それはとても美味しそうですね！"))
	if err != nil {
		panic(err)
	}
	for _, c := range resp.Candidates {
		for _, p := range c.Content.Parts {
			fmt.Print(p)
		}
	}
}
```

```:出力
カレーライスは確かに美味しい料理ですよ！スパイシーでコクのあるルーが、ご飯によく合います。また、具材もさまざまなので、自分好みのカレーライスを作ることができます。
```

:::details ソースコード全文

```go
package main

import (
	"context"
	"fmt"

	"github.com/google/generative-ai-go/genai"
	"google.golang.org/api/option"
)

func main() {
	apiKey := "YOUR_API_KEY"

	ctx := context.Background()
	client, err := genai.NewClient(ctx, option.WithAPIKey(apiKey))
	if err != nil {
		panic(err)
	}
	defer client.Close()

	model := client.GenerativeModel("gemini-pro")

	cs := model.StartChat()
	cs.History = []*genai.Content{
		{
			Role:  "user",
			Parts: []genai.Part{genai.Text("カレーライスとはなんですか？簡潔に説明してください。")},
		},
		{
			Role:  "model",
			Parts: []genai.Part{genai.Text("ごはんの上にカレーをかけて食べる料理です")},
		},
	}

	resp, err := cs.SendMessage(ctx, genai.Text("それはとても美味しそうですね！"))
	if err != nil {
		panic(err)
	}
	for _, c := range resp.Candidates {
		for _, p := range c.Content.Parts {
			fmt.Print(p)
		}
	}
}
```

:::

まず初期化したモデルの `StartChat` メソッドでチャットを開始します。

```go
cs := model.StartChat()
```

必要に応じて自分で `History` に会話の履歴を設定することもできます。

```go
// 任意
cs.History = []*genai.Content{
	{
		Role:  "user", // ユーザーの発言
		Parts: []genai.Part{genai.Text("カレーライスとはなんですか？簡潔に説明してください。")},
	},
	{
		Role:  "model", // モデルの発言
		Parts: []genai.Part{genai.Text("ごはんの上にカレーをかけて食べる料理です")},
	},
}
```

チャットの `SendMessage` メソッドでメッセージを送信することができます。
使い方は `GenerateContent` メソッドと同じです。

```go
resp, err := cs.SendMessage(ctx, genai.Text("それはとても美味しそうですね！"))
if err != nil {
	// ...エラー処理
}
```

また、 `SendMessageStream` メソッドを使ってストリーミングを使用することも可能です。
こちらも使い方は `GenerateContentStream` と同じです。

```go
iter := cs.SendMessageStream(ctx, genai.Text("それはとても美味しそうですね！"))
for {
	// イテレータの扱いも `GenerateContentStream` と同じ
	resp, err := iter.Next()
	// ...省略
}
```

会話履歴は自動的にチャットセッションに保持されるため、自分で履歴を管理する必要はありません。
ユーザーからの入力を受け取る処理を追加すれば、簡易的なチャットボットをサクッと作れます。

### さらに高度な使い方

ここでは詳細は省略しますが、他にも色々と高度な使い方が可能です。

- [エンベディングを使用する](https://ai.google.dev/tutorials/go_quickstart?hl=ja#embeddings)
- [トークンをカウントする](https://ai.google.dev/tutorials/go_quickstart?hl=ja#count-tokens)
- [コンテンツ生成を制御するオプション](https://ai.google.dev/tutorials/go_quickstart?hl=ja#control-content-generation)

詳しくは公式ドキュメントをご参照ください。

- [高度なユースケースを実装する](https://ai.google.dev/tutorials/go_quickstart?hl=ja#implement-advanced-use-cases)

# まとめ

G𓏸𓏸gle「次世代の高性能 AI モデル発表！」
𓏸penAI「AI で動画生成！」
世の中「AI の進歩がすごい！」

ぼく「AI に関西弁変換させてみた！」ｷｬｯｷｬｯ

# 参考

https://ai.google.dev/tutorials

---
title: "【Go】slack-go を使用して Slack にメッセージを投稿する"
emoji: "🔖"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["go", "slack"]
published: true
---

Slack が公開しているパッケージを見つけて試してみたところ、結構使いやすくて便利だったのでメモ。

https://github.com/slack-go/slack

# 準備

## アプリを作成

以下の記事を参考にアプリを作成 ~ アクセストークンを発行 ~ アプリをチャンネルに追加するところまで実施する。

https://zenn.dev/kou_pg_0131/articles/slack-api-post-message

## slack-go をインストール

```
$ go get -u github.com/slack-go/slack
```

# サンプルコード

メッセージ投稿には [`*Client.PostMessage()`](https://pkg.go.dev/github.com/slack-go/slack#Client.PostMessage) を使用する。

## シンプルなテキストメッセージを投稿する

```go
package main

import (
	"github.com/slack-go/slack"
)

func main() {
	// アクセストークンを使用してクライアントを生成する
	tkn := "xoxb-xxxxxxxxxxxx-xxxxxxxxxxxxx-xxxxxxxxxxxxxxxxxxxxxxxx"
	c := slack.New(tkn)

	// MsgOptionText() の第二引数に true を設定すると特殊文字をエスケープする
	_, _, err := c.PostMessage("#チャンネル名", slack.MsgOptionText("Hello World", true))
	if err != nil {
		panic(err)
	}
}
```

![](https://storage.googleapis.com/zenn-user-upload/fhp5k9xjgttlrt40pjgqwttb52cr)

## Block Kit を使用してメッセージを投稿する

```go
package main

import (
	"github.com/slack-go/slack"
)

func main() {
	// アクセストークンを使用してクライアントを生成する
	tkn := "xoxb-xxxxxxxxxxxx-xxxxxxxxxxxxx-xxxxxxxxxxxxxxxxxxxxxxxx"
	c := slack.New(tkn)

	_, _, err := c.PostMessage("#チャンネル名", slack.MsgOptionBlocks(
		slack.NewSectionBlock(
			// テキスト
			&slack.TextBlockObject{Type: "mrkdwn", Text: "*Hello World*"},
			// フィールド
			[]*slack.TextBlockObject{
				{Type: "plain_text", Text: "Field1"},
				{Type: "plain_text", Text: "Field2"},
				{Type: "plain_text", Text: "Field3"},
			},
			// アクセサリ
			slack.NewAccessory(
				slack.NewImageBlockElement("https://s3-media2.fl.yelpcdn.com/bphoto/korel-1YjNtFtJlMTaC26A/o.jpg", "alt text for image"),
			),
		),
	))
}
```

![](https://storage.googleapis.com/zenn-user-upload/iti5ukxbjnp8sepjoc8o6erh9omv)

## Block Kit を使用して複雑なメッセージを投稿する

[Block Kit Builder](https://app.slack.com/block-kit-builder) のサンプルコードを参考に、画像やらボタンやら色々ついてるメッセージを投稿してみる。

slack-go ではそれぞれの要素を生成するための `New...()` が豊富に用意されている。
とはいえ内部的に特に難しいことをしてるわけでもなく、大抵の構造体は非常にシンプルな内容なので、状況に応じて構造体を直接使ったほうが見やすい場合はそうした方がいい。

```go
package main

import (
	"github.com/slack-go/slack"
)

func main() {
	// アクセストークンを使用してクライアントを生成する
	tkn := "xoxb-xxxxxxxxxxxx-xxxxxxxxxxxxx-xxxxxxxxxxxxxxxxxxxxxxxx"
	c := slack.New(tkn)

	_, _, err := c.PostMessage("#チャンネル名", slack.MsgOptionBlocks(
		// テキストのみのセクションブロック
		&slack.SectionBlock{
			Type: slack.MBTSection,
			Text: &slack.TextBlockObject{
				Type: "mrkdwn",
				Text: "Hello, Assistant to the Regional Manager Dwight! *Michael Scott* wants to know where you'd like to take the Paper Company investors to dinner tonight.\n\n *Please select a restaurant:*",
			},
		},

		// 区切り線
		slack.NewDividerBlock(),

		// アクセサリつきのセクションブロック
		&slack.SectionBlock{
			Type: slack.MBTSection,
			Text: &slack.TextBlockObject{
				Type: "mrkdwn",
				Text: "*Farmhouse Thai Cuisine*\n:star::star::star::star: 1528 reviews\n They do have some vegan options, like the roti and curry, plus they have a ton of salad stuff and noodles can be ordered without meat!! They have something for everyone here",
			},
			Accessory: slack.NewAccessory(
				slack.NewImageBlockElement("https://s3-media2.fl.yelpcdn.com/bphoto/korel-1YjNtFtJlMTaC26A/o.jpg", "alt text for image"),
			),
		},

		// ボタン
		&slack.ActionBlock{
			Type: slack.MBTAction,
			Elements: &slack.BlockElements{
				ElementSet: []slack.BlockElement{
					&slack.ButtonBlockElement{
						Type:  slack.METButton,
						Text:  &slack.TextBlockObject{Type: "plain_text", Text: "Kin Khao", Emoji: true},
						Value: "click_me_123",
						URL:   "https://google.com",
					},
				},
			},
		},
	))
	if err != nil {
		panic(err)
	}
}
```

![](https://storage.googleapis.com/zenn-user-upload/ctd40m8obpmemugmvrwhju4glwzx)

# まとめ

シンプルで直感的なインタフェースでとても使いやすい。
また、公式が様々なサンプルコードを用意しており、使い方について困った際にはこちらを参照するとよさそう。

[github.com/slack-go/slack/examples](https://github.com/slack-go/slack/tree/master/examples)

# 参考

https://pkg.go.dev/github.com/slack-go/slack
https://github.com/slack-go/slack

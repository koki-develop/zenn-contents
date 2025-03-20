---
title: "LINE Messaging API を使用して Bot からメッセージを送信する"
emoji: "💬"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["line", "api"]
published: true
published_at: 2023-09-11 18:00
---

LINE Developers コンソールからプロバイダー・チャネルを作成 ~ Bot からメッセージを送信するまでの手順のメモ。

# 手順

## LINE Developers コンソールにログイン

次のページにアクセス。

https://developers.line.biz/console/

`LINEアカウントでログイン` をクリック。

![](/images/line-push-text-message/to-login-with-line-account.png)

メールアドレスとパスワードを入力して `ログイン` をクリック。

![](/images/line-push-text-message/login-with-line-account.png)

:::message

LINE Developers コンソールに初めてログインした場合、このまま開発者アカウントの作成画面に遷移します。
名前とメールアドレスを入力して開発者アカウントを作成してください。

- [開発者として登録する](https://developers.line.biz/ja/docs/messaging-api/getting-started/#step-two-register-as-developer)

:::

## プロバイダーを作成する

`新規プロバイダー作成` をクリックする。

![](/images/line-push-text-message/to-create-provider.png)

`プロバイダー名` に任意のプロバイダーの名前を入力し、 `作成` をクリックする。
これでプロバイダーが作成される。

![](/images/line-push-text-message/create-provider.png)

## チャネルを作成する

`Messaging API` をクリックする。

![](/images/line-push-text-message/to-create-channel.png)

それぞれ必須項目を入力する。
それ以外の項目は必要に応じて入力する。

:::message

各項目の詳細については下記ドキュメントを参照してください。

- [チャネルを作成する](https://developers.line.biz/ja/docs/messaging-api/getting-started/#step-four-create-channel)

:::

それぞれ入力できたら同意チェックボックスをチェックし、 `作成` をクリックする。

![](/images/line-push-text-message/create-channel.png)

確認ダイアログが表示されるため、 `OK` をクリックする。

![](/images/line-push-text-message/confirm-create-channel.png)

`情報利用に関する同意について` のダイアログが表示されるため、 `同意する` をクリックする。

![](/images/line-push-text-message/agree-create-channel.png)

これでチャネルが作成される。

![](/images/line-push-text-message/created-channel.png)

## ボットを友達に追加する

チャネルの詳細画面で `Messaging API設定` タブを選択する。
友だち追加用の QR コードが表示されるため、スマートフォン等から読み込んでボットを友達に追加する。

![](/images/line-push-text-message/to-add-friend.png)
![](/images/line-push-text-message/add-friend.png =300x)

## チャネルアクセストークンを準備する

LINE Messaging API で使用できるアクセストークンには次の 4 種類がある。

- チャネルアクセストークンv2.1 (推奨)
- ステートレスチャネルアクセストークン
- 短期のチャネルアクセストークン
- **長期のチャネルアクセストークン** ( 今回はこちらを使用 )

今回は一番手軽に発行できる「長期のチャネルアクセストークン」を使用する。

:::message

他のアクセストークンの発行方法については下記ドキュメントをご参照ください。

- [チャネルアクセストークンを準備する](https://developers.line.biz/ja/docs/messaging-api/building-bot/#issue-a-channel-access-token)

:::

チャネルの詳細画面で `Messaging API設定` タブを選択し、一番下の `チャネルアクセストークン` セクションにある `発行` をクリックする。

![](/images/line-push-text-message/issue-access-token.png)

これでチャネルアクセストークンが発行される。

:::message

このチャネルアクセストークンには有効期限がありません。
漏洩等しないように特に慎重に取り扱ってください。

:::

![](/images/line-push-text-message/issued-access-token.png)

## 自分のユーザー ID を確認する

自分にメッセージを送信する際に必要になるため、自分のユーザー ID を確認しておく。
チャネルの詳細画面で `チャネル基本設定` タブを選択する。
下の方に `あなたのユーザーID` というのがあるので、控えておく。

![](/images/line-push-text-message/get-user-id.png)

## メッセージを送信する

LINE Messaging API を使用してメッセージを送信するエンドポイントは下記。

```
POST https://api.line.me/v2/bot/message/push
```

:::message

必要なリクエストヘッダやパラメータ、その他細かい仕様については下記ドキュメントをご参照ください。

- [プッシュメッセージを送る - Messaging APIリファレンス | LINE Developers](https://developers.line.biz/ja/reference/messaging-api/#send-push-message)

:::

次のコマンドは `curl` を使用してメッセージを送信する例。

|||
| --- | --- |
| `<チャネルアクセストークン>` | 「[チャネルアクセストークンを準備する](#チャネルアクセストークンを準備する)」で発行したチャネルアクセストークン。 |
| `<ユーザーID>` | 「[自分のユーザー ID を確認する](#自分のユーザー-id-を確認する)」で確認した自分のユーザー ID 。 |

```sh:curl を使用する例
$ curl -i -X POST https://api.line.me/v2/bot/message/push \
    -H 'Content-Type: application/json' \
    -H 'Authorization: Bearer <チャネルアクセストークン>' \
    -d '{ "to": "<ユーザーID>", "messages": [{ "type": "text", "text": "Hello, world" }] }'
```

```:レスポンス
HTTP/2 200
x-xss-protection: 1; mode=block
x-line-request-id: ****
x-frame-options: DENY
x-content-type-options: nosniff
pragma: no-cache
expires: 0
date: Sat, 09 Sep 2023 06:19:01 GMT
content-type: application/json
content-length: 2
cache-control: no-cache, no-store, max-age=0, must-revalidate
server: legy

{}
```

メッセージを送信できました。

![](/images/line-push-text-message/sent-message.png =300x)

# プログラムから LINE Messaging API を使用する

Messaging API 対応の公式 SDK も公開されている。

- [github.com/line/line-bot-sdk-java](https://github.com/line/line-bot-sdk-java)
- [github.com/line/line-bot-sdk-php](https://github.com/line/line-bot-sdk-php)
- [github.com/line/line-bot-sdk-go](https://github.com/line/line-bot-sdk-go)
- [github.com/line/line-bot-sdk-perl](https://github.com/line/line-bot-sdk-perl)
- [github.com/line/line-bot-sdk-ruby](https://github.com/line/line-bot-sdk-ruby)
- [github.com/line/line-bot-sdk-python](https://github.com/line/line-bot-sdk-python)
- [github.com/line/line-bot-sdk-nodejs](https://github.com/line/line-bot-sdk-nodejs)

詳しくは下記ドキュメントを参照。

https://developers.line.biz/ja/docs/downloads/#official-sdks

# まとめ

よき！！

# 参考

- [Messaging API | LINE Developers](https://developers.line.biz/ja/docs/messaging-api/)
- [Messaging APIを始めよう | LINE Developers](https://developers.line.biz/ja/docs/messaging-api/getting-started/#step-five-confirm-channel)
- [ボットを作成する | LINE Developers](https://developers.line.biz/ja/docs/messaging-api/building-bot/)
- [ユーザーIDを取得する | LINE Developers](https://developers.line.biz/ja/docs/messaging-api/getting-user-ids/)
- [Messaging APIリファレンス | LINE Developers](https://developers.line.biz/ja/reference/messaging-api/)

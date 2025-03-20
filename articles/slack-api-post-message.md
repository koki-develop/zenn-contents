---
title: "Slack API を使用してメッセージを投稿する"
emoji: "🤖"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["slack"]
published: true
---

[Slack API](https://api.slack.com/) を使用してアプリを作成 ~ メッセージを投稿するまでの手順メモ。

# アプリを作成する

「[Slack API: Applications](https://api.slack.com/apps)」 にアクセス。
ワークスペースにログインしていない場合はする。

`Create New App` をクリック。

![](/images/slack-api-post-message/1.png)

`From scratch` をクリック。

![](/images/slack-api-post-message/2.png)

任意のアプリ名を入力、ワークスペースを選択し、 `Create App` をクリック。

![](/images/slack-api-post-message/3.png)

これでアプリが作成される。

# スコープを設定する

`OAuth & Permissions` をクリック。

![](/images/slack-api-post-message/4.png)

ページの中ほどに `Scopes` セクションがあり、ここでアプリにスコープを設定することができる。
ボットとして API を実行する際のスコープを設定する `Bot Token Scopes` と、ユーザーとして API を実行する際のスコープを設定する `User Token Scopes` がある。

![](/images/slack-api-post-message/5.png)

まず `Bot Token Scopes` を設定する。
`Add an OAuth Scope` をクリック。

![](/images/slack-api-post-message/6.png)

メッセージを投稿するには `chat:write` スコープが必要なので、追加する。

![](/images/slack-api-post-message/7.png)

`User Token Scope` も同様の手順で `chat:write` スコープを追加する。

![](/images/slack-api-post-message/8.png)

# アプリをワークスペースにインストールする

スコープを設定すると同じページの一番上のところで `Install to Workspace` ボタンが有効になっているので、クリックする。

![](/images/slack-api-post-message/9.png)

権限をリクエストされるので、 `許可する` をクリック。

![](/images/slack-api-post-message/10.png)

アプリのインストールに成功すると 2 つのトークンが生成される。

- `xoxp-` から始まる `User OAuth Token` ( ユーザーとして API を実行するためのトークン )
- `xoxb-` から始まる `Bot User OAuth Token` ( ボットとして API を実行するためのトークン )

![](/images/slack-api-post-message/11.png)

# アプリをチャンネルに追加する

:::message
ボットとして API を実行するために必要。ユーザーとして API を実行する際には不要。
:::

Slack でショートカットボタン -> `このチャンネルにアプリを追加する` の順にクリック。

![](/images/slack-api-post-message/12.png)

今回作成したアプリを探して `追加` をクリック。

![](/images/slack-api-post-message/13.png)

# メッセージを投稿する

以下のエンドポイントにリクエストを送信することでメッセージを投稿できる。

```
POST https://slack.com/api/chat.postMessage
```

今回使用するパラメータは以下。

| パラメータ名 | 説明 |
| :-: | --- |
| `token` | 「[アプリをワークスペースにインストールする](#アプリをワークスペースにインストールする)」手順で生成された OAuth Token 。 |
| `channel` | メッセージの投稿先。 |
| `text` | メッセージの本文。マークダウンを使用できる。 |

その他に指定できるパラメータについては[公式ドキュメント](https://api.slack.com/methods/chat.postMessage#args)を参照。

## `curl` を使用したサンプル

`Bot User OAuth Token` を使用してみる。

```
$ curl -X POST 'https://slack.com/api/chat.postMessage' \
-d 'token=xoxb-668814143316-2441900189495-E0TZsRkP18KjsKVNByhZwIIG' \
-d 'channel=#test_channel' \
-d 'text=*テキスト*'
```

![](/images/slack-api-post-message/14.png)

ボット ( アプリ ) としてメッセージを投稿できた。

`User OAuth Token` を使用してみる。

```
$ curl -X POST 'https://slack.com/api/chat.postMessage' \
-d 'token=xoxp-668814143316-669295648309-2441900184311-aaf3e4170e14c8df4976783e33599de0' \
-d 'channel=#test_channel' \
-d 'text=*テキスト*'
```

![](/images/slack-api-post-message/15.png)

ユーザーとしてメッセージを投稿できた。

# プログラムから Slack メッセージを投稿する

https://zenn.dev/kou_pg_0131/articles/go-slack-go-usage
https://zenn.dev/kou_pg_0131/articles/js-slack-web-api-usage

# 参考

https://api.slack.com/methods/chat.postMessage

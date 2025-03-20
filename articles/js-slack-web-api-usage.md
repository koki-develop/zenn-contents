---
title: "【Node.js】Slack API を使用してメッセージを投稿する"
emoji: "😊"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["javascript", "nodejs", "slack"]
published: true
---

[`@slack/web-api`](https://www.npmjs.com/package/@slack/web-api) を使用して Slack にメッセージを投稿するサンプルコード。

# 検証環境

- node v14.7.5
- @slack/web-api v6.4.0

# 準備

## アプリを作成

以下の記事を参考にアプリを作成 ~ アクセストークンを発行 ~ アプリをチャンネルに追加するところまで実施する。

https://zenn.dev/kou_pg_0131/articles/slack-api-post-message

## 必要なパッケージをインストール

[`@slack/web-api`](https://www.npmjs.com/package/@slack/web-api) をインストールする。

```
$ npm i @slack/web-api
```

# サンプルコード

```js:main.js
const { WebClient } = require('@slack/web-api');

(async () => {
  // OAuth トークン
  const token  = 'xoxb-xxxxxxxxxxxx-xxxxxxxxxxxxx-xxxxxxxxxxxxxxxxxxxxxxxx';
  // #チャンネル名 of @ユーザー名
  const channel = '#test_channel';
  // メッセージ
  const text = '*Hello World*';

  const client = new WebClient(token);
  const response = await client.chat.postMessage({ channel, text });

  // 投稿に成功すると `ok` フィールドに `true` が入る。
  console.log(response.ok);
  // => true
})();
```

実行してみる。

```
$ node main.js
```

メッセージを投稿できた。

![](/images/js-slack-web-api-usage/1.png)

# 参考

https://www.npmjs.com/package/@slack/web-api

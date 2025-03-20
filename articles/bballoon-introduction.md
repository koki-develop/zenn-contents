---
title: "Bluesky のフォロー/フォロワーを快適に管理するための Web サービス「BBalloon」をリリースしました"
emoji: "🦋"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["bluesky"]
published: true
published_at: 2024-03-18 18:00
---

Bluesky の API を使って何か作ってみたかったので作ってみました。

https://bballoon.social

- [BBalloon の機能](#bballoon-の機能)
  - [フォロー管理](#フォロー管理)
  - [フォロワー管理](#フォロワー管理)
  - [ブロック管理](#ブロック管理)
  - [ミュート管理](#ミュート管理)
  - [その他](#その他)
- [技術的な話](#技術的な話)
  - [フレームワーク](#フレームワーク)
  - [構成](#構成)
  - [API リクエスト](#api-リクエスト)
- [まとめ](#まとめ)

# BBalloon の機能

## フォロー管理

自分がフォローしているユーザーの一覧を表示できます。
また、片思いしているユーザーも一覧できます。

![](/images/bballoon-introduction/follows.png)

## フォロワー管理

自分をフォローしているユーザーの一覧を表示できます。
また、自分に片思いしているユーザーも一覧できます。

![](/images/bballoon-introduction/followers.png)

## ブロック管理

自分がブロックしているユーザーの一覧を表示できます。

![](/images/bballoon-introduction/blocks.png)

## ミュート管理

自分がミュートしているユーザーの一覧を表示できます。

![](/images/bballoon-introduction/mutes.png)

## その他

- **投稿への反応** : 自分の投稿をリポストもしくはいいねしたユーザーの一覧を表示できます。
- **ダウンロード** : フォローやフォロワーなどのリストを CSV もしくは JSON 形式でダウンロードできます。

# 技術的な話

## フレームワーク

Vite + React で実装しています。 SPA です。

https://ja.vitejs.dev/
https://ja.react.dev/

UI フレームワークには Mantine を使っています。

https://mantine.dev/

## 構成

SPA を S3 + CloudFront でホスティングしています。
Bluesky への API リクエストはクライアントから直接送信しています。

![](/images/bballoon-introduction/architecture.jpg =400x)

## API リクエスト

Bluesky への API リクエストには [@atproto/api](https://www.npmjs.com/package/@atproto/api) パッケージを使用しています。

https://www.npmjs.com/package/@atproto/api

ログイン処理や情報取得のほか、フォロー/フォロー解除といった操作なども全てこのパッケージを使用しています。
めちゃ便利です。

```ts:ユーザーをフォローするサンプル
import { BskyAgent } from "@atproto/api";

(async () => {
  // BskyAgent を初期化
  const agent = new BskyAgent({ service: "https://bsky.social" });
  // ログイン
  await agent.login({
    identifier: "<メールアドレス or ハンドル>",
    password: "<パスワード>",
  });
  // ユーザーをフォロー
  await agent.follow("<フォローするユーザーのdid>");
})();
```

# まとめ

Bluesky は非常に開発者フレンドリーで、ドキュメントが豊富且つ API もとても使いやすいですね。

https://docs.bsky.app/docs/category/http-reference

色々遊べて楽しいです。

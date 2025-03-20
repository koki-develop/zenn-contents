---
title: "Zenn や Qiita や AtCoder のバッジを生成できるサービスを公開しました"
emoji: "🌟"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["googlecloud", "nextjs", "zenn", "qiita", "atcoder"]
published: true
---

こういうのを生成できるやつです。

![badges](/images/badge-generator-introduction/badges.png)

ぜひ GitHub Profile とかに使ってください。
ちなみに AtCoder のバッジの色はレーティングによって変化します。

# 更新

- 2022/10/02 : バッジのラベルをカスタマイズできるようになりました。

# 作ったもの

https://badgen.org/

ユーザー名とスタイルを指定して好きなバッジを選んでコピーして使ってください。

![Badge Generator](/images/badge-generator-introduction/preview.gif)
_Badge Generator_

ソースコードはこちらです。

https://github.com/koki-develop/badge-generator

# 仕組み

Google Cloud Run 上で Next.js アプリケーションを動かしているだけのシンプルな構成です。
API は Next.js の API Routes を使用しており、リクエストを受け取ったときに Zenn や Qiita などからからデータを取得してバッジの SVG を生成して返すようにしています。
Zenn や Qiita などから取得したデータは一定期間 Firestore にキャッシュしています。

![Architecture](/images/badge-generator-introduction/architecture.png)

バッジの生成には [Shields.io](https://shields.io/) で使われている [badge-maker](https://www.npmjs.com/package/badge-maker) という npm パッケージを使っています。

https://www.npmjs.com/package/badge-maker
https://github.com/badges/shields/tree/master/badge-maker

こんな感じで使えます。

```js
// `badge-maker` は色々と機能が制限されている (ロゴが設定できないなど) ため、
// `badge-maker/lib/make-badge` を参照しています。
const makeBadge = require("badge-maker/lib/make-badge");

const svg = makeBadge({
  logo: "data:image/svg+xml;base64,...", // ロゴの Data URL
  label: "label", // ラベル
  labelColor: "#00ff00", // ラベルの背景色
  message: "message", // メッセージ
  color: "#ff0000", // メッセージの背景色
  style: "plastic", // スタイル
});

console.log(svg);
// => <svg xmlns="http://www.w3.org/2000/svg"...
```

# まとめ

「使ったよー」とか教えてくれたら泣いて喜びます。

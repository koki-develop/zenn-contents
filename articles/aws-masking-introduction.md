---
title: "AWS マネジメントコンソール上の秘匿情報を自動で隠す Chrome 拡張機能「AWS Masking」の紹介"
emoji: "🕶️"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["aws", "plasmo", "chrome", "chromeextension"]
published: true
published_at: 2024-04-01 18:00
---

AWS マネジメントコンソールでスクショ撮ったり画面共有したりする際に色々隠すの面倒なので、自動で隠してくれる Chrome 拡張機能を作りました。

![](/images/aws-masking/demo.gif)
_こういうの_

# AWS Masking とは

AWS Masking は AWS マネジメントコンソール上の秘匿情報を自動で隠す Chrome 拡張機能です。
Chrome Web Store からブラウザに追加するだけで有効になります。

https://chromewebstore.google.com/detail/aws-masking/nblpfncgdloilgeicnnlihegobmhjifb
https://github.com/koki-develop/aws-masking

サポートされている情報は以下の通りです。
これらの情報は AWS マネジメントコンソール上で自動的に隠されます。

- Account ID
- ARN
- Access Key ID
- Secret Access Key

こんな感じで自動でぼかしフィルターがかかります。

![](/images/aws-masking/demo.gif)
_うっかり人前でシークレットキーを表示しちゃっても大丈夫_

AWS Masking のアイコンをクリックすると設定用のポップアップが表示され、各情報のマスキングの有効/無効を切り替えることができます。

![](/images/aws-masking/popup.png =500x)
_ポップアップ_

- `Mask Inputs` : 秘匿情報が入力されている input を隠す
- `Mask ARNs` : ARN を隠す
- `Mask Account IDs` : Account ID を隠す
- `Mask Access Key IDs` : Access Key ID を隠す
- `Mask Secret Access Keys` : Secret Access Key を隠す

# 技術的な話

フレームワークには Plasmo を使用しています。

https://github.com/PlasmoHQ/plasmo

Plasmo はブラウザ拡張機能を開発するためのフレームワークです。
`pnpm create plasmo` を実行するだけですぐ React + TypeScript を使った開発を始められますし、 manifest のビルドとかも面倒見てくれるので非常に便利です。

Plasmo については以下の記事がとてもわかりやすいのでこちらをご参照ください。

https://zenn.dev/nado1001/articles/plasmo-browser-extension

# まとめ

これで画面共有も怖くない！

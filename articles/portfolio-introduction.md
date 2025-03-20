---
title: "Next.js + Mantine + GitHub Pages でポートフォリオサイトを作った"
emoji: "💻"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["nextjs", "mantine", "github", "ポートフォリオ"]
published: true
---

https://koki.me

以前から作ってはいたんですが最近 1 から作り直しました。
正直これといって特筆するようなことは何もないんですがせっかく作ったので紹介です。

# リポジトリ

https://github.com/koki-develop/koki-develop.github.io

# 作った理由

名刺代わりです。
自己紹介するときにスキルセットや成果物などを毎回話すのは~~面倒臭い~~手間なので、「URL ひとつ渡せば大体わかる」みたいなページが欲しかったというのが理由です。
そのようなニーズを満たすためのサービスは色々ありますが、せっかくなので自分で好きなようにカスタマイズできるものを作ろうかなと思った次第です。

あと自分の年齢とか経歴とか結構忘れるので、そういうときにパッと見て確認できるので便利です。

# 利用技術など

## フロントエンド

Next.js + TypeScript で実装しています。
ごく普通の Next.js アプリケーションです。

https://nextjs.org/

UI フレームワークには [Mantine](https://mantine.dev/) を採用しています。

https://mantine.dev/

普段は [Material UI](https://mui.com/) を使うことが多いのですが、以下の記事をきっかけに [Mantine](https://mantine.dev/) のことを知ってからずっと気になっていたので使ってみました。
とても良い感じでした。

https://qiita.com/yusuke_blog1026/items/c68c45790a977cbd0715

## ホスティング

Next.js の [Static HTML Export](https://nextjs.org/docs/advanced-features/static-html-export) でビルドしたファイルを GitHub Pages にデプロイしています。

https://nextjs.org/docs/advanced-features/static-html-export

デプロイには GitHub Actions 上で [GitHub Pages action](https://github.com/peaceiris/actions-gh-pages) を使用しています。

https://github.com/marketplace/actions/github-pages-action

GitHub Pages へのデプロイの方法としては [Custom GitHub Actions Workflow](https://docs.github.com/ja/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site#カスタム-github-actions-ワークフローによる公開) を使用するという選択肢もありますが、一度使ってみたらあっという間に GitHub Actions の Storage の容量を使い切ってしまったのでやめました。

https://docs.github.com/ja/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site#カスタム-github-actions-ワークフローによる公開

:::message

[Custom GitHub Actions Workflow](https://docs.github.com/ja/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site#カスタム-github-actions-ワークフローによる公開) は 2023 年 4 月 3 日現在ベータ版の機能です。

:::

# まとめ

さっくり作ってさっくり公開できたので便利。

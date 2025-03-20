---
title: "リッチなプログレスバー付きの sleep コマンド「slp」の紹介"
emoji: "💤"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["cli", "terminal", "golang"]
published: true
---

リッチなプログレスバー付きの `sleep` コマンドである [`slp`](https://github.com/koki-develop/slp) を作りました。

https://github.com/koki-develop/slp

![](/images/slp-introduction/demo.gif)
_こういうの_

この記事では [`slp`](https://github.com/koki-develop/slp) のインストール方法 ~ 使い方についてまとめます。

- [インストール](#インストール)
- [使い方](#使い方)
- [まとめ](#まとめ)

# インストール

Homebrew を使用している場合は `brew install` でインストールできます。

```sh
$ brew install koki-develop/tap/slp
```

もしくは、 [`slp`](https://github.com/koki-develop/slp) は Go で作られているため `go install` でインストールすることもできます。

```sh
$ go install github.com/koki-develop/slp@latest
```

# 使い方

## 基本的な使い方

引数にスリープする時間 ( 秒 ) を指定して実行するだけです。

```sh
$ slp [time]

# 例: 3 秒スリープする
$ slp 3
```

![](/images/slp-introduction/demo.gif)

## 色を変える

`--gradient` フラグに色をカンマ区切りで 2 つ渡すことでグラデーションの色を変えることができます。

```sh
$ slp [time] --gradient "<COLOR>,<COLOR>"

# 例: 黒 → 白のグラデーション
$ slp 3 --gradient "#000000,#ffffff"
```

![](/images/slp-introduction/gradient.gif)

単一の色にする場合は `--color` フラグに色を指定します。

```sh
$ slp [time] --color "<COLOR>"

# 例: 赤
$ slp 3 --color "#ff0000"
```

![](/images/slp-introduction/color.gif)

# まとめ

なんか最近ずっと CLI 作ってます。
羊バージョンはこちら。

https://zenn.dev/kou_pg_0131/articles/sheep-introduction

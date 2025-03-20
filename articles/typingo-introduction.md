---
title: "Go 製のタイピングゲーム「Typingo」を作った"
emoji: "⌨️"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["golang", "cli", "terminal", "typing", "game"]
published: true
---

Typing + Go = **Typingo** という語呂のいい名前が思いついてしまったので勢いで作りました。
これが俗に言う**命名駆動開発** ( **NDD: Name-Driven Development** ) です。

![](/images/typingo-introduction/demo.gif)

https://github.com/koki-develop/typingo

この記事では Typingo のインストール方法から遊び方、利用技術を簡単に紹介します。

- [インストール](#インストール)
- [遊び方](#遊び方)
- [利用技術](#利用技術)

# インストール

Homebrew を使用している場合は `brew install` を使用してインストールできます。

```sh
$ brew install koki-develop/tap/typingo
```

もしくは、 Typingo は Go で作られているため `go install` を使用してインストールすることもできます。

```sh
$ go install github.com/koki-develop/typingo@latest
```

# 遊び方

`typingo` コマンドをそのまま実行するだけでゲームを起動することができます。

```
$ typingo
```

`--num-texts` フラグにテキスト数を指定することもできます。

```sh
# デフォルトは 10
$ typingo --num-texts 20
```

デフォルトでは間違ったキーを入力するたびにビープ音が鳴ります。
ビープ音を無効にしたい場合は `--beep` フラグを `false` に設定します。

```sh
$ typingo --beep=false
```

# 利用技術

## フレームワーク / リリース

CLI フレームワークに [Cobra](https://github.com/spf13/cobra) 、 TUI フレームワークに [Bubble Tea](https://github.com/charmbracelet/bubbletea) 、 リリースの自動化に [GoReleaser](https://github.com/goreleaser/goreleaser) を使用しています。

https://github.com/spf13/cobra
https://github.com/charmbracelet/bubbletea
https://github.com/goreleaser/goreleaser

この辺りは以前簡単に紹介した記事を公開してるのでこちらをご参照ください。

https://zenn.dev/kou_pg_0131/articles/go-cli-packages
https://zenn.dev/kou_pg_0131/articles/goreleaser-usage

## テキストの生成

テキストの生成には [Gofakeit](https://github.com/brianvoe/gofakeit) を使用しています。

https://github.com/brianvoe/gofakeit

[Gofakeit](https://github.com/brianvoe/gofakeit) はランダムなデータを生成することができる Go パッケージです。
次のようなものを始めとする様々な種類のデータをサポートしています。

- 名前やメールアドレス、電話番号
- 単語や文章
- 食べ物の名前
- 時刻
- 数値
- エラー
- その他にもたくさん

詳しくは公式の README をご参照ください。

https://github.com/brianvoe/gofakeit#functions

# まとめ

CLI 開発楽しい。
他にも色々作ってます。

https://zenn.dev/kou_pg_0131/articles/clive-introduction
https://zenn.dev/kou_pg_0131/articles/gat-introduction
https://zenn.dev/kou_pg_0131/articles/docker-tags-cli-usage

---
title: "gum を使ってシェルスクリプトの表示をカッコよくする"
emoji: "🍬"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["cli", "gum", "terminal", "shell"]
published: true
published_at: 2022-09-17 20:00
---

Twitter で見かけて触ってみたらかなり良かったので備忘録。

https://github.com/charmbracelet/gum

# 検証環境

- gum v0.6.0

# インストール

Mac の場合は Homebrew を使ってインストールできます。

```sh
$ brew install gum
```

また、 Go で作られているため `go install` でインストールすることもできます。

```sh
$ go install github.com/charmbracelet/gum@latest
```

その他のインストール方法については公式の [README](https://github.com/charmbracelet/gum#installation) をご参照ください。

# 使い方

:::message
ここでは基本的な使い方しか紹介しませんが、様々なオプションを指定することで高度なカスタマイズが可能です。
詳しくは `gum <command> --help` で確認してください。
:::

:::message
ここで表示している GIF は [VHS](https://github.com/charmbracelet/vhs) を使用して作成しています。
詳しくは以下の記事をご参照ください。

- [VHS でターミナルを録画する](https://zenn.dev/kou_pg_0131/articles/vhs-introduction)
  :::

## `gum input` - 1 行の入力を受け取る

1 行のテキスト入力を受け取ります。
入力されたテキストは標準出力に出力されます。

![](/images/gum-introduction/input.gif)

## `gum write` - 複数行の入力を受け取る

複数行のテキスト入力を受け取ります。
`Ctrl+D` で入力を終了し、入力されたテキストは標準出力に出力されます。

![](/images/gum-introduction/write.gif)

## `gum filter` - リストからフィルタリングして選択する

リストから Fuzzy マッチングを使用したフィルタリングを行い対話的にアイテムを選択できます。
選択されたアイテムは標準出力に出力されます。
また、 `--limit` や `--no-limit` フラグを使用することで複数選択することも可能です。

![](/images/gum-introduction/filter.gif)

## `gum choose` - リストから選択する

リストからアイテムを対話的に選択できます。
選択されたアイテムは標準出力に出力されます。
また、 `--limit` や `--no-limit` フラグを使用することで複数選択することも可能です。

![](/images/gum-introduction/choose.gif)

## `gum confirm` - Yes/No を表示する

選択可能な Yes/No を表示します。
左右矢印キー ( もしくは `h`, `l` ) でカーソルを移動します。
`Yes` を選択した場合の終了コードは `0` になり、 `No` を選択した場合の終了コードは `1` になります。

![](/images/gum-introduction/confirm.gif)

## `gum spin` - コマンドの実行中にスピナーを表示する

`gum spin -- <コマンド>` のように実行し、コマンドが終了するまでスピナーを表示します。

![](/images/gum-introduction/spin.gif)

## `gum style` - テキストを装飾する

文字色や背景色、様々なスタイルや枠線などを指定してテキストを装飾して出力します。

![](/images/gum-introduction/style.gif)

## `gum join` - テキストを連結する

複数のテキストを縦もしくは横に連結して出力します。
`gum style` と一緒に使うことを想定しているようです。

![](/images/gum-introduction/join.gif)

## `gum format` - テンプレートを使用してテキストを装飾する

テンプレートを使用してテキストを装飾して出力します。
テンプレートは `--type` フラグで指定することができ、デフォルトではマークダウンが使用されます。

![](/images/gum-introduction/format.gif)

# 他のコマンドと組み合わせていい感じに実行する例

## git commit

`gum input` と `gum write` を使用して、対話的にコミットメッセージを入力するコマンド例。

```sh
$ git commit \
  -m "$(gum input --placeholder "Summary of this change")" \
  -m "$(gum write --placeholder "Details of changes (CTRL+D to finish)")"
```

![](/images/gum-introduction/git-commit.gif)

## ブランチを切り替える

`gum filter` を使用し、対話的にブランチを切り替えるコマンド例。

```sh
$ git branch | cut -c 3- | gum filter | xargs git switch
```

![](/images/gum-introduction/git-switch.gif)

## Docker イメージを削除する

ローカルの Docker イメージを対話的に複数選択して削除するコマンド例。

```sh
$ docker image ls \
  | sed -e '1d' \
  | awk '{printf("%s:%s\n", $1, $2)}' \
  | gum filter --no-limit \
  | xargs docker image rm
```

![](/images/gum-introduction/docker-image-rm.gif)

## 公式サンプル

様々な使用例がまとめられています。

https://github.com/charmbracelet/gum/tree/main/examples

# まとめ

シェルスクリプトの表示を簡単におしゃれにできてとっても良い感じです。
内部的には [bubbletea](https://github.com/charmbracelet/bubbletea) という Go 製の TUI フレームワークが使われているようです。

https://github.com/charmbracelet/bubbletea

また、 [gum](https://github.com/charmbracelet/gum)・[bubbletea](https://github.com/charmbracelet/gum) を開発している Charm は他にも様々なツールやライブラリを公開しています。
詳しくは下記ページをご参照ください。

https://charm.sh/

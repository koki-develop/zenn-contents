---
title: "これでライブコーディングも怖くない！ cLive でターミナル操作を自動化する"
emoji: "⚡"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["cli", "clive", "terminal"]
published: true
---

# cLive とは？

[cLive](https://github.com/koki-develop/clive) はシンプルな設定ファイルに基づいてターミナルを自動で操作するためのコマンドラインツールです。
自動操作するターミナルはブラウザで表示されます。
そのため、「任意のターミナルアプリで [cLive](https://github.com/koki-develop/clive) を起動して、ブラウザだけ画面共有して自動ライブコーディングをする」といった使い方ができます。

![](/images/clive-introduction/demo.gif)
_JavaScript のライブコーディングデモ_

もちろん日本語入力も可能ですし、任意のタイミングで一時停止しておけば必要に応じて手動による操作もできます。

![](/images/clive-introduction/manual.gif)
_手動操作のデモ_

# リポジトリ

https://github.com/koki-develop/clive#readme

スターをもらえたら泣いて喜びます。

# 前提条件

[cLive](https://github.com/koki-develop/clive) を使用するには事前に [ttyd](https://github.com/tsl0922/ttyd) がインストールされている必要があります。

https://github.com/tsl0922/ttyd

例えば homebrew を使用している場合、 `brew install` でインストールすることができます。

```sh
$ brew install ttyd
```

その他のインストール方法については [ttyd のドキュメント](https://github.com/tsl0922/ttyd#installation)をご参照ください。

# インストール

もし homebrew を使用している場合は `brew install` でインストールすることができます。

```sh
$ brew install koki-develop/tap/clive
```

また、 [cLive](https://github.com/koki-develop/clive) は Go で作られているので `go install` でもインストールすることができます。

```sh
$ go install github.com/koki-develop/clive@latest
```

もしくは [Releases ページ](https://github.com/koki-develop/clive/releases/latest)からバイナリをダウンロードしてください。

# 使い方

まず `clive init` を実行すると `clive.yml` という名前で設定ファイルが作成されます。

```sh
$ clive init
# 設定ファイル名は `--config` フラグで指定できます
$ clive init --config example.yml
```

```yaml:clive.ymlの例
settings:
  # ログインコマンド
  loginCommand: ["bash", "--login"]
  # loginCommand: ["zsh", "--login"] # zsh を使う場合

  fontSize: 22 # フォントサイズ
  defaultSpeed: 10 # デフォルトの入力速度 ( ミリ秒 )

actions:
  - pause # 一時停止
  - type: echo 'Welcome to cLive!' # コマンドを入力
  - key: enter # エンターキーを入力
```

`clive start` を実行するとブラウザが立ち上がり、ターミナルの自動操作が開始されます。

```sh
$ clive start
# こちらも設定ファイル名は `--config` フラグで指定できます
$ clive start --config example.yml
```

![](/images/clive-introduction/init.gif)
_デモ_

# できること

様々な設定やアクションを指定することができます。
詳しくは [README ( 日本語 )](https://github.com/koki-develop/clive/blob/main/README.ja.md#設定) をご参照ください。

- [設定できる項目](https://github.com/koki-develop/clive/blob/main/README.ja.md#settings)
  - [ログインコマンド](https://github.com/koki-develop/clive/blob/main/README.ja.md#logincommand)
  - [フォントサイズ](https://github.com/koki-develop/clive/blob/main/README.ja.md#fontsize)
  - [フォントファミリー](https://github.com/koki-develop/clive/blob/main/README.ja.md#fontfamily)
  - [デフォルトの入力速度](https://github.com/koki-develop/clive/blob/main/README.ja.md#defaultspeed)
  - [使用するブラウザ](https://github.com/koki-develop/clive/blob/main/README.ja.md#browserbin)
- [実行できるアクション](https://github.com/koki-develop/clive/blob/main/README.ja.md#actions)
  - [キー入力](https://github.com/koki-develop/clive/blob/main/README.ja.md#type)
  - [特殊キー入力](https://github.com/koki-develop/clive/blob/main/README.ja.md#key) ( Enter キーや Backspace キー、その他色々 )
  - [Ctrl キー入力](https://github.com/koki-develop/clive/blob/main/README.ja.md#ctrl)
  - [任意の時間のスリープ](https://github.com/koki-develop/clive/blob/main/README.ja.md#sleep)
  - [一時停止](https://github.com/koki-develop/clive/blob/main/README.ja.md#pause)
  - [スクリーンショット](https://github.com/koki-develop/clive/blob/main/README.ja.md#screenshot)

# 設定ファイルのサンプル

様々な設定ファイルのサンプルは [cLive のリポジトリの `examples/` ディレクトリ](https://github.com/koki-develop/clive/tree/main/examples)に用意してあります。

https://github.com/koki-develop/clive/tree/main/examples

例えばこの記事の冒頭にある JavaScript のライブコーディングは次のような設定ファイルを使用しています。

```yaml:clive.yml
# https://github.com/koki-develop/clive/blob/main/examples/node/clive.yml
settings:
  loginCommand: ["bash", "--login"]
  fontSize: 22
  defaultSpeed: 10

actions:
  - pause

  - type: vim ./hello.js
  - sleep: 500
  - key: enter
  - sleep: 1000

  - type: i
  - type: |-
      const greet = (name) => {
        console.log(`Hello ${name}!`);
      };
      greet("cLive");
  - sleep: 1000

  - key: esc
  - type: :wq
  - sleep: 500
  - key: enter
  - sleep: 1000

  - type: clear
  - sleep: 500
  - key: enter
  - sleep: 1000

  - type: cat ./hello.js
  - sleep: 500
  - key: enter
  - sleep: 1000

  - type: node ./hello.js
  - sleep: 500
  - key: enter
```

# まとめ

登壇するときなんかにサラッとライブコーディングしてかっこつけたい。

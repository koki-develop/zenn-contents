---
title: "お気に入りのコマンドラインツールを淡々と紹介する"
emoji: "🦔"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["oss", "cli", "terminal"]
published: true
published_at: 2024-01-09 18:00
---

https://zenn.dev/noplan_inc/articles/3a623b2eb6d42d

めちゃくちゃ良い記事でした。

> 「OSS は使っていることを公言するだけでも貢献になる」と songmu さんが言っていたので、私も貢献したいと思います。

僕も貢献したいのでよく使うコマンドラインツールを紹介していきます。
特定のプログラミング言語等に依存するツールは省いています。

# actionlint - GitHub Actions の Workflow ファイルの静的解析

https://github.com/rhysd/actionlint

GitHub Actions の Workflow ファイルの静的解析ツールです。
かなり精度が高く、色々な設定ミスを検知してくれます。
エラーメッセージも見やすくて助かります。

![](/images/favorite-cli-tools/actionlint.gif)

# aicommits - コミットメッセージを自動生成

https://github.com/Nutlope/aicommits

変更内容を元に自動でコミットメッセージを AI が生成してくれるツールです。
コミットをする前にちゃんと確認してくれるのも安心感があって良いです。

![](/images/favorite-cli-tools/aicommits.gif)

# cLive - ターミナル操作を自動化

https://github.com/koki-develop/clive

ターミナルを自動操作するツールです。自作です。
ライブコーディングするときによく使っています。

![](/images/favorite-cli-tools/clive.gif)

以前紹介記事を書いたのでご参考までに ( やや内容古いです ) 。

https://zenn.dev/kou_pg_0131/articles/clive-introduction

# eza - ls コマンド代替

https://github.com/eza-community/eza

ls コマンド代替の Rust 製のコマンドラインツールです。
色がついたりアイコン表示にも対応していたりして見やすいです。

![](/images/favorite-cli-tools/eza.gif)

ちなみに eza は [exa](https://github.com/ogham/exa) の fork です。

> exa is unmaintained, use the [fork eza](https://github.com/eza-community/eza) instead.
> > [ogham/exa: A modern replacement for ‘ls’.](https://github.com/ogham/exa)

# delta - 見やすい diff

https://github.com/dandavison/delta

diff をめっちゃ見やすく出力してくれます。
git と連携して使うこともできます。

![](/images/favorite-cli-tools/delta.gif)

# fd - find コマンド代替

https://github.com/sharkdp/fd

find コマンド代替の Rust 製のコマンドラインツールです。
とにかく速いです。使い方もわかりやすいです。

![](/images/favorite-cli-tools/fd.gif)

# gat - cat コマンド代替

https://github.com/koki-develop/gat

cat コマンド代替の Go 製のコマンドラインツールです。自作です。
シンタックスハイライト対応のほか、整形やマークダウンの描画にも対応しています。
Gzip 圧縮されているファイルも自動で展開して出力できます。
ターミナルが Sixel に対応している場合は画像を表示することもできます。

![](/images/favorite-cli-tools/gat.gif)

元々は [bat](https://github.com/sharkdp/bat) を使っていたのですが、もう少しシンプルなものが欲しかったので作りました。
以前紹介記事を書いたのでご参考までに ( やや内容古いです ) 。

https://zenn.dev/kou_pg_0131/articles/gat-introduction

# genact - 忙しいフリをする

https://github.com/svenstaro/genact

なんか作業している感を出してくれます。色々出力されるだけで実際には何も実行されません。
~~サボりたいときに使えます。~~

![](/images/favorite-cli-tools/genact.gif)
_bruteforce モジュールの場合_

色々なモジュールがあります。

```shell
$ genact -l
Available modules:
  ansible
  bootlog
  botnet
  bruteforce
  cargo
  cc
  composer
  cryptomining
  docker_build
  docker_image_rm
  download
  julia
  kernel_compile
  memdump
  mkinitcpio
  rkhunter
  simcity
  weblog
```

# gh - 公式の GitHub CLI

https://github.com/cli/cli

GitHub に関する様々な操作を行うことができます。

![](/images/favorite-cli-tools/gh.gif)

拡張機能を作ることもできます。便利。

https://zenn.dev/kou_pg_0131/articles/gh-cli-extension-in-go
https://zenn.dev/kou_pg_0131/articles/gh-grass-introduction

# jnv - JSON をプレビューしながら jq のフィルタを書ける

https://github.com/ynqa/jnv

jq のフィルタの動作確認にめちゃ便利です。

![](/images/jnv-introduction/basic.gif)

紹介記事を書いたのでご参考までに。

https://zenn.dev/kou_pg_0131/articles/jnv-introduction

# mise - asdf 互換のバージョン管理ツール

https://github.com/jdx/mise

速いです。使い心地もとても良いです。

以前は rtx という名前でしたが最近 mise に変わりました。

https://anatofuz.hatenablog.com/entry/2024/01/03/211505

ちなみに環境変数の管理 ( `direnv` 代替 ) やタスクランナーとしての機能 ( experimental ) もあります。

# ripgrep - grep コマンド代替

https://github.com/BurntSushi/ripgrep

grep コマンド代替の Rust 製のコマンドラインツールです。
めちゃ速いです。色もついて見やすいです。

![](/images/favorite-cli-tools/ripgrep.gif)

# starship - かっちょいいターミナルプロンプト

https://github.com/starship/starship

いい感じのターミナルプロンプトを簡単に作れます。
プリセットがたくさん用意されてるので簡単に始められます。

https://starship.rs/ja-jp/presets/

僕のプロンプトはこんな感じです。
[Pastel Powerline プリセット](https://starship.rs/ja-JP/presets/pastel-powerline.html)をベースに少しカスタマイズしています。

![](/images/favorite-cli-tools/starship.png)

https://github.com/koki-develop/dotfiles/blob/main/src/starship/starship.toml

# vhs - ターミナル操作を録画

https://github.com/charmbracelet/vhs

ターミナル操作を定義した設定ファイルを読み込ませると、その操作を録画してくれます。
ちなみにこの記事内のデモ動画も vhs を使用して作っています。

以前紹介記事を書いたのでご参考までに ( やや内容古いです ) 。

https://zenn.dev/kou_pg_0131/articles/vhs-introduction

# xh - Rust 製の HTTP クライアント

https://github.com/ducaale/xh

Rust 製の HTTP クライアントです。
色々と機能が豊富で且つ直感的に使えるのでとても良いです。

![](/images/favorite-cli-tools/xh.gif)

# まとめ

良きです。

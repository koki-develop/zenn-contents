---
title: "ターミナルで動画を再生するコマンドラインツール「moview」の紹介"
emoji: "🎬"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["cli", "terminal"]
published: true
published_at: 2024-11-05 18:00
---

ターミナル上で動画を再生できるコマンドラインツールをつくりました。
なぜなら動画はターミナル上で再生できた方がいいので。

![](/images/moview-introduction/demo.gif)
_こういうの_

https://github.com/koki-develop/moview

# 前提条件

moview は事前に FFmpeg がインストールされている必要があります。

https://ffmpeg.org

例えば Homebrew を使用している場合は `brew install` でインストールすることができます。

```sh
$ brew install ffmpeg
```

その他のインストール方法については [FFmpeg のドキュメント](https://ffmpeg.org/download.html)をご参照ください。

# インストール

Homebrew を使用している場合は `brew install` でインストールすることができます。

```sh
$ brew install koki-develop/tap/moview
```

また、 moview は Go で作られているので `go install` でもインストールすることができます。

```sh
$ go install github.com/koki-develop/moview@latest
```

もしくは [Releases ページ](https://github.com/koki-develop/moview/releases/latest)からバイナリをダウンロードしてください。

# 使い方

```sh
$ moview --help
Play video in terminal.

Usage:
  moview FILE [flags]

Flags:
      --auto-play     auto play video
      --auto-repeat   auto repeat video
  -h, --help          help for moview
  -v, --version       version for moview
```

`moview` コマンドに動画ファイルのパスを指定すると再生が開始されます。
動画フォーマットは FFmpeg でサポートされているものであれば問題ありません。

```sh
$ moview ./path/to/video.mp4
```

![](/images/moview-introduction/demo.gif)

再生中の操作方法は以下の通りです。

| キー | 機能 |
| --- | --- |
| `Space` or `Enter` | 再生 / 一時停止 |
| `←` or `→` | 再生位置の前後移動 |
| `Ctrl+c` or `Esc` | 終了 |

# 仕組み

FFmpeg で動画を 1 フレームごとの画像に切り出したあと、それらを 1 枚ずつ ASCII 文字列に変換しているだけです。
画像の ASCII 文字列への変換には [qeesung/image2ascii](https://github.com/qeesung/image2ascii) を使用しています。

https://github.com/qeesung/image2ascii

# その他

moview では以下のパッケージやツールを使用しています。

- CLI フレームワーク : [Cobra](https://github.com/spf13/cobra)
- TUI フレームワーク : [Bubble Tea](https://github.com/charmbracelet/bubbletea)
- リリースの自動化 : [GoReleaser](https://github.com/goreleaser/goreleaser)

この辺りは以前公開した次の記事で簡単に紹介しているので、こちらをご参照ください。

https://zenn.dev/kou_pg_0131/articles/go-cli-packages
https://zenn.dev/kou_pg_0131/articles/goreleaser-usage

# まとめ

https://x.com/koki_develop/status/1853401088222720145

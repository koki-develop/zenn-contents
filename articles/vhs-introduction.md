---
title: "VHS でターミナルを録画する"
emoji: "📼"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["shell", "cli", "vhs", "terminal"]
published: true
---

[VHS](https://github.com/charmbracelet/vhs) という CLI ツールを見かけて試しに使ってみたら最高すぎたので簡単な紹介です。

https://github.com/charmbracelet/vhs

VHS を使用すると、例えばこういう GIF を作成したりできます。

![](/images/vhs-introduction/echo.gif)

CLI ツールのデモ動画を作成する際などに大活躍しそうです。

# 検証環境

- VHS v0.1.1

# 前提条件

VHS を使用するには事前に [ffmpeg](https://ffmpeg.org/) と [ttyd](https://github.com/tsl0922/ttyd) のインストールが必要です。
例えば Homebrew を使っている場合は `brew install` でインストールすることができます。

```sh
$ brew install ffmpeg ttyd
```

その他のインストール方法については公式ドキュメントをご参照ください。

- [ttyd](https://github.com/tsl0922/ttyd#installation)
- [FFmpeg](https://ffmpeg.org/download.html)

# VHS のインストール

Homebrew や Go など様々なインストール方法が用意されています。

```sh
# Homebrew を使う場合
$ brew install charmbracelet/tap/vhs

# Go を使う場合
$ go install github.com/charmbracelet/vhs@latest
```

その他のインストール方法については[公式の README](https://github.com/charmbracelet/vhs#installation) をご参照ください。

https://github.com/charmbracelet/vhs#installation

# VHS の使い方

`vhs new <任意の名前>` のように実行することで、 `<任意の名前>.tape` という名前でファイルが作成されます。
例えば次のように実行した場合、 `example.tape` というファイルが作成されます。

```sh
$ vhs new example
Created example.tape
```

作成された `example.tape` の内容は次のようになります。

```sh:example.tape
# VHS documentation
#
# Output:
#   Output <path>.gif               Create a GIF output at the given <path>
#   Output <path>.mp4               Create an MP4 output at the given <path>
#   Output <path>.webm              Create a WebM output at the given <path>
#
# Settings:
#   Set FontSize <number>           Set the font size of the terminal
#   Set FontFamily <string>         Set the font family of the terminal
#   Set Height <number>             Set the height of the terminal
#   Set Width <number>              Set the width of the terminal
#   Set LetterSpacing <float>       Set the font letter spacing (tracking)
#   Set LineHeight <float>          Set the font line height
#   Set Theme <string>              Set the theme of the terminal (JSON)
#   Set Padding <number>            Set the padding of the terminal
#   Set Framerate <number>          Set the framerate of the recording
#   Set PlaybackSpeed <float>       Set the playback speed of the recording
#
# Sleep:
#   Sleep <time>                    Sleep for a set amount of <time> in seconds
#
# Type:
#   Type[@<time>] "<characters>"    Type <characters> into the terminal with a
#                                   <time> delay between each character
#
# Keys:
#   Backspace[@<time>] [number]     Press the Backspace key
#   Down[@<time>] [number]          Press the Down key
#   Enter[@<time>] [number]         Press the Enter key
#   Space[@<time>] [number]         Press the Space key
#   Tab[@<time>] [number]           Press the Tab key
#   Left[@<time>] [number]          Press the Left Arrow key
#   Right[@<time>] [number]         Press the Right Arrow key
#   Up[@<time>] [number]            Press the Up Arrow key
#   Down[@<time>] [number]          Press the Down Arrow key
#   Ctrl+<key>                      Press the Control key + <key> (e.g. Ctrl+C)
#
# Display:
#   Hide                            Hide the subsequent commands from the output
#   Show                            Show the subsequent commands in the output

Output examples/demo.gif

Set FontSize 32
Set Width 1200
Set Height 600

Type "echo 'Welcome to VHS!'"  Sleep 500ms  Enter

Sleep 5s
```

作成された `.tape` ファイルを `vhs` に標準入力から読み込ませることで動画を作成できます。

```sh
# 出力先に `examples/` ディレクトリが設定されているので事前に作成しておく
$ mkdir ./examples
# GIF を作成
$ vhs < ./example.tape
```

![](/images/vhs-introduction/example.gif)
_実行例_

完了すると `examples/demo.gif` という名前で次のような GIF が作成されます。

![](/images/vhs-introduction/demo.gif)
_`examples/demo.gif`_

# その他

## 設定について

`.tape` ファイルを編集することで様々な設定を記述することができます。

- ファイル形式 ( GIF, MP4, WebM, PNG, テキスト )
- キーの入力速度
- 文字の大きさ、テーマ、ターミナルの高さ・幅など、見た目に関する様々な設定
- 再生速度、フレームレート
- その他色々

詳細については[公式の README](https://github.com/charmbracelet/vhs#vhs-command-reference) にわかりやすくまとまっているので、こちらをご参照ください。

https://github.com/charmbracelet/vhs#vhs-command-reference

## 公式サンプル

[公式の `examples/` ディレクトリ](https://github.com/charmbracelet/vhs/tree/main/examples)では様々な使用例が紹介されていますので、こちらも参考にしてみてください。

https://github.com/charmbracelet/vhs/tree/main/examples

## GitHub Actions

VHS 用の GitHub Actions も用意されています。
こちらを使うことで、例えばデモ用の GIF を最新に保つなどのことができます。

https://github.com/charmbracelet/vhs-action

# まとめ

こういうの大好き。
VHS と同じ [Charm](https://charm.sh/) が作っている [gum](https://github.com/charmbracelet/gum) という CLI ツールの紹介記事も公開しているので、こちらも見てみてください。

https://zenn.dev/kou_pg_0131/articles/gum-introduction

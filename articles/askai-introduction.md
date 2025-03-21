---
title: "ターミナルから ChatGPT に質問できる Go 製 CLI 「askai」の紹介"
emoji: "🤖"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["cli", "terminal", "golang", "chatgpt"]
published: true
published_at: 2023-09-19 18:00
---

だいぶ今更感もありますが、ターミナルからパッと AI に質問投げられたらいいなぁと思ったので作りました。

![](/images/askai-introduction/oneshot.gif)
_こういうの_

![](/images/askai-introduction/summarize.gif)
_こういうことや_

![](/images/askai-introduction/interactive.gif)
_こういうこともできる_

https://github.com/koki-develop/askai

類似のツールも色々ありますが作りたかったので作りました。
この記事では askai のインストール方法から基本的な使い方、仕組みについて簡単にまとめます。

# インストール

Homebrew を使用している場合は次のコマンドでインストールできます。

```sh
$ brew install koki-develop/tap/askai
```

`go install` を使用してインストールすることも可能です。

```sh
$ go install github.com/koki-develop/askai@latest
```

# 準備

## 1. OpenAI API の API Key を発行する

askai では内部的に OpenAI API を使用しています。
OpenAI API へリクエストするために必要な API Key を発行します。

:::message

[OpenAI platform](https://platform.openai.com) のアカウントが必要です。
まだアカウントを持っていない場合は 「[Sign up](platform.openai.com/signup)」 からアカウント登録を完了させてください。

:::

まず「[API keys](https://platform.openai.com/account/api-keys)」にアクセスします。

`Create new secret key` をクリックします。

![](/images/askai-introduction/to-create-new-secret-key.png)

`Name` に任意の名前を入力し、 `Create secret key` をクリックします。

![](/images/askai-introduction/create-new-secret-key.png)

API Key が発行されるので、ひかえておきます。

![](/images/askai-introduction/created-new-secret-key.png)

## 2. askai の設定を行う

`askai --configure` を実行すると対話的なセットアップが始まります。

```sh
$ askai --configure
```

入力する項目は次の通りです。

- OpenAI API Key: 「[1. OpenAI API Key を発行する](#1.-openai-api-の-api-key-を発行する)」手順で発行した API Key 。
- Model: 使用するモデル名。有効な値は次の通り。
    - `gpt-4`
    - `gpt-4-0613`
    - `gpt-4-32k`
    - `gpt-4-32k-0613`
    - `gpt-3.5-turbo`
    - `gpt-3.5-turbo-0613`
    - `gpt-3.5-turbo-16k`
    - `gpt-3.5-turbo-16k-0613`

設定が完了するとカレントディレクトリに `.askai` という名前で設定ファイルが作成されます。

```yaml:.askai
# 例
api_key: <API Key>
model: gpt-4
```

これで準備は完了です。

:::message

`--global` フラグをつけて実行すると設定ファイルは `$HOME/.askai` に保存されます。
このファイルはカレントディレクトリに `.askai` がない場合に参照されます。

```sh
$ askai --configure --global
```

:::

# 使い方

## 単発の質問をする

`askai` の引数に質問内容を渡して実行するだけです。
次のコマンドは、 Hello world と出力する Go プログラムを書いてもらう例です。

:::message

例では英語で入力していますが、中身は ChatGPT なので日本語など他の言語でも利用できます。

:::

```sh
$ askai 'Please write a program in Go that outputs "Hello world”.'
```

![](/images/askai-introduction/oneshot.gif)

## 対話形式で質問をする

`-i` もしくは `--interactive` フラグを指定すると対話形式で質問をすることもできます。
もちろん複数行にも対応しており、 `Ctrl` + `d` でメッセージを送信します。

```sh
$ askai -i
```

![](/images/askai-introduction/interactive.gif)

## 質問内容を標準入力から渡す

質問内容は標準入力から渡すこともできます。

```sh
# 標準入力から渡す
$ echo '質問' | askai

# ファイルの場合
$ askai < question.txt
```

標準入力からの入力と引数は同時に渡すこともできます。
これを活用すると、例えば次のように特定のファイルの内容を要約させたりもできます。

```sh
$ cat README.md | askai 'この内容を日本語で要約してください。'
```

![](/images/askai-introduction/summarize.gif)

# 仕組み

[go-openai](https://github.com/sashabaranov/go-openai) を利用して Chat Completions API にリクエストを送信しています。

https://github.com/sashabaranov/go-openai

対話モードのテキスト入力の描画には [Bubble Tea](https://github.com/charmbracelet/bubbletea) を使用しています。
CLI フレームワークには [Cobra](https://github.com/spf13/cobra) 、リリースには [GoReleaser](https://github.com/goreleaser/goreleaser) を使用しています。
これらについては簡単に説明した記事があるのでこちらをご参照ください。

https://zenn.dev/kou_pg_0131/articles/go-cli-packages
https://zenn.dev/kou_pg_0131/articles/goreleaser-usage

# まとめ

我ながら良きです。

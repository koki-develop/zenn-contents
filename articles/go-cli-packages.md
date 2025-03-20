---
title: "Go でイケてる CLI を作るために利用したパッケージ"
emoji: "📦"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["golang", "cli", "terminal"]
published: true
---

先日、 [cLive](https://github.com/koki-develop/clive) というターミナルを自動操作する Go 製のコマンドラインツールを公開しました。

https://github.com/koki-develop/clive#readme

![](/images/clive-introduction/demo.gif)
_[cLive](https://github.com/koki-develop/clive) で JavaScript のライブコーディングをするデモ_

この記事では Go でイケてる感じの CLI を作るために利用したパッケージを簡単に紹介します。
[cLive](https://github.com/koki-develop/clive) については以下の記事をご参照ください。

https://zenn.dev/kou_pg_0131/articles/clive-introduction

# 利用したパッケージ

- [Cobra](#cobra) : CLI フレームワーク
- [Bubble Tea](#bubble-tea) : TUI フレームワーク
- [GoReleaser](#goreleaser) : リリース自動化

## Cobra

https://cobra.dev/
https://github.com/spf13/cobra

[Cobra](https://cobra.dev/) は Go の CLI アプリケーションフレームワークです。
フラグの取り扱いやサブコマンド、ヘルプなどといったよくある CLI の機能を簡単に実装することができます。

例えば、以下のコードは `--toggle`, `-t` という `bool` 型のフラグを持つ `example` コマンドを実装するサンプルコードです。

```go:main.go
package main

import (
	"fmt"
	"os"

	"github.com/spf13/cobra"
)

var rootCmd = &cobra.Command{
	Use:   "example",
	Long:  "コマンドの説明",
	// メイン処理
	RunE: func(cmd *cobra.Command, args []string) error {
		// フラグを取得
		t, err := cmd.Flags().GetBool("toggle")
		if err != nil {
			return err
		}

		fmt.Printf("toggle: %t", t)
		return nil
	},
}

func main() {
	err := rootCmd.Execute()
	if err != nil {
		os.Exit(1)
	}
}

func init() {
	// フラグの追加
	// bool 型の --toggle, -t フラグを設定
	rootCmd.Flags().BoolP("toggle", "t", false, "フラグの説明")
}
```

```sh:実行例
# フラグを指定せずに実行
$ go run ./main.go
toggle: false

# フラグを指定して実行①
$ go run ./main.go --toggle
toggle: true

# フラグを指定して実行②
$ go run ./main.go -t
toggle: true

# help を表示
$ go run ./main.go --help
コマンドの説明

Usage:
  example [flags]

Flags:
  -h, --help     help for example
  -t, --toggle   フラグの説明
```

このように、それっぽい感じの CLI をサクッと作ることができます。

また、 [Cobra](https://cobra.dev/) には [cobra-cli](https://github.com/spf13/cobra-cli) という開発用の便利な CLI が用意されています。
[cobra-cli](https://github.com/spf13/cobra-cli) を使うことで Cobra CLI アプリケーションの初期化やサブコマンドの追加などといった作業を簡単に行うことができます。

https://github.com/spf13/cobra-cli

```sh:使用例
# モジュールを初期化
$ go mod init <任意のモジュール名>

# Cobra アプリケーションを初期化
$ cobra-cli init

# 色々生成される
$ tree
.
├── LICENSE
├── cmd
│   └── root.go
├── go.mod
├── go.sum
└── main.go

1 directory, 5 files

# `hello` サブコマンドを追加
$ cobra-cli add hello

# cmd/hello.go が作成される
$ tree
.
├── LICENSE
├── cmd
│   ├── hello.go
│   └── root.go
├── go.mod
├── go.sum
└── main.go

1 directory, 6 files
```

:::details main.go

```go:main.go
/*
Copyright © 2023 NAME HERE <EMAIL ADDRESS>

*/
package main

import "example/cmd"

func main() {
	cmd.Execute()
}
```

:::

:::details cmd/root.go

```go:cmd/root.go
/*
Copyright © 2023 NAME HERE <EMAIL ADDRESS>

*/
package cmd

import (
	"os"

	"github.com/spf13/cobra"
)



// rootCmd represents the base command when called without any subcommands
var rootCmd = &cobra.Command{
	Use:   "example",
	Short: "A brief description of your application",
	Long: `A longer description that spans multiple lines and likely contains
examples and usage of using your application. For example:

Cobra is a CLI library for Go that empowers applications.
This application is a tool to generate the needed files
to quickly create a Cobra application.`,
	// Uncomment the following line if your bare application
	// has an action associated with it:
	// Run: func(cmd *cobra.Command, args []string) { },
}

// Execute adds all child commands to the root command and sets flags appropriately.
// This is called by main.main(). It only needs to happen once to the rootCmd.
func Execute() {
	err := rootCmd.Execute()
	if err != nil {
		os.Exit(1)
	}
}

func init() {
	// Here you will define your flags and configuration settings.
	// Cobra supports persistent flags, which, if defined here,
	// will be global for your application.

	// rootCmd.PersistentFlags().StringVar(&cfgFile, "config", "", "config file (default is $HOME/.example.yaml)")

	// Cobra also supports local flags, which will only run
	// when this action is called directly.
	rootCmd.Flags().BoolP("toggle", "t", false, "Help message for toggle")
}
```

:::

:::details cmd/hello.go

```go:cmd/hello.go
/*
Copyright © 2023 NAME HERE <EMAIL ADDRESS>

*/
package cmd

import (
	"fmt"

	"github.com/spf13/cobra"
)

// helloCmd represents the hello command
var helloCmd = &cobra.Command{
	Use:   "hello",
	Short: "A brief description of your command",
	Long: `A longer description that spans multiple lines and likely contains examples
and usage of using your command. For example:

Cobra is a CLI library for Go that empowers applications.
This application is a tool to generate the needed files
to quickly create a Cobra application.`,
	Run: func(cmd *cobra.Command, args []string) {
		fmt.Println("hello called")
	},
}

func init() {
	rootCmd.AddCommand(helloCmd)

	// Here you will define your flags and configuration settings.

	// Cobra supports Persistent Flags which will work for this command
	// and all subcommands, e.g.:
	// helloCmd.PersistentFlags().String("foo", "", "A help for foo")

	// Cobra supports local flags which will only run when this command
	// is called directly, e.g.:
	// helloCmd.Flags().BoolP("toggle", "t", false, "Help message for toggle")
}
```

:::

その他 [Cobra](https://cobra.dev/) でできることについては[公式の README](https://github.com/spf13/cobra#readme) をご参照ください。

https://github.com/spf13/cobra#readme

## Bubble Tea

https://github.com/charmbracelet/bubbletea

[Bubble Tea](https://github.com/charmbracelet/bubbletea) は [Charm](https://charm.sh/) が開発している Go 製の TUI フレームワークです。
見た目が綺麗で機能的な UI を簡単に実装することができます。
[The Elm Architecture](https://guide.elm-lang.org/architecture/) をベースにしているらしいので、 [Elm](https://elm-lang.org/) を使い慣れている人は使いやすいかもしれません。

以下は [cLive](https://github.com/koki-develop/clive) を実行しているときの UI ですが、これは [Bubble Tea](https://github.com/charmbracelet/bubbletea) を使って実装しています。

![](/images/go-cli-packages/ui-demo.gif)
_[cLive](https://github.com/koki-develop/clive) の UI_

サンプルコードや実際にどういったことができるのかなどは、公式の [Examples](https://github.com/charmbracelet/bubbletea/tree/master/examples) が非常に充実しているのでこちらをご参照ください。

https://github.com/charmbracelet/bubbletea/tree/master/examples

例えば以下のようなサンプルが用意されています。

- [スピナー](https://github.com/charmbracelet/bubbletea/tree/master/examples/spinner)
- [フルスクリーン](https://github.com/charmbracelet/bubbletea/tree/master/examples/fullscreen)
- [ページャー](https://github.com/charmbracelet/bubbletea/tree/master/examples/pager)
- [ページネーター](https://github.com/charmbracelet/bubbletea/tree/master/examples/paginator)
- [プログレスバー](https://github.com/charmbracelet/bubbletea/tree/master/examples/progress-animated)
- [タブ](https://github.com/charmbracelet/bubbletea/tree/master/examples/tabs)
- etc.

また、 [Bubble Tea](https://github.com/charmbracelet/bubbletea) 専用のコンポーネントライブラリである [Bubbles](https://github.com/charmbracelet/bubbles) や、綺麗なスタイルをレンダリングするための [Lip Gloss](https://github.com/charmbracelet/lipgloss) などといったライブラリも提供されています。
詳しくは[公式の README](https://github.com/charmbracelet/bubbletea#readme) をご参照ください。

https://github.com/charmbracelet/bubbletea#libraries-we-use-with-bubble-tea

ちなみに [Charm](https://charm.sh/) は他にも [gum](https://github.com/charmbracelet/gum) や [VHS](https://github.com/charmbracelet/vhs) などの様々なイケてる CLI やライブラリ等を公開しているので、興味があればこちらもご参照ください。

https://charm.sh/
https://github.com/charmbracelet/gum
https://zenn.dev/kou_pg_0131/articles/gum-introduction
https://github.com/charmbracelet/vhs
https://zenn.dev/kou_pg_0131/articles/vhs-introduction

## GoReleaser

:::message
2023/01/16 追記: GoReleaser の基本的な使い方について紹介する記事を公開しました。

- [GoReleaser で Go 製 CLI のリリースを自動化＆ Homebrew でインストールできるようにする](https://zenn.dev/kou_pg_0131/articles/goreleaser-usage)
  :::

https://goreleaser.com/
https://github.com/goreleaser/goreleaser

[cLive](https://github.com/koki-develop/clive) では GitHub リリースや Homebrew Tap の作成を [GoReleaser](https://goreleaser.com/) を使用して自動化しています。

[GoReleaser](https://goreleaser.com/) は Go プロジェクトのリリースを自動化するツールです。
GitHub・GitLab・Gitea へのリリースの他、 Linux パッケージや Homebrew Tap の作成など、 Go プロジェクトのリリースに関する様々なタスクを自動化することができます。
基本的には CI 上で実行されることを想定していますが、ローカルでも実行可能です。

GitHub Actions を利用する場合、[公式の Action](https://github.com/marketplace/actions/goreleaser-action) が用意されているため、こちらを使うことで簡単にリリースの自動化を行うことができます。

https://github.com/marketplace/actions/goreleaser-action

もちろん GitHub Actions だけでなく他にも様々な CI ランナー上で利用することが可能です。
詳しい使い方については[公式ドキュメント](https://goreleaser.com/intro/)をご参照ください。

https://goreleaser.com/intro/

# まとめ

めちゃくちゃ便利！！！！！

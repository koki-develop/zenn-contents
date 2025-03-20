---
title: "Go の Fuzzy Finder ライブラリ「go-fzf」の紹介"
emoji: "🔍"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["golang", "fzf", "terminal"]
published: true
---

Go の Fuzzy Finder ライブラリである [go-fzf](https://github.com/koki-develop/go-fzf) を作りました。

https://github.com/koki-develop/go-fzf

[go-fzf](https://github.com/koki-develop/go-fzf) を使用すると次のような Fuzzy Finder を簡単に実装することができます。

![](/images/go-fzf-introduction/basic.gif)

上の例で実行している `main.go` の内容はこれだけです。

```go:main.go
package main

import (
	"fmt"
	"log"

	"github.com/koki-develop/go-fzf"
)

func main() {
	items := []string{"hello", "world", "foo", "bar"}

	f, err := fzf.New()
	if err != nil {
		log.Fatal(err)
	}

	idxs, err := f.Find(items, func(i int) string { return items[i] })
	if err != nil {
		log.Fatal(err)
	}

	for _, i := range idxs {
		fmt.Println(items[i])
	}
}
```

他にもオプションを指定することで複数選択できるようにしたり、大文字 / 小文字の区別や UI のカスタマイズなど、様々なことができます。
この記事では [go-fzf](https://github.com/koki-develop/go-fzf) の使い方や利用技術について簡単にまとめます。

- [go-fzf を CLI で試してみる](#go-fzf-を-cli-で試してみる)
- [go-fzf の使い方](#go-fzf-の使い方)
  - [インストール](#インストール)
  - [基本的な使い方](#基本的な使い方)
  - [オプションを指定する](#オプションを指定する)
  - [UI をカスタマイズする](#ui-をカスタマイズする)
  - [その他](#その他)
- [利用技術](#利用技術)
- [まとめ](#まとめ)

# go-fzf を CLI で試してみる

[go-fzf](https://github.com/koki-develop/go-fzf) を使うとどのようなことをできるのかを実際に試してみたい場合は `gofzf` CLI を使ってみてください。
`gofzf` CLI は [go-fzf](https://github.com/koki-develop/go-fzf) を使用して実装されており、 [go-fzf](https://github.com/koki-develop/go-fzf) のほとんど全ての機能を利用することができます。

Homebrew を使用している場合は `brew install` でインストールすることができます。

```sh
$ brew install koki-develop/tap/gofzf
```

もしくは `go install` でインストールすることもできます。

```sh
$ go install github.com/koki-develop/go-fzf/cmd/gofzf@latest
```

`gofzf --help` でヘルプを表示します。

```sh
$ gofzf --help
```

:::details gofzf --help

```console
$ gofzf --help
Usage:
  gofzf [flags]

Flags:
      --limit int                     maximum number of items to select (default 1)
      --no-limit                      unlimited number of items to select
      --case-sensitive                case sensitive search
      --prompt string                  (default "> ")
      --input-placeholder string       (default "Filter...")
      --cursor string                  (default "> ")
      --selected-prefix string         (default "● ")
      --unselected-prefix string       (default "◯ ")
      --input-position string         position of input (top|bottom) (default "top")
      --count-view                     (default true)
      --prompt-fg string
      --prompt-bg string
      --prompt-bold
      --prompt-blink
      --prompt-italic
      --prompt-strike
      --prompt-underline
      --prompt-faint
      --input-placeholder-fg string
      --input-placeholder-bg string
      --input-placeholder-bold
      --input-placeholder-blink
      --input-placeholder-italic
      --input-placeholder-strike
      --input-placeholder-underline
      --input-placeholder-faint        (default true)
      --input-text-fg string
      --input-text-bg string
      --input-text-bold
      --input-text-blink
      --input-text-italic
      --input-text-strike
      --input-text-underline
      --input-text-faint
      --cursor-fg string               (default "#00ADD8")
      --cursor-bg string
      --cursor-bold
      --cursor-blink
      --cursor-italic
      --cursor-strike
      --cursor-underline
      --cursor-faint
      --cursorline-fg string
      --cursorline-bg string
      --cursorline-bold                (default true)
      --cursorline-blink
      --cursorline-italic
      --cursorline-strke
      --cursorline-underline
      --cursorline-faint
      --selected-prefix-fg string      (default "#00ADD8")
      --selected-prefix-bg string
      --selected-prefix-bold
      --selected-prefix-blink
      --selected-prefix-italic
      --selected-prefix-strke
      --selected-prefix-underline
      --selected-prefix-faint
      --unselected-prefix-fg string
      --unselected-prefix-bg string
      --unselected-prefix-bold
      --unselected-prefix-blink
      --unselected-prefix-italic
      --unselected-prefix-strke
      --unselected-prefix-underline
      --unselected-prefix-faint        (default true)
      --matches-fg string              (default "#00ADD8")
      --matches-bg string
      --matches-bold
      --matches-blink
      --matches-italic
      --matches-strke
      --matches-underline
      --matches-faint
  -h, --help                          help for gofzf
  -v, --version                       version for gofzf
```

:::

`gofzf` をそのまま実行すると、作業ディレクトリから再帰的にファイルをあいまい検索します。

```sh
$ gofzf
```

![](/images/go-fzf-introduction/cli.gif)

検索対象のアイテムを標準入力から改行区切りで渡すこともできます。

```sh
$ ls | gofzf
```

![](/images/go-fzf-introduction/cli-stdin.gif)

`gofzf` CLI の詳しい使い方については [CLI の公式ドキュメント ( 日本語 )](https://github.com/koki-develop/go-fzf/blob/main/docs/cli/README.ja.md#cli-として使う) をご参照ください。

https://github.com/koki-develop/go-fzf/blob/main/docs/cli/README.ja.md#cli-として使う

# go-fzf の使い方

- [インストール](#インストール)
- [基本的な使い方](#基本的な使い方)
- [オプションを指定する](#オプションを指定する)
- [UI をカスタマイズする](#ui-をカスタマイズする)
- [その他](#その他)

## インストール

次のコマンドで [go-fzf](https://github.com/koki-develop/go-fzf) をインストールします。

```sh
$ go get -u github.com/koki-develop/go-fzf
```

その後、プログラムから [go-fzf](https://github.com/koki-develop/go-fzf) を import してください。

```go
import "github.com/koki-develop/go-fzf"
```

## 基本的な使い方

まず [`fzf.New()`](https://pkg.go.dev/github.com/koki-develop/go-fzf#New) で Fuzzy Finder を初期化します。

```go:main.go
f, err := fzf.New()
if err != nil {
  // ...
}
```

初期化した Fuzzy Finder の [`Find()`](https://pkg.go.dev/github.com/koki-develop/go-fzf#FZF.Find) メソッドを実行して Fuzzy Finder を起動することができます。

```go:main.go
items := []string{"hello", "world", "foo", "bar"}

idxs, err := f.Find(items, func(i int) string { return items[i] })
if err != nil {
  // ...
}
```

- 第 1 引数には任意の slice を渡します。 slice の要素の型はなんでもいいです。
- 第 2 引数にはインデックスを受け取って検索対象の文字列を返す関数を渡します。
  今回の例では第 1 引数に渡している `items` は `[]string` 型なので、 `items[i]` を返す関数を渡します。
- 戻り値には選択されたアイテムのインデックスの一覧が `[]int` 型として返されます。

:::details プログラムの全体

```go:main.go
package main

import (
	"fmt"
	"log"

	"github.com/koki-develop/go-fzf"
)

func main() {
	items := []string{"hello", "world", "foo", "bar"}

	f, err := fzf.New()
	if err != nil {
		log.Fatal(err)
	}

	idxs, err := f.Find(items, func(i int) string { return items[i] })
	if err != nil {
		log.Fatal(err)
	}

	for _, i := range idxs {
		fmt.Println(items[i])
	}
}
```

:::

![](/images/go-fzf-introduction/basic.gif)

## オプションを指定する

[go-fzf](https://github.com/koki-develop/go-fzf) では Functional Options Pattern を使用して様々なオプションを指定することができます。
例えば次のプログラムは、 [`fzf.WithLimit()`](https://pkg.go.dev/github.com/koki-develop/go-fzf#WithNoLimit) を使用して選択可能なアイテムの数を設定する例です。

```go:main.go
f, err := fzf.New(fzf.WithLimit(4))
if err != nil {
  // ...
}
```

:::details プログラムの全体

```go:main.go
package main

import (
	"fmt"
	"log"

	"github.com/koki-develop/go-fzf"
)

func main() {
	items := []string{"hello", "world", "foo", "bar"}

	f, err := fzf.New(fzf.WithLimit(4))
	if err != nil {
		log.Fatal(err)
	}

	idxs, err := f.Find(items, func(i int) string { return items[i] })
	if err != nil {
		log.Fatal(err)
	}

	for _, i := range idxs {
		fmt.Println(items[i])
	}
}
```

:::

![](/images/go-fzf-introduction/limit.gif)

もちろん複数のオプションを指定することも可能です。
次のプログラムは [`fzf.WithNoLimit()`](https://pkg.go.dev/github.com/koki-develop/go-fzf#WithNoLimit) オプションと [`fzf.WithCaseSensitive()`](https://pkg.go.dev/github.com/koki-develop/go-fzf#WithCaseSensitive) オプションを指定する例です。

```go:main.go
f, err := fzf.New(
  fzf.WithNoLimit(true),
  fzf.WithCaseSensitive(true),
)
if err != nil {
  // ...
}
```

:::details プログラムの全体

```go:main.go
package main

import (
	"fmt"
	"log"

	"github.com/koki-develop/go-fzf"
)

func main() {
	items := []string{"HELLO", "Hello", "hello"}

	f, err := fzf.New(
		fzf.WithNoLimit(true),
		fzf.WithCaseSensitive(true),
	)
	if err != nil {
		log.Fatal(err)
	}

	idxs, err := f.Find(items, func(i int) string { return items[i] })
	if err != nil {
		log.Fatal(err)
	}

	for _, i := range idxs {
		fmt.Println(items[i])
	}
}
```

:::

![](/images/go-fzf-introduction/options.gif)

## UI をカスタマイズする

[go-fzf](https://github.com/koki-develop/go-fzf) の大きな特徴のひとつは UI のカスタマイズ性の高さです。
例えば [`fzf.WithCursor()`](https://pkg.go.dev/github.com/koki-develop/go-fzf#WithCursor) オプションを使用するとカーソルに表示する文字列を設定することができます。

```go:main.go
f, err := fzf.New(fzf.WithCursor("=> "))
if err != nil {
  // ...
}
```

:::details プログラムの全体

```go:main.go
package main

import (
	"fmt"
	"log"

	"github.com/koki-develop/go-fzf"
)

func main() {
	items := []string{"hello", "world", "foo", "bar"}

	f, err := fzf.New(fzf.WithCursor("=> "))
	if err != nil {
		log.Fatal(err)
	}

	idxs, err := f.Find(items, func(i int) string { return items[i] })
	if err != nil {
		log.Fatal(err)
	}

	for _, i := range idxs {
		fmt.Println(items[i])
	}
}
```

:::

![](/images/go-fzf-introduction/cursor.gif)

また [`fzf.WithStyles()`](https://pkg.go.dev/github.com/koki-develop/go-fzf#WithStyles) オプションを使用すると各コンポーネントの装飾をカスタマイズすることもできます。
例えば次のプログラムはカーソルを太字にして、且つ文字色を赤色にしています。

```go:main.go
f, err := fzf.New(
  fzf.WithStyles(
    fzf.WithStyleCursor(fzf.Style{Bold: true, ForegroundColor: "#ff0000"}),
  ),
)
if err != nil {
  // ...
}
```

:::details プログラムの全体

```go:main.go
package main

import (
	"fmt"
	"log"

	"github.com/koki-develop/go-fzf"
)

func main() {
	items := []string{"hello", "world", "foo", "bar"}

	f, err := fzf.New(
		fzf.WithStyles(
			fzf.WithStyleCursor(fzf.Style{Bold: true, ForegroundColor: "#ff0000"}),
		),
	)
	if err != nil {
		log.Fatal(err)
	}

	idxs, err := f.Find(items, func(i int) string { return items[i] })
	if err != nil {
		log.Fatal(err)
	}

	for _, i := range idxs {
		fmt.Println(items[i])
	}
}
```

:::

![](/images/go-fzf-introduction/styles.gif)

他にも次のようなものを始めとした様々なコンポーネントのカスタマイズを行うことができます。

- プロンプト
- カーソル
- 選択中 / 未選択アイテムの接頭辞
- インプットの位置
- インプットのプレースホルダ
- カウントビュー
- プレビューウィンドウ
- etc.

詳しくは[公式ドキュメント ( 日本語 )](https://github.com/koki-develop/go-fzf/blob/main/docs/library/README.ja.md#見た目をカスタマイズする) をご参照ください。

https://github.com/koki-develop/go-fzf/blob/main/docs/library/README.ja.md#見た目をカスタマイズする

## その他

その他の [go-fzf](https://github.com/koki-develop/go-fzf) の詳しい使い方については[ライブラリの公式ドキュメント ( 日本語 )](https://github.com/koki-develop/go-fzf/blob/main/docs/library/README.ja.md) をご参照ください。

https://github.com/koki-develop/go-fzf/blob/main/docs/library/README.ja.md#ライブラリとして使用する

また、[公式の Examples](https://github.com/koki-develop/go-fzf/tree/main/examples) には次のようなものを始めとした様々な使用例が記載されていますので、こちらも合わせてご参照ください。

- 複数選択
- 大文字 / 小文字を区別する
- キーマップ
- ホットリロード
- UI をカスタマイズする
- etc.

https://github.com/koki-develop/go-fzf/tree/main/examples

# 利用技術

`gofzf` CLI では CLI フレームワークに [Cobra](https://github.com/spf13/cobra) 、リリースの自動化に [GoReleaser](https://github.com/goreleaser/goreleaser) を使用しています。
Fuzzy Finder の UI 実装には [Bubble Tea](https://github.com/charmbracelet/bubbletea) を使用しています。
この辺りは以前公開した次の記事で簡単に紹介しているので、こちらをご参照ください。

https://zenn.dev/kou_pg_0131/articles/go-cli-packages
https://zenn.dev/kou_pg_0131/articles/goreleaser-usage

# まとめ

使ってもらえたら嬉しいです。

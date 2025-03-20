---
title: "【Go】fatih/color を使用してコンソールに文字列を色付きで出力する"
emoji: "😸"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["go"]
published: true
---

Go でコンソールに色付き文字列を出力したいケースがあり、 [fatih/color](https://github.com/fatih/color) というパッケージを試してみたところ、非常に使い勝手が良く便利だったので備忘録。

https://github.com/fatih/color
https://pkg.go.dev/github.com/fatih/color

# 簡単な例

単純に色付き文字列を出力したいだけであれば `color.{色名}()` を使用できます。
出力時には自動で末尾改行がつけられます。
引数には `fmt.Printf()` と同じようにフォーマット文字列を使用できます。

```go:main.go
package main

import (
	"github.com/fatih/color"
)

func main() {
	color.Black("Black")
	color.Blue("Blue")
	color.Cyan("Cyan")
	color.Green("Green")
	color.HiBlack("HiBlack")
	color.HiBlue("HiBlue")
	color.HiCyan("HiCyan")
	color.HiGreen("HiGreen")
	color.HiMagenta("HiMagenta")
	color.HiRed("HiRed")
	color.HiWhite("HiWhite")
	color.HiYellow("HiYellow")
	color.Magenta("Magenta")
	color.Red("Red")
	color.White("White")
	color.Yellow("Yellow")

	color.Red("hello %s", "world")
}
```

![](https://storage.googleapis.com/zenn-user-upload/65ozkg3zdjkrc0pmkxcaj6kabygm)

また、 `color.{色名}String()` を使用することで文字列として取得できます。

```go:main.go
package main

import (
	"fmt"

	"github.com/fatih/color"
)

func main() {
	s := color.RedString("hello")
	fmt.Printf("%#v", s) // => "\x1b[31mhello\x1b[0m"
}
```

# 様々な書式を組み合わせる例

例えば文字色だけでなく背景色をつけたり太字にしたい場合等は、カラーオブジェクトを作成する必要があります。
とはいえ特に複雑な設定は必要なく、非常に使いやすい仕様になっています。
使用できる書式については[ドキュメント](https://pkg.go.dev/github.com/fatih/color#Attribute)を参照してください。

```go:main.go
package main

import (
	"github.com/fatih/color"
)

func main() {
	// 文字色を赤、背景色を青
	c := color.New(color.FgRed, color.BgBlue)
	// `Add()` を使用して途中で追加することもできる
	// 下線を設定
	c.Add(color.Underline)

	// 他にも `fmt` パッケージでお馴染みの `Print()`, `Fprint()`, `Sprint()` なども使える
	c.Println("hello")
}
```

![](https://storage.googleapis.com/zenn-user-upload/nqqmnwi1sxmxbrkery8nw0brtgxg)

# 参考

https://pkg.go.dev/github.com/fatih/color

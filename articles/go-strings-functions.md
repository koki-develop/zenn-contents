---
title: "【Go】strings パッケージ関数まとめ"
emoji: "😸"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["go"]
published: true
---

# 概要

Go の標準ライブラリである `strings` で定義されている各関数の説明とサンプルコードをまとめました。
`strings.Reader`, `strings.Builder`, `strings.Replacer` とこれらに関連する関数はこの記事では対象外とします。

検証した Go のバージョンは以下です。

```
$ go version
go version go1.15.3 darwin/amd64
```

# Compare(a, b string) int

２つの文字列を辞書的に比較します。
`a == b` の場合は `0`, `a < b` の場合は `-1`, `a > b` の場合は `1` を返します。

```go
package main

import (
	"fmt"
	"strings"
)

func main() {
	fmt.Println(strings.Compare("aaa", "aaa"))
	// => 0

	fmt.Println(strings.Compare("aaa", "bbb"))
	// => -1

	fmt.Println(strings.Compare("bbb", "aaa"))
	// => 1
}
```

# Contains(s, substr string) bool

`substr` が `s` の中に含まれているかどうかを判定します。

```go
package main

import (
	"fmt"
	"strings"
)

func main() {
	fmt.Println(strings.Contains("hello world", "h"))
	// => true

	fmt.Println(strings.Contains("hello world", "hello"))
	// => true

	fmt.Println(strings.Contains("hello world", "hoge"))
	// => false

	fmt.Println(strings.Contains("hello world", ""))
	// => true

	fmt.Println(strings.Contains("", ""))
	// => true
}
```

# ContainsAny(s, chars string) bool

`chars` に含まれる Unicode コードポイントのいずれかが `s` に含まれているかどうかを判定します。

```go
package main

import (
	"fmt"
	"strings"
)

func main() {
	fmt.Println(strings.ContainsAny("hello world", "h"))
	// => true

	fmt.Println(strings.ContainsAny("hello world", "hoge"))
	// => true

	fmt.Println(strings.ContainsAny("hello world", "AAA"))
	// => false

	fmt.Println(strings.ContainsAny("hello world", ""))
	// => false

	fmt.Println(strings.ContainsAny("", ""))
	// => false
}
```

# ContainsRune(s string, r rune) bool

`s` の中に Unicode コードポイント `r` が含まれているかどうかを判定します。

```go
package main

import (
	"fmt"
	"strings"
)

func main() {
	fmt.Println(strings.ContainsRune("hello world", 'h'))
	// => true

	fmt.Println(strings.ContainsRune("hello world", 'A'))
	// => false
}
```

# Count(s, substr string) int

`s` に含まれている `substr` の数をカウントして返します。
`substr` が空文字の場合、 `s` に含まれている Unicode コードポイントの数 + 1 を返します。

```go
package main

import (
	"fmt"
	"strings"
)

func main() {
	fmt.Println(strings.Count("hhh", "h"))
	// => 3

	fmt.Println(strings.Count("hhhhh", "h"))
	// => 5

	fmt.Println(strings.Count("hhhhh", ""))
	// => 6
}
```

# EqualFold(s, t string) bool

`s` と `t` を大文字小文字を区別せずに比較します。

```go
package main

import (
	"fmt"
	"strings"
)

func main() {
	fmt.Println(strings.EqualFold("Go", "GO"))
	// => true

	fmt.Println(strings.EqualFold("Go", "gO"))
	// => true

	fmt.Println(strings.EqualFold("Go", "go"))
	// => true

	fmt.Println(strings.EqualFold("a", "g"))
	// => false
}
```

# Fields(s string) []string

`s` を 1 つ以上の空白で分割した文字列のスライスを返します。
`s` が空白しか含まれていない、もしくは空文字の場合は空のスライスを返します。

```go
package main

import (
	"fmt"
	"strings"
)

func main() {
	fmt.Printf("%#v\n", strings.Fields("   hoge fuga\nfoo\tbar\rpiyo   "))
	// => []string{"hoge", "fuga", "foo", "bar"}

	fmt.Printf("%#v\n", strings.Fields(""))
	// => []string{}

	fmt.Printf("%#v\n", strings.Fields(" 　\n\t\r"))
	// => []string{}
}
```

# FieldsFunc(s string, f func(rune) bool) []string

`s` を 1 つ以上の `f` を満たす Unicode コードポイントで分割した文字列のスライスを返します。
`s` のすべてのコードポイントが `f` を満たす、もしくは `s` が空文字の場合は空のスライスを返します。

```go
package main

import (
	"fmt"
	"strings"
)

func main() {
	f := func(r rune) bool {
		return r == '@'
	}

	fmt.Printf("%#v\n", strings.FieldsFunc("@@@hoge@@fuga@@@@foo@@bar@@@", f))
	// => []string{"hoge", "fuga", "foo", "bar"}

	fmt.Printf("%#v\n", strings.FieldsFunc("@@@@", f))
	// => []string{}

	fmt.Printf("%#v\n", strings.FieldsFunc("", f))
	// => []string{}
}
```

# HasPrefix(s, prefix string) bool

`s` が `prefix` で始まるかどうかを判定します。

```go
package main

import (
	"fmt"
	"strings"
)

func main() {
	fmt.Println(strings.HasPrefix("hello world", "h"))
	// => true

	fmt.Println(strings.HasPrefix("hello world", "hello"))
	// => true

	fmt.Println(strings.HasPrefix("hello world", "hoge"))
	// => false

	fmt.Println(strings.HasPrefix("hello world", ""))
	// => true
}
```

# HasSuffix(s, suffix string) bool

`s` が `suffix` で終わるかどうかを判定します。

```go
package main

import (
	"fmt"
	"strings"
)

func main() {
	fmt.Println(strings.HasSuffix("hello world", "d"))
	// => true

	fmt.Println(strings.HasSuffix("hello world", "world"))
	// => true

	fmt.Println(strings.HasSuffix("hello world", "fuga"))
	// => false

	fmt.Println(strings.HasSuffix("hello world", ""))
	// => true
}
```

# Index(s, substr string) int

`s` の中で `substr` が最初に見つかる位置を返します。
`s` に `substr` が含まれていない場合は `-1` を返します。

```go
package main

import (
	"fmt"
	"strings"
)

func main() {
	fmt.Println(strings.Index("hello world", "h"))
	// => 0

	fmt.Println(strings.Index("hello world", "hello"))
	// => 0

	fmt.Println(strings.Index("hello world", "world"))
	// => 6

	fmt.Println(strings.Index("hello world", "hoge"))
	// => -1

	fmt.Println(strings.Index("hello world", ""))
	// => 0

	fmt.Println(strings.Index("", ""))
	// => 0
}
```

# IndexAny(s, chars string) int

`s` の中で `chars` に含まれる Unicode コードポイントのいずれかが最初に見つかる位置を返します。
`chars` の中の Unicode コードポイントのどれもが `s` に含まれていない場合、 `-1` を返します。

```go
package main

import (
	"fmt"
	"strings"
)

func main() {
	fmt.Println(strings.IndexAny("hello world", "h"))
	// => 0

	fmt.Println(strings.IndexAny("hello world", "hoge"))
	// => 0

	fmt.Println(strings.IndexAny("hello world", "warm"))
	// => 6

	fmt.Println(strings.IndexAny("hello world", "AAA"))
	// => -1

	fmt.Println(strings.IndexAny("hello world", ""))
	// => -1

	fmt.Println(strings.IndexAny("", ""))
	// => -1
}
```

# IndexByte(s string, c byte) int

`s` の中で `c` が最初に見つかる位置を返します。
`s` に `c` が含まれていない場合、 `-1` を返します。

```go
package main

import (
	"fmt"
	"strings"
)

func main() {
	fmt.Println(strings.IndexByte("hello world", 'h'))
	// => 0

	fmt.Println(strings.IndexByte("hello world", 'w'))
	// => 6

	fmt.Println(strings.IndexByte("hello world", 'a'))
	// => -1
}
```

# IndexFunc(s string, f func(rune) bool) int

`s` の中で `f` を満たす最初の Unicode コードポイントの位置を返します。
`s` に `f` を満たす Unicode コードポイントが含まれていない場合は `-1` を返します。

```go
package main

import (
	"fmt"
	"strings"
)

func main() {
	f := func(r rune) bool {
		return r == '@'
	}

	fmt.Println(strings.IndexFunc("@hello world", f))
	// => 0

	fmt.Println(strings.IndexFunc("hello@world", f))
	// => 5

	fmt.Println(strings.IndexFunc("hello world", f))
	// => -1
}
```

# IndexRune(s string, r rune) int

`s` の中で Unicode コードポイント `r` が最初に見つかる位置を返します。
`s` に `r` が含まれていない場合は `-1` を返します。

```go
package main

import (
	"fmt"
	"strings"
)

func main() {
	fmt.Println(strings.IndexRune("hello world", 'h'))
	// => 0

	fmt.Println(strings.IndexRune("hello world", 'w'))
	// => 6

	fmt.Println(strings.IndexRune("hello world", 'a'))
	// => -1
}
```

# Join(elems []string, sep string) string

`elems` の要素を `sep` で結合して 1 つの文字列を返します。

```go
package main

import (
	"fmt"
	"strings"
)

func main() {
	elems := []string{"hoge", "fuga", "foo", "bar"}

	fmt.Println(strings.Join(elems, ","))
	// => hoge,fuga,foo,bar

	fmt.Println(strings.Join(elems, ""))
	// => hogefugafoobar
}
```

# LastIndex(s, substr string) int

`s` の中で `substr` が最初に見つかる位置を返します。
`s` に `substr` が含まれていない場合は -1 を返します。

```go
package main

import (
	"fmt"
	"strings"
)

func main() {
	fmt.Println(strings.LastIndex("hello hello", "o"))
	// => 10

	fmt.Println(strings.LastIndex("hello hello", "hello"))
	// => 6

	fmt.Println(strings.LastIndex("hello hello", "a"))
	// => -1

	fmt.Println(strings.LastIndex("hello hello", ""))
	// => 11

	fmt.Println(strings.LastIndex("", ""))
	// => 0
}
```

# LastIndexAny(s, chars string) int

`s` の中で `chars` に含まれる Unicode コードポイントのいずれかが最後に見つかる位置を返します。
`chars` の中の Unicode コードポイントのどれもが `s` に含まれていない場合は `-1` を返します。

```go
package main

import (
	"fmt"
	"strings"
)

func main() {
	fmt.Println(strings.LastIndexAny("hello world", "h"))
	// => 0

	fmt.Println(strings.LastIndexAny("hello world", "world"))
	// => 10

	fmt.Println(strings.LastIndexAny("hello world", "hoge"))
	// => 7

	fmt.Println(strings.LastIndexAny("hello world", "AAA"))
	// => -1

	fmt.Println(strings.LastIndexAny("hello world", ""))
	// => -1

	fmt.Println(strings.LastIndexAny("", ""))
	// => -1
}
```

# LastIndexByte(s string, c byte) int

`s` の中で `c` が最後に見つかる位置を返します。
`s` に `c` が含まれていない場合、 `-1` を返します。

```go
package main

import (
	"fmt"
	"strings"
)

func main() {
	fmt.Println(strings.LastIndexByte("hello world", 'h'))
	// => 0

	fmt.Println(strings.LastIndexByte("hello world", 'o'))
	// => 7

	fmt.Println(strings.LastIndexByte("hello world", 'a'))
	// => -1
}
```

# LastIndexFunc(s string, f func(rune) bool) int

`s` の中で `f` を満たす最後の Unicode コードポイントの位置を返します。
`s` に `f` を満たす Unicode コードポイントが含まれていない場合は `-1` を返します。

```go
package main

import (
	"fmt"
	"strings"
)

func main() {
	f := func(r rune) bool {
		return r == '@'
	}

	fmt.Println(strings.LastIndexFunc("@hello world@", f))
	// => 12

	fmt.Println(strings.LastIndexFunc("hello@world", f))
	// => 5

	fmt.Println(strings.LastIndexFunc("hello world", f))
	// => -1
}
```

# Map(mapping func(rune) rune, s string) string

`s` の各文字を `mapping` で置換した文字列を返します。

```go
package main

import (
	"fmt"
	"strings"
)

func main() {
	mapping := func(r rune) rune {
		return r + 2
	}

	fmt.Println(strings.Map(mapping, "abc"))
	// => cde
}
```

# Repeat(s string, count int) string

`s` を `count` 回繰り返した文字列を返します。

```go
package main

import (
	"fmt"
	"strings"
)

func main() {
	fmt.Println(strings.Repeat("a", 5))
	// => aaaaa

	fmt.Println(strings.Repeat("hello", 5))
	// => hellohellohellohellohello
}
```

# Replace(s, old, new string, n int) string

`s` の中で `old` と一致する文字列を `new` に置換します。
`n` は置換回数です。
`n` に負の値を指定した場合は置換回数に制限はありません ( `ReplaceAll` と同義 )。

```go
package main

import (
	"fmt"
	"strings"
)

func main() {
	fmt.Println(strings.Replace("hello hello hello", "hello", "goodnight", -1))
	// => goodnight goodnight goodnight

	fmt.Println(strings.Replace("hello hello hello", "hello", "goodnight", 0))
	// => hello hello hello

	fmt.Println(strings.Replace("hello hello hello", "hello", "goodnight", 1))
	// => goodnight hello hello

	fmt.Println(strings.Replace("aaa", "", "BBB", -1))
	// => BBBaBBBaBBBaBBB
}

```

# ReplaceAll(s, old, new string) string

`s` の中で `old` と一致する全ての文字列を `new` に置換します。

```go
package main

import (
	"fmt"
	"strings"
)

func main() {
	fmt.Println(strings.ReplaceAll("hello hello hello", "hello", "goodnight"))
	// => goodnight goodnight goodnight

	fmt.Println(strings.ReplaceAll("aaa", "", "BBB"))
	// => BBBaBBBaBBBaBBB
}
```

# Split(s, sep string) []string

`s` を `sep` で分割したスライスを返します。
`s` の中に `sep` が含まれていない場合は `s` のみを含む長さが 1 のスライスを返します。
`sep` が空文字の場合は `s` を UTF-8 文字ごとに分割したスライスを返します。
`s` と `sep` が両方とも空文字の場合は空のスライスを返します。

```go
package main

import (
	"fmt"
	"strings"
)

func main() {
	fmt.Printf("%#v\n", strings.Split("hoge,fuga,foo,bar", ","))
	// => []string{"hoge", "fuga", "foo", "bar"}

	fmt.Printf("%#v\n", strings.Split("hoge,fuga,foo,bar", "AAA"))
	// => []string{"hoge,fuga,foo,bar"}

	fmt.Printf("%#v\n", strings.Split("hoge,fuga,foo,bar", ""))
	// => []string{"h", "o", "g", "e", ",", "f", "u", "g", "a", ",", "f", "o", "o", ",", "b", "a", "r"}

	fmt.Printf("%#v\n", strings.Split("", ""))
	// => []string{}
}
```

# SplitAfter(s, sep string) []string

`s` を `sep` の後で分割したスライスを返します。
`s` の中に `sep` が含まれていない場合は `s` のみを含む長さが 1 のスライスを返します。
`sep` が空文字の場合は `s` を UTF-8 文字ごとに分割したスライスを返します。
`s` と `sep` が両方とも空文字の場合は空のスライスを返します。

```go
package main

import (
	"fmt"
	"strings"
)

func main() {
	fmt.Printf("%#v\n", strings.SplitAfter("hoge-fuga-foo-bar", "-"))
	// => []string{"hoge-", "fuga-", "foo-", "bar"}

	fmt.Printf("%#v\n", strings.SplitAfter("hoge,fuga,foo,bar", "AAA"))
	// => []string{"hoge,fuga,foo,bar"}

	fmt.Printf("%#v\n", strings.SplitAfter("hoge,fuga,foo,bar", ""))
	// => []string{"h", "o", "g", "e", ",", "f", "u", "g", "a", ",", "f", "o", "o", ",", "b", "a", "r"}

	fmt.Printf("%#v\n", strings.SplitAfter("", ""))
	// => []string{}
}
```

# SplitAfterN(s, sep string, n int) []string

`s` を `sep` の後で分割したスライスを返します。
`n` は `s` を分割する数を設定します。
`n` に負の数を指定した場合は `SplitAfter` と同義です。

```go
package main

import (
	"fmt"
	"strings"
)

func main() {
	fmt.Printf("%#v\n", strings.SplitAfterN("hoge-fuga-foo-bar", "-", 2))
	// => []string{"hoge-", "fuga-foo-bar"}

	fmt.Printf("%#v\n", strings.SplitAfterN("hoge-fuga-foo-bar", "-", -1))
	// => []string{"hoge-", "fuga-", "foo-", "bar"}

	fmt.Printf("%#v\n", strings.SplitAfterN("hoge,fuga,foo,bar", "AAA", 2))
	// => []string{"hoge,fuga,foo,bar"}

	fmt.Printf("%#v\n", strings.SplitAfterN("hoge,fuga,foo,bar", "", 2))
	// => []string{"h", "oge,fuga,foo,bar"}

	fmt.Printf("%#v\n", strings.SplitAfterN("", "", 2))
	// => []string{}
}
```


# SplitN(s, sep string, n int) []string

`s` を `sep` で分割したスライスを返します。
`n` は `s` を分割する数を設定します。
`n` に負の数を指定した場合は `Split` と同義です。

```go
package main

import (
	"fmt"
	"strings"
)

func main() {
	fmt.Printf("%#v\n", strings.SplitN("hoge,fuga,foo,bar", ",", 2))
	// => []string{"hoge", "fuga,foo,bar"}

	fmt.Printf("%#v\n", strings.SplitN("hoge,fuga,foo,bar", ",", -1))
	// => []string{"hoge", "fuga", "foo", "bar"}

	fmt.Printf("%#v\n", strings.SplitN("hoge,fuga,foo,bar", "AAA", 2))
	// => []string{"hoge,fuga,foo,bar"}

	fmt.Printf("%#v\n", strings.SplitN("hoge,fuga,foo,bar", "", 2))
	// => []string{"h", "oge,fuga,foo,bar"}

	fmt.Printf("%#v\n", strings.SplitN("", "", 2))
	// => []string{}
}
```

# Title(s string) string

`s` をタイトルケースに変換した文字列を返します。

```go
package main

import (
	"fmt"
	"strings"
)

func main() {
	fmt.Println(strings.Title("hello world"))
	// => Hello World

	fmt.Println(strings.Title("hoge fuga foo bar"))
	// => Hoge Fuga Foo Bar
}
```

# ToLower(s string) string

`s` の文字を全て小文字に変換した文字列を返します。

```go
package main

import (
	"fmt"
	"strings"
)

func main() {
	fmt.Println(strings.ToLower("HELLO WORLD"))
	// => hello world

	fmt.Println(strings.ToLower("HOGE FUGA FOO BAR"))
	// => hoge fuga foo bar
}
```

# ToLowerSpecial(c unicode.SpecialCase, s string) string

`s` の文字を全てケースマッピング `c` を用いて小文字に変換した文字列を返します。

```go
package main

import (
	"fmt"
	"strings"
	"unicode"
)

func main() {
	fmt.Println(strings.ToLowerSpecial(unicode.TurkishCase, "Önnek İş"))
	// => önnek iş
}
```

# ToTitle(s string) string

`s` の文字を全てタイトルケースに変換した文字列を返します。

```go
package main

import (
	"fmt"
	"strings"
)

func main() {
	fmt.Println(strings.ToTitle("hello world"))
	// => HELLO WORLD

	fmt.Println(strings.ToTitle("hoge fuga foo bar"))
	// => HOGE FUGA FOO BAR
}
```

# ToTitleSpecial(c unicode.SpecialCase, s string) string

`s` の文字を全てケースマッピング `c` を用いてタイトルケースに変換した文字列を返します。

```go
package main

import (
	"fmt"
	"strings"
	"unicode"
)

func main() {
	fmt.Println(strings.ToTitleSpecial(unicode.TurkishCase, "önnek iş"))
	// => ÖNNEK İŞ
}
```

# ToUpper(s string) string

`s` の文字を全て大文字に変換した文字列を返します。

```go
package main

import (
	"fmt"
	"strings"
)

func main() {
	fmt.Println(strings.ToUpper("hello world"))
	// => HELLO WORLD

	fmt.Println(strings.ToUpper("hoge fuga foo bar"))
	// => HOGE FUGA FOO BAR
}
```

# ToUpperSpecial(c unicode.SpecialCase, s string) string

`s` の文字を全てケースマッピング `c` を用いて大文字に変換した文字列を返します。

```go
package main

import (
	"fmt"
	"strings"
	"unicode"
)

func main() {
	fmt.Println(strings.ToUpperSpecial(unicode.TurkishCase, "önnek iş"))
	// => ÖNNEK İŞ
}
```

# ToValidUTF8(s, replacement string) string

`s` の中の無効な UTF-8 バイトシーケンスを `replacement` に置換した文字列を返します。

```go
package main

import (
	"fmt"
	"strings"
)

func main() {
	fmt.Println(strings.ToValidUTF8("hello world", "  "))
	// => hello world

	fmt.Println(strings.ToValidUTF8("hello \xc5", "world"))
	// => hello world
}
```

# Trim(s, cutset string) string

`s` の先頭と末尾から `cutset` に含まれる Unicode コードポイントを除いた文字列を返します。

```go
package main

import (
	"fmt"
	"strings"
)

func main() {
	fmt.Println(strings.Trim("!!!@@@hello@!world!!!@@@", "@!"))
	// => hello@!world
}
```

# TrimFunc(s string, f func(rune) bool) string

`s` の先頭と末尾から `f` を満たす Unicode コードポイントを除いた文字列を返します。

```go
package main

import (
	"fmt"
	"strings"
)

func main() {
	f := func(r rune) bool {
		return r == '@'
	}

	fmt.Println(strings.TrimFunc("@@@hello@world@@@", f))
	// => hello@world
}
```

# TrimLeft(s, cutset string) string

`s` の先頭から `cutset` に含まれる Unicode コードポイントを除いた文字列を返します。

```go
package main

import (
	"fmt"
	"strings"
)

func main() {
	fmt.Println(strings.TrimLeft("!!!@@@hello@!world!!!@@@", "@!"))
	// => hello@!world!!!@@@
}
```

# TrimLeftFunc(s string, f func(rune) bool) string

`s` の先頭から `f` を満たす Unicode コードポイントを除いた文字列を返します。

```go
package main

import (
	"fmt"
	"strings"
)

func main() {
	f := func(r rune) bool {
		return r == '@'
	}

	fmt.Println(strings.TrimLeftFunc("@@@hello@world@@@", f))
	// => hello@world@@@
}
```

# TrimPrefix(s, prefix string) string

`s` から接頭辞 `prefix` を除いた文字列を返します。
`s` が `prefix` から始まらない場合は `s` をそのまま返します。

```go
package main

import (
	"fmt"
	"strings"
)

func main() {
	fmt.Println(strings.TrimPrefix("helloworld", "hello"))
	// => world

	fmt.Println(strings.TrimPrefix("helloworld", "world"))
	// => helloworld
}
```

# TrimRight(s, cutset string) string

`s` の末尾から `cutset` に含まれる Unicode コードポイントを除いた文字列を返します。

```go
package main

import (
	"fmt"
	"strings"
)

func main() {
	fmt.Println(strings.TrimRight("!!!@@@hello@!world!!!@@@", "@!"))
	// => !!!@@@hello@!world
}
```

# TrimRightFunc(s string, f func(rune) bool) string

`s` の末尾から `f` を満たす Unicode コードポイントを除いた文字列を返します。

```go
package main

import (
	"fmt"
	"strings"
)

func main() {
	f := func(r rune) bool {
		return r == '@'
	}

	fmt.Println(strings.TrimRightFunc("@@@hello@world@@@", f))
	// => @@@hello@world
}
```

# TrimSpace(s string) string

`s` の先頭と末尾から空白を除いた文字列を返します。

```go
package main

import (
	"fmt"
	"strings"
)

func main() {
	fmt.Printf("%#v\n", strings.TrimSpace(" 　\r\n\thello world\t\n\r　 "))
	// => "hello world"
}
```

# TrimSuffix(s, suffix string) string

`s` から接尾辞 `suffix` を除いた文字列を返します。
`s` が `suffix` で終わらない場合は `s` をそのまま返します。

```go
package main

import (
	"fmt"
	"strings"
)

func main() {
	fmt.Println(strings.TrimSuffix("helloworld", "world"))
	// => hello

	fmt.Println(strings.TrimSuffix("helloworld", "hello"))
	// => helloworld
}
```

# まとめ

結果として [公式ドキュメント](https://golang.org/pkg/strings/) の内容をほとんどそのまま写しただけみたいな記事になってしまいましたが、実際にコードを書いて動きを見てみることでいい勉強になりました。

# 参考

https://golang.org/pkg/strings/

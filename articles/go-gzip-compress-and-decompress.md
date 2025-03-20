---
title: "【Go】ファイルを gzip 圧縮・展開する"
emoji: "🎉"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["go"]
published: true
---

Go の標準ライブラリである `compress/gzip` を使用してファイルを gzip 圧縮・展開するサンプルコード。

# 圧縮

`hello.txt` を圧縮して `hello.txt.gz` を作成する。

```go
package main

import (
	"compress/gzip"
	"io"
	"os"
)

func main() {
	dist, err := os.Create("hello.txt.gz")
	if err != nil {
		panic(err)
	}
	defer dist.Close()

	// 第二引数で圧縮率を指定できる
	// 指定できる値については以下を参照
	// https://golang.org/pkg/compress/gzip/#pkg-constants
	gw, err := gzip.NewWriterLevel(dist, gzip.BestCompression)
	if err != nil {
		panic(err)
	}
	defer gw.Close()

	src, err := os.Open("hello.txt")
	if err != nil {
		panic(err)
	}
	defer src.Close()

	if _, err := io.Copy(gw, src); err != nil {
		panic(err)
	}
}
```

# 展開

`hello.txt.gz` を展開して `hello.txt` を作成する。

```go
package main

import (
	"compress/gzip"
	"io"
	"os"
)

func main() {
	dist, err := os.Create("hello.txt")
	if err != nil {
		panic(err)
	}
	defer dist.Close()

	src, err := os.Open("hello.txt.gz")
	if err != nil {
		panic(err)
	}
	defer src.Close()

	gr, err := gzip.NewReader(src)
	if err != nil {
		panic(err)
	}
	defer gr.Close()

	if _, err := io.Copy(dist, gr); err != nil {
		panic(err)
	}
}
```

# 参考

https://golang.org/pkg/compress/gzip/
https://38elements.github.io/2017/09/20/golang-gzip.html

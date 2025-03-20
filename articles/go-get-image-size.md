---
title: "【Go】画像のサイズを取得する"
emoji: "😎"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["go"]
published: true
---

Go の標準ライブラリである `image` を使用して画像のサイズを取得するサンプルコード。

# サンプルコード

```go:main.go
package main

import (
	"fmt"
	"os"

	"image"
	_ "image/jpeg" // NOTE: jpeg 画像を読み込むために必要
	// _ "image/gif" // NOTE: gif 画像を読み込むために必要(今回は使用しません)
	// _ "image/png" // NOTE: png 画像を読み込むために必要(今回は使用しません)
)

func main() {
	file, err := os.Open("./example.jpeg")
	if err != nil {
		panic(err)
	}
	defer file.Close()

	// 画像を読み込み
	img, _, err := image.Decode(file)
	if err != nil {
		panic(err)
	}

	// 幅 -> img.Bounds().Dx()
	// 高さ -> img.Bounds().Dy()
	fmt.Println("width:", img.Bounds().Dx())
	fmt.Println("height:", img.Bounds().Dy())
	// => width: 1200
	//    height: 800
}
```

# 参考

https://golang.org/pkg/image/

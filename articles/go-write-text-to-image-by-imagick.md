---
title: "【Go】imagick を使用して画像にテキストを書き込む"
emoji: "🌊"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["go"]
published: true
---

# imagick とは

Go で ImageMagick の機能が使えるようになるライブラリです。

> Go Imagick is a Go bind to ImageMagick's MagickWand C API.
> > [imagick/README\.md at master · gographics/imagick](https://github.com/gographics/imagick/blob/master/README.md)

# 準備

## ImageMagick をインストール

`imagick` は ImageMagick の MagickWand C API の Go バインドです。
そのため、別途 ImageMagick のインストールが必要です。
OS によってインストール方法は異なりますが、検索すれば詳しい記事が大量にあるためここでは割愛します。

## imagick をインストール

```
$ go get gopkg.in/gographics/imagick.v2/imagick
```

# サンプルコード

今回は以下の画像にテキストを書き込んでみる。

![before](https://storage.googleapis.com/zenn-user-upload/w93zwi9ns9s7ct3pnjxaaqvscazq)
*piyo.jpeg*

```go:main.go
package main

import (
	"log"

	"gopkg.in/gographics/imagick.v2/imagick"
)

func main() {
	// imagick を初期化
	imagick.Initialize()
	defer imagick.Terminate()

	// MagickWand, DrawingWand, PixelWand を作成
	mw := imagick.NewMagickWand()
	dw := imagick.NewDrawingWand()
	pw := imagick.NewPixelWand()

	// 画像を読み込み
	if err := mw.ReadImage("./piyo.jpeg"); err != nil {
		log.Fatal(err)
	}

	// フォントを設定
	if err := dw.SetFont("/Library/Fonts/Arial.ttf"); err != nil {
		log.Fatal(err)
	}

	// フォントサイズを設定
	dw.SetFontSize(24)

	// 書き込みの色を設定
	if ok := pw.SetColor("#ff0000"); !ok {
		log.Fatal("invalid color string")
	}
	dw.SetFillColor(pw)

	// テキストを書き込み
	// 引数は X 座標, Y 座標, テキスト の順
	dw.Annotation(100, 100, "Hello World")

	// 画像に反映
	if err := mw.DrawImage(dw); err != nil {
		log.Fatal(err)
	}

	// 書き出し
	if err := mw.WriteImage("out.jpeg"); err != nil {
		log.Fatal(err)
	}
}
```

```
$ go run main.go
```

出力された画像が以下。

![after](https://storage.googleapis.com/zenn-user-upload/27flyd9pbp6fgcwy35gwnakjoxns)
*out.jpeg*

# その他サンプルコード

以下に公式のサンプルコードがたくさんあります。

[imagick/examples at master · gographics/imagick](https://github.com/gographics/imagick/tree/master/examples)

# 参考

https://github.com/gographics/imagick
https://pkg.go.dev/github.com/gographics/imagick/imagick
https://blog.awm.jp/2017/01/02/goimagick/

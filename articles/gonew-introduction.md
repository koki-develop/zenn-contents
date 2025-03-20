---
title: "gonew を使って Go プロジェクトのテンプレートを活用する"
emoji: "🦔"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["golang"]
published: true
---

公式から gonew というツールが公開されました。

https://go.dev/blog/gonew

https://pkg.go.dev/golang.org/x/tools/cmd/gonew

gonew を使うことで既存の Go プロジェクトのテンプレートを使い、素早く開発を始めることができるようになります。
現時点で公式からは以下のテンプレートが公開されています。

- [hello](https://pkg.go.dev/golang.org/x/example/hello)
- [helloserver](https://pkg.go.dev/golang.org/x/example/helloserver)

他にも Google Cloud チームや Service Weaver チームからも様々なテンプレートが公開されています。

- [GoogleCloudPlatform/go-templates](https://github.com/GoogleCloudPlatform/go-templates)
- [ServiceWeaver/template](https://github.com/ServiceWeaver/template)

この記事では gonew のインストール方法から簡単な使い方を紹介します。

- [インストール](#インストール)
- [使い方](#使い方)
- [自分でテンプレートを作る](#自分でテンプレートを作る)
- [まとめ](#まとめ)

# インストール

`go install` を使用してインストールすることができます。

```sh
$ go install golang.org/x/tools/cmd/gonew@latest
```

```sh
$ gonew --help
usage: gonew srcmod[@version] [dstmod [dir]]
See https://pkg.go.dev/golang.org/x/tools/cmd/gonew.
```

# 使い方

## テンプレートを使用する

いくつか引数を指定して `gonew` コマンドを実行します。

- 第 1 引数には使用するテンプレートのモジュール名を指定します。
- 第 2 引数には作成するモジュール名を指定します ( 省略すると、テンプレートのモジュール名が使用されます ) 。
- 第 3 引数には出力先のディレクトリを指定します ( 省略すると、作成するモジュール名が使用されます ) 。

試しに [helloserver](https://pkg.go.dev/golang.org/x/example/helloserver) テンプレートを使用してみます。

```sh
$ gonew golang.org/x/example/helloserver example.com/myserver ./myserver
gonew: initialized example.com/myserver in ./myserver
```

`./myserver` ディレクトリに [helloserver](https://pkg.go.dev/golang.org/x/example/helloserver) の内容がコピーされました。

```sh
$ cd ./myserver
$ tree
.
├── go.mod
├── LICENSE
└── server.go
```

`go.mod` を見てみるとモジュール名が第 2 引数で指定したものになっていることが確認できます。

```go:go.mod
module example.com/myserver

go 1.19
```

その他のファイルの内容は下記をご覧ください。

:::details LICENSE

```
Copyright (c) 2009 The Go Authors. All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are
met:

   * Redistributions of source code must retain the above copyright
notice, this list of conditions and the following disclaimer.
   * Redistributions in binary form must reproduce the above
copyright notice, this list of conditions and the following disclaimer
in the documentation and/or other materials provided with the
distribution.
   * Neither the name of Google Inc. nor the names of its
contributors may be used to endorse or promote products derived from
this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
"AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
```

:::

:::details server.go

```go
// Copyright 2023 The Go Authors. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

// Hello is a simple hello, world demonstration web server.
//
// It serves version information on /version and answers
// any other request like /name by saying "Hello, name!".
//
// See golang.org/x/example/outyet for a more sophisticated server.
package main

import (
	"flag"
	"fmt"
	"html"
	"log"
	"net/http"
	"os"
	"runtime/debug"
	"strings"
)

func usage() {
	fmt.Fprintf(os.Stderr, "usage: helloserver [options]\n")
	flag.PrintDefaults()
	os.Exit(2)
}

var (
	greeting = flag.String("g", "Hello", "Greet with `greeting`")
	addr     = flag.String("addr", "localhost:8080", "address to serve")
)

func main() {
	// Parse flags.
	flag.Usage = usage
	flag.Parse()

	// Parse and validate arguments (none).
	args := flag.Args()
	if len(args) != 0 {
		usage()
	}

	// Register handlers.
	// All requests not otherwise mapped with go to greet.
	// /version is mapped specifically to version.
	http.HandleFunc("/", greet)
	http.HandleFunc("/version", version)

	log.Printf("serving http://%s\n", *addr)
	log.Fatal(http.ListenAndServe(*addr, nil))
}

func version(w http.ResponseWriter, r *http.Request) {
	info, ok := debug.ReadBuildInfo()
	if !ok {
		http.Error(w, "no build information available", 500)
		return
	}

	fmt.Fprintf(w, "<!DOCTYPE html>\n<pre>\n")
	fmt.Fprintf(w, "%s\n", html.EscapeString(info.String()))
}

func greet(w http.ResponseWriter, r *http.Request) {
	name := strings.Trim(r.URL.Path, "/")
	if name == "" {
		name = "Gopher"
	}

	fmt.Fprintf(w, "<!DOCTYPE html>\n")
	fmt.Fprintf(w, "%s, %s!\n", *greeting, html.EscapeString(name))
}
```

:::

`server.go` を実行してみます。

```sh
$ go run ./server.go
2023/08/01 20:57:26 serving http://localhost:8080
```

```sh
$ curl http://localhost:8080
<!DOCTYPE html>
Hello, Gopher!
```

シンプルな HTTP サーバーをすぐに動かせました。

## 自分でテンプレートを作る

テンプレートは自分で作ることも可能です。
とはいえ、作り方は通常の Go モジュールを作るのと変わりありません。

今回は試しに次のようなテンプレートを作ってみました。
中身を見てみるとなんの変哲もないただの Go モジュールであることが確認できます。

https://github.com/koki-develop/gonew-template-example

実際に gonew でこのテンプレートを使用してみます。

```sh
$ gonew github.com/koki-develop/gonew-template-example example.com/project
gonew: initialized example.com/project in ./project
```

テンプレートの内容がコピーされました。

```sh
$ cd ./project
$ tree
.
├── go.mod
├── LICENSE
└── main.go
```

動かしてみます。

```sh
$ go run ./main.go
Hello Template
```

動きました。

# まとめ

今はまだパッケージの中身をコピーするだけですが、 gonew は現在はまだプロトタイプなので意図的に最小限の機能のみ用意しているようです。
これからどのような機能が追加されていくのかが楽しみですね。

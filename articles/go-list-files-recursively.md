---
title: "【Go】特定のディレクトリ内のファイル一覧を再帰的に取得する"
emoji: "💨"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["go"]
published: true
---

今回検証するディレクトリ構造はこんな感じ。
`dir/` ディレクトリ配下のファイル一覧を再帰的に取得する。

```
$ tree
.
├── dir
│   ├── AAA
│   │   ├── BBB
│   │   │   └── bbb.txt
│   │   └── aaa.txt
│   └── CCC
│       └── ccc.txt
└── main.go
```

# サンプルコード

`path/filepath` パッケージの `Walk()` を使用すると非常に楽に実装できる。
第一引数にファイル一覧を取得するディレクトリパス、第二引数にそれぞれのファイル or ディレクトリの情報を受け取るコールバック関数を指定する。
コールバック関数には `os.FileInfo` も渡されるので、ファイルの詳しい情報を取得したい場合にはこれを使えばいい。

```go:main.go
package main

import (
	"fmt"
	"os"
	"path/filepath"
)

func main() {
	err := filepath.Walk("dir", func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}

		// 特定のディレクトリを無視したい場合は `filepath.SkipDir` を返す
		// 例えば `AAA` という名前のディレクトリを無視する場合は以下のようにする
		// if info.IsDir() && info.Name() == "AAA" {
		// 	return filepath.SkipDir
		// }

		fmt.Printf("path: %#v\n", path)
		return nil
	})

	if err != nil {
		panic(err)
	}
}
```

```sh:出力例
$ go run main.go
path: "dir"
path: "dir/AAA"
path: "dir/AAA/BBB"
path: "dir/AAA/BBB/bbb.txt"
path: "dir/AAA/aaa.txt"
path: "dir/CCC"
path: "dir/CCC/ccc.txt"
```

# 参考

https://golang.org/pkg/path/filepath/#Walk
https://yourbasic.org/golang/list-files-in-directory/

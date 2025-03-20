---
title: "【Go】tar ファイルを作成する"
emoji: "🌟"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["go"]
published: true
---

今回検証するディレクトリ構造はこんな感じ。
`dir/` ディレクトリ配下のファイル群を tar ファイルにまとめて、 `dist/` ディレクトリに出力する。

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
├── dist
└── main.go
```

# サンプルコード

```go
package main

import (
	"archive/tar"
	"io"
	"os"
	"path/filepath"
)

func main() {
	dist, err := os.Create("dist/archive.tar")
	if err != nil {
		panic(err)
	}
	defer dist.Close()

	tw := tar.NewWriter(dist)
	defer tw.Close()

	// 再帰的にファイルを取得する
	if err := filepath.Walk("./dir", func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}

		// ディレクトリは無視
		if info.IsDir() {
			return nil
		}

		// ヘッダを書き込み
		if err := tw.WriteHeader(&tar.Header{
			Name:    path,
			Mode:    int64(info.Mode()),
			ModTime: info.ModTime(),
			Size:    info.Size(),
		}); err != nil {
			return err
		}

		// ファイルを書き込み
		f, err := os.Open(path)
		if err != nil {
			return err
		}
		defer f.Close()
		if _, err := io.Copy(tw, f); err != nil {
			return err
		}

		return nil
	}); err != nil {
		panic(err)
	}
}
```

```sh:実行例
# 実行
$ go run main.go

# `archive.tar` が作成されているか確認
$ ls dist
archive.tar

# 展開して中身を確認
$ tar -xvf dist/archive.tar -C dist
x dir/AAA/BBB/bbb.txt
x dir/AAA/aaa.txt
x dir/CCC/ccc.txt

# いい感じ！
$ tree dist
dist
├── archive.tar
└── dir
    ├── AAA
    │   ├── BBB
    │   │   └── bbb.txt
    │   └── aaa.txt
    └── CCC
        └── ccc.txt
```

## tar.gz にしたい場合

`gzip.Writer` を挟めばいい。

```diff:main.go
package main

import (
	"archive/tar"
+	"compress/gzip"
	"io"
	"os"
	"path/filepath"
)

func main() {
-	dist, err := os.Create("dist/archive.tar")
+	dist, err := os.Create("dist/archive.tar.gz")
	if err != nil {
		panic(err)
	}
	defer dist.Close()

-	tw := tar.NewWriter(dist)
+	gw := gzip.NewWriter(dist)
+	defer gw.Close()
+
+	tw := tar.NewWriter(gw)
	defer tw.Close()

	// 再帰的にファイルを取得する
	if err := filepath.Walk("./dir", func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}

		// ディレクトリは無視
		if info.IsDir() {
			return nil
		}

		// ヘッダを書き込み
		if err := tw.WriteHeader(&tar.Header{
			Name:    path,
			Mode:    int64(info.Mode()),
			ModTime: info.ModTime(),
			Size:    info.Size(),
		}); err != nil {
			return err
		}

		// ファイルを書き込み
		f, err := os.Open(path)
		if err != nil {
			return err
		}
		defer f.Close()
		if _, err := io.Copy(tw, f); err != nil {
			return err
		}

		return nil
	}); err != nil {
		panic(err)
	}
}
```

# 参考

https://golang.org/pkg/compress/gzip/
https://golang.org/pkg/archive/tar/
https://zenn.dev/kou_pg_0131/articles/go-list-files-recursively
https://zenn.dev/kou_pg_0131/articles/go-gzip-compress-and-decompress
https://38elements.github.io/2017/09/20/golang-gzip.html
https://www.ohitori.fun/entry/how-to-make-tar-file-in-golang

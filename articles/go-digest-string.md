---
title: "【Go】文字列のハッシュ値を取得する ( MD5, SHA, RMD160 )"
emoji: "🐕"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["go"]
published: true
---

Go の標準ライブラリである `crypto` を使用して文字列のハッシュ値を取得するサンプルコード。

# サンプルコード

```go
package main

import (
	"crypto/md5"
	"crypto/sha1"
	"crypto/sha256"
	"crypto/sha512"
	"fmt"
	"io"

	"golang.org/x/crypto/ripemd160"
)

func main() {
	p := []byte("password")

	md5 := md5.Sum(p)
	sha1 := sha1.Sum(p)
	sha256 := sha256.Sum256(p)
	sha384 := sha512.Sum384(p)
	sha512 := sha512.Sum512(p)

	// rmd160 はひと手間必要
	rmd160 := ripemd160.New()
	io.WriteString(rmd160, string(p))

	fmt.Println("md5:    " + fmt.Sprintf("%x", md5))
	fmt.Println("sha1:   " + fmt.Sprintf("%x", sha1))
	fmt.Println("sha256: " + fmt.Sprintf("%x", sha256))
	fmt.Println("sha384: " + fmt.Sprintf("%x", sha384))
	fmt.Println("sha512: " + fmt.Sprintf("%x", sha512))
	fmt.Println("rmd160: " + fmt.Sprintf("%x", rmd160.Sum(nil)))
	// => md5:    5f4dcc3b5aa765d61d8327deb882cf99
	//    sha1:   5baa61e4c9b93f3f0682250b6cf8331b7ee68fd8
	//    sha256: 5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8
	//    sha384: a8b64babd0aca91a59bdbb7761b421d4f2bb38280d3a75ba0f21f2bebc45583d446c598660c94ce680c47d19c30783a7
	//    sha512: b109f3bbbc244eb82441917ed06d618b9008dd09b3befd1b5e07394c706a8bb980b1d7785e5976ec049b46df5f1326af5a2ea6d103fd07c95385ffab0cacbc86
	//    rmd160: 2c08e8f5884750a7b99f6f2f342fc638db25ff31
}
```

https://play.golang.org/p/ni7rfd-ceb7

# 参考

https://golang.org/pkg/crypto/#pkg-overview
https://qiita.com/curious-eyes/items/abb29e1a06ac5bc2c5f2

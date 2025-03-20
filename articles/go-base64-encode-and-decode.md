---
title: "【Go】Base64 エンコード・デコード"
emoji: "👏"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["go"]
published: true
---

Go の標準ライブラリである `encoding/base64` を使用して文字列を Base64 エンコード・デコードするサンプルコード。

# エンコード

```go
package main

import (
	"encoding/base64"
	"fmt"
)

func main() {
	src := []byte("Hello World")

	enc := base64.StdEncoding.EncodeToString(src)

	fmt.Println(enc)
	// => SGVsbG8gV29ybGQ=
}
```

https://play.golang.org/p/DXpcfwzbD4t

# デコード

```go
package main

import (
	"encoding/base64"
	"fmt"
	"log"
)

func main() {
	src := "SGVsbG8gV29ybGQ="

	dec, err := base64.StdEncoding.DecodeString(src)
	if err != nil {
		log.Fatal(err)
	}

	fmt.Println(string(dec))
	// => Hello World
}
```

https://play.golang.org/p/l_UvN-GIH_d

# 参考

https://www.spinute.org/go-by-example/base64-encoding.html
https://pkg.go.dev/encoding/base64

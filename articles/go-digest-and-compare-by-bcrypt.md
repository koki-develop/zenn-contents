---
title: "【Go】bcrypt を使ってパスワードのハッシュ値を生成して検証する"
emoji: "🌟"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["go"]
published: true
---

# サンプルコード

```go
package main

import (
	"fmt"

	"golang.org/x/crypto/bcrypt"
)

func main() {
	password := []byte("password")

	// `GenerateFromPassword` でパスワードをハッシュ化する。
	// 第2引数はコストを指定する。値は 4 ~ 31 の範囲である必要がある。
	// コストについてはこの記事がわかりやすい。 → https://qiita.com/istsh/items/ca330d27fe51a6bf7a3d#2-%E3%82%B3%E3%82%B9%E3%83%88%E3%81%AE%E6%8C%87%E5%AE%9A
	hashed, _ := bcrypt.GenerateFromPassword(password, 10)
	fmt.Println(string(hashed))
	// => $2a$10$P9Zr9LES1Yv/n6k77pDy0OVwCRBeHRhHsFMQyU6GfkfpOXfHOPjgG

	// `CompareHashAndPassword` でパスワードを検証する。
	// パスワードが正しい場合は nil を返す。
	err := bcrypt.CompareHashAndPassword(hashed, password)
	fmt.Println(err)
	// => <nil>

	// パスワードが間違っている場合は `bcrypt.ErrMismatchedHashAndPassword` を返す。
	err = bcrypt.CompareHashAndPassword(hashed, []byte("INCORRECT_PASSWORD"))
	fmt.Println(err == bcrypt.ErrMismatchedHashAndPassword)
	// => true
}
```

https://play.golang.org/p/kfzCrNTJ3dB

# 参考

https://pkg.go.dev/golang.org/x/crypto/bcrypt

---
title: "【Go】日時と Unix 時刻の相互変換"
emoji: "🗂"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["go"]
published: true
---

```go
package main

import (
	"fmt"
	"time"
)

func main() {
	// 現在日時を取得
	dt := time.Now()
	fmt.Println(dt)
	// => 2021-01-22 08:28:55.300846 +0900 JST m=+0.000052154

	// Unix 時刻を取得
	unix := dt.Unix()
	fmt.Println(unix)
	// => 1611271735

	// ナノ秒単位で Unix 時刻を取得
	nunix := dt.UnixNano()
	fmt.Println(nunix)
	// => 1611271735300846000

	// Unix 時刻を日時に変換
	dtFromUnix := time.Unix(unix, 0)
	fmt.Println(dtFromUnix)
	// => 2021-01-22 08:28:55 +0900 JST

	// ナノ秒単位の Unix 時刻を日時に変換
	dtFromUnixNano := time.Unix(nunix/1000000000, nunix%1000000000)
	fmt.Println(dtFromUnixNano)
	// => 2021-01-22 08:28:55.300846 +0900 JST
}
```

# 参考

https://golang.org/pkg/time/
https://qiita.com/wMETAw/items/2c3120d1338c646ecfba#unix%E6%99%82%E5%88%BB%E3%81%A8%E3%81%AE%E7%9B%B8%E4%BA%92%E5%A4%89%E6%8F%9B

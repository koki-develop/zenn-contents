---
title: "【Go】AWS S3 オブジェクトのアップロード・ダウンロード"
emoji: "👏"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["go", "aws", "s3"]
published: true
---

[aws-sdk-go](https://github.com/aws/aws-sdk-go) を使用して S3 オブジェクトをアップロード・ダウンロードするサンプルコード。

# 準備

```
$ go get github.com/aws/aws-sdk-go
```

# サンプルコード

`s3` パッケージをそのまま使ってもいいが、 `s3manager` パッケージの方が内部的に色々面倒見てくれて便利。

## アップロード

```go:main.go
package main

import (
	"strings"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/s3/s3manager"
)

func main() {
	// s3manager.Uploader を初期化
	// リージョン、プロファイル名は適宜書き換えてください
	sess, err := session.NewSessionWithOptions(session.Options{
		Config:  aws.Config{Region: aws.String("ap-northeast-1")},
		Profile: "default",
	})
	if err != nil {
		panic(err)
	}
	u := s3manager.NewUploader(sess)

	// アップロードするデータを用意
	data := strings.NewReader(`{"message": "hello world"}`)
	// ローカルのファイルをアップロードする場合は以下のようにする
	// data, err := os.Open("example.json")
	// if err != nil {
	// 	panic(err)
	// }
	// defer data.Close()

	// バケット名とオブジェクトのパスを指定してアップロード
	_, err = u.Upload(&s3manager.UploadInput{
		Bucket:      aws.String("bucket-name"),
		Body:        aws.ReadSeekCloser(data),
		Key:         aws.String("path/to/file"),
		ContentType: aws.String("application/json"),
	})
	if err != nil {
		panic(err)
	}
}
```

## ダウンロード

```go:main.go
package main

import (
	"bytes"
	"fmt"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/s3"
	"github.com/aws/aws-sdk-go/service/s3/s3manager"
)

func main() {
	// s3manager.Downloader を初期化
	// リージョン、プロファイル名は適宜書き換えてください
	sess, err := session.NewSessionWithOptions(session.Options{
		Config:  aws.Config{Region: aws.String("ap-northeast-1")},
		Profile: "default",
	})
	if err != nil {
		panic(err)
	}
	d := s3manager.NewDownloader(sess)

	// 書き込み先を用意
	buf := aws.NewWriteAtBuffer([]byte{})
	// ローカルにダウンロードする場合は以下のようにする
	// buf, err := os.Create("example.json")
	// if err != nil {
	// 	panic(err)
	// }
	// defer buf.Close()

	// バケット名とオブジェクトのパスを指定してダウンロード
	_, err = d.Download(buf, &s3.GetObjectInput{
		Bucket: aws.String("bucket-name"),
		Key:    aws.String("path/to/file"),
	})
	if err != nil {
		panic(err)
	}

	// aws.NewWriteAtBuffer() を使用した場合は bytes.NewBuffer() で中身を読み込むことができる
	data := bytes.NewBuffer(buf.Bytes()).String()
	fmt.Println(data)
}
```

# 参考

https://docs.aws.amazon.com/sdk-for-go/api/service/s3/s3manager/

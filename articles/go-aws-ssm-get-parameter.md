---
title: "【Go】AWS SSM パラメータストアからパラメータを取得する"
emoji: "🙆"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["go", "aws", "ssm"]
published: true
---

[aws-sdk-go](https://github.com/aws/aws-sdk-go) を使用して SSM パラメータストアからパラメータを取得するサンプルコード。

# 準備

```
$ go get github.com/aws/aws-sdk-go
```

# サンプルコード

```go
package main

import (
	"fmt"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/ssm"
)

func main() {
	// リージョン、プロファイル名は適宜書き換えてください
	sess, err := session.NewSessionWithOptions(session.Options{
		Config:  aws.Config{Region: aws.String("us-east-1")},
		Profile: "default",
	})
	if err != nil {
		panic(err)
	}
	svc := ssm.New(sess)

	res, err := svc.GetParameter(&ssm.GetParameterInput{
		Name: aws.String("PARAMETER_NAME"),
		// `WithDecryption` を true にすれば、パラメータが暗号化している場合に復号して取得します
		// 平文のパラメータはそのまま取得するので、基本的には true でいいです
		WithDecryption: aws.Bool(false),
	})
	if err != nil {
		panic(err)
	}

	fmt.Printf("%#v\n", res)
	// => {
	//      Parameter: {
	//        ARN: "arn:aws:ssm:us-east-1:xxxxxxxxxxxx:parameter/PARAMETER_NAME",
	//        DataType: "text",
	//        LastModifiedDate: 2020-01-13 00:12:55.124 +0000 UTC,
	//        Name: "PARAMETER_NAME",
	//        Type: "SecureString",
	//        Value: "PARAMETER_VALUE",
	//        Version: 1
	//      }
	//    }

	fmt.Printf("%#v\n", *res.Parameter.Value)
	// => "PARAMETER_VALUE"
}
```

# 参考

https://docs.aws.amazon.com/sdk-for-go/api/service/ssm/

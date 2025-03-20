---
title: "【AWS CLI】リージョン一覧を出力する"
emoji: "😎"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["aws", "awscli"]
published: true
---

# 検証環境

- aws-cli 2.2.29

# 有効になっているリージョンの一覧を出力する

`ec2 describe-regions` で有効になっているリージョンの一覧を出力できる。

```sh:コマンド
$ aws ec2 describe-regions
```

`OptInStatus` については[後述](#optinstatus-について)。

```json:出力
{
    "Regions": [
        {
            "Endpoint": "ec2.eu-north-1.amazonaws.com",
            "RegionName": "eu-north-1",
            "OptInStatus": "opt-in-not-required"
        },
        {
            "Endpoint": "ec2.ap-south-1.amazonaws.com",
            "RegionName": "ap-south-1",
            "OptInStatus": "opt-in-not-required"
        },
        ... // 省略
    ]
}
```

# 無効になっているリージョンも含めて出力する

`--all-regions` フラグをつけることで無効になっているリージョンも含めた全てのリージョンを出力する。

```sh:コマンド
aws ec2 describe-regions --all-regions
```

```json:出力
{
    "Regions": [
        {
            "Endpoint": "ec2.af-south-1.amazonaws.com",
            "RegionName": "af-south-1",
            "OptInStatus": "not-opted-in"
        },
        {
            "Endpoint": "ec2.eu-north-1.amazonaws.com",
            "RegionName": "eu-north-1",
            "OptInStatus": "opt-in-not-required"
        },
        ... // 省略
    ]
}
```

# `OptInStatus` について

値の意味については以下の表の通り。

| 値 | 説明 |
| --- | --- |
| opt-in-not-required | デフォルトで有効になっているリージョン |
| opted-in | 有効になっているリージョン |
| not-opted-in | 無効になっているリージョン |

# 参考

https://docs.aws.amazon.com/cli/latest/reference/ec2/describe-regions.html
https://docs.aws.amazon.com/ja_jp/general/latest/gr/rande-manage.html

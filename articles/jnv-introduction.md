---
title: "JSON をプレビューしながら jq のフィルタを書くことができる「jnv」を試してみる"
emoji: "🔍"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["jnv", "json", "jq"]
published: true
published_at: 2024-03-25 18:00
---

https://bsky.app/profile/matsuu.bsky.social/post/3koajaoxxwd2x

見かけて超便利そうだったので試してみました。

https://github.com/ynqa/jnv

# インストール

`brew install` でインストールできます。

```sh
$ brew install ynqa/tap/jnv
```

:::message

ちなみに `jq` がインストールされている必要はありません。

> *jnv* does not require users to install `jq` on their system, because it utilizes [j9](https://github.com/ynqa/j9) Rust bindings.
> > https://github.com/ynqa/jnv#installation

:::

# 使い方

:::details jnv --help

```sh
$ jnv --help
```

```:出力
JSON navigator and interactive filter leveraging jq

Usage: jnv [OPTIONS] [INPUT]

Examples:
- Read from a file:
        jnv data.json

- Read from standard input:
        cat data.json | jnv

Arguments:
  [INPUT]
          Optional path to a JSON file. If not provided or if "-" is specified, reads from standard input

Options:
  -e, --edit-mode <EDIT_MODE>

                  Specifies the edit mode for the interface.
                  Acceptable values are "insert" or "overwrite".
                  - "insert" inserts a new input at the cursor's position.
                  - "overwrite" mode replaces existing characters with new input at the cursor's position.


          [default: insert]

  -i, --indent <INDENT>

                  Affect the formatting of the displayed JSON,
                  making it more readable by adjusting the indentation level.


          [default: 2]

  -n, --no-hint

                  When this option is enabled, it prevents the display of
                  hints that typically guide or offer suggestions to the user.


  -d, --expand-depth <EXPAND_DEPTH>

                  Specifies the initial depth to which JSON nodes are expanded in the visualization.
                  Note: Increasing this depth can significantly slow down the display for large datasets.


          [default: 3]

  -l, --suggestion-list-length <SUGGESTION_LIST_LENGTH>

                  Controls the number of suggestions displayed in the list,
                  aiding users in making selections more efficiently.


          [default: 3]

  -h, --help
          Print help (see a summary with '-h')

  -V, --version
          Print version
```

:::

JSON データをファイルもしくは標準入力から `jnv` に読み込ませるだけです。

```sh
# ファイルから読み込む
$ jnv data.json

# 標準入力から読み込む
$ cat data.json | jnv
```

実行するとインタラクティブな UI が起動します。

# 試してみる

実際に試してみます。
今回は [DummyJSON](https://dummyjson.com/) で生成したダミーデータを使用します。

https://dummyjson.com

:::details 今回使用する JSON データ

https://dummyjson.com/users

```json
{
  "users": [
    {
      "id": 1,
      "firstName": "Terry",
      "lastName": "Medhurst",
      "maidenName": "Smitham",
      "age": 50,
      "gender": "male",
      "email": "atuny0@sohu.com",
      "phone": "+63 791 675 8914",
      "username": "atuny0",
      "password": "9uQFF1Lh",
      "birthDate": "2000-12-25",
      "image": "https://robohash.org/Terry.png?set=set4",
      "bloodGroup": "A-",
      "height": 189,
      "weight": 75.4,
      "eyeColor": "Green",
      "hair": {
        "color": "Black",
        "type": "Strands"
      },
      "domain": "slashdot.org",
      "ip": "117.29.86.254",
      "address": {
        "address": "1745 T Street Southeast",
        "city": "Washington",
        "coordinates": {
          "lat": 38.867033,
          "lng": -76.979235
        },
        "postalCode": "20020",
        "state": "DC"
      },
      "macAddress": "13:69:BA:56:A3:74",
      "university": "Capitol University",
      "bank": {
        "cardExpire": "06/22",
        "cardNumber": "50380955204220685",
        "cardType": "maestro",
        "currency": "Peso",
        "iban": "NO17 0695 2754 967"
      },
      "company": {
        "address": {
          "address": "629 Debbie Drive",
          "city": "Nashville",
          "coordinates": {
            "lat": 36.208114,
            "lng": -86.58621199999999
          },
          "postalCode": "37076",
          "state": "TN"
        },
        "department": "Marketing",
        "name": "Blanda-O'Keefe",
        "title": "Help Desk Operator"
      },
      "ein": "20-9487066",
      "ssn": "661-64-2976",
      "userAgent": "Mozilla/5.0 (Windows NT 6.1) AppleWebKit/534.24 (KHTML, like Gecko) Chrome/12.0.702.0 Safari/534.24",
      "crypto": {
        "coin": "Bitcoin",
        "wallet": "0xb9fc2fe63b2a6c003f1c324c3bfa53259162181a",
        "network": "Ethereum (ERC20)"
      }
    },
    {
      "id": 2,
      "firstName": "Sheldon",
      "lastName": "Quigley",
      "maidenName": "Cole",
      "age": 28,
      "gender": "male",
      "email": "hbingley1@plala.or.jp",
      "phone": "+7 813 117 7139",
      "username": "hbingley1",
      "password": "CQutx25i8r",
      "birthDate": "2003-08-02",
      "image": "https://robohash.org/Sheldon.png?set=set4",
      "bloodGroup": "O+",
      "height": 187,
      "weight": 74,
      "eyeColor": "Brown",
      "hair": {
        "color": "Blond",
        "type": "Curly"
      },
      "domain": "51.la",
      "ip": "253.240.20.181",
      "address": {
        "address": "6007 Applegate Lane",
        "city": "Louisville",
        "coordinates": {
          "lat": 38.1343013,
          "lng": -85.6498512
        },
        "postalCode": "40219",
        "state": "KY"
      },
      "macAddress": "13:F1:00:DA:A4:12",
      "university": "Stavropol State Technical University",
      "bank": {
        "cardExpire": "10/23",
        "cardNumber": "5355920631952404",
        "cardType": "mastercard",
        "currency": "Ruble",
        "iban": "MD63 L6YC 8YH4 QVQB XHIK MTML"
      },
      "company": {
        "address": {
          "address": "8821 West Myrtle Avenue",
          "city": "Glendale",
          "coordinates": {
            "lat": 33.5404296,
            "lng": -112.2488391
          },
          "postalCode": "85305",
          "state": "AZ"
        },
        "department": "Services",
        "name": "Aufderhar-Cronin",
        "title": "Senior Cost Accountant"
      },
      "ein": "52-5262907",
      "ssn": "447-08-9217",
      "userAgent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/534.30 (KHTML, like Gecko) Ubuntu/11.04 Chromium/12.0.742.112 Chrome/12.0.742.112 Safari/534.30",
      "crypto": {
        "coin": "Bitcoin",
        "wallet": "0xb9fc2fe63b2a6c003f1c324c3bfa53259162181a",
        "network": "Ethereum (ERC20)"
      }
    },
    // ...
  ],
  "total": 100,
  "skip": 0,
  "limit": 30
}
```

:::

```sh:実行するコマンド
$ curl -s https://dummyjson.com/users | jnv
```

## 簡単な例

こんな感じで、実際のデータをプレビューしながら jq のフィルタを書くことができます。
構文にエラーがある場合はエラーメッセージが表示されます。

![](/images/jnv-introduction/basic.gif)

## パイプを使用する例

もちろんパイプ等を使用した複雑なフィルタも書けます。

![](/images/jnv-introduction/pipe.gif)

## 補完

Tab キーによる補完機能も実装されています。すごい。

![](/images/jnv-introduction/completion.gif)

# まとめ

jq のフィルタを書くときのつらみがかなり軽減されそうですね。超便利。

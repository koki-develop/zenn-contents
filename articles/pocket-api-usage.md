---
title: "Pocket API を使ってアイテムの追加・編集・取得を行う"
emoji: "📝"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["pocket", "api"]
published: true
---

Pocket のアクセストークンを発行して API を叩くまでの手順メモ。

# 準備

## 1. Application を作成

まずは Application を作成する必要があります。
Pocket にログインしていない場合はログインしてください。

[Application 作成画面](https://getpocket.com/developer/apps/new)にアクセスします。
次の項目をそれぞれ入力します。

| 項目 | 説明 |
| --- | --- |
| Application Name | 任意のアプリケーション名。 |
| Application Description | アプリケーションの説明文。 |
| Permissions | アプリケーションの権限。<br/>`Add`: アイテム追加<br/>`Modify`: アイテム編集 ( アーカイブ、お気に入り、削除、 etc. )<br/>`Retrieve`: アイテム取得 |
| Platform | プラットフォーム。<br/>どれを選んでも特に挙動変わらなかったのでとりあえず `Web` を選んでおけばいいと思います。 |

各項目を入力したら `I accept the Terms of Service.` にチェックして `CREATE APPLICATION` をクリックすればアプリケーションが作成されます。

![](/images/pocket-api-usage/create-app.png)

アプリケーションが作成されると CONSUMER KEY が発行されます ( 今回の場合は `103885-6d75a5f5dd05c16a8da9120` ) 。
こちらは後で必要になるため、控えておいてください。

![](/images/pocket-api-usage/created-app.png)

## 2. アクセストークンを発行する

先程作成したアプリケーションを使用してアクセストークンを発行します。

### 2.1 認可コードを発行する

まず最初に認可コードを発行します。
次のように `consumer_key` パラメータと `redirect_uri` パラメータを指定して `https://getpocket.com/v3/oauth/request` にアクセスします。

```txt
https://getpocket.com/v3/oauth/request?consumer_key=CONSUMER_KEY&redirect_uri=https://example.com
```

| パラメータ | 説明 |
| --- | --- |
| `consumer_key` | 「[1. Application を作成](#1.-application-を作成)」の手順で発行された CONSUMER KEY 。<br/>今回の場合は `103885-6d75a5f5dd05c16a8da9120` 。 |
| `redirect_uri` | 適当な URL ( なんでもいいです ) 。<br/>今回は `https://example.com` にしておきます。 |

```sh:curl を使用する例
$ curl 'https://getpocket.com/v3/oauth/request?consumer_key=103885-6d75a5f5dd05c16a8da9120&redirect_uri=https://example.com'
```

成功すると次のように認可コード ( 今回の場合は `e7e15b30-d669-50a6-5e9d-b77692` ) を含むレスポンスが返されます。

```txt:出力例
code=e7e15b30-d669-50a6-5e9d-b77692
```

### 2.2 認可する

先程発行された認可コードを使って認可を行います。
**ブラウザから**次のように `request_token` パラメータと `redirect_uri` パラメータを指定して `https://getpocket.com/auth/authorize` にアクセスします。

```txt
https://getpocket.com/auth/authorize?request_token=AUTHORIZATION_CODE&redirect_uri=https://example.com
```

| パラメータ | 説明 |
| --- | --- |
| `request_token` | 「[2.1 認可コードを発行する](#2.1-認可コードを発行する)」の手順で発行された認可コード。<br/>今回の場合は `e7e15b30-d669-50a6-5e9d-b77692` 。 |
| `redirect_uri` | 適当な URL ( なんでもいいです ) 。<br/>今回は `https://example.com` にしておきます。 |

アクセスすると認可画面が表示されるので、 `認可` をクリックして認可します。
成功すると `redirect_uri` パラメータで指定した URL にリダイレクトされます。

![](/images/pocket-api-usage/authorization.png)

### 2.3 アクセストークンを発行する

最後にアクセストークンを発行します。
次のように `consumer_key` パラメータと `code` パラメータを指定して `https://getpocket.com/v3/oauth/authorize` にアクセスします。

```txt
https://getpocket.com/v3/oauth/authorize?consumer_key=CONSUMER_KEY&code=AUTHORIZATION_CODE
```

| パラメータ | 説明 |
| --- | --- |
| `consumer_key` | 「[1. Application を作成](#1.-application-を作成)」の手順で発行された CONSUMER KEY 。<br/>今回の場合は `103885-6d75a5f5dd05c16a8da9120` 。 |
| `code` | 「[2.1 認可コードを発行する](#2.1-認可コードを発行する)」の手順で発行された認可コード。<br/>今回の場合は `e7e15b30-d669-50a6-5e9d-b77692` 。 |

```sh:curl を使用する例
$ curl 'https://getpocket.com/v3/oauth/authorize?consumer_key=103885-6d75a5f5dd05c16a8da9120&code=e7e15b30-d669-50a6-5e9d-b77692'
```

成功すると次のようにアクセストークン ( 今回の場合は `99b1dcdf-7c0a-8f00-bce7-647695` ) を含むレスポンスが返されます。

```txt
access_token=99b1dcdf-7c0a-8f00-bce7-647695&username=kou-pg-0131
```

:::message
もしここで 500 エラーレスポンスが返された場合は、「[2. アクセストークンを発行する](#2.-アクセストークンを発行する)」手順をもう一度やり直すとうまくいくかもしれません。
僕が検証していたときは最初は必ずここで 500 エラーレスポンスが返され、もう一度やり直すと成功するという謎の挙動がありました。
:::

これでアクセストークンが発行できました。

# API を叩いてみる

実際にアクセストークンを使って API を叩いてみます。

## アイテムを追加する

`https://getpocket.com/v3/add` エンドポイントでアイテムの追加を実行できます。
必須のパラメータは次の通りです。

| パラメータ | 説明 |
| --- | --- |
| `url` | 追加するアイテムの URL 。 |
| `consumer_key` | 「[1. Application を作成](#1.-application-を作成)」の手順で発行された CONSUMER KEY 。<br/>今回の場合は `103885-6d75a5f5dd05c16a8da9120` 。 |
| `access_token` | 「[2. アクセストークンを発行する](#2.-アクセストークンを発行する)」の手順で発行されたアクセストークン。<br/>今回の場合は `99b1dcdf-7c0a-8f00-bce7-647695` 。 |

以下は `https://example.com` を Pocket に追加する例です。

```sh:curl を使用する例
$ curl -X POST 'https://getpocket.com/v3/add' \
    -d consumer_key=103885-6d75a5f5dd05c16a8da9120 \
    -d access_token=99b1dcdf-7c0a-8f00-bce7-647695 \
    -d url=https://example.com
```

成功すると追加したアイテムの情報を含むレスポンスが返されます。

```json:出力例
{
  "item": {
    "item_id": "1502819",
    "normal_url": "http://example.com",
    "resolved_id": "1502819",
    "extended_item_id": "1502819",
    "resolved_url": "https://example.com/",
    "domain_id": "85964",
    "origin_domain_id": "1809242",
    "response_code": "200",
    "mime_type": "text/html",
    "content_length": "648",
    "encoding": "utf-8",
    "date_resolved": "2022-09-20 20:57:15",
    "date_published": "0000-00-00 00:00:00",
    "title": "Example Domain",
    "excerpt": "This domain is for use in illustrative examples in documents. You may use this domain in literature without prior coordination or asking for permission. More information...",
    "word_count": "28",
    "innerdomain_redirect": "1",
    "login_required": "0",
    "has_image": "0",
    "has_video": "0",
    "is_index": "1",
    "is_article": "0",
    "used_fallback": "1",
    "lang": "",
    "time_first_parsed": "0",
    "authors": [],
    "images": [],
    "videos": [],
    "resolved_normal_url": "http://example.com",
    "given_url": "https://example.com"
  },
  "status": 1
}
```

その他詳しい使い方については公式ドキュメントをご参照ください。

https://getpocket.com/developer/docs/v3/add

## アイテムを取得する

`https://getpocket.com/v3/get` エンドポイントでアイテムの追加を実行できます。
必須のパラメータは次の通りです。

| パラメータ | 説明 |
| --- | --- |
| `consumer_key` | 「[1. Application を作成](#1.-application-を作成)」の手順で発行された CONSUMER KEY 。<br/>今回の場合は `103885-6d75a5f5dd05c16a8da9120` 。 |
| `access_token` | 「[2. アクセストークンを発行する](#2.-アクセストークンを発行する)」の手順で発行されたアクセストークン。<br/>今回の場合は `99b1dcdf-7c0a-8f00-bce7-647695` 。 |

以下は全てのアイテムを取得する例です。

```sh:curl を使用する例
$ curl -s -X POST 'https://getpocket.com/v3/get' \
    -d consumer_key=103885-6d75a5f5dd05c16a8da9120 \
    -d access_token=99b1dcdf-7c0a-8f00-bce7-647695
```

成功するとアイテム一覧の情報を含むレスポンスが返されます。

```json:出力例
{
  "status": 1,
  "complete": 1,
  "list": {
    "1502819": {
      "item_id": "1502819",
      "resolved_id": "1502819",
      "given_url": "https://example.com",
      "given_title": "",
      "favorite": "0",
      "status": "0",
      "time_added": "1663748477",
      "time_updated": "1663748477",
      "time_read": "0",
      "time_favorited": "0",
      "sort_id": 0,
      "resolved_title": "Example Domain",
      "resolved_url": "https://example.com/",
      "excerpt": "This domain is for use in illustrative examples in documents. You may use this domain in literature without prior coordination or asking for permission. More information...",
      "is_article": "0",
      "is_index": "1",
      "has_video": "0",
      "has_image": "0",
      "word_count": "28",
      "lang": "",
      "listen_duration_estimate": 11
    },
    // ...省略
  },
  "error": null,
  "search_meta": {
    "search_type": "normal"
  },
  "since": 1663748695
}
```

その他詳しい使い方については公式ドキュメントをご参照ください。

https://getpocket.com/developer/docs/v3/retrieve

## アイテムを編集する

`https://getpocket.com/v3/send` エンドポイントでアイテムの編集などの様々なアクションを実行できます。
必須のパラメータは次の通りです。

| パラメータ | 説明 |
| --- | --- |
| `actions` | 実行するアクションの JSON 形式のリスト。 |
| `consumer_key` | 「[1. Application を作成](#1.-application-を作成)」の手順で発行された CONSUMER KEY 。<br/>今回の場合は `103885-6d75a5f5dd05c16a8da9120` 。 |
| `access_token` | 「[2. アクセストークンを発行する](#2.-アクセストークンを発行する)」の手順で発行されたアクセストークン。<br/>今回の場合は `99b1dcdf-7c0a-8f00-bce7-647695` 。 |

以下は任意のアイテムをアーカイブする例です。

```sh:curl を使用する例
$ curl -X POST 'https://getpocket.com/v3/send' \
    -d consumer_key=103885-6d75a5f5dd05c16a8da9120 \
    -d access_token=99b1dcdf-7c0a-8f00-bce7-647695 \
    -d 'actions=[{"action": "archive", "item_id": "1502819"}]'
```

成功するとアクションの実行結果を含むレスポンスが返されます。

```json
{
  "action_results": [
    true
  ],
  "action_errors": [
    null
  ],
  "status": 1
}
```

その他詳しい使い方については公式ドキュメントをご参照ください。

https://getpocket.com/developer/docs/v3/modify

# 参考

https://getpocket.com/developer/docs/overview
https://medium.com/@alexdambra/getting-your-reading-history-out-of-pocket-using-python-b4253dbe865c

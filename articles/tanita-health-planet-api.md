---
title: "タニタの Health Planet API を使用して測定情報を取得する"
emoji: "🏋️‍♂️"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["tanita", "healthplanet", "api"]
published: true
---

最近タニタの体組成計を買いました。

https://www.amazon.co.jp/dp/B07Q2WYL77

Health Planet というサービスを利用して測定情報を記録しているのですが、 API が提供されていたので試してみました。

https://www.healthplanet.jp/

# 前提

Health Planet に登録済みであることを前提とします。

# 1. アプリケーションを登録

:::message
Health Planet にログインしていない場合は最初に下記ページからログインしてください。

- [ログインする ｜ Health Planet  ヘルスプラネット](https://www.healthplanet.jp/login.do)

:::

アプリケーションの登録ページにアクセスします。

https://www.healthplanet.jp/apis_account.do

`新規登録` をクリックします。

![](/images/tanita-health-planet-api/to-register-application.png)

それぞれ次のように入力します。

| 項目                     | 説明                                                                                                                                                                                      |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `サービス名`             | 任意の名前。<br/>今回は `example` とします。                                                                                                                                              |
| `メールアドレス`         | 問い合わせ先の任意のメールアドレス。<br/>「[2.1. 認可コードを発行する](#2.1.-認可コードを発行する)」の手順のアクセス許可画面で表示されます。<br/>今回は自分のメールアドレスを入力します。 |
| `アプリケーションタイプ` | アプリケーションの種類。<br/>今回は API を叩きたいだけなので `クライアントアプリケーション` を選択します。                                                                                |

それぞれ入力できたら `規約に同意して登録する` をクリックします。
これでアプリケーションが登録されます。

![](/images/tanita-health-planet-api/register-application.png)

アプリケーションの登録が完了するとクライアント ID とクライアントシークレットが発行されます。
これらは後で必要になるため、ひかえておきます。

![](/images/tanita-health-planet-api/get-client-id-and-client-secret.png)

# 2. アクセストークンを発行する

## 2.1. 認可コードを発行する

ブラウザから次の URL にアクセスします。

```
https://www.healthplanet.jp/oauth/auth?client_id=<クライアントID>&redirect_uri=https://www.healthplanet.jp/success.html&scope=<スコープ>&response_type=code
```

各パラメータの説明は次の通りです。

| パラメータ名    | 説明                                                                                                                                                                                                                                                    |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `client_id`     | 「[1. アプリケーションを登録](#1.-アプリケーションを登録)」の手順で発行されたクライアント ID を指定します。                                                                                                                                             |
| `redirect_uri`  | `https://www.healthplanet.jp/success.html` を指定します。                                                                                                                                                                                               |
| `scope`         | API に許可するスコープをカンマ区切りで指定します。<br/>次の値が指定できます。<br/>・ `innerscan` ( 体組成情報 )<br/>・ `sphygmomanometer` ( 血圧情報 )<br/>・ `pedometer` ( 歩数情報 )<br/>・ `smug` ( 尿糖情報 )<br/>今回は `innerscan` を指定します。 |
| `response_type` | `code` を指定します。                                                                                                                                                                                                                                   |

そうすると次のようなアクセス許可画面が表示されるため、 `アクセスを許可` をクリックします。

![](/images/tanita-health-planet-api/allow-access.png)

すると認可コードが発行されるため、こちらをひかえます。

![](/images/tanita-health-planet-api/get-code.png)

## 2.2. アクセストークンを発行する

次のエンドポイントに GET もしくは POST リクエストを送信することでアクセストークンが発行されます。

```
https://www.healthplanet.jp/oauth/token
```

必要なパラメータは次の通りです。

| パラメータ名    | 説明                                                                                                                |
| --------------- | ------------------------------------------------------------------------------------------------------------------- |
| `client_id`     | 「[1. アプリケーションを登録](#1.-アプリケーションを登録)」の手順で発行されたクライアント ID を指定します。         |
| `client_secret` | 「[1. アプリケーションを登録](#1.-アプリケーションを登録)」の手順で発行されたクライアントシークレットを指定します。 |
| `redirect_uri`  | `https://www.healthplanet.jp/success.html` を指定します。                                                           |
| `code`          | 「[2.1. 認可コードを発行する](#2.1.-認可コードを発行する)」の手順で発行された認可コードを指定します。               |
| `grant_type`    | `authorization_code` を指定します。                                                                                 |

```:curlを使用する例
$ curl -X POST 'https://www.healthplanet.jp/oauth/token' \
  -d 'client_id=<クライアントID>' \
  -d 'client_secret=<クライアントシークレット>' \
  -d 'redirect_uri=https://www.healthplanet.jp/success.html' \
  -d 'code=<認可コード>' \
  -d 'grant_type=authorization_code'
```

すると次のようなアクセストークンが含まれた JSON レスポンスが返されます。

```json
{
  "access_token": "****",
  "expires_in": 2592000,
  "refresh_token": "****"
}
```

# 3. 体組成測定情報を取得する

それでは実際に API を叩いてみます。
次のエンドポイントに GET もしくは POST リクエストを送信することで体組成の測定情報を取得できます。

```
https://www.healthplanet.jp/status/innerscan.json
```

送信するパラメータは次の通りです。

| パラメータ名   | 必須 | 説明                                                                                                                     |
| -------------- | ---- | ------------------------------------------------------------------------------------------------------------------------ |
| `access_token` | ◯    | 「[2.2. アクセストークンを発行する](#2.2.-アクセストークンを発行する)」の手順で発行されたアクセストークンを指定します。  |
| `date`         | ◯    | `from`, `to` の日付タイプ。<br/>次の値が指定できます。<br/>・ `0` ( 登録日付 )<br/>・ `1` ( 測定日付 )                   |
| `from`         |      | 取得期間の開始日を `yyyyMMddHHmmss` 形式で指定します。<br/>未指定の場合は 3 ヶ月前になります。                           |
| `to`           |      | 取得期間の終了日を `yyyyMMddHHmmss` 形式で指定します。<br/>未指定の場合は現在の時刻になります。                          |
| `tag`          |      | 取得する測定部位をカンマ区切りで指定します。<br/>次の値が指定できます。<br/>・ `6021` ( 体重 )<br/>・ `6022` ( 体脂肪率) |

次のコマンドは、 `curl` を使用して 2023 年 4 月 9 日に測定した体重・体脂肪率の一覧を取得する例です。

```:curlを使用する例
$ curl -X POST 'https://www.healthplanet.jp/status/innerscan.json' \
  -d 'access_token=<アクセストークン>' \
  -d 'date=1' \
  -d 'from=20230409000000' \
  -d 'to=20230409235959' \
  -d 'tag=6021,6022'
```

すると次のような JSON レスポンスが返されます ( 恥ずかしいので一部の情報は伏せています ) 。

```json
{
  "birth_date": "19980131",
  "data": [
    {
      "date": "202304090947",
      "keydata": "5*.**",
      "model": "01000145",
      "tag": "6021"
    },
    {
      "date": "202304090947",
      "keydata": "1*.**",
      "model": "01000145",
      "tag": "6022"
    },
    {
      "date": "202304090120",
      "keydata": "5*.**",
      "model": "01000145",
      "tag": "6021"
    },
    {
      "date": "202304090120",
      "keydata": "1*.**",
      "model": "01000145",
      "tag": "6022"
    }
  ],
  "height": "1**",
  "sex": "male"
}
```

- `birth_date`: 誕生日 ( `yyyyMMdd` 形式 )
- `data`: 測定データの一覧
  - `date`: 測定日
  - `keydata`: 測定データ
  - `model`: 測定機器 ( 値と機器の対応表については[仕様書](https://www.healthplanet.jp/apis/api.html)の `/status/innerscan` の情報をご参照ください。 )
  - `tag`: 測定部位
- `height`: 身長
- `sex`: 性別

# まとめ

ダイエットがんばるます。

# 参考

https://sey323log.hatenablog.com/entry/20210508/1620462517
https://www.healthplanet.jp/apis/api.html

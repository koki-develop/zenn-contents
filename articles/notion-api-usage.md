---
title: "Notion API を使用してデータベースを操作する"
emoji: "📚"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["notion", "notionapi"]
published: true
---

Notion で Integration を作成して Notion API を使用してデータベースを操作するまでの手順メモ。

# 準備

## 1. Integration を作成する

[My integrations](https://www.notion.so/my-integrations) ページに遷移します。

`Create new integration` をクリックします。

![](/images/notion-api-usage/my-integrations.png)

`Name` には任意の Integration 名を入力します。
今回は `Example Integration` としておきます。

`Associated workspace` には Integration をインストールするワークスペースを選択します。
自身がワークスペースの Admin レベルの権限を持っている必要があります。

`Capabilities` には Integration から実行できる機能を選択します。
次のような項目があります。
Integration の用途に合わせて適切に設定してください。

- `Content Capabilities`
  - `Read content` : コンテンツの読み取り
  - `Update content` : 既存のコンテンツの更新
  - `Insert content` : 新しいコンテンツの作成
- `Comment Capabilities`
  - `Read comments` : コメントの読み取り
  - `Insert comments` : コメントの作成
- `User Capabilities`
  - `No user information` : ユーザー情報にはアクセスさせない
  - `Read user information without email addresses` : メールアドレス以外のユーザー情報の読み取り
  - `Read user information including email addresses` : メールアドレスを含めたユーザー情報の読み取り

これらの項目は全て後から変更できます。
それぞれ入力できたら `Submit` をクリックします。
これで Integration が作成されます。

![](/images/notion-api-usage/create-integration.png)

:::message

Integration はデフォルトで Internal Integration として作成されます。
Internal Integration はインストールしたワークスペース内でのみ使用でき、外部へ公開されることはありません。
Integration 作成後、 `Integration type` を `Public integration` に変更して必要な項目を入力することで Integration を外部へ公開することもできます。

:::details スクリーンショット

![](/images/notion-api-usage/public-integration.png)

:::

Integration を作成するとトークンが発行されます。
`Internal Integration Token` の `Show` をクリックすると `secret_` から始まるトークンが確認できます。
このトークンは Notion API を実行するときに必要になるため、ひかえておきます。

![](/images/notion-api-usage/show-token.png)

## 2. データベースを作成する

Notion API で操作するデータベースを作成します。
今回はこんな感じのデータベースを作成しました。

![](/images/notion-api-usage/create-database.png)

作成したデータベースの ID を確認します。
データベースの URL は次のような形式になっています。
`データベースID` が Notion API で操作するときに必要になるため、ひかえておきます。

```
https://www.notion.so/<データベースID>?v=<ビューID>
```

## 3. Integration からデータベースにアクセスできるようにする

Integration は最初はワークスペース内のどのコンテンツにもアクセスできません。
そのため、アクセスしたいページやデータベースで設定を行う必要があります。

「[2. データベースを作成する](#2.-データベースを作成する)」手順で作成したデータベースのページに遷移します。

右上の三点リーダ → `Add connections` → 「[1. Integration を作成する](#1.-integration-を作成する)」手順で作成した Integration の順にクリックします。

![](/images/notion-api-usage/add-connection.png)

確認ダイアログが表示されるので、 `Confirm` をクリックします。
これで Integration からこのページと子ページにアクセスできるようになります。

![](/images/notion-api-usage/confirm-add-connection.png)

# Notion API を使ってみる

## データベースの情報を取得する

https://developers.notion.com/reference/retrieve-a-database

次のエンドポイントに `GET` リクエストを送信することで特定のデータベースの情報を取得することができます。

```
https://api.notion.com/v1/databases/<データベースID>
```

次のコマンドは `curl` を使用して特定のデータベース情報を取得する例です。

```sh
$ curl 'https://api.notion.com/v1/databases/<データベースID>' \
  -H 'Authorization: Bearer <Integrationトークン>' \
  -H 'Notion-Version: 2022-06-28'
```

:::details 出力例

```json
{
  "object": "database",
  "id": "********-****-****-****-************",
  "cover": null,
  "icon": null,
  "created_time": "2023-02-25T01:04:00.000Z",
  "created_by": {
    "object": "user",
    "id": "********-****-****-****-************"
  },
  "last_edited_by": {
    "object": "user",
    "id": "********-****-****-****-************"
  },
  "last_edited_time": "2023-02-25T01:17:00.000Z",
  "title": [
    {
      "type": "text",
      "text": {
        "content": "Example Database",
        "link": null
      },
      "annotations": {
        "bold": false,
        "italic": false,
        "strikethrough": false,
        "underline": false,
        "code": false,
        "color": "default"
      },
      "plain_text": "Example Database",
      "href": null
    }
  ],
  "description": [],
  "is_inline": false,
  "properties": {
    "Status": {
      "id": "****",
      "name": "Status",
      "type": "status",
      "status": {
        "options": [
          {
            "id": "********-****-****-****-************",
            "name": "Not started",
            "color": "default"
          },
          {
            "id": "********-****-****-****-************",
            "name": "In progress",
            "color": "blue"
          },
          {
            "id": "********-****-****-****-************",
            "name": "Done",
            "color": "green"
          }
        ],
        "groups": [
          {
            "id": "********-****-****-****-************",
            "name": "To-do",
            "color": "gray",
            "option_ids": ["********-****-****-****-************"]
          },
          {
            "id": "********-****-****-****-************",
            "name": "In progress",
            "color": "blue",
            "option_ids": ["********-****-****-****-************"]
          },
          {
            "id": "********-****-****-****-************",
            "name": "Complete",
            "color": "green",
            "option_ids": ["********-****-****-****-************"]
          }
        ]
      }
    },
    "Assign": {
      "id": "******",
      "name": "Assign",
      "type": "people",
      "people": {}
    },
    "Name": {
      "id": "title",
      "name": "Name",
      "type": "title",
      "title": {}
    }
  },
  "parent": {
    "type": "workspace",
    "workspace": true
  },
  "url": "https://www.notion.so/<データベースID>",
  "archived": false
}
```

:::

## データベースのアイテム一覧を取得する

https://developers.notion.com/reference/post-database-query

次のエンドポイントに `POST` リクエストを送信することで特定のデータベースのアイテム一覧を取得することができます。

```
https://api.notion.com/v1/databases/<データベースID>/query
```

次のコマンドは `curl` を使用して特定のデータベースのアイテム一覧を取得する例です。

```sh
$ curl -X POST 'https://api.notion.com/v1/databases/<データベースID>/query' \
  -H 'Authorization: Bearer <Integrationトークン>' \
  -H 'Notion-Version: 2022-06-28'
```

:::details 出力例

```json
{
  "object": "list",
  "results": [
    {
      "object": "page",
      "id": "********-****-****-****-************",
      "created_time": "2023-02-25T01:04:00.000Z",
      "last_edited_time": "2023-02-25T01:33:00.000Z",
      "created_by": {
        "object": "user",
        "id": "********-****-****-****-************"
      },
      "last_edited_by": {
        "object": "user",
        "id": "********-****-****-****-************"
      },
      "cover": null,
      "icon": null,
      "parent": {
        "type": "database_id",
        "database_id": "********-****-****-****-************"
      },
      "archived": false,
      "properties": {
        "Status": {
          "id": "****",
          "type": "status",
          "status": {
            "id": "********-****-****-****-************",
            "name": "Not started",
            "color": "default"
          }
        },
        "Assign": {
          "id": "******",
          "type": "people",
          "people": []
        },
        "Name": {
          "id": "title",
          "type": "title",
          "title": [
            {
              "type": "text",
              "text": {
                "content": "Card 2",
                "link": null
              },
              "annotations": {
                "bold": false,
                "italic": false,
                "strikethrough": false,
                "underline": false,
                "code": false,
                "color": "default"
              },
              "plain_text": "Card 2",
              "href": null
            }
          ]
        }
      },
      "url": "https://www.notion.so/Card-2-********************************"
    },
    {
      "object": "page",
      "id": "********-****-****-****-************",
      "created_time": "2023-02-25T01:04:00.000Z",
      "last_edited_time": "2023-02-25T01:04:00.000Z",
      "created_by": {
        "object": "user",
        "id": "********-****-****-****-************"
      },
      "last_edited_by": {
        "object": "user",
        "id": "********-****-****-****-************"
      },
      "cover": null,
      "icon": null,
      "parent": {
        "type": "database_id",
        "database_id": "********-****-****-****-************"
      },
      "archived": false,
      "properties": {
        "Status": {
          "id": "****",
          "type": "status",
          "status": {
            "id": "********-****-****-****-************",
            "name": "Not started",
            "color": "default"
          }
        },
        "Assign": {
          "id": "******",
          "type": "people",
          "people": []
        },
        "Name": {
          "id": "title",
          "type": "title",
          "title": [
            {
              "type": "text",
              "text": {
                "content": "Card 1",
                "link": null
              },
              "annotations": {
                "bold": false,
                "italic": false,
                "strikethrough": false,
                "underline": false,
                "code": false,
                "color": "default"
              },
              "plain_text": "Card 1",
              "href": null
            }
          ]
        }
      },
      "url": "https://www.notion.so/Card-1-********************************"
    },
    {
      "object": "page",
      "id": "********-****-****-****-************",
      "created_time": "2023-02-25T01:04:00.000Z",
      "last_edited_time": "2023-02-25T01:33:00.000Z",
      "created_by": {
        "object": "user",
        "id": "********-****-****-****-************"
      },
      "last_edited_by": {
        "object": "user",
        "id": "********-****-****-****-************"
      },
      "cover": null,
      "icon": null,
      "parent": {
        "type": "database_id",
        "database_id": "********-****-****-****-************"
      },
      "archived": false,
      "properties": {
        "Status": {
          "id": "****",
          "type": "status",
          "status": {
            "id": "********-****-****-****-************",
            "name": "Not started",
            "color": "default"
          }
        },
        "Assign": {
          "id": "******",
          "type": "people",
          "people": []
        },
        "Name": {
          "id": "title",
          "type": "title",
          "title": [
            {
              "type": "text",
              "text": {
                "content": "Card 3",
                "link": null
              },
              "annotations": {
                "bold": false,
                "italic": false,
                "strikethrough": false,
                "underline": false,
                "code": false,
                "color": "default"
              },
              "plain_text": "Card 3",
              "href": null
            }
          ]
        }
      },
      "url": "https://www.notion.so/Card-3-********************************"
    }
  ],
  "next_cursor": null,
  "has_more": false,
  "type": "page",
  "page": {}
}
```

:::

### フィルター

リクエストボディに `filter` を設定することでアイテムをフィルタして取得することができます。
次のコマンドは `curl` を使用して `status` 型の `Status` プロパティが `Not started` であるアイテムをフィルタして取得する例です。

:::message
`Content-Type` ヘッダに `application/json` を設定するのを忘れないように注意してください。
:::

```sh
$ curl -X POST 'https://api.notion.com/v1/databases/<データベースID>/query' \
  -H 'Authorization: Bearer <Integrationトークン>' \
  -H 'Content-Type: application/json' \
  -H 'Notion-Version: 2022-06-28' \
  --data '{
  "filter": {
    "property": "Status",
    "status": {
      "equals": "Not started"
    }
  }
}'
```

また、 `and` や `or` を使用して複数の条件を指定することもできます。
次のコマンドは `curl` を使用して `status` 型の `Status` プロパティが `Not started` もしくは `In progress` であるアイテムをフィルタして取得する例です。

```sh
$ curl -X POST 'https://api.notion.com/v1/databases/<データベースID>/query' \
  -H 'Authorization: Bearer <Integrationトークン>' \
  -H 'Content-Type: application/json' \
  -H 'Notion-Version: 2022-06-28' \
  --data '{
  "filter": {
    "or": [
      {
        "property": "Status",
        "status": {
          "equals": "Not started"
        }
      },
      {
        "property": "Status",
        "status": {
          "equals": "In progress"
        }
      }
    ]
  }
}'
```

その他の詳しいフィルタの指定方法については以下の公式リファレンスをご参照ください。

https://developers.notion.com/reference/post-database-query-filter

### ソート

リクエストボディに `sorts` を設定することでアイテムをソートして取得することができます。
次のコマンドは `curl` を使用してアイテムを `Name` プロパティで昇順にソートして取得する例です。

:::message
`Content-Type` ヘッダに `application/json` を設定するのを忘れないように注意してください。
:::

```sh
$ curl -X POST 'https://api.notion.com/v1/databases/<データベースID>/query' \
  -H 'Authorization: Bearer <Integrationトークン>' \
  -H 'Content-Type: application/json' \
  -H 'Notion-Version: 2022-06-28' \
    --data '{
  "sorts": [
    {
      "property": "Name",
      "direction": "ascending"
    }
  ]
}'
```

複数のソート条件を指定することもできます。
次のコマンドは `curl` を使用してアイテムを `Name` プロパティで昇順・ `Status` プロパティで降順にソートして取得する例です。
複数指定した場合は最初の要素が優先されます。

```sh
$ curl -X POST 'https://api.notion.com/v1/databases/<データベースID>/query' \
  -H 'Authorization: Bearer <Integrationトークン>' \
  -H 'Content-Type: application/json' \
  -H 'Notion-Version: 2022-06-28' \
    --data '{
  "sorts": [
    {
      "property": "Name",
      "direction": "ascending"
    },
    {
      "property": "Status",
      "direction": "descending"
    }
  ]
}'
```

その他の詳しいソートの指定方法については以下の公式リファレンスをご参照ください。

https://developers.notion.com/reference/post-database-query-sort

## データベースにアイテムを追加する

https://developers.notion.com/reference/post-page

次のエンドポイントに `POST` リクエストを送信することでアイテム ( ページ ) を作成することができます。

```
https://api.notion.com/v1/pages
```

次のコマンドは `curl` を使用して `アイテムのタイトル` という名前で `Status` プロパティが `In progress` であるアイテムを作成するコマンドです。

:::message
`Content-Type` ヘッダに `application/json` を設定するのを忘れないように注意してください。
:::

```sh
$ curl -X POST 'https://api.notion.com/v1/pages' \
-H 'Authorization: Bearer <Integrationトークン>' \
-H 'Content-Type: application/json' \
-H 'Notion-Version: 2022-06-28' \
--data '{
  "parent": { "database_id": "<データベースID>" },
  "properties": {
    "Name": {
      "title": [
        { "text": { "content": "アイテムのタイトル" } }
      ]
    },
    "Status": {
      "status": { "name": "In progress" }
    }
  }
}'
```

:::details 出力例

```json
{
  "object": "page",
  "id": "********-****-****-****-************",
  "created_time": "2023-02-25T02:14:00.000Z",
  "last_edited_time": "2023-02-25T02:14:00.000Z",
  "created_by": {
    "object": "user",
    "id": "********-****-****-****-************"
  },
  "last_edited_by": {
    "object": "user",
    "id": "********-****-****-****-************"
  },
  "cover": null,
  "icon": null,
  "parent": {
    "type": "database_id",
    "database_id": "********-****-****-****-************"
  },
  "archived": false,
  "properties": {
    "Status": {
      "id": "****",
      "type": "status",
      "status": {
        "id": "********-****-****-****-************",
        "name": "In progress",
        "color": "blue"
      }
    },
    "Assign": {
      "id": "******",
      "type": "people",
      "people": []
    },
    "Name": {
      "id": "title",
      "type": "title",
      "title": [
        {
          "type": "text",
          "text": {
            "content": "アイテムのタイトル",
            "link": null
          },
          "annotations": {
            "bold": false,
            "italic": false,
            "strikethrough": false,
            "underline": false,
            "code": false,
            "color": "default"
          },
          "plain_text": "アイテムのタイトル",
          "href": null
        }
      ]
    }
  },
  "url": "https://www.notion.so/********************************"
}
```

:::

アイテム ( ページ ) のプロパティの形式については以下の公式リファレンスをご参照ください。

https://developers.notion.com/reference/page-property-values

## データベースのアイテムを更新する

https://developers.notion.com/reference/patch-page

次のエンドポイントに `PATCH` リクエストを送信することで特定のアイテム ( ページ ) を更新することができます。

```
https://api.notion.com/v1/pages/<ページID>
```

まず更新したいアイテム ( ページ ) の URL を取得します。
データベース内のアイテムをクリックします。
右上の三点リーダ → `Copy link` をクリックして URL を取得します。

![](/images/notion-api-usage/get-page-link.png)

アイテム ( ページ ) の URL は次のような形式になっています。
`ページID` が必要になるため、ひかえておきます。

```
https://www.notion.so/<ページ名>-<ページID>
```

次のコマンドは `curl` を使用してアイテムの `status` 型の `Status` プロパティを `In progress` に更新する例です。

:::message
`Content-Type` ヘッダに `application/json` を設定するのを忘れないように注意してください。
:::

```sh
$ curl -X PATCH 'https://api.notion.com/v1/pages/<ページID>' \
-H 'Authorization: Bearer <Integrationトークン>' \
-H 'Content-Type: application/json' \
-H 'Notion-Version: 2022-06-28' \
--data '{
  "properties": {
    "Status": {
      "status": { "name": "In progress" }
    }
  }
}'
```

:::details 出力例

```json
{
  "object": "page",
  "id": "********-****-****-****-************",
  "created_time": "2023-02-25T01:04:00.000Z",
  "last_edited_time": "2023-02-25T02:32:00.000Z",
  "created_by": {
    "object": "user",
    "id": "********-****-****-****-************"
  },
  "last_edited_by": {
    "object": "user",
    "id": "********-****-****-****-************"
  },
  "cover": null,
  "icon": null,
  "parent": {
    "type": "database_id",
    "database_id": "********-****-****-****-************"
  },
  "archived": false,
  "properties": {
    "Status": {
      "id": "****",
      "type": "status",
      "status": {
        "id": "********-****-****-****-************",
        "name": "In progress",
        "color": "blue"
      }
    },
    "Assign": {
      "id": "******",
      "type": "people",
      "people": []
    },
    "Name": {
      "id": "title",
      "type": "title",
      "title": [
        {
          "type": "text",
          "text": {
            "content": "Card 1",
            "link": null
          },
          "annotations": {
            "bold": false,
            "italic": false,
            "strikethrough": false,
            "underline": false,
            "code": false,
            "color": "default"
          },
          "plain_text": "Card 1",
          "href": null
        }
      ]
    }
  },
  "url": "https://www.notion.so/Card-1-********************************"
}
```

:::

アイテム ( ページ ) のプロパティの形式については以下の公式リファレンスをご参照ください。

https://developers.notion.com/reference/page-property-values

# 参考

https://developers.notion.com/docs/getting-started
https://developers.notion.com/reference

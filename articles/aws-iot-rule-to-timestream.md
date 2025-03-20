---
title: "AWS IoT ルールで Timestream にメッセージを保存する"
emoji: "📱" # TODO
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["aws", "iot", "timestream"]
published: true
---

メッセージを Timestream に保存する IoT ルールを作成して MQTT テストクライアントで動作確認するまでの手順メモ。

# 手順

## 1. Timestream データベースを作成する

Timestream データベースを作成していきます。

Amazon Timestream のマネジメントコンソールで左メニューから `データベース` をクリックし、 `データベースを作成` をクリックします。

![](/images/aws-iot-rule-to-timestream/to-create-timestream-database.png)

各項目を次のように入力します。

| 項目         | 値                                                     |
| ------------ | ------------------------------------------------------ |
| `設定を選択` | `標準データベース`                                     |
| `名前`       | 任意のデータベース名。<br/>今回は `example` とします。 |

その他の設定は必要に応じて入力してください。
それぞれ入力できたら `データベースを作成` をクリックします。
これで Timestream データベースが作成されます。

![](/images/aws-iot-rule-to-timestream/create-timestream-database.png)

## 2. Timestream テーブルを作成する

続いて IoT のメッセージを保存する Timestream テーブルを作成していきます。

Amazon Timestream のマネジメントコンソールで左メニューから `テーブル` をクリックし、 `テーブルを作成` をクリックします。

![](/images/aws-iot-rule-to-timestream/to-create-timestream-table.png)

各項目を次のように入力します。

| 項目             | 値                                                                                                                        |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `データベース名` | 「[1. Timestream データベースを作成する](#1.-timestream-データベースを作成する)」手順で作成したデータベースを選択します。 |
| `テーブル名`     | 任意のテーブル名。<br/>今回は `example-table` とします。                                                                  |

その他の設定は必要に応じて入力してください。
それぞれ入力できたら `データベースを作成` をクリックします。
これで Timestream テーブルが作成されます。

![](/images/aws-iot-rule-to-timestream/create-timestream-table.png)

# 3. IoT ルールを作成する

メッセージを Timestream に保存する IoT ルールを作成していきます。

AWS IoT Core のマネジメントコンソールで左メニューから `メッセージのルーティング` > `ルール` をクリックし、 `ルールを作成` をクリックします。

![](/images/aws-iot-rule-to-timestream/to-create-iot-rule.png)

各項目を次のように入力します。

| 項目       | 値                                                                                            |
| ---------- | --------------------------------------------------------------------------------------------- |
| `ルール名` | 任意のルール名。英数字とアンダースコアのみ使用できます。<br/>今回は `example_rule` とします。 |

その他の設定は必要に応じて入力してください。
それぞれ入力できたら `次へ` をクリックします。

![](/images/aws-iot-rule-to-timestream/set-iot-rule-property.png)

続いて SQL ステートメントを設定します。
`SQL のバージョン` は `2016-03-23` を選択します。
`SQL ステートメント` には今回は次の SQL を入力します。
こうすることで `messages/<任意の文字列>` トピックに対してメッセージが Publish されたときにルールがトリガーされます。

```sql
SELECT * FROM 'messages/+'
```

AWS IoT で使用できる SQL の詳細については以下のドキュメントをご参照ください。

https://docs.aws.amazon.com/ja_jp/iot/latest/developerguide/iot-sql-reference.html

それぞれ入力できたら `次へ` をクリックします。

![](/images/aws-iot-rule-to-timestream/set-iot-rule-sql-statement.png)

続いてメッセージを Timestream に保存するアクションを設定します。
各項目を次のように入力します。

| 項目             | 値                                                                                                                        |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `アクション 1`   | `Timestream table`                                                                                                        |
| `データベース名` | 「[1. Timestream データベースを作成する](#1.-timestream-データベースを作成する)」手順で作成したデータベースを選択します。 |
| `テーブル名`     | 「[2. Timestream テーブルを作成する](#2.-timestream-テーブルを作成する)」手順で作成したテーブルを選択します。             |

`ディメンション` は今回は次のように入力します。

| `ディメンション名` | `ディメンション値 ` |
| ------------------ | ------------------- |
| `deviceId`         | `${topic(2)}`       |

:::message
ディメンションとは Timestream の時系列データに設定できるメタデータです。
例えば IoT であればデバイスを識別するユニークな ID などをディメンションとして保存することが考えられます。
今回はひとつだけ設定しますが、複数設定することもできます。
:::

`ディメンション値` では `${topic(2)}` のようにすることでトピックの 2 番目のトピックセグメントを参照することができます。
例えば今回の設定であれば `messages/device_1` というトピックにメッセージが Publish された場合、 `deviceId` ディメンションに `device_1` が保存されます。

その他 AWS IoT で使用できる関数については以下のドキュメントをご参照ください。

https://docs.aws.amazon.com/ja_jp/iot/latest/developerguide/iot-sql-functions.html

それぞれ入力できたらアクションにアタッチする IAM ロールを設定します。
もちろん事前に自前で作成した IAM ロールを選択してもいいのですが、今回は `新しいロールを作成` をクリックして新しい IAM ロールを作成します。
ここで IAM ロールを作成すると適切なポリシーを自動で設定してくれるので便利です。

![](/images/aws-iot-rule-to-timestream/attach-iot-rule-action-1.png)

`ロール名` に任意の IAM ロール名を入力して `作成` をクリックします。
これで IAM ロールが作成されます。

:::message
作成された IAM ロールには IoT ルールの作成完了後に次のようなポリシーがアタッチされます。

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["timestream:WriteRecords"],
      "Resource": "<TimestreamテーブルのARN>"
    },
    {
      "Effect": "Allow",
      "Action": ["timestream:DescribeEndpoints"],
      "Resource": "*"
    }
  ]
}
```

:::

![](/images/aws-iot-rule-to-timestream/create-iam-role.png)

`次へ` をクリックします。

![](/images/aws-iot-rule-to-timestream/attach-iot-rule-action-2.png)

設定内容を確認して `作成` をクリックします。
これで IoT ルールが作成されます。

![](/images/aws-iot-rule-to-timestream/create-iot-rule.png)

# 4. 動作確認

作成した IoT ルールの動作確認をします。
今回は AWS の MQTT テストクライアントを使用します。

:::message

オープンソースの MQTT メッセージブローカーである [Mosquitto](https://mosquitto.org/) を使用する場合は以下のドキュメントをご参照ください。

- [Mosquitto で AWS IoT Core にメッセージを Publish/Subscribe する](https://zenn.dev/kou_pg_0131/articles/aws-iot-core-mosquitto)

:::

AWS IoT Core のマネジメントコンソールで左メニューから `MQTT テストクライアント` をクリックします。
`トピックに公開する` を選択し、各項目を次のように入力します。

| 項目                   | 値                                                                                  |
| ---------------------- | ----------------------------------------------------------------------------------- |
| `トピック名`           | `messages/<任意の文字列>` 。<br/>今回は `messages/device_1` にします。              |
| `メッセージペイロード` | 任意の JSON 。<br/>サンプルのペイロードが入力されているので今回はそのままにします。 |

それぞれ入力できたら `発行` をクリックします。
これでメッセージが Publish されます ( 今回はトピックを Subscribe してないので何も表示されませんが問題ありません ) 。

![](/images/aws-iot-rule-to-timestream/publish-message.png)

それでは Timestream テーブルにメッセージが保存されたか確認します。
Amazon Timestream のマネジメントコンソールで左メニューから `クエリエディタ` をクリックします。
次の SQL を入力をして `実行` をクリックします。

```sql
select * from "example"."example-table"
```

実行が完了すると先程 MQTT テストクライアントで Publish したメッセージが保存されていることが確認できます。

![](/images/aws-iot-rule-to-timestream/run-query.png)

# 参考

https://docs.aws.amazon.com/ja_jp/iot/latest/developerguide/timestream-rule-action.html
https://docs.aws.amazon.com/ja_jp/timestream/latest/developerguide/IOT-Core.html

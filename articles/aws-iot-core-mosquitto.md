---
title: "Mosquitto で AWS IoT Core にメッセージを Publish/Subscribe する"
emoji: "📱"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["aws", "iot", "mosquitto"]
published: true
---

オープンソースの MQTT メッセージブローカーである [Mosquitto](https://mosquitto.org/) を使用して Mac で AWS IoT Core にメッセージを Publish/Subscribe を行う手順のメモ。

https://mosquitto.org/

# 準備

## Mosquitto をインストール

Publish/Subscribe を行うデバイスに Mosquitto をインストールします。
今回は Mac を使用します。

Homebrew を使用している場合は次のコマンドでインストールすることができます。

```sh
$ brew install mosquitto
```

その他のインストール方法については以下のドキュメントをご参照ください。

https://mosquitto.org/download/

## 証明書を作成

まず AWS IoT Core で証明書を作成していきます。

AWS IoT Core のマネジメントコンソールで左メニューから `セキュリティ` > `証明書` をクリックし、 `証明書を追加` → `証明書を作成` の順にクリックします。

![](/images/aws-iot-core-mosquitto/to-add-certificate.png)

各項目を次のように選択します。

| 項目                 | 値                               |
| -------------------- | -------------------------------- |
| `証明書`             | `新しい証明書の自動生成（推奨）` |
| `証明書のステータス` | `アクティブ`                     |

それぞれ選択したら `作成` をクリックします。

![](/images/aws-iot-core-mosquitto/create-certificate.png)

証明書とキーのダウンロードダイアログが表示されます。
以下のファイルをそれぞれダウンロードします。

- `デバイス証明書` : `<証明書ID>-certificate.pem.crt`
- `パブリックキーファイル` : `<証明書ID>-public.pem.key`
- `プライベートキーファイル` : `<証明書ID>-private.pem.key`
- `RSA 2048 ビットキー: Amazon ルート CA 1` : `AmazonRootCA1.pem`

それぞれダウンロードが完了したら `続行` をクリックします。
これで証明書が作成されます。

![](/images/aws-iot-core-mosquitto/download-certificate.png)

## ポリシーを作成

続いて IoT 証明書にアタッチするポリシーを作成していきます。

左メニューから `セキュリティ` > `ポリシー` をクリックし、 `ポリシーを作成` をクリックします。

![](/images/aws-iot-core-mosquitto/to-create-iot-policy.png)

`ポリシー名` には任意のポリシー名を入力します。今回は `example-policy` とします。
ポリシーステートメントは次のように設定します。

| ポリシー効果 | ポリシーアクション | ポリシーリソース |
| ------------ | ------------------ | ---------------- |
| `許可`       | `iot:Connect`      | `*`              |
| `許可`       | `iot:Publish`      | `*`              |
| `許可`       | `iot:Subscribe`    | `*`              |
| `許可`       | `iot:Receive`      | `*`              |

:::details JSON の場合

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "iot:Connect",
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": "iot:Publish",
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": "iot:Subscribe",
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": "iot:Receive",
      "Resource": "*"
    }
  ]
}
```

:::

:::message

実際は用途に合わせて最小限の権限を設定することを推奨します。
以下のドキュメントに用途に合わせたポリシーの設定例が記載されているため、詳しくはこちらをご参照ください。

- [パブリッシュ/サブスクライブポリシーの例 - AWS IoT Core](https://docs.aws.amazon.com/ja_jp/iot/latest/developerguide/pub-sub-policy.html)

:::

それぞれ入力できたら `作成` をクリックします。
これでポリシーが作成されます。

![](/images/aws-iot-core-mosquitto/create-iot-policy.png)

## 証明書にポリシーをアタッチ

作成したポリシーを証明書にアタッチします。

左メニューから `セキュリティ` > `証明書` をクリックし、「[証明書を作成](#証明書を作成)」手順で作成した証明書をクリックします。

![](/images/aws-iot-core-mosquitto/to-certificate.png)

`ポリシーをアタッチ` をクリックします。

![](/images/aws-iot-core-mosquitto/to-attach-policy-to-certificate.png)

「[ポリシーを作成](#ポリシーを作成)」手順で作成したポリシーを選択し、 `ポリシーをアタッチ` をクリックします。
これで証明書にポリシーがアタッチされます。

![](/images/aws-iot-core-mosquitto/attach-policy-to-certificate.png)

## エンドポイントを確認

AWS IoT Core のデバイスデータエンドポイントを確認しておきます。
左メニューの `設定` からエンドポイントを確認することができます。
こちらの値は後で必要になるため控えておきます。

![](/images/aws-iot-core-mosquitto/get-endpoint.png)

# Publish

Mosquitto を使用してメッセージを Publish する手順です。

まずは Publish されたメッセージを確認できるようにトピックを Subscribe します。
AWS IoT Core のマネジメントコンソールで左メニューから `MQTT テストクライアント` をクリックします。
`トピックをサブスクライブする` をクリックし、 `トピックのフィルター` には `#` ( ワイルドカード ) を入力します。
入力できたら `サブスクライブ` をクリックして Subscribe を開始します。

![](/images/aws-iot-core-mosquitto/subscribe-topic.png)

続いてデバイス ( 今回は Mac ) から Mosquitto を使用してメッセージを Publish します。
次のコマンドを実行します。

```sh
$ mosquitto_pub \
    --cafile "path/to/AmazonRootCA1.pem" \
    --cert "path/to/<証明書ID>-certificate.pem.crt" \
    --key "path/to/<証明書ID>-private.pem.key" \
    --host "<AWS IoT Coreのデバイスデータエンドポイント>" \
    --port 8883 \
    --topic "messages/test" \
    --message '{"message":"hello world"}' \
    --debug
```

| フラグ      | 説明                                                                                                |
| ----------- | --------------------------------------------------------------------------------------------------- |
| `--cafile`  | 「[証明書を作成](#証明書を作成)」手順でダウンロードした Amazon ルート CA 1 証明書へのファイルパス。 |
| `--cert`    | 「[証明書を作成](#証明書を作成)」手順でダウンロードしたデバイス証明書へのファイルパス。             |
| `--key`     | 「[証明書を作成](#証明書を作成)」手順でダウンロードしたプライベートキーへのファイルパス。           |
| `--host`    | 「[エンドポイントを確認](#エンドポイントを確認)」手順で確認したエンドポイント。                     |
| `--port`    | ポート番号。 `8883` ( MQTTS ) を指定。                                                              |
| `--topic`   | メッセージを Publish する任意のトピック名。<br/>今回は `messages/test` とします。                   |
| `--message` | Publish する任意のメッセージペイロード。<br/>今回は `{"message":"hello world"}` とします。          |
| `--debug`   | デバッグメッセージを出力する。                                                                      |

成功すると以下のように出力されます。

```:出力
Client null sending CONNECT
Client null received CONNACK (0)
Client null sending PUBLISH (d0, q0, r0, m1, 'messages/test', ... (25 bytes))
Client null sending DISCONNECT
```

AWS の MQTT テストクライアントで Publish されたメッセージが確認できます。

![](/images/aws-iot-core-mosquitto/published.png)

# Subscribe

Mosquitto を使用してトピックを Subscribe する手順です。

デバイス ( 今回は Mac ) から Mosquitto を使用して AWS IoT Core のトピックを Subscribe します。
次のコマンドを実行します。

```sh
$ mosquitto_sub \
    --cafile "path/to/AmazonRootCA1.pem" \
    --cert "path/to/<証明書ID>-certificate.pem.crt" \
    --key "path/to/<証明書ID>-private.pem.key" \
    --host "<AWS IoT Coreのデバイスデータエンドポイント>" \
    --port 8883 \
    --topic "messages/test" \
    --debug
```

| フラグ     | 説明                                                                                                |
| ---------- | --------------------------------------------------------------------------------------------------- |
| `--cafile` | 「[証明書を作成](#証明書を作成)」手順でダウンロードした Amazon ルート CA 1 証明書へのファイルパス。 |
| `--cert`   | 「[証明書を作成](#証明書を作成)」手順でダウンロードしたデバイス証明書へのファイルパス。             |
| `--key`    | 「[証明書を作成](#証明書を作成)」手順でダウンロードしたプライベートキーへのファイルパス。           |
| `--host`   | 「[エンドポイントを確認](#エンドポイントを確認)」手順で確認したエンドポイント。                     |
| `--port`   | ポート番号。 `8883` ( MQTTS ) を指定。                                                              |
| `--topic`  | Subscribe する任意のトピック名。<br/>今回は `messages/test` とします。                              |
| `--debug`  | デバッグメッセージを出力する。                                                                      |

成功すると以下のように出力され、待機状態になります。

```:出力
Client null sending CONNECT
Client null received CONNACK (0)
Client null sending SUBSCRIBE (Mid: 1, Topic: messages/test, QoS: 0, Options: 0x00)
Client null received SUBACK
Subscribed (mid: 1): 0
```

続いて Subscribe しているトピックに対してメッセージを Publish します。
AWS IoT Core のマネジメントコンソールで左メニューから `MQTT テストクライアント` をクリックします。
`トピックに公開する` をクリックし、 `トピック名` には `messages/test` ( Subscribe しているトピック名 ) を入力します。
`メッセージペイロード` はそのままにしておいて `発行` をクリックします。

![](/images/aws-iot-core-mosquitto/publish-from-aws.png)

`mosquitto_sub` を実行しているターミナルから Publish されたメッセージが確認できます。

```sh
Client null received PUBLISH (d0, q0, r0, m0, 'messages/test', ... (57 bytes))
{
  "message": "AWS IoT コンソールからの挨拶"
}
```

# まとめ

IoT 楽しい。

# 関連

https://zenn.dev/kou_pg_0131/articles/aws-iot-rule-to-timestream

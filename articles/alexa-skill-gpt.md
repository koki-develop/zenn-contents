---
title: "ChatGPT と会話できる Alexa スキルを作った"
emoji: "💬"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["alexa", "openai", "chatgpt"]
published: true
---

ブラックフライデーに Amazon Echo Show を購入したので作ってみました。
↓こういうの。

https://x.com/koki_develop/status/1730932469111922993

ソースコードは [GitHub](https://github.com/koki-develop/alexa-skill-gpt) で公開しています。

https://github.com/koki-develop/alexa-skill-gpt

万が一乱用されたら OpenAI API の料金が爆発してしまうのでスキルの公開予定はありません。

# 参考にした資料

元々 Alexa スキル開発についての知見は皆無でしたが、「[Alexaスキル開発トレーニング](https://developer.amazon.com/ja-JP/alexa/alexa-skills-kit/get-deeper/tutorials-code-samples/build-a-skill)」というサイトがとても参考になりました。
基本的な開発の進め方や知識・概念等がわかりやすくまとまっているので、これから初めて Alexa スキルを開発をする方は一読しておくといいのではないでしょうか。

https://developer.amazon.com/ja-JP/alexa/alexa-skills-kit/get-deeper/tutorials-code-samples/build-a-skill

# 開発関連の話

<!-- textlint-disable aws-service-name -->

## Alexa Skills Kit Command Line interface (ask-cli)

<!-- textlint-enable aws-service-name -->

<!-- textlint-disable aws-service-name -->

プロジェクトの初期化やスキルの作成については Alexa Skills Kit Command Line interface (ask-cli) を使っています。

<!-- textlint-enable aws-service-name -->

https://github.com/alexa/ask-cli

例えばスキルを作るときは `ask new` を実行するだけで対話的なセットアップが開始され、もろもろよしなに準備してくれます。
ホスティングに Alexa-hosted スキルを使用すれば、これだけであっという間にスキルを開発 ~ 簡単にデプロイできる状態になります。

他にも ask-cli には様々な機能があります。

```console
$ ask help
Usage: ask [options] [command]

Command Line Interface for Alexa Skill Kit

Options:
  -V, --version        output the version number
  -h, --help           output usage information

Commands:
  configure [options]  helps to configure the credentials that ask-cli uses to
                       authenticate the user to Amazon developer services
  deploy [options]     deploy the skill project
  new [options]        create a new skill project from Alexa skill templates
  init [options]       setup a new or existing Alexa skill project
  dialog [options]     simulate your skill via an interactive dialog with Alexa
  run [options]        Starts a local instance of your project as the skill
                       endpoint. Automatically re-routes development requests and
                       responses between the Alexa service and your local
                       instance.
  smapi                list of Alexa Skill Management API commands
  skill                increase the productivity when managing skill metadata
  util                 tooling functions when using ask-cli to manage Alexa
                       Skill
  help [cmd]           display help for [cmd]
```

ask-cli の詳細については下記ドキュメントをご参照ください。

https://developer.amazon.com/ja-JP/docs/alexa/smapi/ask-cli-intro.html

## ホスティング

ホスティングについては Alexa-hosted スキルを使用しています。

https://developer.amazon.com/ja-JP/docs/alexa/hosted-skills/build-a-skill-end-to-end-using-an-alexa-hosted-skill.html

Alexa-hosted スキルを使用すると開発者に代わって Alexa がコードとリソースを AWS に保存します。
自分でインフラ環境を準備する必要が無いので、スキルを素早くデプロイできるというメリットがあります。利用制限はあるものの、お金もかかりません。
また、必要に応じて後から自分の AWS アカウントに切り替えることも可能です。

https://developer.amazon.com/ja-JP/docs/alexa/hosted-skills/alexa-hosted-skills-personal-aws.html

## OpenAI API

ユーザーの発言に対する回答の作成には OpenAI API を使用しています。
実装には [`openai`](https://www.npmjs.com/package/openai) パッケージを使用しています。

https://www.npmjs.com/package/openai

[`openai`](https://www.npmjs.com/package/openai) パッケージを使うとこんな感じで簡単に Chat Completions API を実行できます。便利。

```js
const { OpenAI } = require("openai");

// クライアントの初期化
const openai = new OpenAI({ apiKey: "<APIキー>" });

// Chat Completions API の実行
const response = await openai.chat.completions.create({
  model: "gpt-3.5-turbo",
  messages: [{ role: "user", content: "<質問内容>" }],
});
```

モデルには GPT-3.5-Turbo を使用しています。
GPT-4 は GPT-3.5-Turbo と比べるとレスポンスがやや遅く、 Alexa のタイムアウト値である 8 秒をオーバーすることが多かったので諦めました。

## OpenAI API キーの管理

ホスティングに Alexa-hosted スキルを使用している場合、自分では環境変数を設定できません。
幸い DynamoDB が使えるので、

1. コンソールから**手作業**で DynamoDB に OpenAI の API キーを保存
2. 必要なタイミングで実装側にて DynamoDB から API キーを取得する

という方法を取りました。

DynamoDB に↓こんな感じで API キーを保存しておいて、

| id (key) | value |
| --- | --- |
| `OPENAI_API_KEY` | OpenAI API キー |

↓こういう関数を用意しておいて、

```js
const { DynamoDB } = require("aws-sdk");

module.exports.getValue = async (key) => {
  const db = new DynamoDB.DocumentClient({
    // DYNAMODB_PERSISTENCE_REGION 環境変数に AWS リージョンが入ってる
    region: process.env.DYNAMODB_PERSISTENCE_REGION,
  });
  const data = await db
    .get({
      // DYNAMODB_PERSISTENCE_TABLE_NAME 環境変数に DynamoDB テーブル名が入ってる
      TableName: process.env.DYNAMODB_PERSISTENCE_TABLE_NAME,
      Key: { id: key },
    })
    .promise();
  return data.Item.value;
};
```

↓こんな感じで使ってます。

```js
const { OpenAI } = require("openai");

const apiKey = await getValue("OPENAI_API_KEY");
const openai = new OpenAI({ apiKey });
```

# まとめ

Alexa 便利ですね〜。

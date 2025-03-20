---
title: "Step CI で手軽に API をテストする"
emoji: "🧪"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["stepci", "api", "graphql", "grpc", "ci"]
published_at: 2022-12-01 18:00
published: true
---

[**3-shake Advent Calendar 2022**](https://qiita.com/advent-calendar/2022/3-shake) の 1 日目です。
[株式会社スリーシェイク](https://3-shake.com/)のメンバーが各々自由に技術・非技術ネタを投稿していきます。

https://qiita.com/advent-calendar/2022/3-shake

1 日目のこの記事では、 [Step CI](https://stepci.com/) という API テストツールが最高だったので紹介します。

# 概要

[Step CI](https://stepci.com/) は API をテストするためのシンプルなオープンソースのコマンドラインツールです。
REST はもちろん、 GraphQL や gRPC などその他様々な種類の API に対応しています。
[`stepci`](https://www.npmjs.com/package/stepci) CLI をインストールして簡単な YAML ファイルを作成するだけで API のテストを実行することができます。

![](/images/stepci-introduction/demo.gif)
_実行イメージ_

https://stepci.com
https://github.com/stepci/stepci

# 検証環境

- [Step CI](https://stepci.com/) v2.5.5
- [Node.js](https://nodejs.org) v18.12.1

# リポジトリ

この記事内で使用しているサンプルコードは以下のリポジトリで管理しています。

https://github.com/koki-develop/stepci-example

# 使い方

## 1. インストール

https://www.npmjs.com/package/stepci

[`stepci`](https://www.npmjs.com/package/stepci) CLI をインストールします。
`npm` もしくは `yarn` を使ってインストールすることができます。

```sh
$ npm install -g stepci
# or
$ yarn global add stepci
```

## 2. ワークフローを定義する

ワークフローを定義する YAML 形式のファイルを作成します。
下記は `https://jsonplaceholder.typicode.com/posts/2` に GET リクエストを送信し、レスポンスの内容を検証するワークフローのサンプルです。

```yaml:workflow.yml
version: "1.1"
name: Validating JSON

# ワークフローの設定
config:
  # HTTP クライアントの設定
  http:
    # テストする API のベース URL
    baseURL: https://jsonplaceholder.typicode.com

# 環境変数
env:
  postId: 2 # ${{env.postId}} のように使うことができる

# テスト
tests:
  example:
    steps:
      - name: GET request
        http:
          # リクエストするパス
          # フルで指定してもいい (config.http.baseURL とは異なる URL を指定するときなど)
          # 例) url: https://jsonplaceholder.typicode.com/posts/${{env.postId}}
          url: /posts/${{env.postId}}
          # HTTP メソッド
          method: GET
          # 検証
          check:
            # ステータスコード
            status: 200
            # レスポンスヘッダ
            headers:
              Content-Type: application/json; charset=utf-8
            # JSON の内容
            jsonpath:
              $.id: ${{env.postId}}
              $.userId: 1
```

レスポンスの検証では正規表現を使用したりその他様々なマッチャを使用することも可能です。

```yaml:workflow.yml
# ...省略
tests:
  example:
    steps:
      - name: GET request
        http:
          # ...省略
          check:
            # `/` で囲むと正規表現を使用できる
            status: /^20/
            # 様々なマッチャを複数使用できる
            jsonpath:
              $.userId:
                - isNumber: true # userId が数値であることを検証
                - lt: 999 # userId が 999 未満であることを検証
```

ここで記述している設定以外にも多数の設定項目やマッチャが用意されています。
詳細については以下のドキュメントをご参照ください。

https://docs.stepci.com/reference/workflow-syntax.html
https://docs.stepci.com/reference/matchers.html

## 3. テストを実行する

`stepci run <ワークフローファイル>` のように実行することで API テストが実行されます。

```sh
$ stepci run ./workflow.yml
```

![](/images/stepci-introduction/demo.gif)
_実行イメージ_

かんたん！

上記で紹介したサンプルコードは単一のステップを含む単一のテストしか実行していませんが、複数のステップを含む複数のテストを実行するワークフローを作成することも可能です。

```yaml:workflow.yml
version: "1.1"
name: Multiple tests

tests:
  example1:
    steps:
      - name: Step 1
        # ...省略
      - name: Step 2
        # ...省略
  example2:
    steps:
      # ...省略
```

# 使用データの収集について

[`stepci`](https://www.npmjs.com/package/stepci) CLI は実行時にデフォルトで Node.js のバージョンや CLI のバージョンなどといった匿名の使用データを収集します。
収集を無効にしたい場合は `STEPCI_DISABLE_ANALYTICS` 環境変数を設定してください。

```sh:例
# 値はなんでもいい
$ export STEPCI_DISABLE_ANALYTICS=1
```

詳しくは以下のドキュメントをご参照ください。

https://docs.stepci.com/legal/privacy.html

# GitHub Actions で実行する

[Step CI](https://stepci.com/) では GitHub Actions 上で実行するためのアクションも用意されています。

https://docs.stepci.com/integration/actions.html
https://github.com/marketplace/actions/step-ci-action

下記は `workflow.yml` を読み込んで [Step CI](https://stepci.com/) を実行するワークフローのサンプルです。

```yaml:.github/workflows/main.yml
name: api test

on:
  push:

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - uses: stepci/stepci@main
        env:
          STEPCI_DISABLE_ANALYTICS: "1" # データの収集を無効にする場合は設定する
        with:
          workflow: workflow.yml # ワークフローファイルを指定
```

# ライブラリとして使う

[`@stepci/runner`](https://www.npmjs.com/package/@stepci/runner) を使うことで [Step CI](https://stepci.com/) をライブラリとして使用することも可能です。
ちゃんと TypeScript もサポートされています ( ありがたい ) 。

https://docs.stepci.com/guides/using-library.html
https://github.com/stepci/runner

## 1. インストール

https://www.npmjs.com/package/@stepci/runner

`npm` もしくは `yarn` を使ってインストールすることができます。

```sh
$ npm install --save-dev @stepci/runner
# or
$ yarn add --dev @stepci/runner
```

## 2. サンプルコード

`runFromFile` を使うとワークフローをファイルから読み込んで実行します。
下記は `workflow.yml` を読み込んで [Step CI](https://stepci.com/) による API テストを実行するサンプルコードです。

```ts
import { runFromFile } from '@stepci/runner';
runFromFile("./workflow.yml").then(console.log);
// => {
//      workflow: {
//        version: '1.1',
//        name: 'Validating JSON',
//        config: { http: [Object] },
//        env: { postId: '2' },
//        tests: { example: [Object] }
//      },
//      result: {
//        tests: [ [Object] ],
//        timestamp: 2022-11-26T00:27:43.634Z,
//        passed: true,
//        duration: 93,
//        co2: 0.00009952956000000001
//      },
//      path: './workflow.yml'
//    }
```

また、 `run` を使うとファイルを用意せずにワークフロー定義の JSON を直接渡すことができます。
より柔軟に設定をしたい場合に便利です。

```ts
import { run } from '@stepci/runner';

const workflow = {
  version: "1.1",
  name: "Validating JSON",
  config: {
    http: { baseURL: "https://jsonplaceholder.typicode.com" },
  },
  env: { postId: "2" },
  tests: {
    example: {
      steps: [
        {
          name: "GET request",
          http: {
            url: "/posts/${{env.postId}}",
            method: "GET",
            check: {
              status: 200,
              headers: { "Content-Type": "application/json; charset=utf-8" },
              jsonpath: { "$.id": "${{env.postId}}", "$.userId": 1 },
            },
          },
        },
      ],
    },
  },
};

run(workflow).then(console.log)
// => {
//      workflow: {
//        version: '1.1',
//        name: 'Validating JSON',
//        config: { http: [Object] },
//        env: { postId: '2' },
//        tests: { example: [Object] }
//      },
//      result: {
//        tests: [ [Object] ],
//        timestamp: 2022-11-26T00:27:43.598Z,
//        passed: true,
//        duration: 131,
//        co2: 0.00009952956000000001
//      },
//      path: undefined
//    }
```

# ユニットテストフレームワークと統合する

上述した [`@stepci/runner`](https://www.npmjs.com/package/@stepci/runner) を使うことで [Step CI](https://stepci.com/) を [Jest](https://jestjs.io/ja/) や [Vitest](https://vitest.dev/) などといったユニットテストフレームワークと統合することも可能です。

https://docs.stepci.com/integration/jest.html

下記は [Vitest](https://vitest.dev/) で [Step CI](https://stepci.com/) による API テストを実行するサンプルコードです。

```ts:api.test.ts
import { run, runFromFile } from "@stepci/runner";
import { expect, it } from "vitest";

it("from file", async () => {
  const { result } = await runFromFile("./workflow.yml");
  expect(result.passed).toBe(true);
});

it("from config", async () => {
  const workflow = {
    version: "1.1",
    name: "Validating JSON",
    config: {
      http: { baseURL: "https://jsonplaceholder.typicode.com" },
    },
    env: { postId: "2" },
    tests: {
      example: {
        steps: [
          {
            name: "GET request",
            http: {
              url: "/posts/${{env.postId}}",
              method: "GET",
              check: {
                status: 200,
                headers: { "Content-Type": "application/json; charset=utf-8" },
                jsonpath: { "$.id": "${{env.postId}}", "$.userId": 1 },
              },
            },
          },
        ],
      },
    },
  };

  const { result } = await run(workflow);
  expect(result.passed).toBe(true);
});
```

## その他

他にも [Step CI](https://stepci.com/) は様々な機能をサポートしています。

[Examples](https://github.com/stepci/stepci/tree/main/examples) にサンプルの YAML ファイルが豊富に用意されているため、参考にしてみてください。
例えば次のようなものが用意されています。

- [Basic 認証](https://github.com/stepci/stepci/blob/main/examples/auth.yml)
- [GraphQL](https://github.com/stepci/stepci/blob/main/examples/graphql.yml)
- [gRPC](https://github.com/stepci/stepci/blob/main/examples/grpc.yml)
- [画像などのバイナリデータの検証](https://github.com/stepci/stepci/blob/main/examples/bytes.yml)
- [CO2 の排出量の検証](https://github.com/stepci/stepci/blob/main/examples/co2.yml)
- [レスポンスの内容をステップ間で共有する](https://github.com/stepci/stepci/blob/main/examples/captures.yml)

他にも [Open API 定義からワークフローを自動生成したり](https://docs.stepci.com/import/openapi.html)、 [csv ファイルからテストデータを読み込んだり](https://docs.stepci.com/guides/using-test-data.html)、[ダミーデータを使用したり](https://docs.stepci.com/guides/using-fake-data.html)など、とにかく機能が豊富すぎて紹介しきれないので詳細については[公式ドキュメント](https://docs.stepci.com)をご参照ください。

https://docs.stepci.com

# まとめ

使い方が非常にシンプルかつ機能も豊富なのでめちゃくちゃ良いです。
とにかく導入が楽ですぐ始められるので、手軽に API テストを導入したいときに最適なのではないのでしょうか。

:::message
以前僕が公開した [Badge Generator](https://badgen.org/) というサービスでは実際に API のテストに [Step CI](https://stepci.com/) を使用しています。
[Badge Generator](https://badgen.org/) については以下の記事をご参照ください。
- [**Zenn や Qiita や AtCoder のバッジを生成できるサービスを公開しました**](https://zenn.dev/kou_pg_0131/articles/badge-generator-introduction)
:::

明日は [@nwiizo](https://twitter.com/nwiizo) さんの [**`「セキュア・バイ・デザイン」を読んで自分が何番目の豚かを考える。`**](https://syu-m-5151.hatenablog.com/entry/2022/12/01/225019) です。わくわく。

https://qiita.com/advent-calendar/2022/3-shake

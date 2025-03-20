---
title: "コンテナイメージを使用して Lambda 関数を作成する"
emoji: "🔥"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["aws", "lambda", "docker", "nodejs"]
published: true
---

AWS Lambda ではコンテナイメージをそのままデプロイできる機能があります。

[AWS Lambda の新機能 – コンテナイメージのサポート | Amazon Web Services ブログ](https://aws.amazon.com/jp/blogs/news/new-for-aws-lambda-container-image-support/)

というわけで、手順を簡単にまとめてみました。

# ソースコードを作成する

なにはともあれ、まずは Lambda 関数にデプロイするソースコードを作成します。
今回は Node.js で作成します。

まず `package.json` を作成します。

```json:package.json
{
  "name": "lambda-container-image-example",
  "license": "MIT"
}
```

`npm install` を実行して `package-lock.json` を作成しておきます。

```sh
# `npm i` でも可
$ npm install
```

`index.js` というファイルを作成し ( ファイル名は任意のもので大丈夫です ) 、 Lambda 関数で実行するハンドラコードを実装します。
イベント内容をそのまま返すだけのシンプルな内容にしておきます。

```js:index.js
exports.handler = async (event) => {
  return event;
};
```

# コンテナイメージを作成する

## Dockerfile を作成する

`Dockerfile` を作成します。
今回ベースイメージには AWS が提供しているイメージを使用します。

:::message
Lambda 用の AWS ベースイメージの一覧は「 [Lambdaコンテナーイメージのランタイムサポート \- AWS Lambda](https://docs.aws.amazon.com/ja_jp/lambda/latest/dg/runtimes-images.html) 」を参照してください。
また、任意のベースイメージを使用する方法については「 [Lambda コンテナイメージの作成 - AWS Lambda](https://docs.aws.amazon.com/ja_jp/lambda/latest/dg/images-create.html#images-create-2) 」を参照してください。
:::

```Dockerfile:Dockerfile
# AWS ベースイメージを使用
FROM public.ecr.aws/lambda/nodejs:14

# ソースコードを関数のルートディレクトリにコピーします。
# 関数のルートディレクトリは `LAMBDA_TASK_ROOT` 環境変数を上書きすることで変更することができます ( デフォルトは `/var/task` ) 。
COPY index.js package.json package-lock.json /var/task/
RUN npm install

# CMD にハンドラを設定します。
# Node.js の場合は `{ファイル名(拡張子なし)}.{関数名}` のように指定します。
# 今回は `index.js` の `handler` 関数をハンドラとして用意しているので以下のようになります。
CMD ["index.handler"]
```

## ローカルで実行してみる

[ランタイムインターフェイスエミュレータ](https://docs.aws.amazon.com/ja_jp/lambda/latest/dg/images-test.html)を使用して関数をローカルで実行することができます。

まずコンテナイメージをビルドします。

```
$ docker build -t lambda-container-image-example .
```

`docker run` でコンテナを起動します。

```
$ docker run --rm -p 8080:8080 lambda-container-image-example:latest
```

`localhost:8080/2015-03-31/functions/function/invocations` に POST リクエストを送信することで関数を実行することができます。

```
$ curl -X POST "http://localhost:8080/2015-03-31/functions/function/invocations" -d '{"key":"value"}'
{"key":"value"}
```

# ECR リポジトリにイメージをプッシュする

## ECR リポジトリを作成する

[マネジメントコンソール](https://console.aws.amazon.com/ecr/repositories) から`リポジトリを作成`をクリックし、 ECR リポジトリを作成します。
今回リポジトリ名は `lambda-container-image-example` にします。
それ以外はデフォルト設定のままで `リポジトリを作成` をクリックします。

![](https://storage.googleapis.com/zenn-user-upload/m4jmkmm5l8y20uuxrcv42f6sqo54)

## イメージをプッシュする

ローカルでイメージをビルドして ECR リポジトリにプッシュします。
ビルド ~ プッシュするためのコマンドは[マネジメントコンソール](https://console.aws.amazon.com/ecr/repositories)でリポジトリを選択した状態で `プッシュコマンドの表示` をクリックして確認することができます。

![](https://storage.googleapis.com/zenn-user-upload/yb7jnqh1k6bxrqkg7pih56qcgvzj)
![](https://storage.googleapis.com/zenn-user-upload/te4bwfbtpjovst16ikj6srcjm9ie)

実際のコマンドは以下のようになります。

```sh
# ログイン
$ aws ecr get-login-password --region {リージョン} | docker login --username AWS --password-stdin {アカウントID}.dkr.ecr.{リージョン}.amazonaws.com

# コンテナイメージをビルド
$ docker build -t lambda-container-image-example .

# イメージにタグをつける
$ docker tag lambda-container-image-example:latest {アカウントID}.dkr.ecr.{リージョン}.amazonaws.com/lambda-container-image-example:latest

# ECR にイメージをプッシュ
$ docker push {アカウントID}.dkr.ecr.{リージョン}.amazonaws.com/lambda-container-image-example:latest
```

# コンテナイメージを使用して Lambda 関数を作成する

[マネジメントコンソール](https://console.aws.amazon.com/lambda/home?#/create/function?intent=authorFromImage) から関数を作成します。

オプションで`コンテナイメージ`を選択します。
関数名は今回は `lambda-container-image-example` にしておきます。
コンテナイメージ URI には先程 ECR リポジトリにプッシュしたコンテナイメージの URI を入力します。
今回は `{アカウントID}.dkr.ecr.{リージョン}.amazonaws.com/lambda-container-image-example:latest` のようになります。

![](https://storage.googleapis.com/zenn-user-upload/xgcsxtdard843zz5qwhcjukuhapl)

これでコンテナイメージを使用した Lambda 関数の作成が完了しました。

![](https://storage.googleapis.com/zenn-user-upload/znyh7mpvatq5xgeohgqax48o9val)

# GitHub

https://github.com/koki-develop/lambda-container-image-example

# 参考

https://docs.aws.amazon.com/ja_jp/lambda/latest/dg/lambda-images.html

---
title: "GitHub Actions で GitHub の画像キャッシュをクリアする"
emoji: "🗑️"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["github", "githubactions"]
published: true
---

GitHub では README などに載せた画像は Camo という画像プロキシ経由で `https://camo.githubusercontent.com/...` のような URL で配信されるのですが、たまにこれらの画像が長期間キャッシュされてしまうことがあります。
例えば僕の [GitHub Profile](https://github.com/koki-develop) には [Badge Generator](https://badgen.org) で作成した Zenn や Qiita のバッジを表示しているのですが、これらの画像が長期間キャッシュされて正しい数値が表示されていないことがありました。

![](/images/hub-purge-action-usage/profile.png)
_[GitHub Profile](https://github.com/koki-develop)_

これらの画像キャッシュをクリアするシェルスクリプトなどはよく見かけるのですが、 GitHub Actions でサクッと使える Action が欲しかったので [Hub Purge](https://github.com/marketplace/actions/hub-purge) という Action を作りました。

https://github.com/marketplace/actions/hub-purge

この記事では [Hub Purge](https://github.com/marketplace/actions/hub-purge) の使い方と仕組みについて紹介します。

:::message
[Badge Generator](https://badgen.org) については以下の記事をご参照ください。
- [Zenn や Qiita や AtCoder のバッジを生成できるサービスを公開しました](https://zenn.dev/kou_pg_0131/articles/badge-generator-introduction)
:::

# リポジトリ

https://github.com/koki-develop/hub-purge-action

# [Hub Purge](https://github.com/marketplace/actions/hub-purge) の使い方

## 基本的な使い方

`uses` で Action を呼び出すだけで使えます。
これでワークフローを実行したリポジトリのデフォルトブランチの `README.md` 上の画像のキャッシュをクリアします。

```yaml:.github/workflows/example.yml
- uses: koki-develop/hub-purge-action@v1
```

## リポジトリを指定する

対象のリポジトリを指定することもできます。
以下の場合は [koki-develop/koki-develop](https://github.com/koki-develop/koki-develop) リポジトリの `README.md` 上の画像のキャッシュをクリアします。

```yaml:.github/workflows/example.yml
- uses: koki-develop/hub-purge-action@v1
  with:
    repository: koki-develop/koki-develop
```

## ブランチを指定する

ブランチを指定することもできます。
以下の場合は `develop` ブランチの `README.md` 上の画像のキャッシュをクリアします。

```yaml:.github/workflows/example.yml
- uses: koki-develop/hub-purge-action@v1
  with:
    branch: develop
```

## ファイルパスを指定する

画像のキャッシュをクリアする対象のファイルパスを指定することもできます。
以下の場合は `path/to/README.md` の画像のキャッシュをクリアします。

```yaml:.github/workflows/example.yml
- uses: koki-develop/hub-purge-action@v1
  with:
    path: path/to/README.md
```

改行区切りで複数指定することもできます。
以下の場合は `README.md` と `README.ja.md` の画像のキャッシュをクリアします。

```yaml:.github/workflows/example.yml
- uses: koki-develop/hub-purge-action@v1
  with:
    path: |
      README.md
      README.ja.md
```

# 使用例

普通にキャッシュをクリアしたいリポジトリの GitHub Actions で使用してもいいのですが、僕は専用のリポジトリを一つ用意しています。

https://github.com/koki-develop/hub-purge

このリポジトリ内で以下のようなワークフローを作成しています。
このワークフローは毎日 0 時のタイミングで [koki-develop/koki-develop](https://github.com/koki-develop/koki-develop) リポジトリの `README.md` 上の画像のキャッシュをクリアしています。
( 任意のタイミングで実行できるように `workflow_dispatch` も入れてます )

https://github.com/koki-develop/hub-purge/blob/main/.github/workflows/daily.yml

他にも画像のキャッシュをクリアしたいリポジトリがあればただここに追記していくだけなので、他のリポジトリに変更を加える必要が無いのがメリットです。

# 仕組み

まず前提知識として、 `https://camo.githubusercontent.com/...` で配信されている画像はその URL に `PURGE` という HTTP メソッドでリクエストを送信するとキャッシュをクリアすることができます。

```sh
$ curl -X PURGE https://camo.githubusercontent.com/...
{"status": "ok", "id": "216-8675309-1008701"}
```

https://docs.github.com/ja/authentication/keeping-your-account-and-data-secure/about-anonymized-urls#removing-an-image-from-camos-cache

[Hub Purge](https://github.com/marketplace/actions/hub-purge) では上記の仕様を利用して、 README 上の画像の `https://camo.githubusercontent.com/` で始まる URL を全て取得して、それぞれの URL に対して `PURGE` リクエストを送信しているだけです。
より具体的に言うと下記のような流れです。

1. [axios](https://www.npmjs.com/package/axios) で README のページの HTML を取得
1. 取得した HTML を [cheerio](https://www.npmjs.com/package/cheerio) でパース
1. `src` 属性が `https://camo.githubusercontent.com/` で始まる `img` 要素を全て取得して画像 URL を取得
1. 取得した全ての画像 URL に対して [axios](https://www.npmjs.com/package/axios) で `PURGE` リクエストを送信

ちなみに [Hub Purge](https://github.com/marketplace/actions/hub-purge) という名前は [@mpyw](https://twitter.com/mpyw) さんが作った [hub-purge](https://github.com/mpyw/hub-purge) から~~パクりました~~。

https://github.com/mpyw/hub-purge

# 参考

https://docs.github.com/ja/authentication/keeping-your-account-and-data-secure/about-anonymized-urls#removing-an-image-from-camos-cache
https://qiita.com/mpyw/items/16b693cb62820b480ce2

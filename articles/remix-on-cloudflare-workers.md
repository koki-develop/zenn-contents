---
title: "Remix で作成したアプリを Cloudflare Workers にデプロイする"
emoji: "🐕"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["remix", "cloudflareworkers"]
published: true
---

Remix で作成したアプリを Cloudflare Workers にデプロイするまでの手順メモ。

# 検証環境

- node v16.15.0
- create-remix v1.5.1
- wrangler v1.19.12

# 前提

- Cloudflare アカウントが作成済
- Cloudflare Workers のサブドメインが設定済

# 手順

## Remix アプリを作成

なにはともあれとりあえず Remix アプリを作成する。

まず最初に以下のコマンドを実行する。

```
$ npx create-remix@latest
```

アプリを作成する場所を聞かれる。
ここでは `remix-example` とする。

```
? Where would you like to create your app? (./my-remix-app) remix-example
```

アプリの種類を聞かれる。
`Just the basics` を選択する。

```
? What type of app do you want to create? (Use arrow keys)
❯ Just the basics
  A pre-configured stack ready for production
```

デプロイ先を聞かれる。
今回は Cloudflare Workers にデプロイしたいので `Cloudflare Workers` を選択する。

```
? Where do you want to deploy? Choose Remix if you're unsure; it's easy to change deployment targets. (Use arrow
keys)
  Remix App Server
  Express Server
  Architect (AWS Lambda)
  Fly.io
  Netlify
  Vercel
  Cloudflare Pages
❯ Cloudflare Workers
  Deno
(Move up and down to reveal more choices)
```

`npm install` を実行するか聞かれる。
`Y` を入力するとインストールが開始される。

```
? Do you want me to run `npm install`? (Y/n) Y
```

最後に TypeScript と JavaScript のどっちを使うかを聞かれるので好きな方を選択する。
今回は `TypeScript` を選択する。

```
? TypeScript or JavaScript? (Use arrow keys)
❯ TypeScript
  JavaScript
```

以下のようなメッセージが表示されれば作成完了。

```
💿 That's it! `cd` into "/remix-example" and check the README for development and deploy instructions!
```

最初に指定した場所 ( 今回は `remix-example/` ) 内にソースコードが生成されている。

```
$ ls
remix-example

$ tree remix-example -I node_modules
remix-example
├── README.md
├── app
│   ├── entry.client.tsx
│   ├── entry.server.tsx
│   ├── root.tsx
│   └── routes
│       └── index.tsx
├── package-lock.json
├── package.json
├── public
│   └── favicon.ico
├── remix.config.js
├── remix.env.d.ts
├── server.js
├── tsconfig.json
└── wrangler.toml

3 directories, 13 files
```

## ローカルで Remix アプリを起動する

作成されたディレクトリ ( 今回は `remix-example/` ) 内に移動して `npm run dev` を実行するとローカルで Remix アプリケーションを起動できる。

```sh
$ cd remix-example
$ npm run dev

# ...省略

Building Remix app in development mode...
Built in 200ms
[mf:inf] Build succeeded
[mf:inf] Worker reloaded! (0.54MiB)
[mf:inf] Listening on :8787
[mf:inf] - http://127.0.0.1:8787
[mf:inf] - http://192.168.11.6:8787
[mf:inf] Updated Request cf object cache!
```

http://localhost:8787 にアクセスすると Remix アプリが起動していることを確認できる。

![](/images/remix-on-cloudflare-workers/app-local.png)

## Cloudflare Workers サービスを作成する

https://dash.cloudflare.com にアクセスする。
左サイドバーから `Workers` を選択し、 `サービスを作成` をクリック。

![](/images/remix-on-cloudflare-workers/cloudflare-workers.png)

サービスの作成画面に遷移される。
サービス名とスターターをそれぞれ以下のように設定する。

| 項目 | 値 |
| --- | --- |
| サービス名 | 任意の名前 ( 今回は `remix-example` ) |
| スターター | `はじめに（HTTP ハンドラー）` |

上記を設定したら `サービスの作成` をクリックする。

:::message
サービスは `https://${サービス名}.${サブドメイン}.workers.dev` にデプロイされます。
例えば僕の Cloudflare Workers のサブドメインは `koki-develop` なので、今回の場合は https://remix-example.koki-develop.workers.dev にデプロイされることになります。
:::

![](/images/remix-on-cloudflare-workers/create-cloudflare-workers-service.png)

作成に成功するとサービスの詳細画面に遷移される。

![](/images/remix-on-cloudflare-workers/created-cloudflare-workers-service.png)

作成されたサービスの URL ( `https://${サービス名}.${サブドメイン}.workers.dev` ) にアクセスすると以下のような画面が表示される。

![](/images/remix-on-cloudflare-workers/initial-app-cloudflare-workers.png)

## Remix アプリを Cloudflare Workers にデプロイする

### `wrangler.toml` の設定を更新

「[Remix アプリを作成](#remix-%E3%82%A2%E3%83%97%E3%83%AA%E3%82%92%E4%BD%9C%E6%88%90)」手順で生成された `wrangler.toml` の `name` と `account_id` をそれぞれ以下のように更新する。

| 項目       | 値                                                                  |
| ---------- | ------------------------------------------------------------------- |
| name       | 作成した Cloudflare Workers のサービス名 ( 今回は `remix-example` ) |
| account_id | アカウント ID                                                       |

:::message
アカウント ID は Cloudflare Workers のダッシュボードの右サイドバーから確認できます。

![](/images/remix-on-cloudflare-workers/account-id.png)
:::

```diff toml:wrangler.toml
- name = "remix-cloudflare-workers"
+ name = "remix-example"
  type = "javascript"

  zone_id = ""
- account_id = ""
+ account_id = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx(アカウントID)"
  route = ""
  workers_dev = true

  [site]
  bucket = "./public"
  entry-point = "."

  [build]
  command = "npm run build"

  [build.upload]
  format="service-worker"
```

:::message
個人的にはこういった長い英数字の文字列はなんとなく機密情報っぽい匂いがしてファイルに直接書くのは不安になるのですが、以下のコメントによると `wrangler.toml` の内容は公開しても問題ないものなので Git 管理に含めても大丈夫だそうです。

> everything in a wrangler.toml is committable to publicly accessible version control :)
> > https://github.com/cloudflare/wrangler/issues/209#issuecomment-541654484

もしも不安な場合は `wrangler.toml` の `account_id` は空欄にしておいて、デプロイ実行時に `CF_ACCOUNT_ID` という環境変数を設定することでアカウント ID を指定することもできます。

```:例
$ export CF_ACCOUNT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx(アカウントID)
$ npm run deploy
```
:::

### API トークンを作成する

認証用の API トークンを作成する。

まずは https://dash.cloudflare.com/profile/api-tokens にアクセスする。
`トークンを作成する` をクリック。

![](/images/remix-on-cloudflare-workers/new-api-token.png)

テンプレートがいくつか用意されているので、今回は `Cloudflare Workers を編集する` テンプレートを選択する。

![](/images/remix-on-cloudflare-workers/select-api-token-template.png)

API トークンの設定画面に遷移される。
ここでは最低限 `アカウントリソース` と `ゾーンリソース` を設定する必要がある。
今回は以下のように設定。

| 項目               | 設定                                                         |
| ------------------ | ------------------------------------------------------------ |
| アカウントリソース | `包含` - 自分のアカウント                                    |
| ゾーンリソース     | `包含` - `アカウントにあるすべてのゾーン` - 自分のアカウント |

上記を設定したら `概要に進む` をクリック。

![](/images/remix-on-cloudflare-workers/configure-api-token.png)

概要画面に遷移される。
`トークンを作成する` をクリック。

![](/images/remix-on-cloudflare-workers/confirm-api-token.png)

これで API トークンが作成されるので、値を控えておく。

![](/images/remix-on-cloudflare-workers/created-api-token.png)

### 必要な CLI ツールをインストール・認証設定

ローカルから Remix アプリを Cloudflare Workers にデプロイするために wrangler という cli ツールをインストールする。

```
$ npm i --global @cloudflare/wrangler

# もしくは

$ yarn global add @cloudflare/wrangler
```

`wrangler --version` で wrangler のバージョンを確認できる。

```
$ wrangler --version
wrangler 1.19.12
```

`wrangler config` を実行して認証設定を行う。

```
$ wrangler config
```

API トークンの入力を促されるので、先程作成した API トークンを入力する。

```
Enter API Token:
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx(APIトークン)
💁  Validating credentials...
✨  Successfully configured. You can find your configuration file at: ~/.wrangler/config/default.toml
```

設定に成功すると `~/.wrangler/config/default.toml` が作成される。

```toml:~/.wrangler/config/default.toml
api_token = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx(APIトークン)"
```

### デプロイ

ここまででデプロイする準備が完了した。
`npm run deploy` でデプロイを実行する。

```
$ npm run deploy
```

デプロイに成功すると以下のようなメッセージが表示される。

```
✨  Successfully published your script to
 https://remix-example.koki-develop.workers.dev
```

表示された URL にアクセスすると Remix アプリケーションがデプロイされていることが確認できる。

![](/images/remix-on-cloudflare-workers/app-cloudflare-workers.png)

# 参考

https://zenn.dev/catnose99/articles/a4ff1953921e33

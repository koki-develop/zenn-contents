---
title: "GitHub Actions でプライベートリポジトリを checkout する"
emoji: "🦁"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["github", "githubactions", "cicd"]
published: true
---

GitHub Actions で別のプライベートリポジトリを checkout する方法のメモ。

# サンプルコード

この記事で紹介するサンプルコードは以下のリポジトリで管理しています。

https://github.com/koki-develop/gh-actions-checkout-private-repo-example

# 前置き

このドキュメントでは次の 2 通りの方法についてまとめます。

- [Deploy keys を使う方法](#deploy-keys-を使う方法)
- [Personal Access Token を使う方法](#personal-access-token-を使う方法)

いずれの方法も GitHub Actions ワークフローを作成するリポジトリと checkout する対象のプライベートリポジトリの双方で様々な操作を行う必要があります。
ごちゃごちゃにならないために、以降はそれぞれのリポジトリのことを次のように呼びます。

- GitHub Actions ワークフローを作成するリポジトリ → メインリポジトリ
- checkout する対象のプライベートリポジトリ → プライベートリポジトリ

# Deploy keys を使う方法

## 1. 公開鍵と秘密鍵を生成する

まず `ssh-keygen` コマンドを使って公開鍵と秘密鍵を生成します。
以下のコマンドを実行するとカレントディレクトリに `./deploy_key` ( 秘密鍵 ) と `./deploy_key.pub` ( 公開鍵 ) が生成されます。

```sh
$ ssh-keygen -t ed25519 -f ./deploy_key -N ""
```

```sh
$ tree
.
├── deploy_key
└── deploy_key.pub
```

## 2. プライベートリポジトリに Deploy key を追加する

プライベートリポジトリに Deploy key を追加します。

プライベートリポジトリの画面で `Settings` をクリックして設定画面に遷移します。

![](/images/gh-actions-checkout-private-repo/to-settings.png)

左メニューから `Deploy keys` をクリックし、 `Add deploy key` をクリックして Deploy key の追加画面に遷移します。

![](/images/gh-actions-checkout-private-repo/to-add-deploy-key.png)

各項目を次のように入力します。

| 項目                 | 値                                                                                                                                                                                   |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `Title`              | Deploy key につける任意のタイトル。<br/>今回は例として `for example` にしておきます。                                                                                                |
| `Key`                | 「[1. 公開鍵と秘密鍵を生成する](#1.-公開鍵と秘密鍵を生成する)」手順で生成した `deploy_key.pub` ( 公開鍵 ) の内容をコピペします。                                                     |
| `Allow write access` | メインリポジトリの GitHub Actions からプライベートリポジトリに対して push 等の書き込みを行いたい場合はチェックします。<br/>checkout したいだけであればチェックする必要はありません。 |

それぞれ入力できたら `Add key` をクリックします。
これで Deploy key が追加されます。

![](/images/gh-actions-checkout-private-repo/add-deploy-key.png)

## 3. 秘密鍵を GitHub Actions の Secret に設定する

秘密鍵をメインリポジトリの GitHub Actions の Secret に設定します。

メインリポジトリの画面で `Settings` をクリックして設定画面に遷移します。

![](/images/gh-actions-checkout-private-repo/to-gh-actions-settings.png)

左メニューから `Secrets and variables` → `Actions` の順にクリックし、 `New repository secret` をクリックして Secret の追加画面に遷移します。

![](/images/gh-actions-checkout-private-repo/to-new-secret.png)

各項目を次のように入力します。

| 項目     | 値                                                                                                                           |
| -------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `Name`   | 任意の Secret 名。<br/>今回は `PRIVATE_REPO_SSH_KEY` にしておきます。                                                        |
| `Secret` | 「[1. 公開鍵と秘密鍵を生成する](#1.-公開鍵と秘密鍵を生成する)」手順で生成した `deploy_key` ( 秘密鍵 ) の内容をコピペします。 |

それぞれ入力できたら `Add secret` をクリックします。
これで Secret が追加されます。

![](/images/gh-actions-checkout-private-repo/add-secret.png)

## 4. GitHub Actions ワークフローを作成する

メインリポジトリの GitHub Actions でプライベートリポジトリを checkout するワークフローを作成します。
次のコードはプライベートリポジトリを checkout して中身を表示するワークフローのサンプルです。

```yaml:.github/workflows/deploy_key.yaml
name: checkout private repository ( deploy key )

on:
  push:

jobs:
  main:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - uses: actions/checkout@v3
        with:
          # プライベートリポジトリを指定
          repository: koki-develop/private-repo-example
          # checkout 先のパスを指定
          path: ./private-repo-example
          # 秘密鍵を指定
          ssh-key: ${{ secrets.PRIVATE_REPO_SSH_KEY }}

      # プライベートリポジトリの中身を表示してみる
      - run: ls ./private-repo-example
```

実行が完了するとプライベートリポジトリを checkout して中身を表示できていることが確認できます。

![](/images/gh-actions-checkout-private-repo/success-deploy-key.png)

# Personal Access Token を使う方法

## 0. Personal Access Token の種類について

GitHub では次の 2 種類の Personal Access Token がサポートされています。

- Fine-grained Personal Access Token
- Personal Access Token (Classic)

Fine-grained Personal Access Token の方がより細かい権限設定を行えるため、基本的にはこちらを使用することが推奨されています。
そのため今回もこちらの種類の Personal Access Token を使うことにします。

GitHub の Personal Access Token についての詳しい情報は下記ドキュメントをご参照ください。

https://docs.github.com/ja/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token#personal-access-token%E3%81%AB%E3%81%A4%E3%81%84%E3%81%A6

## 1. Personal Access Token を生成する

プライベートリポジトリを checkout するのに使う Personal Access Token を生成します。

[Personal Access Token の生成画面](https://github.com/settings/personal-access-tokens/new) に遷移します。

各項目を次のように入力します。

| 項目                | 値                                                                                                                                                                                                       |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Token name`        | 任意のトークン名。<br/>今回は `example` としておきます。                                                                                                                                                 |
| `Expiration`        | トークンの有効期限。<br/>今回は 7 日間にしておきます。                                                                                                                                                   |
| `Repository access` | `Only select repositories` を選択して、プライベートリポジトリを選択します。                                                                                                                              |
| `Permissions`       | 必要な権限を設定します。今回は checkout したいだけ ( 読み取り ) なので次のように設定します。<br/>`Contents` : `Read-only`<br/>`Metadata` : `Read-only` ( `Contents` を設定した時点で勝手に設定されます ) |

それぞれ入力できたら `Generate token` をクリックします。
これで Personal Access Token が生成されます。

![](/images/gh-actions-checkout-private-repo/generate-pat.png)

生成された Personal Access Token は後で必要になるため控えておいてください。

![](/images/gh-actions-checkout-private-repo/generated-pat.png)

## 2. Personal Access Token を GitHub Actions の Secret に設定する

Personal Access Token をメインリポジトリの GitHub Actions の Secret に設定します。

メインリポジトリの画面で `Settings` をクリックして設定画面に遷移します。

![](/images/gh-actions-checkout-private-repo/to-gh-actions-settings.png)

左メニューから `Secrets and variables` → `Actions` の順にクリックし、 `New repository secret` をクリックして Secret の追加画面に遷移します。

![](/images/gh-actions-checkout-private-repo/to-new-secret.png)

各項目を次のように入力します。

| 項目     | 値                                                                                                                                 |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `Name`   | 任意の Secret 名。<br/>今回は `PERSONAL_ACCESS_TOKEN` にしておきます。                                                             |
| `Secret` | 「[1. Personal Access Token を生成する](#1.-personal-access-token-を生成する)」手順で生成した Personal Access Token を入力します。 |

それぞれ入力できたら `Add secret` をクリックします。
これで Secret が追加されます。

![](/images/gh-actions-checkout-private-repo/add-pat-secret.png)

## 3. GitHub Actions ワークフローを作成する

メインリポジトリの GitHub Actions でプライベートリポジトリを checkout するワークフローを作成します。
次のコードはプライベートリポジトリを checkout して中身を表示するワークフローのサンプルです。

```yaml:.github/workflows/pat.yaml
name: checkout private repository ( pat )

on:
  push:

jobs:
  main:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - uses: actions/checkout@v3
        with:
          # プライベートリポジトリを指定
          repository: koki-develop/private-repo-example
          # checkout 先のパスを指定
          path: ./private-repo-example
          # Personal Access Token を指定
          token: ${{ secrets.PERSONAL_ACCESS_TOKEN }}

      # プライベートリポジトリの中身を表示してみる
      - run: ls ./private-repo-example
```

実行が完了するとプライベートリポジトリを checkout して中身を表示できていることが確認できます。

![](/images/gh-actions-checkout-private-repo/success-pat.png)

# まとめ

Personal Access Token を使う場合はトークンの管理が難しくなります。
Classic の場合は権限の範囲が広くなりすぎますし、 Fine-grained の場合は権限は細く設定できますが有効期限の設定が必須であるため定期的にトークンを再生成する必要があります。
また、権限の範囲が特定の GitHub アカウントに紐付いてしまうという問題もあるため、チーム開発の場合はその辺りも考えなければいけません。

それに対して Deploy key は権限の範囲が特定のプライベートリポジトリに限定されます。
そのため、単純に checkout や push をするくらいであれば Deploy key を使った方が管理はしやすいでしょう。

もしも GitHub API を使う必要がある場合 ( 例えばプライベートリポジトリに PR を作成したいときなど ) は Personal Access Token を使う方が適しているかもしれません。

用途に合わせて適切な方法を選択しましょう。

# 参考

https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token
https://docs.github.com/en/developers/overview/managing-deploy-keys
https://github.com/actions/checkout

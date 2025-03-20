---
title: "GitHub Actions Importer を使って CI/CD を GitHub Actions に移行する"
emoji: "🚀"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["github", "githubactions", "cicd"]
published: true
---

[GitHub Actions Importer](https://docs.github.com/en/actions/migrating-to-github-actions/automated-migrations/automating-migration-with-github-actions-importer) が GA になりました 🎉🎉🎉

https://github.blog/2023-03-01-github-actions-importer-is-now-generally-available/

[GitHub Actions Importer](https://docs.github.com/en/actions/migrating-to-github-actions/automated-migrations/automating-migration-with-github-actions-importer) は様々な CI サービスから GitHub Actions への移行をサポートするツールです。
他の CI サービスで使用している設定ファイルを元に GitHub Actions ワークフロー定義の YAML ファイルを自動で作成することができます。

2023 年 03 月 02 日現在、次の CI サービスをサポートしています。

- [Azure DevOps](https://azure.microsoft.com/products/devops)
- [CircleCI](https://circleci.com/)
- [GitLab](https://about.gitlab.com/)
- [Jenkins](https://www.jenkins.io/)
- [Travis CI](https://www.travis-ci.com/)

この記事では [GitHub Actions Importer](https://docs.github.com/en/actions/migrating-to-github-actions/automated-migrations/automating-migration-with-github-actions-importer) のインストール手順から基本的な使い方について、 CircleCI からの移行を例にしてまとめます。

# サンプルコード

今回紹介するサンプルコードは以下のリポジトリで管理しています。

https://github.com/koki-develop/github-actions-importer-example

# 検証環境

- [GitHub CLI](https://cli.github.com/) v2.23.0
- [GitHub Actions Importer](https://docs.github.com/en/actions/migrating-to-github-actions/automated-migrations/automating-migration-with-github-actions-importer) v1.1.0

# 前提条件

- Docker がインストールされ、起動している
- [GitHub CLI](https://cli.github.com/) がインストールされている

# 準備

## [GitHub Actions Importer](https://docs.github.com/en/actions/migrating-to-github-actions/automated-migrations/automating-migration-with-github-actions-importer) をインストールする

[GitHub Actions Importer](https://docs.github.com/en/actions/migrating-to-github-actions/automated-migrations/automating-migration-with-github-actions-importer) は [GitHub CLI](https://cli.github.com/) の拡張機能です。
次のコマンドを実行してインストールすることができます。

```sh
$ gh extension install github/gh-actions-importer
```

インストールが完了すると `gh actions-importer ...` のようにして [GitHub Actions Importer](https://docs.github.com/en/actions/migrating-to-github-actions/automated-migrations/automating-migration-with-github-actions-importer) を使うことができるようになります。

```sh
$ gh actions-importer --help
```

```:出力
Description:
  GitHub Actions Importer helps you plan, test, and automate your migration to GitHub Actions.

  Please share your feedback @ https://gh.io/ghaimporterfeedback

Options:
  -?, -h, --help  Show help and usage information

Commands:
  update     Update to the latest version of GitHub Actions Importer.
  version    Display the current version of GitHub Actions Importer.
  configure  Start an interactive prompt to configure credentials used to authenticate with your CI server(s).
  audit      Plan your CI/CD migration by analyzing your current CI/CD footprint.
  forecast   Forecast GitHub Actions usage from historical pipeline utilization.
  dry-run    Convert a pipeline to a GitHub Actions workflow and output its yaml file.
  migrate    Convert a pipeline to a GitHub Actions workflow and open a pull request with the changes.
```

## GitHub の Personal Access Token を生成する

[GitHub Actions Importer](https://docs.github.com/en/actions/migrating-to-github-actions/automated-migrations/automating-migration-with-github-actions-importer) を使用するには GitHub の Personal Access Token が必要になります。

まず [Find-grained personal access token の作成画面](https://github.com/settings/personal-access-tokens/new)にアクセスします。

`Token name` には任意のトークン名を入力します。今回は `github actions importer example` にします。
`Expiration` にはトークンの有効期間を指定します。今回は `7 days` にします。
`Repository access` にはトークンのアクセス権限を設定します。
実行したいコマンドによって必要な権限は異なります。

- 後述の「[`dry-run: ワークフロー定義を作成する`](#dry-run%3A-ワークフロー定義を作成する)」を実行するにはリポジトリに対して次の権限が必要です。
  - `Contents`: `Read-only`
- 後述の「[`migrate: Pull Request を作成する`](#migrate%3A-pull-request-を作成する)」を実行するにはリポジトリに対して次の権限が必要です。
  - `Contents`: `Read and write`
  - `Pull requests`: `Read and write`
  - `Workflows`: `Read and write`

それぞれ入力できたら `Generate token` をクリックします。
これで Personal Access Token が生成されます。
生成された Personal Access Token は後で必要になるためひかえておいてください。

![](/images/gh-actions-importer/create-github-pat.png)

## CircleCI の API Token を作成する

[GitHub Actions Importer](https://docs.github.com/en/actions/migrating-to-github-actions/automated-migrations/automating-migration-with-github-actions-importer) を使用するには移行元の CI サービスの認証情報も必要になります。
今回は CircleCI を使用しているので CircleCI の API Token を作成します。

まず CircleCI の [Personal API Tokens の管理画面](https://app.circleci.com/settings/user/tokens)にアクセスします。

`Create New Token` をクリックします。

![](/images/gh-actions-importer/to-create-circleci-token.png)

`Token Name` に任意のトークン名を入力して `Add API Token` をクリックします。
これで API Token が作成されます。
作成された API Token は後で必要になるためひかえておいてください。

![](/images/gh-actions-importer/create-circleci-token.png)

## CircleCI のプロジェクトを作成

今回は例として Go プロジェクトのパイプラインを作成してみます。
次のような内容で `.circleci/config.yml` を作成します。
`go build` と `go test` を実行するだけのシンプルなパイプラインです。

```yaml:.circleci/config.yml
version: 2.1

jobs:
  build:
    docker:
      - image: golang:1.20
    steps:
      - checkout
      - run: go build .

  test:
    docker:
      - image: golang:1.20
    steps:
      - checkout
      - run: go test ./...

workflows:
  build_and_test:
    jobs:
     - build
     - test
```

リポジトリに push しておきます。

```sh
$ git add ./.circleci/config.yml
$ git commit -m 'creataed .circleci/config.yml'
$ git push origin main
```

続いて CircleCI のプロジェクト一覧画面に遷移します。
使用するプロジェクトを検索し、 `Set Up Project` をクリックします。

![](/images/gh-actions-importer/to-setup-circleci-project.png)

今回は先ほどすでに `.circleci/config.yml` を作成しているので、 `Fastest: Use the .circleci/config.yml in my repo` を選択した状態で `Set Up Project` をクリックします。
これで CircleCI プロジェクトがセットアップされます。

![](/images/gh-actions-importer/setup-circleci-project.png)

# [GitHub Actions Importer](https://docs.github.com/en/actions/migrating-to-github-actions/automated-migrations/automating-migration-with-github-actions-importer) の使い方

基本的な使い方についてまとめます。

## `dry-run`: ワークフロー定義を作成する

`dry-run` コマンドを使用するとローカルに GitHub Actions ワークフロー定義の YAML ファイルを作成します。
移行元の CI サービスによって設定するオプションは異なります。
今回は CircleCI を使用しているので次のように実行します。

```sh
$ gh actions-importer dry-run circle-ci \
    --output-dir out \
    --circle-ci-project <CircleCIのプロジェクト名> \
    --circle-ci-organization <CircleCIの組織名> \
    --circle-ci-access-token <CircleCIのアクセストークン> \
    --github-access-token <GitHubのアクセストークン>
```

完了すると `<output-dir>/<リポジトリオーナー名>/<リポジトリ名>/.github/workflows/<ワークフロー名>.yml` が作成されます。
例えば今回の場合だと次のような内容でファイルが作成されます。

```yaml:out/koki-develop/github-actions-importer-example/.github/workflows/build_and_test.yml
name: koki-develop/github-actions-importer-example/build_and_test
on:
  push:
    branches:
    - main
jobs:
  build:
    runs-on: ubuntu-latest
    container:
      image: golang:1.20
    steps:
    - uses: actions/checkout@v3.3.0
    - run: go build .
  test:
    runs-on: ubuntu-latest
    container:
      image: golang:1.20
    steps:
    - uses: actions/checkout@v3.3.0
    - run: go test ./...
```

おぉ〜。

## `migrate`: Pull Request を作成する

`migrate` コマンドを使用すると GitHub Actions ワークフロー定義の YAML ファイルを作成する Pull Request を作成します。
移行元の CI サービスによって設定するオプションは異なります。
今回は CircleCI を使用しているので次のように実行します。

```sh
$ gh actions-importer migrate circle-ci \
    --output-dir out \
    --circle-ci-project <CircleCIのプロジェクト名> \
    --circle-ci-organization <CircleCIの組織名> \
    --circle-ci-access-token <CircleCIのアクセストークン> \
    --github-access-token <GitHubのアクセストークン> \
    --target-url <GitHubリポジトリのURL> # https://github.com/owner/repo の形式
```

完了すると以下のような Pull Request が作成されます。
GitHub Actions ワークフロー定義の YAML ファイルを作成していることが確認できます。

![](/images/gh-actions-importer/pull-request.png)

https://github.com/koki-develop/github-actions-importer-example/pull/1

おぉ〜。

# まとめ

「既に他の CI サービスで大きくて複雑なパイプラインを構築しているけど GitHub Actions に移行したい！」っていうときに便利そうですね。

他にも `audit` コマンドで既存の CI パイプラインを分析したり `forecast` コマンドで使用状況の予測を作成したりすることもできます。
また、今回はコマンド実行時にフラグで色々指定しましたが、 `configure` コマンドで認証情報を含むファイル ( `.env.local` ) を対話形式で作成することもできます。

CI サービスごとのサポートしている/していない機能などについては [`docs/`](https://github.com/github/gh-actions-importer/tree/main/docs) ディレクトリ内に色々ドキュメントがまとまっているので、こちらをご参照ください。

https://github.com/github/gh-actions-importer/tree/main/docs

移行のしやすさという観点でいうと、特定の CI サービスに依存しないパイプラインを構築することができる [Dagger](https://dagger.io/) というツールについて紹介した記事も以前公開しています。
こちらもご興味があればご参照ください。

https://zenn.dev/kou_pg_0131/articles/dagger-go-sdk

# 参考

https://docs.github.com/en/actions/migrating-to-github-actions/automated-migrations/automating-migration-with-github-actions-importer
https://github.com/github/gh-actions-importer/tree/main/docs

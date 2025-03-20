---
title: "Docker イメージのタグ一覧を取得する docker-tags CLI の紹介"
emoji: "🐳"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["docker", "cli", "terminal"]
published: true
---

# 概要

Docker イメージのタグ一覧を取得する `docker-tags` CLI を公開しました。

https://github.com/koki-develop/docker-tags

以下のように任意の Docker イメージのタグ一覧を取得して出力することができます。

```sh
$ docker-tags alpine
latest
edge
3.9.6
3.9.5
3.9.4
# ...

# 名前付きで出力することもできる
$ docker-tags alpine -n
alpine:latest
alpine:edge
alpine:3.9.6
alpine:3.9.5
alpine:3.9.4
# ...

# JSON 形式の出力もサポート
$ docker-tags alpine -o json
[
  "latest",
  "edge",
  "3.9.6",
  "3.9.5",
  "3.9.4",
  # ...
]
```

[Docker Hub](https://hub.docker.com/) を含めた以下のレジストリをサポートしています。

- [Docker Hub](https://hub.docker.com/)
- [Amazon ECR](https://aws.amazon.com/ecr/)
- [Amazon ECR Public](https://docs.aws.amazon.com/AmazonECR/latest/public/index.html)
- [Google Container Registry](https://cloud.google.com/container-registry)
- [Google Artifact Registry](https://cloud.google.com/artifact-registry)

類似の CLI としては [Wantedly](https://github.com/wantedly) さんの [dockertags](https://github.com/wantedly/dockertags) がありますが、こちらは 2023 年 2 月現在メンテナンスされていないようでしたので、自分で作ることにしました。

# インストール

## Homebrew

Homebrew を使っている場合は `brew install` でインストールすることができます。

```sh
$ brew install koki-develop/tap/docker-tags
```

## go install

`docker-tags` CLI は Go で作られているため、 `go install` でインストールすることもできます。

```sh
$ go install github.com/koki-develop/docker-tags@latest
```

## Docker CLI Plugin としてインストールする

`docker-tags` CLI は Docker CLI Plugin としてインストールすることもできます。

```sh
$ git clone https://github.com/koki-develop/docker-tags.git
$ cd docker-tags
$ make
$ mkdir -p $HOME/.docker/cli-plugins/
$ mv ./dist/docker-tags $HOME/.docker/cli-plugins/
```

Docker CLI Plugin としてインストールすることで、 Docker のサブコマンドとして使用することが可能になります。

```sh
# サブコマンドとして使える
$ docker tags --help

Usage:  docker tags [IMAGE]

Command line tool to get a list of tags for docker images.

Options:
      --aws-profile string   aws profile
  -o, --output string        output format (text|json) (default "text")
  -n, --with-name            print with image name
```

# 使い方

## 基本的な使い方

コマンドの引数にイメージ名を指定するだけです。

```sh
# alpine のタグ一覧を出力する
$ docker-tags alpine
latest
edge
3.9.6
3.9.5
3.9.4
# ...
```

## イメージ名つきで出力する

`-n` もしくは `--with-name` フラグをつけるとイメージ名つきで出力することができます。
Dockerfile にコピペしたいときなどに便利です。

```sh
# `--with-name` でも同じ
$ docker-tags alpine -n
alpine:latest
alpine:edge
alpine:3.9.6
alpine:3.9.5
alpine:3.9.4
# ...
```

## JSON 形式で出力する

`-o` もしくは `--output` フラグに `json` を指定すると JSON 形式で出力することができます。
`jq` コマンド等と組み合わせて何かしたいときに便利です。

```sh
# `--output` でも同じ
$ docker-tags alpine -o json
[
  "latest",
  "edge",
  "3.9.6",
  "3.9.5",
  # ...
]
```

こちらも `-n` もしくは `--with-name` フラグをつけてイメージ名つきで出力することが可能です。

```sh
$ docker-tags alpine -o json -n
[
  "alpine:latest",
  "alpine:edge",
  "alpine:3.9.6",
  "alpine:3.9.5",
  # ...
]
```

## [Docker Hub](https://hub.docker.com/) 以外のレジストリで使う

イメージ名のみを指定すると [Docker Hub](https://hub.docker.com/) のイメージのタグ一覧を取得します。
他のレジストリのイメージのタグ一覧を取得する場合はイメージの URL を指定します。

```sh
# Docker Hub
$ docker-tags <IMAGE>

# Amazon ECR
$ docker-tags <AWS_ACCOUNT_ID>.dkr.ecr.<REGION>.amazonaws.com/<REPOSITORY>

# Amazon ECR Public
$ docker-tags public.ecr.aws/<REGISTRY_ALIAS>/<REPOSITORY>

# Google Container Registry
$ docker-tags gcr.io/<PROJECT_ID>/<IMAGE>

# Google Artifact Registry
$ docker-tags <LOCATION>-docker.pkg.dev/<PROJECT_ID>/<REPOSITORY>/<IMAGE>
```

# まとめ

我ながら結構気に入っています。
他にも [cLive](https://github.com/koki-develop/clive) という CLI も開発していますので、こちらも興味があれば見てみてください。

https://zenn.dev/kou_pg_0131/articles/clive-introduction

また Go で CLI を開発するときに便利だったパッケージについて紹介する記事も公開していますので、こちらもご参考までに。

https://zenn.dev/kou_pg_0131/articles/go-cli-packages

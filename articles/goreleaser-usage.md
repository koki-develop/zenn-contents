---
title: "GoReleaser で Go 製 CLI のリリースを自動化＆ Homebrew でインストールできるようにする"
emoji: "🚀"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["golang", "cli", "goreleaser", "githubactions", "homebrew"]
published: true
---

[GoReleaser](https://goreleaser.com/) と GitHub Actions を使って Go で作った CLI のリリースを自動化して、ついでに Homebrew でインストールできるようにするまでの手順メモです。

ちなみに先日、 Go で CLI を作る時に便利だったパッケージについて簡単に紹介する記事を公開しました。
こちらも興味があれば見てみてください。

https://zenn.dev/kou_pg_0131/articles/go-cli-packages

# 検証環境

- Go v1.19
- GoReleaser v1.14.1
- GoReleaser Action v4.1.0

# GoReleaser とは

https://goreleaser.com/
https://github.com/goreleaser/goreleaser

[GoReleaser](https://goreleaser.com/) は Go プロジェクトのリリースを自動化するツールです。
GitHub・GitLab・Gitea へのリリースの他、 Linux パッケージや Homebrew Taps の作成など、 Go プロジェクトのリリースに関する様々なタスクを自動化することができます。
基本的には CI 上で実行されることを想定していますが、ローカルでも実行可能です。


# 準備
## 1. CLI を作る

とりあえず Go でサクッと `hello-cli` という名前で CLI を作ります。
今回は [Cobra](https://cobra.dev/) を使いますが、別に使わなくても大丈夫です。
また、今回作った CLI は下記リポジトリで管理しています。

https://github.com/koki-develop/hello-cli

まず Go モジュールを初期化してから [Cobra](https://cobra.dev/) をインストールします。

```sh
# モジュールを初期化
$ go mod init github.com/koki-develop/hello-cli
go: creating new go.mod: module github.com/koki-develop/hello-cli

# cobra をインストール
$ go get -u github.com/spf13/cobra@latest
go: added github.com/inconshreveable/mousetrap v1.1.0
go: added github.com/spf13/cobra v1.6.1
go: added github.com/spf13/pflag v1.0.5
```

`main.go` を以下の内容で作成します。

```go:main.go
package main

import (
	"fmt"
	"os"

	"github.com/spf13/cobra"
)

var rootCmd = &cobra.Command{
	Use: "hello-cli",
	Run: func(cmd *cobra.Command, args []string) {
		fmt.Println("Hello, World")
	},
}

func main() {
	err := rootCmd.Execute()
	if err != nil {
		os.Exit(1)
	}
}
```

素晴らしい CLI が完成しました。

```sh
$ go run ./main.go
Hello, World
```

## 2. `goreleaser` CLI をインストールする

[GoReleaser](https://goreleaser.com/) には `goreleaser` CLI が用意されています。
`goreleaser` CLI を使うことで設定ファイルの初期化や検証、またローカルでのビルドやリリースなどといった操作を実行できます。

`goreleaser` CLI には様々なインストール方法が用意されています。
例えば Homebrew を使用している場合は以下のように実行することでインストールすることができます。

```sh
$ brew install goreleaser/tap/goreleaser
```

その他のインストール方法については下記ドキュメントをご参照ください。

https://goreleaser.com/install/

# GoReleaser を使ってリリースを自動化する

それでは [GoReleaser](https://goreleaser.com/) を使って Go プロジェクトのリリースを自動化していきます。

## 1. 設定ファイルを初期化

まずは [GoReleaser](https://goreleaser.com/) の設定ファイルを初期化します。
`goreleaser init` を実行します。

```sh
$ goreleaser init
  • Generating .goreleaser.yaml file
  • config created; please edit accordingly to your needs file=.goreleaser.yaml
```

成功すると `.goreleaser.yaml` という名前で次のような内容のファイルが生成されます。

```yaml:.goreleaser.yaml
# This is an example .goreleaser.yml file with some sensible defaults.
# Make sure to check the documentation at https://goreleaser.com
before:
  hooks:
    # You may remove this if you don't use go modules.
    - go mod tidy
    # you may remove this if you don't need go generate
    - go generate ./...
builds:
  - env:
      - CGO_ENABLED=0
    goos:
      - linux
      - windows
      - darwin

archives:
  - format: tar.gz
    # this name template makes the OS and Arch compatible with the results of uname.
    name_template: >-
      {{ .ProjectName }}_
      {{- title .Os }}_
      {{- if eq .Arch "amd64" }}x86_64
      {{- else if eq .Arch "386" }}i386
      {{- else }}{{ .Arch }}{{ end }}
      {{- if .Arm }}v{{ .Arm }}{{ end }}
    # use zip for windows archives
    format_overrides:
    - goos: windows
      format: zip
checksum:
  name_template: 'checksums.txt'
snapshot:
  name_template: "{{ incpatch .Version }}-next"
changelog:
  sort: asc
  filters:
    exclude:
      - '^docs:'
      - '^test:'

# The lines beneath this are called `modelines`. See `:help modeline`
# Feel free to remove those if you don't want/use them.
# yaml-language-server: $schema=https://goreleaser.com/static/schema.json
# vim: set ts=2 sw=2 tw=0 fo=cnqoj
```

色々書いてありますが、とりあえずこのまま使えるので今回は編集しないで大丈夫です。
`.goreleaser.yaml` の設定についての詳しい情報は[公式ドキュメント](https://goreleaser.com/customization/)をご参照ください。

https://goreleaser.com/customization/

また、 `.gitignore` の末尾に `dist/` が追記されます。
[GoReleaser](https://goreleaser.com/) はビルドしたファイルを `dist/` ディレクトリ内に出力するので、それらが Git 管理に含まれないようにこのような挙動になっています。

```diff sh:.gitignore
  # ...省略
+
+ dist/
```

## 2. ローカルで動作確認

### 設定ファイルの内容をチェックする

`goreleaser check` で `.goreleaser.yaml` の内容が有効かどうかをチェックすることができます。
また、非推奨の設定を使用してしまっている場合も警告を出してくれます。

```sh
$ goreleaser check
  • loading config file                              file=.goreleaser.yaml
  • checking config...
  • config is valid
```

### ビルドする

`goreleaser release` を `--snapshot` フラグをつけて実行することでローカルで [GoReleaser](https://goreleaser.com/) によるビルドを実行することができます。
ついでに `--clean` フラグをつけておくと `dist/` ディレクトリが存在するときに自動で削除してくれるので便利です。

:::message
最後に `release succeeded` と表示されますが、あくまでローカルでビルドされるだけで実際にどこかにリリースされちゃうわけではないので、気軽に実行して大丈夫です。
:::

```sh
$ goreleaser release --snapshot --clean
  • starting release...
  • loading config file                              file=.goreleaser.yaml
  • loading environment variables
  • getting and validating git state
    • building...                                    commit=521c270aa6d26f783d9edb9db348350346ff3700 latest tag=v0.2.0
    • pipe skipped                                   reason=disabled during snapshot mode
  • parsing tag
  • setting defaults
  • running before hooks
    • running                                        hook=go mod tidy
    • running                                        hook=go generate ./...
  • snapshotting
    • building snapshot...                           version=0.2.1-next
  • checking distribution directory
  • loading go mod information
  • build prerequisites
  • writing effective config file
    • writing                                        config=dist/config.yaml
  • building binaries
    • building                                       binary=dist/hello-cli_darwin_arm64/hello-cli
    • building                                       binary=dist/hello-cli_linux_386/hello-cli
    • building                                       binary=dist/hello-cli_windows_386/hello-cli.exe
    • building                                       binary=dist/hello-cli_linux_arm64/hello-cli
    • building                                       binary=dist/hello-cli_linux_amd64_v1/hello-cli
    • building                                       binary=dist/hello-cli_darwin_amd64_v1/hello-cli
    • building                                       binary=dist/hello-cli_windows_arm64/hello-cli.exe
    • building                                       binary=dist/hello-cli_windows_amd64_v1/hello-cli.exe
    • took: 1s
  • archives
    • creating                                       archive=dist/hello-cli_Darwin_arm64.tar.gz
    • creating                                       archive=dist/hello-cli_Darwin_x86_64.tar.gz
    • creating                                       archive=dist/hello-cli_Linux_i386.tar.gz
    • creating                                       archive=dist/hello-cli_Linux_arm64.tar.gz
    • creating                                       archive=dist/hello-cli_Linux_x86_64.tar.gz
    • creating                                       archive=dist/hello-cli_Windows_x86_64.zip
    • creating                                       archive=dist/hello-cli_Windows_i386.zip
    • creating                                       archive=dist/hello-cli_Windows_arm64.zip
  • calculating checksums
  • homebrew tap formula
    • guessing install to be "bin.install \"hello-cli\""
    • guessing install to be "bin.install \"hello-cli\""
    • guessing install to be "bin.install \"hello-cli\""
    • guessing install to be "bin.install \"hello-cli\""
    • writing                                        formula=dist/hello-cli.rb
  • storing release metadata
    • writing                                        file=dist/artifacts.json
    • writing                                        file=dist/metadata.json
  • release succeeded after 1s
```

`dist/` ディレクトリ内に色々出力されます。

```sh
$ ls dist/
artifacts.json                  hello-cli_Linux_i386.tar.gz     hello-cli_linux_386
checksums.txt                   hello-cli_Linux_x86_64.tar.gz   hello-cli_linux_amd64_v1
config.yaml                     hello-cli_Windows_arm64.zip     hello-cli_linux_arm64
hello-cli.rb                    hello-cli_Windows_i386.zip      hello-cli_windows_386
hello-cli_Darwin_arm64.tar.gz   hello-cli_Windows_x86_64.zip    hello-cli_windows_amd64_v1
hello-cli_Darwin_x86_64.tar.gz  hello-cli_darwin_amd64_v1       hello-cli_windows_arm64
hello-cli_Linux_arm64.tar.gz    hello-cli_darwin_arm64          metadata.json
```

## 3. GitHub Actions でリリースを自動化する

https://goreleaser.com/ci/actions/

ここまできたら GitHub Actions を使ってリリースを自動化する準備はできています。
[GoReleaser](https://goreleaser.com/) には[公式のアクション](https://github.com/marketplace/actions/goreleaser-action)が用意されているため、簡単に GitHub Actions と統合することができます。

https://github.com/marketplace/actions/goreleaser-action

:::message
ちなみに [GoReleaser](https://goreleaser.com/) は GitHub Actions だけでなく他にもさまざまな CI ランナー上で利用することが可能です。
詳しい情報については下記ドキュメントをご参照ください。
- [Continuous Integration - GoReleaser](https://goreleaser.com/ci/)
:::

それでは実際にリリースを自動化する GitHub Actions ワークフローを作成します。
以下は `v*` タグが作成されたときに [`goreleaser/goreleaser-action`](https://github.com/marketplace/actions/goreleaser-action) を使ってリリースを行うワークフローのサンプルです。

```yaml:.github/workflows/release.yml
name: release

on:
  push:
    tags:
      - "v*"

jobs:
  release:
    runs-on: ubuntu-latest
    permissions:
      contents: write # これがないとリリースを作成できない
    steps:
      # チェックアウト
      - uses: actions/checkout@v3
        with:
          fetch-depth: 0 # Changelog を正しく動作させるために必要

      # Go をセットアップ
      - uses: actions/setup-go@v3
        with:
          go-version-file: go.mod
          cache: true

      # リリース
      - uses: goreleaser/goreleaser-action@v4
        with:
          args: release --clean
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }} # 自動で生成されるシークレット
```

いくつか注意するポイントを記載しておきます。

- Job に `permissions.contents: write` を設定する必要があります。
- [GoReleaser](https://goreleaser.com/) による Changelog の生成をうまく動作させるために `actions/checkout` に `with.fetch-depth: 0` を設定する必要があります。
- [`goreleaser/goreleaser-action`](https://github.com/marketplace/actions/goreleaser-action) 実行時に使用している `GITHUB_TOKEN` Secret は GitHub Actions により自動で生成される Secret です。自分でトークンを発行したり Secret を設定する必要はありません。
  - `GITHUB_TOKEN` Secret についての詳しい情報は[公式ドキュメント](https://docs.github.com/ja/actions/security-guides/automatic-token-authentication#about-the-github_token-secret)をご参照ください。
    - [`GITHUB_TOKEN` シークレットについて - GitHub Docs](https://docs.github.com/ja/actions/security-guides/automatic-token-authentication#about-the-github_token-secret)

これで自動リリースの準備が完了しました。

## 4. リリースしてみる

実際にタグをプッシュして動作確認してみます。

```sh
# タグを作成
$ git tag v0.1.0

# タグをプッシュ
$ git push origin v0.1.0
```

これで先ほど作成したリリース用のワークフローが実行されます。
ワークフローが完了するとリリースが作成されていることが確認できます。
また、ビルドされたファイルも Assets としてアタッチされています。

https://github.com/koki-develop/hello-cli/releases/tag/v0.1.0

![](/images/goreleaser-usage/release.png)

自動リリースできました、わーい 🎉

# Homebrew でインストールできるようにする

[GoReleaser](https://goreleaser.com/) には Homebrew Tap を作成する機能も用意されています。

## 0. Homebrew Taps とは

基本的に Homebrew はライブラリをインストールするときに公式リポジトリである [homebrew-core](https://github.com/Homebrew/homebrew-core) の Formula を参照します。
そのため、自作 CLI などを Homebrew 経由でインストールできるようにするには[公式リポジトリ](https://github.com/Homebrew/homebrew-core)に Formula を追加する PR を作成してマージしてもらう必要があります。

https://github.com/Homebrew/homebrew-core

しかし[公式リポジトリ](https://github.com/Homebrew/homebrew-core)に Formula を追加するには受け入れ基準があったり PR のマージまでに時間がかかることもあります。
なので自作 CLI などの Formula を[公式リポジトリ](https://github.com/Homebrew/homebrew-core)に追加してもらうのはややハードルが高いです。

そこで Homebrew には Homebrew Taps という仕組みが用意されています。

https://docs.brew.sh/Taps

Homebrew Taps を使うことで、公式ではないリポジトリの Formula を参照してライブラリをインストールすることができます。
また、自分で Formula を管理できるため Formula を最新に保つことが容易というメリットがあります。
例えば自作 CLI の新しいバージョンをリリースしたとき、[公式リポジトリ](https://github.com/Homebrew/homebrew-core)の Formula も最新に更新しようとしても PR がマージされるまでにどうしてもタイムラグが発生します。
そういった事情もあり、[公式リポジトリ](https://github.com/Homebrew/homebrew-core)に Formula が追加されていながらも Homebrew Taps を使用したインストールを推奨しているプロジェクトもあるくらいです。

## 1. Homebrew Taps 用のリポジトリを作成する

Homebrew Taps 用の Formula を配置するリポジトリを作成します。

Homebrew Taps で使用するリポジトリ名は `homebrew-<任意の名前>` のようにする必要があります。
Homebrew Taps の Formula を Homebrew で参照してインストールするときは `brew install <GitHubユーザー名>/<リポジトリ名からhomebrew-プレフィクスを除いた部分>/<CLI名>` のように実行します。
例えば `koki-develop/homebrew-something` というリポジトリに Formula を配置した `example` CLI をインストールする場合は以下のように実行することになります。

```sh
$ brew install koki-develop/something/example
```

:::message
厳密に言えば `homebrew-` プレフィクスをつけなくても大丈夫なのですが、その場合はインストール前に `brew tap` コマンドの実行が必要になります。
例えば `koki-develop/something` リポジトリに Formula を配置した `example` CLI をインストールする場合は次のように実行する必要があります。

```sh
$ brew tap koki-develop/something # これが必要になる
$ brew install example
```

:::

リポジトリ名は `homebrew-` で始まる名前であればなんでもいいのですが、よくある命名としては `homebrew-tap` としているプロジェクトをよく見かけます。
Homebrew Taps 用のリポジトリ名を `homebrew-tap` にしておくとインストール時のコマンドが `brew install <GitHubユーザー名>/tap/<CLI名>` のように、ちょっと見栄えが良い感じになります。

```sh
# 例えば今回作っている `hello-cli` の場合はこうなる
$ brew install koki-develop/tap/hello-cli

# 例えば Homebrew Taps 用のリポジトリ名を `homebrew-hello-cli` にするとこうなる
# ちょっと冗長な印象
$ brew install koki-develop/hello-cli/hello-cli
```

例えば `homebrew-tap` リポジトリを用意しているプロジェクトの例としては次のようなものがあります。

- [AWS](https://aws.amazon.com/jp/) - [aws/homebrew-tap](https://github.com/aws/homebrew-tap)
- [GoReleaser](https://goreleaser.com/) - [goreleaser/homebrew-tap](https://github.com/goreleaser/homebrew-tap)
- [Hashicorp](https://www.hashicorp.com/) - [hashicorp/homebrew-tap](https://github.com/hashicorp/homebrew-tap)
- [1Password](https://1password.com/jp/) - [1Password/homebrew-tap](https://github.com/1Password/homebrew-tap)
- [Charm](https://charm.sh/) - [charmbracelet/homebrew-tap](https://github.com/charmbracelet/homebrew-tap)
- [Elastic](https://www.elastic.co/jp/) - [elastic/homebrew-tap](https://github.com/elastic/homebrew-tap)

ここでも `homebrew-tap` リポジトリを作成することにします。

https://github.com/koki-develop/homebrew-tap

## 2. Homebrew Taps 用のリポジトリに書き込みを行うための Personal Access Token を発行する

GitHub Actions から Homebrew Taps 用のリポジトリに書き込むために使う Personal Access Token を発行します。

GitHub では次の 2 種類の Personal Access Token がサポートされています。

- Fine-grained Personal Access Token
- Personal Access Token (Classic)

Fine-grained Personal Access Token の方がより細かい権限設定を行えるため、基本的にはこちらを使用することが推奨されています。
そのため今回もこちらの種類の Personal Access Token を使うことにします。

GitHub の Personal Access Token についての詳しい情報は下記ドキュメントをご参照ください。

https://docs.github.com/ja/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token#personal-access-token%E3%81%AB%E3%81%A4%E3%81%84%E3%81%A6

まず [Personal Access Token の生成画面](https://github.com/settings/personal-access-tokens/new) にアクセスします。

以下のように入力します。

| 項目 | 値 |
| --- | --- |
| `Token name` | 任意のトークン名。<br/>今回は `example` としておきます。 |
| `Expiration` | トークンの有効期限。<br/>今回は 7 日間にしておきます。 |
| `Repository access` | `Only select repositories` を選択して、 「[Homebrew Taps 用のリポジトリを作成する](#1.-homebrew-taps-用のリポジトリを作成する)」手順で作成したリポジトリを選択します。 |
| `Permissions` | 次のように設定します。<br/>`Contents` : `Read and write`<br/>`Metadata` : `Read-only` ( `Contents` を設定した時点で勝手に設定されます ) |

それぞれ入力できたら `Generate token` をクリックします。

![](/images/goreleaser-usage/generate-pat.png)

これで `github_pat_` から始まる Personal Access Token が発行されます。
後で必要になるため控えておいてください。

![](/images/goreleaser-usage/generated-pat.png)

## 3. Personal Access Token を Secret に追加する

先ほど発行した Personal Access Token を CLI のリポジトリの Secret に追加します。
`Settings` をクリックしてリポジトリの設定画面に遷移します。

![](/images/goreleaser-usage/to-repository-settings.png)

左のメニューから `Secrets and variables` → `Actions` の順にクリックして Secrets の設定画面に遷移します。

![](/images/goreleaser-usage/to-actions.png)

`New repository secret` をクリックして Secret の追加画面に遷移します。

![](/images/goreleaser-usage/to-new-secret.png)

以下のように入力します。

| 項目 | 値 |
| --- | --- |
| `Name` | Secret 名。<br/>今回は `TAP_GITHUB_TOKEN` とします。 |
| `Secret` | 「[Homebrew Taps 用リポジトリに書き込みを行うための Personal Access Token を発行する](#2.-homebrew-taps-用のリポジトリに書き込みを行うための-personal-access-token-を発行する)」手順で発行した Personal Access Token 。 |

それぞれ入力できたら `Add secret` をクリックして Secret を追加します。

![](/images/goreleaser-usage/add-secret.png)

## 4. `.goreleaser.yaml` に Homebrew Taps の設定を追加する

`.goreleaser.yaml` に Homebrew Taps の設定を追加します。

```diff yaml:.goreleaser.yaml
 # ...省略

+brews:
+  - repository:
+      owner: koki-develop # Homebrew Taps 用のリポジトリのオーナー名
+      name: homebrew-tap # Homebrew Taps 用のリポジトリ名
+      token: "{{ .Env.TAP_GITHUB_TOKEN }}" # `TAP_GITHUB_TOKEN` 環境変数をトークンとして使うようにする
```

:::message

ここでは最低限の設定のみ追加していますが、他にも様々な設定があります ( 説明やホームページの URL など色々 ) 。
詳しい情報は下記ドキュメントをご参照ください。

- [Homebrew Taps - GoReleaser](https://goreleaser.com/customization/homebrew/)

:::

続いて GitHub Actions のワークフローも一部修正します。
[`goreleaser/goreleaser-action`](https://github.com/marketplace/actions/goreleaser-action) を実行する時に `TAP_GITHUB_TOKEN` 環境変数に 「[Personal Access Token を Secret に追加する](#3.-personal-access-token-を-secret-に追加する)」手順で追加した Secret を設定します。

```diff yaml:.github/workflows/release.yml
 name: release

 on:
   push:
     tags:
       - "v*"

 jobs:
   release:
     runs-on: ubuntu-latest
     permissions:
       contents: write # これがないとリリースを作成できない
     steps:
       # チェックアウト
       - uses: actions/checkout@v3
         with:
           fetch-depth: 0 # Changelog を正しく動作させるために必要

       # Go をセットアップ
       - uses: actions/setup-go@v3
         with:
           go-version-file: go.mod
           cache: true

       # リリース
       - uses: goreleaser/goreleaser-action@v4
         with:
           args: release --clean
         env:
           GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }} # 自動で生成されるシークレット
+          TAP_GITHUB_TOKEN: ${{ secrets.TAP_GITHUB_TOKEN }}
```

## 5. リリースする

もう一度タグをプッシュして動作確認してみます。

```sh
# タグを作成
$ git tag v0.2.0

# タグをプッシュ
$ git push origin v0.2.0
```

GitHub Actions のワークフローが完了してから「[Homebrew Taps 用のリポジトリを作成する](#1.-homebrew-taps-用のリポジトリを作成する)」手順で作成したリポジトリを確認してみると `<CLI名>.rb` というファイルが作成されていることが確認できます。
例えば今回の場合は [koki-develop/homebrew-tap](https://github.com/koki-develop/homebrew-tap) リポジトリに [`hello-cli.rb`](https://github.com/koki-develop/homebrew-tap/blob/main/hello-cli.rb) が作成されています。

https://github.com/koki-develop/homebrew-tap/blob/main/hello-cli.rb

これで Homebrew でインストールする準備は完了です。

## 6. Homebrew でインストールする

`brew install <GitHubユーザー名>/<Homebrew Taps用のリポジトリ名からhomebrew-プレフィクスを除いた部分>/<CLI名>` のように実行することで CLI をインストールすることができます。
例えば今回の場合は以下のように作っているので、インストールするコマンドは `brew install koki-develop/tap/hello-cli` になります。

- GitHub ユーザー名 : `koki-develop`
- Homebrew Taps 用のリポジトリ名 : `homebrew-tap`
- CLI 名 : `hello-cli`


```sh
$ brew install koki-develop/tap/hello-cli
==> Fetching koki-develop/tap/hello-cli
==> Downloading https://github.com/koki-develop/hello-cli/releases/download/v0.2.0/hello-cli_Darwin_arm64.tar.gz
==> Downloading from https://objects.githubusercontent.com/github-production-release-asset-2e65be/588777850/48fe475a-1
######################################################################## 100.0%
==> Installing hello-cli from koki-develop/tap
🍺  /opt/homebrew/Cellar/hello-cli/0.2.0: 3 files, 3MB, built in 1 second
==> Running `brew cleanup hello-cli`...
Disable this behaviour by setting HOMEBREW_NO_INSTALL_CLEANUP.
Hide these hints with HOMEBREW_NO_ENV_HINTS (see `man brew`).
```

インストールされました。
実行してみます。

```sh
$ hello-cli
Hello, World
```

やったー 🎉
Homebrew なのでアンインストールも簡単にできます。

```sh
$ brew uninstall hello-cli
Uninstalling /opt/homebrew/Cellar/hello-cli/0.2.0... (3 files, 3MB)
```

# まとめ

便利〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜

# 参考

https://goreleaser.com/

---
title: "Go で GitHub CLI 拡張機能を作る"
emoji: "🐙"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["github", "githubcli", "golang"]
published: true
published_at: 2023-05-15 18:00
---

先日 [gh-grass](https://github.com/koki-develop/gh-grass) という Go 製の GitHub CLI 拡張機能を開発してみたのですが、意外と簡単にできたので手順のメモです。
[gh-grass](https://github.com/koki-develop/gh-grass) については次の記事をご参照ください。

https://zenn.dev/kou_pg_0131/articles/gh-grass-introduction

# 拡張機能を作成する

:::message

GitHub CLI がインストールされている必要があります。
GitHub CLI のインストール方法については [GitHub CLI 公式リポジトリの README](https://github.com/cli/cli#installation) をご参照ください。

:::

まずは `gh extension create` を次のように実行します。

```sh
$ gh extension create --precompiled=go <拡張機能の名前>
```

例えば `hello` という名前の拡張機能を作る場合は次のように実行します。

```sh
$ gh extension create --precompiled=go hello
✓ Created directory gh-hello
✓ Initialized git repository
✓ Made initial commit
✓ Set up extension scaffolding
✓ Downloaded Go dependencies
✓ Built gh-hello binary

gh-hello is ready for development!

Next Steps
- run 'cd gh-hello; gh extension install .; gh hello' to see your new extension in action
- run 'go build && gh hello' to see changes in your code as you develop
- run 'gh repo create' to share your extension with others

For more information on writing extensions:
https://docs.github.com/github-cli/github-cli/creating-github-cli-extensions
```

すると `gh-<拡張機能の名前>` という名前でディレクトリが作成されます ( 今回の場合は `gh-hello` ) 。
作成されたディレクトリの中身は次のようになっています。

```sh
$ cd gh-hello
$ tree -aI .git
.
├── .github
│   └── workflows
│       └── release.yml
├── .gitignore
├── gh-hello
├── go.mod
├── go.sum
└── main.go

3 directories, 6 files
```

:::details main.go

```go:main.go
package main

import (
	"fmt"

	"github.com/cli/go-gh/v2/pkg/api"
)

func main() {
	fmt.Println("hi world, this is the gh-hello extension!")
	client, err := api.DefaultRESTClient()
	if err != nil {
		fmt.Println(err)
		return
	}
	response := struct {Login string}{}
	err = client.Get("user", &response)
	if err != nil {
		fmt.Println(err)
		return
	}
	fmt.Printf("running as %s\n", response.Login)
}

// For more examples of using go-gh, see:
// https://github.com/cli/go-gh/blob/trunk/example_gh_test.go
```

:::

:::details go.mod

```:go.mod
module github.com/koki-develop/gh-hello

go 1.20

require github.com/cli/go-gh/v2 v2.0.0

require (
	github.com/cli/safeexec v1.0.0 // indirect
	github.com/cli/shurcooL-graphql v0.0.3 // indirect
	github.com/henvic/httpretty v0.0.6 // indirect
	github.com/kr/text v0.2.0 // indirect
	github.com/lucasb-eyer/go-colorful v1.2.0 // indirect
	github.com/mattn/go-isatty v0.0.16 // indirect
	github.com/mattn/go-runewidth v0.0.13 // indirect
	github.com/muesli/termenv v0.12.0 // indirect
	github.com/rivo/uniseg v0.2.0 // indirect
	github.com/thlib/go-timezone-local v0.0.0-20210907160436-ef149e42d28e // indirect
	golang.org/x/net v0.7.0 // indirect
	golang.org/x/sys v0.5.0 // indirect
	golang.org/x/term v0.5.0 // indirect
	gopkg.in/yaml.v3 v3.0.1 // indirect
)
```

:::

:::details go.sum

```:go.sum
github.com/cli/go-gh/v2 v2.0.0 h1:JAgQY7VNHletsO0Eqr+/PzF7fF5QEjhY2t2+Tev3vmk=
github.com/cli/go-gh/v2 v2.0.0/go.mod h1:2/ox3Dnc8wDBT5bnTAH1aKGy6Qt1ztlFBe10EufnvoA=
github.com/cli/safeexec v1.0.0 h1:0VngyaIyqACHdcMNWfo6+KdUYnqEr2Sg+bSP1pdF+dI=
github.com/cli/safeexec v1.0.0/go.mod h1:Z/D4tTN8Vs5gXYHDCbaM1S/anmEDnJb1iW0+EJ5zx3Q=
github.com/cli/shurcooL-graphql v0.0.3 h1:CtpPxyGDs136/+ZeyAfUKYmcQBjDlq5aqnrDCW5Ghh8=
github.com/cli/shurcooL-graphql v0.0.3/go.mod h1:tlrLmw/n5Q/+4qSvosT+9/W5zc8ZMjnJeYBxSdb4nWA=
github.com/creack/pty v1.1.9/go.mod h1:oKZEueFk5CKHvIhNR5MUki03XCEU+Q6VDXinZuGJ33E=
github.com/davecgh/go-spew v1.1.1 h1:vj9j/u1bqnvCEfJOwUhtlOARqs3+rkHYY13jYWTU97c=
github.com/h2non/parth v0.0.0-20190131123155-b4df798d6542 h1:2VTzZjLZBgl62/EtslCrtky5vbi9dd7HrQPQIx6wqiw=
github.com/henvic/httpretty v0.0.6 h1:JdzGzKZBajBfnvlMALXXMVQWxWMF/ofTy8C3/OSUTxs=
github.com/henvic/httpretty v0.0.6/go.mod h1:X38wLjWXHkXT7r2+uK8LjCMne9rsuNaBLJ+5cU2/Pmo=
github.com/kr/pretty v0.1.0 h1:L/CwN0zerZDmRFUapSPitk6f+Q3+0za1rQkzVuMiMFI=
github.com/kr/text v0.2.0 h1:5Nx0Ya0ZqY2ygV366QzturHI13Jq95ApcVaJBhpS+AY=
github.com/kr/text v0.2.0/go.mod h1:eLer722TekiGuMkidMxC/pM04lWEeraHUUmBw8l2grE=
github.com/lucasb-eyer/go-colorful v1.2.0 h1:1nnpGOrhyZZuNyfu1QjKiUICQ74+3FNCN69Aj6K7nkY=
github.com/lucasb-eyer/go-colorful v1.2.0/go.mod h1:R4dSotOR9KMtayYi1e77YzuveK+i7ruzyGqttikkLy0=
github.com/mattn/go-isatty v0.0.14/go.mod h1:7GGIvUiUoEMVVmxf/4nioHXj79iQHKdU27kJ6hsGG94=
github.com/mattn/go-isatty v0.0.16 h1:bq3VjFmv/sOjHtdEhmkEV4x1AJtvUvOJ2PFAZ5+peKQ=
github.com/mattn/go-isatty v0.0.16/go.mod h1:kYGgaQfpe5nmfYZH+SKPsOc2e4SrIfOl2e/yFXSvRLM=
github.com/mattn/go-runewidth v0.0.13 h1:lTGmDsbAYt5DmK6OnoV7EuIF1wEIFAcxld6ypU4OSgU=
github.com/mattn/go-runewidth v0.0.13/go.mod h1:Jdepj2loyihRzMpdS35Xk/zdY8IAYHsh153qUoGf23w=
github.com/muesli/termenv v0.12.0 h1:KuQRUE3PgxRFWhq4gHvZtPSLCGDqM5q/cYr1pZ39ytc=
github.com/muesli/termenv v0.12.0/go.mod h1:WCCv32tusQ/EEZ5S8oUIIrC/nIuBcxCVqlN4Xfkv+7A=
github.com/pmezard/go-difflib v1.0.0 h1:4DBwDE0NGyQoBHbLQYPwSUPoCMWR5BEzIk/f1lZbAQM=
github.com/rivo/uniseg v0.2.0 h1:S1pD9weZBuJdFmowNwbpi7BJ8TNftyUImj/0WQi72jY=
github.com/rivo/uniseg v0.2.0/go.mod h1:J6wj4VEh+S6ZtnVlnTBMWIodfgj8LQOQFoIToxlJtxc=
github.com/stretchr/testify v1.7.0 h1:nwc3DEeHmmLAfoZucVR881uASk0Mfjw8xYJ99tb5CcY=
github.com/thlib/go-timezone-local v0.0.0-20210907160436-ef149e42d28e h1:BuzhfgfWQbX0dWzYzT1zsORLnHRv3bcRcsaUk0VmXA8=
github.com/thlib/go-timezone-local v0.0.0-20210907160436-ef149e42d28e/go.mod h1:/Tnicc6m/lsJE0irFMA0LfIwTBo4QP7A8IfyIv4zZKI=
golang.org/x/net v0.0.0-20220923203811-8be639271d50/go.mod h1:YDH+HFinaLZZlnHAfSS6ZXJJ9M9t4Dl22yv3iI2vPwk=
golang.org/x/net v0.7.0 h1:rJrUqqhjsgNp7KqAIc25s9pZnjU7TUcSY7HcVZjdn1g=
golang.org/x/net v0.7.0/go.mod h1:2Tu9+aMcznHK/AK1HMvgo6xiTLG5rD5rZLDS+rp2Bjs=
golang.org/x/sys v0.0.0-20210615035016-665e8c7367d1/go.mod h1:oPkhp1MJrh7nUepCBck5+mAzfO9JrbApNNgaTdGDITg=
golang.org/x/sys v0.0.0-20210630005230-0f9fa26af87c/go.mod h1:oPkhp1MJrh7nUepCBck5+mAzfO9JrbApNNgaTdGDITg=
golang.org/x/sys v0.0.0-20210831042530-f4d43177bf5e/go.mod h1:oPkhp1MJrh7nUepCBck5+mAzfO9JrbApNNgaTdGDITg=
golang.org/x/sys v0.0.0-20220209214540-3681064d5158/go.mod h1:oPkhp1MJrh7nUepCBck5+mAzfO9JrbApNNgaTdGDITg=
golang.org/x/sys v0.0.0-20220728004956-3c1f35247d10/go.mod h1:oPkhp1MJrh7nUepCBck5+mAzfO9JrbApNNgaTdGDITg=
golang.org/x/sys v0.0.0-20220811171246-fbc7d0a398ab/go.mod h1:oPkhp1MJrh7nUepCBck5+mAzfO9JrbApNNgaTdGDITg=
golang.org/x/sys v0.5.0 h1:MUK/U/4lj1t1oPg0HfuXDN/Z1wv31ZJ/YcPiGccS4DU=
golang.org/x/sys v0.5.0/go.mod h1:oPkhp1MJrh7nUepCBck5+mAzfO9JrbApNNgaTdGDITg=
golang.org/x/term v0.0.0-20210927222741-03fcf44c2211/go.mod h1:jbD1KX2456YbFQfuXm/mYQcufACuNUgVhRMnK/tPxf8=
golang.org/x/term v0.5.0 h1:n2a8QNdAb0sZNpU9R1ALUXBbY+w51fCQDN+7EdxNBsY=
golang.org/x/term v0.5.0/go.mod h1:jMB1sMXY+tzblOD4FWmEbocvup2/aLOaQEp7JmGp78k=
golang.org/x/text v0.3.7/go.mod h1:u+2+/6zg+i71rQMx5EYifcz6MCKuco9NR6JIITiCfzQ=
golang.org/x/tools v0.0.0-20180917221912-90fa682c2a6e/go.mod h1:n7NCudcB/nEzxVGmLbDWY5pfWTLqBcC2KZ6jyYvM4mQ=
gopkg.in/check.v1 v0.0.0-20161208181325-20d25e280405/go.mod h1:Co6ibVJAznAaIkqp8huTwlJQCZ016jof/cbN4VW5Yz0=
gopkg.in/check.v1 v1.0.0-20180628173108-788fd7840127 h1:qIbj1fsPNlZgppZ+VLlY7N33q108Sa+fhmuc+sWQYwY=
gopkg.in/h2non/gock.v1 v1.1.2 h1:jBbHXgGBK/AoPVfJh5x4r/WxIrElvbLel8TCZkkZJoY=
gopkg.in/yaml.v3 v3.0.1 h1:fxVm/GzAzEWqLHuvctI91KS9hhNmmWOoWu0XTYJS7CA=
gopkg.in/yaml.v3 v3.0.1/go.mod h1:K4uyk7z7BCEPqu6E+C64Yfv1cQ7kz7rIZviUmN+EgEM=
```

:::

:::details .gitignore

```
/gh-hello
/gh-hello.exe
```

:::

:::details .github/workflows/release.yml

```yaml:.github/workflows/release.yml
name: release
on:
  push:
    tags:
      - "v*"
permissions:
  contents: write

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: cli/gh-extension-precompile@v1
```

:::

リリース用の GitHub Actions ワークフローまで用意してくれる親切設計です。

# 動作確認してみる

開発中の拡張機能は普通に `go run` で実行することができます。

```sh
$ go run ./main.go
hi world, this is the gh-hello extension!
running as koki-develop
```

もしくは `gh extension install .` でインストールすることもできます。

```sh
# 事前にビルドしておく必要があるので注意
$ go build .
$ gh extension install .
```

インストールすると `gh <拡張機能の名前>` のようにして拡張機能を実行することができるようになります ( 今回の場合は `gh hello` ) 。

```sh
$ gh hello
hi world, this is the gh-hello extension!
running as koki-develop
```

`gh extension remove <拡張機能の名前>` でインストール済みの拡張機能を削除することができます。

```sh
$ gh extension remove hello
✓ Removed extension hello
```

# リリースする

最初に `gh create extension` を使用していればリリース用の GitHub Actions ワークフローも作成されているはずなので、既にリリースの準備はできています。

まずはリポジトリを作成します。
今回は GitHub CLI を使って作成します。

:::message

リポジトリ名は必ず `gh-<拡張機能の名前>` としなければいけないことに注意してください。

:::

```sh
$ gh repo create gh-hello --public --push --source=.
✓ Created repository koki-develop/gh-hello on GitHub
✓ Added remote git@github.com:koki-develop/gh-hello.git
Enumerating objects: 9, done.
Counting objects: 100% (9/9), done.
Delta compression using up to 8 threads
Compressing objects: 100% (6/6), done.
Writing objects: 100% (9/9), 3.38 KiB | 3.38 MiB/s, done.
Total 9 (delta 0), reused 0 (delta 0), pack-reused 0
To github.com:koki-develop/gh-hello.git
 * [new branch]      HEAD -> main
branch 'main' set up to track 'origin/main'.
✓ Pushed commits to git@github.com:koki-develop/gh-hello.git
```

リポジトリが作成されました。

https://github.com/koki-develop/gh-hello

続いてタグを作成 ~ push します。

```sh
$ git tag v1.0.0
$ git push origin v1.0.0
Total 0 (delta 0), reused 0 (delta 0), pack-reused 0
To github.com:koki-develop/gh-hello.git
 * [new tag]         v1.0.0 -> v1.0.0
```

タグを push するとリリース用の GitHub Actions ワークフローが実行されます。

https://github.com/koki-develop/gh-hello/actions/runs/4964692688

ワークフローが完了すると次のようなリリースが作成されます。

https://github.com/koki-develop/gh-hello/releases/tag/v1.0.0

あっという間にリリースできてしまいました。簡単ですね。

それではリリースした拡張機能をインストールしてみます。
`gh extension install <ユーザー>/<リポジトリ>` のように実行することで GitHub から拡張機能をインストールすることができます。

```sh
$ gh extension install koki-develop/gh-hello
✓ Installed extension koki-develop/gh-hello
```

インストールされたことが確認できます。

```sh
$ gh extension list
gh hello  koki-develop/gh-hello  v1.0.0

$ gh hello
hi world, this is the gh-hello extension!
running as koki-develop
```

# その他

生成されたファイルを見ればわかるように、 GitHub CLI 拡張機能とはいっても普通の Go プログラムです。
なので、例えば [Cobra](https://github.com/spf13/cobra) で CLI の機能を充実させたり [Bubble Tea](https://github.com/charmbracelet/bubbletea) でリッチな UI を実装したりなどといったことも特に制限なく行うことができます。

:::message

[Cobra](https://github.com/spf13/cobra) や [Bubble Tea](https://github.com/charmbracelet/bubbletea) については次の記事をご参照ください。

- [Go でイケてる CLI を作るために利用したパッケージ](https://zenn.dev/kou_pg_0131/articles/go-cli-packages)

:::

さらに [cli/go-gh](https://github.com/cli/go-gh) パッケージを使うことで GitHub の REST API や GraphQL API との連携も容易になります。
[cli/go-gh](https://github.com/cli/go-gh) の使い方については[公式の Example](https://github.com/cli/go-gh/blob/trunk/example_gh_test.go) があるので、こちらを見るとわかりやすいです。

https://github.com/cli/go-gh/blob/trunk/example_gh_test.go

# まとめ

サクッとお手軽で良きです。

# 参考

https://docs.github.com/ja/github-cli/github-cli/creating-github-cli-extensions

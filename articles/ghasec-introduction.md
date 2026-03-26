---
title: "セキュリティ重視の GitHub Actions 静的解析ツール「ghasec」の紹介"
emoji: "🛡️"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["github", "githubactions", "security"]
published: true
published_at: 2026-03-30 18:00
---

世の中、あまりにも GitHub Actions のセキュリティを軽視しすぎ (とは言わないまでも、関心が薄すぎ) では？と思う、今日この頃です。
というわけで、勢いのままに GitHub Actions のセキュリティに特化した静的解析ツール「ghasec」を作りました。

https://github.com/koki-develop/ghasec

![demo](/images/ghasec-introduction/demo.gif)
_こういうの_

インストール方法や基本的な使い方について紹介します。

# インストール

Homebrew でインストールできます。

```bash
$ brew install koki-develop/tap/ghasec
```

`go install` でもインストールできます。

```bash
$ go install github.com/koki-develop/ghasec@latest
```

インストールせずに Docker 経由で実行することもできます。

```bash
$ docker run --rm -v "$(pwd):/mnt" ghcr.io/koki-develop/ghasec:latest
```

# 使い方

`ghasec` コマンドを実行するだけです。

```bash
$ ghasec
```

```bash:出力例
--> .github/workflows/example.yml:1:1
1 | on: pull_request
  | ^ "permissions: {}" must be set (default-permissions)
...
  Ref: https://github.com/koki-develop/ghasec/blob/main/rules/default-permissions/README.md

--> .github/workflows/example.yml:4:3
...
3 | jobs:
4 |   example:
  |   ^^^^^^^ "timeout-minutes" must be set (job-timeout-minutes)
...
  Ref: https://github.com/koki-develop/ghasec/blob/main/rules/job-timeout-minutes/README.md

--> .github/workflows/example.yml:7:15
...
3 | jobs:
4 |   example:
...
6 |     steps:
7 |       - uses: actions/checkout@v6
  |               ^^^^^^^^^^^^^^^^^^^ "persist-credentials: false" must be set in "with" (checkout-persist-credentials)
...
  Ref: https://github.com/koki-develop/ghasec/blob/main/rules/checkout-persist-credentials/README.md

--> .github/workflows/example.yml:7:32
...
3 | jobs:
4 |   example:
...
6 |     steps:
7 |       - uses: actions/checkout@v6
  |                                ^^ "actions/checkout@v6" must be pinned to a full length commit SHA (unpinned-action)
...
  Ref: https://github.com/koki-develop/ghasec/blob/main/rules/unpinned-action/README.md

✗ 4 errors found in 1 of 1 file
⚠ 2 online rules skipped; use --online to enable them
```

## 明示的に対象ファイルを指定する

ghasec は、デフォルトでは以下のファイルを対象に検出を行います。

- `.github/workflows/*.{yml,yaml}`
- `**/action.{yml,yaml}`

対象ファイルを指定したい場合は、引数でファイルパスを指定します。

```bash
$ ghasec example.yml
$ ghasec example.yml example2.yml
```

## オンラインモード

一部のルールは内部的に GitHub API を利用しますが、これらのルールはデフォルトでは無効になっています。

`--online` フラグを指定することで、それらのルールも有効になります。

```bash
$ ghasec --online
```

GitHub API を利用する際に使用するトークンは、環境変数 `GITHUB_TOKEN` で設定できます。
レート制限などを回避したい場合などに使えます。

```bash
$ GITHUB_TOKEN="ghp_..." ghasec --online
```

## 検出を無視する

ワークフロー定義内に `ghasec-ignore` コメントを書くことで、該当箇所の検出を無視できます。

```yml
# 全てのルールを無視する
- uses: actions/checkout@v6 # ghasec-ignore

# 特定のルールを無視する
- uses: actions/checkout@v6 # ghasec-ignore:unpinned-action

# 複数のルールを無視する
- uses: actions/checkout@v6 # ghasec-ignore:unpinned-action,missing-sha-ref-comment

# 上に書いても可
# ghasec-ignore
- uses: actions/checkout@v6
```

意味のない ignore コメントはエラーになります。

```bash
...
3 | jobs:
4 |   build:
...
7 |     steps:
8 |       - uses: actions/checkout@v6 # ghasec-ignore:default-permissions
  |                                                   ^^^^^^^^^^^^^^^^^^^ unused ignore directive for "default-permissions" (unused-ignore)
```

## GitHub Actions で ghasec を使う

GitHub Actions で ghasec を使うためのアクションも用意しています。

[koki-develop/setup-ghasec](https://github.com/koki-develop/setup-ghasec) を使うと GitHub Actions のワークフロー内で ghasec をインストールできます。

https://github.com/koki-develop/setup-ghasec

単に ghasec を実行するだけでいい場合は [koki-develop/ghasec-action](https://github.com/koki-develop/ghasec-action) を使うと楽です。

https://github.com/koki-develop/ghasec-action

## AI エージェントとの連携

マークダウン形式で出力する `--format=markdown` オプションを用意しています。

```bash
$ ghasec --format=markdown
```

検出箇所とその内容について、Markdown 形式で出力されます。
いちいち検出内容を手動で修正するのは面倒なので、これをそのまま AI エージェントに丸投げしておけば、大抵はよしなにやってくれると思います。

~~~markdown:出力例
## .github/workflows/example.yml:1:1

```yaml
on: pull_request
```

- **Rule**: default-permissions
- **Message**: "permissions: {}" must be set
- **Why**: GitHub Actions grants broad default permissions to GITHUB_TOKEN. Without explicit restriction, every job inherits these broad defaults, increasing the blast radius if a step is compromised
- **Fix**: Set top-level permissions: {} and grant specific permissions per job
- **Ref**: https://github.com/koki-develop/ghasec/blob/main/rules/default-permissions/README.md

## .github/workflows/example.yml:4:3

```yaml
  example:
```

- **Rule**: job-timeout-minutes
- **Message**: "timeout-minutes" must be set
- **Why**: Jobs default to a 360-minute timeout. Without an explicit timeout, a compromised step has a large window to exfiltrate data or pivot into the internal network, especially on self-hosted runners
- **Fix**: Set timeout-minutes to an appropriate value for the expected runtime
- **Ref**: https://github.com/koki-develop/ghasec/blob/main/rules/job-timeout-minutes/README.md

## .github/workflows/example.yml:7:15

```yaml
      - uses: actions/checkout@v6
```

- **Rule**: checkout-persist-credentials
- **Message**: "persist-credentials: false" must be set in "with"
- **Why**: By default, actions/checkout persists the GITHUB_TOKEN in the local git config. Subsequent steps — including third-party actions — can extract and misuse this token
- **Fix**: Add persist-credentials: false to the with section of the checkout step
- **Ref**: https://github.com/koki-develop/ghasec/blob/main/rules/checkout-persist-credentials/README.md

## .github/workflows/example.yml:7:32

```yaml
      - uses: actions/checkout@v6
```

- **Rule**: unpinned-action
- **Message**: "actions/checkout@v6" must be pinned to a full length commit SHA
- **Why**: Git tags and branches are mutable. A compromised upstream can move a tag to point to malicious code, executing it silently on the next run
- **Fix**: Pin to the full 40-character commit SHA. Add the version as an inline comment to keep it human-readable
- **Ref**: https://github.com/koki-develop/ghasec/blob/main/rules/unpinned-action/README.md

---

4 errors found in 1 of 1 file.

> **Note**: 2 online rules skipped. Use `--online` to enable them.
~~~

# 主なルール

ghasec が検出するルールのうちの一部を紹介します。
全ての一覧については [ghasec/rules/README.md](https://github.com/koki-develop/ghasec/blob/main/rules/README.md) をご参照ください。

## リモートアクションのコミット SHA 固定

コミット SHA で固定されていないリモートアクションの参照を検出します。

https://github.com/koki-develop/ghasec/blob/main/rules/unpinned-action/README.md#

```bash
--> ./example.yml:7:32
...
3 | jobs:
4 |   build:
...
6 |     steps:
7 |       - uses: actions/checkout@v6
  |                                ^^ "actions/checkout@v6" must be pinned to a full length commit SHA (unpinned-action)
  Ref: https://github.com/koki-develop/ghasec/blob/main/rules/unpinned-action/README.md
```

なぜコミット SHA 固定するべきなのかについては、以下の記事をご参照ください。

https://zenn.dev/kou_pg_0131/articles/gha-should-be-pinned

## スクリプトインジェクション

`run` や `actions/github-script` の `script` 内での `${{ ... }}` の使用を検出します。

https://github.com/koki-develop/ghasec/blob/main/rules/script-injection/README.md#

```bash
--> example.yml:7:20
...
3 | jobs:
4 |   build:
...
6 |     steps:
7 |       - run: echo "${{ github.event.issue.title }}"
  |                    ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ "run" must not contain expressions; use environment variables instead (script-injection)
...
  Ref: https://github.com/koki-develop/ghasec/blob/main/rules/script-injection/README.md

--> example.yml:11:46
...
 3 | jobs:
 4 |   build:
...
 6 |     steps:
...
 8 |       - uses: actions/github-script@v8
 9 |         with:
10 |           script: |
11 |             console.log("The issue title is: ${{ github.event.issue.title }}");
   |                                              ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ "script" must not contain expressions; use environment variables instead (script-injection)
  Ref: https://github.com/koki-develop/ghasec/blob/main/rules/script-injection/README.md
```

スクリプトインジェクションについては以下の記事をご参照ください。

https://zenn.dev/kou_pg_0131/articles/gha-script-injection

## なりすましコミット (Impostor Commit)

リモートアクションのコミット SHA が該当リポジトリのものでない場合に検出します。

https://github.com/koki-develop/ghasec/blob/main/rules/impostor-commit/README.md#

```bash
...
3 | jobs:
4 |   build:
...
6 |     steps:
7 |       - uses: actions/checkout@de0fac2e4500dabe0009e67214ff5f5447ce83dc # v6.0.2
  |                                ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ commit must belong to actions/checkout (impostor-commit)
  Ref: https://github.com/koki-develop/ghasec/blob/main/rules/impostor-commit/README.md
```

Impostor Commit については以下の記事がわかりやすかったです。

https://www.chainguard.dev/unchained/what-the-fork-imposter-commits-in-github-actions-and-ci-cd

:::message

ちなみに最近発生した Trivy のインシデントでも Impostor Commit は使用されています。

- [2026年3月19日の Trivy 再侵害の概要と対応指針 – やっていく気持ち](https://diary.shift-js.info/trivy-compromise/)

:::

# 技術的な話

## 検出の仕組み

[goccy/go-yaml](https://github.com/goccy/go-yaml) を使って YAML をパースして、ルールごとにめっっっっちゃ地道に検出ロジックを書いてるだけです。あんまり特別なことはしていません。

https://github.com/goccy/go-yaml

## 検出結果の表示

![screenshot](/images/ghasec-introduction/screenshot.png)

検出結果のファイルコンテンツおよびエラーメッセージの表示については [koki-develop/annotate-go](https://github.com/koki-develop/annotate-go) を使っています。ghasec のためだけに作りました。

https://github.com/koki-develop/annotate-go

こんな感じで使えます。

```go:main.go
package main

import (
	"fmt"

	"github.com/koki-develop/annotate-go"
)

func main() {
	src := []byte(`name = "Alice"
age = 30
`)
	labels := []annotate.Label{
		{Span: annotate.Span{Start: 0, End: 4}, Marker: annotate.MarkerDash, Text: "string field"},
		{Span: annotate.Span{Start: 15, End: 18}, Marker: annotate.MarkerTilde, Text: "integer field"},
	}
	r := annotate.New()
	output, _ := r.Render(src, labels)
	fmt.Print(output)
}
```

```:出力例
1 | name = "Alice"
  | ---- string field
2 | age = 30
  | ~~~ integer field
```

[alecthomas/chroma](https://github.com/alecthomas/chroma) などと組み合わせてシンタックスハイライトなどの装飾もできるようになっています。

詳しい使い方については [pkg.go.dev](https://pkg.go.dev/github.com/koki-develop/annotate-go) をご参照ください。

https://pkg.go.dev/github.com/koki-develop/annotate-go

# まとめ

たとえ静的解析ツールがあっても使わないと意味がないんですけどね！！！！

https://sizu.me/koki_develop/posts/bee4minfae45

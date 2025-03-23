---
title: "GitHub Actions を静的検査するツールの紹介 (actionlint/ghalint/zizmor)"
emoji: "🔍"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["githubactions"]
published: true
published_at: 2025-03-24 18:00
---

先日、 tj-actions/changed-files や reviewdog/action-* などのアクションの Git タグが書き換えられるという出来事がありました。
これにより、これらのアクションを Git タグで参照している GitHub Actions Workflow 内で悪意のあるコードが実行されてしまうという事態が発生しました。

https://semgrep.dev/blog/2025/popular-github-action-tj-actionschanged-files-is-compromised/
https://www.wiz.io/blog/new-github-action-supply-chain-attack-reviewdog-action-setup

このような事態を防ぐためには、アクションの参照には Git タグではなくコミットハッシュを使用するなどの対策が必要です。

```yaml
# ❌ Git タグは書き換えられる可能性がある
- uses: actions/checkout@v4
- uses: actions/checkout@v4.2.2

# ⭕ コミットハッシュを指定しておけば Git タグが書き換えられても影響を受けない
- uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683 # v4.2.2
```

:::message

Git タグ → コミットハッシュへの書き換えは pinact が便利です。

- [suzuki-shunsuke/pinact](https://github.com/suzuki-shunsuke/pinact)
- [pinact - GitHub Actions のバージョンを commit hash で固定](https://zenn.dev/shunsuke_suzuki/articles/pinact-pin-github-actions-version)

:::

しかし、 GitHub Action ではアクションのコミットハッシュ指定以外にも考慮すべき事項がたくさんあります。
それらを人力で全てチェックするのには限界があるため、以下のような静的検査ツールを利用して自動化することが重要です。

- [actionlint - Static checker for GitHub Actions workflow files](#actionlint---static-checker-for-github-actions-workflow-files)
- [ghalint - GitHub Actions linter](#ghalint---github-actions-linter)
- [zizmor - A static analysis tool for GitHub Actions](#zizmor---a-static-analysis-tool-for-github-actions)

この記事ではこれらのツールの基本的な使い方についてまとめます。

# 検証環境

- actionlint 1.7.7
- ghalint 1.2.3
- zizmor 1.5.1

---

# actionlint - Static checker for GitHub Actions workflow files

https://github.com/rhysd/actionlint

## チェックできる項目

actionlint でチェックできる項目の一覧は以下の公式ドキュメントに記載されています。

https://github.com/rhysd/actionlint/blob/v1.7.7/docs/checks.md#

主に構文チェック系の機能が充実しており、例として次のようなものがあります。

- 必須キーやキー重複のチェック
- `${{ }}` の構文チェック
- shellcheck によるシェルスクリプトのチェック
- pyflakes による Python スクリプトのチェック
- etc.

## インストール

Homebrew でインストールできます。

```
$ brew install actionlint
```

その他のインストール方法については公式ドキュメントをご参照ください。

https://github.com/rhysd/actionlint/blob/v1.7.7/docs/install.md#

## 基本的な使い方

:::details $ actionlint --help

```
Usage: actionlint [FLAGS] [FILES...] [-]

  actionlint is a linter for GitHub Actions workflow files.

  To check all YAML files in current repository, just run actionlint without
  arguments. It automatically finds the nearest '.github/workflows' directory:

    $ actionlint

  To check specific files, pass the file paths as arguments:

    $ actionlint file1.yaml file2.yaml

  To check content which is not saved in file yet (e.g. output from some
  command), pass - argument. It reads stdin and checks it as workflow file:

    $ actionlint -

  To serialize errors into JSON, use -format option. It allows to format error
  messages flexibly with Go template syntax.

    $ actionlint -format '{{json .}}'

Documents:

  - List of checks: https://github.com/rhysd/actionlint/tree/v1.7.7/docs/checks.md
  - Usage:          https://github.com/rhysd/actionlint/tree/v1.7.7/docs/usage.md
  - Configuration:  https://github.com/rhysd/actionlint/tree/v1.7.7/docs/config.md

Flags:
  -color
    	Always enable colorful output. This is useful to force colorful outputs
  -config-file string
    	File path to config file
  -debug
    	Enable debug output (for development)
  -format string
    	Custom template to format error messages in Go template syntax. See the usage documentation for more details
  -ignore value
    	Regular expression matching to error messages you want to ignore. This flag is repeatable
  -init-config
    	Generate default config file at .github/actionlint.yaml in current project
  -no-color
    	Disable colorful output
  -oneline
    	Use one line per one error. Useful for reading error messages from programs
  -pyflakes string
    	Command name or file path of "pyflakes" external command. If empty, pyflakes integration will be disabled (default "pyflakes")
  -shellcheck string
    	Command name or file path of "shellcheck" external command. If empty, shellcheck integration will be disabled (default "shellcheck")
  -stdin-filename string
    	File name when reading input from stdin (default "<stdin>")
  -verbose
    	Enable verbose output
  -version
    	Show version and how this binary was installed
```

:::

`actionlint` を実行するだけです。

```bash
$ actionlint
```

```:出力
.github/workflows/example.yml:4:3: "runs-on" section is missing in job "test" [syntax-check]
  |
4 |   test:
  |   ^~~~~
.github/workflows/example.yml:7:16: shell name "super-shell" is invalid. available names are "bash", "cmd", "powershell", "pwsh", "python", "sh" [shell-name]
  |
7 |         shell: super-shell
  |                ^~~~~~~~~~~
```

### 明示的にファイルパスを指定する

actionlint はデフォルトでは `.github/workflows/` ディレクトリ内の Workflow ファイルをチェックしますが、引数で明示的に対象ファイルパスを指定することもできます。

```bash
$ actionlint foo.yml bar.yml
```

### 出力形式をカスタマイズする

`-format` フラグを使うと Go テンプレート構文を使用して出力形式をカスタマイズできます。
様々なフォーマット例が公式ドキュメントに記載されています。

https://github.com/rhysd/actionlint/blob/v1.7.7/docs/usage.md#format-error-messages


```bash:JSON 形式で出力する例
$ actionlint -format '{{json .}}'
```

```json:出力
[
  {
    "message": "\"runs-on\" section is missing in job \"test\"",
    "filepath": ".github/workflows/example.yml",
    "line": 4,
    "column": 3,
    "kind": "syntax-check",
    "snippet": "  test:\n  ^~~~~",
    "end_column": 7
  },
  {
    "message": "shell name \"super-shell\" is invalid. available names are \"bash\", \"cmd\", \"powershell\", \"pwsh\", \"python\", \"sh\"",
    "filepath": ".github/workflows/example.yml",
    "line": 7,
    "column": 16,
    "kind": "shell-name",
    "snippet": "        shell: super-shell\n               ^~~~~~~~~~~",
    "end_column": 26
  }
]
```

<br/>

その他の actionlint の詳しい使い方については公式ドキュメントをご参照ください。

https://github.com/rhysd/actionlint/blob/v1.7.7/docs/usage.md#

---

# ghalint - GitHub Actions linter

https://github.com/suzuki-shunsuke/ghalint

## チェックできる項目

ghalint でチェックできる項目の一覧は以下の公式ドキュメントに記載されています。

https://github.com/suzuki-shunsuke/ghalint/tree/main?tab=readme-ov-file#policies

主にセキュリティ系のチェックが充実しており、例として次のようなものがあります。

- job の permissions 指定の必須化
- コミットハッシュによるアクション参照の必須化
- `actions/checkout` アクションへの `persist-credentials: false` の設定の必須化
- etc.

## インストール

Homebrew でインストールできます。

```
$ brew install suzuki-shunsuke/ghalint/ghalint
```

その他のインストール方法については公式ドキュメントをご参照ください。

https://github.com/suzuki-shunsuke/ghalint/blob/main/docs/install.md#

## 基本的な使い方

:::details $ ghalint --help

```
NAME:
   ghalint - GitHub Actions linter

USAGE:
   ghalint [global options] command [command options]

VERSION:
   1.2.3 (2e5e757c1e8b958315fb2d24e0434ede0eaed598)

COMMANDS:
   run              lint GitHub Actions Workflows
   run-action, act  lint actions
   version          Show version
   help, h          Shows a list of commands or help for one command

GLOBAL OPTIONS:
   --log-color value         log color. auto(default)|always|never [$GHALINT_LOG_COLOR]
   --log-level value         log level [$GHALINT_LOG_LEVEL]
   --config value, -c value  configuration file path [$GHALINT_CONFIG]
   --help, -h                show help
   --version, -v             print the version
```

:::

ghalint は次の 2 つのコマンドを提供しています。

- `ghalint run` : Workflow をチェックする
- `ghalint run-action` : Action をチェックする

### Workflow をチェックする (`ghalint run`)

:::details $ ghalint run --help

```
NAME:
   ghalint run - lint GitHub Actions Workflows

USAGE:
   ghalint run [command options]

OPTIONS:
   --help, -h  show help
```

:::

`ghalint run` は `.github/workflows/` ディレクトリ内の Workflow ファイルをチェックします。

```bash
$ ghalint run
```

```:出力
ERRO[0000] the job violates policies                     error="job should have permissions" job_name=test policy_name=job_permissions program=ghalint reference="https://github.com/suzuki-shunsuke/ghalint/blob/main/docs/policies/001.md" version=1.2.3 workflow_file_path=.github/workflows/example.yml
ERRO[0000] the step violates policies                    action=actions/checkout error="action ref should be full length SHA1" job_name=test policy_name=action_ref_should_be_full_length_commit_sha program=ghalint reference="https://github.com/suzuki-shunsuke/ghalint/blob/main/docs/policies/008.md" version=1.2.3 workflow_file_path=.github/workflows/example.yml
ERRO[0000] the step violates policies                    error="persist-credentials should be false" job_name=test policy_name=checkout_persist_credentials_should_be_false program=ghalint reference="https://github.com/suzuki-shunsuke/ghalint/blob/main/docs/policies/013.md" version=1.2.3 workflow_file_path=.github/workflows/example.yml
```

### Action をチェックする (`ghalint run-action`)

:::details $ ghalint run-action --help

```
NAME:
   ghalint run-action - lint actions

USAGE:
   ghalint run-action [command options]

OPTIONS:
   --help, -h  show help
```

:::

`ghalint run-action` は action.yaml をチェックします。

```bash
$ ghalint run-action
# alias
$ ghalint act
```

```:出力
ERRO[0000] the step violates policies                    action=actions/checkout action_file_path=action.yml error="action ref should be full length SHA1" policy_name=action_ref_should_be_full_length_commit_sha program=ghalint reference="https://github.com/suzuki-shunsuke/ghalint/blob/main/docs/policies/008.md" version=1.2.3
ERRO[0000] the step violates policies                    action_file_path=action.yml error="persist-credentials should be false" policy_name=checkout_persist_credentials_should_be_false program=ghalint reference="https://github.com/suzuki-shunsuke/ghalint/blob/main/docs/policies/013.md" version=1.2.3
FATA[0000] ghalint failed                                error="some action files are invalid" program=ghalint version=1.2.3
```

デフォルトではカレントディレクトリの `action.yml` / `action.yaml` をチェックしますが、明示的にファイルパスを指定することもできます。

```bash
$ ghalint act foo/action.yaml
# 複数指定もできる
$ ghalint act foo/action.yaml bar/action.yml
```

<br/>

その他の ghalint の詳しい使い方については公式ドキュメントをご参照ください。

https://github.com/suzuki-shunsuke/ghalint#how-to-use

---

# zizmor - A static analysis tool for GitHub Actions

https://github.com/woodruffw/zizmor

## チェックできる項目

zizmor でチェックできる項目の一覧は以下の公式ドキュメントに記載されています。

https://woodruffw.github.io/zizmor/audits/

こちらも主にセキュリティ系のチェックが充実しており、例として次のようなものがあります。

- 過剰な permissions の禁止
- なりすましコミットの検出
- テンプレート展開によるコードインジェクションの検出
- etc.

## インストール

Homebrew でインストールできます。

```
$ brew install zizmor
```

その他のインストール方法については公式ドキュメントをご参照ください。

https://woodruffw.github.io/zizmor/installation/

## 基本的な使い方

:::details $ zizmor --help

```
Static analysis for GitHub Actions

Usage: zizmor [OPTIONS] <INPUTS>...

Arguments:
  <INPUTS>...
          The inputs to audit.

          These can be individual workflow filenames, action definitions (typically `action.yml`), entire directories, or a `user/repo` slug for a GitHub repository. In the latter case, a `@ref` can be appended to audit the repository at a particular git reference state.

Options:
  -p, --pedantic
          Emit 'pedantic' findings.

          This is an alias for --persona=pedantic.

      --persona <PERSONA>
          The persona to use while auditing

          [default: regular]

          Possible values:
          - auditor:  The "auditor" persona (false positives OK)
          - pedantic: The "pedantic" persona (code smells OK)
          - regular:  The "regular" persona (minimal false positives)

  -o, --offline
          Perform only offline operations.

          This disables all online audit rules, and prevents zizmor from auditing remote repositories.

          [env: ZIZMOR_OFFLINE=]

      --gh-token <GH_TOKEN>
          The GitHub API token to use

          [env: GH_TOKEN=]

      --gh-hostname <GH_HOSTNAME>
          The GitHub Server Hostname. Defaults to github.com

          [env: GH_HOST=]
          [default: github.com]

      --no-online-audits
          Perform only offline audits.

          This is a weaker version of `--offline`: instead of completely forbidding all online operations, it only disables audits that require connectivity.

          [env: ZIZMOR_NO_ONLINE_AUDITS=]

  -v, --verbose...
          Increase logging verbosity

  -q, --quiet...
          Decrease logging verbosity

      --no-progress
          Don't show progress bars, even if the terminal supports them

      --format <FORMAT>
          The output format to emit. By default, plain text will be emitted

          [default: plain]
          [possible values: plain, json, sarif]

      --color <MODE>
          Control the use of color in output

          Possible values:
          - auto:   Use color output if the output supports it
          - always: Force color output, even if the output isn't a terminal
          - never:  Disable color output, even if the output is a compatible terminal

  -c, --config <CONFIG>
          The configuration file to load. By default, any config will be discovered relative to $CWD

      --no-config
          Disable all configuration loading

      --no-exit-codes
          Disable all error codes besides success and tool failure

      --min-severity <MIN_SEVERITY>
          Filter all results below this severity

          [possible values: unknown, informational, low, medium, high]

      --min-confidence <MIN_CONFIDENCE>
          Filter all results below this confidence

          [possible values: unknown, low, medium, high]

      --cache-dir <CACHE_DIR>
          The directory to use for HTTP caching. By default, a host-appropriate user-caching directory will be used

      --collect <COLLECT>
          Control which kinds of inputs are collected for auditing.

          By default, all workflows and composite actions are collected.

          [default: default]

          Possible values:
          - all:            Collect all possible inputs, ignoring `.gitignore` files
          - default:        Collect all possible inputs, respecting `.gitignore` files
          - workflows-only: Collect only workflow definitions
          - actions-only:   Collect only action definitions (i.e. `action.yml`)

  -h, --help
          Print help (see a summary with '-h')

  -V, --version
          Print version
```

:::

`zizmor` に対象パスを指定するだけです。

```bash
# カレントディレクトリ内の全ての Workflow/Action をチェック
$ zizmor .
# 複数指定もできる
$ zizmor foo.yml bar/baz.yml
# GitHub リポジトリも指定できる
$ zizmor --gh-token="<GITHUB_TOKEN>" koki-develop/zenn-contents
```

```:出力
 INFO audit: zizmor: 🌈 completed ./.github/workflows/example.yml
warning[artipacked]: credential persistence through GitHub Actions artifacts
 --> ./.github/workflows/example.yml:8:9
  |
8 |       - uses: actions/checkout@v4
  |         ------------------------- does not set persist-credentials: false
  |
  = note: audit confidence → Low

warning[excessive-permissions]: overly broad permissions
 --> ./.github/workflows/example.yml:5:3
  |
5 | /   test:
6 | |     runs-on: ubuntu-latest
7 | |     steps:
8 | |       - uses: actions/checkout@v4
  | |                                  -
  | |__________________________________|
  |                                    this job
  |                                    default permissions used due to no permissions: block
  |
  = note: audit confidence → Medium

5 findings (3 suppressed): 0 unknown, 0 informational, 0 low, 2 medium, 0 high
```

### 分析の感度を調整する

`--persona` フラグに分析の感度を指定できます。
指定できる値は次の通りです。

- `regular` (デフォルト) : 実用的なセキュリティの問題のみを検出する
- `pedantic` : セキュリティの問題に加えて、改善が望ましい箇所も検出する
- `auditor` : 誤検知の可能性も含めて全ての潜在的な問題を検出する

```bash:例
# regular
$ zizmor --persona=regular .
$ zizmor . # 未指定の場合は `regular` になる

# pedantic
$ zizmor --persona=pedantic .
$ zizmor -p # alias
$ zizmor --pedantic # alias

# auditor
$ zizmor --persona=auditor .
```

### オンラインモードで実行する

一部のチェック項目は内部的に GitHub API を使用する必要があり、それらはデフォルトでは無効になっています ( offline モード) 。
これらのチェック項目を有効にする ( online モード) には GitHub Token を指定する必要があります。

```bash
$ zizmor --gh-token="<GITHUB_TOKEN>" .
# `GH_TOKEN` 環境変数経由でも指定可能
$ GH_TOKEN="<GITHUB_TOKEN>" zizmor .
```

<br/>

その他の zizmor の詳しい使い方については公式ドキュメントをご参照ください。

https://woodruffw.github.io/zizmor/usage/

---

# どれを使うべきなのか？

それぞれチェックする範囲が異なっている部分も多く、且つ競合もしないので、個人的には全部併用するのが一番安心という気がしますね。

:::message

僕は個人リポジトリでは GitHub Actions でこれらのツールを実行するようにしています。
( [koki-develop/github-actions-lint](https://github.com/koki-develop/github-actions-lint) は GitHub Actions で actionlint/ghalint/zizmor を使うための Action )

```yaml:.github/workflows/github-actions-lint.yml
# ...

jobs:
  actionlint:
    # ...
    steps:
      - uses: actions/checkout@<SHA>
        with:
          persist-credentials: false
      - uses: koki-develop/github-actions-lint/actionlint@<SHA>

  ghalint:
    # ...
    steps:
      - uses: actions/checkout@<SHA>
        with:
          persist-credentials: false
      - uses: koki-develop/github-actions-lint/ghalint@<SHA>
        with:
          action-path: ./.github/actions/**/action.yml

  zizmor:
    # ...
    steps:
      - uses: actions/checkout@<SHA>
        with:
          persist-credentials: false
      - uses: koki-develop/github-actions-lint/zizmor@<SHA>
        with:
          github-token: ${{ github.token }}
          persona: auditor
```

[koki-develop/zenn-contents/.github/workflows/github-actions-lint.yml](https://github.com/koki-develop/zenn-contents/blob/main/.github/workflows/github-actions-lint.yml)

:::

# まとめ

セキュアな GitHub Actions 運用をしていきたい。

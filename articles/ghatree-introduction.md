---
title: "GitHub Actions の依存関係を出力する「ghatree」の紹介"
emoji: "🌲"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["githubactions"]
published: true
published_at: 2025-08-25 18:00
---

GitHub Actions ワークフロー内で利用しているアクションの依存関係を再帰的に取得して出力するコマンドラインツール「ghatree」をつくりました。

![demo](/images/ghatree-introduction/demo.gif)
_こういうの_

https://www.npmjs.com/package/ghatree
https://github.com/koki-develop/ghatree

この記事では ghatree の基本的な使い方と活用例を紹介します。

- [使い方](#使い方)
- [コミット SHA 固定していないアクションの利用を特定する](#コミット-sha-固定していないアクションの利用を特定する)
- [まとめ](#まとめ)

# 使い方

npm パッケージとして配布しているため、 `npx` コマンド等で実行できます。

```shell
$ npx ghatree@latest
# or
$ bun x ghatree@latest
# or ...
```

![demo](/images/ghatree-introduction/demo.gif)

デフォルトでは ghatree はカレントディレクトリから `.github/workflows` 配下のワークフローを探索します。
特定のリポジトリを指定したい場合は `--repo` フラグを利用します。

```shell
$ npx ghatree@latest --repo koki-develop/ghatree
```

## GitHub Token の指定

`ghatree` は内部的に GitHub API を利用してワークフローの情報を取得します。
その際に利用するトークンは `GITHUB_TOKEN` 環境変数で指定できます。

```shell
$ GITHUB_TOKEN=<your-token> npx ghatree@latest
```

プライベートなリポジトリを解析する場合や API のレートリミットを回避するために有用です。

## JSON 形式で出力する

`--json` フラグを利用すると、JSON 形式で出力できます。

```shell
$ npx ghatree@latest --json
```

:::details 出力例

```json
{
  "type": "repository",
  "dependencies": [
    {
      "type": "workflow",
      "path": ".github/workflows/example1.yml",
      "dependencies": [
        {
          "type": "job",
          "path": "job1",
          "dependencies": [
            {
              "type": "action",
              "repository": {
                "owner": "actions",
                "name": "checkout"
              },
              "ref": "v5",
              "dependencies": []
            },
            {
              "type": "action",
              "repository": {
                "owner": "actions",
                "name": "setup-node"
              },
              "ref": "v4",
              "dependencies": []
            }
          ]
        },
        {
          "type": "job",
          "path": "job2",
          "dependencies": [
            {
              "type": "action",
              "repository": {
                "owner": "actions",
                "name": "checkout"
              },
              "ref": "v5",
              "dependencies": []
            },
            {
              "type": "action",
              "repository": {
                "owner": "cli",
                "name": "gh-extension-precompile"
              },
              "dependencies": [
                {
                  "type": "action",
                  "repository": {
                    "owner": "actions",
                    "name": "setup-go"
                  },
                  "ref": "v5",
                  "dependencies": []
                },
                {
                  "type": "action",
                  "repository": {
                    "owner": "actions",
                    "name": "attest-build-provenance"
                  },
                  "ref": "v1",
                  "dependencies": [
                    {
                      "type": "action",
                      "repository": {
                        "owner": "actions",
                        "name": "attest-build-provenance"
                      },
                      "path": "predicate",
                      "ref": "36fa7d009e22618ca7cd599486979b8150596c74",
                      "dependencies": []
                    },
                    {
                      "type": "action",
                      "repository": {
                        "owner": "actions",
                        "name": "attest"
                      },
                      "ref": "67422f5511b7ff725f4dbd6fb9bd2cd925c65a8d",
                      "dependencies": []
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "type": "workflow",
      "path": ".github/workflows/example2.yml",
      "dependencies": [
        {
          "type": "job",
          "path": "job1",
          "dependencies": [
            {
              "type": "action",
              "repository": {
                "owner": "actions",
                "name": "checkout"
              },
              "ref": "v5",
              "dependencies": []
            },
            {
              "type": "action",
              "repository": {
                "owner": "actions",
                "name": "setup-go"
              },
              "ref": "v5",
              "dependencies": []
            }
          ]
        },
        {
          "type": "job",
          "path": "job2",
          "dependencies": [
            {
              "type": "action",
              "repository": {
                "owner": "actions",
                "name": "checkout"
              },
              "ref": "v5",
              "dependencies": []
            },
            {
              "type": "action",
              "repository": {
                "owner": "anthropics",
                "name": "claude-code-action"
              },
              "ref": "beta",
              "dependencies": [
                {
                  "type": "action",
                  "repository": {
                    "owner": "oven-sh",
                    "name": "setup-bun"
                  },
                  "ref": "735343b667d3e6f658f44d0eca948eb6282f2b76",
                  "dependencies": []
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

:::

# コミット SHA 固定していないアクションの利用を特定する

ここでは、 ghatree を使用して GitHub Actions ワークフロー内でコミット SHA 固定していないアクションの利用を再帰的に探索し、特定する方法を紹介します。

## GitHub Actions でのアクション参照にはコミット SHA 固定が推奨されている

GitHub Actions で `uses:` キーワードを使用してアクションを参照する際は、 Git タグではなくコミット SHA を指定することがセキュリティの上で推奨されています。

```yaml
# ❌ Git タグは書き換えられる可能性がある
- uses: actions/checkout@v5
- uses: actions/checkout@v5.0.0

# ⭕ コミットハッシュを指定しておけば Git タグが書き換えられても影響を受けない
- uses: actions/checkout@08c6903cd8c0fde910a37f88322edcfb5dd907a8 # v5.0.0
```

> リリースされたアクションバージョンのコミットSHAを使用するのが、安定性とセキュリティのうえで最も安全です。
> > [GitHub Actions のワークフロー構文 - GitHub Docs](https://docs.github.com/ja/actions/reference/workflows-and-actions/workflow-syntax#jobsjob_idstepsuses)

実際、 `tj-actions/changed-files` や `reviewdog/action-*` などのアクションの Git タグが書き換えられ、これらのアクションを Git タグで参照している GitHub Actions Workflow 内で悪意のあるコードが実行されてしまうという出来事もありました。

https://unit42.paloaltonetworks.com/github-actions-supply-chain-attack

## Enforce SHA Pinning について

先日、 GitHub にて Enforce SHA Pinning という機能が追加され、アクションの参照にコミット SHA を使用することを強制できるようになりました。

https://github.blog/changelog/2025-08-15-github-actions-policy-now-supports-blocking-and-sha-pinning-actions/#enforce-sha-pinning

Enforce SHA Pinning を有効にすると、コミット SHA 固定されていないアクションを使用しているワークフローの実行が失敗するようになります。
例えば以下のようなワークフローを実行するとエラーになります。

```yaml
on: push

jobs:
  main:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5 # コミット SHA 固定されていない
```

![](/images/ghatree-introduction/enforce-sha-pinning-error.png)

Enforce SHA Pinning についての詳細は以下の記事がわかりやすいので、こちらをご参照ください。

https://zenn.dev/shunsuke_suzuki/articles/github-actions-enforce-sha-pinning

---

Enforce SHA Pinning の重要な点の 1 つとして、**ワークフローが直接使用していないアクションもチェック対象に含まれる**というものがあります。

例えば以下のようなワークフローがあったとします。

```yaml
on: workflow_dispatch

jobs:
  main:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@08c6903cd8c0fde910a37f88322edcfb5dd907a8 # v5.0.0
      - uses: cli/gh-extension-precompile@9e2237c30f869ad3bcaed6a4be2cd43564dd421b # v2.1.0
```

一見すると全てのアクションがコミット SHA 固定されていて問題ないように見えますが、 Enforce SHA Pinning を有効にしたリポジトリでこのワークフローを実行すると**エラーになります**。

![failure](/images/ghatree-introduction/setup-job-failure.png)

> **The actions actions/setup-go@v5 and actions/attest-build-provenance@v1 are not allowed** in koki-develop/enforce-sha-pinning-sandbox because all actions must be pinned to a full-length commit SHA.

`actions/setup-go@v5` や `actions/attest-build-provenance@v1` などは使用していないのに、なぜエラーになるのでしょうか？

実は上記のワークフローで使用している `cli/gh-extension-precompile` アクションが内部的に `actions/setup-go` や `actions/attest-build-provenance` といったアクションに依存しており、これらは**コミット SHA 固定されていません**。

https://github.com/cli/gh-extension-precompile/blob/f21e338a41ca62b35ae10c057985560ce8ccd09f/action.yml#L39
https://github.com/cli/gh-extension-precompile/blob/f21e338a41ca62b35ae10c057985560ce8ccd09f/action.yml#L117

このように Enforce SHA Pinning では、ワークフローが直接使用しているアクションだけではなく、**あるアクションが内部的に依存しているアクションもチェック対象に含まれます**。

---

上記の例では比較的簡単に依存関係を辿ってコミット SHA 固定されていないアクションを特定できましたが、より大きく複雑なワークフローの場合にまた同じような調査を手動で行うのは結構大変です。

## ghatree を使用して、 SHA 固定していないアクションを特定する

ghatree では、ワークフロー内で使用しているアクションの依存関係を再帰的に取得できるため、 SHA 固定していないアクションの特定に活用できます。
以下は ghatree の JSON 出力を再帰的に辿り、 SHA 固定していないアクションをログ出力する Bun Shell スクリプトの例です。

```ts
import { $ } from "bun";

type Node = {
  type: string;
  dependencies: Node[];
  [key: string]: any;
};

const tree = await $`bunx ghatree@latest --json`.json();
traverse(tree, []);

function traverse(node: Node, stacks: Node[]) {
  stacks.push(node);
  try {
    // check remote action
    if (node.type === "action" && !node.path?.startsWith(".")) {
      // SHA 固定されていないアクションをログ出力
      if (!node.ref || !isFullSHA(node.ref)) {
        console.warn(
          stacks
            .slice(1)
            .map((node) => {
              if (node.type !== "action") {
                return node.path;
              }
              return `${node.repository.owner}/${node.repository.name}${node.path ? `/${node.path}` : ""}${node.ref ? `@${node.ref}` : ""}`;
            })
            .join(" > "),
        );
        return;
      }
    }

    for (const dependency of node.dependencies) {
      traverse(dependency, stacks);
    }
  } finally {
    stacks.pop();
  }
}

function isFullSHA(version: string): boolean {
  return /^[a-f0-9]{40}$/i.test(version);
}
```

```shell
$ bun run ./index.ts
```

```:出力例
.github/workflows/example.yml > main > cli/gh-extension-precompile@9e2237c30f869ad3bcaed6a4be2cd43564dd421b > actions/setup-go@v5
.github/workflows/example.yml > main > cli/gh-extension-precompile@9e2237c30f869ad3bcaed6a4be2cd43564dd421b > actions/attest-build-provenance@v1
```

# まとめ

便利〜。

---
title: "GitHub Actions で GitHub Models を使って terraform plan の実行結果を要約してもらう"
emoji: "🤖"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["ai", "terraform", "githubactions"]
published: false
---

GitHub Actions の `GITHUB_TOKEN` を使って GitHub Models を呼び出すことができるようになりました。

https://github.blog/changelog/2025-04-14-github-actions-token-integration-now-generally-available-in-github-models/
https://docs.github.com/en/github-models/integrating-ai-models-into-your-development-workflow#using-ai-models-with-github-actions

これを使って `terraform plan` の実行結果を要約できたら便利そうだなと思ったのでやってみました。

# terraform plan の実行結果を要約してもらう GitHub Actions ワークフロー

GitHub Actions で GitHub Models を使用するためのアクションが公式から提供されているので、こちらを使います。

https://github.com/actions/ai-inference

以下は Pull Request に対して `terraform plan` を実行し、その実行結果を AI で要約してコメントするワークフローの例です。

```yaml:.github/workflows/terraform-plan.yml
name: terraform plan

on:
  pull_request:

jobs:
  plan:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      models: read # GitHub Models を呼び出すために必要
      pull-requests: write # Pull Request にコメントするために必要
    steps:
      # セットアップ
      - uses: actions/checkout@v4
        with:
          persist-credentials: false
      - uses: hashicorp/setup-terraform@v3

      # `terraform init` ~ `terraform plan` を実行
      - run: terraform init
      - name: terraform plan
        id: plan
        run: |
          terraform plan | tee plan.txt

          # 実行結果を output に設定
          EOF=$(uuidgen)
          {
            echo "result<<$EOF"
            # ANSI エスケープシーケンスは削除しておく
            sed 's/\x1b\[[0-9;]*[m]//g' plan.txt
            echo "$EOF"
          } >> "$GITHUB_OUTPUT"

      # `terraform plan` の実行結果を要約する
      - uses: actions/ai-inference@v1
        id: summary
        with:
          model: openai/gpt-4o # 使用するモデル
          max-tokens: 2000 # 生成するトークン数の上限
          prompt: ${{ steps.plan.outputs.result }}
          system-prompt: |
            あなたは `terraform plan` の実行結果を要約するAIアシスタントです。
            ユーザーから渡された `terraform plan` の実行結果をわかりやすく日本語で要約し、以下のフォーマットに従って Markdown 形式で出力してください。

            # Summary

            <terraform plan の実行結果について簡潔にまとめてください。>

            ## Create

            <作成されるリソースについてまとめてください。>

            ## Update

            <更新されるリソースについてまとめてください。>

            ## Delete

            <削除されるリソースについてまとめてください。>

      # 要約を Pull Request にコメントする
      - uses: peter-evans/find-comment@v3
        id: find-comment
        with:
          issue-number: ${{ github.event.pull_request.number }}
          comment-author: 'github-actions[bot]'
          body-includes: '<!-- TERRAFORM_PLAN_SUMMARY -->'
      - uses: peter-evans/create-or-update-comment@v4
        with:
          comment-id: ${{ steps.find-comment.outputs.comment-id }}
          edit-mode: replace
          issue-number: ${{ github.event.pull_request.number }}
          body: |
            <!-- TERRAFORM_PLAN_SUMMARY -->
            ${{ steps.summary.outputs.response }}
```

順を追って解説します。

## 1. セットアップ

```yaml
TODO: write
```

checkout して Terraform をインストールしているだけです。
ここでは特に細かい解説はしません。

## 2. `terraform init` ~ `terraform plan` を実行

```yaml
TODO: write
```

まずは `terraform init` と `terraform plan` を実行します。
`tee` を使うことで、 `terraform plan` の実行結果を標準出力に出力しつつ `plan.txt` として保存します。

```sh
terraform plan | tee plan.txt
```

実行結果を step の output として設定します。

```sh
# 実行結果を output に設定
EOF=$(uuidgen)
{
  echo "result<<$EOF"
  # ANSI エスケープシーケンスは削除しておく
  sed 's/\x1b\[[0-9;]*[m]//g' plan.txt
  echo "$EOF"
} >> "$GITHUB_OUTPUT"
```

`terraform plan` の実行結果には ANSI エスケープシーケンスが含まれているため、 `sed` を使って削除しています。
最初から `terraform plan` 実行時に `-no-color` フラグをつけてもいいのですが、それだと標準出力にも色がつかなくなってしまうのでこのようにしています。

:::message

`GITHUB_OUTPUT` への出力には複数行の文字列を扱うための構文を使用しています。
詳しくは以下のドキュメントをご参照ください。

- [Multiline strings - GitHub Docs](https://docs.github.com/en/actions/writing-workflows/choosing-what-your-workflow-does/workflow-commands-for-github-actions#multiline-strings)

:::

## 3. `terraform plan` の実行結果を要約する

```yaml
TODO: write
```

[`actions/ai-inference`](https://github.com/actions/ai-inference) アクションを使用して GitHub Models を利用し、 `terraform plan` の実行結果を要約します。

`system-prompt` には `terraform plan` の実行結果を要約するための指示を書き、 `prompt` には `terraform plan` の実行結果を丸々渡します。
`model` や `max-tokens` などは適宜調整してください。

## 4. 要約を Pull Request にコメントする

```yaml
TODO: write
```

[`peter-evans/create-or-update-comment`](https://github.com/peter-evans/create-or-update-comment) アクションを使用して `terraform plan` の実行結果を要約したコメントを Pull Request に追加します。
[`peter-evans/find-comment`](https://github.com/peter-evans/find-comment) アクションと組み合わせることで、ワークフローが複数回実行された場合でも複数のコメントが追加されることはなく、単一のコメントが更新されるようになります。

# まとめ

便利ですね。

# Appendix

## API のレート制限について

[`actions/ai-inference`](https://github.com/actions/ai-inference) アクションは内部的に GitHub Models の REST API を叩いています。
基本的にこの API は無料ですが契約している Copilot のプランによってレート制限が異なります。
詳しくは以下の公式ドキュメントをご参照ください。

https://docs.github.com/en/github-models/prototyping-with-ai-models#rate-limits

## Terraform Plan Analyzer

TODO: write

https://x.com/HashiCorp/status/1836798948008190088
https://github.com/aws-ia/terraform-aws-runtask-tf-plan-analyzer


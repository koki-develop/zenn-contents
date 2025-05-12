---
title: "GitHub Actions で GitHub Models を使って terraform plan の実行結果を要約してもらう"
emoji: "🤖"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["ai", "terraform", "githubactions"]
publication_name: "terraform_jp"
published: true
published_at: 2025-05-12 18:00
---

GitHub Actions の `GITHUB_TOKEN` を使って GitHub Models を利用できるようになりました。

https://github.blog/changelog/2025-04-14-github-actions-token-integration-now-generally-available-in-github-models/
https://docs.github.com/en/github-models/integrating-ai-models-into-your-development-workflow#using-ai-models-with-github-actions

これを使って `terraform plan` の実行結果を要約できたら便利そうだなと思ったのでやってみました。

![](/images/terraform-plan-summarize/plan-summary.png)
_こういうの_

https://github.com/koki-develop/terraform-plan-summarize/pull/1#issuecomment-2871373842

# terraform plan の実行結果を要約してもらう GitHub Actions ワークフロー

GitHub Actions で GitHub Models を使用するためのアクションが公式から提供されているので、今回はこちらを使います。

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
      models: read # GitHub Models を利用するために必要
      pull-requests: write # Pull Request にコメントするために必要
    steps:
      # 1. セットアップ
      - uses: actions/checkout@v4
        with:
          persist-credentials: false
      - uses: hashicorp/setup-terraform@v3

      # 2. `terraform init` ~ `terraform plan` を実行
      - name: terraform plan
        id: plan
        run: |
          terraform init
          terraform plan | tee plan.txt

          # 実行結果を output に設定
          EOF=$(uuidgen)
          {
            echo "result<<$EOF"
            # ANSI エスケープシーケンスは削除しておく
            sed 's/\x1b\[[0-9;]*[m]//g' plan.txt
            echo "$EOF"
          } >> "$GITHUB_OUTPUT"

      # 3. `terraform plan` の実行結果を要約する
      - uses: actions/ai-inference@v1
        id: summary
        with:
          model: openai/gpt-4o # 使用するモデル
          max-tokens: 4000 # 生成するトークン数の上限
          prompt: ${{ steps.plan.outputs.result }}
          system-prompt: |
            あなたは `terraform plan` の実行結果を要約する AI アシスタントです。
            ユーザーから渡された `terraform plan` の実行結果をわかりやすく日本語で要約し、以下のフォーマットに従って Markdown 形式で出力してください。

            # Summary

            <terraform plan の実行結果について簡潔にまとめてください。>

            ## Create

            <作成されるリソースについてまとめてください。>

            ## Update

            <更新されるリソースについてまとめてください。>

            ## Delete

            <削除されるリソースについてまとめてください。>

      # 4. 要約を Pull Request にコメントする
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

順を追って解説していきます。

## `permissions` について

```yaml
jobs:
  plan:
    # ...
    permissions:
      contents: read
      models: read # GitHub Models を利用するために必要
      pull-requests: write # Pull Request にコメントするために必要
```

GitHub Actions で GitHub Models を利用するには `models: read` の権限が必要なので、忘れないように注意してください。

https://docs.github.com/en/github-models/integrating-ai-models-into-your-development-workflow#setting-permissions

また、今回は Pull Request にコメントを作成するために `pull-requests: write` もつけています。

## 1. セットアップ

```yaml
- uses: actions/checkout@v4
  with:
    persist-credentials: false
- uses: hashicorp/setup-terraform@v3
```

checkout して Terraform をインストールしているだけです。
特に細かい解説はしません。

## 2. `terraform init` ~ `terraform plan` を実行

```yaml
- name: terraform plan
  id: plan
  run: |
    terraform init
    terraform plan | tee plan.txt

    # 実行結果を output に設定
    EOF=$(uuidgen)
    {
      echo "result<<$EOF"
      # ANSI エスケープシーケンスは削除しておく
      sed 's/\x1b\[[0-9;]*[m]//g' plan.txt
      echo "$EOF"
    } >> "$GITHUB_OUTPUT"
```

まずは `terraform init` と `terraform plan` を実行します。
`tee` を使うことで、 `terraform plan` の実行結果を標準出力に出力しつつ `plan.txt` として保存します。

```sh
terraform init
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

```
{name}<<{delimiter}
{value}
{delimiter}
```

詳しくは以下のドキュメントをご参照ください。

- [Multiline strings - GitHub Docs](https://docs.github.com/en/actions/writing-workflows/choosing-what-your-workflow-does/workflow-commands-for-github-actions#multiline-strings)

:::

## 3. `terraform plan` の実行結果を要約する

```yaml
- uses: actions/ai-inference@v1
  id: summary
  with:
    model: openai/gpt-4o # 使用するモデル
    max-tokens: 4000 # 生成するトークン数の上限
    prompt: ${{ steps.plan.outputs.result }}
    system-prompt: |
      あなたは `terraform plan` の実行結果を要約する AI アシスタントです。
      ユーザーから渡された `terraform plan` の実行結果をわかりやすく日本語で要約し、以下のフォーマットに従って Markdown 形式で出力してください。

      # Summary

      <terraform plan の実行結果について簡潔にまとめてください。>

      ## Create

      <作成されるリソースについてまとめてください。>

      ## Update

      <更新されるリソースについてまとめてください。>

      ## Delete

      <削除されるリソースについてまとめてください。>
```

[`actions/ai-inference`](https://github.com/actions/ai-inference) アクションを使用して GitHub Models を利用し、 `terraform plan` の実行結果を要約します。

`system-prompt` には `terraform plan` の実行結果を要約するための指示を書き、 `prompt` には `terraform plan` の実行結果をそのまま渡します。
`model` や `max-tokens` などは適宜調整してください。

:::message

今回は `terraform plan` の出力を渡しているだけですが、より詳細な情報が含まれる plan file を渡してもいいかもしれません。

```sh
terraform plan -out=tfplan
terraform show -json tfplan > tfplan.json
# tfplan.json の中身を AI に渡す
```

ただし plan file には sensitive な情報が含まれていることもあるため、扱いには注意してください。

:::

## 4. 要約を Pull Request にコメントする

```yaml
- uses: peter-evans/find-comment@v3
  id: find-comment
  with:
    issue-number: ${{ github.event.pull_request.number }}
    comment-author: 'github-actions[bot]'
    body-includes: '<!-- TERRAFORM_PLAN_SUMMARY -->'
- uses: peter-evans/create-or-update-comment@v4
  with:
    comment-id: ${{ steps.find-comment.outputs.comment-id }}
    issue-number: ${{ github.event.pull_request.number }}
    edit-mode: replace
    body: |
      <!-- TERRAFORM_PLAN_SUMMARY -->
      ${{ steps.summary.outputs.response }}
```

要約した内容は [`actions/ai-inference`](https://github.com/actions/ai-inference) アクションの `outputs.response` から取得できます。

https://github.com/actions/ai-inference/blob/f8ee4c952b7dca7b8a4529edd04dc5cc3d49c435/action.yml#L42-L44

これを [`peter-evans/create-or-update-comment`](https://github.com/peter-evans/create-or-update-comment) アクションを使用して Pull Request にコメントします。
[`peter-evans/find-comment`](https://github.com/peter-evans/find-comment) アクションと組み合わせることで、ワークフローが複数回実行された場合でも複数のコメントが追加されることはなく、単一のコメントが更新されるようになります。

![](/images/terraform-plan-summarize/plan-summary.png)
_実際に作成されたコメント_

https://github.com/koki-develop/terraform-plan-summarize/pull/1#issuecomment-2871373842

# まとめ

無料でサクッと使えて便利ですね。
[tfcmt](https://github.com/suzuki-shunsuke/tfcmt) も合わせて使うとより捗りそうです。

https://zenn.dev/kou_pg_0131/articles/tfcmt-on-gh-actions

# Appendix

## API のレート制限について

[`actions/ai-inference`](https://github.com/actions/ai-inference) アクションは内部的に GitHub Models の REST API を叩いています。
今のところこの API は無料ですがレート制限 ( モデルによって異なる ) があるため注意してください。
詳しくは以下の公式ドキュメントをご参照ください。

https://docs.github.com/en/github-models/prototyping-with-ai-models#rate-limits

## Terraform Plan Analyzer

同じような用途のものとして、公式から Terraform Plan Analyzer という Terraform Module が公開されています。
HCP Terraform (旧 Terraform Cloud) を利用している場合はこちらを試してみてもいいかもしれません。

https://x.com/HashiCorp/status/1836798948008190088
https://github.com/aws-ia/terraform-aws-runtask-tf-plan-analyzer

Terraform Plan Analyzer については以下の記事がわかりやすいので、こちらをご参照ください。

https://dev.classmethod.jp/articles/summary-terraform-plan-using-tf-plan-analyzer/

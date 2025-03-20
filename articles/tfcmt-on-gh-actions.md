---
title: "GitHub Actions で tfcmt を使って terraform plan の結果をコメントに貼り付ける"
emoji: "💬"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["terraform", "tfcmt", "githubactions", "ci"]
published: true
published_at: 2022-09-10 20:00
---

tfcmt を業務で使ってみたらめちゃくちゃ良かったので、 GitHub Actions で動かす例を備忘録として残しておきます。

# 検証環境

- tfcmt v3.4.1
- terraform v1.2.9

# tfcmt とは？

https://github.com/suzuki-shunsuke/tfcmt

tfcmt は `terraform plan` や `terraform apply` の結果を GitHub にコメントとして通知する CLI ツールです。
CI のログを見にいかなくとも GitHub のコメント上で結果を確認することができます。
且つ、見やすい形式でコメントしてくれるので素のログよりも結果が分かりやすいです。

詳しくは開発者の方が書いている紹介記事や公式ドキュメントをご参照ください。

https://zenn.dev/shunsuke_suzuki/articles/improve-terraform-cicd-with-tfcmt
https://suzuki-shunsuke.github.io/tfcmt/

# GitHub Actions で tfcmt を実行するサンプルコード

https://github.com/koki-develop/tfcmt-on-gh-actions-example

こんな感じ。
push 時に関連する PR が存在する場合は PR にコメントが作成され、 PR が存在しない場合は Commit に対してコメントが作成されます。
また、 PR がマージされたときにも Merge Commit に対してではなく Merge された PR に対してコメントが作成されます。

```yaml:.github/workflows/main.yml
name: terraform plan

on:
  push:
  pull_request:

jobs:
  terraform_plan:
    runs-on: ubuntu-latest
    steps:
      - name: checkout
        uses: actions/checkout@v3

      - name: setup terraform
        uses: hashicorp/setup-terraform@v2
        with:
          terraform_version: 1.2.9

      - name: setup tfcmt
        env:
          TFCMT_VERSION: v3.4.1
        run: |
          wget "https://github.com/suzuki-shunsuke/tfcmt/releases/download/${TFCMT_VERSION}/tfcmt_linux_amd64.tar.gz" -O /tmp/tfcmt.tar.gz
          tar xzf /tmp/tfcmt.tar.gz -C /tmp
          mv /tmp/tfcmt /usr/local/bin
          tfcmt --version

      - run: terraform init
      - name: terraform plan
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: tfcmt plan -patch -- terraform plan -no-color -input=false
```

- tfcmt に使用される `GITHUB_TOKEN` 環境変数には自動的に作成される `GITHUB_TOKEN` シークレットを使えるため、自分でアクセストークンを発行する必要はありません。
  - `GITHUB_TOKEN` シークレットについての詳細は[こちら](https://docs.github.com/ja/actions/security-guides/automatic-token-authentication#about-the-github_token-secret)をご参照ください。
- tfcmt 実行時に `-patch` オプションを設定して、既存のコメントがある場合は更新するようにしています。
  - `-path` オプションについての詳細は[こちら](https://zenn.dev/shunsuke_suzuki/articles/tfcmt-plan-patch)をご参照ください。

実際に作成されるコメントはこんな感じです。

![](/images/tfcmt-on-gh-actions/pull-request-comment.png)
_[PR に作成されたコメント](https://github.com/koki-develop/tfcmt-on-gh-actions-example/pull/1#issuecomment-1242575823)_

# その他

tfcmt では設定ファイルを作成することでより細かい設定を行うことも可能です。
詳しくは下記ドキュメントをご参照ください。

https://suzuki-shunsuke.github.io/tfcmt/config

また、 GitHub Actions で tfcmt を含めた様々なツールを利用したいい感じの Terraform Workflow を構築するための [tfaction](https://github.com/suzuki-shunsuke/tfaction) というアクションも公開されています。
詳しくは下記ドキュメントをご参照ください。

https://zenn.dev/shunsuke_suzuki/articles/tfaction-introduction
https://suzuki-shunsuke.github.io/tfaction/docs/

# まとめ

めちゃくちゃ良いです。

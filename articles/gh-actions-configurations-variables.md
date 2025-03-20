---
title: "GitHub Actions で機密性の無い変数を設定できるようになったので試してみる"
emoji: "🚀"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["github", "githubactions", "cicd"]
published: true
---

GitHub Actions で変数を設定できるようになりました 🎉🎉🎉🎉

https://github.blog/changelog/2023-01-10-github-actions-support-for-configuration-variables-in-workflows/

これまではワークフローで再利用可能な値を使用するためには Secret として保存する必要がありました。
しかし Secret は一度設定すると値を確認することができないため、機密性の無いデータでもどんな値が設定されているかを確認することができないのが不便でした。
今回の更新で、機密性の無いデータは変数として設定することでどんな値が設定されているかを確認することができるようになりました。

個人的に結構嬉しい変更だったのでさっそく実際に試してみたメモです。

:::message
2023 年 1 月 11 日現在この機能はベータ版であり、今後変更される可能性があります。
:::

# 設定手順

変数は次の 3 つのレベルで設定することができます。

- [リポジトリ](#リポジトリレベルの変数を設定する)
- [環境](#環境レベルの変数を設定する手順)
- [組織](#組織レベルの変数を設定する手順)

それぞれのレベルの設定手順について記述します。

## リポジトリレベルの変数を設定する

:::details 設定手順

`Settings` をクリックしてリポジトリの設定画面に遷移します。

![](/images/gh-actions-configurations-variables/to-settings.png)

左のメニューから `Secrets and variables` → `Actions` の順番にクリックしてシークレット・変数の設定画面に遷移します。

![](/images/gh-actions-configurations-variables/to-actions.png)

`Variables` タブを選択し、 `New repository variable` をクリックします。

![](/images/gh-actions-configurations-variables/to-new-variable.png)

`Name` に変数名を入力して `Value` に変数の値を入力します。
それぞれ入力したら `Add variable` をクリックします。

![](/images/gh-actions-configurations-variables/add-variable.png)

これで変数が追加されました。
設定した値が表示されていることが確認できます。

![](/images/gh-actions-configurations-variables/added-variable.png)

:::

## 環境レベルの変数を設定する手順

:::details 設定手順

`Settings` をクリックしてリポジトリの設定画面に遷移します。

![](/images/gh-actions-configurations-variables/to-settings.png)

左のメニューから `Environments` をクリックして環境の一覧画面に遷移します。

![](/images/gh-actions-configurations-variables/to-environments.png)

任意の環境をクリックして環境の設定画面に遷移します。
環境が作成されていない場合は `New environment` をクリックして作成することができます。

![](/images/gh-actions-configurations-variables/to-environment.png)

`Environment variables` セクションの `Add variable` をクリックすると変数を追加するダイアログが表示されます。

![](/images/gh-actions-configurations-variables/to-new-environment-variable.png)

`Name` に変数名を入力して `Value` に変数の値を入力します。
それぞれ入力したら `Add variable` をクリックします。

![](/images/gh-actions-configurations-variables/add-environment-variable.png)

これで変数が追加されました。
設定した値が表示されていることが確認できます。

![](/images/gh-actions-configurations-variables/added-environment-variable.png)

:::

## 組織レベルの変数を設定する手順

:::details 設定手順

組織の画面で `Settings` をクリックして組織の設定画面に遷移します。

![](/images/gh-actions-configurations-variables/to-org-settings.png)

左のメニューから `Secrets and variables` → `Actions` の順番にクリックしてシークレット・変数の設定画面に遷移します。

![](/images/gh-actions-configurations-variables/to-org-actions.png)

`Variables` タブを選択し、 `New organization variable` をクリックします。

![](/images/gh-actions-configurations-variables/to-new-org-variable.png)

`Name` に変数名を入力して `Value` に変数の値を入力します。
`Repository access` ではこの変数を参照できるリポジトリを制限することができます。
次の 3 つから選択できます。

- `Public repositories` : Public リポジトリから参照できる。有料プランの場合は Private リポジトリも含まれる。
- `Private repositories` : Private リポジトリから参照できる。 ( 有料プランに入る必要がある )
- `Selected repositories` : 任意の選択したリポジトリから使用できる。

それぞれ入力したら `Add variable` をクリックします。

![](/images/gh-actions-configurations-variables/add-org-variable.png)

これで変数が追加されました。
設定した値が表示されていることが確認できます。

![](/images/gh-actions-configurations-variables/added-org-variable.png)

:::

# 複数のレベルで同じ名前の変数が設定されている場合の優先度

https://docs.github.com/en/actions/learn-github-actions/variables#configuration-variable-precedence

複数のレベルで同じ名前の変数が設定されている場合は、最も低いレベルにある変数が優先されます。

例えば、組織・リポジトリで同じ名前の変数が設定されている場合はリポジトリレベルの変数が優先されます。
同様に、組織・リポジトリ・環境で同じ名前の変数が設定されている場合は環境レベルの変数が優先されます。

# ワークフローから参照する

ワークフローからは変数を `${{ vars.VARIABLE_NAME }}` のようにして参照することができます。
次の YAML は組織・リポジトリ・環境のそれぞれのレベルで設定した変数を参照するワークフローのサンプルコードです。

```yaml:.github/workflows/main.yml
on:
  push:

jobs:
  repo:
    runs-on: ubuntu-latest
    steps:
      # リポジトリレベルの変数を参照
      - run: echo ${{ vars.EXAMPLE_VARIABLE }}

  env:
    runs-on: ubuntu-latest
    environment: dev
    steps:
      # 環境レベルの変数を参照
      - run: echo ${{ vars.EXAMPLE_ENVIRONMENT_VARIABLE }}

  org:
    runs-on: ubuntu-latest
    steps:
      # 組織レベルの変数を参照
      - run: echo ${{ vars.EXAMPLE_ORGANIZATION_VARIABLE }}
```

以下が実行結果です。
Secret とは違い、変数の値がログに平文で出力されていることが確認できます。

https://github.com/koki-develop-org/gh-actions-configurations-variables-example/actions/runs/3888919871

![](/images/gh-actions-configurations-variables/repo-result.png)
![](/images/gh-actions-configurations-variables/env-result.png)
![](/images/gh-actions-configurations-variables/org-result.png)

# 参考

https://docs.github.com/en/actions/learn-github-actions/variables

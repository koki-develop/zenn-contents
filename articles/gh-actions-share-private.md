---
title: "GitHub Actions でプライベートリポジトリの Action を共有できるようになったので試してみる"
emoji: "🚀"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["github", "githubactions"]
published: true
---

先日 GitHub Actions で同一ユーザーもしくは組織内でプライベートリポジトリの Action が共有できるようになりました。

https://github.blog/changelog/2022-12-14-github-actions-sharing-actions-and-reusable-workflows-from-private-repositories-is-now-ga/

実際の挙動や必要な設定が気になったので試してみたメモです。

# 要約

- プライベートリポジトリの Action・Reusable Workflow・Composite Action を**同一オーナー**の**プライベート**リポジトリから使えるようになった
  - 設定の有効化は必要
- **パブリックリポジトリからは使えない**

# 準備

## プライベートリポジトリを作成する

今回は `private-github-actions-example` という名前でプライベートなリポジトリを作成しました。
全く同じ内容のリポジトリを [`private-github-actions-example-mirror`](https://github.com/koki-develop/private-github-actions-example-mirror) という名前で公開しています。

https://github.com/koki-develop/private-github-actions-example-mirror

## Action・Reusable Workflow・Composite Action を作成する

共有する Action・Reusable Workflow・Composite Action をプライベートリポジトリ内に作成します。
ここは今回の記事では重要な内容ではないので、興味のある人だけご覧ください。

:::details Action

```dockerfile:Dockerfile
FROM alpine:3.17

COPY entrypoint.sh /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
```

```sh:entrypoint.sh
#!/bin/sh -l

echo "Hello $1"
```

```yaml:action.yml
name: 'Hello World'
description: 'Greet someone and record the time'
inputs:
  who-to-greet:
    description: 'Who to greet'
    required: true
    default: 'World'
runs:
  using: 'docker'
  image: 'Dockerfile'
  args:
    - ${{ inputs.who-to-greet }}
```

:::

:::details Reusable Workflow

```yaml:.github/workflows/_reusable.yml
on:
  workflow_call:

jobs:
  hello:
    runs-on: ubuntu-latest
    steps:
      - run: echo hello
```

:::

:::details Composite Action

```yaml:.github/actions/hello/action.yml
runs:
  using: composite
  steps:
    - run: echo hello
      shell: bash
```

:::

## プライベートリポジトリのアクセスの設定を更新する

デフォルトではプライベートリポジトリの Action は同一オーナーであっても他のリポジトリから使えないようになっています。
そのため、まずプライベートリポジトリの設定を更新する必要があります。

プライベートリポジトリの `Settings` をクリックしてリポジトリの設定画面に遷移します。

![](/images/gh-actions-share-private/to-settings.png)

左のメニューリストから `Actions` → `General` の順にクリックして Actions の設定画面に遷移します。

![](/images/gh-actions-share-private/to-actions-general.png)

一番下に `Access` というセクションがあります。
`Accessible from repositories owned by the user '<ユーザー名>'` を選択し、 `Save` をクリックして設定を保存します。
ちなみに Organization の場合はここの文言は `Accessible from repositories in the '<Organization名>' organization` になります。

![](/images/gh-actions-share-private/update-setting.png)

これで設定完了です。

# 実際に他のリポジトリから使ってみる


## プライベートリポジトリから使ってみる

`use-private-github-actions-from-private-example` というプライベートリポジトリを作成して、 [`private-github-actions-example`](https://github.com/koki-develop/private-github-actions-example-mirror) の Action・Reusable Workflow・Composite Action を参照するワークフローを作成しました。

```yaml:.github/workflows/main.yml
on: [push]

jobs:
  action:
    runs-on: ubuntu-latest
    steps:
      # Action
      - uses: koki-develop/private-github-actions-example@main
        with:
          who-to-greet: koki

  reusable:
    # Reusable Workflow
    uses: koki-develop/private-github-actions-example/.github/workflows/_reusable.yml@main

  composite:
    runs-on: ubuntu-latest
    steps:
      # Composite Action
      - uses: koki-develop/private-github-actions-example/.github/actions/hello@main
```

全て動きました。
いい感じです。

![](/images/gh-actions-share-private/from-private.png)

## パブリックリポジトリから使ってみる

[`use-private-github-actions-from-public-example`](https://github.com/koki-develop/use-private-github-actions-from-public-example) というパブリックリポジトリを作成して、「[プライベートリポジトリから使ってみる](#プライベートリポジトリから使ってみる)」で使用したのと全く同じワークフローを作成しました。

https://github.com/koki-develop/use-private-github-actions-from-public-example

しかし実際に動かしてみたところ、次のようなエラーメッセージが表示されて失敗しました。
Reusable Workflow が見つからないと言われています。

```
Invalid workflow file: .github/workflows/main.yml#L12
error parsing called workflow "koki-develop/private-github-actions-example/.github/workflows/_reusable.yml@main": workflow was not found. See https://docs.github.com/actions/learn-github-actions/reusing-workflows#access-to-reusable-workflows for more information.
```

https://github.com/koki-develop/use-private-github-actions-from-public-example/actions/runs/3769378835

続いて Reusable Workflow を使用している部分をコメントアウトして動かしてみても、 Action・Composite Action を参照しているところで次のようなエラーメッセージが表示されて失敗しました。
こちらも Action が見つからないと言われています。

```
An action could not be found at the URI 'https://api.github.com/repos/koki-develop/private-github-actions-example/tarball/72918f0ea324d589a244958e30fe433f79d00917'
```

https://github.com/koki-develop/use-private-github-actions-from-public-example/actions/runs/3769390439

どうやらパブリックリポジトリからは使用できないようです。
そりゃそうかという感じですね。

# まとめ

社内用の共通 Action を作りたい時など、用途は色々ありそうですね。

# 参考

https://github.blog/changelog/2022-12-14-github-actions-sharing-actions-and-reusable-workflows-from-private-repositories-is-now-ga/
https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/enabling-features-for-your-repository/managing-github-actions-settings-for-a-repository#managing-access-for-a-private-repository

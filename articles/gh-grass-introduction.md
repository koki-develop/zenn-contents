---
title: "コンソールに GitHub の草を生やす GitHub CLI 拡張機能「gh-grass」の紹介"
emoji: "🍀"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["github", "githubcli", "cli", "terminal"]
published: true
---

GitHub の草 ( Contribution Graph ) をどうしてもコンソールに生やしたくなることはありませんか？ありますよね？僕はありません。
そんなときに便利な GitHub CLI 拡張機能「gh-grass」を作りました。

https://github.com/koki-develop/gh-grass

こういうことができます。

![](/images/gh-grass-introduction/demo.gif)

他にもこんなことや、

![](/images/gh-grass-introduction/grass.gif)
_文字をカスタマイズ_

こんなこともできます。

![](/images/gh-grass-introduction/animate.gif)
_アニメーション_

この記事では gh-grass のインストール方法から基本的な使い方についてまとめます。

# インストール

:::message

GitHub CLI がインストールされている必要があります。
GitHub CLI のインストール方法については [GitHub CLI 公式リポジトリの README](https://github.com/cli/cli#installation) をご参照ください。

:::

gh-grass は GitHub CLI の拡張機能なので `gh extension install` でインストールすることができます。

```
$ gh extension install koki-develop/gh-grass
```

インストールが完了すると `gh grass` のようにして使えるようになります。

```sh
$ gh grass --help
Grow github grass to console.

Usage:
  gh grass [flags]

Flags:
  -u, --user string    github username
      --from string    only contributions made at this time or later will be counted
      --to string      only contributions made before and up to (including) this time will be counted
  -t, --theme string   grass theme (dark|light) (default "dark")
  -g, --grass string   grass string (default "■")
  -a, --animate        animate grass
      --total          print total contributions
  -h, --help           help for gh
```

# 使い方

## 基本的な使い方

何も指定せずに実行すると自分の直近 1 年間の草を出力します。

```sh
$ gh grass
```

![](/images/gh-grass-introduction/demo.gif)

## ユーザーを指定する

`-u` もしくは `--user` フラグで特定のユーザーを指定することもできます。

```sh
$ gh grass --user <GitHubユーザー名>

# 例
$ gh grass --user koki-develop
```

![](/images/gh-grass-introduction/user.gif)

## 期間を指定する

gh-grass はデフォルトでは直近 1 年間の草を出力しますが、 `--from`, `--to` フラグで期間を指定することもできます。

```sh
$ gh grass --from "<yyyy-MM-dd>"
$ gh grass --to "<yyyy-MM-dd>"
$ gh grass --from "<yyyy-MM-dd>" --to "<yyyy-MM-dd>"

# 例
$ gh grass --from "2023-03-01" --to "2023-03-31"
```

![](/images/gh-grass-introduction/period.gif)

## 文字をカスタマイズする

`-g` もしくは `--grass` フラグに草の文字を指定することもできます。

```sh
$ gh grass --grass "<草の文字>"

# 例
$ gh grass --grass "草"
```

![](/images/gh-grass-introduction/grass.gif)

## アニメーションつきで表示する

`-a` もしくは `--animate` フラグを指定するとアニメーションつきで草を出力します。
ちょっとだけテンションが上がります。

```sh
$ gh grass --animate
```

![](/images/gh-grass-introduction/animate.gif)

# まとめ

とても便利ですね。

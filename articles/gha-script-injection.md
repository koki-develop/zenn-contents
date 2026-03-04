---
title: "【GitHub Actions】スクリプトインジェクションの実践例"
emoji: "💉"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["github", "githubactions", "security"]
published: true
---

:::message alert

**以下の GitHub Actions ワークフローの問題点がわからない人は、お願いなので読み進めてください。**

:::

```yaml
on:
  pull_request:

jobs:
  example:
    runs-on: ubuntu-latest
    steps:
      - run: echo "PR title is ${{ github.event.pull_request.title }}"
      - run: echo "PR Head Ref is ${{ github.head_ref }}"
```

## 要約

- **`run` の中で直接 `${{}}` を使わないでください**
- **必要な値は環境変数を経由して渡してください**

## Pull Request のタイトルでテンプレートインジェクションしてみる

おや、こんなところに Pull Request のタイトルを出力するシンプルで完璧な GitHub Actions ワークフロー定義 YAML が落ちています。

```yml
on:
  pull_request:

jobs:
  example:
    runs-on: ubuntu-latest
    steps:
      - run: echo "PR title is ${{ github.event.pull_request.title }}"
```

**脆弱ですねェ〜〜〜〜〜〜〜〜！！**

それではさっそく、「**`"; echo INJECTED"`**」というよくある名前で Pull Request を作成してみましょう。

![Pull Request](/images/gha-script-injection/title-pr.png)

https://github.com/koki-develop/gha-script-injection-example/pull/1

GitHub Actions の実行ログを確認してみましょう。

![実行ログ](/images/gha-script-injection/title.png)
_GitHub Actions の実行ログ_

**`INJECTED` という文字列が出力されているのがわかりますね！！**
**任意コードとして `echo INJECTED` を実行することに成功しました！！🎉🎉**

### なぜなのか

今回の `run` のスクリプト↓は、

```yaml
- run: echo "PR title is ${{ github.event.pull_request.title }}"
```

GitHub Actions ワークフローで実行される時に、以下のように展開されます。

```yaml
- run: echo "PR title is "; echo INJECTED""
```

このスクリプトは以下のように解釈されます。

1. `echo "PR title is "` を実行
2. **`echo INJECTED` を実行**
3. `""` は何も出力しない

典型的な古き良き単純なインジェクション、という感じですね。とても美しいです。

## Pull Request のブランチ名でテンプレートインジェクションしてみる

おや、こちらには Pull Request のブランチ名を出力するシンプルで完璧な GitHub Actions ワークフロー定義 YAML が落ちています。

```yml
on:
  pull_request:

jobs:
  example:
    runs-on: ubuntu-latest
    steps:
      - run: echo "PR Head Ref is ${{ github.head_ref }}"
```

タイトルと違ってブランチ名であればインジェクションされないとでも思ったのでしょうか？

**脆弱ですねェ〜〜〜〜〜〜〜〜！！**

それではさっそく、「**`main";echo${IFS}INJECTED"`**」というよくある名前のブランチ名で Pull Request を作成してみましょう。

![Pull Request](/images/gha-script-injection/branch-pr.png)

https://github.com/koki-develop/gha-script-injection-example/pull/2

GitHub Actions の実行ログを確認してみましょう。

![実行ログ](/images/gha-script-injection/branch.png)
_GitHub Actions の実行ログ_

**`INJECTED` という文字列が出力されているのがわかりますね！！**
**こちらでも任意コード実行に成功しました！！🎉🎉**

### なぜなのか

仕組みとしてはタイトルのときと全く同じです。

今回の `run` のスクリプトは、

```yaml
- run: echo "PR Head Ref is ${{ github.head_ref }}"
```

GitHub Actions ワークフローで実行される時に、以下のように展開されます。

```yaml
- run: echo "PR Head Ref is main";echo${IFS}INJECTED""
```

このスクリプトは以下のように解釈されます。

1. `echo "PR Head Ref is main"` を実行
2. **`echo${IFS}INJECTED`** (= `echo INJECTED`) **を実行**
3. `""` は何も出力しない

ブランチ名にはスペースを入れることができないので、ここでは代わりに `${IFS}` を使っています。

:::message

`${IFS}` は単語分割文字 (Internal Field Separator) を表す特殊な変数です。
詳しい解説は割愛します。

:::

こちらも単純ですね。芸術点が高いです。

## どうすればいいの？

**`run` の中で `${{}}` を直接使わないでください。** いやほんとに。

`${{}}` の値を `run` の中で扱いたい場合、**必ず環境変数を経由して参照し、クォーテーションで囲むようにしましょう**。
値をシェルの環境変数として扱うことで、スクリプトインジェクションを防止することができます。

たとえば、先ほど紹介した PR タイトルを出力するワークフローの場合、以下のように書き換えることで安全になります。

```diff yaml
 on:
   pull_request:

 jobs:
   example:
     runs-on: ubuntu-latest
     steps:
-      - run: echo "PR title is ${{ github.event.pull_request.title }}"
+      - run: echo "PR title is ${PR_TITLE}"
+        env:
+          PR_TITLE: ${{ github.event.pull_request.title }}
```

![実行ログ](/images/gha-script-injection/safe.png)
_GitHub Actions の実行ログ_

ちゃんと Pull Request のタイトルである `"; echo INJECTED"` がそのまま出力されており、任意コード (`echo INJECTED`) は実行されていないことがわかります。

:::message

なんでこれなら安全なのか、みたいな説明は~~マサカリが怖いので~~割愛します。
シェルに詳しい人に聞くか、なんとなく感じ取ってください。

:::

ちなみに GitHub Actions ではデフォルトで用意されている環境変数も多いです。

https://docs.github.com/ja/actions/reference/workflows-and-actions/variables

たとえば今回ブランチの例で紹介した `github.head_ref` も `GITHUB_HEAD_REF` という環境変数が用意されてるので、こちらをそのまま使うことができます。自分で環境変数を定義する必要もありません。

```diff yaml
 on:
   pull_request:

 jobs:
   example:
     runs-on: ubuntu-latest
     steps:
-      - run: echo "PR Head Ref is ${{ github.head_ref }}"
+      - run: echo "PR Head Ref is ${GITHUB_HEAD_REF}"
```

---

PR タイトルやブランチ名以外の、ユーザーが直接コントロールすることが難しい値 (たとえば `github.repository` とか) であれば `run` の中で `${{}}` を直接使っても実際にインジェクションされる可能性は低いですが、
とはいえ「これなら `${{}}` 直接使っても大丈夫 / 大丈夫じゃない」というのを**いちいち毎回正確に判断するのは非常に重労働**なので、「**とにかく `run` の中では `${{}}` を直接使わない**」「**必要な値は環境変数を経由して渡す**」というのを徹底した方がよっぽど楽ですし、安全です。

## たまにある勘違い

「**環境変数ってことは `${{ env.* }}` を使えばいいってコト？**」

```yaml
on:
  pull_request:

jobs:
  example:
    runs-on: ubuntu-latest
    steps:
      - run: echo "PR title is ${{ env.PR_TITLE }}"
        env:
          PR_TITLE: ${{ github.event.pull_request.title }}
```

**ダメです。全く同じ問題が発生します。**
結局 `${{ env.PR_TITLE }}` も実行時に展開されるので、インジェクションされます。

![実行ログ](/images/gha-script-injection/env.png)
_GitHub Actions の実行ログ_

先ほど紹介した例の `$HOGE` のように、**シェルの環境変数**を使ってください。

## 自動検出するために

actionlint や zizmor などのツールを使ってください。今回紹介した問題のあるワークフローは、全てこれらのツールで検出できます。

https://zenn.dev/kou_pg_0131/articles/gha-static-checker

```bash:actionlint の出力例
.github/workflows/title.yml:8:36: "github.event.pull_request.title" is potentially untrusted. avoid using it directly in inline scripts. instead, pass it through an environment variable. see https://docs.github.com/en/actions/reference/security/secure-use#good-practices-for-mitigating-script-injection-attacks for more details [expression]
  |
8 |       - run: echo "PR title is ${{ github.event.pull_request.title }}"
  |                                    ^~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
```

```bash:zizmor の出力例
error[template-injection]: code injection via template expansion
 --> ./.github/workflows/example.yml:8:36
  |
8 |       - run: echo "PR title is ${{ github.event.pull_request.title }}"
  |         --- this run block         ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ may expand into attacker-controllable code
  |
  = note: audit confidence → High
  = note: this finding has an auto-fix
```

## まとめ

スクリプトインジェクションが容易に実行可能になっているリポジトリ、本当に多いです。結構有名なリポジトリとかでも普通に見かけます。

今回は単純に Pull Request のタイトルやブランチを使った例だけ紹介しましたが、他にもスクリプトインジェクションに使える値はいくらでもあります。

本当に気をつけてほしいです。

スクリプトインジェクションについて知らなかった人は「GitHub CI/CD実践ガイド」の「第15章 GitHub Actions のセキュリティ」を穴が開くまで読んでください。

https://www.amazon.co.jp/dp/4297141736

## 参考

https://docs.github.com/ja/actions/concepts/security/script-injections
https://docs.github.com/ja/actions/reference/security/secure-use#good-practices-for-mitigating-script-injection-attacks
https://www.amazon.co.jp/dp/4297141736

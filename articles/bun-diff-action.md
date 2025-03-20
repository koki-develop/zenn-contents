---
title: "bun.lockb の変更差分を Pull Request 上で表示する「Bun Diff Action」の紹介"
emoji: "🥟"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["github", "githubactions", "bun"]
published: true
published_at: 2024-08-19 18:00
---

`bun.lockb` の変更差分を Pull Request 上で表示することができる [Bun Diff Action](https://github.com/koki-develop/bun-diff-action) を作りました。

https://github.com/koki-develop/bun-diff-action

![](/images/bun-diff-action/screenshot.png)
_こういうの_

https://github.com/koki-develop/bun-diff-action-example/pull/2/files#diff-911db038a89e27a7702a07805a21da08e4b2b4f7772913eefceaf824c3c516b9

この記事では Bun Diff Action とその使い方についてご紹介します。

- [`bun.lockb` について](#bun.lockb-について)
- [Bun Diff Action について](#bun-diff-action-について)
- [Bun Diff Action の使い方](#bun-diff-action-の使い方)

# `bun.lockb` について

Bun は Oven 社が開発している JavaScript のオールインワンランタイムです。

https://bun.sh

Bun をパッケージマネージャとして使用する場合、 `bun install` コマンドを実行したときに `bun.lockb` というロックファイルが作成されます。
このロックファイルにはインストールされたパッケージのバージョンやその依存関係、その他様々なメタデータが含まれます。

https://bun.sh/docs/install/lockfile

そして、この `bun.lockb` は**バイナリ形式**のファイルです。そのため、もし変更があっても通常は GitHub の Pull Request 上で差分を確認することはできません。

![](/images/bun-diff-action/binary-file-not-shown.png)
_`Binary file not shown.` と表示される_

# Bun Diff Action について

https://github.com/koki-develop/bun-diff-action

Bun Diff Action は、 Pull Request で `bun.lockb` に変更がある場合、その内容をコメントします。
コメントは `bun.lockb` に対してファイルレベルで作成されるため、 `Files changed` タブで**他ファイルの差分と同一画面で確認することができます**。

![](/images/bun-diff-action/files-changed-tab.png)
_`Files changed` タブで差分が見れる_

もちろん、その後さらに同一 Pull Request で `bun.lockb` に対して変更があった場合も、それに応じてコメントの内容が更新されます。

実際の Pull Request の例はこちらから確認できます。

https://github.com/koki-develop/bun-diff-action-example/pull/2/files#diff-911db038a89e27a7702a07805a21da08e4b2b4f7772913eefceaf824c3c516b9

# Bun Diff Action の使い方

Bun Diff Action は GitHub Action なので、以下のようなワークフローファイルを作成するだけで使用できます。

```yaml:.github/workflows/example.yml
on:
  pull_request:

jobs:
  bun-diff:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: koki-develop/bun-diff-action@v1
```

:::message

もしリポジトリで `Settings` > `Actions` > `General` > `Workflow permissions` の設定が `Read and write permissions` になっていない場合、明示的に `permissions` を設定する必要があります。

```yaml:.github/workflows/example.yml
permissions:
  contents: read
  pull-requests: write # Pull Request にコメントするために必要
```

:::

# おまけ

ちなみに Bun Diff Action は Pull Request 以外のイベントでも実行することができます。

```diff yaml:.github/workflows/example.yml
 on:
   pull_request:
+  push:

 jobs:
   bun-diff:
     runs-on: ubuntu-latest
     steps:
       - uses: actions/checkout@v4
       - uses: koki-develop/bun-diff-action@v1
```

その場合はコミットに対してコメントが追加されます。

![](/images/bun-diff-action/commit-comment.png)
_コミットコメント_

https://github.com/koki-develop/bun-diff-action-example/commit/a52a2cd23273770c3c2a158af3a809060a9c442a#commitcomment-145452835

# まとめ

さくっと使えて便利です。

# 参考

https://zenn.dev/da1chi/articles/1d39e61b1b28f4
https://bun.sh/guides/install/yarnlock

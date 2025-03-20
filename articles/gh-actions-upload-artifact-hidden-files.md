---
title: "actions/upload-artifact はデフォルトでは隠しファイルをアップロードしなくなった"
emoji: "📁"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["github", "githubactions"]
published: true
published_at: 2024-09-02 18:00
---

GitHub Actions の [actions/upload-artifact](https://github.com/actions/upload-artifact) アクションは、デフォルトでは**隠しファイル^[「隠しファイル」 = ファイル名の先頭が `.` のファイル。( 例 : `.example.txt` )]をアップロードしなくなりました**。
今後、隠しファイルをアップロードするためには `include-hidden-files: true` を指定する必要があります。

この変更は v3 と v4 の両方に適用されています。

:::message

正確には [v3.2](https://github.com/actions/upload-artifact/releases/tag/v3.2.0) 以降、 [v4.4](https://github.com/actions/upload-artifact/releases/tag/v4.4.0) 以降のバージョンで適用されます。

:::

https://github.blog/changelog/2024-08-19-notice-of-upcoming-deprecations-and-breaking-changes-in-github-actions-runners/

https://github.com/actions/upload-artifact/pull/598

というわけで実際に挙動を確認してみます。

# 実際の挙動を見てみる

## アップロードするディレクトリを用意

こんな感じで、隠しファイルや隠しディレクトリが含まれる `dir/` ディレクトリを用意してみました。

```
dir/
├─ hello.txt
├─ .hello_hidden.txt
├─ subdir/
│  ├─ hello.txt
│  └─ .hello_hidden.txt
└─ .subdir_hidden/
   └─ hello.txt
```

https://github.com/koki-develop/upload-artifact-hidden-files-example/tree/main/dir

## Workflow を作成

この `dir/` ディレクトリを actions/upload-artifact アクションでアップロードする Workflow を作成します。

「`include-hidden-files` input を指定しない job」と「`include-hidden-files: true` を設定する job」をそれぞれ用意しました。

```yaml:.github/workflows/example.yml
on: push

jobs:
  # `include-hidden-files` を指定しない (`false` がデフォルト)
  # → 隠しファイルはアップロードされない
  exclude-hidden-files:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/upload-artifact@v4
        with:
          name: exclude-hidden-files
          path: dir

  # `include-hidden-files` を `true` に指定
  # → 隠しファイルもアップロードされる
  include-hidden-files:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/upload-artifact@v4
        with:
          name: include-hidden-files
          path: dir
          include-hidden-files: true # これ
```

この Workflow を実行すると、それぞれの job でアーティファクトがアップロードされます。

![](/images/gh-actions-upload-artifact-hidden-files/artifacts.png)
_アップロードされたアーティファクト_

## アーティファクトの中身を確認

それではアップロードされたアーティファクトを展開して中身を見てみます。

### `include-hidden-files` を指定しなかった方

```
exclude-hidden-files/
├─ hello.txt
└─ subdir/
   └─ hello.txt
```

隠しファイルや隠しディレクトリが**一切含まれていません**。

### `include-hidden-files` を `true` にした方

```
include-hidden-files/
├─ hello.txt
├─ .hello_hidden.txt
├─ subdir/
│  ├─ hello.txt
│  └─ .hello_hidden.txt
└─ .subdir_hidden/
   └─ hello.txt
```

隠しファイルや隠しディレクトリが全て含まれています。

# まとめ

一応覚えとくとよさそうですね。

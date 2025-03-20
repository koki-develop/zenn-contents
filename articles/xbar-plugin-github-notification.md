---
title: "Mac のメニューバーから GitHub の Pull Request や通知を見れるようにする"
emoji: "🐙"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: [mac, github, xbar]
published: true
published_at: 2024-01-22 18:00
---

こういうのを作りました。

![](/images/xbar-plugin-github-notification/screenshot.png)
_こういうの_

- レビューリクエストされている Pull Request の一覧
- 自分の Pull Request の一覧
- 通知の一覧

を表示しています。

各アイテムをクリックすればブラウザで対象のページが開きます。
通知に関してはメニューバー上で既読にすることもできます ( 一括既読も可能 ) 。

とにかく仕事が捗ってしょうがないので紹介です。

# 仕組み

xbar というオープンソースの Mac アプリを使って実現しています。

https://xbarapp.com/
https://github.com/matryer/xbar

xbar はプラグインを使うことで Mac のメニューバーに様々な情報を表示することができるアプリです。
Homebrew 経由でもインストールすることができます。

```sh
$ brew install --cask xbar
```

# xbar プラグインを使用する手順

それでは今回作成した xbar プラグインをインストールして使用する手順を紹介します。
ソースコードはこちら。

https://github.com/koki-develop/xbar-plugin-github

## 0. 前提条件

今回作成した xbar プラグインを使うには、 **Homebrew 経由**で `node` をインストールしておく必要があります ( 既に他の方法で `node` がインストールされていても問題ありません ) 。

```console
$ brew install node
```

## 1. プラグインをインストール

`git` と `make` が使える環境であれば、次のコマンドでインストールできます。
`github.5m.js` というファイルのシンボリックリンクが xbar のプラグインディレクトリ内に作成されます。

```console
$ git clone git@github.com:koki-develop/xbar-plugin-github
$ cd xbar-plugin-github
$ make
```

もしくは、 xbar のプラグインディレクトリにスクリプトを直接ダウンロードします。

```console
$ wget https://raw.githubusercontent.com/koki-develop/xbar-plugin-github/main/github.5m.js -P ~/Library/Application\ Support/xbar/plugins/
$ chmod +x ~/Library/Application\ Support/xbar/plugins/github.5m.js
```

インストール完了後、 xbar を起動します。
既に起動済みの場合は xbar のメニューから `Refresh all` ( もしくは `⌘` + `⇧` + `r` ) を選択します。

## 2. プラグインの設定

今回作成した xbar プラグインを使用するには GitHub の Personal Access Token を設定する必要があるため、起動直後は以下のように Warning が表示されます。

![](/images/xbar-plugin-github-notification/warning.png)

プラグインの設定画面を開くには `xbar` > `Open plugin…` を選択します (もしくは `⌘` + `e`) 。

![](/images/xbar-plugin-github-notification/to-config.png)

`GITHUB_TOKEN` に GitHub の Personal Access Token を設定して、左上の更新ボタンをクリックしてください。

:::message

必要なトークンの種類・スコープは次の通りです。

- 種類: classic
- スコープ: `repo`, `notifications`

:::

これでプラグインが有効になります。

![](/images/xbar-plugin-github-notification/config.png)

その他の設定項目は次の通りです。

| 項目 | デフォルト | 説明 |
| --- | --- | --- |
| `SHOW_REVIEW_REQUESTED` | `true` | レビューリクエストされている Pull Request を表示するかどうか。 |
| `SHOW_MY_PULL_REQUESTS` | `true` | 自分のプルリクエストを表示するかどうか。 |
| `SHOW_NOTIFICATIONS` | `true` | 通知を表示するかどうか。 |
| `SHOW_PULL_REQUEST_STATUS` | `true` | プルリクエストのステータスを表示するかどうか。 |
| `SHOW_PULL_REQUEST_BRANCHES` | `true` | プルリクエストのブランチ (head/base) を表示するかどうか。 |
| `SHOW_NOTIFICATION_REASON` | `true` | 通知の理由を表示するかどうか。 |
| `INCLUDE_BOT_PULL_REQUESTS` | `false` | bot が作成したプルリクエストを表示するかどうか。 |

# xbar プラグインについて

xbar のプラグインの正体は標準出力にテキストを出力するだけの実行可能ファイルです。
プラグインをインストールすると xbar が定期的にプラグインを実行し、標準出力に出力されたテキストを元にメニューを表示します。

実行頻度は次のようにファイル名に含まれます。

```
{プラグイン名}.{実行頻度}.{拡張子}
```

例えば、次のような `~/Library/Application Support/xbar/plugins/hello.10s.sh` というファイルを作成すると、 10 秒ごとにメニューバーに時刻 ( `date` コマンドの出力 ) が表示されるようになります。
( ついでにメニューアイテムも追加してみました。 )

```bash:~/Library/Application Support/xbar/plugins/hello.10s.sh
#!/bin/bash

date # この出力がメニューバーに表示される
echo "---" # ここから下はメニューアイテム
echo "Item | color=red size=12" # `|` で様々なパラメータを設定できる
echo "Item"
echo "--Sub Item" # 先頭に `--` をつけるとサブアイテムになる
echo "--Sub Item | href=https://example.com" # リンクつきのサブアイテム
```

![](/images/xbar-plugin-github-notification/hello.png)
_こういうのができる_

今回紹介した xbar プラグインも、実態としてはただ GitHub API から取得したデータを整形して標準出力に出力するだけのシンプルなスクリプトです。

その他のフォーマットやパラメータ等の詳細は公式ドキュメントにわかりやすくまとまっているので、こちらをご参照ください。

https://github.com/matryer/xbar-plugins/blob/main/CONTRIBUTING.md

# まとめ

便利すぎる！！！！

# 参考

https://thredot.org/threads/FRMORLMGWBB1C476
https://github.com/matryer/xbar-plugins
https://maiyama4.hatenablog.com/entry/2024/01/10/102829

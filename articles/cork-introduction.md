---
title: "ローカルのマークダウンファイルベースのカンバンアプリ「Cork」の紹介"
emoji: "📋"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["mac", "tauri", "markdown", "mcp"]
published: true
published_at: 2026-07-06
---

AI エージェントにタスク管理させる場合、結局ローカルのマークダウンファイルで管理するのが最強みたいなところありますよね。うんうんわかりますわかります。

というわけで、こういうのを作ったので紹介します。mac 専用です。

https://github.com/koki-develop/Cork?tab=readme-ov-file

![](/images/cork-introduction/board.png)
_カンバンビュー_

![](/images/cork-introduction/task-dialog.png)
_タスクダイアログ_

![](/images/cork-introduction/settings-dialog.png)
_設定画面_

# インストール

Homebrew でインストールできます。

```bash
$ brew install --cask koki-develop/tap/cork
```

# 機能紹介

Cork の機能をざっくり紹介します。

## カンバンビュー

普通のカンバンビューです。タスクやステータスをドラッグアンドドロップで並び替えたり、タスクを検索したりできます。

![](/images/cork-introduction/board.gif)
_タスクやステータスの並び替え_

![](/images/cork-introduction/search-tasks.gif)
_タスクの検索_

## タスクの作成・更新

こんな感じでタスクを作成したり更新できたりします。
タイトル、ボディの他に、ステータス、日付、タグを設定できます。

タスクのボディ部分は WYSIWYG エディタになっており、マークダウン風の書き方で装飾できます。

![](/images/cork-introduction/create-task.gif)
_タスクの作成_

![](/images/cork-introduction/update-task.gif)
_タスクの更新_

---

Cork で作成したタスクはローカルの `<workspace>/<タイトル>.md` というパスで保存されます。タスクのメニューから `Copy Path` をクリックすると、そのタスクファイルの絶対パスをコピーすることができます。

![](/images/cork-introduction/copy-path-board.png)
_タスクを右クリック_

![](/images/cork-introduction/copy-path-dialog.png)
_タスクダイアログのメニュー_

Cork で作成したタスクは、以下のようなマークダウンファイルとして保存されます。

~~~markdown:/path/to/Hello, Cork.md
---
status: In Progress
order: 0.0
tags:
  - foo
  - bar
  - security
  - frontend
date: 2026-06-30
---

**hoge** *fuga* ~~foo~~ `bar`

```js
console.log("Hello, Cork!");
```
~~~

## `cork` CLI

Homebrew で Cork をインストールすると、 `cork` というコマンドラインツールも使えるようになります。

```console
$ cork --help
Command-line interface for Cork

Usage: cork [PATH]

Arguments:
  [PATH]  Directory to open as a workspace. Omit to open a new empty window

Options:
  -h, --help     Print help
  -V, --version  Print version
```

例えば以下のように実行すると `./tasks` ディレクトリをワークスペースとした Cork ウィンドウが開きます。プロジェクトごとに管理しているワークスペースをパッと開きたいときに便利です。

```bash
$ cork ./tasks
```

## MCP サーバー

MCP サーバーもあります。設定画面から有効にできます。

![](/images/cork-introduction/mcp.png)

以下のツールを提供しています。

- `list_tasks`: タスク一覧を取得する（タイトルやメタデータでフィルタリング可能）
- `create_task`: タスクを作成する
- `delete_task`: タスクを削除する
- `update_task_title`: タスクのタイトルを更新する
- `list_statuses`: ステータス一覧を取得する
- `list_tags`: タグ一覧を取得する

タスクの読み取りや、メタデータおよびボディを更新したりするツールは提供していません。どうせただのローカルファイルなので、AI エージェントのビルトインツールなどで直接読み書きしてもらう方が早いです。

# 技術的な話

## フレームワーク

Tauri v2 を使ってます。さくっとデスクトップアプリ作れて便利。

https://github.com/tauri-apps/tauri
https://tauri.app/

Rust バックエンド（ファイルの読み書き / MCP サーバー）に React + TypeScript フロントエンドを組み合わせた構成にしています。

## WYSIWYG エディタ

タスクダイアログの WYSIWYG エディタには Facebook が開発している Lexical を使っています。Lexical は拡張性の高いテキストエディタフレームワークで、React も標準でサポートされています。便利。

https://github.com/facebook/lexical
https://lexical.dev/

例えば [MarkdownShortcutPlugin](https://lexical.dev/docs/api/modules/lexical_react_LexicalMarkdownShortcutPlugin) を有効にするだけで、マークダウン風の書き方で装飾可能な WYSIWYG エディタが簡単に作れます。

Cork ではさらに自前でもプラグインを色々と実装しており、それにより WYSIWYG エディタの挙動を細かくカスタマイズしています。

## MCP サーバー

公式から Rust 用の SDK が提供されているので、こちらを使っています。便利。

https://github.com/modelcontextprotocol/rust-sdk
https://docs.rs/rmcp/latest/rmcp/

# モチベーション

似たような既存ツールはいくつかありましたが、機能が多すぎてわかりにくかったり、そもそも見た目からしてあまり使う気が起きない（テンションが上がらない）UI だったりなど、Not for me なものが多かったので自分で作りました。

Cork ではとにかくシンプルさと見た目と触り心地にこだわっています。特に触り心地です。「使い心地」ではなく「**触り心地**」です（つたわれ）。もちろん使い心地にもこだわっていますが、それ以上に触っていて気持ちが良い、手触りが良い UI であることにめちゃくちゃこだわっています。
たとえタスク管理そのものは AI エージェントに丸投げするとしても、見た目や触り心地の良さは妥協したくないという強い気持ち。日々使うものは、使っていてテンションが上がるものじゃないと嫌。

と言いつつも、Cork にもまだまだ不満な部分がめっちゃあるので、継続的に改善していきます。

# まとめ

デスクトップアプリ開発、結構たのしい。

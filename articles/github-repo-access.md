---
title: "GitHub の削除されたリポジトリや非公開のリポジトリに誰でもアクセスできるの？"
emoji: "👀"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["github"]
published: true
published_at: 2024-07-26 18:00
---

こんなタイトルの記事を見かけました。

https://gigazine.net/news/20240725-github-anyone-can-access-hidden-repository/

> **GitHubの削除されたリポジトリや非公開のリポジトリに誰でもアクセスできてしまうのは仕様通り**

元の記事はこちらです。

https://trufflesecurity.com/blog/anyone-can-access-deleted-and-private-repo-data-github

> **Anyone can Access Deleted and Private Repository Data on GitHub**

もしもこれらが本当にタイトル通りだとしたらさすがに大事件なので、検証してみました。

# 要約

- Accessing Deleted Fork Data
  - **フォークのコミット**は、フォークを削除したあとも、フォーク元のパブリックリポジトリ経由で参照できる。
- Accessing Deleted Repo Data
  - パブリックリポジトリのコミットは、**フォークが作成されていたら**、パブリックリポジトリを削除したあとも、フォーク経由で参照できる。
- Accessing Private Repo Data
  - プライベートリポジトリの**フォークのコミット**は、フォーク元のリポジトリがパブリックに変更された場合、フォークがプライベートになっていても、フォーク元のリポジトリ経由で参照できる。
    ( ただし、参照できるコミットはフォーク元のリポジトリがパブリックに変更された時点までのもののみ。 )
- いずれの場合も、**参照するためには対象コミットのハッシュを特定する必要がある**。

日本語難しい。

# 記事に記載されているシナリオを検証してみる

[元記事](https://trufflesecurity.com/blog/anyone-can-access-deleted-and-private-repo-data-github)では次の 3 つのシナリオについて説明されています。

- Accessing Deleted Fork Data - 削除されたフォークのデータにアクセスする
- Accessing Deleted Repo Data - 削除されたパブリックリポジトリのデータに ( フォーク経由で ) アクセスする
- Accessing Private Repo Data - プライベートな ( フォーク ) リポジトリのデータにアクセスする

それぞれのシナリオについて、実際に手順を踏んで確認してみます。

:::message

それぞれの詳しい仕組み等は元記事に詳細にまとまっているのでこちらをご参照ください。

- [Anyone can Access Deleted and Private Repository Data on GitHub ◆ Truffle Security Co.](https://trufflesecurity.com/blog/anyone-can-access-deleted-and-private-repo-data-github)

:::

## Accessing Deleted Fork Data

1. パブリックリポジトリをフォークする
1. フォークにコードをコミットする ( パブリックリポジトリには取り込まない )
1. フォークを削除する

上記の手順を行ったとき、 2. でコミットした内容が、 ( パブリックリポジトリに取り込んでいないにも関わらず ) フォークを削除したあとも参照できることが指摘されています。

:::details 手順スクリーンショット

### 1. パブリックリポジトリをフォークする

まずはパブリックなリポジトリを用意します。今回は `public-repo-1` という名前でパブリックリポジトリを作成しました。

![](/images/github-private-repo-access/public-repo-1.png)
_public-repo-1_

このリポジトリをフォークします。

![](/images/github-private-repo-access/to-fork-public-repo-1.png)

フォークのリポジトリ名を入力します。今回は `public-repo-1-fork` としました。
`Create fork` をクリックします。

![](/images/github-private-repo-access/fork-public-repo-1.png)

`public-repo-1` のフォークとして `public-repo-1-fork` が作成されました。

![](/images/github-private-repo-access/forked-public-repo-1.png)
_public-repo-1-fork_

### 2. フォークにコードをコミットする

フォーク ( 今回の場合は `public-repo-1-fork` ) に適当なコードをコミットします。
今回は `index.js` というファイルを作成しました。

![](/images/github-private-repo-access/commit-public-repo-1-fork.png)
_index.js_

コミットハッシュは `223a27f3cac4f82a03117b251e1d13de919f639c` になりました。
なお、このコミットはパブリックリポジトリ ( 今回の場合は `public-repo-1` ) には取り込みません。

![](/images/github-private-repo-access/commited-public-repo-1-fork.png)
_223a27f3cac4f82a03117b251e1d13de919f639c_

### 3. フォークを削除する

フォーク ( 今回の場合は `public-repo-1-fork` ) を削除します。
設定画面から `Delete this repository` をクリックします。

![](/images/github-private-repo-access/delete-public-repo-1-fork.png)

---

それでは、削除したフォークのコミットの内容が参照できるか確認してみます。
以下のような URL にアクセスします。

- `https://github.com/<フォーク元のリポジトリのオーナー>/<フォーク元のリポジトリ>/commit/<フォークのコミットハッシュ>`

今回の場合は以下のようになります。

- `https://github.com/koki-develop-org/public-repo-1/commit/223a27f3cac4f82a03117b251e1d13de919f639c`

https://github.com/koki-develop-org/public-repo-1/commit/223a27f3cac4f82a03117b251e1d13de919f639c

アクセスしてみると、すでに削除したフォークのコミットの内容が表示されました。

![](/images/github-private-repo-access/deleted-public-repo-1-fork-commit.png)
_すでに削除したフォークのコミットを参照できる_

上部には以下のようなメッセージが表示されています。

> This commit does not belong to any branch on this repository, and may belong to a fork outside of the repository.

このコミットがどのブランチにも属していないこと、そしてこのリポジトリの外部のフォークに属している可能性があることが表示されています。

:::

## Accessing Deleted Repo Data

1. パブリックリポジトリをフォークする
1. パブリックリポジトリにコードをコミットする ( フォークには取り込まない )
1. パブリックリポジトリを削除する

上記の手順を行った時、 2. でコミットした内容が、 ( フォークに取り込んでないにも関わらず ) パブリックリポジトリを削除したあとも参照できることが指摘されています。

:::details 手順スクリーンショット

### 1. パブリックリポジトリをフォークする

まずはパブリックなリポジトリを用意します。今回は `public-repo-2` という名前でパブリックリポジトリを作成しました。

![](/images/github-private-repo-access/public-repo-2.png)
_public-repo-2_

このリポジトリをフォークします。

![](/images/github-private-repo-access/to-fork-public-repo-2.png)

フォークのリポジトリ名を入力します。今回は `public-repo-2-fork` としました。
`Create fork` をクリックします。

![](/images/github-private-repo-access/fork-public-repo-2.png)

`public-repo-2` のフォークとして `public-repo-2-fork` が作成されました。

![](/images/github-private-repo-access/forked-public-repo-2.png)
_public-repo-2-fork_

### 2. パブリックリポジトリにコードをコミットする

パブリックリポジトリ ( 今回の場合は `public-repo-2` ) に適当なコードをコミットします。
今回は `index.js` というファイルを作成しました。

![](/images/github-private-repo-access/commit-public-repo-2.png)

コミットハッシュは `dadfa9105fc2fd94453b08eeebeff5402d19abd0` になりました。
なお、このコミットはフォーク ( 今回の場合は `public-repo-2-fork` ) には取り込みません。

![](/images/github-private-repo-access/commited-public-repo-2.png)
_dadfa9105fc2fd94453b08eeebeff5402d19abd0_

### 3. パブリックリポジトリを削除する

パブリックリポジトリ ( 今回の場合は `public-repo-2` ) を削除します。

![](/images/github-private-repo-access/delete-public-repo-2.png)

---

それでは、削除したパブリックリポジトリのコミットの内容が参照できるか確認してみます。
以下のような URL にアクセスします。

- `https://github.com/<フォークのオーナー>/<フォーク>/commit/<フォーク元のリポジトリのコミットハッシュ>`

今回の場合は以下のようになります。

- `https://github.com/koki-develop-org/public-repo-2-fork/commit/dadfa9105fc2fd94453b08eeebeff5402d19abd0`

https://github.com/koki-develop-org/public-repo-2-fork/commit/dadfa9105fc2fd94453b08eeebeff5402d19abd0

アクセスしてみると、すでに削除したパブリックリポジトリのコミットの内容が表示されました。

![](/images/github-private-repo-access/deleted-public-repo-2-commit.png)
_すでに削除したパブリックリポジトリのコミットを参照できる_

上部には以下のようなメッセージが表示されています。

> This commit does not belong to any branch on this repository, and may belong to a fork outside of the repository.

このコミットがどのブランチにも属していないこと、そしてこのリポジトリの外部のフォークに属している可能性があることが表示されています。

:::

## Accessing Private Repo Data

1. プライベートリポジトリをフォークする
1. フォークにコードをコミットする
1. プライベートリポジトリをパブリックにし、フォークをプライベートにする

上記の手順を行った時、2. でコミットした内容が、フォークがプライベートになっていても参照できることが指摘されています。

::::details 手順スクリーンショット

### 1. プライベートリポジトリをフォークする

まずはプライベートなリポジトリを用意します。今回は `private-repo-1` という名前でプライベートリポジトリを作成しました。

![](/images/github-private-repo-access/private-repo-1.png)
_private-repo-1_

このリポジトリをフォークします。

:::message

プライベートリポジトリをフォークするには、組織のフォーキングポリシーを設定する必要があります。
詳しくは以下のドキュメントをご参照ください。

- [Managing the forking policy for your organization - GitHub Docs](https://docs.github.com/en/organizations/managing-organization-settings/managing-the-forking-policy-for-your-organization)

:::

![](/images/github-private-repo-access/to-fork-private-repo-1.png)

フォークのリポジトリ名を入力します。今回は `private-repo-1-fork` としました。
`Create fork` をクリックします。

![](/images/github-private-repo-access/fork-private-repo-1.png)

`private-repo-1` のフォークとして `private-repo-1-fork` が作成されました。

![](/images/github-private-repo-access/forked-private-repo-1.png)
_private-repo-1-fork_

### 2. フォークにコードをコミットする

フォーク ( 今回の場合は `private-repo-1-fork` ) に適当なコードをコミットします。
今回は `index.js` というファイルを作成しました。

![](/images/github-private-repo-access/commit-private-repo-1-fork.png)
_index.js_

コミットハッシュは `9c7453560e1ac974e1b31598e18cc39e5eb52872` になりました。
なお、このコミットはプライベートリポジトリ ( 今回の場合は `private-repo-1` ) には取り込みません。

![](/images/github-private-repo-access/commited-private-repo-1-fork.png)
_9c7453560e1ac974e1b31598e18cc39e5eb52872_

### 3. プライベートリポジトリをパブリックにし、フォークをプライベートにする

プライベートリポジトリ ( 今回の場合は `private-repo-1` ) をパブリックにします。

![](/images/github-private-repo-access/private-repo-1-to-public.png)

( フォークは今回の場合、作成時点で既にプライベートになっているので特に何もしません。 )

---

それでは、プライベートなフォークのコミットの内容が参照できるか確認してみます。
以下のような URL にアクセスします。

- `https://github.com/<フォーク元のリポジトリのオーナー>/<フォーク元のリポジトリ>/commit/<フォークのコミットハッシュ>`

今回の場合は以下のようになります。

- `https://github.com/koki-develop-org/private-repo-1/commit/9c7453560e1ac974e1b31598e18cc39e5eb52872`

https://github.com/koki-develop-org/private-repo-1/commit/9c7453560e1ac974e1b31598e18cc39e5eb52872

アクセスしてみると、プライベートなフォークのコミットの内容が表示されました。
( 未ログイン状態でアクセスしています )

![](/images/github-private-repo-access/private-private-repo-1-fork-commit.png)
_プライベートなフォークのコミットを参照できる_

上部には以下のようなメッセージが表示されています。

> This commit does not belong to any branch on this repository, and may belong to a fork outside of the repository.

このコミットがどのブランチにも属していないこと、そしてこのリポジトリの外部のフォークに属している可能性があることが表示されています。

ちなみに、この後に追加でフォークにコミットした内容にはアクセスできません。
あくまでフォーク元のリポジトリが**パブリックになった時点まで**のコミットの内容が参照できるようです。

::::

# まとめ

参考記事のタイトルには **フォーク** の **フ** の字も入ってなかったのでさすがにびっくりしました。
この内容を単に「**削除されたリポジトリや非公開のリポジトリに誰でもアクセスできてしまう**」と表現するのはなかなか過激ですね。間違っちゃいないけども。

しかしそれはそれとして、今回指摘されている GitHub の仕様には気をつけておいた方がいいことは確かです。
なんにせよ、シークレットキー等の機密情報をハードコーディングして GitHub にプッシュするのはやめましょう。

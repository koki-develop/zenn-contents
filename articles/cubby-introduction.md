---
title: "Touch ID 付きでローカルにシークレットを保管できるコマンドラインツール「cubby」の紹介"
emoji: "🫆"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["mac", "swift", "cli", "security"]
published: false
---

Touch ID 付きでローカルにシークレットを保管できるコマンドラインツール「cubby」を作りました。mac 専用です。

https://github.com/koki-develop/cubby

- シークレットを保存しておきたい
- でもクラウドで管理するほどのものではないのでローカルに置いておきたい
- でも平文では置いておきたくない

というときにサクッと使えるものがほしいなと思って作りました。

この記事では cubby のインストール方法から基本的な使い方についてまとめます。

- [インストール](#インストール)
- [使い方](#使い方)
- [仕組み](#仕組み)
- [まとめ](#まとめ)

## インストール

:::message

動作には以下が必要です。

- Apple シリコン搭載の macOS 14 以降
- Touch ID が登録されていること

:::

Homebrew でインストールできます。

```bash
$ brew install koki-develop/tap/cubby
```

## 使い方

```bash
$ cubby --help
OVERVIEW: Secret store gated by Touch ID.

USAGE: cubby <subcommand>

OPTIONS:
  --version               Show the version.
  -h, --help              Show help information.

SUBCOMMANDS:
  init                    Create the store.
  set                     Save a secret.
  get                     Print a secret.
  rm                      Delete a secret.
  list                    List the names of the stored secrets.

  See 'cubby help <subcommand>' for detailed help.
```

### ストアを作成する

まずは `cubby init` でストアを作成します。

```bash
$ cubby init
```

```:出力例
Created a store at ~/.cubby
```

ストアはデフォルトで `~/.cubby` に作成されますが、`CUBBY_HOME` 環境変数で場所を変えることもできます。

```bash
$ export CUBBY_HOME=/path/to/store
$ cubby init
```

### シークレットを保存する

`cubby set <任意の名前>` でシークレットを保存できます。

```bash
# 値を対話的に入力
$ cubby set my-secret
Value:

# 標準入力から値を渡すこともできる
$ echo -n 'P@ssw0rd' | cubby set my-secret --from-stdin

# 同じ名前のシークレットを上書きしたい場合は `--force` を指定する
$ cubby set my-secret --force
```

値を入力して Enter を押すと Touch ID を求められます。

![](/images/cubby-introduction/set.png)

認証に成功すると保存が完了します。

### シークレットを一覧する

`cubby list` で保存しているシークレットの名前を一覧できます。

```bash
$ cubby list
```

```:出力例
my-secret
openai-api-key
super-secret
```

### シークレットを取得する

`cubby get <名前>` でシークレットを取得できます。`set` と同じく Touch ID を求められます。

```bash
$ cubby get my-secret
```

![](/images/cubby-introduction/get.png)

取得した値は標準出力に出力されます。

```:出力例
P@ssw0rd
```

### シークレットを削除する

`cubby rm <名前>` でシークレットを削除できます。

```bash
$ cubby rm my-secret
```

```:出力例
Deleted "my-secret"
```

## 仕組み

cubby は Secure Enclave と Touch ID を使ってシークレットを保護しています。

Secure Enclave は Apple のチップに組み込まれている専用のセキュリティサブシステムです。
メインプロセッサから分離されていて、たとえ OS のカーネルが乗っ取られたとしても中のデータが漏れないように設計されています。Touch ID の指紋データなどもここで保護されています。

https://support.apple.com/ja-jp/guide/security/sec59b0b31ff/web

`cubby init` を実行すると、この Secure Enclave の中に「Touch ID に成功したときだけ使える」鍵が生成されます。
生成された鍵は Secure Enclave によってラップされた状態で `$CUBBY_HOME/key.blob` に保存されます。これをそのまま鍵として使うことはできず、元の鍵に戻せるのは生成した Secure Enclave だけです。

シークレットはこの鍵で 1 つずつ暗号化されて `$CUBBY_HOME/secrets/` に保存され、取得するときも同じ鍵で復号します。
そのため、保存時と取得時に毎回 Touch ID が求められます。

```
$CUBBY_HOME/
├── key.blob             Secure Enclave の鍵 (ラップ済み)
└── secrets/
    └── <hex>.bin        暗号化されたシークレット (1 つにつき 1 ファイル)
```

シークレットの復号に必要な秘密鍵は Secure Enclave の外に出ることはありません。
なので、仮にストアごとファイルを盗まれたとしても、別の Mac では中身を読み取れませんし、同じ Mac 上であっても Touch ID を通さない限り復号はできません。

## まとめ

サクッと使えて便利。

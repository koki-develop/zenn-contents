---
title: "羊を眠らせる sleep コマンド「sheep」の紹介"
emoji: "🐑"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["cli", "terminal", "golang"]
published: true
---

羊を眠らせる `sleep` コマンドである [`sheep`](https://github.com/koki-develop/sheep) を作りました。

https://github.com/koki-develop/sheep

![](/images/sheep-introduction/demo.gif)

この記事では [`sheep`](https://github.com/koki-develop/sheep) のインストール方法 ~ 使い方についてまとめます。

- [インストール](#インストール)
- [使い方](#使い方)
- [まとめ](#まとめ)

# インストール

Homebrew を使用している場合は `brew install` でインストールできます。

```sh
$ brew install koki-develop/tap/sheep
```

もしくは、 [`sheep`](https://github.com/koki-develop/sheep) は Go で作られているため `go install` でインストールすることもできます。

```sh
$ go install github.com/koki-develop/sheep@latest
```

# 使い方

引数にスリープする時間 ( 秒 ) を指定して実行するだけです。

```sh
# 5 秒スリープする
$ sheep 5
```

![](/images/sheep-introduction/demo.gif)

時間の単位を使用することもできます。
使用できる単位は次の通りです。

- `h` ( 時間 )
- `m` ( 分 )
- `s` ( 秒 )
- `ms` ( ミリ秒 )
- `ns` ( ナノ秒 )
- `μs` or `us` ( マイクロ秒 )

```sh
# 1 時間 20 分 30 秒スリープする
$ sheep 1h20m30s
```

![](/images/sheep-introduction/time-unit.gif)

:::message

こちらの時間単位のサポートは [@shiyui](https://github.com/Sigumaa) さんに実装していただきました。

- [Made compatible with not only numerical values, but also with '1s' or '1m'.](https://github.com/koki-develop/sheep/pull/3)

:::

時間を指定せずに実行するとスリープせずに羊を出力します。

```sh
$ sheep
```

![](/images/sheep-introduction/noargs.gif)

# まとめ

時間経過後にちゃんと羊が目を覚ますのがこだわりポイントです。

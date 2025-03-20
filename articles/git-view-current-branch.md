---
title: "【Git】自分が今いるブランチを確認する"
emoji: "😽"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["git"]
published: true
---

# 検証環境

- git 2.32.0

# 自分が今いるブランチを確認するコマンド

`git branch` に `--contains` フラグを付けることで自分が今いるブランチが出力される。

```sh:コマンド
$ git branch --contains
```

```txt:出力
* main
```

先頭の `*` が邪魔な場合は `cut` 等を使用するといい。

```sh:コマンド
$ git branch --contains | cut -d " " -f 2
```

```txt:出力
main
```

# 参考

https://qiita.com/usamik26/items/8aa6c3aed4b9c7dba5ca

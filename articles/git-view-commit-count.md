---
title: "【Git】コミット件数を確認する"
emoji: "🦁"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["git"]
published: true
---

# 検証環境

- git v2.33.0

# コミット件数を確認するコマンド

以下のコマンドで特定のリビジョンのコミット数を取得できる

```txt:コマンド
$ git rev-list --count {ブランチ名 or コミットハッシュ等}
```

# 例

```txt:コマンド
$ git rev-list --count main
```

```txt:出力
16
```

# 参考

https://stackoverflow.com/questions/677436/how-do-i-get-the-git-commit-count

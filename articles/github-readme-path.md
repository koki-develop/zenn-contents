---
title: "GitHub の README はリポジトリのルートディレクトリ以外にも置ける"
emoji: "📝"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["github"]
published: true
---

Twitter で以下のツイートを見かけました。

https://twitter.com/azu_re/status/1614458485055586305

そこで調べてみたところ、 GitHub では次の場所に置かれている README を認識するようです。

- `.github/`
- リポジトリのルートディレクトリ
- `docs/`

複数の README が含まれている場合は、 `.github/` 、ルートディレクトリ、 `docs/` の順に優先されます。
例えば冒頭のツイートの [reduxjs/redux-toolkit](https://github.com/reduxjs/redux-toolkit) は [`.github/`](https://github.com/reduxjs/redux-toolkit/tree/master/.github) ディレクトリ内に [`README.md`](https://github.com/reduxjs/redux-toolkit/blob/master/.github/README.md) (正確には [`packages/toolkit/README.md`](https://github.com/reduxjs/redux-toolkit/blob/master/packages/toolkit/README.md) へのシンボリックリンク) を置いています。

https://docs.github.com/ja/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-readmes#about-readmes

ほぇー知らんかったってなったのでついでに実際に挙動を見てみました。

https://github.com/koki-develop/github-readme-path

# 挙動を見てみる

[`docs/README.md`](https://github.com/koki-develop/github-readme-path/blob/main/docs/README.md) を作成します。

https://github.com/koki-develop/github-readme-path/blob/main/docs/README.md
https://github.com/koki-develop/github-readme-path/tree/2ab372808b03ff8acc5eabca1f0dc2ed1855819a

[`docs/README.md`](https://github.com/koki-develop/github-readme-path/blob/main/docs/README.md) が表示されました。

![](/images/github-readme-path/docs.png)
_[`docs/README.md`](https://github.com/koki-develop/github-readme-path/blob/main/docs/README.md) が表示されている_

ルートディレクトリに [`README.md`](https://github.com/koki-develop/github-readme-path/blob/main/README.md) を作成します。

https://github.com/koki-develop/github-readme-path/blob/main/README.md
https://github.com/koki-develop/github-readme-path/tree/2e3e2c3ef4c630bf0f064dce20772d30434132f7

ルートディレクトリの [`README.md`](https://github.com/koki-develop/github-readme-path/blob/main/README.md) が表示されました。

![](/images/github-readme-path/root.png)
_[`README.md`](https://github.com/koki-develop/github-readme-path/blob/main/README.md) が表示されている_

[`.github/README.md`](https://github.com/koki-develop/github-readme-path/blob/main/.github/README.md) を作成します。

https://github.com/koki-develop/github-readme-path/blob/main/.github/README.md
https://github.com/koki-develop/github-readme-path/tree/a5afa2e948f60db1186f33e8af78f5247b660d7b

[`.github/README.md`](https://github.com/koki-develop/github-readme-path/blob/main/.github/README.md) が表示されました。

![](/images/github-readme-path/dot-github.png)
_[`.github/README.md`](https://github.com/koki-develop/github-readme-path/blob/main/.github/README.md) が表示されている_

# まとめ

ほぇーってなりました。

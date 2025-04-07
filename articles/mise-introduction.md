---
title: "ありとあらゆる言語 / ツールのインストールに mise を使う"
emoji: "🛠️"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["mise"]
published: false
---

TODO: write

# mise とは？

TODO: write

https://github.com/jdx/mise
https://mise.jdx.dev

# mise をインストールする

TODO: write

```sh
$ brew install mise
```

```sh:~/.zshrc
eval "$(mise activate zsh)"
```

# mise の使い方

TODO: write

```sh
$ mise use ruby
```

```toml:mise.toml
[tools]
ruby = "latest"
```

```sh
$ mise use ruby@3.4.2
$ mise use ruby --pin
```

```toml:mise.toml
[tools]
ruby = "3.4.2"
```

## `.ruby-version`, `.node-version` などのバージョンファイルを使用する

TODO: write

https://mise.jdx.dev/configuration.html#idiomatic-version-files

## 言語 / ツールをグローバルにインストールする

TODO: write

```sh
$ mise use --global ruby
```

- `~/.config/mise/config.toml`

https://mise.jdx.dev/configuration.html#mise-global-config-file

```sh
export MISE_GLOBAL_CONFIG_FILE="~/.local/share/chezmoi/mise.toml"
```

# mise でインストール可能な言語 / ツール

TODO: write

## 組み込みでサポートされているもの

TODO: write

https://mise.jdx.dev/core-tools.html

```sh
$ mise registry -b core
```

## 組み込み以外のもの

TODO: write

https://mise.jdx.dev/dev-tools/backends/

# GitHub Actions で mise を使う

TODO: write

https://github.com/jdx/mise-action

```yaml:
- uses: jdx/mise-action@v2
```

# その他の mise の機能

TODO: write

# まとめ

TODO: write

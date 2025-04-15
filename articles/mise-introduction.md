---
title: "ありとあらゆるプログラミング言語 / ツールのインストールに mise を使う"
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

`mise use` コマンドで特定のツールをインストールできます。

```sh
$ mise use <tool>
```

例えば Ruby をインストールする場合は以下のようにします。

```sh
$ mise use ruby
$ ruby --version
ruby 3.4.2 (2025-02-15 revision d2930f8e7a) +PRISM [arm64-darwin23]
```

すると、カレントディレクトリに `mise.toml` という名前で以下のようなファイルが作成されます。mise によってインストールされたツールやそのバージョンはこのファイルに記述されていきます。

```toml:mise.toml
[tools]
ruby = "latest"
```

`mise use <tool>@<version>` のようにバージョンを明示的に指定することもできます。

```sh
# Ruby v3.4.2 をインストールする例
$ mise use ruby@3.4.2
# `--pin` フラグを指定すると自動でバージョンを固定してくれる
$ mise use ruby --pin
```

```toml:mise.toml
[tools]
ruby = "3.4.2"
```

特定のツールのインストール可能なバージョンの一覧は以下のコマンドで確認できます。

```sh
$ mise ls-remote <tool>
```

```sh
# Ruby の例
$ mise ls-remote ruby
artichoke-dev
jruby-dev
...省略
3.4.2
3.4.3
3.5-dev
```

## `.ruby-version`, `.node-version` などのバージョンファイルを使用する

mise はデフォルトでは `mise.toml` にツールのバージョンを記述しますが、 `.ruby-version` や `.node-version` などの一般的なバージョンファイルも認識できます。

mise 2025.4.2 時点でサポートされているバージョンファイルは以下です。

- Crystal : `.crystal-version`
- Elixir : `.exenv-version`
- Go : `.go-version`, `go.mod`
- Java : `.java-version`, `.sdkmanrc`
- Node.js : `.nvmrc`, `.node-version`
- Python : `.python-version`, `.python-versions`
- Ruby : `.ruby-version`, `Gemfile`
- Terraform : `.terraform-version`, `.packer-version`, `main.tf`
- Yarn : `.yarnrc`

https://mise.jdx.dev/configuration.html#idiomatic-version-files

## ツールをグローバルにインストールする

通常、 mise を使ってインストールしたツールは `mise.toml` ( もしくはその他バージョンファイル ) が存在しているディレクトリ配下でのみ有効です。

```sh
# deno をインストール
$ mise use deno
$ deno -v
deno 2.2.9

# `mise.toml` が存在しないディレクトリでは使用できない
$ cd ../
$ deno -v
zsh: command not found: deno
```

`--global` フラグを指定して `mise use` を実行することで、ツールをグローバルにインストールできます。

```sh
# グローバルに deno をインストール
$ mise use --global deno

# どこでも使用できる
$ deno -v
deno 2.2.9
```

この場合はカレントディレクトリには `mise.toml` は作成されず、グローバル設定用の `mise.toml` が更新されます。
グローバル設定用の `mise.toml` はデフォルトでは以下のパスに配置されます。

```
~/.config/mise/config.toml
```

このパスは環境変数経由で変更できます。

```sh:~/.zshrc
# 例
export MISE_GLOBAL_CONFIG_FILE="~/dotfiles/mise.toml"
```

詳しくは以下のドキュメントをご参照ください。

https://mise.jdx.dev/configuration.html#mise-global-config-file

# mise でインストール可能なツール

ここからは mise でインストールできるツールについてまとめます。

TODO: toc

## 組み込みでサポートされているもの

mise 2025.4.2 時点で mise 本体の組み込みでサポートされているツールは以下です。

| ツール | インストールコマンド例 |
| --- | --- |
| [Bun](https://mise.jdx.dev/lang/bun.html) | `mise use bun` |
| [Deno](https://mise.jdx.dev/lang/deno.html) | `mise use deno` |
| [Elixir](https://mise.jdx.dev/lang/elixir.html) (experimental) | `mise use elixir` |
| [Erlang](https://mise.jdx.dev/lang/erlang.html) | `mise use erlang` |
| [Go](https://mise.jdx.dev/lang/go.html) | `mise use go` |
| [Java](https://mise.jdx.dev/lang/java.html) | `mise use java` |
| [Node.js](https://mise.jdx.dev/lang/node.html) | `mise use node` |
| [Python](https://mise.jdx.dev/lang/python.html) | `mise use python` |
| [Ruby](https://mise.jdx.dev/lang/ruby.html) | `mise use ruby` |
| [Rust](https://mise.jdx.dev/lang/rust.html) (experimental) | `mise use rust` |
| [Swift](https://mise.jdx.dev/lang/swift.html) (experimental) | `mise use swift` |
| [Zig](https://mise.jdx.dev/lang/zig.html) | `mise use zig` |

https://mise.jdx.dev/core-tools.html

## Backend

https://mise.jdx.dev/dev-tools/backends/

**Backend** とは、 mise がツールやプラグインをインストールするための仕組みです。
mise では様々な Backend がサポートされており、これにより非常に幅広いツールをインストールできるようになっています。

以下のように、明示的に Backend を指定してツールをインストールできます。

```sh
$ mise use <backend>:<tool>
```

```sh
# aqua から reviewdog をインストールする例
$ mise use aqua:reviewdog/reviewdog
```

mise 2025.4.2 時点でサポートされている Backend は以下です。

| Backend | インストールコマンド例 |
| --- | --- |
| [aqua](https://mise.jdx.dev/dev-tools/backends/aqua.html) | `mise use aqua:BurntSushi/ripgrep` |
| [asdf](https://mise.jdx.dev/dev-tools/backends/asdf.html) | `mise use asdf:mise-plugins/mise-v` |
| [cargo](https://mise.jdx.dev/dev-tools/backends/cargo.html) | `mise use cargo:eza` |
| [dotnet](https://mise.jdx.dev/dev-tools/backends/dotnet.html) (experimental) | `mise use dotnet:GitVersion.Tool` |
| [gem](https://mise.jdx.dev/dev-tools/backends/gem.html) (experimental) | `mise use gem:rubocop` |
| [go](https://mise.jdx.dev/dev-tools/backends/go.html) (experimental) | `mise use go:github.com/DarthSim/hivemind` |
| [npm](https://mise.jdx.dev/dev-tools/backends/npm.html) | `mise use npm:prettier` |
| [pipx](https://mise.jdx.dev/dev-tools/backends/pipx.html) | `mise use pipx:psf/black` |
| [spm](https://mise.jdx.dev/dev-tools/backends/spm.html) (experimental) | `mise use spm:tuist/tuist` |
| [ubi](https://mise.jdx.dev/dev-tools/backends/ubi.html) | `mise use ubi:goreleaser/goreleaser` |
| [vfox](https://mise.jdx.dev/dev-tools/backends/vfox.html) (experimental) | `mise use vfox:version-fox/vfox-cmake` |

また、一部のツールは明示的に Backend を指定しなくてもインストールできるようになっており、組み込みでサポートされているツールと同じように `mise use <tool>` でインストールできます。

```sh
# 例えば Terraform は Backend を指定しなくてもインストールできる
$ mise use terraform
```

Backend を指定しなくてもインストールできるツールの一覧は以下のコマンドで確認できます。

```sh
$ mise registry
```

# GitHub Actions で mise を使う

GitHub Actions で mise を使うためのアクションも提供されています。

```yaml
- uses: jdx/mise-action@v2
```

通常、 GitHub Actions でツールをインストールする場合はツールごとに `hoge/setup-<tool>` のようなアクションを使用することが多いですが、 `jdx/mise-action` であれば全てのツールのインストールが単一のアクションで完結します。

```yaml:実際のワークフローの例
# ...

jobs:
  example:
    runs-on: ubuntu-latest
    steps:
      # これだけでツールのインストールが完了する
      - uses: actions/checkout@v4
      - uses: jdx/mise-action@v2

      # ...
```

`jdx/mise-action` の詳細な使い方については公式ドキュメントをご参照ください。

https://github.com/jdx/mise-action

# その他の mise の機能

TODO: write

# まとめ

TODO: write

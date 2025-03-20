---
title: "コードやコマンド出力を画像化するコマンドラインツール「Freeze」の紹介"
emoji: "🍨"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["cli", "shell", "terminal"]
published: true
published_at: 2024-04-08 18:00
---

[Charm](https://charm.sh/) がまた最高なツールを出してました。

https://github.com/charmbracelet/freeze#readme

例えばこういうコマンドを実行すると、

```sh
$ freeze main.js \
    --window \
    --show-line-numbers \
    --border.radius 8 \
    --shadow.blur 4 \
    --margin 12
```

こういう画像を作れます。

![](/images/freeze-introduction/demo.png)
_こういうの_

この記事では Freeze の基本的な使い方について簡単に紹介します。

- [インストール](#インストール)
- [基本的な使い方](#基本的な使い方)
- [コマンドの実行結果を画像化](#コマンドの実行結果を画像化)
- [見た目のカスタマイズ](#見た目のカスタマイズ)
    - [フォント](#フォント)
    - [mac のウィンドウっぽくする](#mac-のウィンドウっぽくする)
    - [枠線](#枠線)
    - [行番号](#行番号)
  - [設定ファイル](#設定ファイル)
- [まとめ](#まとめ)

# インストール

Homebrew を使用している場合は `brew install` でインストールできます。

```sh
$ brew install charmbracelet/tap/freeze
```

もしくは `go install` でインストールすることもできます。

```sh
$ go install github.com/charmbracelet/freeze@latest
```

その他のインストール方法については[公式の README](https://github.com/charmbracelet/freeze#installation) をご参照ください。

https://github.com/charmbracelet/freeze#installation

# 基本的な使い方

基本的には以下のように、 `freeze` コマンドに画像化したいファイルを渡すだけです。

```sh
$ freeze <ファイル名>
# 例
$ freeze main.js
```

今回は以下のような内容の `main.js` を例にします。

```js:main.js
function fibonacci(length) {
  let nums = [0, 1];
  for (let i = 2; i < length; i++) {
    nums[i] = nums[i - 1] + nums[i - 2];
  }
  return nums;
}

console.log(fibonacci(10));
// => [
//      0, 1,  1,  2,  3,
//      5, 8, 13, 21, 34
//    ]
```

`freeze` コマンドを実行してみます。

```sh
$ freeze main.js
```

次のような画像が `freeze.png` という名前で保存されます。

![](/images/freeze-introduction/code.png)
_出力された画像_

素敵ですね。

画像はデフォルトでは `freeze.png` という名前で保存されますが、 `-o` もしくは `--output` フラグで名前を指定することもできます。

```sh
# hoge.png という名前で保存
$ freeze main.js --output hoge.png
```

また、保存ファイル名の拡張子によって画像形式を指定することもできます。
v0.1.6 時点では PNG, WebP, SVG に対応しています。

```sh
# PNG 形式で保存
$ freeze main.js --output out.png
# WebP 形式で保存
$ freeze main.js --output out.webp
# SVG 形式で保存
$ freeze main.js --output out.svg
```

# コマンドの実行結果を画像化

Freeze が画像化できるのはファイルだけではありません。
`--execute` フラグにコマンドを指定すると、そのコマンドの出力を画像化することもできます。

```sh
# eza を実行してみる
$ freeze --execute 'eza -alh'
```

![](/images/freeze-introduction/execute.png)
_ちゃんと色もつく_

すごい。

# 見た目のカスタマイズ

フラグによって画像の見た目をカスタマイズすることができます。
ここではいくつかの例を紹介します。

### フォント

`--font.family` フラグでフォントを指定することができます。
デフォルトは `JetBrains Mono` です。

https://www.jetbrains.com/ja-jp/lp/mono/

今回は例として `Unifont` を指定してみます。

https://unifoundry.com/unifont/index.html

```sh
# Unifont を指定 (ローカルにフォントがインストールされている必要があります)
$ freeze main.js --font.family 'Unifont'
```

![](/images/freeze-introduction/code-font.png)
_出力された画像_

### mac のウィンドウっぽくする

`--window` フラグを指定すると mac のウィンドウっぽくなります。

```sh
$ freeze main.js --window
```

![](/images/freeze-introduction/code-window.png)
_出力された画像_

### 枠線

枠線を設定することもできます。

- `--border.width` : 枠線の幅
- `--border.color` : 枠線の色
- `--border.radius` : 角の丸み

```sh
$ freeze main.js --border.width 8 --border.color "#ff0000" --border.radius 8
```

![](/images/freeze-introduction/code-border.png)
_出力された画像_

### 行番号

`--show-line-numbers` フラグを指定すると行番号が表示されます。

```sh
$ freeze main.js --show-line-numbers
```

![](/images/freeze-introduction/code-line-numbers.png)
_出力された画像_

---

ここで紹介したのは一部ですが、他にも様々なオプションが用意されています。

- シンタックスハイライトのテーマ
- 影
- margin, padding
- フォントサイズ
- etc...

詳しくは[公式の README](https://github.com/charmbracelet/freeze#flags) をご参照ください。

https://github.com/charmbracelet/freeze#flags

## 設定ファイル

毎回フラグを指定するのは面倒なので、自分で設定ファイルを作成して使い回すことも可能です。

例えば `freeze --interactive` を実行すると対話的に設定を行うことができます。

![](/images/freeze-introduction/interactive.gif =400x)
_[公式の README](https://github.com/charmbracelet/freeze#interactive-mode) より引用_

`freeze --interactive` で行った設定はローカルに保存され、次回以降は `-c` もしくは `--config` フラグに `user` を指定することで再利用することができます。

```sh
# `freeze --interactive` で作成した設定を使う
$ freeze main.js --config user
```

デフォルトで用意されている設定もあります。
例えば `-c` もしくは `--config` フラグに `full` を指定すると mac のスクショっぽくなります。

```sh
$ freeze main.js --config full
```

![](/images/freeze-introduction/full.png)
_mac のスクショっぽい_

設定ファイルについて詳しくは[公式の README](https://github.com/charmbracelet/freeze#configuration) をご参照ください。

https://github.com/charmbracelet/freeze#configuration

# まとめ

最高すぎます。
[Charm](https://charm.sh/) は他にも最高なツールや Go ライブラリをたくさん出しているので、興味があればこれらもチェックしてみてください。

https://charm.sh
https://zenn.dev/kou_pg_0131/articles/gum-introduction
https://zenn.dev/kou_pg_0131/articles/vhs-introduction
https://zenn.dev/kou_pg_0131/articles/charm-log-introduction
https://zenn.dev/kou_pg_0131/articles/go-cli-packages

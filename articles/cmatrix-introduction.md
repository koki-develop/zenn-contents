---
title: "cmatrix コマンドでターミナルに文字を降らせる"
emoji: "💻"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["cmatrix", "cli", "terminal"]
published: true
---

普段ターミナルを操作しているとき、特に仕事中などはターミナルに文字を降らせたいケースがよくあると思います。
そんなときに [`cmatrix`](https://www.asty.org/cmatrix/) コマンドを使用すると簡単にターミナルに文字を降らせることができます。

![](/images/cmatrix-introduction/demo.gif)
_`cmatrix` コマンド_

https://www.asty.org/cmatrix/
https://github.com/abishekvashok/cmatrix

この記事では `cmatrix` コマンドのインストール方法や使い方を簡単に紹介します。

# インストール

Homebrew を使用している場合は `brew install` でインストールすることができます。

```console
$ brew install cmatrix
```

Ubuntu であれば `apt install` でインストールすることができます。

```console
$ apt install cmatrix
```

もしくは自分でソースコードからビルドしてインストールすることもできます。
手順については[公式の README](https://github.com/abishekvashok/cmatrix/#floppy_disk-building-and-installing-cmatrix) をご参照ください。

https://github.com/abishekvashok/cmatrix/#floppy_disk-building-and-installing-cmatrix

# 基本的な使い方

基本的には `cmatrix` コマンドをそのまま実行するだけで使用できます。

```console
$ cmatrix
```

![](/images/cmatrix-introduction/demo.gif)
_基本的な使い方_

`Ctrl` + `c` で終了できます。

# オプションを指定する

`cmatrix` コマンドでは様々なオプションが用意されています。

```console
$ cmatrix --help
 Usage: cmatrix -[abBcfhlsmVx] [-u delay] [-C color]
 -a: Asynchronous scroll
 -b: Bold characters on
 -B: All bold characters (overrides -b)
 -c: Use Japanese characters as seen in the original matrix. Requires appropriate fonts
 -f: Force the linux $TERM type to be on
 -l: Linux mode (uses matrix console font)
 -L: Lock mode (can be closed from another terminal)
 -o: Use old-style scrolling
 -h: Print usage and exit
 -n: No bold characters (overrides -b and -B, default)
 -s: "Screensaver" mode, exits on first keystroke
 -x: X window mode, use if your xterm is using mtx.pcf
 -V: Print version information and exit
 -u delay (0 - 10, default 4): Screen update delay
 -C [color]: Use this color for matrix (default green)
 -r: rainbow mode
 -m: lambda mode
```

ここでは表示に関するオプションをいくつか紹介します。

## 文字の色を指定する

`-C` オプションに色を指定することで文字の色を変更することができます。
指定できる色は次のとおりです。

- `green` ( デフォルト )
- `red`
- `blue`
- `white`
- `yellow`
- `cyan`
- `magenta`

次のコマンドは文字の色を赤 ( `red` ) にする例です。

```console
$ cmatrix -C red
```

![](/images/cmatrix-introduction/color.gif)
_文字の色を指定する_

## レインボーモード

`-r` オプションを指定すると文字の色がカラフルになります。

```console
$ cmatrix -r
```

![](/images/cmatrix-introduction/rainbow.gif)
_レインボーモード_

## 流れてくる速度をバラバラにする

通常は全ての文字が同じ速度で流れてきます。
`-a` オプションを指定することでそれぞれの文字が流れてくる速度がバラバラになります。

```console
$ cmatrix -a
```

![](/images/cmatrix-introduction/async.gif)
_流れてくる速度をバラバラにする_

## 流れてくる速度を指定する

`-u` オプションに数値を指定すると文字が流れてくる速度を調整できます。
`0` ~ `10` の値を指定できて、数値が小さい方が速くなります。
デフォルトは `4` です。

:::message
実際には `10` よりも大きい数値を指定できますが、あまり大きすぎる数値を指定すると遅くなりすぎて `Ctrl` + `c` でも中断できなくなるのでやめましょう。
:::

```console
$ cmatrix -u 1
```

![](/images/cmatrix-introduction/fast.gif)
_`1` を指定した場合_

```console
$ cmatrix -u 10
```

![](/images/cmatrix-introduction/slow.gif)
_`10` を指定した場合_

## ラムダモード

場合によっては流れてくる文字を `λ` にしたい事も多々あると思います。
そんなときは `-m` オプションを指定すると流れてくる文字が全て `λ` になります。

![](/images/cmatrix-introduction/lambda.gif)
_ラムダモード_

# まとめ

超便利。

# 参考

https://www.asty.org/cmatrix/
https://github.com/abishekvashok/cmatrix
https://www.engilaboo.com/linux-joke-commands/
https://twitter.com/pupurucom/status/1634004427635056640

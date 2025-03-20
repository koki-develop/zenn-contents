---
title: "Go 言語だって minify されたい！「mingo」の紹介"
emoji: "🐣"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["golang", "cli", "terminal"]
published: true
published_at: 2024-03-11 18:00
---

HTML/CSS や JavaScript など、 Web フロントエンドにおいては配信時にファイルを minify することが一般的です。
ファイルを minify する = ファイルサイズを小さくすることでネットワークの通信量を削減し、結果として Web ページの読み込み速度を向上させることができます。

```html
<!-- 例えばこれが -->
<!DOCTYPE html>
<html>
  <head>
    <title>Hello World Sample</title>
  </head>
  <body>
    <h1>Hello, World!</h1>
    <button id="button">Click</button>
  </body>
  <script>
    const button = document.getElementById("button");
    button.addEventListener("click", function () {
      alert("Clicked!");
    });
  </script>
</html>
```

```html
<!-- こうなる -->
<!DOCTYPE html><html><head><title>Hello World Sample</title></head><body><h1>Hello, World!</h1><button id="button">Click</button></body><script>const button=document.getElementById("button");button.addEventListener("click",function(){alert("Clicked!");});</script></html>
```

このように、 Web フロントエンドではパフォーマンス改善を名目として、さも当然のように日々 minify が行われています。

その一方でずっと誰からも minify してもらえずに泣いている言語があります。
ピンときた方も多いと思いますが、そう、 **Go 言語**です。

ご存知の通り、 Go 言語は基本的に minify されることはありません。

「**コンパイル言語だから minify しても意味ないよw**」
「**どうせビルドしたらバイナリになるんだしw**」

そんなふうに Go 言語は長年 minify してもらえることなくひどい差別を受け続けてきました。
果たしてこんな理不尽を許していいのでしょうか。 Go 言語が minify されることを望むのは間違っているのでしょうか。

**答えは否です。 Go 言語にも minify される権利はあります。**

「*たとえ意味がなくとも、 minify されたい*」

**mingo** はそんな Go 言語の切実な願いを叶えるために生まれたツールです。

https://github.com/koki-develop/mingo

例えば次のような内容の `main.go` があったとします。

```go:main.go
package main

import "fmt"

func fib(n int) int {
	if n <= 1 {
		return n
	}
	return fib(n-1) + fib(n-2)
}

func main() {
	n := 10
	for i := 0; i < n; i++ {
		fmt.Println(fib(i))
	}
}
```

mingo を使ってみましょう。

```sh
# `-w` フラグで上書き
$ mingo -w main.go
```

`main.go` の内容は次のようになりました。

```go:main.go
package main;import "fmt";func fib(n int)int{if n<=1{return n};return fib(n-1)+fib(n-2)};func main(){n:=10;for i:=0;i<n;i++{fmt.Println(fib(i))}};
```

https://youtu.be/3JWTaaS7LdU?t=189

この記事では mingo のインストール方法から基本的な使い方までを紹介します。

- [mingo の使い方](#mingo-の使い方)
  - [インストール](#インストール)
  - [Go プログラムを minify する](#go-プログラムを-minify-する)
- [実行例](#実行例)
- [仕組み](#仕組み)
- [まとめ](#まとめ)

# mingo の使い方

https://github.com/koki-develop/mingo

## インストール

Homebrew を使用している場合は `brew install` でインストールできます。

```sh
$ brew install koki-develop/tap/mingo
```

もしくは `go install` でインストールすることもできます。

```sh
$ go install github.com/koki-develop/mingo@latest
```

## Go プログラムを minify する

`mingo` コマンドにファイルを渡すだけです。
デフォルトでは minify された内容は標準出力に出力され、ファイルは上書きされません。

```sh
$ mingo <ファイル名>

# 例
$ mingo main.go
package main;import "fmt";func fib(n int)int{if n<=1{return n};return fib(n-1)+fib(n-2)};func main(){n:=10;for i:=0;i<n;i++{fmt.Println(fib(i))}};
```

`-w` もしくは `--write` フラグをつけるとファイルを上書きできます。

```sh
$ mingo -w main.go
# これも同じ
$ mingo --write main.go
```

ファイルを複数指定することもできます。

```sh
$ mingo hoge.go fuga.go
```

ディレクトリを指定すると、ディレクトリ内の Go ファイルを再帰的に minify します。

```sh
# ./some_dir/**/*.go を minify する
$ mingo -w ./some_dir
```

次のコマンドを実行すれば、カレントディレクトリ内の全ての Go ファイルを minify できます。

```sh
$ mingo -w .
```

# 実行例

参考までに、 [cLive](https://github.com/koki-develop/clive) に対して mingo を実行した例がこちらです。

https://github.com/koki-develop/clive/pull/128/files

![](/images/mingo-introduction/pr-files.png)
_こんな感じ_

![](/images/mingo-introduction/pr-checks.png =600x)
_test も build も通ってる ( lint はしっかりコケてる )_

:::message

cLive については以下の記事をご参照ください。

- [これでライブコーディングも怖くない！ cLive でターミナル操作を自動化する](https://zenn.dev/kou_pg_0131/articles/clive-introduction)

:::

# 仕組み

これといって特別なことをしているわけではなく、 [`go/ast`](https://pkg.go.dev/go/ast) パッケージで Go の抽象構文木を解析して地道にガリガリ書き換えているだけです。
詳しくはソースコードをご参照ください。

- [mingo/internal/mingo](https://github.com/koki-develop/mingo/tree/main/internal/mingo)

# まとめ

無意味ですね〜。

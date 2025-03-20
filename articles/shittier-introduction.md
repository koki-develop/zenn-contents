---
title: "コードを自動で汚くする整形ツール「Shittier」の紹介"
emoji: "😖"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["javascript", "リファクタリング"]
published: true
published_at: 2024-03-04 18:00
---

# Shittier とは

コードを書くときは、なるべくコードの可読性を下げるために普段から様々な工夫をすることが大切です。

- インデントを揃えない
- 変数や関数などの名前の大文字 / 小文字をランダムにする
- 無駄なスペース / タブ / 改行を追加する

毎回これらを手作業で行うのは大変ですが、そこで便利なのが Shittier です。

https://github.com/rohitdhas/shittier

Shittier はコードを可能な限り汚くすることを目的とした整形ツールです。
どんなにコードが綺麗に整えられたプロジェクトでも、 Shittier を使えば容易に混沌をもたらすことが可能です。

# インストール

npm 経由でインストールできます。

```sh
$ npm install -g shittier
```

```sh
$ shittier --help
Usage: shittier [options] <input> <output>

Options:
      --version  Show version number                                   [boolean]
  -h, --help     Show help                                             [boolean]
  -f, --force    Overwrite the output file if it already exists        [boolean]
```

# 使い方

基本的には `shittier` コマンドにファイル名を渡すだけです。

```sh
$ shittier <ファイル名>
```

デフォルトでは `shittier` コマンドはファイルを上書きしますが、 2 つめの引数に出力先のファイル名を指定することもできます。

```sh
$ shittier <ファイル名> <出力先のファイル名>

# `--force` を指定すると出力先のファイルが既に存在していても上書きする (デフォルトはエラーになる)
$ shittier --force <ファイル名> <出力先のファイル名>
```

# 試してみる

実際に Shittier を試してみます。

`fibonacci.js` という名前で次のようなファイルを作成します。

```js:fibonacci.js
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

それでは Shittier を実行します。

```sh
$ shittier fibonacci.js
Your code has been successfully shittified. 🎉
```

どうなったか確認してみましょう。

```js:fibonacci.js
	 function FiboNaccI	(lenGtH	 ) {
	 let NumS		=		[0		, 1	] ;
	 for	(let i		= 2		; i		< lenGtH		; i		++	 )		{
	NumS		[i ] = NumS  [i	- 1  ]		+ NumS  [i		- 2	]	 ;	}
  return NumS ;	}

		console .log  (FiboNaccI	 (10		)	 )	 ;
	// => [
  //      0, 1,  1,  2,  3,
  //      5, 8, 13, 21, 34
	 //    ]
```

いい感じに汚くなりました。とても読めたものではありません。

もちろんちゃんと動きます。

```sh
$ node fibonacci.js
[
  0, 1,  1,  2,  3,
  5, 8, 13, 21, 34
]
```

# サポートしているファイル形式

v0.1.1 時点では JavaScript のみサポートしています。

```sh
# JavaScript 以外はエラーになる
$ shittier fibonacci.ts
❌ ERROR: Unsupported file type. Only JavaScript files are supported currently.
```

# コミット時に自動で実行する

せっかくなので Husky と lint-staged を使ってコミット時に Shittier が自動で実行されるようにしてみます。

まずは Husky と lint-staged をインストールします。

```sh
$ npm i -D husky lint-staged
```

次に、 lint-staged の設定ファイルを作成します。
`.lintstagedrc.mjs` という名前で次のようなファイルを作成します。

```js:.lintstagedrc.mjs
export default {
  "**/*.js": (filenames) => filenames.map((filename) => `shittier '${filename}'`),
};
```

続いて、次のコマンドを実行して Husky をセットアップします。

```sh
$ npx husky init
```

`.husky/pre-commit` というファイルが作成されているので、内容を次のように書き換えます。

```sh:.husky/pre-commit
npx lint-staged
```

これで設定完了です。
以降、 JavaScript ファイルをコミットした際には自動で Shittier が実行されます。
うっかり誤って綺麗なコードが混ざりこんでしまうことがなくなるので安心です。

:::message

実際にこれらの設定を行ったサンプルのリポジトリがこちらです。

- [koki-develop/shittier-precommit-example](https://github.com/koki-develop/shittier-precommit-example)

:::

# まとめ

僕がいないプロジェクトで使ってください。

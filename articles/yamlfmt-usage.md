---
title: "Google 製 yaml フォーマッター「yamlfmt」を試してみる"
emoji: "📑"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["yaml", "go"]
published: true
---

Google 製の `yamlfmt` なるものを知ったので試しに触ってみました。

https://github.com/google/yamlfmt

# 検証環境

- yamlfmt v0.1.0

# インストール

Go で作られてるので `go install` でインストールできます。

```
$ go install github.com/google/yamlfmt/cmd/yamlfmt@latest
```

# 使い方

`yamlfmt` を実行するだけで yaml ファイルを再帰的に探して ( `**/*.{yaml,yml}` ) フォーマットを実行します。

```
$ yamlfmt
```

例えばカレントディレクトリに次のような `a.yaml` ファイルがある場合、

```yaml:a.yaml
# コメントは保持される
list1:
- item1
- item2
list2: [   item1,   item2   ]
struct: {   key:   value   }
```

`yamlfmt` を実行すると次のようにフォーマットされます。

```yaml:a.yaml
# コメントは保持される
list1:
  - item1
  - item2
list2: [item1, item2]
struct: {key: value}
```

対象のファイルを直接指定することもできます。

```sh
$ yamlfmt a.yaml
# 複数指定したり Glob で指定することも可能
$ yamlfmt a.yaml b.yaml config/**/*.yaml
```

:::message
Glob パスは [bmatcuk/doublestar](https://github.com/bmatcuk/doublestar) パッケージを使用して実装されており、 Go の Glob 実装 ( [path.Match](https://pkg.go.dev/path#Match), [filepath.Glob](https://pkg.go.dev/path/filepath#Glob) ) よりも柔軟な指定が可能だそうです。
詳しくは [bmatcuk/doublestar](https://github.com/bmatcuk/doublestar) のドキュメントをご参照ください。
:::

## `-dry` フラグ

`-dry` フラグを指定すると、実際にはフォーマットを実行せずに実行後の差分を表示してくれます。

```
 yamlfmt -dry
a.yaml:
  string(Inverse(multiline, []string{
        "# コメントは保持される",
        "list1:",
-       "- item1",
+       "  - item1",
-       "- item2",
+       "  - item2",
-       "list2: [   item1,   item2   ]",
+       "list2: [item1, item2]",
-       "struct: {   key:   value   }",
+       "struct: {key: value}",
        "",
  }))
```

## `-lint` フラグ

`-lint` フラグを指定するとフォーマットをかける前後に差分があるかどうかをチェックします。
差分がある場合は該当箇所が表示され、 exit code 1 で終了します。

```
$ yamlfmt -lint
2022/08/23 15:35:18 encountered the following linting errors:
a.yaml:
  string(Inverse(multiline, []string{
        "# コメントは保持される",
        "list1:",
-       "- item1",
+       "  - item1",
-       "- item2",
+       "  - item2",
-       "list2: [   item1,   item2   ]",
+       "list2: [item1, item2]",
-       "struct: {   key:   value   }",
+       "struct: {key: value}",
        "",
  }))

,
```

# 設定

カレントディレクトリに `.yamlfmt` という名前でファイルを作成し、さまざまな設定を記述することができます。

## `include` / `exclude`

`include` にはフォーマット対象に含めるファイルを、 `exclude` には除外するファイルを記述します。

```yaml:.yamlfmt
include:
- config/**/*.{yaml,yml}
exclude:
- excluded/**/*.yaml
```

## `formatter`

`formatter` にはフォーマッターに関する設定を記述することができます。
例えば [Basic Formatter](https://github.com/google/yamlfmt/tree/main/formatters/basic) の場合はインデントレベルを指定することができます。

```yaml:.yamlfmt
formatter:
  # 使用するフォーマッター
  type: basic
  # フォーマッターの設定
  indentation: 4
```

`type` が指定されていない場合はデフォルトのフォーマッター ( [Basic Formatter](https://github.com/google/yamlfmt/tree/main/formatters/basic) ) が使用されます。

:::message
2022年08月23日現在公式で用意されているフォーマッターは [Basic Formatter](https://github.com/google/yamlfmt/tree/main/formatters/basic) のみですが、これから柔軟なフォーマッターが追加されていくようです。
非常に楽しみですね。

@[tweet](https://twitter.com/RageCage64_/status/1561386930054496256)
:::

# その他

[Goals](https://github.com/google/yamlfmt#goals) を見ると、単なる CLI ツールとしてだけではなくライブラリとしての利用も想定されているみたいです。
カスタムフォーマッターを作って拡張したり、 `yamlfmt` を活用した新しいツールを作ったりできそうです。

---
title: "Terraform の組み込み関数一覧"
emoji: "🔧"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["terraform"]
published: true
published_at: 2024-07-08 18:00
publication_name: "terraform_jp"
---

Terraform の組み込み関数の一覧を簡単にまとめました。

https://developer.hashicorp.com/terraform/language/functions

より詳細な使い方やユースケースは公式ドキュメントをご参照ください。

# 動作環境

- Terraform v1.9.0

動作確認には主に `terraform console` を使用しています。
一部の出力結果は見やすいように整形等しています。

# 組み込み関数一覧

:::details Numeric Functions

[Numeric Functions](#numeric-functions)

- [`abs`](#abs)
- [`ceil`](#ceil)
- [`floor`](#floor)
- [`log`](#log)
- [`max`](#max)
- [`min`](#min)
- [`parseint`](#parseint)
- [`pow`](#pow)
- [`signum`](#signum)

:::

:::details String Functions

[String Functions](#string-functions)

- [`chomp`](#chomp)
- [`endswith`](#endswith)
- [`format`](#format)
- [`formatlist`](#formatlist)
- [`indent`](#indent)
- [`join`](#join)
- [`lower`](#lower)
- [`regex`](#regex)
- [`regexall`](#regexall)
- [`replace`](#replace)
- [`split`](#split)
- [`startswith`](#startswith)
- [`strcontains`](#strcontains)
- [`strrev`](#strrev)
- [`substr`](#substr)
- [`templatestring`](#templatestring)
- [`title`](#title)
- [`trim`](#trim)
- [`trimprefix`](#trimprefix)
- [`trimsuffix`](#trimsuffix)
- [`trimspace`](#trimspace)
- [`upper`](#upper)

:::

:::details Collection Functions

[Collection Functions](#collection-functions)

- [`alltrue`](#alltrue)
- [`anytrue`](#anytrue)
- [`chunklist`](#chunklist)
- [`coalesce`](#coalesce)
- [`coalescelist`](#coalescelist)
- [`compact`](#compact)
- [`concat`](#concat)
- [`contains`](#contains)
- [`distinct`](#distinct)
- [`element`](#element)
- [`flatten`](#flatten)
- [`index`](#index)
- [`keys`](#keys)
- [`length`](#length)
- [`list`](#list)
- [`lookup`](#lookup)
- [`map`](#map)
- [`matchkeys`](#matchkeys)
- [`merge`](#merge)
- [`one`](#one)
- [`range`](#range)
- [`reverse`](#reverse)
- [`setintersection`](#setintersection)
- [`setproduct`](#setproduct)
- [`setsubtract`](#setsubtract)
- [`setunion`](#setunion)
- [`slice`](#slice)
- [`sort`](#sort)
- [`sum`](#sum)
- [`transpose`](#transpose)
- [`values`](#values)
- [`zipmap`](#zipmap)

:::

:::details Encoding Functions

[Encoding Functions](#encoding-functions)

- [`base64decode`](#base64decode)
- [`base64encode`](#base64encode)
- [`base64gzip`](#base64gzip)
- [`csvdecode`](#csvdecode)
- [`jsondecode`](#jsondecode)
- [`jsonencode`](#jsonencode)
- [`textdecodebase64`](#textdecodebase64)
- [`textencodebase64`](#textencodebase64)
- [`urlencode`](#urlencode)
- [`yamldecode`](#yamldecode)
- [`yamlencode`](#yamlencode)

:::

:::details Filesystem Functions

[Filesystem Functions](#filesystem-functions)

- [`abspath`](#abspath)
- [`dirname`](#dirname)
- [`pathexpand`](#pathexpand)
- [`basename`](#basename)
- [`file`](#file)
- [`fileexists`](#fileexists)
- [`fileset`](#fileset)
- [`filebase64`](#filebase64)
- [`templatefile`](#templatefile)

:::

:::details Date and Time Functions

[Date and Time Functions](#date-and-time-functions)

- [`formatdate`](#formatdate)
- [`plantimestamp`](#plantimestamp)
- [`timeadd`](#timeadd)
- [`timecmp`](#timecmp)
- [`timestamp`](#timestamp)

:::

:::details Hash and Crypto Functions

[Hash and Crypto Functions](#hash-and-crypto-functions)

- [`base64sha256`](#base64sha256)
- [`base64sha512`](#base64sha512)
- [`bcrypt`](#bcrypt)
- [`filebase64sha256`](#filebase64sha256)
- [`filebase64sha512`](#filebase64sha512)
- [`filemd5`](#filemd5)
- [`filesha1`](#filesha1)
- [`filesha256`](#filesha256)
- [`filesha512`](#filesha512)
- [`md5`](#md5)
- [`rsadecrypt`](#rsadecrypt)
- [`sha1`](#sha1)
- [`sha256`](#sha256)
- [`sha512`](#sha512)
- [`uuid`](#uuid)
- [`uuidv5`](#uuidv5)

:::

:::details IP Network Functions

[IP Network Functions](#ip-network-functions)

- [`cidrhost`](#cidrhost)
- [`cidrnetmask`](#cidrnetmask)
- [`cidrsubnet`](#cidrsubnet)
- [`cidrsubnets`](#cidrsubnets)

:::

:::details Type Conversion Functions

[Type Conversion Functions](#type-conversion-functions)

- [`can`](#can)
- [`issensitive`](#issensitive)
- [`nonsensitive`](#nonsensitive)
- [`sensitive`](#sensitive)
- [`tobool`](#tobool)
- [`tolist`](#tolist)
- [`tomap`](#tomap)
- [`tonumber`](#tonumber)
- [`toset`](#toset)
- [`tostring`](#tostring)
- [`try`](#try)
- [`type`](#type)

:::

:::details Terraform-specific Functions

[Terraform-specific Functions](#terraform-specific-functions)

- [`provider::terraform::encode_tfvars`](#provider%3A%3Aterraform%3A%3Aencode_tfvars)
- [`provider::terraform::decode_tfvars`](#provider%3A%3Aterraform%3A%3Adecode_tfvars)
- [`provider::terraform::encode_expr`](#provider%3A%3Aterraform%3A%3Aencode_expr)

:::

## Numeric Functions

- [`abs`](#abs)
- [`ceil`](#ceil)
- [`floor`](#floor)
- [`log`](#log)
- [`max`](#max)
- [`min`](#min)
- [`parseint`](#parseint)
- [`pow`](#pow)
- [`signum`](#signum)

### `abs`

受け取った数値の絶対値を返します。

```hcl:terraform console
> abs(10)
10

> abs(-10)
10

> abs(0)
0
```

https://developer.hashicorp.com/terraform/language/functions/abs

### `ceil`

受け取った数値の少数点以下を切り上げた整数を返します。

```hcl:terraform console
> ceil(1.1)
2

> ceil(1.9)
2

> ceil(1)
1
```

https://developer.hashicorp.com/terraform/language/functions/ceil

### `floor`

受け取った数値の少数点以下を切り捨てた整数を返します。

```hcl:terraform console
> floor(1.1)
1

> floor(1.9)
1

> floor(1)
1
```

https://developer.hashicorp.com/terraform/language/functions/floor

### `log`

受け取った数値の対数を指定した底で計算した結果を返します。

```hcl:terraform console
# 10 を底とする 100 の対数
> log(100, 10)
2

# 2 を底とする 100 の対数
> log(100, 2)
6.643856189774725
```

https://developer.hashicorp.com/terraform/language/functions/log

### `max`

受け取った数値のうち、最大の数値を返します。

```hcl:terraform console
> max(1)
1

> max(1, 100)
100

> max(1, 100, 3)
100
```

https://developer.hashicorp.com/terraform/language/functions/max

### `min`

受け取った数値のうち、最小の数値を返します。

```hcl:terraform console
> min(1)
1

> min(1, 100)
1

> min(1, 100, 3)
1
```

https://developer.hashicorp.com/terraform/language/functions/min

### `parseint`

受け取った文字列を指定した基数で解釈した数値を返します。

```hcl:terraform console
# "10" を 10 進数として解釈
> parseint("10", 10)
10

# "FF" を 16 進数として解釈
> parseint("FF", 16)
255

# "100" を 2 進数として解釈
> parseint("100", 2)
4
```

https://developer.hashicorp.com/terraform/language/functions/parseint

### `pow`

受け取った基数を指定した指数で累乗した結果を返します。

```hcl:terraform console
# 2 の 3 乗
> pow(2, 3)
8

# 10 の 2 乗
> pow(10, 2)
100
```

https://developer.hashicorp.com/terraform/language/functions/pow

### `signum`

受け取った数値の符号 ( 1, 0, -1 ) を返します。

```hcl:terraform console
# 正の数のときは 1
> signum(10)
1

# 0 のときは 0
> signum(0)
0

# 負の数のときは -1
> signum(-10)
-1
```

https://developer.hashicorp.com/terraform/language/functions/signum

## String Functions

- [`chomp`](#chomp)
- [`endswith`](#endswith)
- [`format`](#format)
- [`formatlist`](#formatlist)
- [`indent`](#indent)
- [`join`](#join)
- [`lower`](#lower)
- [`regex`](#regex)
- [`regexall`](#regexall)
- [`replace`](#replace)
- [`split`](#split)
- [`startswith`](#startswith)
- [`strcontains`](#strcontains)
- [`strrev`](#strrev)
- [`substr`](#substr)
- [`templatestring`](#templatestring)
- [`title`](#title)
- [`trim`](#trim)
- [`trimprefix`](#trimprefix)
- [`trimsuffix`](#trimsuffix)
- [`trimspace`](#trimspace)
- [`upper`](#upper)

### `chomp`

受け取った文字列の末尾の改行文字を削除して返します。

```hcl:terraform console
> chomp("hello\n")
"hello"

> chomp("hello\r\n")
"hello"

> chomp("hello\n\n\n")
"hello"

> chomp("hello")
"hello"
```

https://developer.hashicorp.com/terraform/language/functions/chomp

### `endswith`

受け取った文字列が指定した文字列で終わっているかどうかを返します。

```hcl:terraform console
> endswith("hello world", "world")
true

> endswith("hello world", "hello")
false
```

https://developer.hashicorp.com/terraform/language/functions/endswith

### `format`

受け取ったフォーマット文字列に従って文字列を生成します。

```hcl:terraform console
> format("Hello, %s", "world")
"Hello, world"

> format("Hello, %s %d", "world", 2022)
"Hello, world 2022"
```

https://developer.hashicorp.com/terraform/language/functions/format

### `formatlist`

リストの各要素に対してフォーマット文字列に従って文字列を生成します。

```hcl:terraform console
> formatlist("Hello, %s", ["a", "b", "c"])
[
  "Hello, a",
  "Hello, b",
  "Hello, c",
]
```

https://developer.hashicorp.com/terraform/language/functions/formatlist

### `indent`

複数行の文字列に対して、最初の行を除く全ての行の先頭に指定した数のスペースを追加して返します。

```hcl:terraform console
# 2 行目以降に 2 つのスペースが追加される
> indent(2, "first\nsecond\nthird")
first
  second
  third
```

https://developer.hashicorp.com/terraform/language/functions/indent

### `join`

指定した区切り文字でリストの各要素を連結した文字列を返します。

```hcl:terraform console
> join(",", ["a", "b", "c"])
"a,b,c"

> join(",", ["a"])
"a"
```

https://developer.hashicorp.com/terraform/language/functions/join

### `lower`

受け取った文字列を全て小文字に変換して返します。

```hcl:terraform console
> lower("HELLO")
"hello"

> lower("Hello")
"hello"
```

https://developer.hashicorp.com/terraform/language/functions/lower

### `regex`

正規表現に一致する部分文字列を返します。

```hcl:terraform console
> regex("[a-z]+", "abc123")
"abc"

> regex("[a-z]+", "abc123def")
"abc"

> regex("(\\d{4})-(\\d{2})-(\\d{2})", "2022-01-01")
[
  "2022",
  "01",
  "01",
]
```

https://developer.hashicorp.com/terraform/language/functions/regex

### `regexall`

正規表現に一致する部分文字列のリストを返します。

```hcl:terraform console
> regexall("[a-z]+", "abc123")
[
  "abc",
]

> regexall("[a-z]+", "abc123def")
[
  "abc",
  "def",
]

> regexall("(\\d{4})-(\\d{2})-(\\d{2})", "2022-01-01")
[
  [
    "2022",
    "01",
    "01",
  ],
]
```

https://developer.hashicorp.com/terraform/language/functions/regexall

### `replace`

指定した文字列を別の文字列に置換して返します。

```hcl:terraform console
> replace("hello world", "world", "terraform")
"hello terraform"

> replace("hello world", " world", "")
"hello"
```

https://developer.hashicorp.com/terraform/language/functions/replace

### `split`

指定した区切り文字で文字列を分割したリストを返します。

```hcl:terraform console
> split(",", "a,b,c")
[
  "a",
  "b",
  "c",
]

> split(",", "a")
[
  "a",
]
```

https://developer.hashicorp.com/terraform/language/functions/split

### `startswith`

受け取った文字列が指定した文字列で始まっているかどうかを返します。

```hcl:terraform console
> startswith("hello world", "hello")
true

> startswith("hello world", "world")
false
```

https://developer.hashicorp.com/terraform/language/functions/startswith

### `strcontains`

受け取った文字列が指定した文字列を含んでいるかどうかを返します。

```hcl:terraform console
> strcontains("hello world", "world")
true

> strcontains("hello world", "terraform")
false
```

https://developer.hashicorp.com/terraform/language/functions/strcontains

### `strrev`

受け取った文字列を逆順にして返します。

```hcl:terraform console
> strrev("hello")
"olleh"
```

https://developer.hashicorp.com/terraform/language/functions/strrev

### `substr`

指定した位置から指定した長さの部分文字列を返します。

```hcl:terraform console
# 0 番目から 5 文字目までの部分文字列を返す
> substr("hello world", 0, 5)
"hello"

# 6 番目から 5 文字目までの部分文字列を返す
> substr("hello world", 6, 5)
"world"
```

https://developer.hashicorp.com/terraform/language/functions/substr

### `templatestring`

指定した文字列をテンプレートとして解釈し、変数を展開した文字列を返します。

```hcl:example.tf
locals {
  template = "hello, $${name}"
}

output "result" {
  value = templatestring(local.template, { name = "world" })
  # => "hello, world"
}
```

文字列リテラルを直接テンプレートとして渡すことはできません。

```hcl:terraform console
> templatestring("hello, $${name}", { name = "world" })
╷
│ Error: Invalid function argument
│
│   on <console-input> line 1:
│   (source code not available)
│
│ Invalid value for "template" parameter: invalid template expression: templatestring is only for rendering templates
│ retrieved dynamically from elsewhere, and so does not support providing a literal template; consider using a
│ template string expression instead.
╵
```

https://developer.hashicorp.com/terraform/language/functions/templatestring

### `title`

受け取った文字列の各単語の先頭文字を大文字にして返します。

```hcl:terraform console
> title("hello world")
"Hello World"
```

https://developer.hashicorp.com/terraform/language/functions/title

### `trim`

受け取った文字列の両端から指定した文字列を削除して返します。

```hcl:terraform console
> trim("  hello world  ", " ")
"hello world"

> trim("!?hello world?!", "!?")
"hello world"
```

https://developer.hashicorp.com/terraform/language/functions/trim

### `trimprefix`

受け取った文字列の先頭から指定した文字列を削除して返します。

```hcl:terraform console
> trimprefix("hello world", "hello ")
"world"
```

https://developer.hashicorp.com/terraform/language/functions/trimprefix

### `trimsuffix`

受け取った文字列の末尾から指定した文字列を削除して返します。

```hcl:terraform console
> trimsuffix("hello world", " world")
"hello"
```

https://developer.hashicorp.com/terraform/language/functions/trimsuffix

### `trimspace`

受け取った文字列の両端から空白文字を削除して返します。

```hcl:terraform console
> trimspace("  hello world\n\t")
"hello world"
```

https://developer.hashicorp.com/terraform/language/functions/trimspace

### `upper`

受け取った文字列を全て大文字にして返します。

```hcl:terraform console
> upper("hello world")
"HELLO WORLD"
```

https://developer.hashicorp.com/terraform/language/functions/upper

## Collection Functions

- [`alltrue`](#alltrue)
- [`anytrue`](#anytrue)
- [`chunklist`](#chunklist)
- [`coalesce`](#coalesce)
- [`coalescelist`](#coalescelist)
- [`compact`](#compact)
- [`concat`](#concat)
- [`contains`](#contains)
- [`distinct`](#distinct)
- [`element`](#element)
- [`flatten`](#flatten)
- [`index`](#index)
- [`keys`](#keys)
- [`length`](#length)
- [`list`](#list)
- [`lookup`](#lookup)
- [`map`](#map)
- [`matchkeys`](#matchkeys)
- [`merge`](#merge)
- [`one`](#one)
- [`range`](#range)
- [`reverse`](#reverse)
- [`setintersection`](#setintersection)
- [`setproduct`](#setproduct)
- [`setsubtract`](#setsubtract)
- [`setunion`](#setunion)
- [`slice`](#slice)
- [`sort`](#sort)
- [`sum`](#sum)
- [`transpose`](#transpose)
- [`values`](#values)
- [`zipmap`](#zipmap)

### `alltrue`

受け取ったリストの全ての要素が `true` もしくは `"true"` である場合に `true` を返します。

```hcl:terraform console
> alltrue([true, "true", true])
true

> alltrue([true, false, true])
false

# 空のリストは true を返す
> alltrue([])
true
```

https://developer.hashicorp.com/terraform/language/functions/alltrue

### `anytrue`

受け取ったリストのいずれかの要素が `true` もしくは `"true"` である場合に `true` を返します。

```hcl:terraform console
> anytrue([true, false, false])
true

> anytrue(["true", false, false])
true

> anytrue([false, false, false])
false

# 空のリストは false を返す
> anytrue([])
false
```

https://developer.hashicorp.com/terraform/language/functions/anytrue

### `chunklist`

受け取ったリストを指定したサイズで分割して返します。

```hcl:terraform console
> chunklist(["a", "b", "c", "d", "e"], 2)
[
  [
    "a",
    "b",
  ],
  [
    "c",
    "d",
  ],
  [
    "e",
  ],
]

> chunklist(["a", "b", "c", "d", "e"], 1)
[
  [
    "a",
  ],
  [
    "b",
  ],
  [
    "c",
  ],
  [
    "d",
  ],
  [
    "e",
  ],
]
```

https://developer.hashicorp.com/terraform/language/functions/chunklist

### `coalesce`

受け取った値のうち、 `""` ( 空文字 ) でも `null` でもない最初の値を返します。

```hcl:terraform console
> coalesce("a", "b", "c")
"a"

> coalesce("", "b", "c")
"b"

> coalesce("", null, "c")
"c"

> coalesce(null, 1, 2)
1
```

https://developer.hashicorp.com/terraform/language/functions/coalesce

### `coalescelist`

受け取ったリストのうち、空でない最初のリストを返します。

```hcl:terraform console
> coalescelist(["a", "b"], ["c", "d"])
[
  "a",
  "b",
]

> coalescelist([], ["c", "d"])
[
  "c",
  "d",
]
```

https://developer.hashicorp.com/terraform/language/functions/coalescelist

### `compact`

受け取った文字列リストから `""` ( 空文字 ) や `null` を削除して返します。

```hcl:terraform console
> compact(["a", "", "b", null, "c"])
[
  "a",
  "b",
  "c",
]
```

https://developer.hashicorp.com/terraform/language/functions/compact

### `concat`

受け取ったリストを結合して返します。

```hcl:terraform console
> concat(["a", "b"], ["c", "d"])
[
  "a",
  "b",
  "c",
  "d",
]
```

https://developer.hashicorp.com/terraform/language/functions/concat

### `contains`

受け取ったリストに指定した値が含まれている場合に `true` を返します。

```hcl:terraform console
> contains(["a", "b", "c"], "b")
true

> contains(["a", "b", "c"], "d")
false
```

https://developer.hashicorp.com/terraform/language/functions/contains

### `distinct`

受け取ったリストから重複する要素を削除して返します。

```hcl:terraform console
> distinct(["a", "b", "a", "c", "b"])
[
  "a",
  "b",
  "c",
]

> distinct([1, 2, 1, 3, 2])
[
  1,
  2,
  3,
]
```

https://developer.hashicorp.com/terraform/language/functions/distinct

### `element`

受け取ったリストから指定したインデックスの要素を返します。

```hcl:terraform console
> element(["a", "b", "c"], 0)
"a"

> element(["a", "b", "c"], 1)
"b"
```

https://developer.hashicorp.com/terraform/language/functions/element

### `flatten`

受け取ったリストを平坦化して返します。

```hcl:terraform console
> flatten([["a", "b"], ["c", "d"]])
[
  "a",
  "b",
  "c",
  "d",
]
```

https://developer.hashicorp.com/terraform/language/functions/flatten

### `index`

受け取ったリストから指定した値のインデックスを返します。
見つからなかった場合はエラーになります。

```hcl:terraform console
> index(["a", "b", "c"], "b")
1

> index(["a", "b", "c"], "d")
╷
│ Error: Error in function call
│
│   on <console-input> line 1:
│   (source code not available)
│
│ Call to function "index" failed: item not found.
╵
```

https://developer.hashicorp.com/terraform/language/functions/index_function

### `keys`

受け取ったマップのキーのリストを返します。

```hcl:terraform console
> keys({ a = 1, b = 2, c = 3 })
[
  "a",
  "b",
  "c",
]
```

https://developer.hashicorp.com/terraform/language/functions/keys

### `length`

受け取ったリストの長さを返します。

```hcl:terraform console
> length([])
0

> length(["a", "b", "c"])
3
```

https://developer.hashicorp.com/terraform/language/functions/length

### `list`

現在は使用できません。

https://developer.hashicorp.com/terraform/language/functions/list

### `lookup`

受け取ったマップから指定したキーの値を返します。

```hcl:terraform console
> lookup({ a = 1, b = 2, c = 3 }, "b")
2

# キーが見つからなかったときのデフォルト値を指定できる
> lookup({ a = 1, b = 2, c = 3 }, "d", "default")
"default"
```

https://developer.hashicorp.com/terraform/language/functions/lookup

### `map`

現在は使用できません。

https://developer.hashicorp.com/terraform/language/functions/map

### `matchkeys`

受け取った複数のリストから対応するインデックスが一致する要素のサブセットを取り、新しいリストを作成して返します。

```hcl:terraform console
> matchkeys(["a", "b", "c"], ["x", "y", "z"], ["y", "z"])
[
  "b",
  "c",
]
```

https://developer.hashicorp.com/terraform/language/functions/matchkeys

### `merge`

受け取った複数のマップをマージして返します。

```hcl:terraform console
> merge({ a = 1, b = 2 }, { b = 3, c = 4 })
{
  "a" = 1
  "b" = 3
  "c" = 4
}
```

https://developer.hashicorp.com/terraform/language/functions/merge

### `one`

受け取ったリストの最初の要素を返します。
リストが空の場合は `null` を返し、要素が 2 つ以上ある場合はエラーになります。

```hcl:terraform console
> one([1])
1

> one([])
null

> one([1, 2])
╷
│ Error: Invalid function argument
│
│   on <console-input> line 1:
│   (source code not available)
│
│ Invalid value for "list" parameter: must be a list, set, or tuple value with either zero or one elements.
╵
```

https://developer.hashicorp.com/terraform/language/functions/one

### `range`

指定した範囲の整数のリストを返します。

```hcl:terraform console
> range(3)
[
  0,
  1,
  2,
]

> range(1, 4)
[
  1,
  2,
  3,
]

# ステップを指定することもできる
> range(1, 6, 2)
[
  1,
  3,
  5,
]
```

https://developer.hashicorp.com/terraform/language/functions/range

### `reverse`

受け取ったリストを逆順にして返します。

```hcl:terraform console
> reverse(["a", "b", "c"])
[
  "c",
  "b",
  "a",
]
```

https://developer.hashicorp.com/terraform/language/functions/reverse

### `setintersection`

受け取った複数のセットの共通部分を返します。

```hcl:terraform console
> setintersection(["a", "b", "c"], ["b", "c", "d"])
[
  "b",
  "c",
]

> setintersection(["a", "b", "c"], ["b", "c", "d"], ["c", "d", "e"])
[
  "c",
]
```

https://developer.hashicorp.com/terraform/language/functions/setintersection

### `setproduct`

受け取った複数のセットの直積を返します。

```hcl:terraform console
> setproduct(["a", "b"], ["1", "2"])
[
  [
    "a",
    "1",
  ],
  [
    "a",
    "2",
  ],
  [
    "b",
    "1",
  ],
  [
    "b",
    "2",
  ],
]
```

https://developer.hashicorp.com/terraform/language/functions/setproduct

### `setsubtract`

最初のセットから 2 番目のセットの要素を取り除いたセットを返します。

```hcl:terraform console
> setsubtract(["a", "b", "c"], ["a", "c"])
[
  "b",
]
```

https://developer.hashicorp.com/terraform/language/functions/setsubtract

### `setunion`

受け取った複数のセットを結合して返します。

```hcl:terraform console
> setunion(["a", "b"], ["b", "c"], ["c", "d"])
[
  "a",
  "b",
  "c",
  "d",
]
```

https://developer.hashicorp.com/terraform/language/functions/setunion

### `slice`

指定した範囲の要素を取り出して新しいリストを返します。

```hcl:terraform console
> slice(["a", "b", "c", "d"], 1, 3)
[
  "b",
  "c",
]
```

https://developer.hashicorp.com/terraform/language/functions/slice

### `sort`

受け取った文字列リストをソートして返します。

```hcl:terraform console
> sort(["c", "a", "b"])
[
  "a",
  "b",
  "c",
]
```

https://developer.hashicorp.com/terraform/language/functions/sort

### `sum`

受け取った数値リストの合計を返します。

```hcl:terraform console
> sum([1, 2, 3])
6
```

https://developer.hashicorp.com/terraform/language/functions/sum

### `transpose`

受け取った文字列リストのマップのキーと値を入れ替えて返します。

```hcl:terraform console
> transpose({ a = ["1", "2"], b = ["2", "3"] })
{
  "1" = [
    "a",
  ]
  "2" = [
    "a",
    "b",
  ]
  "3" = [
    "b",
  ]
}
```

https://developer.hashicorp.com/terraform/language/functions/transpose

### `values`

受け取ったマップの値のリストを返します。

```hcl:terraform console
> values({ a = 1, b = 2 })
[
  1,
  2,
]
```

https://developer.hashicorp.com/terraform/language/functions/values

### `zipmap`

キーのリストと値のリストを受け取り、マップに変換して返します。

```hcl:terraform console
> zipmap(["a", "b"], [1, 2])
{
  "a" = 1
  "b" = 2
}
```

https://developer.hashicorp.com/terraform/language/functions/zipmap

## Encoding Functions

- [`base64decode`](#base64decode)
- [`base64encode`](#base64encode)
- [`base64gzip`](#base64gzip)
- [`csvdecode`](#csvdecode)
- [`jsondecode`](#jsondecode)
- [`jsonencode`](#jsonencode)
- [`textdecodebase64`](#textdecodebase64)
- [`textencodebase64`](#textencodebase64)
- [`urlencode`](#urlencode)
- [`yamldecode`](#yamldecode)
- [`yamlencode`](#yamlencode)

### `base64decode`

受け取った Base64 エンコードされた文字列をデコードして返します。

```hcl:terraform console
> base64decode("SGVsbG8gV29ybGQ=")
"Hello World"
```

https://developer.hashicorp.com/terraform/language/functions/base64decode

### `base64encode`

受け取った文字列を Base64 エンコードして返します。

```hcl:terraform console
> base64encode("Hello World")
"SGVsbG8gV29ybGQ="
```

https://developer.hashicorp.com/terraform/language/functions/base64encode

### `base64gzip`

受け取った文字列を GZIP 圧縮して Base64 エンコードして返します。

```hcl:terraform console
> base64gzip("Hello World")
"H4sIAAAAAAAA//JIzcnJVwjPL8pJAQAAAP//AQAA//9WsRdKCwAAAA=="
```

https://developer.hashicorp.com/terraform/language/functions/base64gzip

### `csvdecode`

受け取った CSV 形式の文字列をデコードして返します。

```hcl:terraform console
> csvdecode("a,b,c\n1,2,3\n4,5,6")
[
  {
    "a" = "1"
    "b" = "2"
    "c" = "3"
  },
  {
    "a" = "4"
    "b" = "5"
    "c" = "6"
  },
]
```

https://developer.hashicorp.com/terraform/language/functions/csvdecode

### `jsondecode`

受け取った JSON 形式の文字列をデコードして返します。

```hcl:terraform console
> jsondecode("{\"a\": 1, \"b\": 2}")
{
  "a" = 1
  "b" = 2
}
```

https://developer.hashicorp.com/terraform/language/functions/jsondecode

### `jsonencode`

受け取った値を JSON 形式の文字列にエンコードして返します。

```hcl:terraform console
> jsonencode({ a = 1, b = 2 })
"{\"a\":1,\"b\":2}"
```

https://developer.hashicorp.com/terraform/language/functions/jsonencode

### `textdecodebase64`

Base64 エンコードされた文字列をデコードして返します。
デコード後の文字列は指定した文字コードでエンコードされているものとして扱われます。

```hcl:terraform console
> textdecodebase64("SABlAGwAbABvACAAVwBvAHIAbABkAA==", "UTF-16LE")
"Hello World"
```

https://developer.hashicorp.com/terraform/language/functions/textdecodebase64

### `textencodebase64`

受け取った文字列を Base64 エンコードして返します。
エンコード後の文字列は指定した文字コードでエンコードされているものとして扱われます。

```hcl:terraform console
> textencodebase64("Hello World", "UTF-16LE")
"SABlAGwAbABvACAAVwBvAHIAbABkAA=="
```

https://developer.hashicorp.com/terraform/language/functions/textencodebase64

### `urlencode`

受け取った文字列を URL エンコードして返します。

```hcl:terraform console
> urlencode("Hello World")
"Hello+World"

> urlencode("こんにちは")
"%E3%81%93%E3%82%93%E3%81%AB%E3%81%A1%E3%81%AF"
```

https://developer.hashicorp.com/terraform/language/functions/urlencode

### `yamldecode`

受け取った YAML 形式の文字列をデコードして返します。

```hcl:terraform console
> yamldecode("a: 1\nb: 2")
{
  "a" = 1
  "b" = 2
}
```

https://developer.hashicorp.com/terraform/language/functions/yamldecode

### `yamlencode`

受け取った値を YAML 形式の文字列にエンコードして返します。

```hcl:terraform console
> yamlencode({ a = 1, b = 2 })
"a": 1
"b": 2
```

https://developer.hashicorp.com/terraform/language/functions/yamlencode

## Filesystem Functions

- [`abspath`](#abspath)
- [`dirname`](#dirname)
- [`pathexpand`](#pathexpand)
- [`basename`](#basename)
- [`file`](#file)
- [`fileexists`](#fileexists)
- [`fileset`](#fileset)
- [`filebase64`](#filebase64)
- [`templatefile`](#templatefile)

### `abspath`

指定したパスを絶対パスに変換して返します。

```hcl:terraform console
> abspath("foo/bar")
"/Users/username/foo/bar"

> abspath("/foo/bar")
"/foo/bar"
```

https://developer.hashicorp.com/terraform/language/functions/abspath

### `dirname`

指定したパスのディレクトリ部分を返します。

```hcl:terraform console
> dirname("foo/bar")
"foo"

> dirname("foo/bar/")
"foo/bar"

> dirname("foo/bar/hoge")
"foo/bar"
```

https://developer.hashicorp.com/terraform/language/functions/dirname

### `pathexpand`

`~` で始まるパスをユーザーのホームディレクトリに展開して返します。

```hcl:terraform console
> pathexpand("~/foo")
"/Users/username/foo"

> pathexpand("foo/bar")
"foo/bar"
```

https://developer.hashicorp.com/terraform/language/functions/pathexpand

### `basename`

指定したパスのベース名を返します。

```hcl:terraform console
> basename("foo/bar")
"bar"

> basename("foo/bar/")
"bar"

> basename("foo/bar/hoge")
"hoge"
```

https://developer.hashicorp.com/terraform/language/functions/basename

### `file`

指定したファイルの内容を返します。

```hcl:terraform console
> file("foo.txt")
"Hello World"
```

https://developer.hashicorp.com/terraform/language/functions/file

### `fileexists`

指定したファイルが存在するかどうかを返します。

```hcl:terraform console
> fileexists("foo.txt")
true

> fileexists("bar.txt")
false
```

https://developer.hashicorp.com/terraform/language/functions/fileexists

### `fileset`

指定したパスとパターンに一致するファイル名のリストを返します。

```hcl:terraform console
> fileset(path.module, "*.txt")
[
  "foo.txt",
  "bar.txt"
]

> fileset(path.module, "files/*.txt")
[
  "files/foo.txt",
  "files/bar.txt"
]
```

https://developer.hashicorp.com/terraform/language/functions/fileset

### `filebase64`

指定したファイルの内容を Base64 エンコードして返します。

```hcl:terraform console
> filebase64("foo.txt")
"SGVsbG8gV29ybGQ="
```

https://developer.hashicorp.com/terraform/language/functions/filebase64

### `templatefile`

指定したファイルをテンプレートとして処理し、変数を埋め込んだ結果を返します。

```:hello.tpl
Hello ${name}
```

```hcl:terraform console
> templatefile("hello.tpl", { name = "World" })
"Hello World"
```

https://developer.hashicorp.com/terraform/language/functions/templatefile

## Date and Time Functions

- [`formatdate`](#formatdate)
- [`plantimestamp`](#plantimestamp)
- [`timeadd`](#timeadd)
- [`timecmp`](#timecmp)
- [`timestamp`](#timestamp)

### `formatdate`

指定したフォーマットで日付をフォーマットして返します。

```hcl:terraform console
> formatdate("YYYY-MM-DD", "1998-01-31T09:30:20Z")
"1998-01-31"

> formatdate("YYYY-MM-DD hh:mm:ss", "1998-01-31T09:30:20Z")
"1998-01-31 09:30:20"
```

https://developer.hashicorp.com/terraform/language/functions/formatdate

### `plantimestamp`

`terraform plan` 実行時のタイムスタンプを返します。

```hcl:example.tf
output "result" {
  value = plantimestamp()
  # => "2024-06-29T12:01:11Z"
}
```

https://developer.hashicorp.com/terraform/language/functions/plantimestamp

### `timeadd`

指定した時間を加算して返します。

```hcl:terraform console
> timeadd("2021-09-01T00:00:00Z", "30m")
"2021-09-01T00:30:00Z"

> timeadd("2021-09-01T00:00:00Z", "1h")
"2021-09-01T01:00:00Z"
```

https://developer.hashicorp.com/terraform/language/functions/timeadd

### `timecmp`

指定した時間を比較して返します。

```hcl:terraform console
# 0: 同じ
> timecmp("2021-09-01T00:00:00Z", "2021-09-01T00:00:00Z")
0

# -1: 左の方が過去
> timecmp("2021-09-01T00:00:00Z", "2021-09-01T00:30:00Z")
-1

# 1: 右の方が過去
> timecmp("2021-09-01T00:30:00Z", "2021-09-01T00:00:00Z")
1
```

https://developer.hashicorp.com/terraform/language/functions/timecmp

### `timestamp`

現在のタイムスタンプを返します。

```hcl:terraform console
> timestamp()
"2024-06-29T08:29:27Z"
```

https://developer.hashicorp.com/terraform/language/functions/timestamp

## Hash and Crypto Functions

- [`base64sha256`](#base64sha256)
- [`base64sha512`](#base64sha512)
- [`bcrypt`](#bcrypt)
- [`filebase64sha256`](#filebase64sha256)
- [`filebase64sha512`](#filebase64sha512)
- [`filemd5`](#filemd5)
- [`filesha1`](#filesha1)
- [`filesha256`](#filesha256)
- [`filesha512`](#filesha512)
- [`md5`](#md5)
- [`rsadecrypt`](#rsadecrypt)
- [`sha1`](#sha1)
- [`sha256`](#sha256)
- [`sha512`](#sha512)
- [`uuid`](#uuid)
- [`uuidv5`](#uuidv5)

### `base64sha256`

指定した文字列の SHA-256 ハッシュを Base64 エンコードして返します。

```hcl:terraform console
> base64sha256("hello world")
"uU0nuZNNPgilLlLX2n2r+sSE7+N6U4DukIj3rOLvzek="
```

https://developer.hashicorp.com/terraform/language/functions/base64sha256

### `base64sha512`

指定した文字列の SHA-512 ハッシュを Base64 エンコードして返します。

```hcl:terraform console
> base64sha512("hello world")
"MJ7MSJwS1utMxA9QyQLytNDtd+5RGnx6m808qG1M2G+YndNbxf9JlnDaNCVbRbDP2DDoH2Bdz33FVC6TrpzXbw=="
```

https://developer.hashicorp.com/terraform/language/functions/base64sha512

### `bcrypt`

指定した文字列を bcrypt でハッシュ化して返します。

```hcl:terraform console
> bcrypt("hello world")
"$2a$10$LF99X3qgYdtk.zsymxga5eXBy33fW0MbwEwhO3IOgcQzsNbGWIEzm"

# コストを指定することもできる (デフォルトは 10)
> bcrypt("hello world", 12)
"$2a$12$AY/ORDQ7ELYk0AybyMZJVuMq9239wNindxx73wb1KxaGCRXtMFQgO"
```

https://developer.hashicorp.com/terraform/language/functions/bcrypt

### `filebase64sha256`

指定したファイルの内容の SHA-256 ハッシュを Base64 エンコードして返します。

```hcl:terraform console
> filebase64sha256("foo.txt")
"uU0nuZNNPgilLlLX2n2r+sSE7+N6U4DukIj3rOLvzek="
```

https://developer.hashicorp.com/terraform/language/functions/filebase64sha256

### `filebase64sha512`

指定したファイルの内容の SHA-512 ハッシュを Base64 エンコードして返します。

```hcl:terraform console
> filebase64sha512("foo.txt")
"LHT9F+2v2A6ER7DUZ0HuJDt+t03SFJoKsbkkb7MDgvJ+hT2FhXGeDmfL2g2qj1FnEGRhXWRa4nrLFb+xRH9Fmw=="
```

https://developer.hashicorp.com/terraform/language/functions/filebase64sha512

### `filemd5`

指定したファイルの内容の MD5 ハッシュを返します。

```hcl:terraform console
> filemd5("foo.txt")
"b10a8db164e0754105b7a99be72e3fe5"
```

https://developer.hashicorp.com/terraform/language/functions/filemd5

### `filesha1`

指定したファイルの内容の SHA-1 ハッシュを返します。

```hcl:terraform console
> filesha1("foo.txt")
"0a4d55a8d778e5022fab701977c5d840bbc486d0"
```

https://developer.hashicorp.com/terraform/language/functions/filesha1

### `filesha256`

指定したファイルの内容の SHA-256 ハッシュを返します。

```hcl:terraform console
> filesha256("foo.txt")
"a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e"
```

https://developer.hashicorp.com/terraform/language/functions/filesha256

### `filesha512`

指定したファイルの内容の SHA-512 ハッシュを返します。

```hcl:terraform console
> filesha512("foo.txt")
"2c74fd17edafd80e8447b0d46741ee243b7eb74dd2149a0ab1b9246fb30382f27e853d8585719e0e67cbda0daa8f51671064615d645ae27acb15bfb1447f459b"
```

https://developer.hashicorp.com/terraform/language/functions/filesha512

### `md5`

指定した文字列の MD5 ハッシュを返します。

```hcl:terraform console
> md5("Hello World")
"b10a8db164e0754105b7a99be72e3fe5"
```

https://developer.hashicorp.com/terraform/language/functions/md5

### `rsadecrypt`

指定した RSA 秘密鍵で暗号化されたデータを復号します。

```hcl:terraform console
> rsadecrypt(filebase64("foo.txt.enc"), file("private_key.pem"))
"Hello World"
```

https://developer.hashicorp.com/terraform/language/functions/rsadecrypt

### `sha1`

指定した文字列の SHA-1 ハッシュを返します。

```hcl:terraform console
> sha1("Hello World")
"0a4d55a8d778e5022fab701977c5d840bbc486d0"
```

https://developer.hashicorp.com/terraform/language/functions/sha1

### `sha256`

指定した文字列の SHA-256 ハッシュを返します。

```hcl:terraform console
> sha256("Hello World")
"a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e"
```

https://developer.hashicorp.com/terraform/language/functions/sha256

### `sha512`

指定した文字列の SHA-512 ハッシュを返します。

```hcl:terraform console
> sha512("Hello World")
"2c74fd17edafd80e8447b0d46741ee243b7eb74dd2149a0ab1b9246fb30382f27e853d8585719e0e67cbda0daa8f51671064615d645ae27acb15bfb1447f459b"
```

https://developer.hashicorp.com/terraform/language/functions/sha512

### `uuid`

ランダムな UUID を生成します。

```hcl:terraform console
> uuid()
"48672f02-9d83-b4f9-d0fb-46fb946122bc"
```

https://developer.hashicorp.com/terraform/language/functions/uuid

### `uuidv5`

指定した名前と名前空間から生成された UUID を返します。

```hcl:terraform console
> uuidv5("dns", "www.terraform.io")
"a5008fae-b28c-5ba5-96cd-82b4c53552d6"

> uuidv5("url", "https://www.terraform.io/")
"9db6f67c-dd95-5ea0-aa5b-e70e5c5f7cf5"
```

https://developer.hashicorp.com/terraform/language/functions/uuidv5

## IP Network Functions

- [`cidrhost`](#cidrhost)
- [`cidrnetmask`](#cidrnetmask)
- [`cidrsubnet`](#cidrsubnet)
- [`cidrsubnets`](#cidrsubnets)

### `cidrhost`

CIDR ブロック内の指定したホストの IP アドレスを返します。

```hcl:terraform console
> cidrhost("10.12.112.0/20", 16)
"10.12.112.16"

> cidrhost("10.12.112.0/20", 268)
"10.12.113.12"
```

https://developer.hashicorp.com/terraform/language/functions/cidrhost

### `cidrnetmask`

指定した CIDR ブロックのネットワークマスクを返します。

```hcl:terraform console
> cidrnetmask("172.16.0.0/12")
"255.240.0.0"
```

https://developer.hashicorp.com/terraform/language/functions/cidrnetmask

### `cidrsubnet`

指定した CIDR ブロック内の指定したサブネットの CIDR ブロックを返します。

```hcl:terraform console
> cidrsubnet("172.16.0.0/12", 4, 2)
"172.18.0.0/16"

> cidrsubnet("10.1.2.0/24", 4, 15)
"10.1.2.240/28"

> cidrsubnet("fd00:fd12:3456:7890::/56", 16, 162)
"fd00:fd12:3456:7800:a200::/72"
```

https://developer.hashicorp.com/terraform/language/functions/cidrsubnet

### `cidrsubnets`

指定した CIDR ブロック内の連続したサブネットの CIDR ブロックのリストを返します。

```hcl:terraform console
> cidrsubnets("10.1.0.0/16", 4)
[
  "10.1.0.0/20",
]

> cidrsubnets("10.1.0.0/16", 4, 4)
[
  "10.1.0.0/20",
  "10.1.16.0/20",
]

> cidrsubnets("10.1.0.0/16", 4, 4, 8, 4)
[
  "10.1.0.0/20",
  "10.1.16.0/20",
  "10.1.32.0/24",
  "10.1.48.0/20",
]

> cidrsubnets("fd00:fd12:3456:7890::/56", 16, 16, 16, 32)
[
  "fd00:fd12:3456:7800::/72",
  "fd00:fd12:3456:7800:100::/72",
  "fd00:fd12:3456:7800:200::/72",
  "fd00:fd12:3456:7800:300::/88",
]
```

https://developer.hashicorp.com/terraform/language/functions/cidrsubnets

## Type Conversion Functions

- [`can`](#can)
- [`issensitive`](#issensitive)
- [`nonsensitive`](#nonsensitive)
- [`sensitive`](#sensitive)
- [`tobool`](#tobool)
- [`tolist`](#tolist)
- [`tomap`](#tomap)
- [`tonumber`](#tonumber)
- [`toset`](#toset)
- [`tostring`](#tostring)
- [`try`](#try)
- [`type`](#type)

### `can`

指定した Expression がエラーを返さずに評価されるかどうかを返します。

```hcl:terraform console
> can(tonumber("invalid"))
false

> can(tonumber("1"))
true
```

https://developer.hashicorp.com/terraform/language/functions/can

### `issensitive`

指定した値が sensitive かどうかを返します。

```hcl:terraform console
> issensitive("hello")
false

> issensitive(sensitive("secret"))
true
```

https://developer.hashicorp.com/terraform/language/functions/issensitive

### `nonsensitive`

指定した値を sensitive でない値に変換します。

```hcl:terraform console
> sensitive("secret")
(sensitive value)

> nonsensitive(sensitive("secret"))
"secret"
```

https://developer.hashicorp.com/terraform/language/functions/nonsensitive

### `sensitive`

指定した値を sensitive な値に変換します。

```hcl:terraform console
> sensitive("secret")
(sensitive value)
```

https://developer.hashicorp.com/terraform/language/functions/sensitive

### `tobool`

指定した値を bool に変換します。

```hcl:terraform console
> tobool("true")
true

> tobool("false")
false

> tobool(null)
null
```

https://developer.hashicorp.com/terraform/language/functions/tobool

### `tolist`

指定した値をリストに変換します。

```hcl:terraform console
> tolist([1, 2, 3])
[
  1,
  2,
  3,
]
```

https://developer.hashicorp.com/terraform/language/functions/tolist

### `tomap`

指定した値をマップに変換します。

```hcl:terraform console
> tomap({ a = 1, b = 2, c = 3 })
{
  "a" = 1
  "b" = 2
  "c" = 3
}
```

https://developer.hashicorp.com/terraform/language/functions/tomap

### `tonumber`

指定した値を数値に変換します。

```hcl:terraform console
> tonumber("1")
1

> tonumber(null)
null
```

https://developer.hashicorp.com/terraform/language/functions/tonumber

### `toset`

指定した値をセットに変換します。

```hcl:terraform console
> toset([1, 1, 2, 2, 3, 3])
[
  1,
  2,
  3,
]
```

https://developer.hashicorp.com/terraform/language/functions/toset

### `tostring`

指定した値を文字列に変換します。

```hcl:terraform console
> tostring(1)
"1"

> tostring(true)
"true"

> tostring(null)
null
```

https://developer.hashicorp.com/terraform/language/functions/tostring

### `try`

指定した Expression を順番に評価し、エラーを返さなかった最初の Expression の結果を返します。

```hcl:terraform console
> try(tonumber("invalid"), "default")
"default"

> try(tonumber("1"), "default")
1
```

https://developer.hashicorp.com/terraform/language/functions/try

### `type`

指定した値の型を返します。
`terraform console` でのみ使用可能です。

```hcl:terraform console
> type(1)
number

> type("hello")
string

> type(true)
bool
```

https://developer.hashicorp.com/terraform/language/functions/type

## Terraform-specific Functions

- [`provider::terraform::encode_tfvars`](#provider%3A%3Aterraform%3A%3Aencode_tfvars)
- [`provider::terraform::decode_tfvars`](#provider%3A%3Aterraform%3A%3Adecode_tfvars)
- [`provider::terraform::encode_expr`](#provider%3A%3Aterraform%3A%3Aencode_expr)

これらの関数は Terraform 組み込みのプロバイダーから提供される Provider-defined Functions です。
使用するためには `required_providers` 内に `terraform.io/builtin/terraform` を明示的に指定する必要があります。

```hcl:example.tf
terraform {
  required_providers {
    terraform = {
      source = "terraform.io/builtin/terraform"
    }
  }
}
```

Provider-defined Functions については以下の記事をご参照ください。

https://zenn.dev/kou_pg_0131/articles/tf-1_8-provider-function

### `provider::terraform::encode_tfvars`

受け取ったオブジェクトを `.tfvars` ファイル形式の文字列にエンコードします。

```hcl
> provider::terraform::encode_tfvars({ example = 1 })
"example = 1"
```

https://developer.hashicorp.com/terraform/language/functions/terraform-encode_tfvars

### `provider::terraform::decode_tfvars`

`.tfvars` ファイル形式の文字列をオブジェクトにデコードします。

```hcl
> provider::terraform::decode_tfvars("example = 1")
{
  "example" = 1
}
```

https://developer.hashicorp.com/terraform/language/functions/terraform-decode_tfvars

### `provider::terraform::encode_expr`

受け取った値を Terraform 言語の式構文の文字列にエンコードします。

```hcl
> provider::terraform::encode_expr(1)
"1"

> provider::terraform::encode_expr("hello")
"\"hello\""
```

https://developer.hashicorp.com/terraform/language/functions/terraform-encode_expr

# まとめ

色々ありますね〜。

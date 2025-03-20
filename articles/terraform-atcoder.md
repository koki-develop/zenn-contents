---
title: "AtCoder の過去問精選 10 問を Terraform で解いてみる"
emoji: "💻"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["terraform", "atcoder"]
published: true
published_at: 2024-07-01 18:00
publication_name: "terraform_jp"
---

[HCL](https://github.com/hashicorp/hcl) (HashiCorp Configuration Language) は HashiCorp 社が開発している、シンプルな構文を持つ「**プログラミング言語**」です。
「**プログラミング言語**」なので、当然**競技プログラミング**に使用することもできます。

そして [Terraform](https://github.com/hashicorp/terraform) は HCL によって記述された「**プログラム**」を実行するためのツールです。

というわけで、 [AtCoder の過去問精選 10 問](https://qiita.com/drken/items/fd4e5e3630d0f5859067)を Terraform を使って解いてみます。

https://qiita.com/drken/items/fd4e5e3630d0f5859067
https://atcoder.jp/contests/abs

:::message

噂によると、 HCL を構造化設定言語 (structured configuration language) と呼び、 Terraform を使ってインフラを構築している人たちもいるらしいです。面白いですね。

:::

# リポジトリ

今回紹介するコードは以下のリポジトリで管理しています。
テストコードや CI なども含まれています。

https://github.com/koki-develop/terraform-abs

# 条件

- Terraform v1.9.0 を使用する
- 入力は `var.input` で文字列として受け取る
  ```hcl
  variable "input" {
    type = string
  }
  ```
- 出力は `output.result` で文字列として出力する
  ```hcl
  output "result" {
    value = "出力"
  }
  ```
- provisioner ( `local-exec` など ) は使用しない
- **数値が非常に大きいケースや実行時間は考慮しない**
  - いじめないでください

# 解答コード

## 1. Product

https://atcoder.jp/contests/abs/tasks/abc086_a

```hcl:main.tf
variable "input" {
  type = string
}

locals {
  # a, b を取得
  ab = split(" ", chomp(var.input))
  a  = tonumber(local.ab[0])
  b  = tonumber(local.ab[1])

  # a * b が偶数か奇数か判定
  result = local.a * local.b % 2 == 0 ? "Even" : "Odd"
}

output "result" {
  value = local.result
}
```

:::details 入力例

```hcl:terraform.tfvars
input = <<EOT
3 4
EOT
```

```sh
$ terraform apply -auto-approve
# ...省略
Outputs:

result = "Even"
```

:::

## 2. Placing Marbles

https://atcoder.jp/contests/abs/tasks/abc081_a

```hcl:main.tf
variable "input" {
  type = string
}

locals {
  # "1" の数をカウント
  count = length([for a in split("", chomp(var.input)) : a if a == "1"])

  result = tostring(local.count)
}

output "result" {
  value = local.result
}
```

:::details 入力例

```hcl:terraform.tfvars
input = <<EOT
101
EOT
```

```sh
$ terraform apply -auto-approve
# ...省略
Outputs:

result = "2"
```

:::

## 3. Shift only

https://atcoder.jp/contests/abs/tasks/abc081_b

```hcl:main.tf
variable "input" {
  type = string
}

locals {
  # a1...an を数値に変換
  lines = split("\n", chomp(var.input))
  aa    = [for a in split(" ", local.lines[1]) : tonumber(a)]

  # a1...an を 2 進数に変換
  bins = [for a in local.aa : format("%b", a)]

  # 2 進数の末尾の 0 の数 = 2 で割れる回数を数える
  counts = [for bin in local.bins : length(regex("0*$", bin))]

  # 最小値を取得
  result = tostring(min(local.counts...))
}

output "result" {
  value = local.result
}
```

:::details 入力例

```hcl:terraform.tfvars
input = <<EOT
3
8 12 40
EOT
```

```sh
$ terraform apply -auto-approve
# ...省略
Outputs:

result = "2"
```

:::

## 4. Coins

https://atcoder.jp/contests/abs/tasks/abc087_b

```hcl:main.tf
variable "input" {
  type = string
}

locals {
  # a, b, c, x を取得
  lines = split("\n", chomp(var.input))
  a     = tonumber(local.lines[0])
  b     = tonumber(local.lines[1])
  c     = tonumber(local.lines[2])
  x     = tonumber(local.lines[3])

  # 各硬貨の組み合わせを計算し、条件に一致するものを取得
  combinations = flatten([for a in range(0, local.a + 1) : [
    for b in range(0, local.b + 1) : [
      for c in range(0, local.c + 1) : true if a * 500 + b * 100 + c * 50 == local.x
    ]
  ]])

  # 条件に一致する組み合わせの数を取得
  result = tostring(length(local.combinations))
}

output "result" {
  value = local.result
}
```

:::details 入力例

```hcl:terraform.tfvars
input = <<EOT
2
2
2
100
EOT
```

```sh
$ terraform apply -auto-approve
# ...省略
Outputs:

result = "2"
```

:::

## 5. Some Sums

https://atcoder.jp/contests/abs/tasks/abc083_b

```hcl:main.tf
variable "input" {
  type = string
}

locals {
  # n, a, b を取得
  nab = split(" ", chomp(var.input))
  n   = tonumber(local.nab[0])
  a   = tonumber(local.nab[1])
  b   = tonumber(local.nab[2])

  # 各整数の各桁の和を計算
  sums = [for i in range(1, local.n + 1) : sum([for c in split("", tostring(i)) : tonumber(c)])]

  # 各桁の和が A から B の間にある整数のリストを作成
  valid_numbers = [for i in range(1, local.n + 1) : i if local.a <= local.sums[i - 1] && local.sums[i - 1] <= local.b]

  # 総和を計算
  result = tostring(sum(local.valid_numbers))
}

output "result" {
  value = local.result
}
```

:::details 入力例

```hcl:terraform.tfvars
input = <<EOT
20 2 5
EOT
```

```sh
$ terraform apply -auto-approve
# ...省略
Outputs:

result = "84"
```

:::

## 6. Card Game for Two

https://atcoder.jp/contests/abs/tasks/abc088_b

```hcl:main.tf
variable "input" {
  type = string
}

locals {
  # n, a1...an を取得
  lines = split("\n", chomp(var.input))
  n     = tonumber(local.lines[0])
  aa    = [for a in split(" ", local.lines[1]) : tonumber(a)]

  # カードを降順にソート、数値に変換
  sorted_cards = [
    # `sort` は文字列しかサポートしていないため、 0 埋めすることで数値順のソートを実現
    for a_str in reverse(sort([
      for a in local.aa : format("%03d", a)
    ])) : tonumber(a_str)
  ]

  # Alice と Bob の得点を計算
  alice = sum([for i in range(0, local.n, 2) : local.sorted_cards[i]])
  bob   = sum([for i in range(1, local.n, 2) : local.sorted_cards[i]])

  # 得点差を計算
  result = tostring(local.alice - local.bob)
}

output "result" {
  value = local.result
}
```

:::details 入力例

```hcl:terraform.tfvars
input = <<EOT
2
3 1
EOT
```

```sh
$ terraform apply -auto-approve
# ...省略
Outputs:

result = "2"
```

:::

## 7. Kagami Mochi

https://atcoder.jp/contests/abs/tasks/abc085_b

```hcl:main.tf
variable "input" {
  type = string
}

locals {
  # n, d1...dn を取得
  lines = split("\n", chomp(var.input))
  n     = tonumber(local.lines[0])
  dd    = [for i in range(1, local.n + 1) : tonumber(local.lines[i])]

  # 重複しない直径の数をカウント
  result = tostring(length(toset(local.dd)))
}

output "result" {
  value = local.result
}
```

:::details 入力例

```hcl:terraform.tfvars
input = <<EOT
4
10
8
8
6
EOT
```

```sh
$ terraform apply -auto-approve
# ...省略
Outputs:

result = "3"
```

:::

## 8. Otoshidama

https://atcoder.jp/contests/abs/tasks/abc085_c

```hcl:main.tf
variable "input" {
  type = string
}

locals {
  # n, y を取得
  lines = split("\n", chomp(var.input))
  ny    = split(" ", local.lines[0])
  n     = tonumber(local.ny[0])
  y     = tonumber(local.ny[1])

  # 条件に一致する組み合わせを取得
  combinations = flatten([for x in range(0, local.n + 1) : [
    for y in range(0, local.n - x + 1) : {
      count_10000 = x,
      count_5000  = y,
      count_1000  = local.n - x - y,
    } if 10000 * x + 5000 * y + 1000 * (local.n - x - y) == local.y
  ]])

  # 単一の組み合わせを取得
  # 存在しない場合は -1 を設定
  combination = length(local.combinations) > 0 ? local.combinations[0] : { count_10000 = -1, count_5000 = -1, count_1000 = -1 }

  # 結果文字列を形成
  result = "${local.combination.count_10000} ${local.combination.count_5000} ${local.combination.count_1000}"
}

output "result" {
  value = local.result
}
```

:::details 入力例

```hcl:terraform.tfvars
input = <<EOT
9 45000
EOT
```

```sh
$ terraform apply -auto-approve
# ...省略
Outputs:

result = "0 9 0"
```

:::

## 9. 白昼夢

https://atcoder.jp/contests/abs/tasks/arc065_a

```hcl:main.tf
variable "input" {
  type = string
}

locals {
  # s を取得
  s = chomp(var.input)

  # 単語を削除
  result = replace(
    replace(
      replace(
        replace(
          local.s,
          "eraser", ""
        ),
        "erase", ""
      )
      , "dreamer", ""
    ),
    "dream", ""
  ) == "" ? "YES" : "NO"
}

output "result" {
  value = local.result
}
```

:::details 入力例

```hcl:terraform.tfvars
input = <<EOT
erasedream
EOT
```

```sh
$ terraform apply -auto-approve
# ...省略
Outputs:

result = "YES"
```

:::

## 10. Traveling

https://atcoder.jp/contests/abs/tasks/arc089_a

```hcl:main.tf
variable "input" {
  type = string
}

locals {
  # n を取得
  lines = split("\n", chomp(var.input))
  n     = tonumber(local.lines[0])

  # 各時刻と座標をリストに格納
  t_x_y = [
    for i in range(1, local.n + 1) : {
      t = tonumber(split(" ", local.lines[i])[0]),
      x = tonumber(split(" ", local.lines[i])[1]),
      y = tonumber(split(" ", local.lines[i])[2])
    }
  ]

  # 各ステップの情報をリストに格納
  steps = [
    for i in range(0, local.n) : {
      current = local.t_x_y[i],
      prev    = i == 0 ? { t = 0, x = 0, y = 0 } : local.t_x_y[i - 1]
    }
  ]

  # 各ステップの移動可能性を判定
  movables = [
    for step in local.steps : (
      step.current.t - step.prev.t >= abs(step.current.x - step.prev.x) + abs(step.current.y - step.prev.y) &&
      (step.current.t - step.prev.t - abs(step.current.x - step.prev.x) - abs(step.current.y - step.prev.y)) % 2 == 0
    )
  ]

  # 全てのステップが移動可能であれば "Yes" そうでなければ "No"
  result = alltrue(local.movables) ? "Yes" : "No"
}

output "result" {
  value = local.result
}
```

:::details 入力例

```hcl:terraform.tfvars
input = <<EOT
2
3 1 2
6 1 1
EOT
```

```sh
$ terraform apply -auto-approve
# ...省略
Outputs:

result = "Yes"
```

:::

# まとめ

AtCoder で正式にサポートされる日も近いですね。

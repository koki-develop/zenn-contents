---
title: "Terraform 1.3 の新機能"
emoji: "🎉"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["terraform", "iac", "hashicorp"]
published: true
---

Terraform 1.3 がリリースされました 🎉

https://www.hashicorp.com/blog/terraform-1-3-improves-extensibility-and-maintainability-of-terraform-modules

[リリースノート](https://github.com/hashicorp/terraform/releases/tag/v1.3.0)の [NEW FEATURES](https://github.com/hashicorp/terraform/releases/tag/v1.3.0#:~:text=September%2021%2C%202022\)-,NEW%20FEATURES,-%3A) の内容についてさっくりまとめます。

# `object` type の `optional()` でデフォルト値が設定できるようになった

`object` type の省略可能な attribute を設定するときに使用する `optional()` の第 2 引数にデフォルト値を設定できるようになりました。

```tf:main.tf
variable "hoge" {
  type = object({
    a = optional(string, "default value") # 省略された場合は `"default value"` が設定される
    b = optional(string) # 省略された場合は null が設定される
  })
}

output "hoge" {
  value = var.hoge
}
```

```sh
# a も b も省略するパターン
$ terraform plan -var='hoge={}'

Changes to Outputs:
  + hoge = {
      + a = "default value"
      + b = null
    }

# a だけ指定するパターン
$ terraform plan -var='hoge={"a" = "AAA"}'

Changes to Outputs:
  + hoge = {
      + a = "AAA"
      + b = null
    }

# b だけ指定するパターン
$ terraform plan -var='hoge={"b" = "BBB"}'

Changes to Outputs:
  + hoge = {
      + a = "default value"
      + b = "BBB"
    }

# a も b も指定するパターン
$ terraform plan -var='hoge={"a" = "AAA", "b" = "BBB"}'

Changes to Outputs:
  + hoge = {
      + a = "AAA"
      + b = "BBB"
    }
```

このあたりについては HashCorp の中の人がわかりやすい記事を書いてくださっているので、詳しくはこちらをご参照ください。

https://zenn.dev/jrsyo/articles/83bbcff7e08ab8

# `startswith`・`endswith`

文字列の接頭辞をチェックする [`startswith`](https://developer.hashicorp.com/terraform/language/functions/startswith) 関数と、接尾辞をチェックする [`endswith`](https://developer.hashicorp.com/terraform/language/functions/endswith) 関数が追加されました。

```sh:terraform console
> startswith("hello world", "h")
true
> startswith("hello world", "hello")
true
> startswith("hello world", "Hello")
false
> startswith("hello world", "world")
false
```

https://developer.hashicorp.com/terraform/language/functions/startswith

```sh:terraform console
> endswith("hello world", "d")
true
> endswith("hello world", "world")
true
> endswith("hello world", "World")
false
> endswith("hello world", "hello")
false
```

https://developer.hashicorp.com/terraform/language/functions/endswith

# まとめ

これで `object` type の使い勝手がかなり良くなり、より型安全な Terraform コードが書きやすくなったのではないでしょうか。
`startswith`・`endswith` に関しても必要になるケースは結構ありそうです。

他にも様々な変更や改善があります。
詳細についてはリリースノートをご参照ください。

https://github.com/hashicorp/terraform/releases/tag/v1.3.0

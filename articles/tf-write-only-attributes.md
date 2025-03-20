---
title: "Terraform v1.11 の Write-Only Attributes を試してみる"
emoji: "⚡"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["terraform"]
published: true
published_at: 2025-02-10 18:00
publication_name: "terraform_jp"
---

Terraform v1.11 の beta 版がリリースされています。

https://github.com/hashicorp/terraform/releases/tag/v1.11.0-beta2

ノートを見てみると `write-only attributes` なるものが書いてあります。
どうやら「**state に保存されない書き込み専用の attribute**」が使えるようになるらしいです。

そして AWS Provider のリポジトリを眺めてみると、 `aws_ssm_parameter` resource に `value_wo` という Write-Only Attribute を追加する PR が出ています。

https://github.com/hashicorp/terraform-provider-aws/pull/40952

というわけで試してみました。

~~「せめて PR がマージされるまで待ちなよ」~~
~~うるさい！！！！~~
(2025/02/12 追記) マージされた！！！！
(2025/02/14 追記) リリースされた！！！！ ( [AWS Provider v5.87.0](https://github.com/hashicorp/terraform-provider-aws/releases/tag/v5.87.0) )

# 検証環境

- Terraform v1.11.0-beta2
- AWS Provider [`91b891ea9421b5b03c4ee63cebf9d51b3692c92a`](https://github.com/hashicorp/terraform-provider-aws/tree/91b891ea9421b5b03c4ee63cebf9d51b3692c92a)

# Write-Only Attributes を使わない場合

まずは Write-Only Attributes を使わない場合を見ていきましょう。

`aws_ssm_parameter` resource を使って `password` という名前の SSM パラメータを作成してみます。

```hcl
resource "aws_ssm_parameter" "password" {
  name = "password"
  type = "SecureString"

  value = "AWESOME_PASSWORD" # これは機密情報
}
```

plan を実行してみると `value` は `(sensitive value)` としてマスクされています。

```bash
$ terraform plan
```

```bash:出力
Terraform will perform the following actions:

  # aws_ssm_parameter.password will be created
  + resource "aws_ssm_parameter" "password" {
      + arn            = (known after apply)
      + data_type      = (known after apply)
      + id             = (known after apply)
      + insecure_value = (known after apply)
      + key_id         = (known after apply)
      + name           = "password"
      + tags_all       = (known after apply)
      + tier           = (known after apply)
      + type           = "SecureString"
      + value          = (sensitive value) # <===== ちゃんとマスクされている
      + version        = (known after apply)
    }
```

このように、 Terraform では sensitive としてマークされた値は通常 plan などの出力では表示されないため、一見すると安全なように見えます。

さて、 apply を実行したあとの tfstate の中身を見てみましょう。

```bash
$ terraform apply
```

```bash:出力
Apply complete! Resources: 1 added, 0 changed, 0 destroyed.
```

```json5:terraform.tfstate
{
  // ...
  "resources": [
    {
      // ...
      "type": "aws_ssm_parameter",
      "name": "password",
      // ...
      "instances": [
        {
          // ...
          "attributes": {
            // ...
            "value": "AWESOME_PASSWORD", // <===== ！！！！！
            // ...
          },
          // ...
        }
      ]
    }
  ],
  // ...
}
```

**`value` の値が平文で保存されていますね。**

このように Terraform では **sensitive としてマークされた値だろうと tfstate には平文で保存されてしまいます**。
つまり、 tfstate にアクセスできる権限さえあれば **Terraform 経由で設定された機密情報を誰でも閲覧できてしまう**ということになります。

これは Terraform 運用者を長年悩ませ続けてきた問題であり、今までも様々な運用方法が検討されてきました。

https://speakerdeck.com/harukasakihara/sekiyuanaterraformfalseshi-ifang-ji-mi-qing-bao-wokodonihan-mezuhuan-jing-gou-zhu-surunihadousitaraiifalse

# Write-Only Attributes を使う場合

それでは Write-Only Attributes を使ってみます。

`aws_ssm_parameter` resource の場合は `value` の代わりに `value_wo` を使います。
`value_wo_version` については後述します。

```hcl diff:example.tf
 resource "aws_ssm_parameter" "password" {
   name = "password"
   type = "SecureString"

-  value = "AWESOME_PASSWORD"
+  value_wo         = "AWESOME_PASSWORD"
+  value_wo_version = 1 # これも忘れずに！
 }
```

:::message

`value_wo_version` を指定しないと次のようなメッセージが表示されてエラーになります。

```
Error: Missing required argument

  with aws_ssm_parameter.password,
  on ssm.tf line 5, in resource "aws_ssm_parameter" "password":
   5:   value_wo = "AWESOME_PASSWORD"

"value_wo": all of `value_wo,value_wo_version` must be specified
```

:::

plan を実行してみると、 `value_wo` が `(write-only attribute)` として値がマスクされていることが確認できます。

```bash
$ terraform plan
```

```bash:出力
Terraform will perform the following actions:

  # aws_ssm_parameter.password will be created
  + resource "aws_ssm_parameter" "password" {
      + arn              = (known after apply)
      + data_type        = (known after apply)
      + has_value_wo     = (known after apply)
      + id               = (known after apply)
      + insecure_value   = (known after apply)
      + key_id           = (known after apply)
      + name             = "password"
      + tags_all         = (known after apply)
      + tier             = (known after apply)
      + type             = "SecureString"
      + value            = (sensitive value)
      + value_wo         = (write-only attribute) # <===== これ
      + value_wo_version = 1
      + version          = (known after apply)
    }
```

このまま apply してみます。

```bash
$ terraform apply
```

```bash:出力
Apply complete! Resources: 1 added, 0 changed, 0 destroyed.
```

SSM パラメータが作成されました。

```bash
# 作成された SSM パラメータを確認してみる
$ aws ssm get-parameter \
  --name password \
  --with-decryption \
  --output text \
  --query Parameter.Value
```

```:出力
AWESOME_PASSWORD
```

そして tfstate を見てみましょう。

```json5:terraform.tfstate
{
  // ...
  "resources": [
    {
      // ...
      "type": "aws_ssm_parameter",
      "name": "password",
      // ...
      "instances": [
        {
          // ...
          "attributes": {
            // ...
            "value": "", // <===== ！！！！！
            "value_wo": null,
            "value_wo_version": 1,
            // ...
          },
          // ...
        }
      ]
    }
  ],
  // ...
}
```

**`value` が tfstate に保存されていないことが確認できます** ( `value_wo` も同様 ) 。

---

このように、 Write-Only Attributes は文字通り**書き込み専用の Attribute** であり、 **tfstate に保存されることはありません**。
つまり Write-Only Attributes を使えば **Terraform 経由で値を設定しつつ**、且つ**機密情報が tfstate に平文で保存されることを防ぐことができます**。アツい。

# Write-Only Attributes を更新する

Write-Only Attributes を更新してみます。

とりあえず `value_wo` の値を書き換えてみます。

```hcl diff:example.tf
 resource "aws_ssm_parameter" "password" {
   name = "password"
   type = "SecureString"

-  value_wo         = "AWESOME_PASSWORD"
+  value_wo         = "AWESOME_PASSWORD_UPDATED"
   value_wo_version = 1
 }
```

この状態で plan を実行してみると `No changes.` と言われてしまいました。

```bash
$ terraform plan
```

```:出力
No changes. Your infrastructure matches the configuration.
```

`value_wo` の値を更新するためには `value_wo_version` も一緒に更新してあげる必要があります。

```hcl diff:example.tf
 resource "aws_ssm_parameter" "password" {
   name = "password"
   type = "SecureString"

   value_wo         = "AWESOME_PASSWORD_UPDATED"
-  value_wo_version = 1
+  value_wo_version = 2
 }
```

この状態で再度 plan を実行してみると、 `value_wo_version` の変更が検知されていることが確認できます。

```bash
$ terraform plan
```

```bash:出力
Terraform will perform the following actions:

  # aws_ssm_parameter.password will be updated in-place
  ~ resource "aws_ssm_parameter" "password" {
      ~ has_value_wo     = true -> (known after apply)
        id               = "password"
        name             = "password"
        tags             = {}
      ~ value_wo_version = 1 -> 2
        # (11 unchanged attributes hidden)
    }
```

apply を実行すると、 `value_wo` で設定した値が SSM パラメータに反映されました。

```bash
$ terraform apply
```

```bash:出力
Apply complete! Resources: 0 added, 1 changed, 0 destroyed.
```

```bash
# SSM パラメータが更新されていることを確認してみる
$ aws ssm get-parameter \
  --name password \
  --with-decryption \
  --output text \
  --query Parameter.Value
```

```:出力
AWESOME_PASSWORD_UPDATED
```

このように、 `value_wo_version` は `value_wo` の変更を検知するために利用される Attribute です。
設定する値は数値であればなんでもいいようです。今回は `1` -> `2` にお行儀よくインクリメントしましたが、 `0` でも `-100` でも普通に動きました。

# 補足

あくまで今回の例は `aws_ssm_parameter` resource のケースでしかなく、必ずしも他のリソースでも同じ使い方 ( `<属性>_wo` / `<属性>_wo_version` の形式 ) になるとは限らないことに注意してください。
この辺りは Terraform Provider 側の実装次第なので、今後どのように導入が進められていくのか要注目です。

# まとめ

Terraform v1.10 で導入された Ephemeral resources/values などもそうですが、 state に特定の値を保存させないための機能が揃ってきててとてもいいですね。

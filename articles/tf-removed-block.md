---
title: "Terraform 1.7 で追加されそうな removed ブロックの使い方"
emoji: "🌟"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["terraform"]
published: true
published_at: 2023-12-01 18:00
---

Terraform 1.7 の alpha がリリースされています。

https://github.com/hashicorp/terraform/releases/tag/v1.7.0-alpha20231130

どうやら `removed` ブロックというものが追加されているようです。

> - `removed` block for refactoring modules: Module authors can now record in source code when a resource or module call has been removed from configuration, and can inform Terraform whether the corresponding object should be deleted or simply removed from state.
> > [Release v1.7.0-alpha20231130 · hashicorp/terraform](https://github.com/hashicorp/terraform/releases/tag/v1.7.0-alpha20231130)

今までは Terraform で管理しているリソースを削除せずに管理から外すには 1 つ 1 つ `terraform state rm` コマンドを実行する必要がありました。
`removed` ブロックを使用することでこの操作を宣言的に実行することができるようになります。

というわけで使い方を調べてみました。

:::message

この記事の内容は v1.7.0-alpha20231130 時点のものであり、今後仕様が大きく変更される可能性もあることに注意してください。

:::

# 検証環境

- terraform v1.7.0-alpha20231130

# 試してみる

## 準備

とりあえず適当な S3 バケットを用意していきます。

次のようなファイルを `main.tf` という名前で作成します。

```tf:main.tf
resource "aws_s3_bucket" "main" {
  bucket = "koki-removed-block-example-bucket"
}
```

`terraform init` ~ `terraform apply` を実行して S3 バケットを作成します。

```sh
$ terraform init
$ terraform apply
```

`aws_s3_bucket.main` リソースが Terraform 管理に追加されたことが確認できます。

```sh
# S3 バケットが作成された
$ aws s3api head-bucket --bucket "koki-removed-block-example-bucket"
{
    "BucketRegion": "us-east-1",
    "AccessPointAlias": false
}

# Terraform 管理にも S3 バケットが含まれている
$ terraform state list
aws_s3_bucket.main
```

## `removed` ブロックを使う

それでは `removed` ブロックを使ってみます。
なお、今回はリソースを対象にしていますが、同じようにモジュールを対象にすることも可能です。

`removed` ブロックは次のように書くことができます。

```tf diff:main.tf
-# リソースの宣言ブロックは削除する
-resource "aws_s3_bucket" "main" {
-  bucket = "koki-removed-block-example-bucket"
-}

+removed {
+  from = aws_s3_bucket.main
+  lifecycle {
+    # こうすることでリソースが削除されなくなる (デフォルトはtrue)
+    destroy = false
+  }
+}
```

`from` には対象リソースの識別子を指定します。
また、 `lifecycle` ブロックの `destroy` を `false` にすることで対象リソースが物理削除されなくなります。

:::message

対象リソースの宣言ブロックは削除しておく必要があることに注意してください。
宣言ブロックが残っているままだとエラーになり下記のようなメッセージが表示されます。

```
This statement declares that aws_s3_bucket.main was removed, but it is still declared in configuration.
```

:::

それでは `terraform plan` を実行して出力を確認してみます。

```sh
$ terraform plan
# ...省略
Terraform will perform the following actions:

 # aws_s3_bucket.main will no longer be managed by Terraform, but will not be destroyed
 # (destroy = false is set in the configuration)
 . resource "aws_s3_bucket" "main" {
      # ...省略
    }

Plan: 0 to add, 0 to change, 0 to destroy.
╷
│ Warning: Some objects will no longer be managed by Terraform
│
│ If you apply this plan, Terraform will discard its tracking information for the following objects, but it will not
│ delete them:
│  - aws_s3_bucket.main
│
│ After applying this plan, Terraform will no longer manage these objects. You will need to import them into Terraform
│ to manage them again.
╵
# ...省略
```

「対象リソースは Terraform 管理から外れるもののリソースは削除されない」というメッセージが表示されていることが確認できます。

> ```
> aws_s3_bucket.main will no longer be managed by Terraform, but will not be destroyed
> ```

また、 Warning に Terraform 管理から外れるリソースのリストが表示されていることも確認できます。

> ```
> Warning: Some objects will no longer be managed by Terraform
>
> If you apply this plan, Terraform will discard its tracking information for the following objects, but it will not
> delete them:
>  - aws_s3_bucket.main
>
> After applying this plan, Terraform will no longer manage these objects. You will need to import them into Terraform
> to manage them again.
> ```

それではこの状態で `terraform apply` を実行してみます。

```sh
$ terraform apply
# ...省略
Apply complete! Resources: 0 added, 0 changed, 0 destroyed.
```

`0 destroyed` と表示され、 S3 バケット自体は削除されずに Terraform 管理から外れたことが確認できます。

```sh
# S3 バケット自体は削除されずに残っている
$ aws s3api head-bucket --bucket koki-removed-block-example-bucket
{
    "BucketRegion": "us-east-1",
    "AccessPointAlias": false
}

# Terraform 管理からは外れている
$ terraform state list
# (何も出力されない)
```

# まとめ

このまま `removed` ブロックが追加されたら一通りの tfstate を更新する作業がだいぶ楽になりますね。

- `terraform import` → `import` ブロック
- `terraform state mv` → `moved` ブロック
- **`terraform state rm` → `removed` ブロック ← NEW!!**

Terraform 1.7 の GA が待ち遠しいです。

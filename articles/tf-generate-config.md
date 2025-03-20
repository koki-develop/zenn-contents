---
title: "Terraform 1.5 で既存リソースからの HCL 生成ができるようになるので試してみる"
emoji: "🎉"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["terraform"]
published: true
published_at: 2023-05-29 18:00
---

Terraform 1.5 のベータ版がリリースされています。

https://github.com/hashicorp/terraform/releases/tag/v1.5.0-beta1
https://github.com/hashicorp/terraform/releases/tag/v1.5.0-beta2

Terraform 1.5 で追加される機能の中には以下のようなものが含まれています。

- `import` ブロック
- `terraform plan` の `-generate-config-out` オプション

Terraform では手作業などで作成済みの既存リソースも `terraform import` コマンドを使用して Terraform の管理に追加することができます。
しかし、 import したリソースの HCL 自体は自分で書かなければいけません。
もしも既存リソースの HCL を自動で生成したい場合は [GoogleCloudPlatform/terraformer](https://github.com/GoogleCloudPlatform/terraformer) などのサードパーティ製のツールを使用する必要があります。

ところが、 Terraform 1.5 で追加される `import` ブロックと `terraform plan` の `-generate-config-out` オプションを使用することで、**既存リソースの HCL を自動で生成することができるようになります**。
これが Terraform の標準機能としてサポートされるのはあまりにも嬉しすぎるので、早速試してみました。

`import` ブロック単体の使い方については以下の記事をご参照ください。

https://zenn.dev/kou_pg_0131/articles/tf-import-block

# 検証環境

- Terraform v1.5.0-beta2
- AWS Provider v5.0.1

# サンプルコード

今回紹介するコードは以下のリポジトリで管理しています。

https://github.com/koki-develop/tf-generate-example

# 試してみる

## 準備

### 手作業でリソースを作成

検証するための AWS リソースを作成します。
今回は `terraform-generate-example` という名前の S3 バケットを作成しました。

```sh
$ aws s3 mb s3://terraform-generate-example
make_bucket: terraform-generate-example
```

ついでに適当なタグをつけておきます。

```sh
$ aws s3api put-bucket-tagging --bucket terraform-generate-example --tagging 'TagSet=[{Key=hoge,Value=fuga}]'
```

続いて AWS Provider の設定を記述した `provider.tf` を作成します。

```hcl:provider.tf
provider "aws" {
  region = "ap-northeast-1"
}
```

`terraform init` を実行します。

```sh
$ terraform init
```

## `import` ブロックを記述

次のような `import` ブロックを記述します。

```hcl:import.tf
import {
  id = "terraform-generate-example" # リソースの識別子
  to = aws_s3_bucket.main           # import 先
}
```

`id` には先ほど作成した S3 バケット名を指定します。
`to` には import 先として `aws_s3_bucket.main` リソースを指定していますが、見ての通りこのリソースはどこにも定義していません。

## 自動生成を実行

この状態で `-generate-config-out` オプションを指定しながら `terraform plan` を実行します。
このオプションには生成されるファイルのパスを指定します。今回は `generated.tf` を指定してみます。

```sh
$ terraform plan -generate-config-out=generated.tf
```

すると、 `-generate-config-out` オプションに指定したパス ( 今回の場合は `generated.tf` ) に次のようなファイルが生成されます。

```hcl:generated.tf
# __generated__ by Terraform
# Please review these resources and move them into your main configuration files.

# __generated__ by Terraform from "terraform-generate-example"
resource "aws_s3_bucket" "main" {
  bucket              = "terraform-generate-example"
  bucket_prefix       = null
  force_destroy       = null
  object_lock_enabled = false
  tags = {
    hoge = "fuga"
  }
  tags_all = {
    hoge = "fuga"
  }
}
```

なんということでしょう…。
`import` ブロックの `to` で指定していた識別子でリソースが定義されていることが確認できます。
バケット名はもちろん、後から更新した設定 ( 今回の場合はタグ ) もしっかり反映されています。

この後は通常通り `terraform apply` を実行することで ( `import` ブロックによって ) リソースが import されます。

# まとめ

実は以前にも Terraform 1.1 で似たような用途のコマンドとして `terraform add` コマンドが追加されそうだったのですが、残念ながら GA には至らずアルファ版の時点で削除されました。

https://discuss.hashicorp.com/t/terraform-1-1-0-alpha-terraform-add-command-feedback/26195/7
https://github.com/hashicorp/terraform/pull/29782

これがついに形を変えて再実装され、既にベータ版に含まれているのでこのまま GA になったら最高ですね。
Terraform 1.5 アツすぎます、待ちきれません。

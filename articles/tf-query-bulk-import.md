---
title: "【Terraform 1.4】terraform query コマンドで既存リソースを一括 import する"
emoji: "📘"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["terraform"]
publication_name: "terraform_jp"
published: true
published_at: 2025-09-22 18:00
---

Terraform v1.14.0 の beta がリリースされています。

https://github.com/hashicorp/terraform/releases/tag/v1.14.0-beta1

リリースノートを見てみると、「List Resources」や「`terraform query` コマンド」なるものが追加されているようです。

> - **List Resources**: List resources can be defined in `*.tfquery.hcl` files and allow querying and filterting existing infrastructure.
> - A new Terraform command `terraform query`: Executes list operations against existing infrastructure and displays the results. The command can optionally generate configuration for importing results into Terraform.

どうやらこれらの新機能を使うと Terraform 管理外の既存リソースを取得したり、それらを一括で import したりできるようです。

というわけで試してみました。

- [List Resources - 既存リソースの一覧を取得する](#list-resources---既存リソースの一覧を取得する)
- [既存リソースを一括で import する](#既存リソースを一括で-import-する)


# 検証環境

- Terraform v1.14.0-beta1
- AWS Provider v6.14.0

# List Resources - 既存リソースの一覧を取得する

とりあえず AWS プロバイダの設定を作成します。

```hcl:main.tf
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "6.14.0"
    }
  }
}

provider "aws" {
  region = "ap-northeast-1"
}
```

```bash
$ terraform init
```

---

それでは早速 List Resources を試してみます。
**`.tfquery.hcl`** という拡張子でファイルを作成し、 **`list` ブロック**を記述します。

以下は `aws_instance` リソース (EC2 インスタンス) の一覧を取得する例です。

```hcl:main.tfquery.hcl
list "aws_instance" "main" {
  provider = aws # プロバイダを指定 (必須)
}
```

:::message

AWS Provider v6.14.0 時点で List がサポートされているリソースは以下の通りです。

- `aws_batch_job_queue`
- `aws_cloudwatch_log_group`
- `aws_iam_role`
- `aws_instance`

:::

この状態で `terraform query` コマンドを実行すると、リージョン内の全ての EC2 インスタンスが出力されます。

```bash
$ terraform query
```

```:出力
list.aws_instance.main   account_id=123456789012,id=i-0011223344556677b,region=ap-northeast-1   instance-b
list.aws_instance.main   account_id=123456789012,id=i-1122334455667788c,region=ap-northeast-1   instance-c
list.aws_instance.main   account_id=123456789012,id=i-2233445566778899a,region=ap-northeast-1   instance-a
```

---

`list` ブロックには様々なオプションを指定できます。

- `config` ブロック - プロバイダ固有の引数を指定
- `include_resource` - 利用可能な全てのリソース属性を取得
- `limit` - 取得するリソースの最大数を指定 (デフォルト: 100)

詳しくは以下のドキュメントをご参照ください。

https://developer.hashicorp.com/terraform/language/v1.14.x/import/bulk#query-configurations

以下は `config` ブロックを使って、特定のタグが付与された EC2 インスタンスのみを取得する例です。

```diff hcl:main.tfquery.hcl
 list "aws_instance" "main" {
   provider = aws

+  config {
+    filter {
+      name   = "tag:Name"
+      values = ["instance-b", "instance-c"]
+    }
+  }
 }
```

```bash
$ terraform query
```

```:出力
list.aws_instance.main   account_id=123456789012,id=i-0011223344556677b,region=ap-northeast-1   instance-b
list.aws_instance.main   account_id=123456789012,id=i-1122334455667788c,region=ap-northeast-1   instance-c
```

# 既存リソースを一括で import する

`terraform query` コマンドに **`-generate-config-out=<任意任ファイル名>` フラグ**を設定すると、**取得したリソース一覧に対応する `resource` ブロックおよび `import` ブロックが自動生成されます**。

```bash
$ terraform query -generate-config-out=generated.tf
```

```hcl:generated.tf
# __generated__ by Terraform
# Please review these resources and move them into your main configuration files.

# __generated__ by Terraform
resource "aws_instance" "main_0" {
  provider = aws
  ami      = "ami-08a59875ad2a26a5f"
  # ...省略
  tags = {
    Name = "instance-b"
  }
  # ...省略
}

import {
  to       = aws_instance.main_0
  provider = aws
  identity = {
    account_id = "123456789012"
    id         = "i-0011223344556677b"
    region     = "ap-northeast-1"
  }
}

resource "aws_instance" "main_1" {
  provider = aws
  ami      = "ami-08a59875ad2a26a5f"
  # ...省略
  tags = {
    Name = "instance-c"
  }
  # ...省略
}

import {
  to       = aws_instance.main_1
  provider = aws
  identity = {
    account_id = "123456789012"
    id         = "i-1122334455667788c"
    region     = "ap-northeast-1"
  }
}

resource "aws_instance" "main_2" {
  provider = aws
  ami      = "ami-08a59875ad2a26a5f"
  # ...省略
  tags = {
    Name = "instance-a"
  }
  # ...省略
}

import {
  to       = aws_instance.main_2
  provider = aws
  identity = {
    account_id = "123456789012"
    id         = "i-2233445566778899a"
    region     = "ap-northeast-1"
  }
}
```

あとは `terraform apply` を実行するだけでこれらのリソースが import され、 Terraform 管理下に置かれます。便利。

:::message

`import` ブロックについては以下の記事をご参照ください。

- [Terraform 1.5 で追加される import ブロックの使い方](https://zenn.dev/kou_pg_0131/articles/tf-import-block)

:::

# まとめ

[GoogleCloudPlatform/terraformer](https://github.com/GoogleCloudPlatform/terraformer) みたいなことが公式にできるようになるんですね〜。

# 参考

https://developer.hashicorp.com/terraform/cli/v1.14.x/commands/query
https://developer.hashicorp.com/terraform/language/v1.14.x/import/bulk
https://zenn.dev/terraform_jp/articles/2025-09-19_terraform_v1_14_beta1_list_resource

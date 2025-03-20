---
title: "Terraform 1.8 から使える Provider-defined Function を試してみる"
emoji: "🔨"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["terraform"]
published: true
published_at: 2024-03-08 18:00
---

Terraform 1.8 のベータ版がリリースされています。

https://github.com/hashicorp/terraform/releases/tag/v1.8.0-beta1

今まで Terraform 内で使える関数は[ビルトイン](https://developer.hashicorp.com/terraform/language/functions)のものだけでしたが、 Terraform 1.8 からは **Provider が提供する独自の関数 = Provider-defined Function を利用できるようになります**。アツい。
本日リリースされた AWS v5.40.0 でもさっそく Provider-defined Function がいくつか提供されていたので試してみました。

# 検証環境

- Terraform 1.8.0-beta1
- AWS Provider 5.40.0

# 試してみる

## 準備

Provider-defined Function を使うためには `required_providers` ブロックで Provider が宣言されている必要があります。
今回は AWS Provider の v5.40.0 を使いたいので次のように書きました。

```tf:providers.tf
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "5.40.0"
    }
  }
}
```

:::message

`required_providers` ブロックで Provider を宣言せずに Provider-defined Function を使おうとすると次のようなエラーが表示されます。

```
╷
│ Error: Unknown provider function
│
│   on outputs.tf line 2, in output "arn_parse_example":
│    2:   value = provider::aws::arn_parse("arn:aws:ec2:us-east-1:123456789012:vpc/vpc-0e9801d129EXAMPLE")
│
│ There is no function named "provider::aws::arn_parse". Ensure that provider name "aws" is declared in this module's
│ required_providers block, and that this provider offers a function named "arn_parse".
╵
```

:::

`terraform init` しておきます。

```sh
$ terraform init
```

## Provider-defined Function を使ってみる

Provider-defined Function は次のような形式で呼び出します。

```tf
provider::<プロバイダ名>::<関数名>()
```

今回は AWS Provider v5.40.0 で追加された 2 つの Provider-defined Function を試してみます。

- `arn_parse`
- `arn_build`

### `arn_parse`

https://registry.terraform.io/providers/hashicorp/aws/latest/docs/functions/arn_parse

`arn_parse` は ARN 文字列をパースして Object に変換する関数です。
引数には ARN 文字列を渡します。

```tf
# こういう感じ
provider::aws::arn_parse("<ARN>")
```

実際に `output` ブロックで使ってみます。

```tf:outputs.tf
output "arn_parse_example" {
  value = provider::aws::arn_parse("arn:aws:ec2:us-east-1:123456789012:vpc/vpc-0e9801d129EXAMPLE")
}
```

```sh
$ terraform apply
```

Output は次のように出力されました。

```tf:出力
Outputs:

arn_parse_example = {
  "account_id" = "123456789012"
  "partition" = "aws"
  "region" = "us-east-1"
  "resource" = "vpc/vpc-0e9801d129EXAMPLE"
  "service" = "ec2"
}
```

おお〜。

例えば ARN 文字列からリージョンを抜き出したいときなどは次のように書けます。便利。

```tf
provider::aws::arn_parse("<ARN>").region
# => us-east-1
```

### `arn_build`

https://registry.terraform.io/providers/hashicorp/aws/latest/docs/functions/arn_build

`arn_build` は ARN の各要素を指定して ARN 文字列を生成する関数です。

```tf
# こういう感じ
provider::aws::arn_build("<PARTITION>", "<SERVICE>", "<REGION>", "<ACCOUNT_ID>", "<RESOURCE>")
```

実際に `output` ブロックで使ってみます。

```tf:outputs.tf
output "arn_build_example" {
  value = provider::aws::arn_build("aws", "ec2", "us-east-1", "123456789012", "vpc/vpc-0e9801d129EXAMPLE")
}
```

```sh
$ terraform apply
```

Output は次のように出力されました。

```tf:出力
Outputs:

arn_build_example = "arn:aws:ec2:us-east-1:123456789012:vpc/vpc-0e9801d129EXAMPLE"
```

おお〜。

# まとめ

んんんん、素敵です！！

# 参考

https://github.com/hashicorp/terraform/releases/tag/v1.8.0-beta1
https://github.com/hashicorp/terraform-provider-aws/releases/tag/v5.40.0
https://registry.terraform.io/providers/hashicorp/aws/latest/docs/functions/arn_build
https://registry.terraform.io/providers/hashicorp/aws/latest/docs/functions/arn_parse

---
title: "【Terraform】AWS Provider v6 からはリソースレベルでリージョンを設定できる"
emoji: "🌏"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["terraform", "aws"]
publication_name: "terraform_jp"
published: true
published_at: 2025-05-08 18:00
---

<!-- textlint-disable ja-technical-writing/ja-no-mixed-period -->

Terraform AWS Provider v6 の beta 版がリリースされました！ 🎉 🎉

<!-- textlint-enable ja-technical-writing/ja-no-mixed-period -->

https://www.hashicorp.com/en/blog/terraform-aws-provider-tops-4-billion-downloads-6-0-now-in-public-beta
https://github.com/hashicorp/terraform-provider-aws/releases/tag/v6.0.0-beta1

```hcl
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "6.0.0-beta1"
    }
  }
}
```

AWS Provider v6 の目玉はなんといっても**リソースレベルのリージョン設定**です。

- [Terraform AWS Provider Enhanced Region Support](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/guides/enhanced-region-support)

https://github.com/hashicorp/terraform-provider-aws/issues/41101
https://github.com/hashicorp/terraform-provider-aws/issues/25308

# 今まで : 複数のリージョンを扱うのは面倒だった

AWS Provider v5 以前では、異なるリージョンにリソースを作成するためには**リージョンごとに provider を定義**して、リソースの `provider` 属性に明示的に指定する必要がありました。

```hcl
# ap-northeast-1 用の provider をデフォルトとして使う
provider "aws" {
  region = "ap-northeast-1"
}

# us-east-1 用の provider を定義 (めんどくさい)
provider "aws" {
  alias  = "virginia"
  region = "us-east-1"
}

# ap-northeast-1 にリソースを作成
resource "aws_cloudfront_distribution" "main" {
  # ...
}

# us-east-1 にリソースを作成
resource "aws_acm_certificate" "main" {
  provider = aws.virginia # us-east-1 用の provider を指定

  # ...
}
```

また、 Terraform では **provider に対して `for_each` を使用できない**という制約もあり、複数リージョンにまとめてリソースを作成したいときもなかなか大変でした。

```hcl
provider "aws" {
  region = "ap-northeast-1"
}

provider "aws" {
  alias  = "virginia"
  region = "us-east-1"
}

resource "aws_s3_bucket" "main" {
  # これはエラーになる
  for_each = toset([aws, aws.virginia])
  provider = each.value

  bucket_prefix = "bucket-"
}
```

```hcl
variable "regions" {
  type    = list(string)
  default = ["ap-northeast-1", "us-east-1"]
}

provider "aws" {
  # これもエラーになる
  for_each = toset(var.regions)
  region   = each.value
}

resource "aws_s3_bucket" "main" {
  # こういうこともできない
  for_each = toset(var.regions)
  provider = aws[each.key]

  bucket_prefix = "bucket-"
}
```

:::message

ちなみに OpenTofu ( Terraform の fork プロジェクト ) では v1.9 から provider に対して `for_each` が使用できるようになったそうです。

- [OpenTofu 1.9.0 is available now with provider for_each | OpenTofu](https://opentofu.org/blog/opentofu-1-9-0/)

:::

---

そんな感じで、 **AWS Provider で複数のリージョンを扱うのは結構面倒**でした。

# AWS Provider v6 : `region` 属性の登場

AWS Provider v6 では **リソースに対して `region` 属性を設定するだけ**で**リソースレベルでリージョンを指定できる**ようになり、**複数の provider を定義する必要がなくなりました**。
`region` 属性を省略した場合は ( 今まで通り ) provider に設定されたリージョンが適用されます。

```hcl diff
 provider "aws" {
   region = "ap-northeast-1" # デフォルトのリージョン
 }

-provider "aws" {
-  alias  = "virginia"
-  region = "us-east-1"
-}

 # ap-northeast-1 にリソースを作成
 resource "aws_cloudfront_distribution" "main" {
   # ...
 }

 # us-east-1 にリソースを作成
 resource "aws_acm_certificate" "main" {
-  provider = aws.virginia
+  region = "us-east-1" # リソースレベルでリージョンを指定

   # ...
 }
```

この `region` 属性はあくまでもただの属性なので、 **`for_each` と組み合わせて使用する**ことで**複数リージョンにまとめてリソースを作成**したりすることもできます。

```hcl
provider "aws" {
  # ...
}

resource "aws_s3_bucket" "main" {
  # 複数リージョンにまとめてリソースを作成
  for_each = toset(["ap-northeast-1", "ap-northeast-2", "us-east-1"])
  region   = each.value

  bucket = "bucket-${each.value}"
}
```

例えば複数リージョンでの GuardDuty 一括有効化などのユースケースもかなり楽になりそうですね。

## Data Source / Ephemeral Resource

`resource` ブロックだけじゃなく、 Data Source や Ephemeral Resource などでも同様に `region` 属性を設定できます。

```hcl
provider "aws" {
  region = "ap-northeast-1"
}

data "aws_s3_bucket" "virginia" {
  region = "us-east-1" # これ
  bucket = "virginia-bucket"
}

ephemeral "aws_ssm_parameter" "virginia" {
  region = "us-east-1" # これ
  arn    = "arn:aws:ssm:us-east-1:012345678910:parameter/virginia-parameter"
}
```

## import

import 実行時には import id の末尾に `@<region>` を追加することでリージョンを指定できます。

```sh:terraform import コマンドの例
$ terraform import aws_vpc.example vpc-00000000@us-east-1
```

```hcl:import ブロックの例
import {
  to = aws_vpc.example
  id = "vpc-00000000@us-east-1"
}
```

## `region` 属性を設定できないリソース

一部のリソース ( 例えばメタデータリソースやグローバルリソースなど ) には `region` 属性を設定できません。
`region` 属性を設定できないリソースの一覧については以下をご参照ください。

- [Non-region-aware resources](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/guides/enhanced-region-support#:~:text=Non%E2%80%93region%2Daware%20resources,-This%20section%20lists)

---

また、 v6 へのアップグレードガイドも公開されています。

- [Terraform AWS Provider Version 6 Upgrade Guide](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/guides/version-6-upgrade)

`region` 属性以外にも色々と破壊的変更が含まれているので、一度確認しておくといいかもしれません。
( もちろん現在はまだ beta 版なので、今後さらに変更が加わる可能性もあることにご注意ください。 )

# まとめ

リソースレベルでリージョンを指定できるようになることで **provider の定義をひとつにまとめることができる**ようになり、且つ**複数のリージョンを動的に扱うことも容易**になります。

複数リージョンを動的に扱うために provider に対して `for_each` を使えるようにするのではなく、あくまでも**単一の provider 定義だけで済む**設計に持っていったのは非常に納得感があります。

> Currently, each provider configuration in Terraform targets a single AWS Region, leading to increased memory consumption and complexity when managing multi-Region deployments. The new approach leverages an injected region attribute at the resource level, reducing memory overhead and simplifying configuration.
> 
> _Key Highlights:_
> - Single Provider Configuration: Reduces the need to load multiple instances of the AWS provider, lowering memory usage.
> ...
> > [[Major Version]: Terraform AWS Provider v6.0.0](https://github.com/hashicorp/terraform-provider-aws/issues/41101)

AWS Provider v6 はまずは 6 週間の beta 期間が設けられ、その間にフィードバックを集めつつ正式リリースへ向けて改善が進められていくようです。

> There will be a 6 week beta period in which we will ask the community for feedback, to better understand the impact of the upgrade experience, to assess the implementation of multi-region and other enhancements and to resolve any issues found.
> > [[Major Version]: Terraform AWS Provider v6.0.0](https://github.com/hashicorp/terraform-provider-aws/issues/41101)

<!-- textlint-disable ja-technical-writing/ja-no-mixed-period -->

楽しみ〜

<!-- textlint-enable ja-technical-writing/ja-no-mixed-period -->

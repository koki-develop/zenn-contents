---
title: "【Terraform】AWS Provider v6 からはリソース単位でリージョンを設定できる"
emoji: "🌏"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["terraform", "aws"]
publication_name: "terraform_jp"
published: false
---

Terraform AWS Provider v6 の beta 版がリリースされています。

TODO: link

AWS Provider v6 の目玉はなんといっても**リソース単位のリージョン設定**です。

https://github.com/hashicorp/terraform-provider-aws/issues/41101
https://github.com/hashicorp/terraform-provider-aws/issues/25308

# Terraform で複数のリージョンを扱うのは面倒だった

今までは Terraform で異なるリージョンにリソースを作成するためには、**リージョンごとに provider を定義**して、それぞれのリソースの `provider` 属性に明示的に指定する必要がありました。

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

また、 **provider に対しては `for_each` を使用できない**という制限もあり、複数リージョンにまとめてリソースを作成したいときも結構大変でした。

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

そんな感じで、 **Terraform で複数のリージョンを扱うのは結構面倒**でした。

:::message

ちなみに OpenTofu (Terraform の fork プロジェクト) では v1.9 から provider に対して `for_each` が使用できるようになったそうです。

- [OpenTofu 1.9.0 is available now with provider for_each | OpenTofu](https://opentofu.org/blog/opentofu-1-9-0/)

:::

# AWS Provider v6 : `region` 属性の登場

それに対して、 AWS Provider v6 では **リソースに対して `region` 属性を設定するだけ**で**リソース単位でリージョンを指定できる**ようになり、**複数の provider を定義する必要がなくなりました**。
`region` 属性を省略した場合は (今まで通り) デフォルトのリージョンが適用されます。

```hcl diff
 # ap-northeast-1 用の provider をデフォルトとして使う
 provider "aws" {
   region = "ap-northeast-1"
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

また、この `region` 属性はあくまでもただの属性なので、 **`for_each` と組み合わせて使用する**ことで**複数リージョンにまとめてリソースを作成**したりすることもできます。

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

例えば全リージョンでの GuardDuty 一括有効化などのユースケースもかなり楽になりそうですね。
う〜ん、非常に良きです。

# まとめ

リソース単位でリージョンを指定できるようになることで **provider の定義をひとつにまとめることができる**ようになり、且つ**複数のリージョンを動的に扱うことも容易**になります。

複数リージョンを動的に扱うために provider に対して `for_each` を使わせてほしいとずっと思っていましたが、そうではなくあくまでも**単一の provider 定義だけで済む**設計に持っていったのは非常に納得感があります。

> Currently, each provider configuration in Terraform targets a single AWS Region, leading to increased memory consumption and complexity when managing multi-Region deployments. The new approach leverages an injected region attribute at the resource level, reducing memory overhead and simplifying configuration.
> 
> _Key Highlights:_
> - Single Provider Configuration: Reduces the need to load multiple instances of the AWS provider, lowering memory usage.
> ...
> > [[Major Version]: Terraform AWS Provider v6.0.0](https://github.com/hashicorp/terraform-provider-aws/issues/41101)

AWS Provider v6 はまずは 6 週間の beta 期間が設けられ、その間にフィードバックを集めつつ正式リリースへ向けて改善が進められていくようです。

> There will be a 6 week beta period in which we will ask the community for feedback, to better understand the impact of the upgrade experience, to assess the implementation of multi-region and other enhancements and to resolve any issues found.
> > [[Major Version]: Terraform AWS Provider v6.0.0](https://github.com/hashicorp/terraform-provider-aws/issues/41101)

待ちきれない！！！！

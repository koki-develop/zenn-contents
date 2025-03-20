---
title: "【Terraform】aws_iam_role リソースの inline_policy ブロックが非推奨になった"
emoji: "🚧"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["terraform", "aws"]
publication_name: terraform_jp
published: true
published_at: 2024-09-24 18:00
---

先日 AWS Provider の v5.68.0 がリリースされました。

https://github.com/hashicorp/terraform-provider-aws/releases/tag/v5.68.0

リリースノートを確認してみると次のように記載されています。

> - resource/aws\_iam\_role: The `inline_policy` argument is deprecated. Use the `aws_iam_role_policy` resource instead. If Terraform should exclusively manage all inline policy associations (the current behavior of this argument), use the `aws_iam_role_policies_exclusive` resource as well. ([#39203](https://github.com/hashicorp/terraform-provider-aws/pull/39203))

どうやら `aws_iam_role` リソースの `inline_policy` ブロックが非推奨になったようです。

```hcl:example.tf
resource "aws_iam_role" "example" {
  # ...省略

  # ↓これが非推奨になった
  inline_policy {
    name   = "example-inline-policy"
    policy = data.aws_iam_policy_document.example_inline_policy.json
  }
}

data "aws_iam_policy_document" "example_inline_policy" {
  # ...省略
}
```

```sh
$ terraform plan
# ...省略

# ↓このような警告が出る
╷
│ Warning: Argument is deprecated
│
│   with aws_iam_role.example,
│   on main.tf line 5, in resource "aws_iam_role" "example":
│    5: resource "aws_iam_role" "example" {
│
│ Use the aws_iam_role_policy resource instead. If Terraform should exclusively
│ manage all inline policy associations (the current behavior of this argument),
│ use the aws_iam_role_policies_exclusive resource as well.
╵

# ...省略
```

# 要約

- IAM ロールのインラインポリシーを作成する場合は `aws_iam_role_policy` リソースを使用する
- 排他的な管理を行いたい場合は `aws_iam_role_policies_exclusive` リソースを併用する

# 今後はどうするべきなのか？

IAM ロールのインラインポリシーを作るときは `aws_iam_role_policy` リソースを使いましょう。

https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/iam_role_policy

```hcl diff:example.tf
 resource "aws_iam_role" "example" {
   # ...省略

-  inline_policy {
-    name   = "example-inline-policy"
-    policy = data.aws_iam_policy_document.example_inline_policy.json
-  }
 }

+resource "aws_iam_role_policy" "example" {
+  role   = aws_iam_role.example.id
+  name   = "example-inline-policy"
+  policy = data.aws_iam_policy_document.example_inline_policy.json
+}

 data "aws_iam_policy_document" "example_inline_policy" {
   # ...省略
 }
```

# `inline_policy` ブロックと `aws_iam_role_policy` リソースの違い

実は `aws_iam_role` リソースの `inline_policy` ブロックと `aws_iam_role_policy` リソースは挙動が少し異なります。
実際に確認してみましょう。

---

まず `inline_policy` ブロックを使用してインラインポリシーを作成します。

```hcl:example.tf
resource "aws_iam_role" "example" {
  # ...省略

  inline_policy {
    name   = "example-inline-policy"
    policy = data.aws_iam_policy_document.example_inline_policy.json
  }
}
```

```sh
$ terraform apply
```

---

そして、この IAM ロールに対して**手動で**新たにインラインポリシーを作成してみます。

```sh
$ aws iam put-role-policy \
    --role-name example-role \
    --policy-name 'MANUALLY_CREATED_POLICY' \
    --policy-document '{"Version": "2012-10-17", "Statement": [{"Action": "ec2:DescribeInstances", "Effect": "Allow", "Resource": "*"}]}'
```

![](/images/tf-aws-iam-role-inline-policy-deprecation/manually-created-policy.png)
_AWS マネジメントコンソール_

---

この状態で `terraform plan` / `terraform apply` を実行してみると、**手動で作成したインラインポリシーが削除される**ことが確認できます。

```sh
$ terraform plan
# ...省略

  # aws_iam_role.example will be updated in-place
  ~ resource "aws_iam_role" "example" {
        id                    = "example-role"
        name                  = "example-role"
        tags                  = {}
        # (12 unchanged attributes hidden)

      # ↓手動で作成したインラインポリシーが削除される
      - inline_policy {
          - name   = "MANUALLY_CREATED_POLICY" -> null
          - policy = jsonencode(
                {
                  - Statement = [
                      - {
                          - Action   = "ec2:DescribeInstances"
                          - Effect   = "Allow"
                          - Resource = "*"
                        },
                    ]
                  - Version   = "2012-10-17"
                }
            ) -> null
        }

        # (1 unchanged block hidden)
    }

# ...省略
```

このように、 `aws_iam_role` リソースの `inline_policy` ブロックはインラインポリシーを排他的に管理するため、**他の場所で作成されているインラインポリシーを削除します**。
これにより「**この IAM ロールのインラインポリシーはここで定義しているものが全て**」ということを表現することができます。
`aws_iam_role_policy` リソース単体ではこのような管理はできません。

:::message

この仕様を利用して、空の `inline_policy` ブロックを作成することで「常に全てのインラインポリシーを削除する」というハックがあったりもします。

```hcl:example.tf
resource "aws_iam_role" "example" {
  # ...省略

  # インラインポリシーが存在する場合、全て削除される
  inline_policy {}
}
```

:::

`aws_iam_role_policy` リソースを使用してインラインポリシーの排他的な管理を行いたい場合は、 v5.68.0で新たに追加された **`aws_iam_role_policies_exclusive` リソース**を併用する必要があります。

# `aws_iam_role_policies_exclusive` リソース

`aws_iam_role_policies_exclusive` リソースを使うことで、 IAM ロールのインラインポリシーを排他的に管理することができます。

https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/iam_role_policies_exclusive

こんな感じで使用します。

```hcl diff:example.tf
 resource "aws_iam_role" "example" {
   # ...省略
 }

 resource "aws_iam_role_policy" "example" {
   role   = aws_iam_role.example.id
   name   = "example-inline-policy"
   policy = data.aws_iam_policy_document.example_inline_policy.json
 }

+resource "aws_iam_role_policies_exclusive" "example" {
+  role_name = aws_iam_role.example.name
+
+  # 管理するインラインポリシーの一覧
+  # ここで指定していないインラインポリシーは全て削除される
+  policy_names = [aws_iam_role_policy.example.name]
+}

 data "aws_iam_policy_document" "example_inline_policy" {
   # ...省略
 }
```

```sh
$ terraform plan
# ...省略

  # aws_iam_role_policies_exclusive.example will be updated in-place
  ~ resource "aws_iam_role_policies_exclusive" "example" {
      ~ policy_names = [
          # ↓手動で作成したインラインポリシーが削除される
          - "MANUALLY_CREATED_POLICY",
            # (1 unchanged element hidden)
        ]
        # (1 unchanged attribute hidden)
    }

# ...省略
```

`inline_policy` ブロックを使うのと比べて、「排他的に管理する」という意図がより明確になっていいですね。

# 参考

https://github.com/hashicorp/terraform-provider-aws/releases/tag/v5.68.0
https://github.com/hashicorp/terraform-provider-aws/pull/39203
https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/iam_role_policy
https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/iam_role_policies_exclusive

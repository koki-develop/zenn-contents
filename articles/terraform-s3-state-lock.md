---
title: "Terraform v1.10 からは S3 Backend の State Lock に DynamoDB が必要なくなる"
emoji: "🔓"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["terraform", "aws"]
published: true
published_at: 2024-10-21 18:00
publication_name: "terraform_jp"
---

先日こんなポストを見かけました。

https://x.com/minamijoyo/status/1846482460848357470

これまでは Terraform の Backend に S3 を使用している場合、 State Lock を有効化するためには DynamoDB テーブルを用意する必要がありました。

```hcl:backend.tf
terraform {
  backend "s3" {
    bucket         = "tf-s3-state-lock-example-tfstate"
    key            = "terraform.tfstate"
    dynamodb_table = "example-state-lock-table" # これが必要だった
  }
}
```

Terraform v1.10 からは、 **S3 Backend の設定に `use_lockfile = true` を追加するだけで State Lock を有効化することができるようになります**。 ( **DynamoDB テーブルは不要** )

```hcl diff:backend.tf
 terraform {
   backend "s3" {
     bucket       = "tf-s3-state-lock-example-tfstate"
     key          = "terraform.tfstate"
+    use_lockfile = true # これだけで State Lock が有効化される
-    dynamodb_table = "example-state-lock-table" # こっちは不要
   }
 }
```

この機能は v1.10 から実験的に導入されます。
そしてこの機能追加に伴い、**従来の DynamoDB テーブルを使用した State Lock の機能は将来的に削除されます**。

> In a future minor version the DynamoDB locking mechanism will be removed.
> > [github.com/hashicorp/terraform/website/docs/language/backend/s3.mdx](https://github.com/hashicorp/terraform/blob/5279e432611752a9bcba27baaf657a3305c226f8/website/docs/language/backend/s3.mdx#state-locking)

---

この記事では S3 Backend の DynamoDB テーブルを使用しない新しい State Lock を試してみます。

なお、 Terraform の State Lock についての詳細は公式ドキュメントをご参照ください。

https://developer.hashicorp.com/terraform/language/state/locking

# 検証環境

- Terraform : コミット [`2e4a62d92906399cf8e079e0513fde9df14b2537`](https://github.com/hashicorp/terraform/tree/2e4a62d92906399cf8e079e0513fde9df14b2537)

# 新しい State Lock を試してみる

## 1. tfstate を保存するための S3 バケットを用意

まずは tfstate を保存するための S3 バケットを作成しておきます。
今回は `tf-s3-state-lock-example-tfstate` という名前で作成しました。

```sh
$ aws s3api create-bucket --bucket tf-s3-state-lock-example-tfstate
```

## 2. S3 Backend の設定を作成

続いて S3 Backend の設定を作成します。
ここで **`use_lockfile = true` を設定します**。

```hcl:backend.tf
terraform {
  backend "s3" {
    bucket       = "tf-s3-state-lock-example-tfstate"
    key          = "terraform.tfstate"
    use_lockfile = true # これ！
  }
}
```

## 3. State Lock の動作確認

適当なリソースを作成する Terraform コードを作成します。

```hcl:main.tf
resource "terraform_data" "main" {
  input = "Hello, world"
}
```

続いて `terraform apply` を実行します。
このとき、**実行確認の `yes` は入力せずに一旦止めておきます**。

```sh
$ terraform apply
```

```sh:出力
Terraform used the selected providers to generate the following execution plan.
Resource actions are indicated with the following symbols:
  + create

Terraform will perform the following actions:

  # terraform_data.main will be created
  + resource "terraform_data" "main" {
      + id     = (known after apply)
      + input  = "Hello, world"
      + output = (known after apply)
    }

Plan: 1 to add, 0 to change, 0 to destroy.

Do you want to perform these actions?
  Terraform will perform the actions described above.
  Only 'yes' will be accepted to approve.

  Enter a value: # yes は入力しないでおく
```

---

この状態で tfstate を保存するための S3 バケット ( 今回は `tf-s3-state-lock-example-tfstate` ) の中身を見てみると、 **`<tfstateファイル名>.tflock` というファイルが作成されている**ことが確認できます。

```sh
$ aws s3 ls s3://tf-s3-state-lock-example-tfstate/
2024-10-20 22:50:20        244 terraform.tfstate.tflock
```

中身は通常の tflock ファイルと同じ形式です。

```sh
$ aws s3 cp s3://tf-s3-state-lock-example-tfstate/terraform.tfstate.tflock -
```

```json:terraform.tfstate.tflock
{
  "ID": "********-****-****-****-************",
  "Operation": "OperationTypeApply",
  "Info": "",
  "Who": "<USER_NAME>@<HOST_NAME>",
  "Version": "1.10.0",
  "Created": "2024-10-20T13:50:16.753423Z",
  "Path": "tf-s3-state-lock-example-tfstate/terraform.tfstate"
}
```

ここで試しに、先ほどとは別のセッションから `terraform apply` を実行してみるとエラーが発生し、 **State Lock が有効になっている**ことが確認できます。

```sh
$ terraform apply
```

```:出力
╷
│ Error: Error acquiring the state lock
│
│ Error message: operation error S3: PutObject, https response error StatusCode:
│ 412, RequestID: ****************, HostID:
│ ****************************************************************************,
│ api error PreconditionFailed: At least one of the pre-conditions you specified
│ did not hold
│ Lock Info:
│   ID:        ********-****-****-****-************
│   Path:      tf-s3-state-lock-example-tfstate/terraform.tfstate
│   Operation: OperationTypeApply
│   Who:       <USER_NAME>@<HOST_NAME>
│   Version:   1.10.0
│   Created:   2024-10-20 13:50:16.753423 +0000 UTC
│   Info:
│
│
│ Terraform acquires a state lock to protect the state from being written
│ by multiple users at the same time. Please resolve the issue above and try
│ again. For most commands, you can disable locking with the "-lock=false"
│ flag, but this is not recommended.
╵
```

その後、一時停止中の `terraform apply` を最後まで実行するかもしくはキャンセルすると、 **`.tflock` ファイルは S3 バケットから削除されます**。

```sh
$ aws s3 ls s3://tf-s3-state-lock-example-tfstate/
# .tflock ファイルが削除されている
```

---

ちなみに `terraform force-unlock <LOCK_ID>` も問題なく動作します。

```sh
$ terraform force-unlock ********-****-****-****-************
```

```:出力
Do you really want to force-unlock?
  Terraform will remove the lock on the remote state.
  This will allow local Terraform commands to modify this state, even though it
  may still be in use. Only 'yes' will be accepted to confirm.

  Enter a value: yes

Terraform state has been successfully unlocked!

The state has been unlocked, and Terraform commands should now be able to
obtain a new lock on the remote state.
```

```sh
$ aws s3 ls s3://tf-s3-state-lock-example-tfstate/
# .tflock ファイルが削除されている
```

# まとめ

今までは DynamoDB テーブルを作るのが面倒で State Lock の有効化をサボりがちだったので、 S3 バケットだけで完結できるようになるのはかなり嬉しいですね。
v1.10 のリリースが楽しみです。

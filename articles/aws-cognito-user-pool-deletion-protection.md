---
title: "Cognito ユーザープールに削除保護を設定できるようになったので試してみた"
emoji: "🐙"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["aws", "cognito", "terraform"]
published: true
---

Cognito ユーザープールに削除保護を設定できるようになりました。

https://aws.amazon.com/jp/about-aws/whats-new/2022/10/amazon-cognito-console-user-pool-deletion-protection/

削除保護の設定方法と、削除保護が有効なときに削除しようとしたときの挙動を調べてみました。

# 削除保護を有効にする手順

## Terraform から設定する場合

:::message
AWS Provider のバージョンが [4.38.0](https://registry.terraform.io/providers/hashicorp/aws/4.38.0) 以上である必要があります。
:::

[`aws_cognito_user_pool`](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/cognito_user_pool) Resource の [`deletion_protection`](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/cognito_user_pool#deletion_protection) Argument を `ACTIVE` に設定することで削除保護を有効にできます。

```tf:cognito.tf
resource "aws_cognito_user_pool" "main" {
  # ... 省略
  deletion_protection = "ACTIVE"
}
```

## マネジメントコンソールから設定する場合

削除保護を有効にしたいユーザープールをクリックします。

![](/images/aws-cognito-user-pool-deletion-protection/to_details.png)

`ユーザープールのプロパティ` タブをクリックします。

![](/images/aws-cognito-user-pool-deletion-protection/to_property_tab.png)

`削除保護` という項目があるので、 `アクティブ化` をクリックします。

![](/images/aws-cognito-user-pool-deletion-protection/click_activate.png)

確認ダイアログが表示されるので、 `アクティブ化` をクリックします。

![](/images/aws-cognito-user-pool-deletion-protection/activate.png)

これで削除保護が有効になりました。

![](/images/aws-cognito-user-pool-deletion-protection/activated.png)

# 削除しようとしてみる

しまった！！手が滑って `aws cognito-idp delete-user-pool` を実行してしまった！！

```sh
$ aws cognito-idp delete-user-pool --user-pool-id <ユーザープールID>
```

```:出力
An error occurred (InvalidParameterException) when calling the DeleteUserPool operation: The user pool cannot be deleted because deletion protection is activated. Deletion protection must be inactivated first.
```

おお〜。

しまった！！足が滑って `terraform destroy` を実行してしまった！！

```sh
$ terraform destroy -auto-approve
```

```:出力
# ...省略
aws_cognito_user_pool.main: Destroying... [id=<ユーザープールID>]
╷
│ Error: error deleting Cognito user pool (<ユーザープールID>): InvalidParameterException: The user pool cannot be deleted because deletion protection is activated. Deletion protection must be inactivated first.
│
│
╵
```

おお〜。

こんな感じで、削除保護を解除しない限りはどうあがいても Cognito ユーザープールを削除できません。

# まとめ

安心！！

# 参考

https://docs.aws.amazon.com/ja_jp/cognito/latest/developerguide/user-pool-settings-deletion-protection.html
https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/cognito_user_pool

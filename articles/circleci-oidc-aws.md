---
title: "CircleCI で OIDC を使用して AWS 認証を行う"
emoji: "🌩"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["circleci", "aws", "cicd"]
published: true
---

[CircleCI Advent Calendar 2022](https://qiita.com/advent-calendar/2022/circleci) の 7 日目です。

https://qiita.com/advent-calendar/2022/circleci

# 概要

CircleCI では OpenID Connect (OIDC) がサポートされています。
OIDC を使用することで長期間有効なアクセスキーなどを用意することなく AWS 認証を行うことが可能です。

詳細については下記ページをご参照ください。

https://circleci.com/docs/ja/openid-connect-tokens/
https://circleci.com/ja/blog/openid-connect-identity-tokens/

この記事では CircleCI で OIDC を使用して AWS 認証を行うまでの手順をまとめます。

# リポジトリ

この記事内で使用しているサンプルコードは下記リポジトリで管理しています。

https://github.com/koki-develop/circleci-oidc-example

# 手順

## 1. CircleCI の組織 ID とプロジェクト ID を確認する

あとで必要になるので CircleCI の組織 ID とプロジェクト ID を確認してひかえておきます。

### 組織 ID

左サイドメニューから `Organization Settings` をクリックして組織の設定画面に遷移します。

![](/images/circleci-aws-oidc/to-organization-settings.png)

`Overview` で `Organization ID` が表示されているので、こちらをひかえておきます。

![](/images/circleci-aws-oidc/get-organization-id.png)

### プロジェクト ID

左サイドメニューから `Projects` をクリックしてプロジェクト一覧画面に遷移し、任意のプロジェクトを選択してください。
今回は [circleci-oidc-example](https://github.com/koki-develop/circleci-oidc-example) を使用するのでこちらを選択します。
プロジェクトのセットアップが済んでいない場合はセットアップしておきます。

![](/images/circleci-aws-oidc/to-project.png)

`Project Settings` をクリックしてプロジェクトの設定画面に遷移します。

![](/images/circleci-aws-oidc/to-project-settings.png)

`Overview` に `Project ID` が表示されているので、こちらをひかえておきます。

![](/images/circleci-aws-oidc/get-project-id.png)

## 2. ID プロバイダを追加する

OIDC に使用する ID プロバイダを AWS で追加します。

:::details Terraform で追加する場合のサンプルコード

```tf
data "http" "circleci_openid_configuration" {
  url = "https://oidc.circleci.com/org/<組織ID>/.well-known/openid-configuration"
}

data "tls_certificate" "circleci" {
  url = jsondecode(data.http.circleci_openid_configuration.response_body).jwks_uri
}

resource "aws_iam_openid_connect_provider" "circleci" {
  url             = "https://oidc.circleci.com/org/<組織ID>"
  client_id_list  = [var.circleci_organization_id]
  thumbprint_list = data.tls_certificate.circleci.certificates[*].sha1_fingerprint
}
```

:::

IAM コンソールから `ID プロバイダ` → `プロバイダを追加` の順にクリックして ID プロバイダの追加画面に遷移します。

![](/images/circleci-aws-oidc/to-add-id-provider.png)

各項目を次のように入力します。

| 項目 | 値 |
| --- | --- |
| `プロバイダのタイプ` | `OpenID Connect` |
| `プロバイダの URL` | `https://oidc.circleci.com/org/<組織ID>`<br/>( 入力後、 `サムプリントを取得` をクリックします。 ) |
| `対象者` | 組織 ID |

![](/images/circleci-aws-oidc/get-thumbprint.png)

各項目を入力して `プロバイダの URL` の `サムプリントを取得` をクリックしたら `プロバイダを追加` をクリックします。

![](/images/circleci-aws-oidc/add-id-provider.png)

これで CircleCI 用の ID プロバイダが追加されます。

## 3. IAM ロールを作成する

CircleCI で使用する IAM ロールを AWS で作成します。

:::details Terraform で作成する場合のサンプルコード

```tf
data "aws_iam_policy_document" "circleci_assume_role_policy" {
  statement {
    effect  = "Allow"
    actions = ["sts:AssumeRoleWithWebIdentity"]
    principals {
      type        = "Federated"
      identifiers = [aws_iam_openid_connect_provider.circleci.arn]
    }
    condition {
      test     = "StringLike"
      variable = "oidc.circleci.com/org/<組織ID>:sub"
      values   = ["org/<組織ID>/project/<プロジェクトID>/user/*"]
    }
  }
}

resource "aws_iam_role" "circleci" {
  name               = "circleci-oidc-example-role"
  assume_role_policy = data.aws_iam_policy_document.circleci_assume_role_policy.json
}

# 任意のポリシーをアタッチする
# AmazonS3ReadOnlyAccess をアタッチする例
resource "aws_iam_role_policy_attachment" "circleci_s3_readonly" {
  role       = aws_iam_role.circleci.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonS3ReadOnlyAccess"
}
```

:::

IAM コンソールから `ロール` → `ロールを作成` の順にクリックしてロールの作成画面に遷移します。

![](/images/circleci-aws-oidc/to-create-iam-role.png)

### 信頼ポリシーを設定

`信頼されたエンティティタイプ` に `カスタム信頼ポリシー` を選択し、 `カスタム信頼ポリシー` を入力します。

![](/images/circleci-aws-oidc/set-assume-policy.png)

`カスタム信頼ポリシー` には次のような JSON を入力します。
`<AWSアカウントID>` 、 `<組織ID>` 、 `<プロジェクトID>` の部分を適切に書き換えてください。

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "",
            "Effect": "Allow",
            "Principal": {
                "Federated": "arn:aws:iam::<AWSアカウントID>:oidc-provider/oidc.circleci.com/org/<組織ID>"
            },
            "Action": "sts:AssumeRoleWithWebIdentity",
            "Condition": {
                "StringLike": {
                    "oidc.circleci.com/org/<組織ID>:sub": "org/<組織ID>/project/<プロジェクトID>/user/*"
                }
            }
        }
    ]
}
```

この中で特に重要なのは `Condition` です。

```json:Condition
"Condition": {
    "StringLike": {
        "oidc.circleci.com/org/<組織ID>:sub": "org/<組織ID>/project/<プロジェクトID>/user/*"
    }
}
```

このようにすることで特定の CircleCI プロジェクトからのみ認証を許可することができます。
`Condition` を設定しなくとも ID プロバイダ自体に組織 ID の情報が含まれているので他人の組織から認証されることはありませんが、とはいえプロジェクトまでしっかり絞り込んでおいた方がいいので設定しておきましょう。

`カスタム信頼ポリシー` を入力したら `次へ` をクリックします。

### IAM ロールにポリシーをアタッチ

任意のポリシーをアタッチします。
今回は例として `AmazonS3ReadOnlyAccess` ポリシーをアタッチしておきます。
アタッチするポリシーを選択したら `次へ` をクリックします。

![](/images/circleci-aws-oidc/attach-policy.png)

### ロール名を設定して作成

`ロール名` に任意のロール名を入力して `ロールを作成` をクリックします。
今回は `circleci-oidc-example-role` としておきます。

![](/images/circleci-aws-oidc/create-role.png)

これで IAM ロールが作成されます。

## 4. CircleCI で Context を作成する

CircleCI で OpenID Connect ID トークンを使用するには Job に 1 つ以上の Context を設定する必要があります。

https://circleci.com/docs/ja/openid-connect-tokens/#openid-connect-id-token-availability

Job に設定するための Context を作成します。

左サイドメニューから `Organization Settings` をクリックして組織の設定画面に遷移します。

![](/images/circleci-aws-oidc/to-organization-settings.png)

`Contexts` → `Create Context` の順にクリックすると Context の作成ダイアログが表示されます。

![](/images/circleci-aws-oidc/to-create-context.png)

`Context Name` に任意の Context 名を入力して `Create Context` をクリックします。
今回は `aws` としておきます。

![](/images/circleci-aws-oidc/create-context.png)

これで Context が作成されます。

:::message
Context は複数のプロジェクト間で環境変数のセットを共有するための機能ですが、今回は特に何も設定せず空のままで構いません。
もしくは、使用する AWS の IAM ロールの ARN を Context に設定しておくことで複数プロジェクトで容易に使い回せるようにしてもいいかもしれません。
:::

## 5. CircleCI で OIDC を使用して AWS 認証を行う

AWS 認証には CircleCI 公式の [`circleci/aws-cli`](https://circleci.com/developer/ja/orbs/orb/circleci/aws-cli) Orb の [`assume-role-with-web-identity`](https://circleci.com/developer/ja/orbs/orb/circleci/aws-cli#commands-assume-role-with-web-identity) コマンドを使用するのが一番楽です。
`role-arn` に IAM ロールの ARN を指定するだけで OIDC を使用した AWS 認証を行ってくれます。

下記は OIDC を使用して AWS 認証を行った後にプライベートな S3 バケットのオブジェクト一覧を取得するワークフローのサンプルコードです。
Job に先ほど作成した Context を設定しないと OIDC を使用できないことに注意してください。

```yaml:.circleci/config.yml
version: 2.1

orbs:
  aws-cli: circleci/aws-cli@3.1.3

jobs:
  aws-oidc:
    machine:
      image: ubuntu-2204:current
    steps:
      - aws-cli/assume-role-with-web-identity:
          role-arn: arn:aws:iam::<AWSアカウントID>:role/<IAMロール名> # 作成した IAM ロールの ARN

      # プライベートな S3 バケットを読み取ってみる
      - run: aws s3 ls s3://oidc-example

workflows:
  oidc:
    jobs:
      - aws-oidc:
          context: aws # Context を設定しないと OIDC が使用できないので注意
```

AWS リソースにアクセスできていることが確認できます。

![](/images/circleci-aws-oidc/log.png)

# まとめ

漏洩等によるセキュリティリスクを回避するためにも AWS アクセスキーは発行しないに越したことはありません。
CI/CD で AWS 認証を行う際には OIDC を使用してより安全なパイプラインを構築しましょう。

# 参考

https://circleci.com/docs/ja/openid-connect-tokens/

---
title: "GitHub Actions から ECR に Docker イメージを push する"
emoji: "🐳"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["githubactions", "aws", "ecr", "terraform", "docker"]
published: true
---

備忘録。

# サンプルコード

今回紹介するサンプルコードは以下のリポジトリで管理しています。

https://github.com/koki-develop/github-actions-ecr-push-example

# 準備

## 1. GitHub Actions 用の ID プロバイダと IAM ロールを作成する

GitHub Actions で OIDC を使用して AWS 認証を行うために、下記ドキュメントを参考に ID プロバイダと IAM ロールを作成します。

https://zenn.dev/kou_pg_0131/articles/gh-actions-oidc-aws

今回は例として `github-actions-ecr-push-example-role` という名前で IAM ロールを作成しました。

![](/images/gh-actions-ecr-push-image/iam-role.png)

## 2. ECR リポジトリを作成する

Docker イメージを push する ECR リポジトリを作成します。

:::details Terraform で作成する場合のサンプルコード

```tf
resource "aws_ecr_repository" "example" {
  name = "example-repository"
}
```

:::

ECR のリポジトリ一覧画面に遷移します。
`リポジトリを作成` をクリックしてリポジトリの作成画面に遷移します。

![](/images/gh-actions-ecr-push-image/to-new-repository.png)

各項目を次のように入力します。

| 項目 | 値 |
| --- | --- |
| `可視性設定` | `プライベート` |
| `リポジトリ名` | 任意のリポジトリ名。<br/>今回は例として `example-repository` としておきます。 |

他の項目は必要に応じて設定します。
それぞれ入力できたら `リポジトリを作成` をクリックします。
これで ECR リポジトリが作成されます。

![](/images/gh-actions-ecr-push-image/create-repository.png)

## 3. GitHub Actions 用の IAM ロールに必要な権限を付与する

ECR リポジトリに Docker イメージを push するために必要な権限を GitHub Actions 用の IAM ロールに付与します。
IAM ポリシーを作成してアタッチしてもいいのですが、今回はサクッとインラインポリシーを作成する手順を記載します。

:::details Terraform で作成する場合のサンプルコード

```tf
resource "aws_iam_role_policy" "example" {
  name   = "allow-ecr-push-image"
  role   = "<GitHub Actions用のIAMロール名>"
  policy = data.aws_iam_policy_document.example_policy.json
}

data "aws_iam_policy_document" "example_policy" {
  # ECR ログインに必要
  statement {
    effect    = "Allow"
    actions   = ["ecr:GetAuthorizationToken"]
    resources = ["*"]
  }

  # `docker push` に必要
  statement {
    effect = "Allow"
    actions = [
      "ecr:CompleteLayerUpload",
      "ecr:UploadLayerPart",
      "ecr:InitiateLayerUpload",
      "ecr:BatchCheckLayerAvailability",
      "ecr:PutImage",
    ]
    resources = ["<ECRリポジトリのARN>"]
  }
}
```

:::

IAM ロールの一覧画面に遷移します。
「[1. GitHub Actions 用の ID プロバイダと IAM ロールを作成](#1.-github-actions-用の-id-プロバイダと-iam-ロールを作成)」手順で作成した IAM ロールをクリックして IAM ロールの詳細画面に遷移します。

![](/images/gh-actions-ecr-push-image/to-iam-role.png)

`許可を追加` → `インラインポリシーを作成` の順にクリックしてインラインポリシーの作成画面に遷移します。

![](/images/gh-actions-ecr-push-image/to-create-inline-policy.png)

`JSON` タブを選択してポリシーを入力します。

![](/images/gh-actions-ecr-push-image/set-inline-policy.png)

ポリシーには以下のような JSON を入力します。

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Action": "ecr:GetAuthorizationToken",
            "Effect": "Allow",
            "Resource": "*"
        },
        {
            "Action": [
                "ecr:UploadLayerPart",
                "ecr:PutImage",
                "ecr:InitiateLayerUpload",
                "ecr:CompleteLayerUpload",
                "ecr:BatchCheckLayerAvailability"
            ],
            "Effect": "Allow",
            "Resource": "<ECRリポジトリのARN>"
        }
    ]
}
```

`Statement` の中身について簡単に説明します。

`ecr:GetAuthorizationToken` は ECR にログインするために必要なアクションです。
リソースは指定できないため、 `Resource` には `*` を設定します。

```json
        {
            "Action": "ecr:GetAuthorizationToken",
            "Effect": "Allow",
            "Resource": "*"
        },
```

また、 ECR リポジトリに Docker イメージを push するには次のアクションを実行できる権限が必要です。

- `ecr:UploadLayerPart`
- `ecr:PutImage`
- `ecr:InitiateLayerUpload`
- `ecr:CompleteLayerUpload`
- `ecr:BatchCheckLayerAvailability`

https://docs.aws.amazon.com/AmazonECR/latest/userguide/image-push.html

`Resource` には Docker イメージを push する先の ECR リポジトリの ARN を指定します。

```json
        {
            "Action": [
                "ecr:UploadLayerPart",
                "ecr:PutImage",
                "ecr:InitiateLayerUpload",
                "ecr:CompleteLayerUpload",
                "ecr:BatchCheckLayerAvailability"
            ],
            "Effect": "Allow",
            "Resource": "<ECRリポジトリのARN>"
        }
```

ポリシーを入力できたら `ポリシーの確認` をクリックして確認画面に遷移します。

![](/images/gh-actions-ecr-push-image/to-confirm-inline-policy.png)

`名前` に任意のインラインポリシー名を入力します ( 今回は例として `allow-ecr-push-image` としておきます ) 。
`ポリシーの作成` をクリックします。
これでインラインポリシーが作成されます。

![](/images/gh-actions-ecr-push-image/create-inline-policy.png)

## 4. Dockerfile を作成する

Docker イメージをビルドするための Dockerfile を作成します。
今回は例として下記のような Dockerfile を作っておきます。

```dockerfile:Dockerfile
FROM alpine:3
```

## 5. GitHub Actions ワークフローを作成する

OIDC を使用した AWS 認証には [aws-actions/configure-aws-credentials](https://github.com/aws-actions/configure-aws-credentials) アクションを使用します。
また、 ECR へのログインには [aws-actions/amazon-ecr-login](https://github.com/aws-actions/amazon-ecr-login) アクションを使用すると `outputs` から ECR の情報を取れるようになるので便利です。

以下は ECR に Docker イメージを push する GitHub Actions ワークフローのサンプルコードです。

```yaml:.github/workflows/main.yml
name: ecr push image

on:
  push:

jobs:
  push:
    runs-on: ubuntu-latest
    # `permissions` を設定しないと OIDC が使えないので注意
    permissions:
      id-token: write
      contents: read
    steps:
      - uses: actions/checkout@v3

      # AWS 認証
      - uses: aws-actions/configure-aws-credentials@v1
        with:
          aws-region: "<リージョン>"
          role-to-assume: "<GitHub Actions用のIAMロールのARN>"

      # ECR ログイン
      - uses: aws-actions/amazon-ecr-login@v1
        id: login-ecr # outputs で参照するために id を設定

      # Docker イメージを build・push する
      - name: build and push docker image to ecr
        env:
          # ECR レジストリを `aws-actions/amazon-ecr-login` アクションの `outputs.registry` から取得
          REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          # イメージを push する ECR リポジトリ名
          REPOSITORY: "<ECRリポジトリ名>"
          # 任意のイメージタグ
          # 今回は Git のコミットハッシュにしておく
          IMAGE_TAG: ${{ github.sha }}
        run: |
          docker build . --tag ${{ env.REGISTRY }}/${{ env.REPOSITORY }}:${{ env.IMAGE_TAG }}
          docker push ${{ env.REGISTRY }}/${{ env.REPOSITORY }}:${{ env.IMAGE_TAG }}
```

ワークフローの実行が完了すると ECR にイメージが push されていることが確認できます。

![](/images/gh-actions-ecr-push-image/pushed.png)

# 参考

https://github.com/aws-actions/amazon-ecr-login
https://docs.aws.amazon.com/AmazonECR/latest/userguide/image-push.html

---
title: "GitHub Actions で OIDC を使用して Google Cloud へ認証を行う"
emoji: "🌩"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["githubactions", "googlecloud", "oidc", "terraform"]
published: true
---

躓きまくったので備忘録。
AWS はこっち。

https://zenn.dev/kou_pg_0131/articles/gh-actions-oidc-aws

# 概要

GitHub Actions では OpenID Connect (OIDC) がサポートされています。
OIDC を使用することによりサービスアカウントキーなどを用意することなく Google Cloud に対する認証を行うことができます。

詳細については下記ページをご参照ください。

https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/about-security-hardening-with-openid-connect

この記事では GitHub Actions で OIDC を使用して Google Cloud へ認証を行うまでの手順をまとめます。

# リポジトリ

この記事内で使用しているサンプルコードは下記リポジトリで管理しています。

https://github.com/koki-develop/gh-actions-oidc-example

# 手順

## 1. IAM Service Account Credentials API を有効にする

OIDC で認証情報を作成するときには IAM Service Account Credentials API を利用するため、有効にしておく必要があります。

:::details Terraform で有効にする場合のサンプルコード

```tf
resource "google_project_service" "iamcredentials" {
  service = "iamcredentials.googleapis.com"
}
```

:::

:::details gcloud CLI を使用する場合のコマンド

```sh
gcloud services enable iamcredentials.googleapis.com \
  --project="<プロジェクトID>"
```

:::

サイドメニューから `API とサービス` → `ライブラリ` の順にクリックして検索画面に遷移します。

![](/images/gh-actions-oidc-gcp/to_library.png)

検索ボックスに `IAM Service Account Credentials API` と入力して検索します。

![](/images/gh-actions-oidc-gcp/search_api.png)

`IAM Service Account Credentials API` をクリックします。

![](/images/gh-actions-oidc-gcp/searched_api.png)

`有効にする` をクリックします。
これで IAM Service Account Credentials API が有効になります。

![](/images/gh-actions-oidc-gcp/enable_api.png)

## 2. サービスアカウントを作成する

GitHub Actions でアクセス権を借用するためのサービスアカウントを作成します。
ついでにここでアクセス権も付与しておきます。

:::details Terraform で作成する場合のサンプルコード

```tf
resource "google_service_account" "github_actions" {
  account_id = "<任意のID>"
}

# 任意のロールを付与しておく
# roles/storage.objectViewer を付与する例
resource "google_project_iam_member" "github_actions_storage_object_viewer" {
  project = var.project
  role    = "roles/storage.objectViewer"
  member  = "serviceAccount:${google_service_account.github_actions.email}"
}
```

:::

:::details gcloud CLI を使用する場合のコマンド

```sh
# サービスアカウントを作成
gcloud iam service-accounts create "サービスアカウント名" \
  --project="プロジェクトID"

# 任意のロールを付与しておく
# roles/storage.objectViewer を付与する例
gcloud projects add-iam-policy-binding "<プロジェクトID>" \
  --member="serviceAccount:<サービスアカウントのメールアドレス>" \
  --role="roles/storage.objectViewer"
```

:::

サイドメニューから `IAM と管理` → `サービスアカウント` の順にクリックしてサービスアカウント管理画面に遷移します。

![](/images/gh-actions-oidc-gcp/to_service_account.png)

`サービスアカウントを作成` をクリックします。

![](/images/gh-actions-oidc-gcp/to_new_service_account.png)

`サービスアカウント名` と `サービスアカウント ID` に任意の値を入力して `完了` をクリックします。
これでサービスアカウントが作成されます。

![](/images/gh-actions-oidc-gcp/create_service_account.png)

作成したサービスアカウントにアクセス権を付与します。
`IAM と管理` のサイドメニューから `IAM` をクリックしてアクセス権管理画面に遷移します。

![](/images/gh-actions-oidc-gcp/to_iam.png)

`アクセス権を付与` をクリックします。

![](/images/gh-actions-oidc-gcp/to_add_iam_policy_binding.png)

`新しいプリンシパル` に先程作成したサービスアカウントのメールアドレスを入力し、任意のロールを割り当てます。
ここでは例として `Storage オブジェクト閲覧者` ( `roles/storage.objectViewer` ) を割り当てておきます。
それぞれ入力できたら `保存` をクリックします。
これでサービスアカウントにアクセス権が付与されます。

![](/images/gh-actions-oidc-gcp/add_iam_policy_binding.png)

## 3. Workload Identity プール・プロバイダ を作成する

OIDC に使用する Workload Identity プール・プロバイダ を作成します。

:::details Terraform で作成する場合のサンプルコード

```tf
resource "google_iam_workload_identity_pool" "github_actions" {
  workload_identity_pool_id = "<任意のID>"
}

resource "google_iam_workload_identity_pool_provider" "github_actions" {
  workload_identity_pool_provider_id = "<任意のID>"
  workload_identity_pool_id          = google_iam_workload_identity_pool.github_actions.workload_identity_pool_id

  oidc {
    issuer_uri = "https://token.actions.githubusercontent.com"
  }

  attribute_mapping = {
    "google.subject"       = "assertion.sub"
    "attribute.repository" = "assertion.repository"
    "attribute.actor"      = "assertion.actor"
  }
}
```

:::

:::details gcloud CLI を使用する場合のコマンド

```sh
# プールを作成
gcloud iam workload-identity-pools create "<任意のID>" \
  --project="<プロジェクトID>" \
  --location="global"

# プロバイダを作成
gcloud iam workload-identity-pools providers create-oidc "<任意のID>" \
  --project="<プロジェクトID>" \
  --location="global" \
  --workload-identity-pool="<プールID>" \
  --attribute-mapping="google.subject=assertion.sub,attribute.repository=assertion.repository,attribute.actor=assertion.actor" \
  --issuer-uri="https://token.actions.githubusercontent.com"
```

:::

サイドメニューから `IAM と管理` → `Workload Identity 連携` の順にクリックして Workload Identity プールの管理画面に遷移します。

![](/images/gh-actions-oidc-gcp/to_workload_identity.png)

`プールを作成` をクリックします。

![](/images/gh-actions-oidc-gcp/to_new_pool.png)

:::message
Workload Identity プールを作成したことがない場合は次のような画面になります。
`使ってみる` をクリックするとプールの作成画面に遷移します。
![](/images/gh-actions-oidc-gcp/use_workload_identity.png)
:::

`名前` に任意のプール名を入力して `続行` をクリックします。

![](/images/gh-actions-oidc-gcp/create_id_pool.png)

各項目を次のように入力します。

| 項目 | 値 |
| --- | --- |
| `プロバイダの選択` | `OpenID Connect（OIDC）` |
| `プロバイダ名` | 任意のプロバイダ名。 |
| `発行元（URL）` | `https://token.actions.githubusercontent.com` |
| `オーディエンス` | `デフォルトのオーディエンス` |

入力したら `続行` をクリックします。

![](/images/gh-actions-oidc-gcp/add_provider.png)

属性マッピングを次のように設定します。

| Google | OIDC |
| --- | --- |
| `google.subject` | `assertion.sub` |
| `attribute.repository` | `assertion.repository` |
| `attribute.actor` | `assertion.actor` |

マッピングを設定したら `保存` をクリックします。
これで Workload Identity プールとプロバイダが作成されます。

![](/images/gh-actions-oidc-gcp/set_attribute_mapping.png)

## 4. Workload Identity プールからサービスアカウントのアクセス権を借用できるようにする

:::details Terraform で作成する場合のサンプルコード

```tf
resource "google_service_account_iam_member" "github_actions_iam_workload_identity_user" {
  service_account_id = google_service_account.github_actions.id
  role               = "roles/iam.workloadIdentityUser"
  member             = "principalSet://iam.googleapis.com/projects/<プロジェクト番号>/locations/global/workloadIdentityPools/<プールID>/attribute.repository/<GitHubユーザー名>/<GitHubリポジトリ名>"
}
```

:::

:::details gcloud CLI を使用する場合のコマンド

```sh
gcloud iam service-accounts add-iam-policy-binding \
  "<サービスアカウントのメールアドレス>" \
  --project="<プロジェクトID>" \
  --role="roles/iam.workloadIdentityUser" \
  --member="principalSet://iam.googleapis.com/projects/<プロジェクト番号>/locations/global/workloadIdentityPools/<プールID>/attribute.repository/<GitHubユーザー名>/<GitHubリポジトリ名>"
```

:::

後ほど必要になるため、「[3. Workload Identity プール・プロバイダ](#3.-workload-identity-プール・プロバイダ-を作成する)」の手順で作成したプールの IAM プリンシパルを取得しておきます。
サイドメニューから `IAM と管理` → `Workload Identity 連携` の順にクリックして Workload Identity プールの管理画面に遷移します。

![](/images/gh-actions-oidc-gcp/to_workload_identity.png)

先程作成したプールをクリックして詳細画面に遷移します。

![](/images/gh-actions-oidc-gcp/to_pool_details.png)

`IAM プリンシパル` の値を控えておきます。

![](/images/gh-actions-oidc-gcp/copy_principal.png)

続いて、 Workload Identity プールからサービスアカウントのアクセス権を借用できるように設定します。
`IAM と管理` のサイドメニューから `サービスアカウント` をクリックしてサービスアカウント管理画面に遷移します。

![](/images/gh-actions-oidc-gcp/to_service_account_from_pool.png)

「[2. サービスアカウントを作成する](#2.-サービスアカウントを作成する)」の手順で作成したサービスアカウントをクリックします。

![](/images/gh-actions-oidc-gcp/to_service_account_details.png)

`権限` タブをクリックします。

![](/images/gh-actions-oidc-gcp/to_permission_tab.png)

`アクセスを許可` をクリックします。

![](/images/gh-actions-oidc-gcp/click_add_service_account_policy_binding.png)

`新しいプリンシパル` に先程控えておいた Workload Identity プールの IAM プリンシパルを入力し、末尾の `/*` の部分を `/attribute.repository/<GitHubユーザー名>/<GitHubリポジトリ名>` のように書き換えてください。

```
principalSet://iam.googleapis.com/projects/<プロジェクト番号>/locations/global/workloadIdentityPools/<プールID>/*
↓末尾を修正する
principalSet://iam.googleapis.com/projects/<プロジェクト番号>/locations/global/workloadIdentityPools/<プールID>/attribute.repository/<GitHubユーザー名>/<GitHubリポジトリ名>
```

こうすることで、 OIDC による認証を行うことのできるリポジトリを制限しています。
末尾を `/*` にすると**全ての GitHub リポジトリから認証できるようになってしまう**ため、**必ず制限してください**。
ロールには `Workload Identity ユーザー` ( `roles/iam.workloadIdentityUser` ) を割り当ててください。
それぞれ入力できたら `保存` をクリックします。

![](/images/gh-actions-oidc-gcp/add_service_account_policy_binding.png)

## 5. GitHub Actions で OIDC を使用して Google Cloud へ認証を行う

ここまでやってようやくワークフローを作成します。

Google Cloud への認証には [google-github-actions/auth](https://github.com/google-github-actions/auth) アクションを使用します。
サービスアカウントと Workload Identity プールプロバイダの完全修飾識別子を指定するだけで OIDC を使用して Google Cloud に対して認証を行ってくれます。便利。

下記は Google Cloud に対する認証を行った後にプライベートな GCS バケットのオブジェクト一覧を取得するワークフローのサンプルです。
`permissions` に `id-token: write` を設定しないと OIDC を使えないので注意です。

```yaml:.github/workflows/main.yml
name: google cloud

on:
  push:

jobs:
  gsls:
    runs-on: ubuntu-latest
    permissions:
      id-token: write
      contents: read
    steps:
      - uses: google-github-actions/auth@v0
        with:
          workload_identity_provider: 'projects/<プロジェクト番号>/locations/global/workloadIdentityPools/<プールID>/providers/<プロバイダID>'
          service_account: '<サービスアカウントのメールアドレス>'

      # プライベートな GCS バケットを読み取ってみる
      - run: gcloud storage ls gs://oidc-test-bucket-example
```

Google Cloud のリソースにアクセスできています。わーい。

![](/images/gh-actions-oidc-gcp/gsls.png)

# 参考

https://github.com/google-github-actions/auth
https://docs.github.com/ja/actions/deployment/security-hardening-your-deployments/configuring-openid-connect-in-google-cloud-platform
https://zenn.dev/vvakame/articles/gha-and-gcp-workload-identity

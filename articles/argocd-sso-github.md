---
title: "Argo CD に GitHub でログインできるようにする"
emoji: "🌊"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["argocd", "kubernetes", "github"]
published: true
---

# 検証環境

- Argo CD - v2.4.0
- kubectl - v1.24.2
- Kubernetes - v1.23.6

# 準備

こちらの記事を参考に、 Kubernetes クラスタに Argo CD をインストールします。

https://zenn.dev/kou_pg_0131/articles/argocd-getting-started

Argo CD API サーバーをポートフォワーディングしてアクセスできるようにしておきます。

```
$ kubectl port-forward svc/argocd-server -n argocd 8080:443
Forwarding from 127.0.0.1:8080 -> 8080
Forwarding from [::1]:8080 -> 8080
```

https://localhost:8080 にアクセスして Argo CD の UI が表示されれば OK です。

![](/images/argocd-sso-github/argocd-ui.png)

# GitHub OAuth Application を作成する

https://github.com/settings/applications/new にアクセスします。

:::details 画面から移動する場合の操作手順
メニュー → `Settings` の順にクリック。

![](/images/argocd-sso-github/to-new-oauth-app-1.png)

`Developer settings` をクリック。

![](/images/argocd-sso-github/to-new-oauth-app-2.png)

`OAuth Apps` をクリック。

![](/images/argocd-sso-github/to-new-oauth-app-3.png)

`Register a new application` をクリック。

![](/images/argocd-sso-github/to-new-oauth-app-4.png)
:::

`Application name`, `Homepage URL`, `Authorization callback URL` にそれぞれ以下のように入力します。

| 項目 | 値 |
| --- | --- |
| Application name | 任意のアプリケーション名。<br />今回は `Argo CD SSO Example` にしておきます。 |
| Homepage URL | Argo CD API サーバーの URL 。<br />今回は `https://localhost:8080` 。 |
| Authorization callback URL | `{Argo CD APIサーバーのURL}/api/dex/callback` 。<br />今回は `https://localhost:8080/api/dex/callback` 。 |

上記を入力したら `Register application` をクリック。

![](/images/argocd-sso-github/new-oauth-application.png)

`Generate a new client secret` をクリック。

![](/images/argocd-sso-github/created-oauth-application.png)

Client Secret が生成されます。
Client ID と Client Secret は後で必要になるため、ひかえておきます。

![](/images/argocd-sso-github/generated-client-secret.png)

# Argo CD の設定を更新

`argocd-cm` ConfigMap に SSO の設定を追加します。
今回は `kubectl edit` を使って直接編集します。

```
$ kubectl -n argocd edit configmap argocd-cm
```

`data:` に以下のような設定を追加します。
:::message
`dex.config` は文字列であることに注意してください。
:::

```yaml
# ...省略
data:
  url: https://localhost:8080 # Argo CD API サーバーの URL
  dex.config: |
    connectors:
      - type: github
        id: github
        name: GitHub
        config:
          clientID: 09d37046939e752024ab # OAuth Application の Client ID
          clientSecret: eb025cb0e8d948f4f3a9ee585dfdc83581f8c14d # OAuth Application の Client Secret

# ...省略
```

# GitHub でログインする

## CLI 経由

`argocd login {Argo CD API サーバー} --sso` を実行するとブラウザが立ち上がり、認可画面が表示されます。

```
$ argocd login localhost:8080 --sso
Opening browser for authentication
Performing authorization_code flow login: https://localhost:8080/api/dex/auth?access_type=offline&client_id=argo-cd-cli&code_challenge=********&code_challenge_method=S256&redirect_uri=http%3A%2F%2Flocalhost%3A8085%2Fauth%2Fcallback&response_type=code&scope=openid+profile+email+groups+offline_access&state=********
```

`Authorize {ユーザー名}` をクリック。

![](/images/argocd-sso-github/login-via-github-2.png)
*認可画面*

認可に成功すると成功画面が表示されます。
この画面はもう閉じて大丈夫です。

![](/images/argocd-sso-github/loggedin-with-cli.png)
*認可成功画面*

コンソールには以下のようなログが表示されます。

```
Authentication successful
'kou.pg.0131@gmail.com' logged in successfully
Context 'localhost:8080' updated
```

## UI 経由

https://localhost:8080/login にアクセスすると `LOG IN VIA GITHUB` ボタンが表示されているので、クリックします。

![](/images/argocd-sso-github/login-via-github-1.png)
*ログイン画面*

認可画面が表示されます。
`Authorize {ユーザー名}` をクリック。

![](/images/argocd-sso-github/login-via-github-2.png)
*認可画面*

ログインできました。

![](/images/argocd-sso-github/login-via-github-3.png)
*ログイン直後の画面*

# Client Secret を Secret に入れる

Client Secret の値を `argocd-cm` ConfigMap にそのまま入れておくのはセキュリティ上あまりよろしくないので、 Secret に入れます。
Argo CD では `argocd-secret` Secret を使って任意の機密データを保存できます。
詳しい説明は[公式ドキュメント](https://argo-cd.readthedocs.io/en/stable/operator-manual/user-management/#sensitive-data-and-sso-client-secrets)をご参照ください。

今回は `kubectl edit` を使って直接編集します。

```
$ kubectl -n argocd edit secret argocd-secret
```

`data:` に `dex.github.clientSecret: {Client SecretをBase64エンコードした値}` を追加します。

```yaml
# ...省略
data:
  # $ echo -n eb025cb0e8d948f4f3a9ee585dfdc83581f8c14d | base64
  dex.github.clientSecret: ZWIwMjVjYjBlOGQ5NDhmNGYzYTllZTU4NWRmZGM4MzU4MWY4YzE0ZA==

# ...省略
```

最後に `argocd-cm` ConfigMap を、上記の `argocd-secret` の値を参照するように更新します。

```
$ kubectl -n argocd edit configmap argocd-cm
```

```yaml diff
 dex.config: |
   connectors:
     - type: github
       id: github
       name: GitHub
       config:
         clientID: 09d37046939e752024ab
-        clientSecret: eb025cb0e8d948f4f3a9ee585dfdc83581f8c14d
+        clientSecret: $dex.github.clientSecret
```

# 参考

https://argo-cd.readthedocs.io/en/stable/operator-manual/user-management/

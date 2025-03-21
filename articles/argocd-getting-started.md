---
title: "Kubernetes クラスタに Argo CD をインストールして動かす"
emoji: "🍣"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["argocd", "kubernetes"]
published: true
published_at: 2022-06-19 20:00
---

仕事で Argo CD について勉強したので、基本的な使い方メモ。

# 検証環境

- Argo CD - v2.4.0
- Kind - v0.12.0
- kubectl - v1.24.2
- Kubernetes - v1.23.6
- Helm - v3.9.0

# 準備

## Kubernetes クラスタを作成

今回は [kind](https://kind.sigs.k8s.io/) を使ってローカルに Kubernetes クラスタを作成します。
以下の設定ファイルを使ってクラスタを作成します。

```yaml:kind.yaml
apiVersion: kind.x-k8s.io/v1alpha4
kind: Cluster
nodes:
- role: control-plane
  image: kindest/node:v1.23.6
```

```
$ kind create cluster --config kind.yaml
Creating cluster "kind" ...
 ✓ Ensuring node image (kindest/node:v1.23.6) 🖼
 ✓ Preparing nodes 📦
 ✓ Writing configuration 📜
 ✓ Starting control-plane 🕹️
 ✓ Installing CNI 🔌
 ✓ Installing StorageClass 💾
Set kubectl context to "kind-kind"
You can now use your cluster with:

kubectl cluster-info --context kind-kind

Have a question, bug, or feature request? Let us know! https://kind.sigs.k8s.io/#community 🙂
```

## Argo CD CLI をインストール

今回は基本的に CLI から Argo CD を操作するため、 CLI をインストールしておきます。
Homebrew 経由でインストールできます。

```
$ brew install argocd
```

他のインストール方法については[公式ドキュメント](https://argo-cd.readthedocs.io/en/stable/cli_installation/) をご参照ください。

# Kubernetes クラスタに Argo CD をインストール

## namespace を作成

まず Argo CD をインストールする namespace を作成する必要があります。
`kubectl` を使用して `argocd`  namespace を作成します。

```
$ kubectl create namespace argocd
namespace/argocd created
```

## Argo CD をインストール

Argo CD のインストール方法には 2 通りあります。

- マニフェストを使う ( `kubectl apply` )
- helm チャートを使う

### マニフェストを使う場合

公式が提供している[マニフェスト](https://github.com/argoproj/argo-cd/blob/stable/manifests/install.yaml)があるので、こちらを `kubectl apply` します。

```
$ kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
```

### helm チャートを使う場合

こちらも公式が提供している [helm チャート](https://github.com/argoproj/argo-helm)があるので、こちらをインストールします。

```
$ helm repo add argo https://argoproj.github.io/argo-helm
$ helm install -n argocd argocd argo/argo-cd
```

## Argo CD API サーバーにアクセス

Argo CD API サーバーはデフォルトでは外部 IP で公開されていません。
アクセスするには以下の方法があります。

- [Argo CD API サーバーのサービスの type を `LoadBalancer` に変更する](https://argo-cd.readthedocs.io/en/stable/getting_started/#service-type-load-balancer)
- [Ingress を利用する](https://argo-cd.readthedocs.io/en/stable/getting_started/#ingress)
- [kubectl のポートフォワーディングを利用する](https://argo-cd.readthedocs.io/en/stable/getting_started/#port-forwarding)

今回は一番手軽な「kubectl のポートフォワーディングを利用する」方法を取ります。
他の方法については[公式ドキュメント](https://argo-cd.readthedocs.io/en/stable/getting_started/#3-access-the-argo-cd-api-server)をご参照ください。

```
$ kubectl port-forward svc/argocd-server -n argocd 8080:443
Forwarding from 127.0.0.1:8080 -> 8080
Forwarding from [::1]:8080 -> 8080
```

https://localhost:8080 から Argo CD API サーバーにアクセスできます。

![](/images/argocd-getting-started/ui.png)
*Argo CD*

# Argo CD 管理者アカウントでログイン

Argo CD では管理者アカウントとして admin というユーザーがデフォルトで用意されています。
今回はこの admin ユーザーで操作を進めていきます。
admin ユーザー以外のユーザーを追加・管理する方法については[公式ドキュメント](https://argo-cd.readthedocs.io/en/stable/operator-manual/user-management/)をご参照ください。

## admin ユーザーの初期パスワードを取得

admin ユーザーの初期パスワードは `argocd-initial-admin-secret` という名前の Secret に入っています。
以下のコマンドで初期パスワードを確認できます。

```
$ kubectl -n argocd get secret/argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d; echo
WFk9fslhg3lATGoC
```

今回の admin ユーザーの初期パスワードは `WFk9fslhg3lATGoC` です。

## ログイン

以下の情報を利用してログインできます。

| 項目 | 値 |
| --- | --- |
| ユーザー名 | `admin` |
| パスワード | 先程取得した初期パスワード<br/>( 今回の場合は `WFk9fslhg3lATGoC` ) |

`argocd login {Argo CD API サーバー}` を実行すると対話形式でユーザー名とパスワードを聞かれます。
( もしくは `--username`, `--password` フラグに値を直接指定して実行することもできます )

```
$ argocd login localhost:8080
Username: admin
Password:
'admin:login' logged in successfully
Context 'localhost:8080' updated
```

## admin ユーザーのパスワードを変更

admin ユーザーを初期パスワードのまま運用するのはあまりよろしくないので、パスワードを変更しておきます。
`argocd account update-password` を実行すると対話形式でパスワードを変更できます。
( もしくは `--current-password`, `--new-password` フラグに値を直接指定して実行することもできます )

```
$ argocd account update-password
*** Enter password of currently logged in user (admin):
*** Enter new password for user admin:
*** Confirm new password for user admin:
Password updated
Context 'localhost:8080' updated
```

## 初期パスワードが入った Secret を削除

パスワードを変更したら、初期パスワードが入った `argocd-initial-admin-secret` Secret はもう必要無いので削除しておきます。


```
$ kubectl --namespace argocd delete secret/argocd-initial-admin-secret
secret "argocd-initial-admin-secret" deleted
```

# Argo CD アプリケーションを作成

CLI を使ってアプリケーションを作成していきます。
今回はアプリケーションには公式が用意している [guestbook](https://github.com/argoproj/argocd-example-apps/tree/master/guestbook) を使います。

`argocd app create` でアプリケーションを作成できます。

```
$ argocd app create {任意のアプリケーション名} --repo {リポジトリのURL.git} --path {リポジトリ内のアプリケーションのパス} --dest-server {デプロイ先のクラスタのURL} --dest-namespace {デプロイ先の namespace }
```

今回は同一クラスタ内の `default`  namespace にデプロイするので、以下のように実行します。
**この時点ではまだアプリケーションはクラスタ内にデプロイされません。**

```
$ argocd app create guestbook --repo https://github.com/argoproj/argocd-example-apps.git --path guestbook --dest-server https://kubernetes.default.svc --dest-namespace default
application 'guestbook' created
```

`argocd app list` でアプリケーションの一覧を表示できます。

```
$ argocd app list
NAME       CLUSTER                         NAMESPACE  PROJECT  STATUS     HEALTH   SYNCPOLICY  CONDITIONS  REPO                                                 PATH       TARGET
guestbook  https://kubernetes.default.svc  default    default  OutOfSync  Missing  <none>      <none>      https://github.com/argoproj/argocd-example-apps.git  guestbook
```

`argocd app get {アプリケーションの名前}` でアプリケーションの詳細な情報を表示できます。
`Sync Status` が `OutOfSync` となっており、まだアプリケーションが同期 ( デプロイ ) されていない状態であることが確認できます。

```
$ argocd app get guestbook
Name:               guestbook
Project:            default
Server:             https://kubernetes.default.svc
Namespace:          default
URL:                https://localhost:8080/applications/guestbook
Repo:               https://github.com/argoproj/argocd-example-apps.git
Target:
Path:               guestbook
SyncWindow:         Sync Allowed
Sync Policy:        <none>
Sync Status:        OutOfSync from  (53e28ff)
Health Status:      Missing

GROUP  KIND        NAMESPACE  NAME          STATUS     HEALTH   HOOK  MESSAGE
       Service     default    guestbook-ui  OutOfSync  Missing
apps   Deployment  default    guestbook-ui  OutOfSync  Missing
```

# アプリケーションを同期 ( デプロイ )

`argocd app sync {アプリケーション名}` でアプリケーションを同期 ( デプロイ ) できます。

```
$ argocd app sync guestbook
TIMESTAMP                  GROUP        KIND   NAMESPACE                  NAME    STATUS    HEALTH        HOOK  MESSAGE
2022-06-19T16:07:57+09:00            Service     default          guestbook-ui  OutOfSync  Missing
2022-06-19T16:07:57+09:00   apps  Deployment     default          guestbook-ui  OutOfSync  Missing
2022-06-19T16:07:57+09:00            Service     default          guestbook-ui  OutOfSync  Missing              service/guestbook-ui created
2022-06-19T16:07:57+09:00   apps  Deployment     default          guestbook-ui  OutOfSync  Missing              deployment.apps/guestbook-ui created
2022-06-19T16:07:57+09:00            Service     default          guestbook-ui    Synced  Healthy                  service/guestbook-ui created
2022-06-19T16:07:57+09:00   apps  Deployment     default          guestbook-ui    Synced  Progressing              deployment.apps/guestbook-ui created

Name:               guestbook
Project:            default
Server:             https://kubernetes.default.svc
Namespace:          default
URL:                https://localhost:8080/applications/guestbook
Repo:               https://github.com/argoproj/argocd-example-apps.git
Target:
Path:               guestbook
SyncWindow:         Sync Allowed
Sync Policy:        <none>
Sync Status:        Synced to  (53e28ff)
Health Status:      Progressing

Operation:          Sync
Sync Revision:      53e28ff20cc530b9ada2173fbbd64d48338583ba
Phase:              Succeeded
Start:              2022-06-19 16:07:57 +0900 JST
Finished:           2022-06-19 16:07:57 +0900 JST
Duration:           0s
Message:            successfully synced (all tasks run)

GROUP  KIND        NAMESPACE  NAME          STATUS  HEALTH       HOOK  MESSAGE
       Service     default    guestbook-ui  Synced  Healthy            service/guestbook-ui created
apps   Deployment  default    guestbook-ui  Synced  Progressing        deployment.apps/guestbook-ui created
```

Kubernetes クラスタ内に色々リソースが作成されることを確認できます。

```
$ kubectl get deploy,svc -l app.kubernetes.io/instance=guestbook
NAME                           READY   UP-TO-DATE   AVAILABLE   AGE
deployment.apps/guestbook-ui   1/1     1            1           68s

NAME                   TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)   AGE
service/guestbook-ui   ClusterIP   10.96.203.220   <none>        80/TCP    68s
```

しばらく待つとアプリケーションが起動するので、ポートフォワーディングしてサンプルアプリにアクセスしてみます。

```
$ kubectl port-forward svc/guestbook-ui 8081:80
Forwarding from 127.0.0.1:8081 -> 80
Forwarding from [::1]:8081 -> 80
```

http://localhost:8081 からサンプルアプリにアクセスできます。

![](/images/argocd-getting-started/guestbook.png)
*サンプルアプリ*

# まとめ

便利。

# 参考

https://argo-cd.readthedocs.io/en/stable/getting_started/

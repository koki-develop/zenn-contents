---
title: "GitHub の Secret scanning’s push protection を試してみる"
emoji: "🔑️"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["github", "secret"]
published: true
published_at: 2023-05-10 19:00
---

GitHub の Secret scanning's push protection がパブリックリポジトリで無料で使えるようになりました 🎉🎉🎉

https://github.blog/changelog/2023-05-09-secret-scannings-push-protection-is-available-on-public-repositories-for-free/

Secret scanning's push protection を使うと、例えば AWS のアクセスキーなどといったシークレットをリポジトリへ push するのをブロックすることができます。
シークレットの commit 防止のためには [git-secrets](https://github.com/awslabs/git-secrets) のようなツールもありますが、こういったものは個人の開発環境の設定に依存します。
チーム開発なども考慮すると、リポジトリレベルでシークレットの push を防止できるのは大変ありがたいですね。

GitHub の Secret scanning は AWS のアクセスキー以外にも多くのシークレットがサポートされています。
サポートされているシークレットについては下記ページをご参照ください。

https://docs.github.com/ja/code-security/secret-scanning/secret-scanning-patterns#supported-secrets

この記事では Secret scanning's push protection を有効にする手順と、実際に動作確認してみた結果をまとめます。

- [Secret scanning's push protection を有効にする手順](#secret-scanning's-push-protection-を有効にする手順)
- [動作確認してみる](#動作確認してみる)

# Secret scanning's push protection を有効にする手順

## リポジトリ単位で有効にする手順

:::details 手順

`Settings` をクリックしてリポジトリの設定画面に繊維します。

![](/images/gh-secret-scannings-push-protection/to-settings.png)

左メニューから `Code security and analysis` をクリックして、下の方にある `Secret scanning` の `Enable` をクリックします。
これで Secret scanning が有効化されます。

![](/images/gh-secret-scannings-push-protection/enable-secret-scanning.png)

Secret scanning を有効にすると `Push protection` というのが出てくるので、こちらも `Enable` をクリックします。
これで Secret scanning's push protection が有効化されます。

![](/images/gh-secret-scannings-push-protection/enable-push-protection.png)

:::

## 全てのリポジトリで一括で有効にする手順 ( 個人アカウント )

:::details 手順

個人の設定画面の [Code security and analysis](https://github.com/settings/security_analysis) に遷移します。

下の方に `Push protection` というのがあるので、 `Enable all` をクリックします。

![](/images/gh-secret-scannings-push-protection/enable-all-personal-1.png)

`Enable for eligible repositories` をクリックします。

![](/images/gh-secret-scannings-push-protection/enable-all-personal-2.png)

これで対象となる全てのリポジトリで Secret scanning's push protection が有効になります。

:::

## 全てのリポジトリで一括で有効にする手順 ( Organization )

:::details 手順

Organization の設定画面で左メニューから `Code security and analysis` をクリックして、下の方にある `Push protection` の `Enable all` をクリックします。

![](/images/gh-secret-scannings-push-protection/enable-all-org-1.png)

`Enable for eligible repositories` をクリックします。

![](/images/gh-secret-scannings-push-protection/enable-all-org-2.png)

これで対象となる全てのリポジトリで Secret scanning's push protection が有効になります。

:::

# 動作確認してみる

まずは `secrets` という名前で次のようなファイルを作成してみます。

```sh:secrets
# *** の部分は本物のアクセスキーに差し替えます
AWS_ACCESS_KEY_ID=AKIA****************
AWS_SECRET_ACCESS_KEY=****************************************
```

commit します。

```sh
$ git add ./secrets
$ git commit -m 'leak secrets!!'

# git-secrets を使ってる場合は `--no-verify` で突破する
$ git commit -m 'leak secrets!!' --no-verify
```

push してみます。

```sh
$ git push origin main
```

```:出力
Enumerating objects: 4, done.
Counting objects: 100% (4/4), done.
Delta compression using up to 8 threads
Compressing objects: 100% (2/2), done.
Writing objects: 100% (3/3), 337 bytes | 337.00 KiB/s, done.
Total 3 (delta 0), reused 0 (delta 0), pack-reused 0
remote: error GH009: Secrets detected! This push failed.
remote:
remote:             GITHUB PUSH PROTECTION (beta)
remote: ——————————————————————————————————————————————————————
remote:  Resolve the following secrets before pushing again.
remote:
remote:  (?) Learn how to resolve a blocked push
remote:  https://docs.github.com/code-security/secret-scanning/pushing-a-branch-blocked-by-push-protection
remote:
remote:
remote: —— Amazon AWS Access Key ID ——————————————————————————
remote:  locations:
remote:    - commit: ****************************************
remote:      path: secrets:1
remote:
remote:  (?) To push, remove secret from commit(s) or follow this URL to allow the secret.
remote:  http://github.com/koki-develop/secret-scannings-push-protection-example/security/secret-scanning/unblock-secret/***************************
remote:
remote:
remote: —— Amazon AWS Secret Access Key ——————————————————————
remote:  locations:
remote:    - commit: ****************************************
remote:      path: secrets:2
remote:
remote:  (?) To push, remove secret from commit(s) or follow this URL to allow the secret.
remote:  http://github.com/koki-develop/secret-scannings-push-protection-example/security/secret-scanning/unblock-secret/***************************
remote:
remote:
remote:
To github.com:koki-develop/secret-scannings-push-protection-example.git
 ! [remote rejected] main -> main (push declined due to a detected secret)
error: failed to push some refs to 'github.com:koki-develop/secret-scannings-push-protection-example.git'
```

ブロックされました！
シークレットの種類、コミット、場所がそれぞれ出力されていることが確認できます。

```:ブロックされたシークレットの情報
remote: —— Amazon AWS Access Key ID ——————————————————————————
remote:  locations:
remote:    - commit: ****************************************
remote:      path: secrets:1
remote:
remote:  (?) To push, remove secret from commit(s) or follow this URL to allow the secret.
remote:  http://github.com/koki-develop/secret-scannings-push-protection-example/security/secret-scanning/unblock-secret/***************************
```

また、よく見ると `http://github.com/<ユーザー>/<リポジトリ>/security/secret-scanning/unblock-secret/***************************` のような URL が表示されています。
この URL からはブロックされたシークレットの push を許可することができます。
実際に URL にアクセスしてみると次のような画面になります。

![](/images/gh-secret-scannings-push-protection/allow-access-key-id.png)

許可する理由を選択してから `Allow me push this secret` をクリックするとシークレットの push を許可することができます。

![](/images/gh-secret-scannings-push-protection/secret-allowed.png)

もう一度 push を実行してみると今度はブロックされませんでした。

```sh
$ git push origin main
```

すると、 push した直後に次のようなメールが届きました。
Secret scanning's push protection を回避してシークレットを push した場合はその旨もちゃんと通知してくれるみたいです。

![](/images/gh-secret-scannings-push-protection/notification.png)
_通知メール_

# まとめ

これはかなりありがたい！！！！！

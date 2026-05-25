---
title: "【GitHub Actions】actions/checkout には persist-credentials: false を設定するべき"
emoji: "🔑"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["github", "githubactions", "security"]
published: true
published_at: 2026-05-25 18:00
---

## 結論

`actions/checkout` アクションを使用する際は、`persist-credentials: false` を設定するべきです。

```yaml
- uses: actions/checkout@de0fac2e4500dabe0009e67214ff5f5447ce83dd # v6.0.2
  with:
    # ↓これ
    persist-credentials: false # デフォルトは true
```

## なんで？

後続ステップからファイル経由であっさり GitHub トークンを抜き取れてしまうので。

```yaml:.github/workflows/example.yml
on: push

jobs:
  example:
    runs-on: ubuntu-latest
    steps:
      # persist-credentials 未設定
      - uses: actions/checkout@de0fac2e4500dabe0009e67214ff5f5447ce83dd # v6.0.2

      # `${{ github.token }}`, `${{ secrets.GITHUB_TOKEN }}` を使用せずに
      # ファイル経由で GitHub トークンを抜き取る
      - run: |
          GH_TOKEN=$(
            cat "$RUNNER_TEMP"/git-credentials-*.config \
              | awk 'NR==2 {print $5}' \
              | base64 --decode \
              | cut -d: -f2
          )

          # 最初の 10 文字だけ出力
          echo "github token: ${GH_TOKEN:0:10}..."
```

![](/images/gha-checkout-persist-credentials/token.png)
_実行ログ_

もし使用しているリモートアクションが侵害されたりスクリプトインジェクション[^1]を実行されたりした場合、容易に GitHub トークンが抜き取られてしまいます。書き込み系の強い権限を持つトークンだったら目も当てられないことになりますね。

[^1]: 参考: [【GitHub Actions】スクリプトインジェクションの実践例](https://zenn.dev/kou_pg_0131/articles/gha-script-injection)

## `actions/checkout` が作成するファイル

`actions/checkout` アクションは `$RUNNER_TEMP/git-credentials-<UUID>.config` に以下のような設定ファイルを作成します。このファイルはデフォルト (`persist-credentials: true`) では削除されずに、**後続ステップから参照できる状態のまま残ります**。

```ini:$RUNNER_TEMP/git-credentials-<UUID>.config
[http "https://github.com/"]
	extraheader = AUTHORIZATION: basic <Base64エンコード文字列>
```

:::message

他にも `.git/config` を更新したりとかもしますが、そのへんは今回は重要じゃないので割愛します。

:::

`<Base64エンコード文字列>` の部分は **`x-access-token:<GitHubトークン>` を Base64 エンコードしただけの文字列**です。なので、この部分をデコードすれば**簡単に GitHub トークンを抜き取ることができます**。( 冒頭の例を参照 )

`actions/checkout` に `persist-credentials: false` を設定しておけば、チェックアウト完了後にこのファイルは**削除されます**。よって、少なくとも後続ステップからこのファイル経由で GitHub トークンが抜き取られる心配はなくなります。

## Git の認証が必要な場合はどうしたらいいの？

`persist-credentials: false` を設定している場合は Git の認証情報が保存されていないため、そのままでは後続ステップで `git pull` などの Git の認証が必要な操作は失敗します。

```yaml:.github/workflows/example.yml
on: push

jobs:
  example:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@de0fac2e4500dabe0009e67214ff5f5447ce83dd # v6.0.2
        with:
          persist-credentials: false

      # 認証情報がないので失敗する
      - run: git pull origin main
```

![](/images/gha-checkout-persist-credentials/git-pull-failed.png)
_実行ログ_

解決方法はいろいろ考えられますが、シンプルなのは `gh auth setup-git` コマンドを使う方法です。

https://cli.github.com/manual/gh_auth_setup-git

`gh auth setup-git` コマンドは Git の認証情報に GitHub CLI の認証情報を使用するように設定してくれるコマンドです。これを実行すると `~/.gitconfig` に以下のような設定が追加されます。

```ini:~/.gitconfig
[credential "https://github.com"]
	helper = 
	helper = !/usr/bin/gh auth git-credential
[credential "https://gist.github.com"]
	helper = 
	helper = !/usr/bin/gh auth git-credential
```

これにより、**Git の認証情報をファイルに保存することなく**、**必要なタイミングのみで** GitHub トークンを参照することができるようになります。

実際の使用イメージはこんな感じになります。

```yaml:.github/workflows/example.yml
on: push

jobs:
  example:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@de0fac2e4500dabe0009e67214ff5f5447ce83dd # v6.0.2
        with:
          persist-credentials: false

      # credential helper をセットアップ
      - run: gh auth setup-git
        env:
          GH_TOKEN: ${{ github.token }}

      # Git の認証情報が必要なときだけ GH_TOKEN を渡す
      - run: git pull origin main
        env:
          GH_TOKEN: ${{ github.token }}
```

![](/images/gha-checkout-persist-credentials/git-pull-succeed.png)
_実行ログ_

## 設定漏れを検知するために

人間は愚かなので `persist-credentials: false` を設定するのを忘れます。どんなに注意喚起をしても必ず忘れます。人間はそういう生き物です。人間を信用してはいけません。

**静的解析ツールを使ってください**。

[ghasec](https://github.com/koki-develop/ghasec)、[zizmor](https://docs.zizmor.sh), [ghalint](https://github.com/suzuki-shunsuke/ghalint) などの GitHub Actions 用の静的解析ツールは、いずれも **`actions/checkout` アクションに `persist-credentials: false` が設定されていない場合に警告を出します**。

https://github.com/koki-develop/ghasec

```:ghasec の出力例
--> .github/workflows/example.yml:7:15
...
3 | jobs:
4 |   example:
...
6 |     steps:
7 |       - uses: actions/checkout@de0fac2e4500dabe0009e67214ff5f5447ce83dd # v6.0.2
  |               ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ "persist-credentials: false" must be set in "with" (checkout-persist-credentials)
...
  Ref: https://github.com/koki-develop/ghasec/blob/main/rules/checkout-persist-credentials/README.md
```

https://docs.zizmor.sh

```:zizmor の出力例
warning[artipacked]: credential persistence through GitHub Actions artifacts
 --> .github/workflows/example.yml:7:9
  |
7 |       - uses: actions/checkout@de0fac2e4500dabe0009e67214ff5f5447ce83dd # v6.0.2
  |         ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ does not set persist-credentials: false
  |
  = note: audit confidence → Low
  = note: this finding has an auto-fix
```

https://github.com/suzuki-shunsuke/ghalint

```:ghalint の出力例
May 24 14:10:17.386 ERR the step violates policies program=ghalint version=1.5.6 workflow_file_path=.github/workflows/example.yml policy_name=checkout_persist_credentials_should_be_false reference=https://github.com/suzuki-shunsuke/ghalint/blob/main/docs/policies/013.md job_name=example error="persist-credentials should be false"
```

それぞれのツールの使い方については以下の記事で簡単に紹介しているので、こちらをご参照ください。

https://zenn.dev/kou_pg_0131/articles/ghasec-introduction
https://zenn.dev/kou_pg_0131/articles/gha-static-checker

## まとめ

要するに、静的解析ツールを使ってください。

https://sizu.me/koki_develop/posts/bee4minfae45

---
title: "【GitHub Actions】コミット SHA で固定したアクションのバージョンを更新する"
emoji: "🐕"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["github", "githubactions", "security"]
published: true
published_at: 2026-03-23 18:00
---
https://zenn.dev/kou_pg_0131/articles/gha-should-be-pinned


> ## 「アップデートがめんどくさい」
> 
> 「_**アクションのバージョンを上げるたびにいちいちコミット SHA を確認するのは大変だしめんどくさいよ！**_」
> 
> どうやら世の中には [**Dependabot**](https://docs.github.com/en/code-security/tutorials/secure-your-dependencies/dependabot-quickstart-guide) や [**Renovate**](https://www.mend.io/renovate/) などといった便利なツールがあるらしいですよ。これらはいずれも**コミット SHA 指定のアクションの自動バージョンアップをサポートしている**ようです。
> > [GitHub Actions で参照するアクションはコミット SHA で固定するべき](https://zenn.dev/kou_pg_0131/articles/gha-should-be-pinned#%E3%80%8C%E3%82%A2%E3%83%83%E3%83%97%E3%83%87%E3%83%BC%E3%83%88%E3%81%8C%E3%82%81%E3%82%93%E3%81%A9%E3%81%8F%E3%81%95%E3%81%84%E3%80%8D)

具体的な設定方法をまとめておいた方がよさそうだなと思ったので、まとめます。

# 手動で更新する場合 (pinact)

冒頭の記事内でも書いてあるように、[pinact](https://github.com/suzuki-shunsuke/pinact) を使うのが楽です。

```bash
$ pinact run --update
```

これだけで既存のワークフロー内の全てのアクションが最新のバージョンに更新されます。

```diff yaml:.github/workflows/example.yml
-      - uses: actions/checkout@8e8c483db84b4bee98b60c0593521ed34d9990e8 # v6.0.1
+      - uses: actions/checkout@de0fac2e4500dabe0009e67214ff5f5447ce83dd # v6.0.2
```

ちなみに、リモートアクションのバージョンをコミット SHA で固定する場合、可読性のために該当するバージョンタグをインラインコメントで書いておくことが慣習となっています。

```yaml
# どのバージョンを使ってるのかわからん！！
- uses: actions/checkout@de0fac2e4500dabe0009e67214ff5f5447ce83dd

# どのバージョンを使ってるのかわかる！！
- uses: actions/checkout@de0fac2e4500dabe0009e67214ff5f5447ce83dd # v6.0.2
```

pinact はこのインラインコメントまで含めて更新してくれます。便利。

## pinact による自動更新の対象ファイル

pinact による GitHub Actions の依存関係の更新は、以下のファイルが対象となります。

- `.github/workflows/*.yml`
- `.github/workflows/*.yaml`
- `action.yml`
- `action.yaml`
- `*/action.yml`
- `*/action.yaml`
- `*/*/action.yml`
- `*/*/action.yaml`
- `*/*/*/action.yml`
- `*/*/*/action.yaml`

https://github.com/suzuki-shunsuke/pinact#how-to-use

実行時に任意のファイルを明示的に指定することもできます。

```bash
$ pinact run example.yaml
```

# Dependabot を使う場合

`.github/dependabot.yml` を作成し、`package-ecosystem: github-actions` の設定を追加するだけです。

```yaml:.github/dependabot.yml
version: 2

updates:
  - package-ecosystem: github-actions
    directory: /
    schedule:
      interval: daily # これはお好みで
```

実際に作成された Pull Request はこんな感じです。

![](/images/gha-update-pinned-actions/dependabot.png)

https://github.com/koki-develop/update-pinned-action-example/pull/1

```diff yaml:.github/workflows/example.yml
-      - uses: actions/checkout@8e8c483db84b4bee98b60c0593521ed34d9990e8 # v6.0.1
+      - uses: actions/checkout@de0fac2e4500dabe0009e67214ff5f5447ce83dd # v6.0.2
```

こちらも pinact と同様、コミット SHA だけでなくインラインコメントで書いてあるバージョンタグも更新されます。

## Dependabot による自動更新の対象ファイル

Dependabot による GitHub Actions の依存関係の更新は、以下のファイルが対象となります。

- `.github/workflows/*.yml`
- `.github/workflows/*.yaml`
- `action.yml` (リポジトリルート)
- `action.yaml` (リポジトリルート)

> - For GitHub Actions, use the value `/`. Dependabot will search the `/.github/workflows` directory, as well as the `action.yml/action.yaml` file from the root directory.
> > [Dependabot options reference - GitHub Docs](https://docs.github.com/en/code-security/reference/supply-chain-security/dependabot-options-reference#directories-or-directory--)

デフォルトでは `.github/actions/**/action.{yml,yaml}` などのファイルは**対象外**となることに注意してください。

https://github.com/dependabot/dependabot-core/issues/6704

対象ディレクトリを個別に指定すれば動くようになります。

```diff yaml:.github/dependabot.yml
 version: 2
 
 updates:
   - package-ecosystem: github-actions
     directory: /
     schedule:
       interval: daily

+  # 任意のディレクトリを個別指定
+  - package-ecosystem: github-actions
+    directory: /.github/actions/my-action
+    schedule:
+      interval: daily
```

# Renovate を使う場合

Renovate ではデフォルトで `github-actions` マネージャが有効になっているので、Renovate を有効にするだけで更新が有効になります。

https://docs.renovatebot.com/modules/manager/github-actions/

```json5:renovate.json
// 空設定でも動く
{}
```

![](/images/gha-update-pinned-actions/renovate.png)

https://github.com/koki-develop/update-pinned-action-example/pull/2

```diff yaml:.github/workflows/example.yml
-      - uses: actions/checkout@8e8c483db84b4bee98b60c0593521ed34d9990e8 # v6.0.1
+      - uses: actions/checkout@de0fac2e4500dabe0009e67214ff5f5447ce83dd # v6.0.2
```

こちらも、インラインコメントで書いてあるバージョンタグまで更新されます。

## Renovate による自動更新の対象ファイル

Renovate による GitHub Actions の依存関係の更新は、以下のファイルが対象となります。

- `.github/workflows/**/*.yml`
- `.github/actions/**/*.yml`
- `workflow-templates/**/*.yml`
- `.gitea/workflows/**/*.yml`
- `.forgejo/workflows/**/*.yml`
- `**/action.yml / **/action.yaml`

> By default, Renovate will check any files matching any of the following regular expressions:
> ```
> /(^|/)(workflow-templates|\.(?:github|gitea|forgejo)/(?:workflows|actions))/.+\.ya?ml$/
> /(^|/)action\.ya?ml$/
> ```
> > [Automated Dependency Updates for GitHub Actions - Renovate Docs](https://docs.renovatebot.com/modules/manager/github-actions/#file-matching)

Dependabot とは違って、`.github/actions/**/action.{yml,yaml}` などのファイルにもデフォルトで対応しています。

# Dependabot / Renovate を使う場合の注意点

コミット SHA で固定しているアクションは **Dependabot アラートの検出対象外となります**。なんでやねん。

> Dependabot alerts have some limitations:
> ...
> - For GitHub Actions, alerts are only generated for actions that use semantic versioning, not SHA versioning.
> > [About Dependabot alerts - GitHub Docs](https://docs.github.com/en/code-security/concepts/supply-chain-security/about-dependabot-alerts)

Renovate にも脆弱性アラート検出の機能はありますが、この機能は Dependabot アラートに依存しているため、こちらも**同様の制限を受けます**。

> ## `vulnerabilityAlerts`
> ...
> Renovate can read GitHub's Vulnerability Alerts to customize its Pull Requests. For this to work, you must enable the [Dependency graph](https://docs.github.com/en/code-security/supply-chain-security/understanding-your-software-supply-chain/about-the-dependency-graph#enabling-the-dependency-graph), and [Dependabot alerts](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/enabling-features-for-your-repository/managing-security-and-analysis-settings-for-your-repository).
> > [Configuration Options - Renovate Docs](https://docs.renovatebot.com/configuration-options/#vulnerabilityalerts)

:::message

Renovate にはオープンソースの脆弱性データベースである [OSV](https://osv.dev) と連携した脆弱性検出の機能もありますが、こちらは現時点で GitHub Actions には対応していません。

> ## `osvVulnerabilityAlerts`
> Renovate only queries the OSV database for dependencies that use one of these datasources:
> - [`crate`](https://docs.renovatebot.com/modules/datasource/crate/)
> - [`go`](https://docs.renovatebot.com/modules/datasource/go/)
> - [`hackage`](https://docs.renovatebot.com/modules/datasource/hackage/)
> - [`hex`](https://docs.renovatebot.com/modules/datasource/hex/)
> - [`maven`](https://docs.renovatebot.com/modules/datasource/maven/)
> - [`npm`](https://docs.renovatebot.com/modules/datasource/npm/)
> - [`nuget`](https://docs.renovatebot.com/modules/datasource/nuget/)
> - [`packagist`](https://docs.renovatebot.com/modules/datasource/packagist/)
> - [`pypi`](https://docs.renovatebot.com/modules/datasource/pypi/)
> - [`rubygems`](https://docs.renovatebot.com/modules/datasource/rubygems/)
> > [Configuration Options - Renovate Docs](https://docs.renovatebot.com/configuration-options/#osvvulnerabilityalerts)

:::

なので、「常に即日アップデート！！」のような運用をしていると、万が一最新バージョンに脆弱性が含まれていても気づかずに更新してしまう可能性があります。
対策としては Renovate の [`minimumReleaseAge`](https://docs.renovatebot.com/key-concepts/minimum-release-age/) や Dependabot の [`cooldown`](https://docs.github.com/en/code-security/reference/supply-chain-security/dependabot-options-reference#cooldown-) を有効にして、ある程度リリースから時間が経っているバージョンに更新するようにする、などの運用が考えられます。

# まとめ

今度から「コミット SHA で固定したら自動アップデートできないじゃん」って言われたらこの記事の URL を投げつけます。

# 参考

https://github.com/suzuki-shunsuke/pinact
https://docs.renovatebot.com/modules/manager/github-actions/
https://docs.github.com/en/code-security/how-tos/secure-your-supply-chain/secure-your-dependencies/keeping-your-actions-up-to-date-with-dependabot

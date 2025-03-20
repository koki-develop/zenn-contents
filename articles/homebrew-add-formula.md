---
title: "Homebrew の公式リポジトリに新しい Formula を追加する"
emoji: "🍺"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["homebrew"]
published: true
published_at: 2024-01-29 18:00
---

備忘録！

# 手順

## 1. 公式リポジトリを tap する

Homebrew は[公式のリポジトリ](https://github.com/homebrew/homebrew-core)をローカルにクローンする仕組みを v4 から廃止しました。

https://www.publickey1.jp/blog/23/homebrew_40git_clonejson.html

しかし、新しい Formula を作るには公式リポジトリをクローン (tap) しておく必要があるので、次のコマンドを実行しておきます。

```sh
$ brew tap homebrew/core
$ brew update
```

リポジトリがクローンされる場所は次のコマンドで確認できます。

```sh
$ brew --repository homebrew/core
# 例) /opt/homebrew/Library/Taps/homebrew/homebrew-core
```

## 2. Formula を生成する

`brew create` コマンドで新しい Formula を生成することができます。
引数にはソースコードの tarball の URL を渡し、 `--set-name` フラグに Formula 名を指定します。

```sh
$ brew create --set-name "<Formula名>" "<tarballのURL>"
```

GitHub の場合、 tarball の URL は次のような形式です。

```
https://github.com/<オーナー名>/<リポジトリ名>/archive/<ref>.tar.gz
```

https://docs.github.com/ja/repositories/working-with-files/using-files/downloading-source-code-archives

また、言語によってはテンプレートも用意されています。
例えば Go 製ツールの Formula を生成する場合は `--go` フラグを指定します。

```sh
$ brew create --set-name "<Formula名>" --go "<tarballのURL>"
```

:::message

その他に用意されているテンプレートについてはヘルプをご参照ください。

```sh
$ brew create --help
```

:::

今回は Go 製の「[sheep](https://github.com/koki-develop/sheep)」という CLI を例に Formula を作成してみます。

:::message

[sheep](https://github.com/koki-develop/sheep) について詳しくは次の記事をご参照ください。

- [羊を眠らせる sleep コマンド「sheep」の紹介](https://zenn.dev/kou_pg_0131/articles/sheep-introduction)

:::

```sh
$ brew create --set-name "sheep" --go "https://github.com/koki-develop/sheep/archive/refs/tags/v0.4.0.tar.gz"
```

すると、ローカルの homebrew-core リポジトリ内の `Formula/` ディレクトリに `<Formula名>.rb` という名前で Formula が生成されます。

```sh
$ cat $(brew --repository homebrew/core)/Formula/s/sheep.rb
```

```ruby:homebrew-core/Formula/s/sheep.rb
# Documentation: https://docs.brew.sh/Formula-Cookbook
#                https://rubydoc.brew.sh/Formula
# PLEASE REMOVE ALL GENERATED COMMENTS BEFORE SUBMITTING YOUR PULL REQUEST!
class Sheep < Formula
  desc "🐑 Sleep with Sheep."
  homepage ""
  url "https://github.com/koki-develop/sheep/archive/refs/tags/v0.4.0.tar.gz"
  sha256 "11c3c50b7edd8b22e30dba742a8dcd5a050250ffbe9d60e6eb8d2b64435adb02"
  license "MIT"

  depends_on "go" => :build

  def install
    # ENV.deparallelize  # if your formula fails when building in parallel
    system "go", "build", *std_go_args(ldflags: "-s -w")
  end

  test do
    # `test do` will create, run in and delete a temporary directory.
    #
    # This test will fail and we won't accept that! For Homebrew/homebrew-core
    # this will need to be a test that verifies the functionality of the
    # software. Run the test with `brew test sheep`. Options passed
    # to `brew install` such as `--HEAD` also need to be provided to `brew test`.
    #
    # The installed folder is not in the path, so use the entire path to any
    # executables being tested: `system "#{bin}/program", "do", "something"`.
    system "false"
  end
end
```

見やすいようにコメントを削除しておきます。

```ruby:homebrew-core/Formula/s/sheep.rb
class Sheep < Formula
  desc "🐑 Sleep with Sheep."
  homepage ""
  url "https://github.com/koki-develop/sheep/archive/refs/tags/v0.4.0.tar.gz"
  sha256 "11c3c50b7edd8b22e30dba742a8dcd5a050250ffbe9d60e6eb8d2b64435adb02"
  license "MIT"

  depends_on "go" => :build

  def install
    system "go", "build", *std_go_args(ldflags: "-s -w")
  end

  test do
    system "false"
  end
end
```

ビルドコマンドやその他メタ情報は必要に応じて修正してください。
テストについては後述します。

## 3. Formula を検査する

`brew audit` コマンドで Formula を検査することができます。
新しい Formula を作る場合は `--new` フラグを指定します。

```sh
$ brew audit --new "<Formula名>"

# 例
$ brew audit --new sheep
```

今回の場合は次のように出力されました。

```
sheep
  * line 2, col 9: Description shouldn't contain Unicode emojis or symbols.
  * line 2, col 27: Description shouldn't end with a full stop.
  * line 3, col 12: Formula should have a homepage.
  * GitHub repository not notable enough (<30 forks, <30 watchers and <75 stars)
Error: 4 problems in 1 formula detected.
```

適宜指摘事項を修正します。
今回は次のように修正しました。

```go diff:homebrew-core/Formula/s/sheep.rb
 class Sheep < Formula
-  desc "🐑 Sleep with Sheep."
+  desc "Sleep with Sheep"
-  homepage ""
+  homepage "https://github.com/koki-develop/sheep"
   url "https://github.com/koki-develop/sheep/archive/refs/tags/v0.4.0.tar.gz"
   sha256 "11c3c50b7edd8b22e30dba742a8dcd5a050250ffbe9d60e6eb8d2b64435adb02"
   license "MIT"

   depends_on "go" => :build

   def install
     system "go", "build", *std_go_args(ldflags: "-s -w")
   end

   test do
     system "false"
   end
 end
```

:::message

残る指摘事項は GitHub のスター数が 75 に満たないことですが、今回は実際に Homebrew の公式リポジトリに追加するわけではないので無視します。

:::

## 4. ローカルでインストールして動作確認

次のコマンドで、 Homebrew 経由でローカルの Formula を実際にインストールして動作確認することができます。

```sh
$ HOMEBREW_NO_INSTALL_FROM_API=1 brew install --build-from-source --verbose --debug "<Formula名>"

# 例
$ HOMEBREW_NO_INSTALL_FROM_API=1 brew install --build-from-source --verbose --debug "sheep"
$ sheep
           __  _
       .-:'  `; `-._
      (_,           )
    ,'o"(            )>
   (__,-'            )
      (             )
       `-'._.--._.-'
```

## 5. テストを追加する

Homebrew には Test Bot という、 GitHub Actions 上で自動テストを行うための仕組みが用意されています。

https://docs.brew.sh/Brew-Test-Bot

基本的にはテストを書かないと Formula を公式リポジトリに追加させてもらえない ( Pull Request を出しても Approve してもらえない ) ので、書きます。
テストの具体的な書き方については[公式ドキュメント](https://docs.brew.sh/Formula-Cookbook#add-a-test-to-the-formula)や既存の Formula を参考にしてください。

今回は次のように標準出力を検証するテストを追加しました。

```ruby:homebrew-core/Formula/s/sheep.rb
class Sheep < Formula
  # ...省略

  test do
    sheep = <<EOL
           __  _
       .-:'  `; `-._
      (_,           )
    ,'o"(            )>
   (__,-'            )
      (             )
       `-'._.--._.-'
EOL
    assert_equal sheep, shell_output("#{bin}/sheep")
  end
end
```

テストは次のコマンドで実行できます。

```sh
$ brew test "<Formula名>"

# 例
$ brew test "sheep"
==> Testing sheep
==> /opt/homebrew/Cellar/sheep/0.4.0/bin/sheep
```

## 6. Pull Request を作成する

それでは実際に Pull Request を作成していきます。

まず事前に [homebrew-core](https://github.com/Homebrew/homebrew-core) リポジトリを Fork しておきます。

https://github.com/Homebrew/homebrew-core/fork

続いて変更を Commit します。
新しい Formula を追加する場合は `<Formula名> <バージョン> (new formula)` という形式でコミットメッセージを書きます。

```sh
# homebrew-core リポジトリに移動
$ cd "$(brew --repository homebrew/core)"

# ブランチを作成
# ブランチ名は Formula 名と同じにする
$ git checkout -b sheep origin/master

# Formula を追加
$ git add Formula/s/sheep.rb
$ git commit -m "sheep 0.4.0 (new formula)"
```

:::message

コミットメッセージの詳しいルールについては次のドキュメントを参考にしてください。

- [Commit - Formula Cookbook](https://docs.brew.sh/Formula-Cookbook#commit)

:::

変更を Commit したら Fork したリポジトリに Push します。

```sh
$ git push git@github.com:<GitHubユーザー名>/homebrew-core.git "<ブランチ名(Formula名)>"

# 例
$ git push git@github.com:koki-develop/homebrew-core.git sheep
```

最後に公式リポジトリに向けて Pull Request を作成します。
Pull Request のタイトルはコミットメッセージと同様に `<Formula名> <バージョン> (new formula)` という形式にします。
参考までに、以前僕が [cLive](https://github.com/koki-develop/clive) というツールを公式リポジトリに追加する際に作成した Pull Request は↓こんな感じです。

https://github.com/Homebrew/homebrew-core/pull/131354

:::message

[cLive](https://github.com/koki-develop/clive) について詳しくは次の記事をご参照ください。

- [これでライブコーディングも怖くない！ cLive でターミナル操作を自動化する](https://zenn.dev/kou_pg_0131/articles/clive-introduction)

:::

Pull Request を作成できたら後は Homebrew のメンテナがレビューしてくれるのを待つだけです。
マージされれば `brew install "<Formula名>` でツールをインストールできるようになります。

# まとめ

仕組みが整っててすごい。

# 参考

https://thredot.org/threads/FRMLDWXBUL2D9A94
https://docs.brew.sh/Formula-Cookbook

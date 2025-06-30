---
title: "猫と開発する次世代のコーディングエージェント「Cat Code」の紹介"
emoji: "🐈"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["agent", "cat"]
published: true
published_at: 2025-06-30 18:00
---

コーディングエージェント便利ですよね。
[Codex](https://github.com/openai/codex) や [Claude Code](https://github.com/anthropics/claude-code) 、 [Gemini CLI](https://github.com/google-gemini/gemini-cli) などをはじめとした、 CLI ベースの優れたコーディングエージェントが続々と登場していますが、しかしどれも決定的に欠けているものがあります。

**そう、猫です**。

一般的に開発関連のツールは猫であればあるほど良いとされていますが、今のところ有名なコーディングエージェントには ( 僕の知る限り ) 猫がいません。 ( [コーギーならいる](https://zenn.dev/oikon/articles/c8a887f00dd219) )
たとえどれだけコーディング能力が優れていようと、どれだけ素晴らしい UI/UX を提供していようと、そこに猫がいなければ意味がありません。

というわけで、猫と開発する次世代のコーディングエージェント「[Cat Code](https://github.com/koki-develop/cat-code)」をリリースしました。

![](/images/cat-code-introduction/demo.png)

https://github.com/koki-develop/cat-code
https://www.npmjs.com/package/cat-code

この記事では Cat Code の使い方と機能について紹介します。

- [使い方](#使い方)
- [機能](#機能)
  - [ファイル編集](#ファイル編集)
  - [日本語の理解](#日本語の理解)
  - [ultrathink](#ultrathink)
- [Claude Code との比較](#claude-code-との比較)
- [まとめ](#まとめ)

# 使い方

Cat Code は npm で公開されているコマンドラインツールなので、 `npx` で実行できます。

```bash
$ npx cat-code@latest
```

実行すると Cat Code の対話インターフェースが起動します。

![](/images/cat-code-introduction/interface.png)

あとはチャットで猫とやり取りをするだけです。

# 機能

Cat Code の主要な機能について紹介します。

## ファイル編集

猫はいたずらっ子です。
メッセージを送信すると、猫は一定確率でランダムなテキストファイルを書き換えます。

![](/images/cat-code-introduction/file-edit.png)

編集対象のファイルが選択される方法は作業ディレクトリの状態によって異なります。

- **git が初期化されているディレクトリの場合**
  - git 管理されているテキストファイルをランダムで選択して編集する
  - `.gitignore` に設定しているファイルは編集されない
- **git が初期化されていないディレクトリの場合**
  - カレントディレクトリ内のテキストファイルをランダムに選択して編集する

こちらがどんなメッセージや指示を送ろうとこれらの挙動は一切変わりません。猫はマイペースです。
起動時に `--safe` フラグを指定するとセーフモードで起動します。

```bash
$ npx cat-code@latest --safe
```

セーフモードを有効にしているとファイル編集は実行されなくなります ( diff が表示されるだけ ) 。
猫のいたずら防止にご活用ください。

![](/images/cat-code-introduction/safe-mode.png)
_`[SAFE MODE - No actual changes]` と表示される_

## 日本語の理解

猫は賢いです。
一部の日本語を理解し、それに応じた返答をしてくれます。

「おはよう」などの挨拶をすると元気に答えてくれますし、

![](/images/cat-code-introduction/greeting.png)

「邪魔」などの攻撃的な単語を聞くと怒ります。

![](/images/cat-code-introduction/angry.png)

## ultrathink

猫は考えることもできます。
メッセージに「ultrathink」「深く考えて」などの特定のキーワードを含めると少し時間をかけて考えるようになります。

![](/images/cat-code-introduction/ultrathink.png)

考える時間が長くなる以外の変化は特にありません。回答の品質も変わりません。

# Claude Code との比較

Cat Code がどれだけ優れているかを示すために、コーディングエージェントとしての**主要な観点**において Claude Code と Cat Code を比較してみます。

| 観点 | Claude Code | Cat Code |
| --- | --- | --- |
| 猫か？ | ×<br/>猫ではない。 | ⭕<br/>猫である。 |
| 無料で利用できるか？ | ×<br/>API の従量課金もしくは Pro プラン ($20/月) 以上で利用可能。 | ⭕<br/>完全無料。 |
| オフラインで動作するか？ | ×<br/>インターネット通信が必要。 | ⭕<br/>完全にオフラインのみで動作。<br/>機密情報が外部に送信されたり学習される心配もない。 |
| 高速な回答ができるか？ | △<br/>複雑なタスクをこなす場合、回答に時間がかかることがある。 | ⭕<br/>通常は常に 1 秒未満で回答。 ultrathink が有効になっていても数秒での回答が可能。 ([参考](https://github.com/koki-develop/cat-code/blob/fc628337db7df574a98a37c80e77f45f7a3e2b9c/src/lib/cat.ts#L260-L262)) |
| ソースコードが公開されているか？ | △<br/>されていない ( minify されたコードが配布されている ) 。 | ⭕<br/>公開されている。 |
| 本当に猫か？ | ×<br/>どうあがいても猫ではない。 | ⭕<br/>本当に猫である。 |

**猫が圧倒的に優れている**ことが一目瞭然ですね。

# まとめ

猫は偉大。

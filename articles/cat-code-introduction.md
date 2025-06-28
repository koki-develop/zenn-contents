---
title: "猫と開発するコーディングエージェント「Cat Code」の紹介"
emoji: "🐈"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["agent", "cat"]
published: true
published_at: 2025-06-30 18:00
---

コーディングエージェント便利ですよね。
[Codex](https://github.com/openai/codex) や [Claude Code](https://github.com/anthropics/claude-code) 、 [Gemini CLI](https://github.com/google-gemini/gemini-cli) などをはじめとした、 CLI ベースの優れたコーディングエージェントが続々と登場していますが、しかしどれも決定的に欠けているものがあります。

**そう、猫です**。

たとえどれだけコーディング能力が優れていようと、どれだけ素晴らしい UI/UX を提供していようと、そこに猫がいなければ意味はありません。

というわけで、猫と開発するコーディングエージェント「[Cat Code](https://github.com/koki-develop/cat-code)」をリリースしました。

![](/images/cat-code-introduction/demo.png)

https://github.com/koki-develop/cat-code
https://www.npmjs.com/package/cat-code

この記事では Cat Code の使い方と機能について紹介します。

# 使い方

Cat Code は npm で公開されているコマンドラインツールなので、 `npx` で実行できます。

```bash
$ npx cat-code@latest
```

実行すると Cat Code の対話インターフェースが起動します。

![](/images/cat-code-introduction/interface.png)

あとはチャットで猫とやり取りをするだけです。

# 主要機能 : ファイル編集

猫はいたずらっ子です。
メッセージを送信すると、猫は一定確率でランダムなテキストファイルを書き換えます。

![](/images/cat-code-introduction/file-edit.png)

編集対象のファイルが選択される方法は作業ディレクトリの状態によって異なります。

- **git が初期化されているディレクトリの場合**
  - git 管理されているテキストファイルをランダムで選択して編集する
  - `.gitignore` に設定しているファイルは編集されない
    - 猫は賢い
- **git が初期化されていないディレクトリの場合**
  - カレントディレクトリ内のテキストファイルをランダムに選択して編集する

こちらがどんなメッセージや指示を送ろうとこれらの挙動は一切変わりません。猫は気ままです。

## セーフモード

起動時に `--safe` フラグを指定するとセーフモードで起動します。

```bash
$ npx cat-code@latest --safe
```

セーフモードを有効にしているとファイル編集は実行されなくなります。
( diff が表示されるだけ )

![](/images/cat-code-introduction/safe-mode.png)
_`[SAFE MODE - No actual changes]` と表示される_

---

他の機能は特にありません。猫はシンプルです。

# Claude Code との比較

Cat Code がどれだけ優れているかを示すために、コーディングエージェントとしての主要な観点において Claude Code と Cat Code を比較してみます。

| 観点 | Claude Code | Cat Code |
| --- | --- | --- |
| 猫か？ | ×<br/>猫ではない。 | ⭕<br/>猫である。 |
| 無料で利用できるか？ | ×<br/>API の従量課金もしくは Pro プラン ($20/月) 以上で利用可。 | ⭕<br/>完全無料。 |
| オフラインで動作するか？ | ×<br/>API 通信が発生するため、ネットワークが必須。 | ⭕<br/>完全にオフラインのみで動作。<br/>機密情報が外部に送信されたり学習される心配もない。 |
| 高速な回答ができるか？ | △<br/>複雑なタスクをこなす場合、回答に時間がかかることがある。 | ⭕<br/>回答にかかる時間は常に 1 秒未満 (300ms ~ 800ms) 。 ( [参考](https://github.com/koki-develop/cat-code/blob/15f501d54f19be6653647b0532c744dbb63c88dc/src/lib/cat.ts#L241-L243) ) |
| ソースコードが公開されているか？ | △<br/>されていない ( minify されたコードが配布されている ) 。 | ⭕<br/>公開されている。 |

猫が圧倒的に優れていることが一目瞭然ですね。

# まとめ

猫は偉大です。

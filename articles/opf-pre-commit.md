---
title: "OpenAI Privacy Filter を pre-commit フックに入れて個人情報のコミットを防ぐ"
emoji: "🪝"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["openai", "security", "git"]
published: true
published_at: 2026-05-11 18:00
---

4 月に OpenAI から OpenAI Privacy Filter というモデルが公開されました。
テキストデータから個人情報を検出・マスキングすることができる、ローカルで動作するモデルらしいです。

https://openai.com/ja-JP/index/introducing-openai-privacy-filter/
https://huggingface.co/openai/privacy-filter

---

というわけで、pre-commit フックに入れたら面白そうなので試してみました。

## OpenAI Privacy Filter の使い方 (CLI)

OpenAI Privacy Filter を使用するための公式 CLI が公開されているので、今回はこちらを使ってみます。

https://github.com/openai/privacy-filter

### インストール

pip で GitHub から直接インストールできます。PyPI には現時点では公開されていません。

```sh
$ pip install git+https://github.com/openai/privacy-filter.git
```

インストールが完了すると `opf` コマンドが使用可能になります。

:::details opf --help

```
usage: opf [-h]

OpenAI Privacy Filter (OPF): redact text to remove PII. Redact locally via CLI and interactive mode; run evaluations; or fine-tune on your own labeled dataset.

Subcommands:
  redact  Redact text locally (default, implied).
  eval    Run encoder eval on a ground-truth dataset.
  train   Fine-tune a checkpoint on a local labeled dataset.
Default mode: redact
  The redact mode has additional flags; see `opf redact --help`.

options:
  -h, --help  show this help message and exit
```

:::

### 個人情報をマスクする

`opf redact` コマンドにファイルを渡して実行するだけです。初回実行時にモデルのダウンロードが発生します。(`~/.opf` 以下に保存されます)

```sh
$ opf redact \
    --device cpu \
    --text-file "<ファイル>"

# サブコマンドを省略しても同じ
$ opf \
    --device cpu \
    --text-file "<ファイル>"

# 標準入力からも渡せる
$ cat "<ファイル>" | opf redact --device cpu
```

---

試しにこんな感じの CSV ファイルを用意して実行してみます。

```csv:pii.csv
name,age
Alice Johnson,28
Bob Smith,35
Carol Williams,42
David Brown,29
Eve Davis,51
Frank Miller,36
Grace Wilson,24
山田太郎,38
鈴木花子,45
佐藤次郎,31
```

```sh
$ opf redact \
    --device cpu \
    --text-file "./pii.csv"
```

すると、以下のように個人情報がマスクされた状態でファイルの内容が出力されました。

```:出力結果
name,age
<PRIVATE_PERSON>,28
<PRIVATE_PERSON>,35
<PRIVATE_PERSON>,42
<PRIVATE_PERSON>,29
<PRIVATE_PERSON>,51
<PRIVATE_PERSON>,36
<PRIVATE_PERSON>,24
<PRIVATE_PERSON>,38
<PRIVATE_PERSON>,45
<PRIVATE_PERSON>,31
```

ちなみに `--format json` を指定すると、より詳細な情報を含む JSON 形式で出力されます。デフォルトでは末尾に余計な色付きテキストが一緒に出力されますが、 `--no-print-color-coded-text` で抑制できます。

```sh
$ opf redact \
    --device cpu \
    --text-file "./pii.csv" \
    --format json \
    --no-print-color-coded-text
```

:::details 出力結果 (長いので折りたたみ)

```json
{
  "schema_version": 1,
  "summary": {
    "output_mode": "typed",
    "span_count": 10,
    "by_label": {
      "private_person": 10
    },
    "decoded_mismatch": false
  },
  "text": "name,age\nAlice Johnson,28\nBob Smith,35\nCarol Williams,42\nDavid Brown,29\nEve Davis,51\nFrank Miller,36\nGrace Wilson,24\n山田太郎,38\n鈴木花子,45\n佐藤次郎,31\n",
  "detected_spans": [
    {
      "label": "private_person",
      "start": 9,
      "end": 22,
      "text": "Alice Johnson",
      "placeholder": "<PRIVATE_PERSON>"
    },
    {
      "label": "private_person",
      "start": 26,
      "end": 35,
      "text": "Bob Smith",
      "placeholder": "<PRIVATE_PERSON>"
    },
    {
      "label": "private_person",
      "start": 39,
      "end": 53,
      "text": "Carol Williams",
      "placeholder": "<PRIVATE_PERSON>"
    },
    {
      "label": "private_person",
      "start": 57,
      "end": 68,
      "text": "David Brown",
      "placeholder": "<PRIVATE_PERSON>"
    },
    {
      "label": "private_person",
      "start": 72,
      "end": 81,
      "text": "Eve Davis",
      "placeholder": "<PRIVATE_PERSON>"
    },
    {
      "label": "private_person",
      "start": 85,
      "end": 97,
      "text": "Frank Miller",
      "placeholder": "<PRIVATE_PERSON>"
    },
    {
      "label": "private_person",
      "start": 101,
      "end": 113,
      "text": "Grace Wilson",
      "placeholder": "<PRIVATE_PERSON>"
    },
    {
      "label": "private_person",
      "start": 117,
      "end": 121,
      "text": "山田太郎",
      "placeholder": "<PRIVATE_PERSON>"
    },
    {
      "label": "private_person",
      "start": 125,
      "end": 129,
      "text": "鈴木花子",
      "placeholder": "<PRIVATE_PERSON>"
    },
    {
      "label": "private_person",
      "start": 133,
      "end": 137,
      "text": "佐藤次郎",
      "placeholder": "<PRIVATE_PERSON>"
    }
  ],
  "redacted_text": "name,age\n<PRIVATE_PERSON>,28\n<PRIVATE_PERSON>,35\n<PRIVATE_PERSON>,42\n<PRIVATE_PERSON>,29\n<PRIVATE_PERSON>,51\n<PRIVATE_PERSON>,36\n<PRIVATE_PERSON>,24\n<PRIVATE_PERSON>,38\n<PRIVATE_PERSON>,45\n<PRIVATE_PERSON>,31\n"
}
```

:::

---

その他の詳細な使い方については[公式 README](https://github.com/openai/privacy-filter#readme) やヘルプをご参照ください。

https://github.com/openai/privacy-filter#readme

:::details opf redact --help

```
usage: opf redact [-h] [--checkpoint CHECKPOINT] [--device DEVICE]
                  [--n-ctx N_CTX] [--decode-mode {viterbi,argmax}]
                  [--discard-overlapping-predicted-spans] [--trim-whitespace]
                  [--no-trim-whitespace]
                  [--viterbi-calibration-path VITERBI_CALIBRATION_PATH]
                  [--output-mode {typed,redacted}] [--json-indent JSON_INDENT]
                  [--no-print-color-coded-text] [--format {text,json}]
                  [-f TEXT_FILE]
                  [positional_text]

Redact text to remove PII.

options:
  -h, --help            show this help message and exit

Input / Source:
  positional_text       Text input to filter.
  -f, --text-file TEXT_FILE
                        Text file path; each file is treated as one full input example (repeat for multiple files).

Model / Runtime:
  --checkpoint CHECKPOINT
                        Override checkpoint directory. If omitted, OPF uses OPF_CHECKPOINT or downloads/reuses /Users/koki/.opf/privacy_filter.
  --device DEVICE       Device to run on
  --n-ctx N_CTX         Override context window length

Decode:
  --decode-mode {viterbi,argmax}
                        Decode token labels with constrained Viterbi or independent argmax.
  --discard-overlapping-predicted-spans
                        Discard overlapping predicted spans per label
  --trim-whitespace     Trim whitespace from predicted character spans (default)
  --no-trim-whitespace  Do not trim whitespace from predicted character spans
  --viterbi-calibration-path VITERBI_CALIBRATION_PATH
                        Path to local JSON Viterbi calibration artifact. If omitted, auto-discovers <checkpoint>/viterbi_calibration.json; if absent, uses all-zero transition biases.

Output:
  --output-mode {typed,redacted}
                        typed: keep model categories.
                        redacted: collapse all spans into one generic redacted label.
  --json-indent JSON_INDENT
                        Indentation level for printed JSON
  --no-print-color-coded-text
                        Do not print the ANSI color-coded text section after JSON output.
  --format {text,json}  Print redacted text or the structured JSON schema output.
```

:::

## pre-commit フックに入れてみる

シンプルに `git diff` の追加行を丸ごと `opf redact` に渡すだけのスクリプトを書きました。難しいことはしてないので細かい解説は省きます。

```sh:.git/hooks/pre-commit
#!/usr/bin/env bash

# staged な追加行を抽出
diff=$(git diff --staged -U0 | grep '^+[^+]' | cut -c2-)
[ -z "$diff" ] && exit 0

# OpenAI Privacy Filter で PII 検出
result=$(echo "$diff" | opf redact --device cpu --format json --no-print-color-coded-text 2>/dev/null)

# 検出された件数を集計し、0 なら exit 0
total=$(echo "$result" | jq -s '[.[].summary.span_count] | add')
[ "$total" -eq 0 ] && exit 0

# 検出ありなら先頭2文字を残してマスクして表示し、exit 1
echo "PII detected ($total spans):"
echo "$result" | jq -sr '.[].detected_spans[] | "  [\(.label)] \(.text[0:2] + (.text[2:] | gsub("."; "*")))"'
exit 1
```

### 個人名 + クレジットカード番号末尾 4 桁をコミットしてみる

こんな CSV ファイルを用意して、コミットしてみます。

```csv:customers.csv
name,card_last4
Alice Johnson,1234
Bob Smith,5678
Carol Williams,9012
David Brown,3456
Eve Davis,7890
Frank Miller,2468
Grace Wilson,1357
山田太郎,1111
鈴木花子,2222
佐藤次郎,3333
```

```sh
$ git add customers.csv
$ git commit -m "情報漏洩"
```

```:出力結果
PII detected (16 spans):
  [private_person] Al***********
  [account_number] 12**
  [private_person] Bo*******
  [account_number] 56**
  [private_person] Ca************
  [private_person] Da*********
  [secret] 34**
  [private_person] Ev*******
  [private_person] Fr**********
  [private_date] 24**
  [private_person] Gr**********
  [private_person] 山田**
  [account_number] 11**
  [private_person] 鈴木**
  [private_person] 佐藤**
  [account_number] 33**
```

個人情報が検出されて、コミットが失敗しました。
クレジットカード末尾 4 桁は主に `account_number` として検出されてますね。一部は検出漏れもあるようですが、まぁまぁよい感じです。

## 制限事項

ローカルで動作するので、当然実行マシンのスペックなどによってパフォーマンスは大きく変わります。
僕の環境では、上記 CSV ファイルの pre-commit の実行に 5 秒程度かかりました。

他にも Web アプリケーションの数百行程度の機能実装で試してみたところ、3 分近くかかることもありました。工夫しないと実運用はなかなか難しそうです。

また、精度についても (当たり前ですが) 完璧ではないので、過度に信頼しないように注意が必要です。

- 参考: [Bias, Risks, and Limitations](https://github.com/openai/privacy-filter#bias-risks-and-limitations)

## まとめ

便利ですね〜。

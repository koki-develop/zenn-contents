---
title: "Charm 製の Go ロギングライブラリ「Log」を試してみる"
emoji: "🕯️"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["golang", "log"]
published: true
---

[Charm](https://charm.sh/) 製の Go ロギングライブラリが出たので早速試してみたメモです。

https://github.com/charmbracelet/log

# 検証環境

- Go v1.20
- charmbracelet/log v0.1.1

# 使い方

## 基本的な使い方

以下のメソッドを使うと特定のレベルのログを出力します。

- [`log.Debug()`](https://pkg.go.dev/github.com/charmbracelet/log#Debug)
- [`log.Info()`](https://pkg.go.dev/github.com/charmbracelet/log#Info)
- [`log.Warn()`](https://pkg.go.dev/github.com/charmbracelet/log#Warn)
- [`log.Error()`](https://pkg.go.dev/github.com/charmbracelet/log#Error)
- [`log.Fatal()`](https://pkg.go.dev/github.com/charmbracelet/log#Fatal)

[`log.Print()`](https://pkg.go.dev/github.com/charmbracelet/log#Print) は設定されているログレベルに関係なく出力されます。

```go
package main

import "github.com/charmbracelet/log"

func main() {
	log.Print("without level") // ログレベルに関係なく出力
	log.Debug("debug log")
	log.Info("info log")
	log.Warn("warn log")
	log.Error("error log")
	log.Fatal("fatal log") // Fatal は `os.Exit(1)` が実行される
}
```

![](/images/charm-log-introduction/basic.png)
_出力結果_

ログレベルの設定方法については後述の「[オプションを設定する](#オプションを設定する)」をご参照ください。

## Logger を作成する

[`log.Info()`](https://pkg.go.dev/github.com/charmbracelet/log#Info) などのメソッドは [`charmbracelet/log`](https://pkg.go.dev/github.com/charmbracelet/log) パッケージ内のデフォルトロガーを使用してログ出力されます。

https://github.com/charmbracelet/log/blob/6e4f0e19080ef0689bddc536fe505564680eb70e/pkg.go#L9

[`log.New()`](https://pkg.go.dev/github.com/charmbracelet/log#New) を使用することで自前で [`Logger`](https://pkg.go.dev/github.com/charmbracelet/log#Logger) を作成することができます。
使い方はデフォルトロガーを使用する場合とほとんど同じです。

```go
package main

import "github.com/charmbracelet/log"

func main() {
	logger := log.New()

	logger.Print("without level") // ログレベルに関係なく出力
	logger.Debug("debug log")
	logger.Info("info log")
	logger.Warn("warn log")
	logger.Error("error log")
	logger.Fatal("fatal log") // Fatal は `os.Exit(1)` が実行される
}
```

![](/images/charm-log-introduction/logger.png)
_出力結果_

## キーバリュー形式で情報を付与する

ログ出力用のメソッドの第 2 引数以降を指定することでキーバリュー形式で情報を付与することができます。

```go
package main

import "github.com/charmbracelet/log"

// 適当な struct を用意
type S struct {
	Name string
}

func main() {
	log.Info(
		"log message",
		// 第 2 引数以降に key-value を指定することができる
		"key", "value",
		"map", map[string]string{"name": "koki"},
		"slice", []string{"a", "b", "c"},
		"struct", S{Name: "koki"},
		"without_value", // value を設定しない場合は "missing value" が出力される
	)
}
```

![](/images/charm-log-introduction/keyvalue.png)
_出力結果_

## オプションを設定する

ログレベルやフォーマットなど様々なオプションを設定することができます。

```go
package main

import (
	"time"

	"github.com/charmbracelet/log"
)

func main() {
	logger := log.New(
		log.WithLevel(log.InfoLevel),         // ログレベルを設定
		log.WithTimestamp(),                  // 時刻を出力
		log.WithTimeFormat(time.Kitchen),     // 時刻のフォーマットを指定
		log.WithCaller(),                     // ソースコードの場所を出力
		log.WithPrefix("PREFIX"),             // プレフィクスを設定
		log.WithFormatter(log.TextFormatter), // フォーマッタを指定
	)

	// `Set...()` メソッドで動的に変更することも可能
	logger.SetLevel(log.DebugLevel)

	// ログを出力
	logger.Info("info log")

	// デフォルトロガーの設定も変更できる
	log.SetLevel(log.DebugLevel)
}
```

![](/images/charm-log-introduction/options.png)
_出力結果_

その他設定できるオプションに関しては [`options.go`](https://github.com/charmbracelet/log/blob/main/options.go) をご参照ください。

https://github.com/charmbracelet/log/blob/main/options.go

## 出力スタイルをカスタマイズする

[`charmbracelet/lipgloss`](https://pkg.go.dev/github.com/charmbracelet/lipgloss) パッケージの `...Style` 変数を [`lipgloss.Style`](https://pkg.go.dev/github.com/charmbracelet/lipgloss#Style) で書き換えることで出力スタイルをカスタマイズすることができます。
次のコードはエラーログのレベル部分のスタイルをカスタマイズする例です。

```go
package main

import (
	"github.com/charmbracelet/lipgloss"
	"github.com/charmbracelet/log"
)

func main() {
	// エラーログのレベル部分のスタイルをカスタマイズ
	log.ErrorLevelStyle = lipgloss.NewStyle().
		SetString("CUSTOM_ERROR_STYLE").
		Background(lipgloss.Color("#ff0000")).
		Foreground(lipgloss.Color("#000000"))

	// エラーログ出力
	log.Error("error log")

	// Logger のスタイルにも反映される
	logger := log.New(log.WithTimestamp())
	logger.Error("logger struct")
}
```

![](/images/charm-log-introduction/styles.png)
_出力結果_

[`charmbracelet/lipgloss`](https://pkg.go.dev/github.com/charmbracelet/lipgloss) パッケージの使い方については[公式リポジトリ](https://github.com/charmbracelet/lipgloss)をご参照ください。

https://github.com/charmbracelet/lipgloss

その他カスタマイズできるスタイルについては [`styles.go`](https://github.com/charmbracelet/log/blob/main/styles.go) をご参照ください。

https://github.com/charmbracelet/log/blob/main/styles.go

## 標準ライブラリの Logger に変換する

カスタムロガーを設定できるライブラリは色々ありますが、中には標準ライブラリの [`log.Logger`](https://pkg.go.dev/log#Logger) しか受け付けないものもあります ( [`net/http.Server`](https://pkg.go.dev/net/http#Server) など ) 。
[`charmbracelet/log.Logger`](https://pkg.go.dev/github.com/charmbracelet/log#Logger) は `StandardLog()` メソッドを使って標準ライブラリの [`log.Logger`](https://pkg.go.dev/log#Logger) に変換することができます。
これにより他のライブラリにカスタムロガーとして組み込むことが容易になっています。

```go
package main

import (
	"net/http"

	"github.com/charmbracelet/log"
)

func main() {
	logger := log.New()

	s := &http.Server{
		// ...省略
		ErrorLog: logger.StandardLog(),
	}

	// ...
}
```

# まとめ

とっても良い。

ちなみに [Charm](https://charm.sh/) は他にも [gum](https://github.com/charmbracelet/gum) や [vhs](https://github.com/charmbracelet/vhs) 、 [Bubble Tea](https://github.com/charmbracelet/bubbletea) などを始めとした様々なイケてるツールやライブラリを公開しています。
こちらも興味があればご参照ください。

https://zenn.dev/kou_pg_0131/articles/gum-introduction
https://zenn.dev/kou_pg_0131/articles/vhs-introduction
https://zenn.dev/kou_pg_0131/articles/go-cli-packages

---
title: "cat コマンド代替の Go 製 CLI 「gat」の紹介"
emoji: "🐱"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["cli", "terminal", "golang"]
published: true
---

`cat` コマンド代替の Go 製コマンドラインツールである [`gat`](https://github.com/koki-develop/gat) を作りました。

https://github.com/koki-develop/gat

[`gat`](https://github.com/koki-develop/gat) を使うとファイルの内容をシンタックスハイライトつきで出力することができます。

![](/images/gat-introduction/single.gif)

この記事では [`gat`](https://github.com/koki-develop/gat) の使い方についてまとめます。

- [インストール](#インストール)
- [使い方](#使い方)
- [仕組み](#仕組み)

# インストール

Homebrew を使用している場合は `brew install` を使用してインストールできます。

```sh
$ brew install gat
# or
$ brew install koki-develop/tap/gat
```

もしくは、 [`gat`](https://github.com/koki-develop/gat) は Go で作られているため `go install` を使用してインストールすることもできます。

```sh
$ go install github.com/koki-develop/gat@latest
```

# 使い方

## 基本的な使い方

ファイル名を指定して実行するだけです。

```sh
$ gat <ファイル名>
```

![](/images/gat-introduction/single.gif)

ファイル名は複数指定することもできます。
それぞれのファイルの内容を縦に連結して出力します。

```sh
$ gat <ファイル名> <ファイル名> ...
```

![](/images/gat-introduction/multiple.gif)

ファイルの内容は標準入力から渡すこともできます。

```sh
$ <コマンド> | gat
```

![](/images/gat-introduction/stdin.gif)

## カラーテーマを指定する

https://github.com/koki-develop/gat/blob/main/docs/themes.md#highlight-themes

`--theme` もしくは `-t` フラグでシンタックスハイライトのカラーテーマを指定することができます ( デフォルトは `monokai` ) 。

```sh
# `solarized-dark` を指定する例
$ gat --theme solarized-dark <ファイル名>
```

![](/images/gat-introduction/theme.gif)

`--list-themes` フラグを指定して実行するとサポートされているカラーテーマ一覧をプレビューつきで確認することができます。

```sh
$ gat --list-themes
```

![](/images/gat-introduction/list-themes.gif)

## ファイルを整形する

`--pretty` もしくは `-p` フラグを指定するとファイルの内容を整形して出力します。

```sh
$ gat --pretty <ファイル名>
```

![](/images/gat-introduction/pretty.gif)

整形がサポートされていない言語ではこのフラグは無視されます。
v0.6.0 時点では次の言語に対応しています。

- HTML
- CSS
- JSON
- XML

## 言語を明示的に指定する

https://github.com/koki-develop/gat/blob/main/docs/languages.md#languages

[`gat`](https://github.com/koki-develop/gat) はデフォルトではファイルの言語をファイル名や内容から自動で推測しますが、場合によっては言語を推測できないことがあります ( その場合はシンタックスハイライト無しで出力します ) 。
そういった場合は `--lang` もしくは `-l` フラグで言語を明示的に指定することができます。

```sh
# 明示的に Go を指定する例
$ gat --lang go <ファイル名>
```

![](/images/gat-introduction/lang.gif)

`--list-langs` フラグを指定して実行するとサポートされている言語一覧を確認することができます。

![](/images/gat-introduction/list-langs.gif)

## 出力フォーマットを指定する

https://github.com/koki-develop/gat/blob/main/docs/formats.md#output-formats

[`gat`](https://github.com/koki-develop/gat) は通常のターミナル向けの出力以外にも複数の出力フォーマットに対応しています。
例えば次のコマンドは HTML 形式で出力する例です。

```sh
# HTML 形式で出力する
$ gat --format html <ファイル名>
```

![](/images/gat-introduction/format.gif)

:::details 出力された HTML コード

```html:index.html
<html>
<style type="text/css">
/* Background */ .bg { color: #f8f8f2; background-color: #272822 }
/* PreWrapper */ .chroma { color: #f8f8f2; background-color: #272822; }
/* Error */ .chroma .err { color: #960050; background-color: #1e0010 }
/* LineTableTD */ .chroma .lntd { vertical-align: top; padding: 0; margin: 0; border: 0; }
/* LineTable */ .chroma .lntable { border-spacing: 0; padding: 0; margin: 0; border: 0; }
/* LineHighlight */ .chroma .hl { background-color: #3c3d38 }
/* LineNumbersTable */ .chroma .lnt { white-space: pre; user-select: none; margin-right: 0.4em; padding: 0 0.4em 0 0.4em;color: #7f7f7f }
/* LineNumbers */ .chroma .ln { white-space: pre; user-select: none; margin-right: 0.4em; padding: 0 0.4em 0 0.4em;color: #7f7f7f }
/* Line */ .chroma .line { display: flex; }
/* Keyword */ .chroma .k { color: #66d9ef }
/* KeywordConstant */ .chroma .kc { color: #66d9ef }
/* KeywordDeclaration */ .chroma .kd { color: #66d9ef }
/* KeywordNamespace */ .chroma .kn { color: #f92672 }
/* KeywordPseudo */ .chroma .kp { color: #66d9ef }
/* KeywordReserved */ .chroma .kr { color: #66d9ef }
/* KeywordType */ .chroma .kt { color: #66d9ef }
/* NameAttribute */ .chroma .na { color: #a6e22e }
/* NameClass */ .chroma .nc { color: #a6e22e }
/* NameConstant */ .chroma .no { color: #66d9ef }
/* NameDecorator */ .chroma .nd { color: #a6e22e }
/* NameException */ .chroma .ne { color: #a6e22e }
/* NameFunction */ .chroma .nf { color: #a6e22e }
/* NameOther */ .chroma .nx { color: #a6e22e }
/* NameTag */ .chroma .nt { color: #f92672 }
/* Literal */ .chroma .l { color: #ae81ff }
/* LiteralDate */ .chroma .ld { color: #e6db74 }
/* LiteralString */ .chroma .s { color: #e6db74 }
/* LiteralStringAffix */ .chroma .sa { color: #e6db74 }
/* LiteralStringBacktick */ .chroma .sb { color: #e6db74 }
/* LiteralStringChar */ .chroma .sc { color: #e6db74 }
/* LiteralStringDelimiter */ .chroma .dl { color: #e6db74 }
/* LiteralStringDoc */ .chroma .sd { color: #e6db74 }
/* LiteralStringDouble */ .chroma .s2 { color: #e6db74 }
/* LiteralStringEscape */ .chroma .se { color: #ae81ff }
/* LiteralStringHeredoc */ .chroma .sh { color: #e6db74 }
/* LiteralStringInterpol */ .chroma .si { color: #e6db74 }
/* LiteralStringOther */ .chroma .sx { color: #e6db74 }
/* LiteralStringRegex */ .chroma .sr { color: #e6db74 }
/* LiteralStringSingle */ .chroma .s1 { color: #e6db74 }
/* LiteralStringSymbol */ .chroma .ss { color: #e6db74 }
/* LiteralNumber */ .chroma .m { color: #ae81ff }
/* LiteralNumberBin */ .chroma .mb { color: #ae81ff }
/* LiteralNumberFloat */ .chroma .mf { color: #ae81ff }
/* LiteralNumberHex */ .chroma .mh { color: #ae81ff }
/* LiteralNumberInteger */ .chroma .mi { color: #ae81ff }
/* LiteralNumberIntegerLong */ .chroma .il { color: #ae81ff }
/* LiteralNumberOct */ .chroma .mo { color: #ae81ff }
/* Operator */ .chroma .o { color: #f92672 }
/* OperatorWord */ .chroma .ow { color: #f92672 }
/* Comment */ .chroma .c { color: #75715e }
/* CommentHashbang */ .chroma .ch { color: #75715e }
/* CommentMultiline */ .chroma .cm { color: #75715e }
/* CommentSingle */ .chroma .c1 { color: #75715e }
/* CommentSpecial */ .chroma .cs { color: #75715e }
/* CommentPreproc */ .chroma .cp { color: #75715e }
/* CommentPreprocFile */ .chroma .cpf { color: #75715e }
/* GenericDeleted */ .chroma .gd { color: #f92672 }
/* GenericEmph */ .chroma .ge { font-style: italic }
/* GenericInserted */ .chroma .gi { color: #a6e22e }
/* GenericStrong */ .chroma .gs { font-weight: bold }
/* GenericSubheading */ .chroma .gu { color: #75715e }
body { color: #f8f8f2; background-color: #272822; }
</style><body class="bg">
<pre tabindex="0" class="chroma"><code><span class="line"><span class="cl"><span class="p">&lt;</span><span class="nt">html</span><span class="p">&gt;</span>
</span></span><span class="line"><span class="cl"><span class="p">&lt;</span><span class="nt">style</span> <span class="na">type</span><span class="o">=</span><span class="s">&#34;text/css&#34;</span><span class="p">&gt;</span>
</span></span><span class="line"><span class="cl"><span class="c">/* Background */</span> <span class="p">.</span><span class="nc">bg</span> <span class="p">{</span> <span class="k">color</span><span class="p">:</span> <span class="mh">#f8f8f2</span><span class="p">;</span> <span class="k">background-color</span><span class="p">:</span> <span class="mh">#272822</span> <span class="p">}</span>
</span></span><span class="line"><span class="cl"><span class="c">/* PreWrapper */</span> <span class="p">.</span><span class="nc">chroma</span> <span class="p">{</span> <span class="k">color</span><span class="p">:</span> <span class="mh">#f8f8f2</span><span class="p">;</span> <span class="k">background-color</span><span class="p">:</span> <span class="mh">#272822</span><span class="p">;</span> <span class="p">}</span>
</span></span><span class="line"><span class="cl"><span class="c">/* Error */</span> <span class="p">.</span><span class="nc">chroma</span> <span class="p">.</span><span class="nc">err</span> <span class="p">{</span> <span class="k">color</span><span class="p">:</span> <span class="mh">#960050</span><span class="p">;</span> <span class="k">background-color</span><span class="p">:</span> <span class="mh">#1e0010</span> <span class="p">}</span>
</span></span><span class="line"><span class="cl"><span class="c">/* LineTableTD */</span> <span class="p">.</span><span class="nc">chroma</span> <span class="p">.</span><span class="nc">lntd</span> <span class="p">{</span> <span class="k">vertical-align</span><span class="p">:</span> <span class="kc">top</span><span class="p">;</span> <span class="k">padding</span><span class="p">:</span> <span class="mi">0</span><span class="p">;</span> <span class="k">margin</span><span class="p">:</span> <span class="mi">0</span><span class="p">;</span> <span class="k">border</span><span class="p">:</span> <span class="mi">0</span><span class="p">;</span> <span class="p">}</span>
</span></span><span class="line"><span class="cl"><span class="c">/* LineTable */</span> <span class="p">.</span><span class="nc">chroma</span> <span class="p">.</span><span class="nc">lntable</span> <span class="p">{</span> <span class="k">border-spacing</span><span class="p">:</span> <span class="mi">0</span><span class="p">;</span> <span class="k">padding</span><span class="p">:</span> <span class="mi">0</span><span class="p">;</span> <span class="k">margin</span><span class="p">:</span> <span class="mi">0</span><span class="p">;</span> <span class="k">border</span><span class="p">:</span> <span class="mi">0</span><span class="p">;</span> <span class="p">}</span>
</span></span><span class="line"><span class="cl"><span class="c">/* LineHighlight */</span> <span class="p">.</span><span class="nc">chroma</span> <span class="p">.</span><span class="nc">hl</span> <span class="p">{</span> <span class="k">background-color</span><span class="p">:</span> <span class="mh">#3c3d38</span> <span class="p">}</span>
</span></span><span class="line"><span class="cl"><span class="c">/* LineNumbersTable */</span> <span class="p">.</span><span class="nc">chroma</span> <span class="p">.</span><span class="nc">lnt</span> <span class="p">{</span> <span class="k">white-space</span><span class="p">:</span> <span class="kc">pre</span><span class="p">;</span> <span class="k">user-select</span><span class="p">:</span> <span class="kc">none</span><span class="p">;</span> <span class="k">margin-right</span><span class="p">:</span> <span class="mf">0.4</span><span class="kt">em</span><span class="p">;</span> <span class="k">padding</span><span class="p">:</span> <span class="mi">0</span> <span class="mf">0.4</span><span class="kt">em</span> <span class="mi">0</span> <span class="mf">0.4</span><span class="kt">em</span><span class="p">;</span><span class="k">color</span><span class="p">:</span> <span class="mh">#7f7f7f</span> <span class="p">}</span>
</span></span><span class="line"><span class="cl"><span class="c">/* LineNumbers */</span> <span class="p">.</span><span class="nc">chroma</span> <span class="p">.</span><span class="nc">ln</span> <span class="p">{</span> <span class="k">white-space</span><span class="p">:</span> <span class="kc">pre</span><span class="p">;</span> <span class="k">user-select</span><span class="p">:</span> <span class="kc">none</span><span class="p">;</span> <span class="k">margin-right</span><span class="p">:</span> <span class="mf">0.4</span><span class="kt">em</span><span class="p">;</span> <span class="k">padding</span><span class="p">:</span> <span class="mi">0</span> <span class="mf">0.4</span><span class="kt">em</span> <span class="mi">0</span> <span class="mf">0.4</span><span class="kt">em</span><span class="p">;</span><span class="k">color</span><span class="p">:</span> <span class="mh">#7f7f7f</span> <span class="p">}</span>
</span></span><span class="line"><span class="cl"><span class="c">/* Line */</span> <span class="p">.</span><span class="nc">chroma</span> <span class="p">.</span><span class="nc">line</span> <span class="p">{</span> <span class="k">display</span><span class="p">:</span> <span class="kc">flex</span><span class="p">;</span> <span class="p">}</span>
</span></span><span class="line"><span class="cl"><span class="c">/* Keyword */</span> <span class="p">.</span><span class="nc">chroma</span> <span class="p">.</span><span class="nc">k</span> <span class="p">{</span> <span class="k">color</span><span class="p">:</span> <span class="mh">#66d9ef</span> <span class="p">}</span>
</span></span><span class="line"><span class="cl"><span class="c">/* KeywordConstant */</span> <span class="p">.</span><span class="nc">chroma</span> <span class="p">.</span><span class="nc">kc</span> <span class="p">{</span> <span class="k">color</span><span class="p">:</span> <span class="mh">#66d9ef</span> <span class="p">}</span>
</span></span><span class="line"><span class="cl"><span class="c">/* KeywordDeclaration */</span> <span class="p">.</span><span class="nc">chroma</span> <span class="p">.</span><span class="nc">kd</span> <span class="p">{</span> <span class="k">color</span><span class="p">:</span> <span class="mh">#66d9ef</span> <span class="p">}</span>
</span></span><span class="line"><span class="cl"><span class="c">/* KeywordNamespace */</span> <span class="p">.</span><span class="nc">chroma</span> <span class="p">.</span><span class="nc">kn</span> <span class="p">{</span> <span class="k">color</span><span class="p">:</span> <span class="mh">#f92672</span> <span class="p">}</span>
</span></span><span class="line"><span class="cl"><span class="c">/* KeywordPseudo */</span> <span class="p">.</span><span class="nc">chroma</span> <span class="p">.</span><span class="nc">kp</span> <span class="p">{</span> <span class="k">color</span><span class="p">:</span> <span class="mh">#66d9ef</span> <span class="p">}</span>
</span></span><span class="line"><span class="cl"><span class="c">/* KeywordReserved */</span> <span class="p">.</span><span class="nc">chroma</span> <span class="p">.</span><span class="nc">kr</span> <span class="p">{</span> <span class="k">color</span><span class="p">:</span> <span class="mh">#66d9ef</span> <span class="p">}</span>
</span></span><span class="line"><span class="cl"><span class="c">/* KeywordType */</span> <span class="p">.</span><span class="nc">chroma</span> <span class="p">.</span><span class="nc">kt</span> <span class="p">{</span> <span class="k">color</span><span class="p">:</span> <span class="mh">#66d9ef</span> <span class="p">}</span>
</span></span><span class="line"><span class="cl"><span class="c">/* NameAttribute */</span> <span class="p">.</span><span class="nc">chroma</span> <span class="p">.</span><span class="nc">na</span> <span class="p">{</span> <span class="k">color</span><span class="p">:</span> <span class="mh">#a6e22e</span> <span class="p">}</span>
</span></span><span class="line"><span class="cl"><span class="c">/* NameClass */</span> <span class="p">.</span><span class="nc">chroma</span> <span class="p">.</span><span class="nc">nc</span> <span class="p">{</span> <span class="k">color</span><span class="p">:</span> <span class="mh">#a6e22e</span> <span class="p">}</span>
</span></span><span class="line"><span class="cl"><span class="c">/* NameConstant */</span> <span class="p">.</span><span class="nc">chroma</span> <span class="p">.</span><span class="nc">no</span> <span class="p">{</span> <span class="k">color</span><span class="p">:</span> <span class="mh">#66d9ef</span> <span class="p">}</span>
</span></span><span class="line"><span class="cl"><span class="c">/* NameDecorator */</span> <span class="p">.</span><span class="nc">chroma</span> <span class="p">.</span><span class="nc">nd</span> <span class="p">{</span> <span class="k">color</span><span class="p">:</span> <span class="mh">#a6e22e</span> <span class="p">}</span>
</span></span><span class="line"><span class="cl"><span class="c">/* NameException */</span> <span class="p">.</span><span class="nc">chroma</span> <span class="p">.</span><span class="nc">ne</span> <span class="p">{</span> <span class="k">color</span><span class="p">:</span> <span class="mh">#a6e22e</span> <span class="p">}</span>
</span></span><span class="line"><span class="cl"><span class="c">/* NameFunction */</span> <span class="p">.</span><span class="nc">chroma</span> <span class="p">.</span><span class="nc">nf</span> <span class="p">{</span> <span class="k">color</span><span class="p">:</span> <span class="mh">#a6e22e</span> <span class="p">}</span>
</span></span><span class="line"><span class="cl"><span class="c">/* NameOther */</span> <span class="p">.</span><span class="nc">chroma</span> <span class="p">.</span><span class="nc">nx</span> <span class="p">{</span> <span class="k">color</span><span class="p">:</span> <span class="mh">#a6e22e</span> <span class="p">}</span>
</span></span><span class="line"><span class="cl"><span class="c">/* NameTag */</span> <span class="p">.</span><span class="nc">chroma</span> <span class="p">.</span><span class="nc">nt</span> <span class="p">{</span> <span class="k">color</span><span class="p">:</span> <span class="mh">#f92672</span> <span class="p">}</span>
</span></span><span class="line"><span class="cl"><span class="c">/* Literal */</span> <span class="p">.</span><span class="nc">chroma</span> <span class="p">.</span><span class="nc">l</span> <span class="p">{</span> <span class="k">color</span><span class="p">:</span> <span class="mh">#ae81ff</span> <span class="p">}</span>
</span></span><span class="line"><span class="cl"><span class="c">/* LiteralDate */</span> <span class="p">.</span><span class="nc">chroma</span> <span class="p">.</span><span class="nc">ld</span> <span class="p">{</span> <span class="k">color</span><span class="p">:</span> <span class="mh">#e6db74</span> <span class="p">}</span>
</span></span><span class="line"><span class="cl"><span class="c">/* LiteralString */</span> <span class="p">.</span><span class="nc">chroma</span> <span class="p">.</span><span class="nc">s</span> <span class="p">{</span> <span class="k">color</span><span class="p">:</span> <span class="mh">#e6db74</span> <span class="p">}</span>
</span></span><span class="line"><span class="cl"><span class="c">/* LiteralStringAffix */</span> <span class="p">.</span><span class="nc">chroma</span> <span class="p">.</span><span class="nc">sa</span> <span class="p">{</span> <span class="k">color</span><span class="p">:</span> <span class="mh">#e6db74</span> <span class="p">}</span>
</span></span><span class="line"><span class="cl"><span class="c">/* LiteralStringBacktick */</span> <span class="p">.</span><span class="nc">chroma</span> <span class="p">.</span><span class="nc">sb</span> <span class="p">{</span> <span class="k">color</span><span class="p">:</span> <span class="mh">#e6db74</span> <span class="p">}</span>
</span></span><span class="line"><span class="cl"><span class="c">/* LiteralStringChar */</span> <span class="p">.</span><span class="nc">chroma</span> <span class="p">.</span><span class="nc">sc</span> <span class="p">{</span> <span class="k">color</span><span class="p">:</span> <span class="mh">#e6db74</span> <span class="p">}</span>
</span></span><span class="line"><span class="cl"><span class="c">/* LiteralStringDelimiter */</span> <span class="p">.</span><span class="nc">chroma</span> <span class="p">.</span><span class="nc">dl</span> <span class="p">{</span> <span class="k">color</span><span class="p">:</span> <span class="mh">#e6db74</span> <span class="p">}</span>
</span></span><span class="line"><span class="cl"><span class="c">/* LiteralStringDoc */</span> <span class="p">.</span><span class="nc">chroma</span> <span class="p">.</span><span class="nc">sd</span> <span class="p">{</span> <span class="k">color</span><span class="p">:</span> <span class="mh">#e6db74</span> <span class="p">}</span>
</span></span><span class="line"><span class="cl"><span class="c">/* LiteralStringDouble */</span> <span class="p">.</span><span class="nc">chroma</span> <span class="p">.</span><span class="nc">s2</span> <span class="p">{</span> <span class="k">color</span><span class="p">:</span> <span class="mh">#e6db74</span> <span class="p">}</span>
</span></span><span class="line"><span class="cl"><span class="c">/* LiteralStringEscape */</span> <span class="p">.</span><span class="nc">chroma</span> <span class="p">.</span><span class="nc">se</span> <span class="p">{</span> <span class="k">color</span><span class="p">:</span> <span class="mh">#ae81ff</span> <span class="p">}</span>
</span></span><span class="line"><span class="cl"><span class="c">/* LiteralStringHeredoc */</span> <span class="p">.</span><span class="nc">chroma</span> <span class="p">.</span><span class="nc">sh</span> <span class="p">{</span> <span class="k">color</span><span class="p">:</span> <span class="mh">#e6db74</span> <span class="p">}</span>
</span></span><span class="line"><span class="cl"><span class="c">/* LiteralStringInterpol */</span> <span class="p">.</span><span class="nc">chroma</span> <span class="p">.</span><span class="nc">si</span> <span class="p">{</span> <span class="k">color</span><span class="p">:</span> <span class="mh">#e6db74</span> <span class="p">}</span>
</span></span><span class="line"><span class="cl"><span class="c">/* LiteralStringOther */</span> <span class="p">.</span><span class="nc">chroma</span> <span class="p">.</span><span class="nc">sx</span> <span class="p">{</span> <span class="k">color</span><span class="p">:</span> <span class="mh">#e6db74</span> <span class="p">}</span>
</span></span><span class="line"><span class="cl"><span class="c">/* LiteralStringRegex */</span> <span class="p">.</span><span class="nc">chroma</span> <span class="p">.</span><span class="nc">sr</span> <span class="p">{</span> <span class="k">color</span><span class="p">:</span> <span class="mh">#e6db74</span> <span class="p">}</span>
</span></span><span class="line"><span class="cl"><span class="c">/* LiteralStringSingle */</span> <span class="p">.</span><span class="nc">chroma</span> <span class="p">.</span><span class="nc">s1</span> <span class="p">{</span> <span class="k">color</span><span class="p">:</span> <span class="mh">#e6db74</span> <span class="p">}</span>
</span></span><span class="line"><span class="cl"><span class="c">/* LiteralStringSymbol */</span> <span class="p">.</span><span class="nc">chroma</span> <span class="p">.</span><span class="nc">ss</span> <span class="p">{</span> <span class="k">color</span><span class="p">:</span> <span class="mh">#e6db74</span> <span class="p">}</span>
</span></span><span class="line"><span class="cl"><span class="c">/* LiteralNumber */</span> <span class="p">.</span><span class="nc">chroma</span> <span class="p">.</span><span class="nc">m</span> <span class="p">{</span> <span class="k">color</span><span class="p">:</span> <span class="mh">#ae81ff</span> <span class="p">}</span>
</span></span><span class="line"><span class="cl"><span class="c">/* LiteralNumberBin */</span> <span class="p">.</span><span class="nc">chroma</span> <span class="p">.</span><span class="nc">mb</span> <span class="p">{</span> <span class="k">color</span><span class="p">:</span> <span class="mh">#ae81ff</span> <span class="p">}</span>
</span></span><span class="line"><span class="cl"><span class="c">/* LiteralNumberFloat */</span> <span class="p">.</span><span class="nc">chroma</span> <span class="p">.</span><span class="nc">mf</span> <span class="p">{</span> <span class="k">color</span><span class="p">:</span> <span class="mh">#ae81ff</span> <span class="p">}</span>
</span></span><span class="line"><span class="cl"><span class="c">/* LiteralNumberHex */</span> <span class="p">.</span><span class="nc">chroma</span> <span class="p">.</span><span class="nc">mh</span> <span class="p">{</span> <span class="k">color</span><span class="p">:</span> <span class="mh">#ae81ff</span> <span class="p">}</span>
</span></span><span class="line"><span class="cl"><span class="c">/* LiteralNumberInteger */</span> <span class="p">.</span><span class="nc">chroma</span> <span class="p">.</span><span class="nc">mi</span> <span class="p">{</span> <span class="k">color</span><span class="p">:</span> <span class="mh">#ae81ff</span> <span class="p">}</span>
</span></span><span class="line"><span class="cl"><span class="c">/* LiteralNumberIntegerLong */</span> <span class="p">.</span><span class="nc">chroma</span> <span class="p">.</span><span class="nc">il</span> <span class="p">{</span> <span class="k">color</span><span class="p">:</span> <span class="mh">#ae81ff</span> <span class="p">}</span>
</span></span><span class="line"><span class="cl"><span class="c">/* LiteralNumberOct */</span> <span class="p">.</span><span class="nc">chroma</span> <span class="p">.</span><span class="nc">mo</span> <span class="p">{</span> <span class="k">color</span><span class="p">:</span> <span class="mh">#ae81ff</span> <span class="p">}</span>
</span></span><span class="line"><span class="cl"><span class="c">/* Operator */</span> <span class="p">.</span><span class="nc">chroma</span> <span class="p">.</span><span class="nc">o</span> <span class="p">{</span> <span class="k">color</span><span class="p">:</span> <span class="mh">#f92672</span> <span class="p">}</span>
</span></span><span class="line"><span class="cl"><span class="c">/* OperatorWord */</span> <span class="p">.</span><span class="nc">chroma</span> <span class="p">.</span><span class="nc">ow</span> <span class="p">{</span> <span class="k">color</span><span class="p">:</span> <span class="mh">#f92672</span> <span class="p">}</span>
</span></span><span class="line"><span class="cl"><span class="c">/* Comment */</span> <span class="p">.</span><span class="nc">chroma</span> <span class="p">.</span><span class="nc">c</span> <span class="p">{</span> <span class="k">color</span><span class="p">:</span> <span class="mh">#75715e</span> <span class="p">}</span>
</span></span><span class="line"><span class="cl"><span class="c">/* CommentHashbang */</span> <span class="p">.</span><span class="nc">chroma</span> <span class="p">.</span><span class="nc">ch</span> <span class="p">{</span> <span class="k">color</span><span class="p">:</span> <span class="mh">#75715e</span> <span class="p">}</span>
</span></span><span class="line"><span class="cl"><span class="c">/* CommentMultiline */</span> <span class="p">.</span><span class="nc">chroma</span> <span class="p">.</span><span class="nc">cm</span> <span class="p">{</span> <span class="k">color</span><span class="p">:</span> <span class="mh">#75715e</span> <span class="p">}</span>
</span></span><span class="line"><span class="cl"><span class="c">/* CommentSingle */</span> <span class="p">.</span><span class="nc">chroma</span> <span class="p">.</span><span class="nc">c1</span> <span class="p">{</span> <span class="k">color</span><span class="p">:</span> <span class="mh">#75715e</span> <span class="p">}</span>
</span></span><span class="line"><span class="cl"><span class="c">/* CommentSpecial */</span> <span class="p">.</span><span class="nc">chroma</span> <span class="p">.</span><span class="nc">cs</span> <span class="p">{</span> <span class="k">color</span><span class="p">:</span> <span class="mh">#75715e</span> <span class="p">}</span>
</span></span><span class="line"><span class="cl"><span class="c">/* CommentPreproc */</span> <span class="p">.</span><span class="nc">chroma</span> <span class="p">.</span><span class="nc">cp</span> <span class="p">{</span> <span class="k">color</span><span class="p">:</span> <span class="mh">#75715e</span> <span class="p">}</span>
</span></span><span class="line"><span class="cl"><span class="c">/* CommentPreprocFile */</span> <span class="p">.</span><span class="nc">chroma</span> <span class="p">.</span><span class="nc">cpf</span> <span class="p">{</span> <span class="k">color</span><span class="p">:</span> <span class="mh">#75715e</span> <span class="p">}</span>
</span></span><span class="line"><span class="cl"><span class="c">/* GenericDeleted */</span> <span class="p">.</span><span class="nc">chroma</span> <span class="p">.</span><span class="nc">gd</span> <span class="p">{</span> <span class="k">color</span><span class="p">:</span> <span class="mh">#f92672</span> <span class="p">}</span>
</span></span><span class="line"><span class="cl"><span class="c">/* GenericEmph */</span> <span class="p">.</span><span class="nc">chroma</span> <span class="p">.</span><span class="nc">ge</span> <span class="p">{</span> <span class="k">font-style</span><span class="p">:</span> <span class="kc">italic</span> <span class="p">}</span>
</span></span><span class="line"><span class="cl"><span class="c">/* GenericInserted */</span> <span class="p">.</span><span class="nc">chroma</span> <span class="p">.</span><span class="nc">gi</span> <span class="p">{</span> <span class="k">color</span><span class="p">:</span> <span class="mh">#a6e22e</span> <span class="p">}</span>
</span></span><span class="line"><span class="cl"><span class="c">/* GenericStrong */</span> <span class="p">.</span><span class="nc">chroma</span> <span class="p">.</span><span class="nc">gs</span> <span class="p">{</span> <span class="k">font-weight</span><span class="p">:</span> <span class="kc">bold</span> <span class="p">}</span>
</span></span><span class="line"><span class="cl"><span class="c">/* GenericSubheading */</span> <span class="p">.</span><span class="nc">chroma</span> <span class="p">.</span><span class="nc">gu</span> <span class="p">{</span> <span class="k">color</span><span class="p">:</span> <span class="mh">#75715e</span> <span class="p">}</span>
</span></span><span class="line"><span class="cl"><span class="nt">body</span> <span class="p">{</span> <span class="k">color</span><span class="p">:</span> <span class="mh">#f8f8f2</span><span class="p">;</span> <span class="k">background-color</span><span class="p">:</span> <span class="mh">#272822</span><span class="p">;</span> <span class="p">}</span>
</span></span><span class="line"><span class="cl"><span class="p">&lt;/</span><span class="nt">style</span><span class="p">&gt;&lt;</span><span class="nt">body</span> <span class="na">class</span><span class="o">=</span><span class="s">&#34;bg&#34;</span><span class="p">&gt;</span>
</span></span><span class="line"><span class="cl"><span class="p">&lt;</span><span class="nt">pre</span> <span class="na">tabindex</span><span class="o">=</span><span class="s">&#34;0&#34;</span> <span class="na">class</span><span class="o">=</span><span class="s">&#34;chroma&#34;</span><span class="p">&gt;&lt;</span><span class="nt">code</span><span class="p">&gt;&lt;</span><span class="nt">span</span> <span class="na">class</span><span class="o">=</span><span class="s">&#34;line&#34;</span><span class="p">&gt;&lt;</span><span class="nt">span</span> <span class="na">class</span><span class="o">=</span><span class="s">&#34;cl&#34;</span><span class="p">&gt;&lt;</span><span class="nt">span</span> <span class="na">class</span><span class="o">=</span><span class="s">&#34;kn&#34;</span><span class="p">&gt;</span>package<span class="p">&lt;/</span><span class="nt">span</span><span class="p">&gt;</span> <span class="p">&lt;</span><span class="nt">span</span> <span class="na">class</span><span class="o">=</span><span class="s">&#34;nx&#34;</span><span class="p">&gt;</span>main<span class="p">&lt;/</span><span class="nt">span</span><span class="p">&gt;</span>
</span></span><span class="line"><span class="cl"><span class="p">&lt;/</span><span class="nt">span</span><span class="p">&gt;&lt;/</span><span class="nt">span</span><span class="p">&gt;&lt;</span><span class="nt">span</span> <span class="na">class</span><span class="o">=</span><span class="s">&#34;line&#34;</span><span class="p">&gt;&lt;</span><span class="nt">span</span> <span class="na">class</span><span class="o">=</span><span class="s">&#34;cl&#34;</span><span class="p">&gt;</span>
</span></span><span class="line"><span class="cl"><span class="p">&lt;/</span><span class="nt">span</span><span class="p">&gt;&lt;/</span><span class="nt">span</span><span class="p">&gt;&lt;</span><span class="nt">span</span> <span class="na">class</span><span class="o">=</span><span class="s">&#34;line&#34;</span><span class="p">&gt;&lt;</span><span class="nt">span</span> <span class="na">class</span><span class="o">=</span><span class="s">&#34;cl&#34;</span><span class="p">&gt;&lt;</span><span class="nt">span</span> <span class="na">class</span><span class="o">=</span><span class="s">&#34;kn&#34;</span><span class="p">&gt;</span>import<span class="p">&lt;/</span><span class="nt">span</span><span class="p">&gt;</span> <span class="p">&lt;</span><span class="nt">span</span> <span class="na">class</span><span class="o">=</span><span class="s">&#34;s&#34;</span><span class="p">&gt;</span><span class="ni">&amp;#34;</span>fmt<span class="ni">&amp;#34;</span><span class="p">&lt;/</span><span class="nt">span</span><span class="p">&gt;</span>
</span></span><span class="line"><span class="cl"><span class="p">&lt;/</span><span class="nt">span</span><span class="p">&gt;&lt;/</span><span class="nt">span</span><span class="p">&gt;&lt;</span><span class="nt">span</span> <span class="na">class</span><span class="o">=</span><span class="s">&#34;line&#34;</span><span class="p">&gt;&lt;</span><span class="nt">span</span> <span class="na">class</span><span class="o">=</span><span class="s">&#34;cl&#34;</span><span class="p">&gt;</span>
</span></span><span class="line"><span class="cl"><span class="p">&lt;/</span><span class="nt">span</span><span class="p">&gt;&lt;/</span><span class="nt">span</span><span class="p">&gt;&lt;</span><span class="nt">span</span> <span class="na">class</span><span class="o">=</span><span class="s">&#34;line&#34;</span><span class="p">&gt;&lt;</span><span class="nt">span</span> <span class="na">class</span><span class="o">=</span><span class="s">&#34;cl&#34;</span><span class="p">&gt;&lt;</span><span class="nt">span</span> <span class="na">class</span><span class="o">=</span><span class="s">&#34;kd&#34;</span><span class="p">&gt;</span>func<span class="p">&lt;/</span><span class="nt">span</span><span class="p">&gt;</span> <span class="p">&lt;</span><span class="nt">span</span> <span class="na">class</span><span class="o">=</span><span class="s">&#34;nf&#34;</span><span class="p">&gt;</span>main<span class="p">&lt;/</span><span class="nt">span</span><span class="p">&gt;&lt;</span><span class="nt">span</span> <span class="na">class</span><span class="o">=</span><span class="s">&#34;p&#34;</span><span class="p">&gt;</span>()<span class="p">&lt;/</span><span class="nt">span</span><span class="p">&gt;</span> <span class="p">&lt;</span><span class="nt">span</span> <span class="na">class</span><span class="o">=</span><span class="s">&#34;p&#34;</span><span class="p">&gt;</span>{<span class="p">&lt;/</span><span class="nt">span</span><span class="p">&gt;</span>
</span></span><span class="line"><span class="cl"><span class="p">&lt;/</span><span class="nt">span</span><span class="p">&gt;&lt;/</span><span class="nt">span</span><span class="p">&gt;&lt;</span><span class="nt">span</span> <span class="na">class</span><span class="o">=</span><span class="s">&#34;line&#34;</span><span class="p">&gt;&lt;</span><span class="nt">span</span> <span class="na">class</span><span class="o">=</span><span class="s">&#34;cl&#34;</span><span class="p">&gt;</span>	<span class="p">&lt;</span><span class="nt">span</span> <span class="na">class</span><span class="o">=</span><span class="s">&#34;nx&#34;</span><span class="p">&gt;</span>fmt<span class="p">&lt;/</span><span class="nt">span</span><span class="p">&gt;&lt;</span><span class="nt">span</span> <span class="na">class</span><span class="o">=</span><span class="s">&#34;p&#34;</span><span class="p">&gt;</span>.<span class="p">&lt;/</span><span class="nt">span</span><span class="p">&gt;&lt;</span><span class="nt">span</span> <span class="na">class</span><span class="o">=</span><span class="s">&#34;nf&#34;</span><span class="p">&gt;</span>Println<span class="p">&lt;/</span><span class="nt">span</span><span class="p">&gt;&lt;</span><span class="nt">span</span> <span class="na">class</span><span class="o">=</span><span class="s">&#34;p&#34;</span><span class="p">&gt;</span>(<span class="p">&lt;/</span><span class="nt">span</span><span class="p">&gt;&lt;</span><span class="nt">span</span> <span class="na">class</span><span class="o">=</span><span class="s">&#34;s&#34;</span><span class="p">&gt;</span><span class="ni">&amp;#34;</span>hello world<span class="ni">&amp;#34;</span><span class="p">&lt;/</span><span class="nt">span</span><span class="p">&gt;&lt;</span><span class="nt">span</span> <span class="na">class</span><span class="o">=</span><span class="s">&#34;p&#34;</span><span class="p">&gt;</span>)<span class="p">&lt;/</span><span class="nt">span</span><span class="p">&gt;</span>
</span></span><span class="line"><span class="cl"><span class="p">&lt;/</span><span class="nt">span</span><span class="p">&gt;&lt;/</span><span class="nt">span</span><span class="p">&gt;&lt;</span><span class="nt">span</span> <span class="na">class</span><span class="o">=</span><span class="s">&#34;line&#34;</span><span class="p">&gt;&lt;</span><span class="nt">span</span> <span class="na">class</span><span class="o">=</span><span class="s">&#34;cl&#34;</span><span class="p">&gt;&lt;</span><span class="nt">span</span> <span class="na">class</span><span class="o">=</span><span class="s">&#34;p&#34;</span><span class="p">&gt;</span>}<span class="p">&lt;/</span><span class="nt">span</span><span class="p">&gt;</span>
</span></span><span class="line"><span class="cl"><span class="p">&lt;/</span><span class="nt">span</span><span class="p">&gt;&lt;/</span><span class="nt">span</span><span class="p">&gt;&lt;/</span><span class="nt">code</span><span class="p">&gt;&lt;/</span><span class="nt">pre</span><span class="p">&gt;</span>
</span></span><span class="line"><span class="cl"><span class="p">&lt;/</span><span class="nt">body</span><span class="p">&gt;</span>
</span></span><span class="line"><span class="cl"><span class="p">&lt;/</span><span class="nt">html</span><span class="p">&gt;</span>
</span></span></code></pre>
</body>
</html>
```

:::

出力された HTML をブラウザで開いてみると次のように表示されます。

![](/images/gat-introduction/html.png)
_出力された HTML_

`--list-formats` フラグを指定して実行するとサポートされているフォーマット一覧を確認することができます。

![](/images/gat-introduction/list-formats.gif)

# 仕組み

[`gat`](https://github.com/koki-develop/gat) は内部的に [Chroma](https://github.com/alecthomas/chroma) を使用しています。

https://github.com/alecthomas/chroma

[Chroma](https://github.com/alecthomas/chroma) を使用するとソースコードやその他の構造化されたテキストをシンタックスハイライト付きの HTML や ANSI カラーのテキストなどに変換することができます。
ファイルの種類の検知やカラーテーマの設定などもサポートしています。

Go 製の静的サイトジェネレータである [Hugo](https://gohugo.io/) でもコードのシンタックスハイライトに [Chroma](https://github.com/alecthomas/chroma) が使用されています。

https://gohugo.io/content-management/syntax-highlighting/

[Chroma](https://github.com/alecthomas/chroma) は拡張性が高く、自分で様々なカスタマイズを行うことが可能です。
例えば [`gat`](https://github.com/koki-develop/gat) では[出力フォーマット](#出力フォーマットを指定する)に [`html-min`](https://github.com/koki-develop/gat/blob/main/docs/formats.md#html-min), [`json-min`](https://github.com/koki-develop/gat/blob/main/docs/formats.md#json-min), [`svg-min`](https://github.com/koki-develop/gat/blob/main/docs/formats.md#svg-min) などもサポートしていますが、これらは既存のフォーマッタを拡張したカスタムフォーマッタを自前で作って使用しています。

https://github.com/koki-develop/gat/tree/main/pkg/formatter

# まとめ

「[bat](https://github.com/sharkdp/bat) でよくない？？」

https://shs.sh

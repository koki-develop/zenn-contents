---
title: "複数 AI エージェントの MCP サーバーの設定を一元管理する「mmcp」の紹介"
emoji: "✨"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["ai", "mcp", "cli"]
published: true
published_at: 2025-09-08 18:00
---

複数の AI エージェントごとに毎回 MCP サーバーの設定をするのって面倒ですよね。設定忘れも頻繁にあります。
Codex CLI に至っては設定ファイルが TOML 形式なので、他の AI エージェントの JSON 形式の設定からコピペするのも一手間かかります。

```toml:Codex CLI の設定ファイル
# こんな感じ
[mcp_servers.everything]
command = "npx"
args = ["-y", "@modelcontextprotocol/server-everything@latest"]

[mcp_servers.context7]
command = "npx"
args = ["-y", "@upstash/context7-mcp@latest"]
```

というわけで、複数の AI エージェントの MCP サーバーの設定を一元管理できる mmcp を作ったので紹介します。

https://www.npmjs.com/package/mmcp
https://github.com/koki-develop/mmcp

- [インストール](#インストール)
- [使い方](#使い方)
- [設定ファイル](#設定ファイル)
- [対応している AI エージェント](#対応している-ai-エージェント)
- [まとめ](#まとめ)

# インストール

npm でインストール可能です。

```bash
$ npm install -g mmcp
```

# 使い方

## 1. MCP サーバーを追加する

`mmcp add` コマンドで MCP サーバーを追加できます。

```bash
$ mmcp add [--env KEY=VALUE ...] [--config <path>] [--force] -- <name> <command> [args...]

# 例
$ mmcp add -- context7 npx -y @upstash/context7-mcp@latest
$ mmcp add -- everything npx -y @modelcontextprotocol/server-everything@latest
```

追加した MCP サーバーは `mmcp list` コマンドで確認できます。

```bash
$ mmcp list
```

```:出力例
context7: npx -y @upstash/context7-mcp@latest
everything: npx -y @modelcontextprotocol/server-everything@latest
```

## 2. 適用対象の AI エージェントを追加する

`mmcp agents add` コマンドで適用対象の AI エージェントを追加できます。

```bash
$ mmcp agents add [--config <path>] <name...>

# 例
$ mmcp agents add claude-code
# 複数指定も可能
$ mmcp agents add codex-cli gemini-cli
```

追加した AI エージェントは `mmcp agents list` コマンドで確認できます。

```bash
$ mmcp agents list
```

```:出力例
claude-code
codex-cli
gemini-cli
```

## 3. 適用する

`mmcp apply` コマンドで MCP サーバーの設定を各 AI エージェントに適用できます。

```bash
$ mmcp apply
```

```:出力例
✔ Applied config: claude-code
✔ Applied config: codex-cli
✔ Applied config: gemini-cli
```

:::details Claude Code

```bash
$ claude mcp list
Checking MCP server health...

context7: npx -y @upstash/context7-mcp@latest - ✓ Connected
everything: npx -y @modelcontextprotocol/server-everything@latest - ✓ Connected
```

```json5:~/.claude.json
{
  // ...
  "mcpServers": {
    "context7": {
      "command": "npx",
      "args": [
        "-y",
        "@upstash/context7-mcp@latest"
      ],
      "env": {}
    },
    "everything": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-everything@latest"
      ],
      "env": {}
    }
  }
}
```

:::

:::details Codex CLI

```bash
$ codex
```

```
/mcp

🔌  MCP Tools

  • Server: context7
    • Command: npx -y @upstash/context7-mcp@latest
    • Tools: get-library-docs, resolve-library-id

  • Server: everything
    • Command: npx -y @modelcontextprotocol/server-everything@latest
    • Tools: add, annotatedMessage, echo, getResourceLinks, getResourceReference,
getTinyImage, longRunningOperation, printEnv, sampleLLM, startElicitation,
structuredContent
```

```toml:~/.codex/config.toml
# ...

[mcp_servers.everything]
command = "npx"
args = ["-y", "@modelcontextprotocol/server-everything@latest"]

[mcp_servers.context7]
command = "npx"
args = ["-y", "@upstash/context7-mcp@latest"]
```

:::

:::details Gemini CLI

```bash
$ gemini mcp list
Configured MCP servers:

✓ context7: npx -y @upstash/context7-mcp@latest (stdio) - Connected
✓ everything: npx -y @modelcontextprotocol/server-everything@latest (stdio) - Connected
```

```json5:~/.gemini/settings.json
{
  // ...
  "mcpServers": {
    "context7": {
      "command": "npx",
      "args": [
        "-y",
        "@upstash/context7-mcp@latest"
      ],
      "env": {}
    },
    "everything": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-everything@latest"
      ],
      "env": {}
    }
  }
}
```

:::

# 設定ファイル

mmcp の設定ファイルは `~/.mmcp.json` に保存されます。
必要に応じて直接編集も可能です。

```json:~/.mmcp.json
{
  "agents": [
    "claude-code",
    "codex-cli",
    "gemini-cli"
  ],
  "mcpServers": {
    "context7": {
      "command": "npx",
      "args": [
        "-y",
        "@upstash/context7-mcp@latest"
      ],
      "env": {}
    },
    "everything": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-everything@latest"
      ],
      "env": {}
    }
  }
}
```

:::message

ちなみに僕はこの設定ファイルを dotfiles で管理しています。

- [koki-develop/dotfiles/dot_mmcp.json](https://github.com/koki-develop/dotfiles/blob/main/dot_mmcp.json)

`.mmcp.json` は AI エージェント固有の設定を含まない MCP サーバー設定のみが記述されたファイルなので、 dotfiles 管理がしやすいのも mmcp のメリットの 1 つです。

:::

# 対応している AI エージェント

v0.3.1 時点で対応している AI エージェントは以下の通りです。

| エージェント | id | 設定ファイルのパス |
| --- | --- | --- |
| [Claude Code](https://www.anthropic.com/claude-code) | `claude-code` | `~/.claude.json` |
| [Claude Desktop](https://claude.ai/download) | `claude-desktop` | macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`<br>Windows: `%APPDATA%\Claude\claude_desktop_config.json`<br>Linux: `~/.config/Claude/claude_desktop_config.json` |
| [Codex CLI](https://developers.openai.com/codex/cli) | `codex-cli` | `~/.codex/config.toml` |
| [Cursor](https://docs.cursor.com/) | `cursor` | `~/.cursor/mcp.json` |
| [Gemini CLI](https://google-gemini.github.io/gemini-cli/) | `gemini-cli` | `~/.gemini/settings.json` |

# 仕組み

基本的には `.mmcp.json` の内容を各 AI エージェントの設定ファイル内の MCP サーバー設定部分にマージしているだけです。

Codex CLI の TOML 形式の設定ファイルの更新には [@shopify/toml-patch](https://www.npmjs.com/package/@shopify/toml-patch) を使っています。
コメントを保持したまま更新できるので便利です。

https://www.npmjs.com/package/@shopify/toml-patch

```ts:使用例
import { updateTomlValues } from "@shopify/toml-patch";

export const sampleToml = `
# This is a sample TOML file
title = "TOML Example"

[owner]
name = "Test User"

[database]
server = "192.168.1.1"
ports = [ 8001, 8001, 8002 ] # Comment after array
`;

const output = updateTomlValues(sampleToml, [
  [["owner", "dotted", "notation"], 123.5],
  [["database", "server"], "changed"],
  [["top_level"], true],
  [
    ["database", "backup_ports"],
    [8003, 8004],
  ],
]);
console.log(output);
// => # This is a sample TOML file
//    title = "TOML Example"
//    top_level = true
//
//    [owner]
//    name = "Test User"
//    dotted.notation = 123.5
//
//    [database]
//    server = "changed"
//    ports = [ 8001, 8001, 8002 ] # Comment after array
//    backup_ports = [8003, 8004]
```

# まとめ

既存の類似ツールはありそうですが、せっかくなので自作しました。
8 割くらいは Codex CLI に実装してもらいました。便利。

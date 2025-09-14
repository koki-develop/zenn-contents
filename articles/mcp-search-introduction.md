---
title: "MCP Registry の MCP サーバーを検索できる「MCP Search」の紹介"
emoji: "🔍"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["mcp", "ai"]
published: true
published_at: 2025-09-16 18:00
---

先日、公式から MCP Registry が発表されました。 ( 現在はプレビュー版 )

<!-- text-lint-disable ja-technical-writing/no-doubled-joshi -->

MCP Registry は MCP サーバーの配布方法および発見方法を標準化し、信頼性の高い単一情報源を提供することを目的とした中央レジストリです。

<!-- text-lint-enable ja-technical-writing/no-doubled-joshi -->

詳細は下記ブログをご参照ください。

https://blog.modelcontextprotocol.io/posts/2025-09-08-mcp-registry-preview/

---

ところで、今のところ MCP Registry は API のみを提供しており、 Web UI などはありません。
というわけで MCP Registry に登録されている MCP サーバーを検索できる [MCP Search](https://mcp-search.org) を作ったので紹介します。

https://github.com/koki-develop/mcp-search
https://mcp-search.org

# MCP Search の機能

MCP Registry に登録されている MCP サーバーを名前で検索し、 JSON 形式の設定例や環境変数などの情報を確認できます。

![demo](/images/mcp-search-introduction/demo.gif)
_こんな感じ_

以上です。

# 技術的な話

## 構成

![architecture](/images/mcp-search-introduction/architecture.png)

Firebase で構築されています。

- Cloud Functions for Firebase: 定期的に MCP Registry から MCP サーバーのデータを取得し、 Firestore に保存
- Firebase Hosting: React 製 SPA を配信

## MCP Registry から MCP サーバーを取得する

MCP Registry に登録されている MCP サーバーの情報を取得するのには公式の REST API を利用できます。

https://registry.modelcontextprotocol.io/docs
https://github.com/modelcontextprotocol/registry/blob/main/docs/guides/consuming/use-rest-api.md#consuming-registry-data-via-rest-api

OpenAPI 仕様は以下の URL から取得できます。

```
https://registry.modelcontextprotocol.io/openapi.yaml
```

例えば MCP サーバーの一覧は以下のエンドポイントから取得できます。

```
GET https://registry.modelcontextprotocol.io/v0/servers
```

```console:curl で取得する例
$ curl https://registry.modelcontextprotocol.io/v0/servers
{
  "servers": [
    {
      "$schema": "https://static.modelcontextprotocol.io/schemas/2025-07-09/server.schema.json",
      "name": "ai.waystation/gmail",
      "description": "Read emails, send messages, and manage labels in your Gmail account.",
      "status": "active",
      "repository": {
        "url": "https://github.com/waystation-ai/mcp",
        "source": "github"
...
```

# まとめ

今まではサードパーティ製の MCP サーバーのレジストリがたくさんあってどれを利用するか迷うことが多かったので、公式が用意してくれたのはありがたいですね〜。

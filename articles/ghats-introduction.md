---
title: "TypeScript で GitHub Actions Workflow 定義を作成する「ghats」の紹介"
emoji: "🌱"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["typescript", "githubactions"]
published: false
---

https://www.npmjs.com/package/ghats
https://github.com/koki-develop/ghats

# インストール

TODO: write

```sh
$ npm install -D ghats
```

# 基本的な使い方

TODO: write

```ts:.github/workflows/hello.ts
import { Workflow, Job } from "ghats";

const workflow = new Workflow("Hello", {
  on: "push",
});

workflow.addJob(
  new Job("hello", {
    runsOn: "ubuntu-latest",
  })
    .uses("actions/checkout@v4")
    .run("echo 'Hello, world!'"),
);

export default workflow;
```

# リモートアクションの型サポートを利用する

TODO: write

# まとめ

TODO: write

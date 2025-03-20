---
title: "create-react-app で作成したアプリを Vite に移行する"
emoji: "👌"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["react", "cra", "vite"]
published: true
---

`create-react-app` で作成したアプリを `vite` で起動できるようにするまでの手順メモ。

# 検証環境

- create-reactp-app@4.0.3
- vite@2.7.1

`create-react-app` は TypeScript テンプレートで作成したものを想定しています。
パッケージマネージャには `yarn` を使用しているため、 `npm` を使用している場合は適宜読み替えてください。

# 手順

## Vite をインストール

Vite と React 用のプラグインをインストールします。
また、 `react-scripts` は不要になるためついでにアンインストールしておきます。

```
$ yarn add -D vite @vitejs/plugin-react
$ yarn remove react-scripts
```

## Vite の設定ファイルを作成

以下の内容で `vite.config.ts` を作成します。

```ts:vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  server: {
    open: true, // 自動でブラウザを開く
  },
  build: {
    outDir: 'build', // ビルドの出力先ディレクトリ
  },
  plugins: [react()],
});
```

## `index.html` を更新

`index.html` を `public/` ディレクトリからプロジェクトのルートディレクトリに移動します。

```
$ mv public/index.html .
```

`index.html` 内の `%PUBLIC_URL%` を全て削除します。

```diff-html:index.html
 <!-- 例 -->
-<link rel="icon" href="%PUBLIC_URL%/favicon.ico" />
+<link rel="icon" href="/favicon.ico" />
```

`/src/index.tsx` を読み込む `<script>` タグを追記します。

```diff-html:index.html
 <body>
   <noscript>You need to enable JavaScript to run this app.</noscript>
   <div id="root"></div>
+  <script type="module" src="/src/index.tsx"></script>
 </body>
```

## 環境変数

環境変数名は `REACT_APP_*` にしていたものを `VITE_*` に変更します。

```diff:.env
-REACT_APP_HOGE=hoge
-REACT_APP_FUGA=fuga
+VITE_HOGE=hoge
+VITE_FUGA=fuga
```

アプリ内で環境変数を読み込むときは `process.env` ではなく `import.meta.env` を使用するようにします。

```diff-tsx
-process.env.VITE_HOGE
-process.env.VITE_FUGA
+import.meta.env.VITE_HOGE
+import.meta.env.VITE_FUGA
```

TypeScript を使用している場合、以下のような内容で `src/env.d.ts` を作成することで環境変数の型を定義できます。

```ts:src/env.d.ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_HOGE: string
  readonly VITE_FUGA: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

## `package.json` の `scripts` を更新

`vite` を使用するように書き換えます。

```diff-json:package.json
   "scripts": {
-    "start": "react-scripts start",
-    "build": "react-scripts build",
-    "test": "react-scripts test",
-    "eject": "react-scripts eject"
+    "start": "vite",
+    "build": "vite build",
+    "preview": "vite preview"
   },
```

## 移行完了

以下のコマンドでアプリを起動することができます。

```
$ yarn start
```

# 参考

https://vitejs.dev/guide/env-and-mode.html
https://www.darraghoriordan.com/2021/05/16/migrating-from-create-react-app-to-vite/

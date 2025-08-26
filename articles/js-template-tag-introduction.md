---
title: "JavaScript の中で JavaScript を記述できる「js-template-tag」の紹介"
emoji: "🪆"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["javascript", "typescript"]
published: true
published_at: 2025-09-01 18:00
---

![](/images/js-template-tag-introduction/demo.png =520x)

JavaScript でプログラムを記述している際に JavaScript を書きたくなることは多々あります。人間とはそういう生き物です。例外はありません。

- アプリケーション全体は JavaScript で実装しているが、特定の処理だけは JavaScript で実装したい！
- JavaScript の柔軟性と JavaScript の柔軟性を合わせたプログラムを書きたい！
- 今すぐ JavaScript を書きたいのに手元には JavaScript しかない！

そんなときに便利な js-template-tag をリリースしたので紹介します。

https://www.npmjs.com/package/js-template-tag
https://github.com/koki-develop/js-template-tag

# 使い方

`js` タグを使ってテンプレートリテラルに JavaScript プログラムを記述するとそのまま実行されます。

```js
import { js } from "js-template-tag";

js`
  function sayHello(name) {
    console.log(\`Hello, \${name}!\`);
  }

  sayHello("JavaScript");
`;
// => Hello, JavaScript!
```

値を返すこともできます。

```js
import { js } from "js-template-tag";

const value = js`
  (() => "Hello, JavaScript")();
`;

// これでも同じ
// const value = js`
//   "Hello, JavaScript"
// `;

console.log(value);
// => Hello, JavaScript!
```

当然、非同期関数や Promise も扱えます。

```js
import { js } from "js-template-tag";

const value = await js`
  (async () => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return "Hello, JavaScript!";
  })();
`;

console.log(value);
// => Hello, JavaScript!
```

## TypeScript

TypeScript を記述するための `ts` タグも提供されています。

```ts
import { ts } from "js-template-tag";

ts`
  function sayHello(name: string): void {
    console.log(\`Hello, \${name}!\`);
  }

  sayHello("TypeScript");
`;
// => Hello, TypeScript!
```

# 仕組み

`eval` してるだけです。

# まとめ

<!-- textlint-disable ja-technical-writing/ja-no-mixed-period -->

元ネタ↓

<!-- textlint-enable ja-technical-writing/ja-no-mixed-period -->

https://x.com/jallen_dev/status/1959041181788131624

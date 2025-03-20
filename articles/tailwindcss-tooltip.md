---
title: "Tailwind CSS でツールチップを作る"
emoji: "🙌"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["tailwindcss", "react", "typescript"]
published: true
---

Tailwind CSS だけでツールチップを作る実装のメモ。

# 作るもの

特定の要素 ( 今回はボタン ) にマウスカーソルを合わせると表示されるツールチップ。

[デモ](https://koki-develop.github.io/tailwindcss-tooltip-example/)

@[codesandbox](https://codesandbox.io/embed/github/koki-develop/tailwindcss-tooltip-example/tree/main/?fontsize=14&hidenavigation=1&module=%2Fsrc%2FTooltip.tsx&theme=dark)

# 検証環境

- Tailwind CSS v3.0.24

# ソースコード

https://github.com/koki-develop/tailwindcss-tooltip-example

# 実装

今回は React で実装しますが、スタイルの設定には Tailwind CSS しか使っていません。
React 以外の技術を利用している場合は適宜読み替えてください。

## ボタンを作成する

とりあえずボタンを作ります。
特に解説するポイントはありません。

```tsx:App.tsx
import React from "react";

const App: React.FC = () => {
  return (
    <button className="rounded border bg-white px-2 py-1 shadow transition hover:bg-gray-100">
      Button
    </button>
  );
};

export default App;
```

![](/images/tailwindcss-tooltip/1.png)

---

## ツールチップを作成する

`span` でツールチップを作成し、先程作成したボタンと一緒に `span` で囲みます。
ここでも特に難しいことはしていません。

:::message
以降の差分がわかりやすいようにツールチップの `className` に `Array.prototype.join()` を使っています。実際に実装するときには通常通り `"whitespace-nowrap rounded ..."` のように書いてください。
:::

```diff tsx:App.tsx
  import React from "react";

  const App: React.FC = () => {
    return (
+     <span>
+       <span
+         className={[
+           "whitespace-nowrap",
+           "rounded",
+           "bg-black",
+           "px-2",
+           "py-1",
+           "text-white",
+         ].join(" ")}
+       >
+         Hello World
+       </span>
        <button className="rounded border bg-white px-2 py-1 shadow transition hover:bg-gray-100">
           Button
         </button>
+     </span>
    );
  };

  export default App;
```

![](/images/tailwindcss-tooltip/2.png)

---

## ツールチップをボタンの上に配置

`absolute` と `-top-12` を追加してツールチップをボタンの上に配置します。
また、左右中央になるように `left-1/2` と `-translate-x-1/2` を追加しています。

```diff tsx:App.tsx
  import React from "react";

  const App: React.FC = () => {
    return (
-     <span>
+     <span className="relative">
        <span
          className={[
            "whitespace-nowrap",
            "rounded",
            "bg-black",
            "px-2",
            "py-1",
            "text-white",
+           "absolute",
+           "-top-12",
+           "left-1/2",
+           "-translate-x-1/2",
          ].join(" ")}
        >
          Hello World
        </span>
        <button className="rounded border bg-white px-2 py-1 shadow transition hover:bg-gray-100">
           Button
         </button>
      </span>
    );
  };

  export default App;
```

![](/images/tailwindcss-tooltip/3.png)

---

## ツールチップの下に三角をつける

`::before` 擬似要素 + `border` を使って下に三角をつけます。

```diff tsx:App.tsx
  import React from "react";

  const App: React.FC = () => {
    return (
      <span className="relative">
         <span
           className={[
            "whitespace-nowrap",
            "rounded",
            "bg-black",
            "px-2",
            "py-1",
            "text-white",
            "absolute",
            "-top-12",
            "left-1/2",
            "-translate-x-1/2",
+           "before:content-['']",
+           "before:absolute",
+           "before:-translate-x-1/2",
+           "before:left-1/2",
+           "before:top-full",
+           "before:border-4",
+           "before:border-transparent",
+           "before:border-t-black",
          ].join(" ")}
        >
          Hello World
        </span>
        <button className="rounded border bg-white px-2 py-1 shadow transition hover:bg-gray-100">
           Button
         </button>
      </span>
    );
  };

  export default App;
```

![](/images/tailwindcss-tooltip/4.png)

Tailwind CSS では `before:` Variant を使うことで `::before` 擬似クラスを設定することができます。

https://tailwindcss.com/docs/content#setting-a-pseudo-element-s-content

三角を作る部分は CSS の話になるのでここでは詳しい解説は割愛しますが、↓ がわかりやすかったので参考にしました。

https://saruwakakun.com/html-css/reference/speech-bubble

---

## ホバー時にツールチップが表示されるようにする

ツールチップ・ボタンを囲っている親要素に `group` クラスを追加し、ツールチップに `opacity-0`, `group-hover:opacity-100` クラスを追加します。
こうすることで、親要素にカーソルをホバーしたときにツールチップが表示されるようにできます。
ついでに `transition`, `pointer-events-none` も設定します。

```diff tsx:App.tsx
  import React from "react";

  const App: React.FC = () => {
    return (
-     <span className="relative">
+     <span className="relative group">
        <span
          className={[
            "whitespace-nowrap",
            "rounded",
            "bg-black",
            "px-2",
            "py-1",
            "text-white",
            "absolute",
            "-top-12",
            "left-1/2",
            "-translate-x-1/2",
            "before:content-['']",
            "before:absolute",
            "before:-translate-x-1/2",
            "before:left-1/2",
            "before:top-full",
            "before:border-4",
            "before:border-transparent",
            "before:border-t-black",
+           "opacity-0",
+           "group-hover:opacity-100",
+           "transition",
+           "pointer-events-none",
          ].join(" ")}
        >
          Hello World
        </span>
        <button className="rounded border bg-white px-2 py-1 shadow transition hover:bg-gray-100">
           Button
         </button>
      </span>
    );
  };

  export default App;
```

![](/images/tailwindcss-tooltip/5.gif)

Tailwind CSS では親要素の状態に基づいて要素にスタイルを適用したい場合、親要素に `group` クラスを設定し、スタイルを適用したい要素に `group-*` 修飾子を設定することで実現できます。

https://tailwindcss.com/docs/hover-focus-and-other-states#styling-based-on-parent-state

---

## 完成

ここまでで最低限完成です。
今回作ったコードを応用して上以外の場所に表示するようにしたり、繰り返し使えるようにコンポーネント化したりなど色々できると思います。

```tsx:App.tsx
import React from "react";

const App: React.FC = () => {
  return (
    <span className="relative group">
      <span
        className={[
          "whitespace-nowrap",
          "rounded",
          "bg-black",
          "px-2",
          "py-1",
          "text-white",
          "absolute",
          "-top-12",
          "left-1/2",
          "-translate-x-1/2",
          "before:content-['']",
          "before:absolute",
          "before:-translate-x-1/2",
          "before:left-1/2",
          "before:top-full",
          "before:border-4",
          "before:border-transparent",
          "before:border-t-black",
          "opacity-0",
          "group-hover:opacity-100",
          "transition",
          "pointer-events-none",
        ].join(" ")}
      >
        Hello World
      </span>
      <button className="rounded border bg-white px-2 py-1 shadow transition hover:bg-gray-100">
        Button
      </button>
    </span>
  );
};

export default App;
```

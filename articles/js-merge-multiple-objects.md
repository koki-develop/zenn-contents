---
title: "【Javascript】複数のオブジェクトを結合する"
emoji: "🔖"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["javascript", "nodejs"]
published: true
---

# 検証環境

- node v14.17.5

# [`Object.assign()`](https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Object/assign) を使用する方法

```js
const obj1 = { a: 1, b: 2, c: 3 };
const obj2 = { d: 4, e: 5, f: 6 };
Object.assign(obj1, obj2);

console.log(obj1);
// => { a: 1, b: 2, c: 3, d: 4, e: 5, f: 6 }
```

同じキーがある場合は第二引数に渡したオブジェクトの値で上書きされる。

```js
const obj1 = { a: 1, b: 2, c: 3 };
const obj2 = { a: 4 };
Object.assign(obj1, obj2);

console.log(obj1);
// => { a: 4, b: 2, c: 3 }
```

ちなみに [`Object.assign()`](https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Object/assign) の第二引数は[残余引数](https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Functions/rest_parameters)なので、 3 つ以上のオブジェクトを結合することもできる。

```js
const obj1 = { a: 1, b: 2, c: 3 };
const obj2 = { d: 4, e: 5, f: 6 };
const obj3 = { g: 7, h: 8, j: 9 };
Object.assign(obj1, obj2, obj3);

console.log(obj1);
// => { a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: 7, h: 8, j: 9 }
```

# スプレッド構文を使用する方法

```js
const obj1 = { a: 1, b: 2, c: 3 };
const obj2 = { d: 4, e: 5, f: 6 };
const result = { ...obj1, ...obj2 };

console.log(result);
// => { a: 1, b: 2, c: 3, d: 4, e: 5, f: 6 }
```

同じキーがある場合は二つ目のオブジェクトの値で上書きされる。

```js
const obj1 = { a: 1, b: 2, c: 3 };
const obj2 = { a: 4 };
const result = { ...obj1, ...obj2 };

console.log(result);
// => { a: 4, b: 2, c: 3 }
```

当然 3 つ以上のオブジェクトを結合することもできる。

```js
const obj1 = { a: 1, b: 2, c: 3 };
const obj2 = { d: 4, e: 5, f: 6 };
const obj3 = { g: 7, h: 8, j: 9 };
const result = { ...obj1, ...obj2, ...obj3 };

console.log(result);
// => { a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: 7, h: 8, j: 9 }
```

# 参考

https://stackoverflow.com/questions/171251/how-can-i-merge-properties-of-two-javascript-objects-dynamically
https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Object/assign

---
title: "Safari は file input に HEIC 画像を入力すると自動的に画像形式を変換することがある"
emoji: "🖼️"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["safari", "heic"]
published: true
published_at: 2025-02-17 18:00
---

備忘録。

# 要約

`<input type="file" />` に HEIC 画像を入力したとき、

**macOS Safari の場合**

- `accept` 属性で `image/heic` が許可されている場合、そのまま HEIC 画像が入力される。
- `accept` 属性で `image/heic` が許可されていない場合、**許可されている画像形式に自動的に変換される**。
  - 複数の画像形式が許可されている場合は、 `accept` 属性のうち**一番最初の変換可能な画像形式**に変換される。

**iOS Safari の場合**

- `accept` 属性の値に関わらず、 **JPEG 画像に変換される**。
    - **他の主要ブラウザ (Chrome, Firefox, Edge) でも同様**だったので、おそらく ~~iOS 側の仕様~~？
    - (2025/02/17 追記) **iOS 版 Webkit** の仕様？ (参考: [juner さんのコメント](https://zenn.dev/link/comments/c356d4558e16ad))

---

**まとめ表**

| ブラウザ | `accept` 属性 | 実際に入力される画像形式 |
| --- | --- | --- |
| macOS Safari | `""` | HEIC |
| macOS Safari | `"image/*"` | HEIC |
| macOS Safari | `"image/heic"` | HEIC |
| macOS Safari | `"image/jpeg,image/png,image/gif,image/heic"` | HEIC |
| macOS Safari | `"image/jpeg"` | JPEG |
| macOS Safari | `"image/png"` | PNG |
| macOS Safari | `"image/gif"` | GIF |
| macOS Safari | `"image/jpeg,image/png,image/gif"` | JPEG |
| macOS Safari | `"image/png,image/gif,image/jpeg"` | PNG |
| macOS Safari | `"image/gif,image/png,image/jpeg"` | GIF |
| iOS Safari | `""` | JPEG |
| iOS Safari | `"image/*"` | JPEG |
| iOS Safari | `"image/heic"` | JPEG |
| iOS Safari | `"image/jpeg,image/png,image/gif,image/heic"` | JPEG |
| iOS Safari | `"image/jpeg"` | JPEG |
| iOS Safari | `"image/png"` | JPEG |
| iOS Safari | `"image/gif"` | JPEG |
| iOS Safari | `"image/jpeg,image/png,image/gif"` | JPEG |
| iOS Safari | `"image/png,image/gif,image/jpeg"` | JPEG |
| iOS Safari | `"image/gif,image/png,image/jpeg"` | JPEG |

# 検証環境

- macOS Safari 17.6
- iOS Safari 604.1

# CodePen

@[codepen](https://codepen.io/koki-develop/pen/zxYxMOg)

# 今回使用する HEIC 画像

- ファイル名 : `dog.HEIC`
- ファイルサイズ : 2,805,169 byte

# 挙動を見てみる

## macOS Safari

### `accept` 属性で `image/heic` が許可されている場合

そのまま HEIC 画像が入力されます。

![](/images/safari-input-file-heic/macos-allow-heic.png =420x)
_`accept` 属性で `image/heic` が許可されている場合_

### `accept` 属性で `image/heic` が許可されていない場合

`accept` 属性のうち**一番最初の変換可能な画像形式に変換されます**。
画像形式が変われば当然ファイルサイズも変わります。
さらにいうとファイル名も変わります。

![](/images/safari-input-file-heic/macos-deny-heic.png =420x)
_`accept` 属性で `image/heic` が許可されていない場合_

## iOS Safari

`accept` 属性で `image/heic` が許可されてるかどうかに関わらず、**一律で JPEG 画像に変換されます**。
ファイル名は拡張子だけが変わります。

ちなみに**他の主要なブラウザ (Chrome, Firefox, Edge) でも同様の結果**だったので、おそらく Safari 固有の仕様というよりかは ~~iOS 側の仕様なのではないかと思われます~~ (要出典)。

(2024/02/17 追記) [juner さんのコメント](https://zenn.dev/link/comments/c356d4558e16ad):

> iOSではどのブラウザもレンダリングエンジンは Webkit の筈なので **iOS 版 Webkit の仕様**ではないでしょうか？

たしかに。

![](/images/safari-input-file-heic/ios-allow-heic.png =300x)
_`accept` 属性で `image/heic` が許可されている場合_

![](/images/safari-input-file-heic/ios-deny-heic.png =300x)
_`accept` 属性で `image/heic` が許可されていない場合_

# 参考

https://qiita.com/noboru_i/items/c7a1cb5200ea1ddda751

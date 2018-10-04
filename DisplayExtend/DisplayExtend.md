# DisplayExtendクラス

obniz.js標準のDisplayクラスの上位互換クラス。  
[Display](https://obniz.io/doc/sdk/doc/display)と同じすべての関数が機能するうえ、以下の機能を追加しています。ブラウザおよびNode.js環境で使用できます。

- 描画関数の追加<br>
arc() ： 円弧の描画<br>
roundRect() ： 角丸矩形の描画

- プロパティの追加<br>
lineSize ： 線の太さ<br>
drawImmediately ： obniz本体のOLEDディスプレイへの描画有無<br>
autoClear ： 自動クリアの有無<br>
onautoclear ： 自動クリア時のコールバック関数


## 使い方

引数にobnizのインスタンスを指定して、DisplayExtendクラスのインスタンスを生成します。

```javascript
const displayEx = new DisplayExtend(obniz);
```


ブラウザで使う場合

```html
:  :
<script src="https://obniz.io/users/340/repo/DisplayExtend.js"></script>
<script>
  const obniz = new Obniz("OBNIZ_ID_HERE");
  const displayEx = new DisplayExtend(obniz);
  displayEx.autoClear = 1000;
:  :
</script>
:  :
```

Node.js環境で使う場合（node-canvasが必要）

```javascript
const Obniz = require('obniz');
const DisplayExtend = require('https://obniz.io/users/340/repo/DisplayExtend.js');

const obniz = new Obniz("OBNIZ_ID_HERE");
const displayEx = new DisplayExtend(obniz);
displayEx.autoClear = 1000;
:  :
```

## arc(x, y, radius, startAngle, endAngle, anticlockwise, fill)

円弧を描画します。
引数`x, y, radius, startAngle, endAngle, anticlockwise`は、Canvasの[arc()](https://developer.mozilla.org/ja/docs/Web/API/CanvasRenderingContext2D/arc)と同じです。
最後の引数`fill`が`true`の場合は図形を塗り潰します。

## roundRect(x, y, width, height, radius, fill)

角丸矩形を描画します。
引数`x, y, width, height`と`fill`は、標準の`rect()`と同じです。
引数`radius`にて角丸の半径を指定します。

## lineSize

描画する図形の線の太さを指定します。省略時は1px。

```javascript
displayEx.lineSize = 5; //5px
```

## drawImmediately

`true` ： 描画関数を呼び出す都度、OLEDにも描画します。初期化後は`true`。  
`false` ： OLEDに描画しません。いくつかの図形を描画してからまとめてOLEDに描画するときは、最後の描画関数を呼び出すときに`true`にします。

```javascript
displayEx.drawImmediately = false;
displayEx.print(`draw triangle`); //no draw on OLED
displayEx.line(0, 0, 128, 0);     //no draw on OLED
displayEx.line(128, 0, 128, 64);  //no draw on OLED
displayEx.drawImmediately = true;
displayEx.line(128, 64, 0, 0);    //text and triangle draw on OLED
```

## autoClear

描画後一定時間の経過後に自動的にOLEDをクリアする場合、その間隔をミリ秒で指定します。`0`および省略時は自動クリアしません。
クリアは内部で`clear()`関数を呼び出します。  

```javascript
displayEx.autoClear = 3000; //3s
```

自動クリアの時間監視の起点は、`drawImmediately=true`での図形描画後、および`raw()`と`draw()`の呼び出し後です。


## onautoclear

コールバック関数が指定している場合は、自動クリア直後に、コールバック関数を呼び出します。

```javascript
displayEx.onautoclear = function() { console.log('autoclear'); };

```
`clear()`関数を明示的に呼び出した場合は、呼び出されません。


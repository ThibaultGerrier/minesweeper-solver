
## Capturing the screen pixels

JS has different methods to capture the screen to read colors of certain pixel-locations.

### nut-js

```typescript
import { screen, Point } from "@nut-tree/nut-js";

(async () => {
  const color: {R: number; G: number; B: number} = await screen.colorAt(new Point(500,100)))
})();
```

slow if you need do read multiple colors

### jimp

grab an image-buffer with some of the following samples and get colors with:

```typescript
function getColorAt(img: Jimp, posX: number, posY: number): {r: number; g: number; b: number} {
  return Jimp.intToRGBA(img.getPixelColor(posX, posY));
}
```


### nut-js + jimp


```typescript
import { Region, screen } from "@nut-tree/nut-js";
import Jimp from "jimp";

(async () => {
  const img = await screen.grabRegion(new Region(0, 0, 500, 500));
  const img2 = await img2.toRGB();
  const jimp = new Jimp({
    data: img2.data,
    width: img2.width,
    height: img2.height,
  });
  await jimp.writeAsync("img.png");
})();

```


### screenshot-desktop + jimp
https://github.com/bencevans/screenshot-desktop

```typescript
import screenshot from 'screenshot-desktop'
import Jimp from "jimp";


(async () => {
  const imgScreen = await screenshot();
  const jimp = await Jimp.read(imgScreen);
  jimp.crop(0, 60, 540, 420);
  await jimp.writeAsync('img.png');
})();
```


### playwright + jimp

The previous methods will capture the full screen, depending on your OS & OS settings this may not be possible.
As an alternative we can start a browser with a tool such as puppeteer/playwright that expose methods to take screenshots:

https://playwright.dev/docs/screenshots#capture-into-buffer


```typescript
import { chromium } from "@playwright/test";
import Jimp from "jimp";

(async () => {
  let browser = await chromium.launch({ headless: false });
  let page = await browser.newPage();
  await page.goto("https://www.google.com/fbx?fbx=minesweeper");
  const img = await page.screenshot();
  const jimp = await Jimp.read(img);
  jimp.crop(0, 60, 540, 420);
  await jimp.writeAsync('img.png');
  // browser.close();
})();
```

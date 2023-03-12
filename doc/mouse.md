## Controlling the mouse

### with nut-js

```typescript
import { mouse, Point } from "@nut-tree/nut-js";

(async() => {
  await mouse.move([new Point(500, 100)]);
  await mouse.leftClick();
  await mouse.rightClick();
})();
```

### with playwright

```typescript
import { chromium } from "@playwright/test";

(async () => {
  let browser = await chromium.launch({headless: false});
  let page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 1080 });
  await page.goto("https://www.google.com/fbx?fbx=minesweeper");

  await page.mouse.click(150, 150);
  await page.mouse.click(150, 150, { button: 'right' });
})();
```

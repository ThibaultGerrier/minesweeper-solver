import { app, BrowserWindow, desktopCapturer } from "electron";
import path from "path";
import Jimp from "jimp";
import { setTimeout } from "node:timers/promises";

let win: BrowserWindow;
const createWindow = () => {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  win.loadFile(path.join(__dirname, "..", "index.html"));
};

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

const getImg = async (name: string) => {
  const sources = await desktopCapturer.getSources({
    types: ["window"],
    thumbnailSize: {
      width: 1920, // 1846
      height: 1080,
    },
  });
  const chromeSource = sources.find((s) => s.name.includes("Google Chrome"));
  if (!chromeSource) {
    console.log("chrome not found");
    return;
  }
  const p = chromeSource.thumbnail
    .crop({
      x: 0,
      y: 165,
      width: 540,
      height: 420,
    })
    .toPNG();
  const j = await Jimp.read(p);
  await j.writeAsync(name);
};

(async () => {
  console.time("one");
  await getImg("./img.png");
  console.timeEnd("one");

  await setTimeout(5000);
  console.time("one");

  await getImg("./img2.png");
  console.timeEnd("one");
})();

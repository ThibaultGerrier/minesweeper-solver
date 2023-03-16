import { ipcRenderer } from "electron";

window.addEventListener("DOMContentLoaded", () => {
  const replaceText = (selector: any, text: any) => {
    const element = document.getElementById(selector);
    if (element) element.innerText = text;
  };

  for (const dependency of ["chrome", "node", "electron"]) {
    replaceText(`${dependency}-version`, process.versions[dependency]);
  }
});

ipcRenderer.on("SET_SOURCE", async (event, sourceId) => {
  console.log({ event, sourceId });

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        mandatory: {
          chromeMediaSource: "desktop",
          chromeMediaSourceId: sourceId,
          minWidth: 1280,
          maxWidth: 1280,
          minHeight: 720,
          maxHeight: 720,
        },
      } as any,
    });
    handleStream(stream);
  } catch (e) {
    handleError(e);
  }
});

function handleStream(stream: any) {
  const video: any = document.querySelector("video");
  video.srcObject = stream;
  video.onloadedmetadata = (e: any) => video.play();
}

function handleError(e: any) {
  console.log(e);
}

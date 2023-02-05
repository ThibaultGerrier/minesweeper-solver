import {
  mouse,
  left,
  right,
  up,
  down,
  screen,
  singleWord,
  Point,
  sleep,
  useLogger,
  Region,
  Image,
} from "@nut-tree/nut-js";
import Jimp from "jimp";

type RGB = [number, number, number];

const colors: Record<
  string,
  { rgb: RGB; offset?: { x?: number; y?: number } }
> = {
  "1": { rgb: [51, 127, 202] },
  // "2": [151, 167, 115],
  "2": { rgb: [56, 142, 60], offset: { y: 2 } },
  "3": { rgb: [211, 47, 47] },
  "4": { rgb: [123, 31, 162], offset: { x: 4 } },
  "5": { rgb: [239, 175, 100] },
  Green1: { rgb: [162, 209, 73] },
  Green2: { rgb: [170, 215, 81] },
  Grey1: { rgb: [215, 184, 153] },
  Grey2: { rgb: [229, 194, 159] },
};

const numCellsX = 18;
const numCellsY = 14;
const pxSizeX = 540;
const pxSizeY = 480;

const cellSizePx = pxSizeX / numCellsX;

const offSetY = 172;
const offSetX = 0;

function eq(a: number, b: number, e: number) {
  return Math.abs(a - b) < e;
}

function isColor(col1: RGB, col2: RGB) {
  const e = 10;
  return (
    eq(col1[0], col2[0], e) &&
    eq(col1[1], col2[1], e) &&
    eq(col1[2], col2[2], e)
  );
}

function colorToCell(col: string, x: number, y: number): Cell {
  if (col === "Grey1" || col === "Grey2") {
    return { type: "0", x, y };
  }
  if (col === "Green1" || col === "Green2") {
    return { type: "OPEN", x, y };
  }
  return { type: "NUMBER", value: Number(col), x, y };
}

function getColorAt(img: Jimp, posX: number, posY: number) {
  const { r, g, b } = Jimp.intToRGBA(img.getPixelColor(posX, posY));
  return [r, g, b] as RGB;
}

function xToPos(x: number) {
  return x * cellSizePx + cellSizePx / 2;
}

function yToPos(y: number) {
  return y * cellSizePx + cellSizePx / 2;
}

async function findColor(img: Jimp, x: number, y: number) {
  const found = Object.entries(colors).find(([k, v]) => {
    const posX = xToPos(x) + (v.offset?.x || 0);
    const posY = xToPos(y) + (v.offset?.y || 0);
    const rgb = getColorAt(img, posX, posY);
    return isColor(rgb, v.rgb);
  });
  if (!found) {
    console.log("Not found color", x, y, getColorAt(img, xToPos(x), yToPos(x)));
    await mouse.move([new Point(xToPos(x), yToPos(x))]);
    throw new Error();
  }
  return found[0];
}

async function getGameImage(
  x: number,
  y: number,
  width: number,
  height: number
) {
  const img2 = await screen.grabRegion(new Region(x, y, width, height));
  const img = await img2.toRGB();
  return new Jimp({
    data: img.data,
    width: img.width,
    height: img.height,
  });
}

type Cell = {
  value?: number;
  type: "FLAGGED" | "OPEN" | "NUMBER" | "0";
  x: number;
  y: number;
  wasClicked?: boolean;
};

type Board = Cell[][];

function prettyBoard(board: Board) {
  board.forEach((line) => {
    console.log(
      line
        .map((c) => {
          if (c.type === "FLAGGED") {
            return "F";
          }
          if (c.type === "OPEN") {
            return "?";
          }
          if (c.type === "NUMBER") {
            return c.value;
          }
          return "0";
        })
        .join(",")
    );
  });
  console.log("------------------------------------------");
}

function emptyBoard() {
  const board: Board = [];
  for (let y = 0; y < numCellsY; y++) {
    board.push([]);
    for (let x = 0; x < numCellsX; x++) {
      board[y].push({ x, y, type: "OPEN" });
    }
  }
  return board;
}

async function fillBoard(board: Board) {
  const img = await getGameImage(offSetX, offSetY, pxSizeX, pxSizeY);
  // img.write(".capture.jpg");

  // await mouse.move([new Point(20, offSetY)]);

  for (let y = 0; y < numCellsY; y++) {
    for (let x = 0; x < numCellsX; x++) {
      const oldCell = getCell(board, x, y);
      if (oldCell.type === "OPEN") {
        const col = await findColor(img, x, y);
        const cell = colorToCell(col, x, y);
        setCell(board, x, y, cell);
      }
    }
  }
}

function getNeighbours(board: Board, x: number, y: number) {
  return [
    getCell(board, x - 1, y - 1),
    getCell(board, x, y - 1),
    getCell(board, x + 1, y - 1),
    getCell(board, x + 1, y),
    getCell(board, x + 1, y + 1),
    getCell(board, x, y + 1),
    getCell(board, x - 1, y + 1),
    getCell(board, x - 1, y),
  ].filter((v) => !!v);
}

function sum(array: number[]) {
  return array.reduce((a, c) => a + c, 0);
}

async function clickCell(cell: Pick<Cell, "x" | "y">, type: "left" | "right") {
  const x = offSetX + cell.x * cellSizePx + cellSizePx / 2;
  const y = offSetY + cell.y * cellSizePx + cellSizePx / 2;
  await mouse.move([new Point(x, y)]);
  if (type === "left") {
    await mouse.leftClick();
  } else {
    await mouse.rightClick();
  }
}

function getCell(board: Board, x: number, y: number) {
  return board[y]?.[x];
}

function setCell(board: Board, x: number, y: number, cell: Cell) {
  board[y][x] = cell;
}

async function flagCells(board: Board) {
  let changes = false;
  for (let y = 0; y < numCellsY; y++) {
    for (let x = 0; x < numCellsX; x++) {
      const cell = getCell(board, x, y);
      //console.log(cell);
      if (cell.value) {
        const neighbours = getNeighbours(board, x, y);
        //console.log(neighbours);
        const openNeighbours = neighbours.filter(
          (n) => n.type === "OPEN" || n.type === "FLAGGED"
        );
        if (cell.value === openNeighbours.length) {
          const nonFlaggedNeighbours = openNeighbours.filter(
            (n) => n.type === "OPEN"
          );
          for (const n of nonFlaggedNeighbours) {
            //console.log("click", n.x, n.y);
            await clickCell(n, "right");
            n.type = "FLAGGED";
            changes = true;
          }
        }
      }
    }
  }
  return changes;
}

async function revealCells(board: Board) {
  let changes = false;
  for (let y = 0; y < numCellsY; y++) {
    for (let x = 0; x < numCellsX; x++) {
      const cell = getCell(board, x, y);
      if (cell.value) {
        const neighbours = getNeighbours(board, x, y);
        const flaggedNeighbours = neighbours.filter(
          (n) => n.type === "FLAGGED"
        );
        if (flaggedNeighbours.length === cell.value) {
          const nonFlaggedNonRevealedNeighbours = neighbours.filter(
            (n) => n.type === "OPEN" && !n.wasClicked
          );
          for (const n of nonFlaggedNonRevealedNeighbours) {
            await clickCell(n, "left");
            n.wasClicked = true;
            changes = true;
          }
        }
      }
    }
  }
  return changes;
}

function isDone(board: Board) {
  for (let y = 0; y < numCellsY; y++) {
    for (let x = 0; x < numCellsX; x++) {
      const cell = getCell(board, x, y);
      if (cell.type === "OPEN") {
        return false;
      }
    }
  }
  return true;
}

function getRandomInt(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min);
}

async function clickRandomOpen(board: Board) {
  const allOpen = board.flat().filter((c) => c.type === "OPEN");
  const randOpen = allOpen[getRandomInt(0, allOpen.length)];
  await clickCell({ x: randOpen.x, y: randOpen.y }, "left");
}

async function start() {
  const board = emptyBoard();
  while (!isDone(board)) {
    await fillBoard(board);
    //prettyBoard(board);
    const flagChanges = await flagCells(board);
    const revealChanges = await revealCells(board);
    if ((!flagChanges || !revealChanges) && !isDone(board)) {
      console.log("No more changes");
      await clickRandomOpen(board);
    }
    await sleep(1000);
  }
  console.log("DONE???");
}

start().catch((e) => console.log(e));

// Generates public/og-default.png (1200x630) with zero dependencies:
// pure-JS raster drawing + a minimal PNG encoder (node:zlib).
// Run: node scripts/generate-og-image.mjs
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";

const W = 1200;
const H = 630;

// --- 5x7 bitmap font (uppercase, digits, a few symbols) ---
const FONT = {
  A: [".###.", "#...#", "#...#", "#####", "#...#", "#...#", "#...#"],
  B: ["####.", "#...#", "#...#", "####.", "#...#", "#...#", "####."],
  C: [".###.", "#...#", "#....", "#....", "#....", "#...#", ".###."],
  D: ["####.", "#...#", "#...#", "#...#", "#...#", "#...#", "####."],
  E: ["#####", "#....", "#....", "####.", "#....", "#....", "#####"],
  F: ["#####", "#....", "#....", "####.", "#....", "#....", "#...."],
  G: [".###.", "#...#", "#....", "#.###", "#...#", "#...#", ".####"],
  H: ["#...#", "#...#", "#...#", "#####", "#...#", "#...#", "#...#"],
  I: ["#####", "..#..", "..#..", "..#..", "..#..", "..#..", "#####"],
  J: ["..###", "...#.", "...#.", "...#.", "...#.", "#..#.", ".##.."],
  K: ["#...#", "#..#.", "#.#..", "##...", "#.#..", "#..#.", "#...#"],
  L: ["#....", "#....", "#....", "#....", "#....", "#....", "#####"],
  M: ["#...#", "##.##", "#.#.#", "#.#.#", "#...#", "#...#", "#...#"],
  N: ["#...#", "##..#", "#.#.#", "#..##", "#...#", "#...#", "#...#"],
  O: [".###.", "#...#", "#...#", "#...#", "#...#", "#...#", ".###."],
  P: ["####.", "#...#", "#...#", "####.", "#....", "#....", "#...."],
  Q: [".###.", "#...#", "#...#", "#...#", "#.#.#", "#..#.", ".##.#"],
  R: ["####.", "#...#", "#...#", "####.", "#.#..", "#..#.", "#...#"],
  S: [".####", "#....", "#....", ".###.", "....#", "....#", "####."],
  T: ["#####", "..#..", "..#..", "..#..", "..#..", "..#..", "..#.."],
  U: ["#...#", "#...#", "#...#", "#...#", "#...#", "#...#", ".###."],
  V: ["#...#", "#...#", "#...#", "#...#", "#...#", ".#.#.", "..#.."],
  W: ["#...#", "#...#", "#...#", "#.#.#", "#.#.#", "##.##", "#...#"],
  X: ["#...#", "#...#", ".#.#.", "..#..", ".#.#.", "#...#", "#...#"],
  Y: ["#...#", "#...#", ".#.#.", "..#..", "..#..", "..#..", "..#.."],
  Z: ["#####", "....#", "...#.", "..#..", ".#...", "#....", "#####"],
  "0": [".###.", "#...#", "#..##", "#.#.#", "##..#", "#...#", ".###."],
  "1": ["..#..", ".##..", "..#..", "..#..", "..#..", "..#..", "#####"],
  "2": [".###.", "#...#", "....#", "...#.", "..#..", ".#...", "#####"],
  "3": [".###.", "#...#", "....#", "..##.", "....#", "#...#", ".###."],
  "4": ["....#", "...#.", "..##.", ".#.#.", "#####", "...#.", "...#."],
  "5": ["#####", "#....", "####.", "....#", "....#", "#...#", ".###."],
  "6": ["..##.", ".#...", "#....", "####.", "#...#", "#...#", ".###."],
  "7": ["#####", "....#", "...#.", "..#..", ".#...", ".#...", ".#..."],
  "8": [".###.", "#...#", "#...#", ".###.", "#...#", "#...#", ".###."],
  "9": [".###.", "#...#", "#...#", ".####", "....#", "...#.", ".##.."],
  " ": [".....", ".....", ".....", ".....", ".....", ".....", "....."],
  "-": [".....", ".....", ".....", "#####", ".....", ".....", "....."],
  ".": [".....", ".....", ".....", ".....", ".....", ".....", ".##.."],
  "·": [".....", ".....", ".....", ".###.", ".....", ".....", "....."],
  "&": [".###.", "#...#", "#.#..", ".##..", "#...#", "#...#", ".###."],
};

const img = new Uint8Array(W * H * 3);

function setPixel(x, y, [r, g, b]) {
  if (x < 0 || x >= W || y < 0 || y >= H) return;
  const i = (y * W + x) * 3;
  img[i] = r;
  img[i + 1] = g;
  img[i + 2] = b;
}

function putGlyph(glyph, x, y, scale, color) {
  for (let r = 0; r < 7; r++) {
    for (let c = 0; c < 5; c++) {
      if (glyph[r][c] !== "#") continue;
      for (let dy = 0; dy < scale; dy++)
        for (let dx = 0; dx < scale; dx++)
          setPixel(x + c * scale + dx, y + r * scale + dy, color);
    }
  }
}

function textWidth(text, scale, tracking) {
  return text.length * (5 * scale + tracking) - tracking;
}

function drawText(text, x, y, scale, tracking, color) {
  let cx = x;
  for (const ch of text.toUpperCase()) {
    const glyph = FONT[ch] ?? FONT[" "];
    putGlyph(glyph, cx, y, scale, color);
    cx += 5 * scale + tracking;
  }
}

// --- background: vertical gradient #0d1117 -> #101828 ---
for (let y = 0; y < H; y++) {
  const t = y / (H - 1);
  const r = Math.round(0x0d + (0x10 - 0x0d) * t);
  const g = Math.round(0x11 + (0x18 - 0x11) * t);
  const b = Math.round(0x17 + (0x28 - 0x17) * t);
  for (let x = 0; x < W; x++) setPixel(x, y, [r, g, b]);
}

// --- accent: teal diagonal band (bottom-left) ---
for (let y = 0; y < H; y++) {
  for (let x = 0; x < 430; x++) {
    if (Math.abs(y - (H - x)) < 14) setPixel(x, y, [0x2d, 0xd4, 0xbf]);
  }
}

// --- accent: amber circle (top-right) ---
const CCX = 1050;
const CCY = 120;
const CR = 48;
for (let y = CCY - CR; y <= CCY + CR; y++) {
  for (let x = CCX - CR; x <= CCX + CR; x++) {
    const dx = x - CCX;
    const dy = y - CCY;
    if (dx * dx + dy * dy <= CR * CR) setPixel(x, y, [0xf5, 0x9e, 0x0b]);
  }
}

// --- text ---
const title = "Carlos Philips";
const titleScale = 8;
const titleTracking = 8;
const titleW = textWidth(title, titleScale, titleTracking);
drawText(
  title,
  (W - titleW) / 2,
  230,
  titleScale,
  titleTracking,
  [0xe6, 0xed, 0xf3],
);

const role =
  "Data Center & Network Engineer · Full-Stack Developer · AI Automation";
const roleScale = 2;
const roleTracking = 2;
const roleW = textWidth(role, roleScale, roleTracking);
drawText(role, (W - roleW) / 2, 410, roleScale, roleTracking, [0x8b, 0x94, 0x9e]);

const url = "cphilcomputers.com";
const urlScale = 2;
const urlTracking = 2;
const urlW = textWidth(url, urlScale, urlTracking);
drawText(url, W - urlW - 48, 520, urlScale, urlTracking, [0x2d, 0xd4, 0xbf]);

// --- minimal PNG encoder (truecolor RGB, filter 0, zlib) ---
const crcTable = new Int32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  crcTable[n] = c;
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const typeBuf = Buffer.from(type, "ascii");
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])));
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(W, 0);
ihdr.writeUInt32BE(H, 4);
ihdr[8] = 8; // bit depth
ihdr[9] = 2; // color type: truecolor
ihdr[10] = 0;
ihdr[11] = 0;
ihdr[12] = 0;

const raw = Buffer.alloc(H * (1 + W * 3));
for (let y = 0; y < H; y++) {
  raw[y * (1 + W * 3)] = 0; // filter: none
  for (let x = 0; x < W; x++) {
    const si = (y * W + x) * 3;
    const di = y * (1 + W * 3) + 1 + x * 3;
    raw[di] = img[si];
    raw[di + 1] = img[si + 1];
    raw[di + 2] = img[si + 2];
  }
}

const png = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  chunk("IHDR", ihdr),
  chunk("IDAT", zlib.deflateSync(raw, { level: 9 })),
  chunk("IEND", Buffer.alloc(0)),
]);

const out = path.join(process.cwd(), "public", "og-default.png");
fs.writeFileSync(out, png);
console.log(`Wrote ${out} (${png.length} bytes, ${W}x${H})`);

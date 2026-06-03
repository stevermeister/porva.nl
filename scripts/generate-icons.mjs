/**
 * Generates favicon set and OG social preview image.
 *
 * Favicons come from public/favicon-source.svg (transparent bg, orange wrench).
 * apple-touch-icon composites the wrench onto a navy background for iOS.
 * OG image still uses the full-body mascot from public/foto/vlad.png.
 *
 * Usage: npm run generate-icons
 */

import sharp from "sharp";
import { readFileSync, writeFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC = path.resolve(__dirname, "../public");
const VLAD = path.join(PUBLIC, "foto/vlad.png");
const FAVICON_SVG = path.join(PUBLIC, "favicon-source.svg");

// ─── Favicon PNGs — transparent background, wrench only ──────────────────────
await sharp(FAVICON_SVG)
  .resize(32, 32)
  .png()
  .toFile(path.join(PUBLIC, "favicon-32x32.png"));
console.log("✓ favicon-32x32.png");

await sharp(FAVICON_SVG)
  .resize(16, 16)
  .png()
  .toFile(path.join(PUBLIC, "favicon-16x16.png"));
console.log("✓ favicon-16x16.png");

// ─── favicon.ico (48 + 32 + 16, PNG-inside-ICO) ──────────────────────────────
const ico48 = await sharp(FAVICON_SVG).resize(48, 48).png().toBuffer();
const ico32 = readFileSync(path.join(PUBLIC, "favicon-32x32.png"));
const ico16 = readFileSync(path.join(PUBLIC, "favicon-16x16.png"));
writeFileSync(path.join(PUBLIC, "favicon.ico"), buildIco([
  { size: 48, data: ico48 },
  { size: 32, data: ico32 },
  { size: 16, data: ico16 },
]));
console.log("✓ favicon.ico");

// ─── apple-touch-icon: navy background + centered wrench (iOS home screen) ───
const TOUCH_SIZE = 180;
const WRENCH_SIZE = Math.round(TOUCH_SIZE * 0.75); // 135px
const WRENCH_OFFSET = Math.round((TOUCH_SIZE - WRENCH_SIZE) / 2); // 22px

const navyBg = await sharp({
  create: {
    width: TOUCH_SIZE,
    height: TOUCH_SIZE,
    channels: 4,
    background: { r: 26, g: 46, b: 74, alpha: 1 }, // #1A2E4A
  },
}).png().toBuffer();

const wrenchBuf = await sharp(FAVICON_SVG)
  .resize(WRENCH_SIZE, WRENCH_SIZE)
  .png()
  .toBuffer();

await sharp(navyBg)
  .composite([{ input: wrenchBuf, top: WRENCH_OFFSET, left: WRENCH_OFFSET }])
  .png()
  .toFile(path.join(PUBLIC, "apple-touch-icon.png"));
console.log("✓ apple-touch-icon.png");

// ─── OG image (1200 × 630) ───────────────────────────────────────────────────
// Mascot: resize full-body to fit the left 40% column (max height = 630)
const MASCOT_H = 625;
const mascotBuf = await sharp(VLAD)
  .resize({ height: MASCOT_H, fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
  .toBuffer();
const mascotW = (await sharp(mascotBuf).metadata()).width;

const TEXT_X = mascotW + 55;
const FONT = "Helvetica Neue, Helvetica, Liberation Sans, DejaVu Sans, Arial, sans-serif";

const svgBg = `<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="#1a4d7a"/>
  <rect width="${mascotW + 30}" height="630" fill="#153f65" opacity="0.45"/>
  <text x="${TEXT_X}" y="218" font-family="${FONT}" font-size="56" font-weight="bold" fill="white" dominant-baseline="auto">Vladimir Porva</text>
  <text x="${TEXT_X}" y="272" font-family="${FONT}" font-size="30" fill="#93c5fd">Loodgieter &amp; klusser</text>
  <text x="${TEXT_X}" y="308" font-family="${FONT}" font-size="24" font-style="italic" fill="#bfdbfe">uit de Stripheldenbuurt</text>
  <rect x="${TEXT_X}" y="334" width="${1200 - TEXT_X - 60}" height="1" fill="#3b82f6" opacity="0.6"/>
  <text x="${TEXT_X}" y="378" font-family="${FONT}" font-size="30" font-weight="bold" fill="#d97706">085 799 0777</text>
  <text x="${TEXT_X}" y="418" font-family="${FONT}" font-size="22" fill="#93c5fd">porva.nl</text>
</svg>`;

const bgBuf = await sharp(Buffer.from(svgBg)).png().toBuffer();

await sharp(bgBuf)
  .composite([{ input: mascotBuf, top: 5, left: 15 }])
  .png()
  .toFile(path.join(PUBLIC, "og-image.png"));
console.log("✓ og-image.png");

console.log("\nAll assets written to public/");

// ─── ICO builder ─────────────────────────────────────────────────────────────
function buildIco(images) {
  const N = images.length;
  let dataOffset = 6 + 16 * N;

  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(N, 4);

  const entries = images.map(({ size, data }) => {
    const e = Buffer.alloc(16);
    e.writeUInt8(size >= 256 ? 0 : size, 0);
    e.writeUInt8(size >= 256 ? 0 : size, 1);
    e.writeUInt8(0, 2);
    e.writeUInt8(0, 3);
    e.writeUInt16LE(1, 4);
    e.writeUInt16LE(32, 6);
    e.writeUInt32LE(data.length, 8);
    e.writeUInt32LE(dataOffset, 12);
    dataOffset += data.length;
    return e;
  });

  return Buffer.concat([header, ...entries, ...images.map((i) => i.data)]);
}

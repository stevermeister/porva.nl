/**
 * Generates favicon set and OG social preview image.
 *
 * Favicons come from public/favicon-source.svg (navy background, orange wrench).
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

// ─── Favicon PNGs from SVG source ────────────────────────────────────────────
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

// apple-touch-icon: 180×180 — SVG already has navy background, no compositing needed
await sharp(FAVICON_SVG)
  .resize(180, 180)
  .png()
  .toFile(path.join(PUBLIC, "apple-touch-icon.png"));
console.log("✓ apple-touch-icon.png");

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

// ─── OG image (1200 × 630) ───────────────────────────────────────────────────
// Mascot: resize full-body to fit the left 40% column (max height = 630)
// At h=630: aspect 1472/2872 ≈ 0.512 → width ≈ 323px. Fit within left 40%.
const MASCOT_H = 625;
const mascotBuf = await sharp(VLAD)
  .resize({ height: MASCOT_H, fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
  .toBuffer();
const mascotW = (await sharp(mascotBuf).metadata()).width;

// Text column starts after mascot + padding
const TEXT_X = mascotW + 55;
const FONT = "Helvetica Neue, Helvetica, Liberation Sans, DejaVu Sans, Arial, sans-serif";

// Vertical rhythm — text block centred in 630px
const svgBg = `<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="1200" height="630" fill="#1a4d7a"/>

  <!-- Subtle left-column tint so mascot area reads as a zone -->
  <rect width="${mascotW + 30}" height="630" fill="#153f65" opacity="0.45"/>

  <!-- Name -->
  <text
    x="${TEXT_X}" y="218"
    font-family="${FONT}" font-size="56" font-weight="bold"
    fill="white" dominant-baseline="auto">Vladimir Porva</text>

  <!-- Tagline -->
  <text
    x="${TEXT_X}" y="272"
    font-family="${FONT}" font-size="30" fill="#93c5fd">Loodgieter &amp; klusser</text>

  <!-- Neighbourhood -->
  <text
    x="${TEXT_X}" y="308"
    font-family="${FONT}" font-size="24" font-style="italic" fill="#bfdbfe">uit de Stripheldenbuurt</text>

  <!-- Separator -->
  <rect x="${TEXT_X}" y="334" width="${1200 - TEXT_X - 60}" height="1" fill="#3b82f6" opacity="0.6"/>

  <!-- Phone -->
  <text
    x="${TEXT_X}" y="378"
    font-family="${FONT}" font-size="30" font-weight="bold" fill="#d97706">085 799 0777</text>

  <!-- Domain -->
  <text
    x="${TEXT_X}" y="418"
    font-family="${FONT}" font-size="22" fill="#93c5fd">porva.nl</text>
</svg>`;

const bgBuf = await sharp(Buffer.from(svgBg)).png().toBuffer();

await sharp(bgBuf)
  .composite([{ input: mascotBuf, top: 5, left: 15 }])
  .png()
  .toFile(path.join(PUBLIC, "og-image.png"));
console.log("✓ og-image.png");

console.log("\nAll assets written to public/");

// ─── ICO builder ─────────────────────────────────────────────────────────────
// Writes a PNG-inside-ICO (supported by all modern browsers).
function buildIco(images) {
  const N = images.length;
  let dataOffset = 6 + 16 * N;

  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: ICO
  header.writeUInt16LE(N, 4);

  const entries = images.map(({ size, data }) => {
    const e = Buffer.alloc(16);
    e.writeUInt8(size >= 256 ? 0 : size, 0); // width  (0 = 256)
    e.writeUInt8(size >= 256 ? 0 : size, 1); // height
    e.writeUInt8(0, 2); // colour count
    e.writeUInt8(0, 3); // reserved
    e.writeUInt16LE(1, 4);  // colour planes
    e.writeUInt16LE(32, 6); // bits per pixel
    e.writeUInt32LE(data.length, 8);
    e.writeUInt32LE(dataOffset, 12);
    dataOffset += data.length;
    return e;
  });

  return Buffer.concat([header, ...entries, ...images.map((i) => i.data)]);
}

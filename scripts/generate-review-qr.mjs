// Generates the Google-review QR code (with the Porva mascot in the centre)
// in both PNG (print-ready) and SVG (vector) form, plus a print card.
// Run: npm run generate-review-qr
import QRCode from "qrcode";
import sharp from "sharp";
import { writeFileSync } from "fs";

const REVIEW_URL = "https://g.page/r/CeJAqhX34WwfEBM/review";
const OUT = new URL("../public/", import.meta.url).pathname;

const NAVY = "#1A2E4A";
const CREAM = "#FBF7F0";
const ORANGE = "#E07B00";
const WHITE = "#FFFFFF";
const SIZE = 1200; // px, print resolution

// Porva mascot (single path, native 128x128 viewBox)
const MASCOT =
  "M50.4 78.5a75.1 75.1 0 0 0-28.5 6.9l24.2-65.7c.7-2 1.9-3.2 3.4-3.2h29c1.5 0 2.7 1.2 3.4 3.2l24.2 65.7s-11.6-7-28.5-7L67 45.5c-.4-1.7-1.6-2.8-2.9-2.8-1.3 0-2.5 1.1-2.9 2.7L50.4 78.5Zm-1.1 28.2Zm-4.2-20.2c-2 6.6-.6 15.8 4.2 20.2a17.5 17.5 0 0 1 .2-.7 5.5 5.5 0 0 1 5.7-4.5c2.8.1 4.3 1.5 4.7 4.7.2 1.1.2 2.3.2 3.5v.4c0 2.7.7 5.2 2.2 7.4a13 13 0 0 0 5.7 4.9v-.3l-.2-.3c-1.8-5.6-.5-9.5 4.4-12.8l1.5-1a73 73 0 0 0 3.2-2.2 16 16 0 0 0 6.8-11.4c.3-2 .1-4-.6-6l-.8.6-1.6 1a37 37 0 0 1-22.4 2.7c-5-.7-9.7-2-13.2-6.2Z";

// White circular pad + orange ring + navy mascot, rendered at `d` px.
function logoSvg(d, ring = ORANGE) {
  const r = d / 2;
  const mScale = (d * 0.52) / 128; // mascot ~52% of pad
  const mOff = (d - 128 * mScale) / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${d}" height="${d}" viewBox="0 0 ${d} ${d}">
    <circle cx="${r}" cy="${r}" r="${r - d * 0.03}" fill="${WHITE}" stroke="${ring}" stroke-width="${d * 0.05}"/>
    <g transform="translate(${mOff} ${mOff}) scale(${mScale})"><path d="${MASCOT}" fill="${NAVY}"/></g>
  </svg>`;
}

// ---------- PNG (raster, print-ready) ----------
const qrPng = await QRCode.toBuffer(REVIEW_URL, {
  errorCorrectionLevel: "H",
  margin: 2,
  width: SIZE,
  color: { dark: NAVY, light: WHITE },
});
const logoPx = Math.round(SIZE * 0.24);
const logoPng = await sharp(Buffer.from(logoSvg(logoPx)))
  .png()
  .toBuffer();
await sharp(qrPng)
  .composite([{ input: logoPng, gravity: "center" }])
  .png()
  .toFile(`${OUT}review-qr.png`);
console.log("wrote review-qr.png");

// ---------- SVG (vector) ----------
const qrSvg = await QRCode.toString(REVIEW_URL, {
  type: "svg",
  errorCorrectionLevel: "H",
  margin: 2,
  color: { dark: NAVY, light: WHITE },
});
const vbMatch = qrSvg.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/);
const N = parseFloat(vbMatch[1]);
const logoD = N * 0.26;
const c = N / 2;
const mScale = (logoD * 0.52) / 128;
const mOff = c - (128 * mScale) / 2;
const overlay = `<circle cx="${c}" cy="${c}" r="${logoD / 2 - logoD * 0.03}" fill="${WHITE}" stroke="${ORANGE}" stroke-width="${logoD * 0.05}"/>
  <g transform="translate(${mOff} ${mOff}) scale(${mScale})"><path d="${MASCOT}" fill="${NAVY}"/></g>`;
const mergedSvg = qrSvg.replace(/<\/svg>\s*$/, `${overlay}</svg>`);
writeFileSync(`${OUT}review-qr.svg`, mergedSvg);
console.log("wrote review-qr.svg");

// ---------- Print card (QR + Dutch call-to-action) ----------
const CARD_W = 1000;
const CARD_H = 1400;
const qrOnCard = 720;
const cardBg = `<svg xmlns="http://www.w3.org/2000/svg" width="${CARD_W}" height="${CARD_H}" viewBox="0 0 ${CARD_W} ${CARD_H}">
  <rect width="${CARD_W}" height="${CARD_H}" fill="${CREAM}"/>
  <rect x="40" y="40" width="${CARD_W - 80}" height="${CARD_H - 80}" rx="40" fill="#fff" stroke="${NAVY}" stroke-opacity="0.1"/>
  <g transform="translate(${CARD_W / 2 - 80} 130)"><path d="${MASCOT}" fill="${NAVY}" transform="scale(1.25)"/></g>
  <text x="${CARD_W / 2}" y="360" font-family="'Helvetica Neue',Arial,sans-serif" font-size="60" font-weight="800" fill="${NAVY}" text-anchor="middle">Tevreden over het werk?</text>
  <text x="${CARD_W / 2}" y="430" font-family="'Helvetica Neue',Arial,sans-serif" font-size="38" font-weight="400" fill="${NAVY}" fill-opacity="0.65" text-anchor="middle">Scan &amp; laat een Google-review achter</text>
  <text x="${CARD_W / 2}" y="${CARD_H - 90}" font-family="'Helvetica Neue',Arial,sans-serif" font-size="40" font-weight="700" fill="${ORANGE}" text-anchor="middle">porva.nl/review</text>
</svg>`;
const cardBase = await sharp(Buffer.from(cardBg)).png().toBuffer();
const qrForCard = await sharp(qrPng)
  .composite([{ input: logoPng, gravity: "center" }])
  .resize(qrOnCard, qrOnCard)
  .png()
  .toBuffer();
await sharp(cardBase)
  .composite([{ input: qrForCard, left: Math.round((CARD_W - qrOnCard) / 2), top: 500 }])
  .png()
  .toFile(`${OUT}review-card.png`);
console.log("wrote review-card.png");

console.log("done");

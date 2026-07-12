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

// Porva app-icon wrench (favicon-source.svg, native 512x512 viewBox, orange stroke)
const WRENCH =
  "M310 135a22 22 0 0 0 0 31l36 36a22 22 0 0 0 31 0l84-84a132 132 0 0 1-175 175l-153 153a47 47 0 0 1-66-66l153-153a132 132 0 0 1 175-175l-83 83z";

// The brand app-icon (navy rounded square + orange wrench) as the QR centre,
// with a white pad so it stays separated from the navy QR modules.
// Returns SVG inner markup sized to `d` px, offset by (ox, oy).
function wrenchIcon(d, ox = 0, oy = 0) {
  const inset = d * 0.05;
  const rad = d * 0.2;
  const wScale = (d * 0.52) / 512;
  const wOff = (d - 512 * wScale) / 2;
  return `<g transform="translate(${ox} ${oy})">
    <rect x="0" y="0" width="${d}" height="${d}" rx="${rad}" fill="${WHITE}"/>
    <rect x="${inset}" y="${inset}" width="${d - 2 * inset}" height="${d - 2 * inset}" rx="${rad * 0.8}" fill="${NAVY}"/>
    <g transform="translate(${wOff} ${wOff}) scale(${wScale})">
      <path d="${WRENCH}" fill="none" stroke="${ORANGE}" stroke-width="40" stroke-linecap="round" stroke-linejoin="round"/>
    </g>
  </g>`;
}

// Standalone logo SVG (for raster compositing), rendered at `d` px.
function logoSvg(d) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${d}" height="${d}" viewBox="0 0 ${d} ${d}">${wrenchIcon(d)}</svg>`;
}

const LOGO_FRAC = 0.23; // centre logo as fraction of QR size

// Render a QR (with centred wrench logo) natively at the given pixel size.
// Rendering natively per target size — instead of downscaling a big QR —
// keeps module edges crisp so scanners read it reliably.
async function makeQr(size) {
  const qr = await QRCode.toBuffer(REVIEW_URL, {
    errorCorrectionLevel: "H",
    margin: 2,
    width: size,
    color: { dark: NAVY, light: WHITE },
  });
  const logo = await sharp(Buffer.from(logoSvg(Math.round(size * LOGO_FRAC))))
    .png()
    .toBuffer();
  return sharp(qr).composite([{ input: logo, gravity: "center" }]).png().toBuffer();
}

// ---------- PNG (raster, print-ready) ----------
await sharp(await makeQr(SIZE)).toFile(`${OUT}review-qr.png`);
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
const logoD = N * (LOGO_FRAC + 0.02);
const topLeft = (N - logoD) / 2;
const overlay = wrenchIcon(logoD, topLeft, topLeft);
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
  ${wrenchIcon(150, CARD_W / 2 - 75, 120)}
  <text x="${CARD_W / 2}" y="360" font-family="'Helvetica Neue',Arial,sans-serif" font-size="60" font-weight="800" fill="${NAVY}" text-anchor="middle">Tevreden over het werk?</text>
  <text x="${CARD_W / 2}" y="430" font-family="'Helvetica Neue',Arial,sans-serif" font-size="38" font-weight="400" fill="${NAVY}" fill-opacity="0.65" text-anchor="middle">Scan &amp; laat een Google-review achter</text>
  <text x="${CARD_W / 2}" y="${CARD_H - 90}" font-family="'Helvetica Neue',Arial,sans-serif" font-size="40" font-weight="700" fill="${ORANGE}" text-anchor="middle">porva.nl/review</text>
</svg>`;
const cardBase = await sharp(Buffer.from(cardBg)).png().toBuffer();
const qrForCard = await makeQr(qrOnCard); // rendered natively at card size
await sharp(cardBase)
  .composite([{ input: qrForCard, left: Math.round((CARD_W - qrOnCard) / 2), top: 500 }])
  .png()
  .toFile(`${OUT}review-card.png`);
console.log("wrote review-card.png");

console.log("done");

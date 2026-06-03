/**
 * Recenters vlad.png so the mascot's feet are at the horizontal center.
 *
 * Strategy:
 *   1. Trim all fully-transparent edges (sharp .trim())
 *   2. Add equal left/right padding so the trimmed content is horizontally centered
 *   3. Add a small bottom gap (~5% of height) so feet don't touch the canvas edge
 *   4. Overwrite public/foto/vlad.png (always reading from the backup for idempotency)
 *
 * Usage: npm run recenter-mascot
 * Safe to re-run — always starts fresh from vlad-original.png.
 */

import sharp from 'sharp';
import { existsSync, copyFileSync } from 'fs';

const inputPath  = 'public/foto/vlad.png';
const backupPath = 'public/foto/vlad-original.png';
const outputPath = 'public/foto/vlad.png';

// Back up original once — subsequent runs always use the backup as source.
if (!existsSync(backupPath)) {
  copyFileSync(inputPath, backupPath);
  console.log('Backup created at', backupPath);
} else {
  console.log('Backup already exists at', backupPath, '— using it as source.');
}

// Step 1: trim transparent edges to get the tight bounding box.
const { data, info } = await sharp(backupPath)
  .trim({ threshold: 1 })
  .toBuffer({ resolveWithObject: true });

console.log(`Trimmed dimensions: ${info.width} x ${info.height}`);

// Step 2: compute equal horizontal padding (10% of trimmed width per side).
const horizontalPadding = Math.floor(info.width * 0.10);
const bottomPadding     = Math.floor(info.height * 0.05);

console.log(`Adding ${horizontalPadding}px left+right, ${bottomPadding}px bottom`);

// Step 3: extend canvas symmetrically and write output.
await sharp(data)
  .extend({
    top:    0,
    bottom: bottomPadding,
    left:   horizontalPadding,
    right:  horizontalPadding,
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  })
  .png()
  .toFile(outputPath);

const finalMeta = await sharp(outputPath).metadata();
console.log(`Re-centered mascot saved → ${outputPath} (${finalMeta.width} x ${finalMeta.height})`);
console.log('Re-run any time — vlad-original.png is always the source.');

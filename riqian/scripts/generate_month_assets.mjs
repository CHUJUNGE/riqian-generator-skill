#!/usr/bin/env node
// Builds the 12 fixed month header assets from the bundled Bell MT Bold font.
// Run only when the approved font changes; production uses the generated PNGs.
import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

if (!process.env.RIQIAN_NODE_MODULES) throw new Error('Set RIQIAN_NODE_MODULES to Codex bundled node_modules.');
const require = createRequire(import.meta.url);
const { Canvas, FontLibrary } = require(path.join(process.env.RIQIAN_NODE_MODULES, '@oai', 'artifact-tool', 'node_modules', 'skia-canvas'));
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const fonts = path.join(root, 'assets', 'fonts', 'Bell MT Bold.ttf');
const out = path.join(root, 'assets', 'months');
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

FontLibrary.use('Riqian Bell MT', fonts);
await fs.mkdir(out, { recursive: true });
for (const month of months) {
  // PSD: 72.55pt at 300dpi, then 71% horizontal scale. Four-times sampling
  // keeps the packed asset crisp on the 2403px source canvas.
  const canvas = new Canvas(460 * 4, 270 * 4);
  const ctx = canvas.getContext('2d');
  ctx.scale(4 * .71, 4);
  ctx.font = `bold ${72.55 * 300 / 72}px "Riqian Bell MT"`;
  ctx.fillStyle = '#1F1F1D';
  ctx.fillText(month, 0, 260);
  await fs.writeFile(path.join(out, `${month}.png`), canvas.toBufferSync('png'));
}

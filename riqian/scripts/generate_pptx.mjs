#!/usr/bin/env node
// Direct, editable PPTX generator. Run inside Codex with RIQIAN_NODE_MODULES set.
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.dirname(here);
if (!process.env.RIQIAN_NODE_MODULES) throw new Error('Set RIQIAN_NODE_MODULES to Codex bundled node_modules.');
const runtimeRequire = createRequire(path.join(process.env.RIQIAN_NODE_MODULES, 'riqian-runtime.cjs'));
const { Presentation, PresentationFile } = runtimeRequire('@oai/artifact-tool');
const JSZip = (await import(pathToFileURL(path.join(process.env.RIQIAN_NODE_MODULES, 'jszip', 'lib', 'index.js')).href)).default;
const [inputFile, outputArg] = process.argv.slice(2);
if (!inputFile) throw new Error('Usage: node generate_pptx.mjs <approved-copy.json> [output.pptx]');
const data = JSON.parse(await fs.readFile(inputFile, 'utf8'));
const required = name => { if (typeof data[name] !== 'string' || !data[name].trim()) throw new Error(`Missing ${name}`); return data[name].trim(); };
if (!Array.isArray(data.metadata) || data.metadata.length !== 3) throw new Error('metadata requires exactly three lines.');
if (!Array.isArray(data.quoteLines) || data.quoteLines.length < 2 || data.quoteLines.some(line => typeof line !== 'string' || [...line.trim()].length < 3 || /[。！？；，、]$/.test(line.trim()))) throw new Error('quoteLines require two or more semantic lines, without terminal punctuation.');
const month = required('month'), day = required('day');
if (!/^[A-Z][a-z]{2}$/.test(month) || !/^\d{1,2}$/.test(day)) throw new Error('month must be three English letters and day must be numeric.');
const output = outputArg ? path.resolve(outputArg) : path.resolve(path.dirname(inputFile), `${required('date')}-riqian.pptx`);
if (await fs.stat(output).then(() => true).catch(() => false)) throw new Error(`Refusing to overwrite ${output}`);

const canvas = { width: 768, height: 768 * 4918 / 2403 }; const map = n => n * canvas.width / 2403;
const bytes = async file => { const b = await fs.readFile(file); return b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength); };
function text(slide, name, value, x, y, width, height, font, size, bold = false, lineSpacing) {
  const box = slide.shapes.add({ geometry: 'textbox', name, position: { left: map(x), top: map(y), width: map(width), height: map(height) }, fill: 'none', line: { style: 'solid', fill: 'none', width: 0 } });
  box.text = [{ run: value, style: { typeface: font, fontSize: `${size}pt`, bold, color: '#1F1F1D' } }];
  box.text.style = { typeface: font, bold, color: '#1F1F1D', insets: 0, wrap: 'none', ...(lineSpacing ? { lineSpacing } : {}) };
}
async function enforceContract(file) {
  const zip = await JSZip.loadAsync(await fs.readFile(file)); const entry = zip.file('ppt/slides/slide1.xml'); if (!entry) throw new Error('Missing slide XML'); let xml = await entry.async('string');
  const edit = (name, fn) => { const marker = xml.indexOf(`name="${name}"`), start = xml.lastIndexOf('<p:sp>', marker), end = xml.indexOf('</p:sp>', marker); if (marker < 0 || start < 0 || end < 0) throw new Error(`Missing ${name}`); xml = xml.slice(0, start) + fn(xml.slice(start, end + 7)) + xml.slice(end + 7); };
  edit('metadata', block => block.replace(/<a:lnSpc>.*?<\/a:lnSpc>/, '<a:lnSpc><a:spcPts val="3439"/></a:lnSpc>'));
  edit('quote', block => block.replace(/<a:rPr(?![^>]*\bspc=)/g, '<a:rPr spc="72"'));
  edit('footer', block => block.replace(/<a:lnSpc>.*?<\/a:lnSpc>/, '<a:lnSpc><a:spcPts val="1800"/></a:lnSpc>').replace(/<a:rPr(?![^>]*\bspc=)/g, '<a:rPr spc="280"'));
  const scale = (name, factor, id) => { const marker = xml.indexOf(`name="${name}"`), start = xml.lastIndexOf('<p:sp>', marker), end = xml.indexOf('</p:sp>', marker), shape = xml.slice(start, end + 7), match = shape.match(/<a:xfrm[^>]*><a:off x="(\d+)" y="(\d+)"\s*\/><a:ext cx="(\d+)" cy="(\d+)"\s*\/>/); if (!match) throw new Error(`Missing ${name} transform`); const [, x, y, w, h] = match; const group = `<p:grpSp><p:nvGrpSpPr><p:cNvPr id="${id}" name="${name}-horizontal-scale"/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr><a:xfrm xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><a:off x="${x}" y="${y}"/><a:ext cx="${Math.round(Number(w) * factor)}" cy="${h}"/><a:chOff x="${x}" y="${y}"/><a:chExt cx="${w}" cy="${h}"/></a:xfrm></p:grpSpPr>${shape}</p:grpSp>`; xml = xml.slice(0, start) + group + xml.slice(end + 7); };
  scale('month', .71, 20); scale('day', .91669, 21); scale('metadata', 1.06509, 22); zip.file('ppt/slides/slide1.xml', xml); await fs.writeFile(file, await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' }));
}
const deck = Presentation.create({ slideSize: canvas }), slide = deck.slides.add();
const asset = (...parts) => path.join(root, 'assets', ...parts);
for (const [file, alt, x, y, width, height] of [['background.png', '背景', 0, 0, 2403, 4918], ['logo.png', '睿丛咨询标志', 1810, 112, 474, 153], ['qr-code.png', '二维码', 170, 3975, 391, 391]]) slide.images.add({ blob: await bytes(asset('brand', file)), contentType: 'image/png', alt, fit: file === 'background.png' ? 'cover' : 'contain', position: { left: map(x), top: map(y), width: map(width), height: map(height) } });
text(slide, 'month', month, 117.438, 75, 460, 270, 'Bell MT', 72.55, true); text(slide, 'separator', '/', 675, 125, 85, 160, '仿宋', 50.77); text(slide, 'day', day, 790, 125, 220, 160, '仿宋', 50.77);
text(slide, 'metadata', data.metadata.join('\n'), 117.438, 545, 900, 500, '微软雅黑 Light', 19.1, false, 34.39 / 19.1); text(slide, 'quote', data.quoteLines.join('\n'), 117.438, 1715, 2182.062, 700, '微软雅黑 Light', 36);
for (const [name, y, width] of [['source', 2550, 1800], ['author', 2685, 800], ['identity', 2820, 1800], ['lifetime', 2955, 1800]]) text(slide, name, required(name), 117.438, y, width, 80, '微软雅黑 Light', 19.1);
text(slide, 'footer', '助力行业先锋\n实现品牌进化', 170, 4450, 720, 220, '微软雅黑 Light', 14, false, 18 / 14);
await fs.mkdir(path.dirname(output), { recursive: true });
const pptx = await PresentationFile.exportPptx(deck); await pptx.save(output);
await enforceContract(output);
const python = process.env.RIQIAN_PYTHON ?? (process.platform === 'win32' ? 'python' : 'python3');
await promisify(execFile)(python, [path.join(here, 'verify_pptx_contract.py'), output]);
console.log(output);

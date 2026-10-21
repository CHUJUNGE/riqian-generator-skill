#!/usr/bin/env node
// Populate the approved v23 PowerPoint template. The template—not a rebuilt
// approximation—is the production baseline for every daily sign.
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.dirname(here);
if (!process.env.RIQIAN_NODE_MODULES) throw new Error('Set RIQIAN_NODE_MODULES to Codex bundled node_modules.');
const JSZip = (await import(pathToFileURL(path.join(process.env.RIQIAN_NODE_MODULES, 'jszip', 'lib', 'index.js')).href)).default;
const [inputFile, outputArg] = process.argv.slice(2);
if (!inputFile) throw new Error('Usage: node generate_pptx.mjs <approved-copy.json> [output.pptx]');

const data = JSON.parse(await fs.readFile(inputFile, 'utf8'));
const required = name => {
  if (typeof data[name] !== 'string' || !data[name].trim()) throw new Error(`Missing ${name}`);
  return data[name].trim();
};
const month = required('month');
const day = required('day');
if (!/^[A-Z][a-z]{2}$/.test(month) || !/^\d{1,2}$/.test(day)) throw new Error('month must be a three-letter English month and day must be numeric.');
if (!Array.isArray(data.metadata) || data.metadata.length !== 3 || data.metadata.some(value => typeof value !== 'string' || !value.trim())) throw new Error('metadata requires exactly three non-empty lines.');
if (!Array.isArray(data.quoteLines) || data.quoteLines.length < 2 || data.quoteLines.some(line => typeof line !== 'string' || [...line.trim()].length < 3 || /[。！？；，、]$/.test(line.trim()))) throw new Error('quoteLines require two or more semantic lines, without terminal punctuation.');
const output = outputArg ? path.resolve(outputArg) : path.resolve(path.dirname(inputFile), `${required('date')}-riqian.pptx`);
if (await fs.stat(output).then(() => true).catch(() => false)) throw new Error(`Refusing to overwrite ${output}`);

const xmlEscape = value => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
function shapeRange(xml, name) {
  const marker = xml.indexOf(`name="${name}"`);
  const start = xml.lastIndexOf('<p:sp>', marker);
  const end = xml.indexOf('</p:sp>', marker);
  if (marker < 0 || start < 0 || end < 0) throw new Error(`Template is missing editable shape ${name}`);
  return [start, end + 7];
}
function replaceText(xml, name, lines) {
  const [start, end] = shapeRange(xml, name);
  const shape = xml.slice(start, end);
  const bodyStart = shape.indexOf('<p:txBody>');
  const bodyEnd = shape.indexOf('</p:txBody>');
  if (bodyStart < 0 || bodyEnd < 0) throw new Error(`Template ${name} has no editable text body`);

  // Text placeholders in the master can contain several runs. Replacing only
  // the first <a:t> leaves the remaining sample copy in the exported slide.
  // Preserve the first paragraph's paragraph and run properties, but rebuild
  // every paragraph so each approved line has exactly one text run.
  const body = shape.slice(bodyStart, bodyEnd);
  const firstParagraphMatch = /<a:p(?:\s[^>]*)?>[\s\S]*?<\/a:p>/.exec(body);
  if (!firstParagraphMatch) throw new Error(`Template ${name} has no editable paragraph`);
  const paragraph = firstParagraphMatch[0];
  const paragraphTag = /^<a:p(?:\s[^>]*)?>/.exec(paragraph)?.[0];
  const paragraphProperties = /<a:pPr(?:\s[^>]*)?(?:\/>|>[\s\S]*?<\/a:pPr>)/.exec(paragraph)?.[0] ?? '';
  const runProperties = /<a:rPr(?:\s[^>]*)?(?:\/>|>[\s\S]*?<\/a:rPr>)/.exec(paragraph)?.[0] ?? '';
  if (!paragraphTag || !runProperties) throw new Error(`Template ${name} has no editable run formatting`);

  const bodyPrefix = shape.slice(bodyStart, bodyStart + firstParagraphMatch.index);
  const replacementParagraphs = lines.map(line => `${paragraphTag}${paragraphProperties}<a:r>${runProperties}<a:t>${xmlEscape(line)}</a:t></a:r></a:p>`).join('');
  const rebuilt = `${bodyPrefix}${replacementParagraphs}</p:txBody>`;
  return xml.slice(0, start) + shape.slice(0, bodyStart) + rebuilt + shape.slice(bodyEnd + 11) + xml.slice(end);
}
function moveShape(xml, name, sourceX, sourceY) {
  const [start, end] = shapeRange(xml, name);
  const shape = xml.slice(start, end);
  const emuPerSourcePixel = 7315200 / 2403;
  if (!/<a:off x="\d+" y="\d+"\s*\/>/.test(shape)) throw new Error(`Template ${name} has no position transform`);
  const moved = shape.replace(/<a:off x="\d+" y="\d+"\s*\/>/, `<a:off x="${Math.round(sourceX * emuPerSourcePixel)}" y="${Math.round(sourceY * emuPerSourcePixel)}" />`);
  return xml.slice(0, start) + moved + xml.slice(end);
}

const template = path.join(root, 'assets', 'riqian-production-template-v23.pptx');
const monthAsset = path.join(root, 'assets', 'months', `${month}.png`);
await fs.access(monthAsset);
const zip = await JSZip.loadAsync(await fs.readFile(template));
let slideXml = await zip.file('ppt/slides/slide1.xml').async('string');
slideXml = replaceText(slideXml, 'day', [day]);
slideXml = replaceText(slideXml, 'metadata', data.metadata.map(value => value.trim()));
slideXml = replaceText(slideXml, 'quote', data.quoteLines.map(value => value.trim()));
for (const name of ['source', 'author', 'identity', 'lifetime']) slideXml = replaceText(slideXml, name, [required(name)]);

// The fixed October master establishes a 63.796px optical gap from the end of
// the month outline to `/`, then an 82px `/`-to-day offset. Month outlines
// have different widths, so the two text shapes move as one header unit.
const monthWidths = { Jan: 315.545, Feb: 336.824, Mar: 391.210, Apr: 349.292, May: 403.159, Jun: 327.708, Jul: 276.353, Aug: 380.312, Sep: 332.422, Oct: 348.766, Nov: 383.876, Dec: 373.290 };
const separatorX = 117.438 + monthWidths[month] + 63.796;
slideXml = moveShape(slideXml, 'separator', separatorX, 226);
slideXml = moveShape(slideXml, 'day', separatorX + 82, 119);

// The v23 template contains an Oct SVG plus a 1px fallback. Swap the fallback
// for a bundled 4× month PNG and remove the SVG hint. The header x/y/extent
// remains exactly that of the approved template on every platform.
const svgHint = /<a:extLst><a:ext uri="\{96DAC541-7B7A-43D3-8B79-37D633B846F1\}"><asvg:svgBlip[^>]*\/><\/a:ext><\/a:extLst>/;
if (!svgHint.test(slideXml)) throw new Error('Template month SVG hint is missing');
slideXml = slideXml.replace(svgHint, '');
let relations = await zip.file('ppt/slides/_rels/slide1.xml.rels').async('string');
relations = relations.replace('Target="/ppt/media/image4.png"', 'Target="../media/month.png"');
if (!relations.includes('../media/month.png')) throw new Error('Template month fallback relationship is missing');
zip.file('ppt/slides/slide1.xml', slideXml);
zip.file('ppt/slides/_rels/slide1.xml.rels', relations);
zip.file('ppt/media/month.png', await fs.readFile(monthAsset));

await fs.mkdir(path.dirname(output), { recursive: true });
await fs.writeFile(output, await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' }));
const python = process.env.RIQIAN_PYTHON ?? (process.platform === 'win32' ? 'python' : 'python3');
await promisify(execFile)(python, [path.join(here, 'verify_pptx_contract.py'), output]);
console.log(output);


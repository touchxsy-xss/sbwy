import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import { load } from 'cheerio';
import { pages } from '../src/routes.js';

await fs.mkdir('public/assets', { recursive: true });
const manifest = JSON.parse(await fs.readFile('public/assets/manifest.json', 'utf8').catch(() => '{}'));
const urls = new Set();
for (const page of pages) {
  const $ = load(await fs.readFile(page.file, 'utf8'));
  $('img[src]').each((_, el) => urls.add($(el).attr('src')));
  $('[style]').each((_, el) => {
    for (const match of $(el).attr('style').matchAll(/url\(['"]?(https[^'")]+)['"]?\)/g)) urls.add(match[1]);
  });
}
async function download(url, extension = '.jpg') {
  if (manifest[url]) return manifest[url];
  const response = await fetch(url, { signal: AbortSignal.timeout(30000) });
  if (!response.ok) throw new Error(`${response.status}: ${url}`);
  const file = `/assets/${crypto.createHash('sha256').update(url).digest('hex').slice(0, 20)}${extension}`;
  await fs.writeFile(`public${file}`, Buffer.from(await response.arrayBuffer()));
  manifest[url] = file;
  return file;
}
for (const url of urls) {
  try { await download(url); console.log(`Asset ${Object.keys(manifest).length}/${urls.size}`); }
  catch (error) { console.error(error.message); }
}
const fonts = [
  'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap',
  'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200'
];
let fontCss = '';
for (const url of fonts) {
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 Chrome/120.0.0.0 Safari/537.36' } });
  if (!res.ok) throw new Error('Font stylesheet download failed');
  let css = await res.text();
  for (const match of css.matchAll(/url\((https[^)]+)\)/g)) {
    const local = await download(match[1], '.woff2');
    css = css.replaceAll(match[1], local);
  }
  // Google serves WOFF2 files. Preserve the correct format hint so Safari
  // accepts the localized Material Symbols font instead of rendering ligatures as text.
  css = css.replaceAll("format('truetype')", "format('woff2')");
  fontCss += css + '\n';
}
await fs.writeFile('public/assets/fonts.css', fontCss);
await fs.writeFile('public/assets/manifest.json', JSON.stringify(manifest, null, 2));
const missing = [...urls].filter(url => !manifest[url]);
console.log(`Localized ${urls.size - missing.length}/${urls.size} image assets.`);
if (missing.length) process.exitCode = 1;

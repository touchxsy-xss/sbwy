import fs from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import { load } from 'cheerio';
import postcss from 'postcss';
import tailwind from 'tailwindcss';
import { build } from 'esbuild';
import { pages, navRoutes } from '../src/routes.js';

const root = path.resolve(import.meta.dirname, '..');
process.chdir(root);
const buildVersion = Date.now().toString(36);
await fs.mkdir('dist/pages', { recursive: true });
await fs.mkdir('docs', { recursive: true });
const assetMap = JSON.parse(await fs.readFile('public/assets/manifest.json', 'utf8').catch(() => '{}'));
const audit = [];
const sourceData = {};
for (const page of pages) {
  const source = await fs.readFile(page.file, 'utf8');
  const $ = load(source);
  const sandbox = { tailwind: {} };
  vm.runInNewContext($('#tailwind-config').text(), sandbox);
  const config = JSON.parse(JSON.stringify(sandbox.tailwind.config));
  config.content = [{ raw: source, extension: 'html' }, './src/**/*.js'];
  config.theme.extend.spacing['spacing-card'] = '18px';
  config.theme.extend.spacing['spacing-card-padding'] = '18px';
  config.theme.extend.spacing['13'] = '52px';
  const css = await postcss([tailwind(config)]).process('@tailwind base;@tailwind components;@tailwind utilities;\n' + $('style').map((_, el) => $(el).text()).get().join('\n'), { from: undefined });
  await fs.writeFile(`dist/pages/${page.key}.css`, css.css);
  audit.push({
    ...page,
    controls: $('button,a,input,textarea,select,[onclick],[role="button"],.cursor-pointer').map((i, el) => ({
      index: i, tag: el.tagName, id: $(el).attr('id') || '', text: $(el).text().replace(/\s+/g, ' ').trim().slice(0, 180),
      placeholder: $(el).attr('placeholder'), href: $(el).attr('href'), originalHandler: $(el).attr('onclick')
    })).get()
  });
  sourceData[page.key] = {
    expenses: $('.expense-row').map((_, el) => ({ ...el.attribs })).get(),
    textareas: $('textarea').map((_, el) => $(el).text()).get(),
    images: $('img').map((_, el) => ({ src: assetMap[$(el).attr('src')] || $(el).attr('src'), alt: $(el).attr('data-alt') || '' })).get(),
    backgroundImages: $('[style*="url("]').map((_, el) => $(el).attr('style')).get(),
    tables: $('tbody').map((_, el) => ({ rows: $(el).find('tr').map((_, row) => $(row).find('td').map((_, td) => $(td).text().replace(/\s+/g, ' ').trim()).get()).get() })).get()
  };
  $('script,style,link[rel="stylesheet"],link[rel="preconnect"]').remove();
  $('.material-symbols-outlined').each((_, el) => {
    if ($(el).text().trim() === 'send_spark') $(el).text('send');
  });
  $('*').each((_, el) => {
    for (const attr of Object.keys(el.attribs || {})) {
      if (attr.startsWith('on')) {
        $(el).attr(`data-original-${attr}`, el.attribs[attr]);
        $(el).removeAttr(attr);
      }
    }
  });
  $('a[data-path]').each((_, el) => $(el).attr('href', navRoutes[$(el).attr('data-path')] || page.path));
  // Original exports remain untouched; generated pages use local, versioned assets.
  $('img').each((_, el) => {
    const img = $(el);
    img.attr('alt', img.attr('alt') || img.attr('data-alt') || '社区现场图片');
    if (assetMap[img.attr('src')]) img.attr('src', assetMap[img.attr('src')]);
    img.attr('decoding', 'async');
  });
  $('[style]').each((_, el) => {
    let style = $(el).attr('style');
    for (const [url, local] of Object.entries(assetMap)) style = style.split(url).join(local);
    $(el).attr('style', style);
  });
  $('html').attr('data-page', page.key).attr('data-group', page.group);
  const pageCss = `/pages/${page.key}.css?v=${buildVersion}`;
  const fontCss = `/assets/fonts.css?v=${buildVersion}`;
  $('head').append(`<title>${page.name} | 声边物业</title><link rel="icon" href="data:,"><link rel="preload" href="${fontCss}" as="style"><link rel="preload" href="${pageCss}" as="style"><link rel="stylesheet" href="${fontCss}"><link rel="stylesheet" href="${pageCss}"><link rel="stylesheet" href="/app.css?v=${buildVersion}"><script src="/api-config.js"></script><script type="module" src="/app.js?v=${buildVersion}"></script>`);
  $('meta[name=viewport]').attr('content', 'width=device-width, initial-scale=1, viewport-fit=cover');
  await fs.writeFile(`dist/pages/${page.key}.html`, $.html());
}
await fs.writeFile('src/data/source.json', JSON.stringify(sourceData, null, 2));
await fs.writeFile('docs/interaction-inventory.json', JSON.stringify(audit, null, 2));
await build({ entryPoints: ['src/app.js'], bundle: true, format: 'esm', outfile: 'dist/app.js', sourcemap: true });
await fs.copyFile('src/app.css', 'dist/app.css');
await fs.cp('public', 'dist', { recursive: true });
console.log(`Built ${pages.length} original page templates; Web: 10, Mobile: 11.`);

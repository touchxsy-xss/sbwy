import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { pages, matchRoute } from '../src/routes.js';

const root = path.resolve(import.meta.dirname, '../dist');
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.woff2': 'font/woff2', '.mp3': 'audio/mpeg', '.wav': 'audio/wav' };
const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    const pathname = decodeURIComponent(url.pathname).replace(/\/$/, '') || '/';
    if (pathname === '/web/media/weekly') {
      res.writeHead(302, { Location: '/web/media' + url.search }); res.end(); return;
    }
    const alias = pages.find(p => `/${p.file}` === pathname);
    if (alias || ['/', '/web', '/mobile', '/小程序', '/worker'].includes(pathname)) {
      const target = alias?.path || (pathname === '/worker' ? '/worker/tasks' : pathname === '/mobile' || pathname === '/小程序' ? '/mobile/home' : '/web/overview');
      res.writeHead(302, { Location: target + url.search }); res.end(); return;
    }
    const page = matchRoute(pathname);
    const file = page ? path.join(root, `pages/${page.key}.html`) : path.resolve(root, `.${pathname}`);
    if (!file.startsWith(root + path.sep)) { res.writeHead(403); res.end(); return; }
    const data = await fs.readFile(file);
    res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
    res.end(data);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end('<!doctype html><html lang="zh-CN"><title>页面不存在</title><body><h1>页面不存在</h1><p>该链接可能已失效。</p><a href="/web/overview">返回工作台</a> · <a href="/mobile/home">返回居民首页</a></body></html>');
  }
});
let port = Number(process.env.PORT || 5173);
server.on('error', error => {
  if (error.code === 'EADDRINUSE') { port++; server.listen(port, '0.0.0.0'); }
  else throw error;
});
server.listen(port, '0.0.0.0', () => console.log(`Shengbian Demo: http://localhost:${port}/web/overview\nResident: http://localhost:${port}/mobile/home\nWorker: http://localhost:${port}/worker/tasks`));

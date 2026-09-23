#!/usr/bin/env node
// Runner de pruebas de Beat. Sin framework: servidor estático propio + Playwright.
//
//   npm test                 todas
//   npm test -- material     solo las que llevan "material" en el nombre del fichero
//   HEADED=1 npm test        con navegador visible, para mirar qué pasa
//   CHROMIUM=/ruta npm test  usa ese binario en vez del que trae Playwright
//
// Cada fichero tests/*.test.mjs exporta `nombre` y `run(t)`. Se le da a cada uno un
// contexto de navegador limpio (IndexedDB vacía), y el runner falla el test por su
// cuenta si la página lanza un error de JS o pide un recurso que devuelve 4xx/5xx:
// esas dos cosas no hay que comprobarlas a mano en cada prueba.

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { chromium } from 'playwright';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const RAIZ = path.resolve(AQUI, '..');

const TIPOS = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.woff2': 'font/woff2', '.md': 'text/markdown; charset=utf-8',
};

function servir() {
  const srv = http.createServer((req, res) => {
    const rel = decodeURIComponent(req.url.split('?')[0]).replace(/^\/+/, '') || 'index.html';
    const f = path.join(RAIZ, rel);
    // nada fuera de la raíz del repo
    if (!f.startsWith(RAIZ) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) {
      res.writeHead(404, { 'content-type': 'text/plain' }); return res.end('404');
    }
    res.writeHead(200, { 'content-type': TIPOS[path.extname(f)] || 'application/octet-stream', 'cache-control': 'no-store' });
    fs.createReadStream(f).pipe(res);
  });
  return new Promise((r) => srv.listen(0, '127.0.0.1', () => r({ srv, puerto: srv.address().port })));
}

const filtro = process.argv.slice(2).filter((a) => !a.startsWith('-'));
const ficheros = fs.readdirSync(AQUI).filter((f) => f.endsWith('.test.mjs')).sort()
  .filter((f) => !filtro.length || filtro.some((q) => f.includes(q)));

if (!ficheros.length) { console.error('Ningún test coincide con', filtro.join(' ')); process.exit(1); }

const { srv, puerto } = await servir();
const base = `http://127.0.0.1:${puerto}`;
const navegador = await chromium.launch({
  headless: !process.env.HEADED,
  ...(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {}),
});

let pasan = 0; const fallan = [];
const t0 = Date.now();

for (const f of ficheros) {
  const mod = await import(pathToFileURL(path.join(AQUI, f)).href);
  const nombre = mod.nombre || f;
  const ctx = await navegador.newContext({ viewport: { width: 390, height: 844 }, timezoneId: 'Europe/Madrid', ...(mod.contexto || {}) });
  const page = await ctx.newPage();
  const sucios = [];
  page.on('pageerror', (e) => sucios.push('error de JS: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error') sucios.push('console.error: ' + m.text()); });
  page.on('response', (r) => { if (r.status() >= 400) sucios.push(r.status() + ' ' + r.url().replace(base, '')); });

  const abrir = async (ruta = '/index.html') => {
    await page.goto(base + ruta);
    await page.waitForFunction(() => typeof PACK !== 'undefined' && PACK !== null, null, { timeout: 10000 });
    await page.waitForTimeout(120);
  };

  process.stdout.write(`  ${nombre} … `);
  try {
    await mod.run({ page, ctx, navegador, base, raiz: RAIZ, abrir });
    if (sucios.length) throw new Error('la página ensució la consola:\n      ' + [...new Set(sucios)].join('\n      '));
    console.log('ok');
    pasan++;
  } catch (e) {
    console.log('FALLA');
    fallan.push({ nombre, error: e });
  }
  await ctx.close();
}

await navegador.close();
srv.close();

const seg = ((Date.now() - t0) / 1000).toFixed(1);
console.log(`\n${pasan}/${ficheros.length} pasan · ${seg}s`);
for (const f of fallan) {
  console.error(`\n── ${f.nombre}\n${f.error.message}`);
  if (f.error.stack) console.error(f.error.stack.split('\n').slice(1, 4).join('\n'));
}
process.exit(fallan.length ? 1 : 0);

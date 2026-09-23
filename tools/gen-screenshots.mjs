#!/usr/bin/env node
// Capturas para la ficha de instalación de la PWA (Android las enseña si el manifest
// las declara). Se sacan de la app real, así que no se quedan obsoletas: se regeneran.
//
//   npm run screenshots
//
// No entran en el precache del service worker a propósito: sólo hacen falta al instalar,
// y meterlas engordaría lo que se guarda para usar sin conexión.

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(RAIZ, 'screenshots');
const ANCHO = 412, ALTO = 915; // tamaño de móvil Android típico

const TIPOS = { '.html': 'text/html; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.woff2': 'font/woff2', '.js': 'text/javascript' };

const srv = http.createServer((req, res) => {
  const rel = decodeURIComponent(req.url.split('?')[0]).replace(/^\/+/, '') || 'index.html';
  const f = path.join(RAIZ, rel);
  if (!f.startsWith(RAIZ) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'content-type': TIPOS[path.extname(f)] || 'application/octet-stream' });
  fs.createReadStream(f).pipe(res);
});
await new Promise((r) => srv.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${srv.address().port}`;

fs.mkdirSync(OUT, { recursive: true });
const navegador = await chromium.launch({ ...(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {}) });
const ctx = await navegador.newContext({ viewport: { width: ANCHO, height: ALTO }, deviceScaleFactor: 1, timezoneId: 'Europe/Madrid' });
const page = await ctx.newPage();
await page.goto(base + '/index.html');
await page.waitForFunction(() => typeof PACK !== 'undefined' && PACK !== null);
await page.waitForTimeout(300);

// Historial de ejemplo para que Stats no salga vacío
await page.evaluate(async () => {
  const dias = [0, 1, 3, 5, 8, 12, 17, 22];
  const musc = [['gluteo', 'cuadriceps', 'femoral', 'core'], ['espalda', 'biceps', 'hombro'],
    ['gluteo', 'core', 'espalda'], ['gluteo', 'cuadriceps', 'aductor'], ['espalda', 'triceps', 'hombro'],
    ['gluteo', 'core', 'cuadriceps'], ['gluteo', 'femoral', 'core'], ['espalda', 'biceps']];
  for (let i = 0; i < dias.length; i++) {
    const d = todayStart(); d.setDate(d.getDate() - dias[i]); d.setHours(8, 30);
    const e = { ts: d.getTime(), date: localDate(d), dow: d.getDay(), time: '08:30',
      durSec: 1320 + i * 60, workSec: 800 + i * 40, intervals: 12,
      packId: PACK.pack.id, packName: PACK.pack.name, workoutId: PACK.workouts[i % 3].id,
      workoutName: PACK.workouts[i % 3].name, category: 'fuerza', counts_as: 'training',
      exercises: [], muscles: musc[i], reps: [] };
    await logAdd(e); LOG.push(e);
  }
  updSummary();
});

const capturas = [
  ['1-portada', async () => { await page.click('#backbtn').catch(() => {}); }],
  ['2-entreno', async () => {
    await page.click('#go');
    await page.evaluate(() => { idx = seq.findIndex((s, i) => s.type === 'rest' && seq[i + 1] && seq[i + 1].ref); startPhase(); });
    await page.waitForTimeout(400);
  }],
  ['3-stats', async () => {
    await page.click('#quit');
    await page.click('#openstats');
    await page.waitForTimeout(300);
  }],
];

for (const [nombre, preparar] of capturas) {
  await preparar();
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(OUT, nombre + '.png') });
  console.log(`  ${nombre}.png`);
}

await navegador.close();
srv.close();

const total = fs.readdirSync(OUT).filter((f) => f.endsWith('.png'))
  .reduce((a, f) => a + fs.statSync(path.join(OUT, f)).size, 0);
console.log(`${capturas.length} capturas · ${ANCHO}x${ALTO} · ${(total / 1024).toFixed(0)} KB`);
console.log('Recuerda declararlas en manifest.webmanifest si añades o quitas alguna.');

#!/usr/bin/env node
// Beat — build. Sin dependencias: node build.mjs
//
// Hace tres cosas, todas idempotentes:
//   1. Inyecta beat-basico.json dentro de index.html (una sola fuente de verdad).
//   2. Regenera la lista de assets del service worker y su version de cache,
//      derivada del hash del contenido -> se acabo el bump manual de beat-vN.
//   3. Regenera CREDITS.md con las licencias de fuentes y de media declarada en el pack.
//
// Con --check no escribe nada y sale con codigo 1 si algo esta desincronizado
// (util para CI o un hook de pre-commit).

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const ROOT = path.dirname(new URL(import.meta.url).pathname);
const CHECK = process.argv.includes('--check');
const r = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const exists = (f) => fs.existsSync(path.join(ROOT, f));

let changed = [];
function write(file, next) {
  const prev = exists(file) ? r(file) : null;
  if (prev === next) return;
  changed.push(file);
  if (!CHECK) fs.writeFileSync(path.join(ROOT, file), next);
}

/* ---------- 1. pack embebido ---------- */
const packRaw = r('beat-basico.json');
const pack = JSON.parse(packRaw); // revienta aqui si el JSON esta roto
let html = r('index.html');

const PACK_RE = /(\/\* === PACK:START[^\n]*\n)[\s\S]*?(\/\* === PACK:END === \*\/\n)/;
if (!PACK_RE.test(html)) throw new Error('index.html: faltan los marcadores PACK:START/PACK:END');
html = html.replace(PACK_RE, (_m, start, end) =>
  start + 'const DEFAULT_PACK = ' + JSON.stringify(pack) + ';\n' + end);

/* ---------- 2. service worker: assets + version por hash ---------- */
const media = exists('media')
  ? fs.readdirSync(path.join(ROOT, 'media')).filter((f) => /\.(svg|webp|png|jpg)$/i.test(f)).sort()
  : [];
const fonts = exists('fonts')
  ? fs.readdirSync(path.join(ROOT, 'fonts')).filter((f) => f.endsWith('.woff2')).sort()
  : [];

const assets = [
  './', './index.html', './manifest.webmanifest',
  './icon-192.png', './icon-512.png', './icon-maskable.png',
  ...fonts.map((f) => './fonts/' + f),
  ...media.map((f) => './media/' + f),
];

// La version sale del contenido real que se sirve: si nada cambia, la version no se
// mueve y el navegador no reinstala; si cambia cualquier byte, la cache se invalida sola.
const hash = crypto.createHash('sha256');
hash.update(html); // el index.html YA regenerado, no el que sigue en disco
for (const a of assets) {
  const f = a.replace(/^\.\//, '');
  if (f === 'index.html') continue; // ya contabilizado arriba; leerlo de disco romperia la convergencia
  if (f && exists(f) && fs.statSync(path.join(ROOT, f)).isFile()) {
    hash.update(f);
    hash.update(fs.readFileSync(path.join(ROOT, f)));
  }
}
const version = 'beat-' + hash.digest('hex').slice(0, 10);

let sw = r('sw.js');
const SW_RE = /(\/\* === ASSETS:START[^\n]*\n)[\s\S]*?(\/\* === ASSETS:END === \*\/\n)/;
if (!SW_RE.test(sw)) throw new Error('sw.js: faltan los marcadores ASSETS:START/ASSETS:END');
sw = sw.replace(SW_RE, (_m, start, end) =>
  start +
  "const CACHE = '" + version + "';\n" +
  'const ASSETS = [\n' + assets.map((a) => "  '" + a + "'").join(',\n') + '\n];\n' +
  end);

/* ---------- 3. CREDITS.md ---------- */
const fontCredits = [
  ['Archivo Black', 'Omnibus-Type', 'SIL Open Font License 1.1', 'https://fonts.google.com/specimen/Archivo+Black'],
  ['Spline Sans Mono', 'Eben Sorkin, Mirko Velimirovic', 'SIL Open Font License 1.1', 'https://fonts.google.com/specimen/Spline+Sans+Mono'],
  ['Fraunces', 'Undercase Type', 'SIL Open Font License 1.1', 'https://fonts.google.com/specimen/Fraunces'],
];

// Atribucion de imagenes: se lee de exercises[].media.credit en el pack, para que
// cada asset arrastre su licencia y este fichero no haya que mantenerlo a mano.
const mediaCredits = [];
for (const [id, e] of Object.entries(pack.exercises || {})) {
  const c = e.media && e.media.credit;
  if (c) mediaCredits.push({ id, name: e.name || id, ...c });
}

const credits = [
  '# Créditos',
  '',
  '> Generado por `build.mjs`. No editar a mano.',
  '',
  '## Fuentes',
  '',
  '| Fuente | Autoría | Licencia |',
  '| --- | --- | --- |',
  ...fontCredits.map(([n, a, l, u]) => `| [${n}](${u}) | ${a} | ${l} |`),
  '',
  'Los `.woff2` de `fonts/` son el subconjunto latin servido por Google Fonts, guardado en el repo',
  'para que la app funcione sin conexión y sin pedir nada a terceros.',
  '',
  '## Imágenes de ejercicios',
  '',
];
if (mediaCredits.length) {
  credits.push('| Ejercicio | Autoría | Licencia | Origen |', '| --- | --- | --- | --- |');
  for (const m of mediaCredits) {
    credits.push(`| ${m.name} | ${m.author || '—'} | ${m.license || '—'} | ${m.source ? `[enlace](${m.source})` : '—'} |`);
  }
} else {
  credits.push('Todavía no hay imágenes con atribución declarada en el pack.', '',
    'Cada ejercicio puede declararla en `media.credit` (`author`, `license`, `source`) y este',
    'fichero se regenera solo. Ver `SCHEMA.md`.');
}
credits.push('', '## Código', '', 'Beat es [MIT](LICENSE).', '');

write('index.html', html);
write('sw.js', sw);
write('CREDITS.md', credits.join('\n'));

/* ---------- informe ---------- */
const kb = (n) => (n / 1024).toFixed(1) + ' KB';
const shellBytes = assets.reduce((a, x) => {
  const f = x.replace(/^\.\//, '');
  return a + (f && exists(f) && fs.statSync(path.join(ROOT, f)).isFile() ? fs.statSync(path.join(ROOT, f)).size : 0);
}, 0);

if (CHECK) {
  if (changed.length) {
    console.error('Desincronizado. Ejecuta `node build.mjs`:\n  ' + changed.join('\n  '));
    process.exit(1);
  }
  console.log('Todo al día.');
} else {
  console.log(`pack       ${pack.workouts.length} entrenamientos, ${Object.keys(pack.exercises).length} ejercicios`);
  console.log(`assets     ${assets.length} ficheros (${fonts.length} fuentes, ${media.length} media) — ${kb(shellBytes)}`);
  console.log(`cache      ${version}`);
  console.log(changed.length ? 'escrito:   ' + changed.join(', ') : 'sin cambios');
}

#!/usr/bin/env node
// Genera media/<id>-1.svg y media/<id>-2.svg a partir de las poses.
//   node tools/gen-media.mjs            escribe los SVG
//   node tools/gen-media.mjs --sheet    además, una hoja de contactos para revisarlas
//   node tools/gen-media.mjs --pack     además, declara media en beat-basico.json
//   node tools/gen-media.mjs --catalogo además, el catálogo de ilustraciones disponibles

import fs from 'node:fs';
import path from 'node:path';
import { figure, figureSolid, svg, fitPair, groundFor } from './rig.mjs';

// Estilo de dibujo. 'silueta' = formas rellenas de grosor variable (pictograma);
// 'trazo' = línea de grosor constante. Se puede comparar con tools/compare.mjs.
const ESTILO = process.argv.includes('--trazo') ? figure : figureSolid;
import { POSES } from './poses.mjs';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const OUT = path.join(ROOT, 'media');
fs.mkdirSync(OUT, { recursive: true });

const ids = Object.keys(POSES);
let written = 0;
for (const id of ids) {
  const { alt, frames, ground } = POSES[id];
  const tf = fitPair(frames); // mismo encuadre para los dos: el fundido no debe dar saltos
  const g = ground === false ? '' : groundFor(frames);
  frames.forEach((pose, i) => {
    const p2 = g ? { ...pose, behind: g + (pose.behind || '') } : pose;
    const label = frames.length > 1 ? `${alt} (${i + 1} de ${frames.length})` : alt;
    const body = svg(ESTILO(p2, tf), label);
    const file = path.join(OUT, `${id}-${i + 1}.svg`);
    const prev = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : null;
    if (prev !== body) { fs.writeFileSync(file, body); written++; }
  });
}
const nFrames = ids.reduce((a, id) => a + POSES[id].frames.length, 0);
console.log(`${ids.length} ejercicios · ${nFrames} fotogramas · ${written} ficheros escritos`);

/* ---------- hoja de contactos: para MIRARLAS, que es la única forma de validarlas ---------- */
if (process.argv.includes('--sheet')) {
  const cards = ids.map((id) => {
    const cells = POSES[id].frames
      .map((_, i) => `<div>${fs.readFileSync(path.join(OUT, `${id}-${i + 1}.svg`), 'utf8')}</div>`)
      .join('');
    const one = POSES[id].frames.length === 1 ? ' one' : '';
    return `<figure><div class="pair${one}">${cells}</div><figcaption>${id}</figcaption></figure>`;
  }).join('\n');
  fs.writeFileSync(path.join(ROOT, 'tools', 'sheet.html'), `<!DOCTYPE html><meta charset="utf-8">
<style>
 body{background:#0d0e0c;color:#8a8a72;font:12px ui-monospace,monospace;margin:0;padding:16px}
 .grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
 figure{margin:0;background:#16180f;border:1.5px solid #2a2c1f;border-radius:12px;padding:8px}
 .pair{display:grid;grid-template-columns:1fr 1fr;gap:4px}
 .pair.one{grid-template-columns:1fr;max-width:50%;margin:0 auto}
 .pair>div{background:#0d0e0c;border-radius:8px}
 svg{width:100%;height:auto;display:block}
 figcaption{margin-top:6px;text-align:center;color:#ff3d7f;font-size:11px}
</style>
<div class="grid">${cards}</div>
`);
  console.log('hoja de contactos -> tools/sheet.html');
}

/* ---------- declarar la media en el pack ---------- */
if (process.argv.includes('--pack')) {
  const pf = path.join(ROOT, 'beat-basico.json');
  const pack = JSON.parse(fs.readFileSync(pf, 'utf8'));
  let n = 0, missing = [];
  for (const id of ids) {
    const e = pack.exercises[id];
    if (!e) { missing.push(id); continue; }
    e.media = {
      // Tantos fotogramas como poses tenga: los isométricos solo tienen uno y
      // declarar un segundo inexistente apagaría la ilustración en el fundido.
      frames: POSES[id].frames.map((_, i) => `media/${id}-${i + 1}.svg`),
      alt: POSES[id].alt,
      credit: { author: 'Beat (ilustraciones propias)', license: 'CC BY-SA 4.0', source: 'tools/poses.mjs' },
    };
    n++;
  }
  fs.writeFileSync(pf, JSON.stringify(pack, null, 1) + '\n');
  console.log(`media declarada en ${n} ejercicios del pack`);
  if (missing.length) console.log('  ids que NO existen en el pack:', missing.join(', '));
  const sin = Object.keys(pack.exercises).filter((k) => !pack.exercises[k].media);
  if (sin.length) console.log(`  sin ilustración todavía (${sin.length}):`, sin.join(', '));
}

/* ---------- catálogo de ilustraciones disponibles ----------
   Los entrenamientos los genera un agente, no se editan en la app. Para que pueda
   REUTILIZAR los dibujos que ya existen en vez de dejar ejercicios sin ilustración,
   necesita saber cuáles hay y con qué rutas exactas. Eso es este catálogo: se genera
   aquí, así que no puede quedarse desfasado respecto a media/.

   Un ejercicio de OTRO pack puede llamarse como quiera y apuntar a estas mismas rutas:
   la ilustración se reutiliza por su ruta, no por el id del ejercicio. */
if (process.argv.includes('--catalogo')) {
  const pf = path.join(ROOT, 'beat-basico.json');
  const pack = JSON.parse(fs.readFileSync(pf, 'utf8'));
  const entradas = ids.map((id) => {
    const e = pack.exercises[id] || {};
    return {
      id,
      nombre: e.name || id,
      alt: POSES[id].alt,
      fotogramas: POSES[id].frames.length,
      frames: POSES[id].frames.map((_, i) => `media/${id}-${i + 1}.svg`),
      canonical: e.canonical || null,
      musculos: e.muscles || [],
      material: (e.equipment || []).filter((x) => x && x !== 'ninguno'),
      impacto: e.impact || null,
    };
  }).sort((a, b) => a.id.localeCompare(b.id));

  const catalogo = {
    formato: 1,
    generado_por: 'tools/gen-media.mjs --catalogo',
    licencia: 'CC BY-SA 4.0',
    como_reutilizar: 'Copia el array "frames" en exercises.<tuId>.media.frames. El id de tu ejercicio puede ser otro: lo que se reutiliza es la ruta del fichero.',
    como_ampliar: 'Añade una pose en tools/poses.mjs y ejecuta npm run media. Ver media/README.md.',
    total: entradas.length,
    ilustraciones: entradas,
  };
  const jsonPath = path.join(OUT, 'catalogo.json');
  const json = JSON.stringify(catalogo, null, 1) + '\n';
  if (!fs.existsSync(jsonPath) || fs.readFileSync(jsonPath, 'utf8') !== json) fs.writeFileSync(jsonPath, json);

  const md = [
    '# Ilustraciones disponibles',
    '',
    '> Generado por `node tools/gen-media.mjs --catalogo`. No editar a mano.',
    '',
    `Hay **${entradas.length}** ilustraciones. Para usar una en un pack, copia su columna`,
    '`media.frames` tal cual dentro del ejercicio:',
    '',
    '```jsonc',
    '"mi-ejercicio": {',
    '  "name": "Como lo quieras llamar",',
    '  "media": { "frames": ["media/sentadillas-1.svg", "media/sentadillas-2.svg"],',
    '             "alt": "De pie y bajando a sentadilla con la cadera atrás" }',
    '}',
    '```',
    '',
    'El id de tu ejercicio puede ser otro: lo que se reutiliza es **la ruta del fichero**.',
    'Un ejercicio sin `media` simplemente no enseña ilustración; no pasa nada más.',
    '',
    'Falta alguna: se añade una pose en `tools/poses.mjs` y se ejecuta `npm run media`.',
    'La versión legible por máquina, para dársela a un agente, es [`catalogo.json`](catalogo.json).',
    '',
    '| Ejercicio | `media.frames` | Músculos | Material | Fotogramas |',
    '| --- | --- | --- | --- | --- |',
    ...entradas.map((e) => `| ${e.nombre} | \`${e.frames.join('`, `')}\` | ${e.musculos.join(', ') || '—'} | ${e.material.join(', ') || 'ninguno'} | ${e.fotogramas} |`),
    '',
  ].join('\n');
  const mdPath = path.join(OUT, 'CATALOGO.md');
  if (!fs.existsSync(mdPath) || fs.readFileSync(mdPath, 'utf8') !== md) fs.writeFileSync(mdPath, md);
  console.log(`catálogo -> media/catalogo.json y media/CATALOGO.md (${entradas.length} ilustraciones)`);
}

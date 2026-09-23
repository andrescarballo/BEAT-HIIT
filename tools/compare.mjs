#!/usr/bin/env node
// Compara el trazo actual con el renderizado en silueta, sobre las mismas poses.
//   node tools/compare.mjs            unos pocos ejercicios
//   node tools/compare.mjs --all      los 53
// Escribe tools/compare.html. No toca media/.

import fs from 'node:fs';
import path from 'node:path';
import { figure, figureSolid, svg, fitPair, groundFor } from './rig.mjs';
import { POSES } from './poses.mjs';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const MUESTRA = ['sentadillas', 'flexiones', 'dominadas', 'press-de-hombros', 'zancadas',
  'plancha', 'burpees', 'jumping-jacks-suaves', 'curl-de-biceps', 'bird-dog',
  'estiramiento-de-femoral', 'mountain-climbers'];
const ids = process.argv.includes('--all') ? Object.keys(POSES) : MUESTRA;

const render = (id, how) => {
  const { alt, frames, ground } = POSES[id];
  const tf = fitPair(frames);
  const g = ground === false ? '' : groundFor(frames);
  return frames.map((pose, i) => {
    const p2 = g ? { ...pose, behind: g + (pose.behind || '') } : pose;
    return svg(how(p2, tf), alt);
  });
};

const cards = ids.map((id) => {
  const linea = render(id, figure).map((s) => `<div>${s}</div>`).join('');
  const silue = render(id, figureSolid).map((s) => `<div>${s}</div>`).join('');
  return `<figure>
  <div class="col"><span class="tag">trazo (lo publicado)</span><div class="pair">${linea}</div></div>
  <div class="col"><span class="tag on">silueta</span><div class="pair">${silue}</div></div>
  <figcaption>${id}</figcaption></figure>`;
}).join('\n');

fs.writeFileSync(path.join(ROOT, 'tools', 'compare.html'), `<!DOCTYPE html><meta charset="utf-8">
<style>
 body{background:#0d0e0c;color:#8a8a72;font:12px ui-monospace,monospace;margin:0;padding:16px}
 .grid{display:grid;grid-template-columns:repeat(2,1fr);gap:16px}
 figure{margin:0;background:#16180f;border:1.5px solid #2a2c1f;border-radius:14px;padding:10px;
   display:grid;grid-template-columns:1fr 1fr;gap:10px}
 .col{min-width:0}
 .tag{display:block;font-size:9px;letter-spacing:.12em;text-transform:uppercase;color:#8a8a72;margin-bottom:5px;text-align:center}
 .tag.on{color:#ff3d7f}
 .pair{display:grid;grid-template-columns:1fr 1fr;gap:4px}
 .pair>div{background:#0d0e0c;border-radius:8px}
 svg{width:100%;height:auto;display:block}
 figcaption{grid-column:1/-1;margin-top:8px;text-align:center;color:#f2efe3;font-size:11px}
</style>
<div class="grid">${cards}</div>
`);
console.log(`${ids.length} ejercicios -> tools/compare.html`);

import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const AXE = fs.readFileSync(
  path.join(path.dirname(createRequire(import.meta.url).resolve('axe-core')), 'axe.min.js'), 'utf8');

export const nombre = 'Accesibilidad: axe sin infracciones en ninguna pantalla';

// WCAG 2.0/2.1 nivel A y AA, más las buenas prácticas de axe (landmarks, orden de
// encabezados). Esto estaba a cuatro infracciones moderadas y ahora a cero: el test
// existe para que no vuelva a subir sin que nos enteremos.
const REGLAS = { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'] } };

// Hay que dejar que terminen las transiciones antes de medir. A mitad de una, un botón
// del control segmentado pasa por rgb(106,106,88) sobre rosa al 26 %, que axe marca
// (con razón) como contraste insuficiente: es un fotograma de la animación, no el
// estado en el que queda la interfaz. La más larga es el fundido del visor, 0,4 s.
const ASENTAR = 450;

export async function run({ page, abrir }) {
  await abrir();

  // Algo de historial para que Stats no salga vacía (una tabla vacía no prueba nada)
  await page.evaluate(async () => {
    for (let i = 0; i < 4; i++) {
      const d = todayStart(); d.setDate(d.getDate() - i);
      const e = { ts: d.getTime(), date: localDate(d), dow: d.getDay(), time: '08:00', durSec: 1200,
        workSec: 700, intervals: 10, packId: PACK.pack.id, packName: PACK.pack.name, workoutId: 'x',
        workoutName: 'Sesión ' + i, category: 'fuerza', counts_as: 'training', exercises: [],
        muscles: ['gluteo', 'core'], reps: [{ ref: 'dominadas', name: 'Dominadas', target: 'máx', sets: [6, 5, 4] }] };
      await logAdd(e); LOG.push(e);
    }
  });
  await page.addScriptTag({ content: AXE });

  const pantallas = [
    ['portada', async () => {}],
    ['ajustes', async () => { await page.click('#opencfg'); }],
    ['ajustes con lista manual', async () => { await page.click('#wkmode .segb[data-m="manual"]'); }],
    ['packs', async () => { await page.click('#cfgdone'); await page.click('#openpacks'); }],
    ['stats', async () => { await page.click('#packsdone'); await page.click('#openstats'); }],
    ['entreno', async () => { await page.click('#backbtn'); await page.click('#go'); await page.waitForTimeout(250); }],
    ['descanso con ilustración', async () => {
      await page.evaluate(() => { idx = seq.findIndex((s, i) => s.type === 'rest' && seq[i + 1] && seq[i + 1].ref); startPhase(); });
      await page.waitForTimeout(200);
    }],
    ['ficha del ejercicio', async () => { await page.click('#infobtn'); await page.waitForTimeout(250); }],
    ['pantalla final', async () => {
      await page.click('#mclose');
      await page.evaluate(async () => { idx = seq.length - 1; startPhase(); await finish(); });
      await page.waitForSelector('#done', { state: 'visible' });
    }],
  ];

  const problemas = [];
  for (const [nombrePantalla, ir] of pantallas) {
    await ir();
    await page.waitForTimeout(ASENTAR);
    const r = await page.evaluate(async (reglas) => {
      const res = await window.axe.run(document, reglas);
      return res.violations.map((v) => ({ id: v.id, impacto: v.impact, ayuda: v.help, donde: (v.nodes[0].target || []).join(' ') }));
    }, REGLAS);
    for (const v of r) problemas.push(`${nombrePantalla}: [${v.impacto}] ${v.id} — ${v.ayuda} (${v.donde})`);
  }

  assert.deepEqual(problemas, [], 'axe encontró infracciones:\n      ' + problemas.join('\n      '));
}

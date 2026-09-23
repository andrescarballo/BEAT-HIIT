import assert from 'node:assert/strict';

export const nombre = 'Progresión: las repeticiones guardadas se ven en el tiempo';

export async function run({ page, abrir }) {
  await abrir();

  // Sin ejercicios por repeticiones en el historial, la tarjeta ni aparece
  await page.click('#openstats');
  assert.ok(!(await page.isVisible('#progbox')), 'sin datos de repeticiones no se enseña la tarjeta');

  // Ocho sesiones de dominadas, subiendo
  await page.evaluate(async () => {
    const series = [[5, 4, 3, 3], [5, 4, 4, 3], [6, 5, 4, 3], [6, 5, 4, 4], [7, 5, 5, 4], [7, 6, 5, 4], [8, 6, 5, 5], [8, 7, 6, 5]];
    for (let i = 0; i < series.length; i++) {
      const d = todayStart(); d.setDate(d.getDate() - (series.length - i) * 3);
      const e = { ts: d.getTime(), date: localDate(d), dow: d.getDay(), time: '08:00', durSec: 1200,
        workSec: 700, intervals: 4, packId: PACK.pack.id, packName: PACK.pack.name,
        workoutId: 'dominadas-fuerza', workoutName: 'Dominadas', category: 'fuerza',
        counts_as: 'training', exercises: [], muscles: ['espalda'],
        reps: [{ ref: 'dominadas', name: 'Dominadas', target: 'máx', sets: series[i] }] };
      await logAdd(e); LOG.push(e);
    }
    renderStats();
  });

  assert.ok(await page.isVisible('#progbox'), 'con datos, la tarjeta aparece');
  const fila = await page.evaluate(() => {
    const r = document.querySelector('#progreso .pgrow');
    return {
      nombre: r.querySelector('.pgname').textContent,
      valor: r.querySelector('.pgval').textContent,
      barras: r.querySelectorAll('.pgbars .b').length,
      ultimaMarcada: r.querySelectorAll('.pgbars .b.last').length,
      series: r.querySelector('.pgsets').textContent,
      alturas: [...r.querySelectorAll('.pgbars .b')].map((b) => parseInt(b.style.height)),
    };
  });
  assert.equal(fila.nombre, 'Dominadas');
  assert.ok(fila.valor.includes('26 reps'), 'enseña el total de la última sesión (8+7+6+5)');
  assert.ok(fila.valor.includes('+11'), 'y cuánto ha subido desde la primera de la ventana');
  assert.equal(fila.barras, 8, 'una barra por sesión');
  assert.equal(fila.ultimaMarcada, 1, 'la última va destacada');
  assert.ok(fila.series.includes('8 · 7 · 6 · 5'), 'se ven las series de la última sesión');
  assert.ok(fila.series.includes('mejor 8'), 'y la mejor serie');
  assert.ok(fila.alturas[7] > fila.alturas[0], 'la progresión se ve en las alturas');

  // La ventana se limita a las 12 últimas para que las barras no se hagan hilos
  await page.evaluate(async () => {
    for (let i = 0; i < 10; i++) {
      const d = todayStart(); d.setDate(d.getDate() - 100 - i);
      await logAdd({ ts: d.getTime(), date: localDate(d), dow: 0, time: '08:00', durSec: 600, workSec: 300,
        intervals: 4, packId: PACK.pack.id, packName: PACK.pack.name, workoutId: 'd', workoutName: 'D',
        category: 'fuerza', counts_as: 'training', exercises: [], muscles: [],
        reps: [{ ref: 'dominadas', name: 'Dominadas', target: 'máx', sets: [2, 2] }] });
    }
    LOG = await logAll(); renderStats();
  });
  assert.equal(await page.evaluate(() => document.querySelectorAll('#progreso .pgbars .b').length), 12,
    'como mucho 12 barras');

  // Una sesión suelta no inventa una tendencia
  await page.evaluate(async () => {
    await logClear(); LOG = [];
    const d = todayStart();
    const e = { ts: d.getTime(), date: localDate(d), dow: 0, time: '08:00', durSec: 600, workSec: 300,
      intervals: 2, packId: PACK.pack.id, packName: PACK.pack.name, workoutId: 'd', workoutName: 'D',
      category: 'fuerza', counts_as: 'training', exercises: [], muscles: [],
      reps: [{ ref: 'dominadas', name: 'Dominadas', target: 'máx', sets: [3, 2] }] };
    await logAdd(e); LOG.push(e); renderStats();
  });
  assert.ok((await page.textContent('#progreso .pgval')).includes('primera vez'),
    'con una sola sesión no se enseña una variación que no existe');
}

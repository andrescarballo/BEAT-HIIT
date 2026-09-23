import assert from 'node:assert/strict';

export const nombre = 'Stats: balance muscular, historial completo y compartir';

export async function run({ page, abrir }) {
  await abrir();

  // 50 sesiones para que el historial pase del corte de 40
  await page.evaluate(async () => {
    for (let i = 0; i < 50; i++) {
      const d = todayStart(); d.setDate(d.getDate() - i);
      const e = { ts: d.getTime(), date: localDate(d), dow: d.getDay(), time: '08:00', durSec: 1200,
        workSec: 700, intervals: 10, packId: PACK.pack.id, packName: PACK.pack.name, workoutId: 'x',
        workoutName: 'Sesión ' + i, category: 'fuerza', counts_as: 'training', exercises: [],
        muscles: i % 2 ? ['gluteo', 'core'] : ['espalda'], reps: [] };
      await logAdd(e); LOG.push(e);
    }
  });
  await page.click('#openstats');

  // Días activos cuenta sólo la ventana de 30, no las 50 sesiones
  assert.equal((await page.textContent('#s-total')).trim(), '50', 'el total son todas');
  assert.equal((await page.textContent('#s-streak')).trim(), '30', 'los días activos se limitan a la ventana de 30');

  // El balance muscular enseña también los grupos a cero: es el dato útil
  const barras = await page.$$eval('#mbal .mrow', (rs) => rs.map((r) => ({
    m: r.querySelector('.mlab').textContent, n: Number(r.querySelector('.mnum').textContent),
  })));
  assert.ok(barras.length > 5, 'debería listar los grupos musculares del pack');
  assert.ok(barras.some((b) => b.n === 0), 'los grupos sin tocar salen a cero, que es lo que interesa ver');
  assert.deepEqual(barras.map((b) => b.n), [...barras.map((b) => b.n)].sort((a, b) => b - a), 'ordenadas de más a menos');

  // Historial: arranca recortado y se despliega entero
  const filas = () => page.$$eval('#hist .hrow', (r) => r.length);
  assert.equal(await filas(), 40, 'el historial arranca en 40 filas');
  const verTodo = await page.$('#hist button');
  assert.ok(verTodo, 'con más de 40 tiene que haber botón para ver el resto');
  assert.ok((await verTodo.textContent()).includes('50'), 'y decir cuántos hay');
  await verTodo.click();
  assert.equal(await filas(), 50, 'al desplegarlo se ven todos');

  // Compartir arma un texto con lo que importa
  await page.click('#backbtn');
  await page.click('#go');
  await page.evaluate(async () => { idx = seq.length - 1; startPhase(); await finish(); });
  await page.waitForSelector('#done', { state: 'visible' });
  assert.ok(await page.isVisible('#share'), 'el botón de compartir aparece al terminar');
  const texto = await page.evaluate(() => shareText());
  assert.ok(texto.startsWith('Beat · '), 'el texto lleva la marca');
  assert.ok(/\d+:\d\d/.test(texto), 'y la duración');
}

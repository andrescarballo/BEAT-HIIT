import assert from 'node:assert/strict';

export const nombre = 'Fechas locales y días activos';

export async function run({ page, abrir }) {
  // 00:30 en Madrid: la fecha UTC es la del día anterior. Aquí se rompía la racha y
  // se descolocaban las etiquetas de la gráfica de 7 días.
  await page.clock.install({ time: new Date('2026-09-21T00:30:00+02:00') });
  await abrir();

  const f = await page.evaluate(() => ({
    local: localDate(),
    utc: new Date().toISOString().slice(0, 10),
  }));
  assert.equal(f.local, '2026-09-21', 'localDate debe dar la fecha local');
  assert.equal(f.utc, '2026-09-20', 'y la UTC sigue siendo la del día anterior (es el caso que se probaba)');

  // Días activos: cuenta días distintos en 30, no se infla alternando ni se rompe al descansar
  const casos = await page.evaluate(() => {
    const hoy = todayStart();
    const mk = (n) => { const d = new Date(hoy); d.setDate(d.getDate() - n); return localDate(d); };
    const con = (dias) => { LOG = dias.map((d) => ({ date: d, ts: 0, dow: 0, durSec: 0 })); return activeDays(30); };
    return {
      diez: con([...Array(10)].map((_, i) => mk(i))),
      alternos2anios: con([...Array(365)].map((_, i) => mk(i * 2))),
      fueraDeVentana: con([mk(40), mk(50)]),
      repetidosMismoDia: con([mk(0), mk(0), mk(1)]),
      vacio: con([]),
    };
  });
  assert.equal(casos.diez, 10, '10 días seguidos = 10 días activos');
  assert.equal(casos.alternos2anios, 15, 'día sí día no sólo puede sumar 15 días dentro de una ventana de 30');
  assert.equal(casos.fueraDeVentana, 0, 'lo de hace más de 30 días no cuenta');
  assert.equal(casos.repetidosMismoDia, 2, 'dos entrenos el mismo día cuentan como un día');
  assert.equal(casos.vacio, 0, 'sin historial, cero');
}

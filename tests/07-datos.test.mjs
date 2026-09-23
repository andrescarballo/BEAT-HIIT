import assert from 'node:assert/strict';

export const nombre = 'Datos del usuario: copia, restauración y migración de pack';

export async function run({ page, abrir }) {
  await abrir();

  // Sembramos historial
  await page.evaluate(async () => {
    const hoy = todayStart();
    for (let i = 0; i < 3; i++) {
      const d = new Date(hoy); d.setDate(d.getDate() - i);
      const e = { ts: d.getTime(), date: localDate(d), dow: d.getDay(), time: '08:00', durSec: 1200,
        workSec: 700, intervals: 10, packId: PACK.pack.id, packName: PACK.pack.name, workoutId: 'x',
        workoutName: 'Sembrado', category: 'fuerza', counts_as: 'training', exercises: [], muscles: ['gluteo'], reps: [] };
      await logAdd(e); LOG.push(e);
    }
  });

  // La copia sale con todo lo que hace falta para reconstruir
  const copia = await page.evaluate(async () => ({
    log: LOG.length, packs: (await packAll()).length, cfg: Object.keys(cfg).sort(),
  }));
  assert.equal(copia.log, 3);
  assert.ok(copia.cfg.includes('gear') && copia.cfg.includes('voice'), 'la config incluye los ajustes nuevos');

  // Restaurar una copia con OTRO contenido para el pack activo tiene que verse sin recargar:
  // packPut escribe en IndexedDB, pero PACK era el objeto viejo en memoria.
  const tras = await page.evaluate(async () => {
    const otro = JSON.parse(JSON.stringify(PACK));
    otro.pack.name = 'Pack restaurado';
    otro.workouts[0].name = 'Entreno restaurado';
    const d = { app: 'beat', version: 2, config: cfg, log: LOG, packs: [otro] };
    // mismo camino que el botón Restaurar
    if (Array.isArray(d.packs)) {
      for (const p of d.packs) { if (!validatePack(p)) await packPut(p); }
      const act = await kvGet('active');
      const np = act ? await packGet(act) : null;
      if (np) { PACK = np; if (cfg.wkId && !PACK.workouts.some((w) => w.id === cfg.wkId)) cfg.wkId = null; await saveCfg(); }
    }
    updSummary();
    return { nombrePack: PACK.pack.name, primero: PACK.workouts[0].name, resumen: document.getElementById('summary').textContent };
  });
  assert.equal(tras.nombrePack, 'Pack restaurado', 'PACK en memoria debe reflejar lo restaurado');
  assert.ok(tras.resumen.includes('Pack restaurado'), 'y la pantalla principal tiene que enseñarlo ya');

  // Migración: una instalación con el pack viejo se actualiza al recargar, sin perder historial
  await page.evaluate(async () => {
    const viejo = JSON.parse(JSON.stringify(PACK));
    viejo.pack.version = 1;
    viejo.pack.name = 'Pack antiguo';
    for (const e of Object.values(viejo.exercises)) delete e.media;
    await packPut(viejo);
  });
  await abrir();
  const migrado = await page.evaluate(async () => {
    const s = await packGet('beat-basico');
    return { version: s.pack.version, conMedia: Object.values(s.exercises).filter((e) => e.media).length, historial: LOG.length };
  });
  assert.ok(migrado.version > 1, 'el pack embebido debe reemplazar al viejo');
  assert.ok(migrado.conMedia > 0, 'y traer las ilustraciones consigo');
  assert.equal(migrado.historial, 3, 'el historial del usuario no se toca al actualizar el pack');
}

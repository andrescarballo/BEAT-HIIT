import assert from 'node:assert/strict';

export const nombre = 'Ilustraciones: cobertura, rutas y dónde se enseñan';

export async function run({ page, abrir }) {
  await abrir();

  // Todos los ejercicios ilustrados, con texto alternativo, y sin rutas rotas.
  // El 404 de los ocho isométricos salió justo de esta comprobación.
  const cob = await page.evaluate(async () => {
    const ids = Object.keys(PACK.exercises);
    const sinMedia = ids.filter((id) => !(PACK.exercises[id].media || {}).frames);
    const sinAlt = ids.filter((id) => (PACK.exercises[id].media || {}).frames && !PACK.exercises[id].media.alt);
    const rutas = ids.flatMap((id) => ((PACK.exercises[id].media || {}).frames) || []);
    const rotas = [];
    for (const r of rutas) if (!(await fetch(r, { method: 'HEAD' })).ok) rotas.push(r);
    return { total: ids.length, sinMedia, sinAlt, rutas: rutas.length, rotas };
  });
  assert.deepEqual(cob.sinMedia, [], 'todos los ejercicios deberían tener ilustración');
  assert.deepEqual(cob.sinAlt, [], 'toda ilustración necesita texto alternativo');
  assert.deepEqual(cob.rotas, [], 'ninguna ruta de media puede apuntar a un fichero que no existe');
  assert.ok(cob.rutas >= cob.total, 'debería haber al menos un fotograma por ejercicio');

  // Se enseña el ejercicio QUE VIENE, y sólo en descanso o preparación.
  await page.click('#go');
  const traza = await page.evaluate(async () => {
    const out = [];
    for (let i = 0; i < seq.length - 1; i++) {
      idx = i; startPhase();
      await new Promise((r) => setTimeout(r, 8));
      const s = seq[i], nx = seq[i + 1];
      out.push({
        descanso: s.type === 'rest' || s.type === 'prep',
        siguiente: nx && nx.ref,
        visor: document.getElementById('run').classList.contains('hasmedia'),
        src: document.getElementById('exmedia-a').getAttribute('src') || '',
      });
    }
    return out;
  });
  const enDescanso = traza.filter((x) => x.descanso && x.siguiente);
  assert.ok(enDescanso.length > 0, 'debería haber fases de descanso con un ejercicio detrás');
  for (const x of enDescanso) {
    assert.ok(x.visor && x.src.includes(x.siguiente),
      `en descanso debería verse la ilustración de ${x.siguiente}, y se ve "${x.src}"`);
  }
  const enTrabajo = traza.filter((x) => !x.descanso && x.visor);
  assert.deepEqual(enTrabajo, [], 'durante el trabajo el visor se esconde: ahí no se mira la pantalla');
}

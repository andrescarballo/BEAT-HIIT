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

  // Un pack de fuera (los genera un agente, no se editan aquí) puede REUTILIZAR una
  // ilustración existente apuntando a su ruta, aunque su ejercicio se llame distinto.
  // Es lo que promete media/CATALOGO.md, así que se comprueba.
  const reuso = await page.evaluate(async () => {
    const p = {
      schema: 2,
      pack: { id: 'generado', name: 'Pack generado', version: 1 },
      plan: { rotation: ['w1'] },
      exercises: {
        'sentadilla-profunda': {
          name: 'Sentadilla profunda',
          media: { frames: ['media/sentadillas-1.svg', 'media/sentadillas-2.svg'], alt: 'Sentadilla' },
        },
        'algo-sin-dibujo': { name: 'Ejercicio nuevo sin ilustración' },
      },
      workouts: [{ id: 'w1', name: 'Generado', sequence: [
        { kind: 'work', ref: 'sentadilla-profunda', mode: 'time', sec: 30 },
        { kind: 'rest', sec: 15 },
        { kind: 'work', ref: 'algo-sin-dibujo', mode: 'time', sec: 30 },
      ] }],
    };
    const err = validatePack(p);
    if (err) return { err };
    await packPut(p); await kvSet('active', 'generado');
    PACK = await packGet('generado'); cfg.wkId = null; cfg.gear = null;
    W = currentWorkout(); seq = compile(W); running = true;

    // fase de preparación: detrás viene el ejercicio que reutiliza el dibujo
    idx = 0; startPhase(); await new Promise((r) => setTimeout(r, 30));
    const conDibujo = { visor: document.getElementById('run').classList.contains('hasmedia'),
      src: document.getElementById('exmedia-a').getAttribute('src') };

    // el descanso previo al ejercicio SIN dibujo no debe enseñar nada
    idx = seq.findIndex((s, i) => s.type === 'rest' && seq[i + 1] && seq[i + 1].ref === 'algo-sin-dibujo');
    startPhase(); await new Promise((r) => setTimeout(r, 30));
    const sinDibujo = { visor: document.getElementById('run').classList.contains('hasmedia') };
    return { conDibujo, sinDibujo };
  });
  assert.ok(!reuso.err, 'el pack generado debería ser válido: ' + reuso.err);
  assert.ok(reuso.conDibujo.visor, 'un ejercicio con otro id reutiliza la ilustración por su ruta');
  assert.ok(reuso.conDibujo.src.includes('sentadillas-1.svg'), 'y es la ilustración que pidió');
  assert.equal(reuso.sinDibujo.visor, false, 'un ejercicio sin ilustración simplemente no enseña nada');

  // El catálogo que se publica tiene que describir lo que hay de verdad en media/
  const cat = await (await fetch(page.url().replace(/\/index\.html.*/, '') + '/media/catalogo.json')).json();
  assert.equal(cat.total, cat.ilustraciones.length);
  const rutas = cat.ilustraciones.flatMap((i) => i.frames);
  const rotas = [];
  for (const r of rutas) {
    const res = await page.evaluate(async (u) => (await fetch(u, { method: 'HEAD' })).ok, r);
    if (!res) rotas.push(r);
  }
  assert.deepEqual(rotas, [], 'el catálogo no puede prometer ilustraciones que no existen');
}

import assert from 'node:assert/strict';

export const nombre = 'Ejercicios por repeticiones: se cuenta lo que haces, ni una más';

// Este flujo alimenta la gráfica de progresión, así que un error aquí no se ve: se
// convierte en datos falsos. Se probaba poco y tenía un fallo real: el contador se
// precargaba con cualquier número del objetivo, y "máx (deja 1 en reserva)" arrancaba
// en 1. Hacías 8 dominadas, tocabas 8 veces y se guardaban 9.

export async function run({ page, abrir }) {
  await abrir();

  const irAReps = () => page.evaluate(() => {
    const w = PACK.workouts.find((x) => x.sequence.some((st) => (st.kind === 'block' ? st.items : [st]).some((i) => i.mode === 'reps')));
    W = w; seq = compile(w); running = true; repsLog = [];
    idx = seq.findIndex((s) => s && s.mode === 'reps'); startPhase();
    return seq[idx].target;
  });

  const objetivo = await irAReps();
  assert.ok(objetivo, 'el pack trae un ejercicio por repeticiones');
  assert.ok(/máx/i.test(objetivo), 'y su objetivo es a máximo, sin número prescrito: ' + objetivo);
  assert.equal(await page.evaluate(() => repN), 0,
    `con el objetivo "${objetivo}" el contador tiene que arrancar en 0, no coger el número que haya suelto`);

  // Ocho toques = ocho repeticiones
  for (let i = 0; i < 8; i++) await page.evaluate(() => onRing());
  assert.equal(await page.evaluate(() => repN), 8, 'el anillo suma una por toque');
  await page.evaluate(() => recordSerie());
  assert.deepEqual(await page.evaluate(() => repSets), [8], 'se registra lo que hiciste');
  assert.equal(await page.evaluate(() => repN), 0, 'y la siguiente serie vuelve a empezar de cero');

  // El botón de restar corrige, y no baja de cero
  for (let i = 0; i < 3; i++) await page.evaluate(() => onRing());
  await page.evaluate(() => { onPrev(); onPrev(); });
  assert.equal(await page.evaluate(() => repN), 1, 'restar corrige un toque de más');
  await page.evaluate(() => { onPrev(); onPrev(); });
  assert.equal(await page.evaluate(() => repN), 0, 'y no baja de cero');

  // Terminar guarda todas las series de la fase
  await page.evaluate(() => { for (let i = 0; i < 6; i++) onRing(); recordSerie(); for (let i = 0; i < 5; i++) onRing(); });
  const registro = await page.evaluate(() => { finishReps(); return repsLog; });
  assert.equal(registro.length, 1, 'una entrada por ejercicio');
  assert.deepEqual(registro[0].sets, [8, 6, 5], 'con todas sus series, la última incluida');
  assert.equal(registro[0].ref, 'dominadas');

  // Un objetivo CON número prescrito sí precarga, que es lo cómodo
  const precarga = await page.evaluate(() => {
    const casos = ['10 / pierna', '8-12', '12 por lado', 'máx', 'máx (deja 1 en reserva)', ''];
    return casos.map((t) => [t, numericTarget(t)]);
  });
  assert.deepEqual(precarga, [['10 / pierna', 10], ['8-12', 8], ['12 por lado', 12], ['máx', 0], ['máx (deja 1 en reserva)', 0], ['', 0]]);

  // Pausar en una fase de repeticiones no puede perder lo contado
  await irAReps();
  const traPausa = await page.evaluate(() => {
    for (let i = 0; i < 4; i++) onRing();
    togglePause();
    return repsLog;
  });
  assert.equal(traPausa.length, 1, 'al salir de la fase por pausa también se registra');
  assert.deepEqual(traPausa[0].sets, [4], 'sin perder las repeticiones contadas');
}

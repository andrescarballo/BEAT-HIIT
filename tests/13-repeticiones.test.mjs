import assert from 'node:assert/strict';

export const nombre = 'Ejercicios por repeticiones: se cuenta lo que haces, ni una más';

// Este flujo alimenta la gráfica de progresión, así que un error aquí no se ve: se
// convierte en datos falsos. Ya ha fallado dos veces por lo mismo, precargar el
// contador: primero cogiendo cualquier número del objetivo ("máx (deja 1 en reserva)"
// arrancaba en 1, hacías 8 dominadas y se guardaban 9), y después, con el número
// correcto, sumándole tus toques encima ("20 por serie" + 12 toques = 32) y guardando
// series que no llegabas a tocar.
// El contador cuenta desde cero lo que haces. El objetivo se ENSEÑA, no se cuenta.

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

  // El número del objetivo se lee bien, para enseñarlo y para estimar la duración
  const meta = await page.evaluate(() => {
    const casos = ['10 / pierna', '8-12', '12 por lado', 'máx', 'máx (deja 1 en reserva)', ''];
    return casos.map((t) => [t, numericTarget(t)]);
  });
  assert.deepEqual(meta, [['10 / pierna', 10], ['8-12', 8], ['12 por lado', 12], ['máx', 0], ['máx (deja 1 en reserva)', 0], ['', 0]]);

  // ---- Un objetivo numérico NO precarga el contador ----
  // Con "20 por serie" el contador arrancaba en 20 y tus 12 toques lo dejaban en 32.
  const conMeta = await page.evaluate(() => {
    const w = JSON.parse(JSON.stringify(PACK.workouts[0]));
    w.sequence = [{ kind: 'work', ref: 'sentadillas', mode: 'reps', target: '20 por serie' }];
    W = w; seq = compile(w); running = true; repsLog = [];
    idx = seq.findIndex((s) => s && s.mode === 'reps'); startPhase();
    const anillo = () => 1 - parseFloat(document.getElementById('arc').style.strokeDashoffset) / 283;
    const arranque = { n: repN, centro: document.getElementById('count').textContent, anillo: anillo() };
    for (let i = 0; i < 12; i++) onRing();
    const doce = { n: repN, anillo: anillo() };
    recordSerie();
    const tras = { sets: repSets.slice(), n: repN };
    finishReps(); // la 2ª serie no se toca
    return { arranque, doce, tras, guardado: repsLog[0].sets };
  });
  assert.equal(conMeta.arranque.n, 0, 'el contador arranca en 0 aunque el objetivo diga 20');
  assert.equal(conMeta.doce.n, 12, '12 toques son 12 repeticiones, no 32');
  assert.deepEqual(conMeta.tras.sets, [12], 'y se registra lo que hiciste');
  assert.equal(conMeta.tras.n, 0, 'la serie siguiente también empieza en 0');
  assert.deepEqual(conMeta.guardado, [12],
    'una serie que no llegas a tocar no se guarda: antes se registraban las 20 prescritas como hechas');

  // El objetivo se ve: en el pie del contador y llenando el anillo
  assert.ok(/de 20 reps/.test(conMeta.arranque.centro), 'el pie del contador enseña la meta: ' + conMeta.arranque.centro);
  assert.equal(Math.round(conMeta.arranque.anillo * 100), 0, 'anillo vacío al empezar');
  assert.equal(Math.round(conMeta.doce.anillo * 100), 60, '12 de 20 llenan el anillo al 60 %');

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

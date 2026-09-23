import assert from 'node:assert/strict';

export const nombre = 'Controles del runner, accesos directos y accesibilidad';

export async function run({ page, abrir }) {
  await abrir();
  await page.click('#go');

  // +15 s alarga la fase en curso sin pausar
  await page.evaluate(() => { idx = seq.findIndex((s) => s.type === 'rest'); startPhase(); });
  await page.waitForTimeout(150);
  const antes = await page.evaluate(() => ({ left, sec: seq[idx].sec, pausado: paused }));
  await page.click('#plus15');
  const despues = await page.evaluate(() => ({ left, sec: seq[idx].sec, pausado: paused, arco: document.getElementById('arc').style.strokeDashoffset }));
  assert.equal(despues.sec, antes.sec + 15, '+15 estira la duración de la fase');
  assert.ok(despues.left > antes.left, 'y lo que queda por delante');
  assert.equal(despues.pausado, false, 'sin pausar el entreno');
  assert.ok(Number(despues.arco) >= 0, 'el arco no se sale de rango al recalcularse');

  // En una fase por repeticiones no hay temporizador que alargar: el botón se esconde
  const enReps = await page.evaluate(() => {
    const w = PACK.workouts.find((x) => x.sequence.some((st) => (st.kind === 'block' ? st.items : [st]).some((i) => i.mode === 'reps')));
    if (!w) return null;
    W = w; seq = compile(w); idx = seq.findIndex((s) => s.mode === 'reps'); startPhase();
    return document.getElementById('plus15').style.visibility;
  });
  assert.equal(enReps, 'hidden', 'con repeticiones el botón +15 no tiene sentido y se oculta');

  // Accesibilidad de los controles
  await abrir();
  const a11y = await page.evaluate(() => ({
    anillo: document.getElementById('ring-tap').getAttribute('aria-label'),
    rolAnillo: document.getElementById('ring-tap').getAttribute('role'),
    cuenta: document.getElementById('count').getAttribute('aria-hidden'),
    ejercicio: document.getElementById('exname').getAttribute('aria-live'),
    sinEtiqueta: ['quit', 'prev', 'skip', 'plus15', 'infobtn']
      .filter((id) => !document.getElementById(id).getAttribute('aria-label')),
  }));
  assert.ok(a11y.anillo, 'el anillo es interactivo: necesita etiqueta');
  assert.equal(a11y.rolAnillo, 'button');
  assert.equal(a11y.cuenta, 'true', 'la cuenta atrás cambia cada segundo: no se anuncia');
  assert.equal(a11y.ejercicio, 'polite', 'el nombre del ejercicio sí');
  assert.deepEqual(a11y.sinEtiqueta, [], 'todos los controles del runner llevan aria-label');

  // El anillo responde al teclado
  await page.click('#go');
  await page.focus('#ring-tap');
  await page.keyboard.press(' ');
  assert.equal(await page.textContent('#phase'), 'EN PAUSA', 'espacio sobre el anillo pausa');

  // Accesos directos del manifest, y que limpian la URL
  await page.goto((await page.url()).split('/index.html')[0] + '/index.html?stats=1');
  await page.waitForFunction(() => typeof PACK !== 'undefined' && PACK !== null);
  await page.waitForTimeout(200);
  assert.ok(await page.isVisible('#stats'), '?stats=1 abre las estadísticas');
  assert.ok(page.url().endsWith('/index.html'), 'y limpia la URL para que una recarga no lo repita');
}

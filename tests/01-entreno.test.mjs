import assert from 'node:assert/strict';

export const nombre = 'Un entreno completo, de principio a registro';

export async function run({ page, abrir }) {
  await abrir();

  // La estimación tiene que responder a las opciones: con est_min fija no lo hacía
  // y daba el mismo número con calentamiento y sin él.
  await page.click('#opencfg');
  const conTodo = await page.textContent('#meta');
  await page.click('#warmup'); await page.click('#stretch');
  const sinNada = await page.textContent('#meta');
  const min = (s) => Number(s.match(/~\s*(\d+)\s*min/)[1]);
  assert.ok(min(sinNada) < min(conTodo),
    `quitar calentamiento y estiramientos debería bajar el estimado (${min(conTodo)} -> ${min(sinNada)})`);
  await page.click('#warmup'); await page.click('#stretch'); // se restauran
  await page.click('#cfgdone');

  // Recorrido completo saltando fase a fase
  await page.click('#go');
  const fases = await page.evaluate(() => seq.length);
  assert.ok(fases > 5, 'la secuencia compilada debería tener varias fases');
  // finish() es asíncrono (guarda en IndexedDB antes de cambiar de pantalla), así que
  // entre el último clic y la pantalla final hay un instante sin botón: se ignora.
  for (let i = 0; i < fases + 3; i++) {
    if (!(await page.isVisible('#run'))) break;
    await page.click('#skip', { timeout: 2000 }).catch(() => {});
  }
  await page.waitForSelector('#done', { state: 'visible', timeout: 10000 });

  // La sesión se guarda con la fecha LOCAL, no la UTC
  const e = await page.evaluate(() => {
    const x = LOG[LOG.length - 1], n = new Date();
    const local = n.getFullYear() + '-' + String(n.getMonth() + 1).padStart(2, '0') + '-' + String(n.getDate()).padStart(2, '0');
    return { fecha: x.date, local, dow: x.dow, dowLocal: n.getDay(), musculos: x.muscles.length, workout: x.workoutName };
  });
  assert.equal(e.fecha, e.local, 'entry.date debe ser la fecha local');
  assert.equal(e.dow, e.dowLocal, 'el día de la semana debe cuadrar con la fecha');
  assert.ok(e.musculos > 0, 'la sesión debería registrar los músculos trabajados');

  // Y sobrevive a recargar
  await abrir();
  await page.click('#openstats');
  assert.equal((await page.textContent('#s-total')).trim(), '1', 'el historial debe persistir');
}

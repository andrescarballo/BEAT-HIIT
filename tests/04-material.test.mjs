import assert from 'node:assert/strict';

export const nombre = 'Filtro de material disponible';

export async function run({ page, abrir }) {
  await abrir();
  await page.click('#opencfg');

  const chips = () => page.$$eval('#gearchips .chip', (cs) => cs.map((c) => ({ t: c.textContent, on: c.classList.contains('on') })));
  const inicial = await chips();
  assert.ok(inicial.length >= 3, 'el pack declara varios tipos de material');
  assert.ok(inicial.every((c) => c.on), 'por defecto se asume que lo tienes todo');

  const disponibles = () => page.evaluate(() => PACK.workouts.filter(gearOk).length);
  const todos = await disponibles();
  assert.equal(todos, await page.evaluate(() => PACK.workouts.length), 'con todo el material, todos los entrenos valen');

  // Sin nada de material
  for (const c of inicial) {
    const el = await page.$(`#gearchips .chip:text-is("${c.t}")`);
    if (el) await el.click();
  }
  const soloPesoCorporal = await disponibles();
  assert.ok(soloPesoCorporal > 0, 'sin material tiene que quedar algo que hacer');
  assert.ok(soloPesoCorporal < todos, 'y tienen que quedar menos que con todo');

  // El automático no puede proponer algo para lo que falta material
  const auto = await page.evaluate(() => {
    const w = PACK.workouts.find((x) => x.id === autoWorkoutId());
    return { id: w.id, ok: gearOk(w) };
  });
  assert.ok(auto.ok, `el modo automático propuso "${auto.id}", que necesita material que no hay`);

  // En la lista manual, los que no caben quedan marcados
  await page.click('#wkmode .segb[data-m="manual"]');
  const items = await page.$$eval('#wklist .citem', (els) => els.map((e) => ({
    off: e.classList.contains('off'), aviso: !!e.querySelector('.mini.warn'),
  })));
  assert.equal(items.length, todos, 'la lista manual muestra todos los entrenos');
  assert.ok(items.some((i) => i.off && i.aviso), 'los bloqueados van atenuados y con la etiqueta de lo que falta');
  assert.equal(items.filter((i) => !i.off).length, soloPesoCorporal, 'los no atenuados coinciden con los disponibles');

  // Y persiste
  await abrir();
  await page.click('#opencfg');
  assert.ok((await chips()).every((c) => !c.on), 'la selección de material debe persistir');
}

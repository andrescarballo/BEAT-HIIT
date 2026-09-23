import assert from 'node:assert/strict';

export const nombre = 'Plan semanal: el schedule del pack se valida y se cumple';

// El plan semanal es cosa del pack, no de la app: plan.schedule dice qué toca cada
// día. Justo por eso la app tiene que rechazar un plan roto en vez de tragárselo —
// un id mal escrito pasaba el filtro y caía a la rotación en silencio.

export async function run({ page, abrir }) {
  await abrir();

  const conPlan = (schedule) => page.evaluate(async (sch) => {
    const q = JSON.parse(JSON.stringify(PACK));
    q.pack.id = 'plan';
    q.plan = { rotation: ['inferior-clasico', 'superior-clasico', 'fullbody-clasico'], schedule: sch };
    const err = validatePack(q);
    if (err) return { err };
    await packPut(q); await kvSet('active', 'plan');
    PACK = await packGet('plan'); cfg.gear = null; cfg.wkMode = 'auto';
    return { propone: autoWorkoutId() };
  }, schedule);

  const hoy = String(await page.evaluate(() => new Date().getDay()));

  // Un plan correcto manda sobre la rotación
  const bueno = await conPlan({ [hoy]: 'core-completo' });
  assert.ok(!bueno.err, 'un schedule correcto es válido');
  assert.equal(bueno.propone, 'core-completo', 'lo que dice el plan para hoy manda sobre la rotación');

  // Un id que no existe se rechaza al importar, no se ignora
  const roto = await conPlan({ [hoy]: 'entreno-que-no-existe' });
  assert.ok(roto.err, 'un schedule que apunta a un entrenamiento inexistente tiene que rechazarse');
  assert.ok(/schedule/i.test(roto.err) && /entreno-que-no-existe/.test(roto.err),
    'y el mensaje tiene que decir qué día y qué id: ' + roto.err);

  // Un día fuera de rango también
  const dia = await conPlan({ 9: 'core-completo' });
  assert.ok(dia.err, 'los días van de 0 a 6');

  // Sin entrada para hoy se cae a la rotación, que es el comportamiento documentado
  const sinHoy = await conPlan({ [(Number(hoy) + 3) % 7]: 'core-completo' });
  assert.ok(!sinHoy.err);
  assert.ok(['inferior-clasico', 'superior-clasico', 'fullbody-clasico'].includes(sinHoy.propone),
    'si hoy no está en el plan, manda la rotación');
}

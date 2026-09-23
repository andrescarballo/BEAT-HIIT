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

  // ---- Día de descanso (null) ----
  // No es lo mismo que no estar en el plan: un plan de 4 días deja 3 sin entrada, y
  // esos días la app proponía entrenar igual (y siempre lo mismo, porque la rotación
  // no avanza hasta que registras algo). Declararlo con null tiene que notarse.
  const portada = () => page.evaluate(() => {
    updSummary();
    const rn = document.getElementById('restnote');
    return {
      descanso: restDayToday(),
      aviso: rn.style.display === 'none' ? null : rn.textContent,
      fueraDePlan: /fuera del plan/.test(document.getElementById('summary').innerHTML),
      play: !!document.getElementById('go'),
    };
  });

  const nulo = await conPlan({ [hoy]: null });
  assert.ok(!nulo.err, 'null es un valor válido en el schedule: significa descanso');
  const hoyDescanso = await portada();
  assert.equal(hoyDescanso.descanso, true, 'hoy es día de descanso según el plan');
  assert.ok(/descanso/i.test(hoyDescanso.aviso || ''), 'y la portada lo dice: ' + hoyDescanso.aviso);
  assert.equal(hoyDescanso.fueraDePlan, true,
    'el entreno que se ve igualmente queda marcado como fuera del plan, para no confundirlo con el de hoy');
  assert.equal(hoyDescanso.play, true, 'el botón de empezar sigue ahí: descansar es una sugerencia, no un cierre');

  // Y un día de descanso de OTRO día no convierte hoy en descanso
  await conPlan({ [(Number(hoy) + 2) % 7]: null, [hoy]: 'core-completo' });
  const hoyEntreno = await portada();
  assert.equal(hoyEntreno.descanso, false, 'el descanso es del día que lo declara, no de toda la semana');
  assert.equal(hoyEntreno.fueraDePlan, false);
  assert.equal(hoyEntreno.aviso, null, 'y sin aviso de descanso');
}

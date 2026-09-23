import assert from 'node:assert/strict';

export const nombre = 'Un pack importado no puede inyectar HTML ni colar rutas raras';

export async function run({ page, abrir }) {
  await abrir();

  // Los packs son JSON de terceros. Todo su texto pasa por esc() antes de innerHTML.
  const esc = await page.evaluate(() => {
    const malo = '<img src=x onerror="window.__pwned=1">';
    const div = document.createElement('div');
    div.innerHTML = '<h4>' + window.esc(malo) + '</h4>';
    return { html: div.innerHTML, imgs: div.querySelectorAll('img').length, pwned: !!window.__pwned };
  });
  assert.equal(esc.imgs, 0, 'no debe crearse ningún elemento a partir del texto del pack');
  assert.equal(esc.pwned, false, 'ni ejecutarse nada');
  assert.ok(esc.html.includes('&lt;img'), 'el texto se escapa, no se borra');

  // Y lo mismo por el camino real: un pack con nombre hostil renderizado en la lista
  const enLista = await page.evaluate(async () => {
    const p = JSON.parse(JSON.stringify(PACK));
    p.pack.id = 'hostil';
    p.pack.name = '<img src=x onerror="window.__pwned2=1">';
    p.pack.description = '<script>window.__pwned3=1</script>';
    await packPut(p);
    await renderPacks();
    return {
      imgs: document.querySelectorAll('#packlist img').length,
      scripts: document.querySelectorAll('#packlist script').length,
      pwned: !!window.__pwned2 || !!window.__pwned3,
      texto: document.getElementById('packlist').textContent.includes('<img src=x'),
    };
  });
  assert.equal(enLista.imgs, 0, 'la lista de packs no debe materializar etiquetas del nombre');
  assert.equal(enLista.scripts, 0, 'ni de la descripción');
  assert.equal(enLista.pwned, false, 'y no se ejecuta nada');
  assert.ok(enLista.texto, 'el nombre se ve tal cual, como texto');

  // La validación rechaza media con esquemas ejecutables
  const validacion = await page.evaluate(() => {
    const base = () => JSON.parse(JSON.stringify(PACK));
    const conMedia = (frames) => { const p = base(); p.exercises.sentadillas.media = { frames }; return validatePack(p); };
    return {
      javascript: conMedia(['javascript:alert(1)']),
      vacio: conMedia([]),
      noArray: conMedia('media/x.svg'),
      bueno: conMedia(['media/sentadillas-1.svg']),
      sinSchema: (() => { const p = base(); p.schema = 1; return validatePack(p); })(),
      refDesconocida: (() => {
        const p = base();
        p.workouts[0].sequence = [{ kind: 'work', ref: 'no-existe', mode: 'time', sec: 30 }];
        return validatePack(p);
      })(),
    };
  });
  assert.ok(validacion.javascript, 'javascript: en media.frames debe rechazarse');
  assert.ok(validacion.vacio, 'media.frames vacío debe rechazarse');
  assert.ok(validacion.noArray, 'media.frames que no sea lista debe rechazarse');
  assert.equal(validacion.bueno, null, 'una ruta normal se acepta');
  assert.ok(validacion.sinSchema, 'sólo se acepta schema 2');
  assert.ok(validacion.refDesconocida, 'una ref que no existe en exercises se rechaza');
}

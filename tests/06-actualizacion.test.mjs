import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

export const nombre = 'Service worker: aviso de versión nueva';

export async function run({ page, abrir, raiz }) {
  const SW = path.join(raiz, 'sw.js');
  const original = fs.readFileSync(SW, 'utf8');
  try {
    await abrir();
    // segunda carga: ya hay un worker controlando la página
    await abrir();
    await page.waitForFunction(() => navigator.serviceWorker.controller !== null, null, { timeout: 10000 });
    assert.ok(!(await page.isVisible('#update.show')),
      'en la primera visita no debe aparecer el aviso: clients.claim() dispara controllerchange y recargar ahí era un parpadeo gratis');

    // Publicamos una versión nueva
    fs.writeFileSync(SW, original.replace(/const CACHE = '[^']+'/, "const CACHE = 'beat-PRUEBA'"));
    await page.evaluate(async () => { (await navigator.serviceWorker.getRegistration()).update(); });
    await page.waitForSelector('#update.show', { timeout: 10000 });

    // "Luego" lo esconde sin aplicar nada
    await page.click('#uplater');
    assert.ok(!(await page.isVisible('#update.show')), 'el botón Luego esconde el aviso');
    assert.ok(await page.evaluate(async () => !!(await navigator.serviceWorker.getRegistration()).waiting),
      'el worker nuevo sigue esperando: no se cambian los assets a mitad de entreno');

    // Aceptar releva el worker y recarga
    await page.evaluate(() => document.getElementById('update').classList.add('show'));
    const nav = page.waitForNavigation({ timeout: 15000 });
    await page.click('#upgo');
    await nav;
    await page.waitForFunction(() => navigator.serviceWorker.controller !== null, null, { timeout: 10000 });

    const estado = await page.evaluate(async () => ({
      esperando: !!(await navigator.serviceWorker.getRegistration()).waiting,
      caches: await caches.keys(),
    }));
    assert.equal(estado.esperando, false, 'tras aceptar no debe quedar ningún worker esperando');
    assert.deepEqual(estado.caches, ['beat-PRUEBA'], 'la caché vieja se borra al activar la nueva');
    assert.ok(await page.isVisible('#main'), 'y la app sigue funcionando tras recargar');
  } finally {
    fs.writeFileSync(SW, original);
  }
}

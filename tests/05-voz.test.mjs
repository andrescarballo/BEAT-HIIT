import assert from 'node:assert/strict';

export const nombre = 'Voz en los cambios de fase';

export async function run({ page, abrir }) {
  // Chromium headless no trae voces, así que se sustituye speechSynthesis por un
  // registrador. Hay que definirlo con defineProperty: en window es de sólo lectura
  // y una asignación normal se pierde en silencio.
  await page.addInitScript(() => {
    window.__dicho = [];
    window.SpeechSynthesisUtterance = class { constructor(t) { this.text = t; } };
    Object.defineProperty(window, 'speechSynthesis', {
      configurable: true,
      value: {
        speak: (u) => window.__dicho.push({ texto: u.text, lang: u.lang }),
        cancel: () => {}, resume: () => {},
        getVoices: () => [{ lang: 'es-ES', name: 'Prueba' }], onvoiceschanged: null,
      },
    });
  });
  await abrir();

  await page.click('#go');
  await page.waitForTimeout(500);
  await page.click('#skip'); await page.waitForTimeout(500);

  const dicho = await page.evaluate(() => window.__dicho);
  assert.ok(dicho.length >= 2, 'debería anunciar al menos la preparación y el primer ejercicio');
  assert.ok(dicho.every((d) => d.lang === 'es-ES'), 'todo se dice en es-ES');
  assert.ok(dicho.some((d) => /prepárate/i.test(d.texto)), 'la fase de preparación se anuncia');
  const nombres = await page.evaluate(() => seq.filter((s) => s.ref).map((s) => s.name));
  assert.ok(dicho.some((d) => nombres.includes(d.texto)), 'se dice el nombre del ejercicio');

  // Apagando el toggle se calla
  await page.click('#quit');
  await page.click('#opencfg');
  assert.ok(await page.isVisible('#voicetg'), 'el toggle de voz está en Ajustes');
  await page.click('#voicetg');
  await page.click('#cfgdone');
  await page.evaluate(() => { window.__dicho = []; });
  await page.click('#go');
  await page.waitForTimeout(600);
  assert.deepEqual(await page.evaluate(() => window.__dicho), [], 'con la voz apagada no debe decir nada');
}

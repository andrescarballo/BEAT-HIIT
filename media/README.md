# Ilustraciones de ejercicios

Los 53 ejercicios del pack tienen ilustración. La app las enseña **durante el descanso**
(el ejercicio que *viene*, que es cuando de verdad miras la pantalla) y en la ficha de
"cómo se hace".

**Estos SVG son generados: no se editan a mano.** Los escribe `tools/gen-media.mjs` a
partir de las poses de `tools/poses.mjs`.

```
node tools/gen-media.mjs           # regenera los SVG
node tools/gen-media.mjs --sheet   # + hoja de contactos para revisarlas de un vistazo
node tools/gen-media.mjs --pack    # + declara la media en beat-basico.json
node tools/gen-media.mjs --trazo   # con línea de grosor constante en vez de silueta
node tools/compare.mjs             # los dos estilos lado a lado -> tools/compare.html
node build.mjs                     # mete media/ en el precache y regenera CREDITS.md
```

El estilo por defecto es **silueta**: cada miembro se dibuja como una forma rellena que se
estrecha hacia el extremo, con un punto de hombros para que la cabeza no se funda con el
tronco. La alternativa (`--trazo`) usa línea de grosor constante; se descartó porque a
tamaño de móvil salían monigotes.

## Cómo se describe una pose

Una figura son las coordenadas de sus articulaciones sobre un lienzo de 200×200.
Retocar una postura es mover un punto, no redibujar un SVG:

```js
sentadillas: {
  alt: 'De pie y bajando a sentadilla con la cadera atrás',
  frames: [
    { head: [98, 34], spine: [[98, 48], [100, 102]],
      arm: [[101, 58], [103, 82], [104, 106]],      // hombro, codo, mano
      leg: [[100, 102], [102, 140], [101, 176]],    // cadera, rodilla, tobillo
      armFar: [...], legFar: [...] },               // miembros del lado lejano
    { /* segundo fotograma */ },
  ],
},
```

Reglas que impone el rig (`tools/rig.mjs`), para que no haya que pensarlas:

- **Dos fotogramas** se alternan con un fundido de 0,9 s: da sensación de movimiento sin
  GIF y sin sus líos de licencia. **Uno solo** para isométricos (plancha, hollow hold,
  estiramientos): la app lo deja fijo.
- El **encuadre es automático y común a los dos fotogramas**. Si cada uno se escalara por
  su cuenta, la figura pegaría un salto de tamaño a mitad del fundido.
- El **suelo se coloca solo** bajo el punto más bajo de la pose. `ground: false` para lo
  que no toca el suelo (dominadas).
- Los miembros del lado lejano se pintan en un tono apagado: da profundidad sin trucos.
- El grosor de trazo no escala con el encuadre (`vector-effect`), así que todas las
  figuras tienen exactamente el mismo peso de línea.

Helpers para los ejercicios que alternan lado: `mirror()` (vista frontal, como rodillas
arriba) y `swapSides()` (vista de perfil, donde el espejo giraría todo el cuerpo).

## Revisar

Lo único que valida una ilustración es mirarla. `--sheet` genera `tools/sheet.html` con
los 53 ejercicios en rejilla, que es como se detectaron las posturas que no se leían.

## Sobre el origen de los dibujos

Son propios, generados por el código de este repo, bajo CC BY-SA 4.0.

Si alguna vez te tienta un dataset externo, comprueba la licencia **del material**, no la
que declare quien lo republica: varios de los datasets de ejercicios más populares son
scrapes de material con copyright con una licencia permisiva puesta encima por un
intermediario, y eso no sanea nada.

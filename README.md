<p align="center">
  <img src="icon-512.png" width="120" alt="Beat">
</p>

<h1 align="center">Beat</h1>

<p align="center">Entrenamiento por intervalos en casa — sin cuentas, sin anuncios, sin conexión.</p>

---

Beat es una pequeña app web (PWA) para hacer HIIT y circuitos de fuerza en casa. Te guía ejercicio a ejercicio con cuenta atrás, avisos de sonido y vibración, y lleva el registro de lo que entrenas. Pensada para abrirla, darle al play y seguir sin pensar — ideal recién levantado y con música de fondo.

Sin dependencias, sin backend, sin recoger ningún dato: todo vive en tu dispositivo.

## Qué hace

- **Intervalos guiados** con anillo de cuenta atrás, nombre del ejercicio y "a continuación".
- **Tres circuitos**: tren inferior + core, tren superior, y full body + cardio.
- **Tres intensidades**: suave, medio y fuerte (ajustan tiempos y rondas).
- **Día automático**: rota 1 → 2 → 3 según tu último entreno (o lo eliges a mano).
- **Bloque de dominadas** opcional al inicio, con descansos de fuerza de verdad.
- **Calentamiento y estiramientos** guiados, activables.
- **Modo bajo impacto**: cambia saltos por versiones sin impacto.
- **Botón de info** en cada ejercicio: cómo hacerlo y el error típico a evitar.
- **Sonidos diferenciados** (trabajo / descanso / cuenta atrás / final) y **vibración**.
- **Ilustración de los 53 ejercicios**, generada desde datos de pose, que aparece durante el descanso mostrando el que viene.
- **Material disponible**: dices lo que tienes a mano y los entrenos se ajustan solos.
- **Estadísticas**: días activos, total, tiempo acumulado, gráfica de 7 días, **balance muscular**, **progresión de repeticiones** e historial completo.
- **Voz opcional**: te dice el ejercicio en cada cambio, para no mirar la pantalla.
- **Pantalla siempre encendida** durante el entreno (Wake Lock).
- **Funciona sin conexión** e **instalable** como app.

Colores con sentido durante el entreno: **lima = trabajo**, **rojo = descanso**, **cian = movilidad**.

## Cómo se usa

1. Abre la app y pulsa el botón de play.
2. Toca el número grande (o el anillo) para pausar y reanudar.
3. Usa el engranaje para ajustar día, intensidad y opciones — se recuerdan.
4. Revisa tu progreso en el icono de la gráfica.

## Desplegar en GitHub Pages

1. Ejecuta `node build.mjs` (ver abajo) y sube **todos los archivos** a la raíz del repo.
2. **Settings → Pages → Deploy from a branch**, rama `main`, carpeta `/ (root)`.
3. Abre la URL en Chrome (móvil) y elige **Instalar aplicación**.

Las rutas son relativas, así que también funciona en una subcarpeta.

## Desarrollo

**La app no tiene dependencias**: es un HTML que abres y funciona. Lo de `package.json`
es sólo para desarrollar (Playwright, para las pruebas y para generar imágenes).

```
npm install
npm run build        # antes de cada commit que toque contenido o assets
npm run check        # no escribe nada; falla si algo está desincronizado
npm test             # las pruebas (arranca su propio servidor)
npm test -- material # sólo las que coincidan
npm run media        # regenera ilustraciones + hoja de contactos
npm run screenshots  # regenera las capturas del manifest
```

### Las pruebas

`tests/` son pruebas de navegador de verdad, sin framework: el runner levanta un
servidor estático propio y conduce Chromium. Cada test recibe un contexto limpio, y
**falla solo si la página lanza un error de JS o pide algo que devuelve 4xx** — eso no
hay que comprobarlo a mano en cada una.

No son decorativas: han cazado que el service worker recargaba la página sola en la
primera visita, que ocho ilustraciones apuntaban a ficheros inexistentes, y que una
actualización no llegaba a quien ya tenía la app instalada.

Una de ellas pasa **axe** (WCAG 2.1 A y AA, más las buenas prácticas de landmarks y
orden de encabezados) por las nueve pantallas y exige **cero infracciones**. Medido
también: arranque en frío sin conexión sin una sola petición fallida, 154 KB en la
primera visita, ~100 ms hasta poder usarla, y ningún objetivo táctil por debajo de
44 px a 320 px de ancho.

El CI (`.github/workflows/ci.yml`) corre en cada push lo mismo, más una comprobación de
que `media/` no se ha editado a mano y sigue coincidiendo con `tools/poses.mjs`.

### El build

Hace tres cosas:

- Inyecta `beat-basico.json` dentro de `index.html`, para que el pack tenga **una sola
  fuente de verdad** en vez de dos copias que haya que mantener a mano.
- Regenera la lista de assets del service worker y calcula su versión de caché a partir
  del **hash del contenido**. Ya no hay que acordarse de subir `beat-v1` → `beat-v2`: si
  cambia un byte, la caché se invalida sola; si no cambia nada, la versión no se mueve.
- Regenera `CREDITS.md` con las licencias de las fuentes y de la media declarada en el pack.
- Falla si el pack declara una ilustración que no existe en disco.

Las ilustraciones se generan aparte, cuando toques las poses:

```
node tools/gen-media.mjs --sheet --pack
```

Cada figura está descrita por las coordenadas de sus articulaciones en `tools/poses.mjs`,
así que retocar una postura es mover un punto. Las 98 ilustraciones pesan 8 KB
comprimidas en total. Ver [`media/README.md`](media/README.md).

Cuando publiques una versión nueva, quien tenga la app instalada ve una barra de
**"Hay una versión nueva · Recargar"**. El service worker nuevo espera a que acepte, así
que nunca se le cambian los archivos a mitad de entreno.

## Estructura

```
index.html              El motor v2 (HTML + CSS + JS, sin dependencias) — generado en parte
tests/                  Pruebas de navegador + su runner
screenshots/            Capturas para la ficha de instalación (generadas)
beat-basico.json        El pack por defecto (20 entrenamientos). Fuente de verdad: se inyecta en el motor
build.mjs               Inyecta el pack, genera los assets del SW y CREDITS.md
tools/                  Rig de figura y poses: de aquí salen las ilustraciones
SCHEMA.md               Especificación del formato de pack (v2)
CREDITS.md              Generado. Licencias de fuentes e ilustraciones
fonts/                  Las tres fuentes en woff2 (subconjunto latin, 66 KB)
media/                  Las 98 ilustraciones (generadas) + su catálogo para reutilizarlas
manifest.webmanifest    Metadatos de la PWA
sw.js                   Service worker (offline) — lista de assets generada
icon-*.png              Iconos
```

> `index.html` contiene un bloque entre `PACK:START` / `PACK:END` y `sw.js` otro entre
> `ASSETS:START` / `ASSETS:END`. Esos dos los escribe `build.mjs`: no los edites a mano.
> Los SVG de `media/` los escribe `tools/gen-media.mjs`: se editan en `tools/poses.mjs`.

El motor y el contenido están separados. **Para crear o editar un pack, ver [`SCHEMA.md`](SCHEMA.md).** Un **pack** es un JSON autocontenido (ejercicios + entrenamientos + plan de rotación) según `SCHEMA.md`. Los packs se importan desde la pantalla Packs y quedan guardados en **IndexedDB**, disponibles sin conexión. El pack por defecto va embebido y se instala solo en el primer arranque. Las estadísticas son del usuario y persisten aunque cambies o borres packs; el historial de la versión anterior se migra automáticamente.

## Tecnología

HTML/CSS/JS sin frameworks ni dependencias. **IndexedDB** para packs, ajustes e historial; Web Audio API para los avisos; SpeechSynthesis para la voz; Wake Lock API para mantener la pantalla; Vibration API; y un service worker para el modo offline. Las fuentes van servidas desde el propio repo. El temporizador se calcula por marcas de reloj, así que aguanta el bloqueo de pantalla sin desfasarse.

## Privacidad

Beat no tiene servidor ni analítica, y **no hace ni una sola petición a terceros**: las fuentes van dentro del repo en vez de pedirse a Google. Tu configuración y tu historial se guardan **solo en el navegador de tu dispositivo**. Si cambias de móvil o borras los datos del navegador, se pierden (no hay sincronización), así que en Stats tienes **Exportar copia**.

## Licencia

[MIT](LICENSE) · Hazlo tuyo.

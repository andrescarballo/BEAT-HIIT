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
- **Estadísticas**: racha, total, tiempo acumulado, gráfica de 7 días e historial.
- **Pantalla siempre encendida** durante el entreno (Wake Lock).
- **Funciona sin conexión** e **instalable** como app.

Colores con sentido durante el entreno: **lima = trabajo**, **rojo = descanso**, **cian = movilidad**.

## Cómo se usa

1. Abre la app y pulsa el botón de play.
2. Toca el número grande (o el anillo) para pausar y reanudar.
3. Usa el engranaje para ajustar día, intensidad y opciones — se recuerdan.
4. Revisa tu progreso en el icono de la gráfica.

## Desplegar en GitHub Pages

1. Sube **todos los archivos** a la raíz del repo.
2. **Settings → Pages → Deploy from a branch**, rama `main`, carpeta `/ (root)`.
3. Abre la URL en Chrome (móvil) y elige **Instalar aplicación**.

Las rutas son relativas, así que también funciona en una subcarpeta.

> Al actualizar archivos, sube la versión de caché en `sw.js` (`beat-v1` → `beat-v2`) para que el service worker sirva la versión nueva.

## Estructura

```
index.html              El motor v2 (HTML + CSS + JS, sin dependencias)
beat-basico.json        Pack de ejemplo (20 entrenamientos) — el mismo va embebido en el motor
SCHEMA.md               Especificación del formato de pack (v2)
manifest.webmanifest    Metadatos de la PWA
sw.js                   Service worker (offline)
icon-192.png            Icono
icon-512.png            Icono
icon-maskable.png       Icono maskable (Android)
```

El motor y el contenido están separados. Un **pack** es un JSON autocontenido (ejercicios + entrenamientos + plan de rotación) según `SCHEMA.md`. Los packs se importan desde la pantalla Packs y quedan guardados en **IndexedDB**, disponibles sin conexión. El pack por defecto va embebido y se instala solo en el primer arranque. Las estadísticas son del usuario y persisten aunque cambies o borres packs; el historial de la versión anterior se migra automáticamente.

## Editar tus entrenamientos (`library.json`)

Esquema (todo es ampliable: añade tipos, circuitos o escenarios sin tocar el código):

```jsonc
{
  "schema": 1,
  "rotation": ["inferior", "superior", "fullbody"],  // orden del modo Automatico
  "warmup":  ["Movilidad de hombros", ...],          // calentamiento guiado
  "stretch": ["Estiramiento de cuadriceps", ...],    // vuelta a la calma
  "levels": {                                         // intensidades
    "medio": { "w": 40, "r": 15, "rounds": 3, "lbl": "Medio", "d": "..." }
  },
  "exercises": {                                      // banco de ejercicios
    "Sentadillas": {
      "steps": ["paso 1", "paso 2", ...],
      "err": "el error tipico a evitar",
      "impact": "high",                               // opcional
      "low": "Sentadillas sin salto"                  // opcional: alternativa bajo impacto
    }
  },
  "types": [                                          // tipos de entreno
    {
      "key": "inferior",
      "label": "Tren inferior",
      "freq": "2x/sem",                               // recomendacion (informativa)
      "circuits": [
        { "name": "Clasico", "ex": ["Sentadillas", "Zancadas", ...] }
      ]
    }
  ],
  "scenarios": [                                      // atajos de configuracion
    {
      "name": "Express",
      "rotation": ["inferior", "superior", "fullbody"],
      "level": "fuerte",
      "options": { "warmup": false, "pullups": false, "stretch": false, "lowImpact": false }
    }
  ]
}
```

Reglas: cada ejercicio usado en un circuito o en `warmup`/`stretch` debe existir en `exercises`. La alternativa de `low` también. Tras editar, sube `library.json` y bump la versión en `sw.js` para refrescar la caché.

## Tecnología

HTML/CSS/JS sin frameworks. `localStorage` para config e historial, Web Audio API para los avisos, Wake Lock API para mantener la pantalla, Vibration API y un service worker para el modo offline. El temporizador se calcula por marcas de reloj, así que aguanta el bloqueo de pantalla sin desfasarse.

## Privacidad

Beat no tiene servidor ni analítica. Tu configuración y tu historial se guardan **solo en el navegador de tu dispositivo**. Si cambias de móvil o borras los datos del navegador, se pierden (no hay sincronización).

## Licencia

[MIT](LICENSE) · Hazlo tuyo.

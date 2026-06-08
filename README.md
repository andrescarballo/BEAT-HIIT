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
index.html              La app entera (HTML + CSS + JS, sin dependencias)
manifest.webmanifest    Metadatos de la PWA
sw.js                   Service worker (offline)
icon-192.png            Icono
icon-512.png            Icono
icon-maskable.png       Icono maskable (Android)
```

## Tecnología

HTML/CSS/JS sin frameworks. `localStorage` para config e historial, Web Audio API para los avisos, Wake Lock API para mantener la pantalla, Vibration API y un service worker para el modo offline. El temporizador se calcula por marcas de reloj, así que aguanta el bloqueo de pantalla sin desfasarse.

## Privacidad

Beat no tiene servidor ni analítica. Tu configuración y tu historial se guardan **solo en el navegador de tu dispositivo**. Si cambias de móvil o borras los datos del navegador, se pierden (no hay sincronización).

## Licencia

[MIT](LICENSE) · Hazlo tuyo.

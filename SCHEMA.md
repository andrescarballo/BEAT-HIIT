# Beat — esquema de pack (v2)

Un **pack** es un archivo JSON autocontenido: un programa de entrenamiento completo. Incluye sus ejercicios, sus entrenamientos y su lógica de rotación. El motor (`index.html`) no sabe nada de contenido: carga el pack activo y reproduce.

Principios:
- **El motor es tonto, el pack es listo.** Toda la inteligencia vive en el JSON.
- **Autocontenido.** Cada pack trae sus propios ejercicios. Lo seleccionas, lo descargas y lo tienes offline.
- **Las stats son del usuario, no del pack.** Cambias de pack y el historial persiste y agrega. Cada sesión registra de qué pack salió.
- **Solo métricas honestas.** El pack aporta etiquetas objetivas (categoría, músculos); el motor mide los números reales (tiempo, intervalos). Nada de precisión falsa.

---

## Estructura

```jsonc
{
  "schema": 2,

  "pack": {
    "id": "beat-basico",        // único; sirve de espacio de nombres en las stats
    "name": "Beat básico",
    "description": "Rutina de casa con peso corporal y mancuernas.",
    "author": "Andrés",
    "version": 1,               // sube al actualizar; reemplaza por id, NO toca el historial
    "lang": "es"
  },

  "plan": {
    "rotation": ["inferior-clasico", "superior-tiron", "fullbody-clasico"], // orden del modo Automático
    "schedule": { "1": "inferior-clasico", "3": "superior-tiron" },         // opcional: por día de semana (0=Dom … 6=Sáb)
                                                                            // PRECEDENCIA: si hay entrada para hoy, schedule manda; si no, rotation
    "rest_after_days": 6        // aviso DENTRO de la app si encadenas tantos días (no es notificación push)
  },

  "exercises": {
    "sentadilla": {
      "name": "Sentadillas",
      "canonical": "squat.bodyweight",     // OPCIONAL: id estable para agrupar entre packs en el futuro
      "steps": ["Pies al ancho de cadera.", "Baja como sentándote.", "Empuja con los talones."],
      "cue": "Que las rodillas no se hundan hacia dentro.",
      "muscles": ["cuadriceps", "gluteo"], // para análisis de balance
      "equipment": ["ninguno"],            // ninguno | mancuernas | banda | barra | silla | ...
      "impact": "low",                     // low | high
      "low": "marcha",                     // OPCIONAL: id de alternativa para modo bajo impacto
      "media": {                           // OPCIONAL: ilustración del ejercicio
        "frames": ["media/sentadilla-1.svg", "media/sentadilla-2.svg"], // 1 fija, 2 se alternan
        "alt": "Figura bajando a sentadilla",
        "credit": { "author": "...", "license": "CC BY-SA 4.0", "source": "https://..." }
      }
    }
  },

  "workouts": [
    {
      "id": "inferior-clasico",
      "name": "Tren inferior — Clásico",
      "description": "Piernas, glúteo y core.",
      "category": "fuerza",                // fuerza | cardio | core | movilidad | fullbody
      "counts_as": "training",             // training | recovery (recovery cuenta para la racha, pero se marca aparte)
      "equipment": ["mancuernas"],         // informativo / filtro "sin material"
      "est_min": 28,                       // estimado, informativo
      "sequence": [ /* ver abajo */ ]
    }
  ]
}
```

---

## La secuencia (`sequence`)

Lista ordenada de pasos. Cada paso es un item simple o un bloque repetido.

Tipos (`kind`):
- `warmup` — calentamiento (color cian).
- `cooldown` — estiramiento / vuelta a la calma (cian).
- `work` — ejercicio del circuito (lima). Es el `kind` por defecto si se omite.
- `rest` — descanso explícito (naranja). Normalmente no hace falta ponerlo: los descansos entre items de un bloque los genera el motor con `rest`.
- `note` — texto informativo sin ejercicio (p. ej. "coloca la barra"), opcional con `sec`.
- `block` — grupo que se repite `rounds` veces.

Modos (`mode`) de un item con ejercicio:
- `time` — por tiempo. Requiere `sec`. Cuenta atrás.
- `reps` — a tu ritmo. Requiere `target` (p. ej. `"10 / pierna"`, `"máx"`). Sin cuenta atrás: muestra el objetivo y avanzas tú. Opcional `rest_after` (segundos).
- `hold` — isométrico (plancha, etc.). Requiere `sec`. Como `time` pero etiquetado como sostener.

Ejemplo:

```jsonc
"sequence": [
  { "kind": "warmup", "ref": "movilidad-hombros", "mode": "time", "sec": 30 },

  { "kind": "block", "rounds": 4, "rest": 60, "items": [
      { "ref": "dominada", "mode": "reps", "target": "máx" }
  ]},

  { "kind": "block", "rounds": 3, "rest": 15, "items": [
      { "ref": "sentadilla", "mode": "time", "sec": 40 },
      { "ref": "zancada",    "mode": "reps", "target": "10 / pierna", "rest_after": 20 },
      { "ref": "plancha",    "mode": "hold", "sec": 40 }
  ]},

  { "kind": "cooldown", "ref": "estiramiento-femoral", "mode": "time", "sec": 30 }
]
```

`rest` en un bloque = descanso por defecto entre items. `rest_rounds` = descanso entre rondas (si falta, se usa `rest`). `rest_after` en un item sobrescribe el del bloque. El motor expande las rondas; no hay que escribirlas a mano.

`note` se define como `{ "kind":"note", "text":"Coloca la barra", "sec":10 }` — texto en pantalla, con o sin cuenta atrás (`sec` opcional; sin él, se avanza con "hecho").

**Intensidad:** en v2 no hay niveles globales (suave/medio/fuerte) que escalen tiempos: los tiempos van en la secuencia. La intensidad se expresa como **workouts variantes** dentro del pack (p. ej. "Express 12 min" y "Completo 28 min"). El motor no muestra selector de intensidad con packs v2.

**Toggles del motor:** "saltar calentamiento" y "saltar estiramientos" filtran genéricamente por `kind` (`warmup`/`cooldown`). "Bajo impacto" sustituye cada `ref` por su `low` si existe.

**Material:** el motor reúne el `equipment` de los ejercicios de la secuencia **ya compilada** (es decir, después de aplicar esos toggles) y lo compara con el material que el usuario declara tener en Ajustes. Los entrenos para los que falte algo se marcan en la lista y el modo automático los salta. `ninguno` no cuenta como material. El `equipment` declarado a nivel de workout es informativo; el que manda es el de los ejercicios.

---

## Estadísticas (lado del motor, no van en el pack)

Cada sesión completada se guarda en el dispositivo con:

```jsonc
{
  "ts": 1736500000000, "date": "2026-06-10", "dow": 3, "time": "06:42",
  "packId": "beat-basico", "packName": "Beat básico",
  "workoutId": "inferior-clasico", "workoutName": "Tren inferior — Clásico",
  "category": "fuerza", "counts_as": "training",
  "durSec": 1620,        // tiempo activo, sin pausas (medido por el motor)
  "workSec": 720,        // segundos de trabajo reales
  "intervals": 18,       // nº de items de trabajo completados
  "exercises": ["Sentadillas", "Zancadas", "Plancha", "..."],
  "muscles": ["cuadriceps", "gluteo", "core"]
}
```

Derivadas y reglas:
- **Días activos:** días distintos con al menos un entreno en los últimos 30 (training y recovery cuentan). Sustituye a la antigua racha con día de gracia, que no se rompía nunca entrenando en días alternos y acababa mostrando números sin significado. Este contador no se puede inflar y no penaliza descansar, que es justo lo que la app recomienda con `rest_after_days`. `recovery` se marca aparte para no inflar la sensación de "fuerza".
- **Balance** por `category` y por `muscles` → detectar lo que descuidas (p. ej. tirón/espalda).
- **Cross-pack:** todos los agregados son globales. Se puede filtrar por `packId`. La rotación de cada pack se calcula desde el log filtrado por ese pack → al volver a un pack, retoma su rotación.
- **Calorías:** NO se guardan como dato del pack (sería precisión falsa). Si acaso, estimación calculada (MET × peso × duración) y SIEMPRE etiquetada como estimación. Desactivada por defecto.
- **IDs con espacio de nombres:** en el log se guarda `packId` + `workoutId` juntos; dos packs pueden compartir un `id` de workout sin colisionar.

---

## Almacenamiento e instalación (motor)

- **IndexedDB** (base `beat`), con tres almacenes:
  - `packs` → el JSON completo de cada pack, indexado por `pack.id`
  - `log` → historial de sesiones (una entrada por entreno completado)
  - `kv` → `config` (ajustes), `active` (id del pack activo), `migrated` (marca de migración)
- El historial de la v1, que vivía en `localStorage` bajo `beat-log`, se migra solo en el primer arranque.
- **Importar** un pack: leer JSON → validar `schema:2` → guardar por `id` (reemplaza si coincide) → añadir al índice. Queda offline para siempre.
- El pack por defecto va embebido en el motor como copia de seguridad y se instala en el primer arranque.

---

## Validación (qué debe cumplir un pack)

- Todo `ref` usado en cualquier `sequence` existe en `exercises`.
- Todo `low` apunta a un `id` que existe en `exercises`.
- Todo id en `plan.rotation` y `plan.schedule` existe en `workouts`.
- `mode:"time"` y `mode:"hold"` requieren `sec`; `mode:"reps"` requiere `target`.
- Si hay `media`, `media.frames` es una lista no vacía de rutas; se rechazan los esquemas `javascript:` y `vbscript:`.
- `pack.id` único; `schema` presente.

---

## Límites honestos

- **`media.frames`** funciona sin conexión: son ficheros del propio repo (`media/`), que `build.mjs` mete en el precache del service worker. Las 98 ilustraciones del pack básico pesan 8 KB comprimidas, menos que cualquiera de los iconos. **Vídeo no**: empaquetarlo sería pesado y su licencia casi nunca lo permite. El texto (`steps` + `cue`) sigue siendo la base que siempre funciona, y la ilustración es un extra.
- **`plan.freq` / `schedule` / `rest_after_days`** son guía e avisos *dentro* de la app. Una PWA no da recordatorios push fiables (iOS casi nada). No son alarmas.
- **Cuota de almacenamiento:** IndexedDB da margen de sobra para packs y media ligera (SVG/WebP), pero el navegador puede vaciarla si el dispositivo se queda sin espacio y la app no está instalada.
- **Calorías:** estimación, nunca dato autoral.

---

## Versionado

- `schema`: el motor solo acepta packs **v2**; uno con otro valor se rechaza con aviso. Lo que sí sobrevive de la v1 es el **historial**, que se migra automáticamente.
- `pack.version`: al reimportar un pack con el mismo `id`, se sobrescribe el contenido; el historial es independiente y sobrevive.

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
      "media": { "video": "https://...", "img": "https://..." } // OPCIONAL, solo online
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
- **Racha:** una sola racha de "te moviste" (training y recovery cuentan). Con **1 día de gracia**: un día suelto sin entrenar no la rompe; dos seguidos sí. Razón: la propia app recomienda descansar (`rest_after_days`) y sería un incentivo perverso que seguir ese consejo te penalizara. `recovery` se marca aparte para no inflar la sensación de "fuerza".
- **Balance** por `category` y por `muscles` → detectar lo que descuidas (p. ej. tirón/espalda).
- **Cross-pack:** todos los agregados son globales. Se puede filtrar por `packId`. La rotación de cada pack se calcula desde el log filtrado por ese pack → al volver a un pack, retoma su rotación.
- **Calorías:** NO se guardan como dato del pack (sería precisión falsa). Si acaso, estimación calculada (MET × peso × duración) y SIEMPRE etiquetada como estimación. Desactivada por defecto.
- **IDs con espacio de nombres:** en el log se guarda `packId` + `workoutId` juntos; dos packs pueden compartir un `id` de workout sin colisionar.

---

## Almacenamiento e instalación (motor)

- `localStorage`:
  - `beat-packs` → índice de packs instalados `[{id, name, version}]`
  - `beat-pack:<id>` → el JSON completo del pack
  - `beat-active` → id del pack activo
  - `beat-config` → ajustes (intensidad, opciones, modo)
  - `beat-log` → historial de sesiones
- **Importar** un pack: leer JSON → validar `schema:2` → guardar por `id` (reemplaza si coincide) → añadir al índice. Queda offline para siempre.
- El pack por defecto va embebido en el motor como copia de seguridad y se instala en el primer arranque.

---

## Validación (qué debe cumplir un pack)

- Todo `ref` usado en cualquier `sequence` existe en `exercises`.
- Todo `low` apunta a un `id` que existe en `exercises`.
- Todo id en `plan.rotation` y `plan.schedule` existe en `workouts`.
- `mode:"time"` y `mode:"hold"` requieren `sec`; `mode:"reps"` requiere `target`.
- `pack.id` único; `schema` presente.

---

## Límites honestos

- **`media`** funciona online. Offline de verdad exigiría empaquetar vídeos (pesado, licencias). El texto (`steps` + `cue`) es la base que siempre funciona.
- **`plan.freq` / `schedule` / `rest_after_days`** son guía e avisos *dentro* de la app. Una PWA no da recordatorios push fiables (iOS casi nada). No son alarmas.
- **`localStorage`** ronda los ~5 MB: de sobra para texto/packs; no para media.
- **Calorías:** estimación, nunca dato autoral.

---

## Versionado

- `schema`: el motor soporta v1 (formato antiguo) y v2. Si falta o no se reconoce, se rechaza con aviso.
- `pack.version`: al reimportar un pack con el mismo `id`, se sobrescribe el contenido; el historial es independiente y sobrevive.

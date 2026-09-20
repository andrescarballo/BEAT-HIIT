# Ilustraciones de ejercicios

Aquí van los dibujos que la app enseña durante el descanso (el ejercicio que **viene**)
y en la ficha de "cómo se hace".

Ahora mismo solo hay un **placeholder** (`sentadillas-1.svg` / `sentadillas-2.svg`) para
que el mecanismo se vea funcionando. Sustitúyelo y ve añadiendo el resto.

## Convención

- **SVG**, `viewBox="0 0 200 200"`, trazo de 5 px, `stroke-linecap="round"`.
- Color de figura `#f2efe3`, suelo o apoyos en `#2a2c1f`. Nada de relleno.
- Dos fotogramas por ejercicio: `-1` posición inicial, `-2` posición final. La app los
  alterna con un fundido de 0,9 s, que es lo que da la sensación de movimiento sin GIF.
- Un solo fotograma también vale: se queda fija, sin fundido.
- Nombre de fichero = id del ejercicio en el pack + `-1` / `-2`.

`build.mjs` mete automáticamente todo lo que haya aquí en el precache del service
worker, así que las ilustraciones funcionan sin conexión sin tocar nada más.

## Declararlas en el pack

En `beat-basico.json`, dentro del ejercicio:

```jsonc
"sentadillas": {
  "name": "Sentadillas",
  "media": {
    "frames": ["media/sentadillas-1.svg", "media/sentadillas-2.svg"],
    "alt": "Figura bajando a sentadilla y volviendo a subir",
    "credit": {
      "author": "Quien la dibujó",
      "license": "CC BY-SA 4.0",
      "source": "https://..."
    }
  }
}
```

`credit` no es decorativo: `build.mjs` genera `CREDITS.md` a partir de esos campos, así
que la atribución se mantiene sola.

## Sobre el origen de los dibujos

Si vas a tirar de un dataset externo, comprueba la licencia **del material**, no la que
declare quien lo republica. Varios de los datasets de ejercicios más populares son
scrapes de material con copyright con una licencia permisiva puesta encima por un
intermediario, y eso no sanea nada. Lo que hay aquí son ilustraciones propias.

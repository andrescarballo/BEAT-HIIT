# Ilustraciones disponibles

> Generado por `node tools/gen-media.mjs --catalogo`. No editar a mano.

Hay **53** ilustraciones. Para usar una en un pack, copia su columna
`media.frames` tal cual dentro del ejercicio:

```jsonc
"mi-ejercicio": {
  "name": "Como lo quieras llamar",
  "media": { "frames": ["media/sentadillas-1.svg", "media/sentadillas-2.svg"],
             "alt": "De pie y bajando a sentadilla con la cadera atrás" }
}
```

El id de tu ejercicio puede ser otro: lo que se reutiliza es **la ruta del fichero**.
Un ejercicio sin `media` simplemente no enseña ilustración; no pasa nada más.

Falta alguna: se añade una pose en `tools/poses.mjs` y se ejecuta `npm run media`.
La versión legible por máquina, para dársela a un agente, es [`catalogo.json`](catalogo.json).

| Ejercicio | `media.frames` | Músculos | Material | Fotogramas |
| --- | --- | --- | --- | --- |
| Bicicleta abdominal | `media/bicicleta-abdominal-1.svg`, `media/bicicleta-abdominal-2.svg` | core | ninguno | 2 |
| Bird-dog | `media/bird-dog-1.svg`, `media/bird-dog-2.svg` | core, espalda | ninguno | 2 |
| Buenos días con mancuerna | `media/buenos-dias-con-mancuerna-1.svg`, `media/buenos-dias-con-mancuerna-2.svg` | femoral, gluteo, espalda | mancuernas | 2 |
| Burpees | `media/burpees-1.svg`, `media/burpees-2.svg` | fullbody | ninguno | 2 |
| Burpees sin salto | `media/burpees-sin-salto-1.svg`, `media/burpees-sin-salto-2.svg` | fullbody | ninguno | 2 |
| Crunch / russian twist | `media/crunch-russian-twist-1.svg`, `media/crunch-russian-twist-2.svg` | core | ninguno | 2 |
| Curl de bíceps | `media/curl-de-biceps-1.svg`, `media/curl-de-biceps-2.svg` | biceps | mancuernas | 2 |
| Dead bug | `media/dead-bug-1.svg`, `media/dead-bug-2.svg` | core | ninguno | 2 |
| Dominadas | `media/dominadas-1.svg`, `media/dominadas-2.svg` | espalda, biceps | barra | 2 |
| Elevación de gemelos | `media/elevacion-de-gemelos-1.svg`, `media/elevacion-de-gemelos-2.svg` | gemelo | ninguno | 2 |
| Elevación de piernas | `media/elevacion-de-piernas-1.svg`, `media/elevacion-de-piernas-2.svg` | core | ninguno | 2 |
| Escaladores cruzados | `media/escaladores-cruzados-1.svg`, `media/escaladores-cruzados-2.svg` | core | ninguno | 2 |
| Estiramiento de cuádriceps | `media/estiramiento-de-cuadriceps-1.svg` | — | ninguno | 1 |
| Estiramiento de espalda (gato) | `media/estiramiento-de-espalda-gato-1.svg`, `media/estiramiento-de-espalda-gato-2.svg` | — | ninguno | 2 |
| Estiramiento de femoral | `media/estiramiento-de-femoral-1.svg` | — | ninguno | 1 |
| Estiramiento de glúteo | `media/estiramiento-de-gluteo-1.svg` | — | ninguno | 1 |
| Estiramiento de pecho y hombros | `media/estiramiento-de-pecho-y-hombros-1.svg` | — | ninguno | 1 |
| Flexiones | `media/flexiones-1.svg`, `media/flexiones-2.svg` | pecho, triceps, hombro | ninguno | 2 |
| Fondos de tríceps | `media/fondos-de-triceps-1.svg`, `media/fondos-de-triceps-2.svg` | triceps | silla | 2 |
| Hip thrust | `media/hip-thrust-1.svg`, `media/hip-thrust-2.svg` | gluteo, femoral | mancuernas, silla | 2 |
| Hollow hold | `media/hollow-hold-1.svg` | core | ninguno | 1 |
| Jumping jacks suaves | `media/jumping-jacks-suaves-1.svg`, `media/jumping-jacks-suaves-2.svg` | — | ninguno | 2 |
| Marcha en el sitio | `media/marcha-en-el-sitio-1.svg`, `media/marcha-en-el-sitio-2.svg` | fullbody | ninguno | 2 |
| Mountain climbers | `media/mountain-climbers-1.svg`, `media/mountain-climbers-2.svg` | core, fullbody | ninguno | 2 |
| Movilidad de cadera | `media/movilidad-de-cadera-1.svg`, `media/movilidad-de-cadera-2.svg` | — | ninguno | 2 |
| Movilidad de hombros | `media/movilidad-de-hombros-1.svg`, `media/movilidad-de-hombros-2.svg` | — | ninguno | 2 |
| Pájaro (apertura inversa) | `media/pajaro-apertura-inversa-1.svg`, `media/pajaro-apertura-inversa-2.svg` | espalda, hombro | mancuernas | 2 |
| Patada de glúteo | `media/patada-de-gluteo-1.svg`, `media/patada-de-gluteo-2.svg` | gluteo | ninguno | 2 |
| Peso muerto rumano | `media/peso-muerto-rumano-1.svg`, `media/peso-muerto-rumano-2.svg` | femoral, gluteo, espalda | mancuernas | 2 |
| Plancha | `media/plancha-1.svg` | core | ninguno | 1 |
| Plancha con toque de hombro | `media/plancha-con-toque-de-hombro-1.svg`, `media/plancha-con-toque-de-hombro-2.svg` | core, hombro | ninguno | 2 |
| Plancha lateral | `media/plancha-lateral-1.svg` | core | ninguno | 1 |
| Press Arnold | `media/press-arnold-1.svg`, `media/press-arnold-2.svg` | hombro, triceps | mancuernas | 2 |
| Press de hombros | `media/press-de-hombros-1.svg`, `media/press-de-hombros-2.svg` | hombro, triceps | mancuernas | 2 |
| Puente a una pierna | `media/puente-a-una-pierna-1.svg`, `media/puente-a-una-pierna-2.svg` | gluteo, femoral | ninguno | 2 |
| Puente de glúteo | `media/puente-de-gluteo-1.svg`, `media/puente-de-gluteo-2.svg` | gluteo, femoral | ninguno | 2 |
| Remo con banda | `media/remo-con-banda-1.svg`, `media/remo-con-banda-2.svg` | espalda, biceps | banda | 2 |
| Remo con mancuerna | `media/remo-con-mancuerna-1.svg`, `media/remo-con-mancuerna-2.svg` | espalda, biceps | mancuernas, silla | 2 |
| Remo renegado | `media/remo-renegado-1.svg`, `media/remo-renegado-2.svg` | espalda, core, biceps | mancuernas | 2 |
| Respiración final | `media/respiracion-final-1.svg` | — | ninguno | 1 |
| Rodillas arriba | `media/rodillas-arriba-1.svg`, `media/rodillas-arriba-2.svg` | fullbody | ninguno | 2 |
| Rotaciones de tronco | `media/rotaciones-de-tronco-1.svg`, `media/rotaciones-de-tronco-2.svg` | — | ninguno | 2 |
| Saltos de patinador | `media/saltos-de-patinador-1.svg`, `media/saltos-de-patinador-2.svg` | cuadriceps, gluteo | ninguno | 2 |
| Sentadilla búlgara | `media/sentadilla-bulgara-1.svg`, `media/sentadilla-bulgara-2.svg` | cuadriceps, gluteo | silla | 2 |
| Sentadilla con salto | `media/sentadilla-con-salto-1.svg`, `media/sentadilla-con-salto-2.svg` | cuadriceps, gluteo | ninguno | 2 |
| Sentadillas | `media/sentadillas-1.svg`, `media/sentadillas-2.svg` | cuadriceps, gluteo | ninguno | 2 |
| Sentadillas sin peso | `media/sentadillas-sin-peso-1.svg`, `media/sentadillas-sin-peso-2.svg` | — | ninguno | 2 |
| Superman | `media/superman-1.svg`, `media/superman-2.svg` | espalda, gluteo | ninguno | 2 |
| Swing con mancuerna | `media/swing-con-mancuerna-1.svg`, `media/swing-con-mancuerna-2.svg` | gluteo, femoral, espalda | mancuernas | 2 |
| Thrusters | `media/thrusters-1.svg`, `media/thrusters-2.svg` | cuadriceps, gluteo, hombro | mancuernas | 2 |
| Zancada lateral | `media/zancada-lateral-1.svg`, `media/zancada-lateral-2.svg` | cuadriceps, gluteo, aductor | ninguno | 2 |
| Zancadas | `media/zancadas-1.svg`, `media/zancadas-2.svg` | cuadriceps, gluteo | ninguno | 2 |
| Zancadas con salto | `media/zancadas-con-salto-1.svg`, `media/zancadas-con-salto-2.svg` | cuadriceps, gluteo | ninguno | 2 |

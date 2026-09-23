// Poses: uno o dos fotogramas por ejercicio. Clave = id del ejercicio en el pack.
//
// Referencia de pie (perfil mirando a la derecha):
//   cabeza [98,34] r12 · cuello y=48 · hombro y=57 · cadera y=102 · rodilla y=140 · tobillo y=176
// Muslo ~38, tibia ~36, brazo 26+26, tronco ~54.
//
// El SUELO se coloca solo bajo el punto más bajo (ver groundFor en rig.mjs): no hay que
// ponerlo. `ground: false` para los ejercicios en los que no se toca el suelo.
// Un solo fotograma = postura estática (isométricos): la app la deja fija, sin fundido.

import { bar, chair, dumbbell, band, mirror } from './rig.mjs';

export const POSES = {
  /* ---------------- sentadillas ---------------- */
  sentadillas: {
    alt: 'De pie y bajando a sentadilla con la cadera atrás',
    frames: [
      { head: [98, 34], spine: [[98, 48], [100, 102]],
        arm: [[101, 58], [103, 82], [104, 106]], armFar: [[96, 58], [94, 82], [93, 106]],
        leg: [[100, 102], [102, 140], [101, 176], [112, 178]],
        legFar: [[100, 102], [96, 140], [95, 176], [85, 178]] },
      { head: [112, 62], spine: [[110, 76], [86, 124]],
        arm: [[108, 84], [128, 92], [146, 94]], armFar: [[106, 86], [124, 96], [141, 99]],
        leg: [[86, 124], [112, 148], [102, 176], [113, 178]],
        legFar: [[86, 124], [106, 150], [96, 176], [86, 178]] },
    ],
  },

  /* ---------------- flexiones ---------------- */
  flexiones: {
    alt: 'Flexión de brazos: arriba con los brazos estirados y abajo con los codos doblados',
    frames: [
      { head: [148, 112], spine: [[136, 118], [78, 138]],
        arm: [[132, 120], [134, 143], [136, 166]], armFar: [[129, 122], [131, 145], [133, 168]],
        leg: [[78, 138], [56, 152], [34, 166]], legFar: [[78, 140], [54, 154], [32, 168]] },
      { head: [150, 138], spine: [[138, 143], [80, 153]],
        arm: [[134, 145], [156, 156], [136, 166]], armFar: [[131, 147], [153, 158], [133, 168]],
        leg: [[80, 153], [57, 160], [34, 166]], legFar: [[80, 155], [55, 162], [32, 168]] },
    ],
  },

  /* ---------------- plancha (isométrico: un solo fotograma) ---------------- */
  plancha: {
    alt: 'Plancha sobre antebrazos, cuerpo recto de la cabeza a los talones',
    frames: [
      { head: [148, 122], spine: [[136, 128], [78, 146]],
        arm: [[132, 130], [134, 166], [158, 166]], armFar: [[129, 132], [131, 168], [155, 168]],
        leg: [[78, 146], [56, 156], [34, 166]], legFar: [[78, 148], [54, 158], [32, 168]] },
    ],
  },

  /* ---------------- dominadas ---------------- */
  dominadas: {
    alt: 'Dominada: colgado de la barra con los brazos estirados y subiendo hasta la barbilla',
    ground: false,
    frames: [
      { head: [100, 62], spine: [[100, 76], [100, 130]],
        arm: [[100, 84], [92, 58], [86, 30]], armFar: [[100, 84], [110, 58], [116, 30]],
        leg: [[100, 130], [98, 164], [110, 174]], legFar: [[100, 130], [106, 164], [118, 172]],
        behind: bar(26, 70, 132) },
      { head: [100, 42], spine: [[100, 56], [100, 110]],
        arm: [[100, 64], [80, 46], [86, 30]], armFar: [[100, 64], [120, 46], [116, 30]],
        leg: [[100, 110], [96, 144], [110, 154]], legFar: [[100, 110], [104, 144], [118, 152]],
        behind: bar(26, 70, 132) },
    ],
  },

  /* ---------------- zancadas ---------------- */
  zancadas: {
    alt: 'Zancada: de pie y bajando la rodilla de atrás hacia el suelo',
    frames: [
      { head: [98, 34], spine: [[98, 48], [100, 102]],
        arm: [[101, 58], [103, 82], [104, 106]], armFar: [[96, 58], [94, 82], [93, 106]],
        leg: [[100, 102], [102, 140], [101, 176], [112, 178]],
        legFar: [[100, 102], [96, 140], [95, 176], [85, 178]] },
      { head: [98, 46], spine: [[98, 60], [100, 114]],
        arm: [[101, 68], [108, 88], [110, 108]], armFar: [[96, 68], [89, 88], [87, 108]],
        leg: [[100, 114], [126, 146], [124, 176], [135, 178]],
        legFar: [[100, 114], [72, 160], [62, 176], [72, 178]] },
    ],
  },

  /* ---------------- press de hombros (vista frontal) ---------------- */
  'press-de-hombros': {
    alt: 'Press de hombros con mancuernas: de la altura de los hombros a los brazos estirados',
    frames: [
      { head: [100, 34], spine: [[100, 48], [100, 104]],
        arm: [[112, 58], [128, 70], [126, 50]], armFar: [[88, 58], [72, 70], [74, 50]],
        leg: [[100, 104], [112, 140], [112, 176], [120, 178]],
        legFar: [[100, 104], [88, 140], [88, 176], [80, 178]],
        front: dumbbell([126, 50]) + dumbbell([74, 50]) },
      { head: [100, 34], spine: [[100, 48], [100, 104]],
        arm: [[112, 58], [122, 38], [120, 16]], armFar: [[88, 58], [78, 38], [80, 16]],
        leg: [[100, 104], [112, 140], [112, 176], [120, 178]],
        legFar: [[100, 104], [88, 140], [88, 176], [80, 178]],
        front: dumbbell([120, 16]) + dumbbell([80, 16]) },
    ],
  },

  /* ---------------- burpees ---------------- */
  burpees: {
    alt: 'Burpee: salto con los brazos arriba y plancha abajo',
    frames: [
      { head: [100, 38], spine: [[100, 52], [100, 104]],
        arm: [[110, 60], [130, 46], [136, 24]], armFar: [[90, 60], [70, 46], [64, 24]],
        leg: [[100, 104], [112, 134], [108, 160]], legFar: [[100, 104], [88, 134], [92, 160]] },
      { head: [148, 118], spine: [[136, 124], [78, 142]],
        arm: [[132, 126], [134, 148], [136, 170]], armFar: [[129, 128], [131, 150], [133, 172]],
        leg: [[78, 142], [56, 156], [34, 170]], legFar: [[78, 144], [54, 158], [32, 172]] },
    ],
  },

  /* ---------------- puente de glúteo ---------------- */
  'puente-de-gluteo': {
    alt: 'Puente de glúteo: tumbado con la cadera en el suelo y subiéndola hasta alinear el cuerpo',
    frames: [
      { head: [48, 158], spine: [[62, 164], [114, 170]],
        arm: [[64, 172], [88, 175], [112, 176]],
        leg: [[114, 170], [144, 146], [150, 176]], legFar: [[114, 172], [141, 151], [147, 178]] },
      { head: [48, 158], spine: [[62, 162], [116, 136]],
        arm: [[64, 172], [88, 175], [112, 176]],
        leg: [[116, 136], [146, 140], [150, 176]], legFar: [[116, 138], [143, 145], [147, 178]] },
    ],
  },
};

/* =====================================================================
   Resto del pack. Bases reutilizables + una entrada por ejercicio.
   ===================================================================== */

// De pie, de perfil mirando a la derecha.
const STAND = {
  head: [98, 34], spine: [[98, 48], [100, 102]],
  arm: [[101, 58], [103, 82], [104, 106]], armFar: [[96, 58], [94, 82], [93, 106]],
  leg: [[100, 102], [102, 140], [101, 176], [112, 178]],
  legFar: [[100, 102], [96, 140], [95, 176], [85, 178]],
};

// De pie, de frente.
const FRONT = {
  head: [100, 34], spine: [[100, 48], [100, 104]],
  arm: [[112, 58], [118, 80], [120, 104]], armFar: [[88, 58], [82, 80], [80, 104]],
  leg: [[100, 104], [112, 140], [112, 176], [120, 178]],
  legFar: [[100, 104], [88, 140], [88, 176], [80, 178]],
};

// A cuatro patas, mirando a la derecha.
const QUAD = {
  head: [146, 112], spine: [[134, 118], [80, 126]],
  arm: [[130, 120], [132, 146], [134, 172]], armFar: [[127, 122], [129, 148], [131, 174]],
  leg: [[80, 126], [80, 150], [80, 172], [60, 176]],
  legFar: [[80, 128], [77, 152], [77, 174], [57, 178]],
};

// Tumbado boca arriba, cabeza a la izquierda.
const SUPINE = {
  head: [48, 158], spine: [[62, 162], [114, 168]],
  arm: [[64, 172], [88, 175], [112, 176]],
};

// Plancha alta (apoyo en manos), mirando a la derecha.
const PLANK = {
  head: [148, 118], spine: [[136, 124], [78, 142]],
  arm: [[132, 126], [134, 148], [136, 170]], armFar: [[129, 128], [131, 150], [133, 172]],
  leg: [[78, 142], [56, 156], [34, 170]], legFar: [[78, 144], [54, 158], [32, 172]],
};

// Bases de los ejercicios que alternan lado: se define uno y el otro es su espejo.
const RUN_KNEE = { ...FRONT,
  arm: [[112, 58], [124, 78], [128, 100]], armFar: [[88, 58], [76, 76], [94, 66]],
  leg: [[100, 104], [122, 122], [114, 148]], legFar: [[100, 104], [88, 140], [88, 176], [80, 178]] };

const MARCH = { ...FRONT,
  arm: [[112, 58], [122, 78], [126, 98]], armFar: [[88, 58], [78, 78], [94, 70]],
  leg: [[100, 104], [118, 130], [112, 156]], legFar: [[100, 104], [88, 140], [88, 176], [80, 178]] };

const SKATER = { head: [110, 42], spine: [[108, 56], [100, 108]],
  arm: [[105, 64], [124, 76], [138, 68]], armFar: [[102, 64], [82, 74], [66, 66]],
  leg: [[100, 108], [116, 142], [120, 176], [130, 178]],
  legFar: [[100, 110], [84, 138], [64, 164]] };

const TWIST = { ...FRONT,
  arm: [[112, 58], [136, 64], [158, 62]], armFar: [[88, 58], [72, 70], [56, 76]],
  leg: [[100, 104], [110, 140], [110, 176], [118, 178]],
  legFar: [[100, 104], [90, 140], [90, 176], [82, 178]] };

Object.assign(POSES, {

  /* ---------- piernas ---------- */
  'sentadillas-sin-peso': {
    alt: 'Sentadilla sin peso: de pie y abajo, a ritmo suave',
    frames: POSES.sentadillas.frames,
  },

  'sentadilla-con-salto': {
    alt: 'Sentadilla con salto: abajo y despegando del suelo',
    frames: [
      { head: [110, 64], spine: [[108, 78], [86, 124]],
        arm: [[106, 86], [92, 104], [78, 118]], armFar: [[104, 88], [90, 106], [76, 120]],
        leg: [[86, 124], [112, 148], [102, 176], [113, 178]],
        legFar: [[86, 124], [106, 150], [96, 176], [86, 178]] },
      { head: [100, 24], spine: [[100, 38], [100, 90]],
        arm: [[110, 46], [126, 34], [138, 20]], armFar: [[90, 46], [74, 34], [62, 20]],
        leg: [[100, 90], [104, 122], [104, 150], [114, 154]],
        legFar: [[100, 90], [96, 122], [96, 150], [86, 154]] },
    ],
  },

  'sentadilla-bulgara': {
    alt: 'Sentadilla búlgara: pie de atrás apoyado en una silla, bajando la rodilla',
    frames: [
      { head: [122, 40], spine: [[122, 54], [124, 108]],
        arm: [[125, 64], [127, 88], [128, 112]], armFar: [[120, 64], [118, 88], [117, 112]],
        leg: [[124, 108], [126, 142], [126, 176], [137, 178]],
        legFar: [[124, 110], [98, 136], [72, 148]],
        behind: chair(34, 150, 40, 28) },
      { head: [122, 62], spine: [[122, 76], [124, 130]],
        arm: [[125, 86], [127, 110], [128, 134]], armFar: [[120, 86], [118, 110], [117, 134]],
        leg: [[124, 130], [136, 156], [126, 176], [137, 178]],
        legFar: [[124, 132], [96, 150], [72, 148]],
        behind: chair(34, 150, 40, 28) },
    ],
  },

  'zancadas-con-salto': {
    alt: 'Zancada con salto: abajo y cambio de pierna en el aire',
    frames: [
      { head: [98, 46], spine: [[98, 60], [100, 114]],
        arm: [[101, 68], [108, 88], [110, 108]], armFar: [[96, 68], [89, 88], [87, 108]],
        leg: [[100, 114], [126, 146], [124, 176], [135, 178]],
        legFar: [[100, 114], [72, 160], [62, 176], [72, 178]] },
      { head: [98, 28], spine: [[98, 42], [100, 96]],
        arm: [[101, 50], [116, 66], [124, 84]], armFar: [[96, 50], [80, 66], [72, 84]],
        leg: [[100, 96], [124, 118], [130, 144]],
        legFar: [[100, 96], [78, 126], [68, 150]] },
    ],
  },

  'zancada-lateral': {
    alt: 'Zancada lateral: de pie y cargando el peso en una pierna doblada',
    frames: [
      { ...FRONT },
      { head: [100, 46], spine: [[100, 60], [100, 112]],
        arm: [[112, 70], [124, 84], [134, 96]], armFar: [[88, 70], [76, 84], [66, 96]],
        leg: [[100, 112], [138, 146], [142, 176], [152, 178]],
        legFar: [[100, 112], [72, 148], [54, 176], [44, 178]] },
    ],
  },

  'elevacion-de-gemelos': {
    alt: 'Elevación de gemelos: talones en el suelo y subiendo de puntillas',
    frames: [
      { ...STAND, leg: [[100, 102], [102, 140], [100, 170], [120, 176]],
        legFar: [[100, 102], [96, 140], [94, 170], [114, 178]] },
      { head: [98, 18], spine: [[98, 32], [100, 86]],
        arm: [[101, 42], [103, 66], [104, 90]], armFar: [[96, 42], [94, 66], [93, 90]],
        leg: [[100, 86], [102, 124], [104, 154], [120, 176]],
        legFar: [[100, 86], [96, 124], [98, 154], [114, 178]] },
    ],
  },

  'peso-muerto-rumano': {
    alt: 'Peso muerto rumano: de pie y bisagra de cadera con la espalda recta',
    frames: [
      { ...STAND,
        arm: [[101, 58], [103, 82], [104, 108]], armFar: [[96, 58], [94, 82], [93, 108]],
        front: dumbbell([104, 108], 90) + dumbbell([93, 108], 90) },
      { head: [72, 74], spine: [[84, 80], [124, 108]],
        arm: [[86, 86], [88, 110], [90, 136]], armFar: [[83, 88], [85, 112], [87, 138]],
        leg: [[124, 108], [126, 142], [124, 176], [135, 178]],
        legFar: [[124, 110], [120, 142], [118, 176], [108, 178]],
        front: dumbbell([90, 136], 90) + dumbbell([87, 138], 90) },
    ],
  },

  'buenos-dias-con-mancuerna': {
    alt: 'Buenos días: bisagra de cadera con la mancuerna sujeta en el pecho',
    frames: [
      { ...STAND,
        arm: [[101, 58], [112, 74], [102, 68]], armFar: [[96, 58], [85, 74], [95, 68]],
        front: dumbbell([99, 66], 0, 30) },
      { head: [70, 80], spine: [[82, 86], [124, 110]],
        arm: [[84, 92], [96, 100], [88, 90]], armFar: [[81, 94], [93, 102], [85, 92]],
        leg: [[124, 110], [126, 142], [124, 176], [135, 178]],
        legFar: [[124, 112], [120, 142], [118, 176], [108, 178]],
        front: dumbbell([86, 92], 30, 28) },
    ],
  },

  /* ---------- glúteo y cadena posterior ---------- */
  'puente-a-una-pierna': {
    alt: 'Puente a una pierna: una pierna estirada mientras sube la cadera',
    frames: [
      { ...SUPINE, spine: [[62, 164], [114, 170]],
        leg: [[114, 170], [144, 146], [150, 176]],
        legFar: [[114, 172], [140, 160], [168, 152]] },
      { ...SUPINE, spine: [[62, 162], [116, 136]],
        leg: [[116, 136], [146, 140], [150, 176]],
        legFar: [[116, 138], [144, 126], [172, 116]] },
    ],
  },

  'hip-thrust': {
    alt: 'Hip thrust: espalda apoyada en la silla, subiendo la cadera hasta alinear el cuerpo',
    frames: [
      { head: [44, 130], spine: [[58, 136], [112, 168]],
        arm: [[60, 140], [78, 132], [96, 128]],
        leg: [[112, 168], [142, 146], [148, 176]], legFar: [[112, 170], [139, 151], [145, 178]],
        behind: chair(30, 140, 40, 36), front: dumbbell([112, 162], 0, 26) },
      { head: [44, 130], spine: [[58, 136], [114, 140]],
        arm: [[60, 140], [78, 132], [96, 128]],
        leg: [[114, 140], [144, 142], [148, 176]], legFar: [[114, 142], [141, 147], [145, 178]],
        behind: chair(30, 140, 40, 36), front: dumbbell([114, 134], 0, 26) },
    ],
  },

  'patada-de-gluteo': {
    alt: 'Patada de glúteo: a cuatro patas, llevando una pierna atrás y arriba',
    frames: [
      { ...QUAD },
      { ...QUAD, leg: [[80, 126], [54, 118], [30, 112]] },
    ],
  },

  superman: {
    alt: 'Superman: boca abajo, despegando brazos y piernas del suelo',
    frames: [
      { head: [148, 160], spine: [[136, 164], [80, 168]],
        arm: [[132, 166], [150, 170], [168, 172]], armFar: [[132, 168], [150, 172], [168, 174]],
        leg: [[80, 168], [58, 171], [36, 174]], legFar: [[80, 170], [58, 173], [36, 176]] },
      { head: [150, 142], spine: [[138, 148], [80, 164]],
        arm: [[134, 150], [152, 142], [170, 136]], armFar: [[134, 152], [152, 144], [170, 138]],
        leg: [[80, 164], [58, 156], [36, 148]], legFar: [[80, 166], [58, 158], [36, 150]] },
    ],
  },

  /* ---------- core ---------- */
  'plancha-lateral': {
    alt: 'Plancha lateral: apoyo en un antebrazo, cuerpo recto y cadera arriba',
    frames: [
      { head: [150, 112], spine: [[138, 120], [86, 150]],
        arm: [[134, 124], [133, 148], [132, 172]], armFar: [[134, 118], [135, 96], [136, 74]],
        leg: [[86, 150], [61, 162], [36, 174]], legFar: [[86, 152], [61, 164], [36, 176]] },
    ],
  },

  'plancha-con-toque-de-hombro': {
    alt: 'Plancha tocando el hombro contrario con la mano, sin mover la cadera',
    frames: [
      { ...PLANK },
      { ...PLANK, arm: [[132, 126], [122, 144], [114, 128]] },
    ],
  },

  'hollow-hold': {
    alt: 'Hollow hold: lumbar pegada al suelo, hombros y piernas despegados',
    frames: [
      { head: [56, 124], spine: [[68, 136], [116, 164]],
        arm: [[70, 136], [50, 122], [32, 110]], armFar: [[70, 138], [50, 124], [32, 112]],
        leg: [[116, 164], [148, 148], [178, 132]], legFar: [[116, 166], [148, 150], [178, 134]] },
    ],
  },

  'dead-bug': {
    alt: 'Dead bug: brazo y pierna contrarios se estiran mientras la lumbar no se mueve',
    frames: [
      { ...SUPINE, spine: [[62, 166], [114, 172]],
        arm: [[66, 164], [60, 136], [56, 106]], armFar: [[64, 170], [42, 174], [20, 176]],
        leg: [[114, 172], [122, 140], [150, 134]], legFar: [[114, 174], [144, 177], [176, 178]] },
      { ...SUPINE, spine: [[62, 166], [114, 172]],
        arm: [[64, 170], [42, 174], [20, 176]], armFar: [[66, 164], [60, 136], [56, 106]],
        leg: [[114, 174], [144, 177], [176, 178]], legFar: [[114, 172], [122, 140], [150, 134]] },
    ],
  },

  'bird-dog': {
    alt: 'Bird-dog: a cuatro patas, brazo y pierna contrarios estirados',
    frames: [
      { ...QUAD,
        arm: [[130, 120], [150, 114], [170, 110]], armFar: [[127, 122], [129, 148], [131, 174]],
        leg: [[80, 126], [80, 150], [80, 172], [60, 176]],
        legFar: [[80, 128], [56, 122], [32, 118]] },
      { ...QUAD,
        arm: [[130, 120], [132, 146], [134, 172]], armFar: [[127, 122], [147, 116], [167, 112]],
        leg: [[80, 126], [56, 120], [32, 116]],
        legFar: [[80, 128], [78, 152], [78, 174], [58, 178]] },
    ],
  },

  'crunch-russian-twist': {
    alt: 'Crunch: despegar los hombros del suelo sin tirar del cuello',
    frames: [
      { ...SUPINE, spine: [[64, 162], [114, 170]],
        arm: [[66, 162], [54, 150], [46, 138]], armFar: [[66, 164], [54, 152], [46, 140]],
        leg: [[114, 170], [142, 148], [150, 176]], legFar: [[114, 172], [139, 153], [147, 178]] },
      { head: [66, 136], spine: [[78, 144], [114, 170]],
        arm: [[80, 144], [68, 132], [60, 122]], armFar: [[80, 146], [68, 134], [60, 124]],
        leg: [[114, 170], [142, 148], [150, 176]], legFar: [[114, 172], [139, 153], [147, 178]] },
    ],
  },

  'bicicleta-abdominal': {
    alt: 'Bicicleta: codo hacia la rodilla contraria, alternando',
    frames: [
      { head: [72, 144], spine: [[84, 152], [118, 170]],
        arm: [[86, 152], [100, 142], [114, 148]], armFar: [[86, 154], [66, 144], [50, 138]],
        leg: [[118, 170], [126, 138], [154, 132]], legFar: [[118, 172], [148, 176], [178, 178]] },
      { head: [72, 144], spine: [[84, 152], [118, 170]],
        arm: [[86, 154], [66, 144], [50, 138]], armFar: [[86, 152], [100, 142], [114, 148]],
        leg: [[118, 172], [148, 176], [178, 178]], legFar: [[118, 170], [126, 138], [154, 132]] },
    ],
  },

  'elevacion-de-piernas': {
    alt: 'Elevación de piernas: de tumbado a piernas arriba, sin arquear la lumbar',
    frames: [
      { ...SUPINE, spine: [[62, 166], [114, 172]],
        arm: [[64, 176], [88, 178], [112, 178]],
        leg: [[114, 172], [142, 174], [170, 176]], legFar: [[114, 174], [142, 176], [170, 178]] },
      { ...SUPINE, spine: [[62, 166], [114, 172]],
        arm: [[64, 176], [88, 178], [112, 178]],
        leg: [[114, 172], [124, 142], [132, 112]], legFar: [[114, 174], [127, 144], [135, 114]] },
    ],
  },

  /* ---------- empuje y tirón ---------- */
  'remo-con-mancuerna': {
    alt: 'Remo a una mano: tronco inclinado y codo que sube pegado al cuerpo',
    frames: [
      { head: [70, 82], spine: [[82, 88], [124, 114]],
        arm: [[84, 94], [86, 118], [88, 144]], armFar: [[81, 96], [98, 116], [114, 134]],
        leg: [[124, 114], [126, 146], [124, 176], [135, 178]],
        legFar: [[124, 116], [120, 146], [118, 176], [108, 178]],
        behind: chair(106, 134, 40, 42), front: dumbbell([88, 144], 90) },
      { head: [70, 82], spine: [[82, 88], [124, 114]],
        arm: [[84, 94], [80, 118], [90, 108]], armFar: [[81, 96], [98, 116], [114, 134]],
        leg: [[124, 114], [126, 146], [124, 176], [135, 178]],
        legFar: [[124, 116], [120, 146], [118, 176], [108, 178]],
        behind: chair(106, 134, 40, 42), front: dumbbell([90, 108], 90) },
    ],
  },

  'remo-renegado': {
    alt: 'Remo renegado: en plancha, sube una mancuerna sin girar la cadera',
    frames: [
      { ...PLANK, front: dumbbell([136, 170], 0) + dumbbell([133, 172], 0) },
      { ...PLANK, arm: [[132, 126], [146, 142], [138, 146]],
        front: dumbbell([138, 146], 0) + dumbbell([133, 172], 0) },
    ],
  },

  'remo-con-banda': {
    alt: 'Remo con banda: brazos estirados y tirando de la banda hasta las costillas',
    frames: [
      { ...FRONT, arm: [[112, 58], [124, 68], [138, 76]], armFar: [[88, 58], [76, 68], [62, 76]],
        front: band([138, 76], [62, 76], 26) },
      { ...FRONT, arm: [[112, 58], [128, 76], [114, 84]], armFar: [[88, 58], [72, 76], [86, 84]],
        front: band([114, 84], [86, 84], 14) },
    ],
  },

  'pajaro-apertura-inversa': {
    alt: 'Pájaro: tronco inclinado y brazos que se abren hacia los lados',
    frames: [
      { head: [70, 82], spine: [[82, 88], [124, 114]],
        arm: [[84, 94], [84, 118], [84, 142]], armFar: [[81, 96], [81, 120], [81, 144]],
        leg: [[124, 114], [126, 146], [124, 176], [135, 178]],
        legFar: [[124, 116], [120, 146], [118, 176], [108, 178]],
        front: dumbbell([84, 142], 90) + dumbbell([81, 144], 90) },
      { head: [70, 82], spine: [[82, 88], [124, 114]],
        arm: [[84, 94], [104, 102], [124, 106]], armFar: [[81, 96], [61, 104], [41, 108]],
        leg: [[124, 114], [126, 146], [124, 176], [135, 178]],
        legFar: [[124, 116], [120, 146], [118, 176], [108, 178]],
        front: dumbbell([124, 106], 90) + dumbbell([41, 108], 90) },
    ],
  },

  'press-arnold': {
    alt: 'Press Arnold: palmas hacia la cara y giro hasta los brazos estirados',
    frames: [
      { ...FRONT, arm: [[112, 58], [118, 78], [112, 56]], armFar: [[88, 58], [82, 78], [88, 56]],
        front: dumbbell([112, 56], 90) + dumbbell([88, 56], 90) },
      { ...FRONT, arm: [[112, 58], [122, 38], [120, 16]], armFar: [[88, 58], [78, 38], [80, 16]],
        front: dumbbell([120, 16]) + dumbbell([80, 16]) },
    ],
  },

  'curl-de-biceps': {
    alt: 'Curl de bíceps: brazos estirados y flexión sin mover el codo',
    frames: [
      { ...FRONT, arm: [[112, 58], [118, 80], [120, 104]], armFar: [[88, 58], [82, 80], [80, 104]],
        front: dumbbell([120, 104]) + dumbbell([80, 104]) },
      { ...FRONT, arm: [[112, 58], [120, 82], [116, 58]], armFar: [[88, 58], [80, 82], [84, 58]],
        front: dumbbell([116, 58]) + dumbbell([84, 58]) },
    ],
  },

  'fondos-de-triceps': {
    alt: 'Fondos de tríceps: manos en la silla, bajando y subiendo con los codos atrás',
    frames: [
      { head: [86, 74], spine: [[88, 88], [96, 138]],
        arm: [[90, 94], [106, 114], [122, 134]], armFar: [[87, 96], [103, 116], [119, 136]],
        leg: [[96, 138], [66, 152], [40, 166]], legFar: [[96, 140], [64, 154], [38, 168]],
        behind: chair(112, 134, 42, 40) },
      { head: [86, 100], spine: [[88, 114], [96, 158]],
        arm: [[90, 120], [112, 128], [122, 134]], armFar: [[87, 122], [109, 130], [119, 136]],
        leg: [[96, 158], [66, 162], [40, 166]], legFar: [[96, 160], [64, 164], [38, 168]],
        behind: chair(112, 134, 42, 40) },
    ],
  },

  /* ---------- full body y cardio ---------- */
  thrusters: {
    alt: 'Thruster: sentadilla con las mancuernas en los hombros y press al subir',
    frames: [
      { head: [100, 58], spine: [[100, 72], [100, 120]],
        arm: [[110, 80], [124, 92], [116, 70]], armFar: [[90, 80], [76, 92], [84, 70]],
        leg: [[100, 120], [126, 144], [120, 176], [130, 178]],
        legFar: [[100, 120], [74, 144], [80, 176], [70, 178]],
        front: dumbbell([116, 70], 90) + dumbbell([84, 70], 90) },
      { ...FRONT, arm: [[112, 58], [122, 38], [120, 16]], armFar: [[88, 58], [78, 38], [80, 16]],
        front: dumbbell([120, 16]) + dumbbell([80, 16]) },
    ],
  },

  'burpees-sin-salto': {
    alt: 'Burpee sin salto: de pie a plancha y vuelta, sin despegar del suelo',
    frames: [
      { ...STAND },
      { ...PLANK },
    ],
  },

  'swing-con-mancuerna': {
    alt: 'Swing: bisagra de cadera con la mancuerna entre las piernas y empuje hasta el pecho',
    frames: [
      { head: [80, 72], spine: [[90, 80], [124, 114]],
        arm: [[92, 86], [98, 110], [104, 134]], armFar: [[89, 88], [95, 112], [101, 136]],
        leg: [[124, 114], [126, 146], [124, 176], [135, 178]],
        legFar: [[124, 116], [120, 146], [118, 176], [108, 178]],
        front: dumbbell([104, 134], 60) },
      { ...STAND, arm: [[101, 58], [112, 74], [128, 82]], armFar: [[96, 58], [107, 76], [123, 84]],
        front: dumbbell([128, 82], 60) },
    ],
  },

  'mountain-climbers': {
    alt: 'Mountain climbers: en plancha, rodillas al pecho alternando',
    frames: [
      { ...PLANK, leg: [[78, 142], [104, 152], [116, 164]], legFar: [[78, 144], [54, 158], [32, 172]] },
      { ...PLANK, leg: [[78, 144], [54, 158], [32, 172]], legFar: [[78, 142], [104, 152], [116, 164]] },
    ],
  },

  'escaladores-cruzados': {
    alt: 'Escaladores cruzados: la rodilla cruza hacia el codo contrario',
    frames: [
      { ...PLANK, leg: [[78, 142], [108, 140], [124, 146]], legFar: [[78, 144], [54, 158], [32, 172]] },
      { ...PLANK, leg: [[78, 144], [54, 158], [32, 172]], legFar: [[78, 142], [108, 140], [124, 146]] },
    ],
  },

  'rodillas-arriba': {
    alt: 'Rodillas arriba: carrera en el sitio llevando la rodilla a la altura de la cadera',
    frames: [
      RUN_KNEE,
      mirror(RUN_KNEE),
    ],
  },

  'marcha-en-el-sitio': {
    alt: 'Marcha en el sitio: rodillas a media altura, ritmo cómodo',
    frames: [
      MARCH,
      mirror(MARCH),
    ],
  },

  'saltos-de-patinador': {
    alt: 'Salto de patinador: caes en una pierna y la otra cruza por detrás',
    frames: [
      SKATER,
      mirror(SKATER),
    ],
  },

  'jumping-jacks-suaves': {
    alt: 'Jumping jacks suaves: pies juntos con brazos abajo y pies abiertos con brazos arriba',
    frames: [
      { ...FRONT, arm: [[112, 58], [114, 82], [112, 106]], armFar: [[88, 58], [86, 82], [88, 106]],
        leg: [[100, 104], [102, 140], [102, 176], [112, 178]],
        legFar: [[100, 104], [98, 140], [98, 176], [88, 178]] },
      { ...FRONT, arm: [[112, 58], [132, 42], [144, 24]], armFar: [[88, 58], [68, 42], [56, 24]],
        leg: [[100, 104], [126, 142], [138, 176], [148, 178]],
        legFar: [[100, 104], [74, 142], [62, 176], [52, 178]] },
    ],
  },

  /* ---------- movilidad ---------- */
  'movilidad-de-hombros': {
    alt: 'Movilidad de hombros: círculos amplios con los brazos',
    frames: [
      { ...FRONT, arm: [[112, 58], [134, 60], [156, 62]], armFar: [[88, 58], [66, 60], [44, 62]] },
      { ...FRONT, arm: [[112, 58], [128, 40], [140, 20]], armFar: [[88, 58], [72, 40], [60, 20]] },
    ],
  },

  'movilidad-de-cadera': {
    alt: 'Movilidad de cadera: rodilla arriba y círculo hacia fuera',
    frames: [
      { ...FRONT, arm: [[112, 58], [126, 70], [140, 74]], armFar: [[88, 58], [74, 70], [60, 74]],
        leg: [[100, 104], [120, 124], [114, 148]], legFar: [[100, 104], [88, 140], [88, 176], [80, 178]] },
      { ...FRONT, arm: [[112, 58], [126, 70], [140, 74]], armFar: [[88, 58], [74, 70], [60, 74]],
        leg: [[100, 104], [148, 116], [156, 142]], legFar: [[100, 104], [88, 140], [88, 176], [80, 178]] },
    ],
  },

  'rotaciones-de-tronco': {
    alt: 'Rotaciones de tronco: giro de cintura de lado a lado con los brazos sueltos',
    frames: [
      TWIST,
      mirror(TWIST),
    ],
  },

  /* ---------- estiramientos ---------- */
  'estiramiento-de-cuadriceps': {
    alt: 'Estiramiento de cuádriceps: talón al glúteo sujetando el pie',
    frames: [
      { head: [102, 34], spine: [[102, 48], [100, 102]],
        arm: [[104, 58], [106, 82], [107, 106]], armFar: [[99, 58], [97, 82], [96, 106]],
        leg: [[100, 102], [108, 146], [134, 116]],
        legFar: [[100, 104], [102, 140], [103, 176], [113, 178]] },
    ],
  },

  'estiramiento-de-femoral': {
    alt: 'Estiramiento de femoral: bisagra de cadera con las piernas estiradas',
    frames: [
      { head: [98, 134], spine: [[92, 146], [70, 168]],
        arm: [[90, 150], [116, 158], [142, 170]], armFar: [[88, 152], [114, 160], [140, 172]],
        leg: [[70, 168], [110, 172], [150, 174], [152, 164]],
        legFar: [[70, 170], [110, 174], [150, 176], [152, 166]] },
    ],
  },

  'estiramiento-de-pecho-y-hombros': {
    alt: 'Estiramiento de pecho: brazos atrás abriendo el pecho',
    frames: [
      { ...FRONT, arm: [[112, 58], [128, 78], [138, 100]], armFar: [[88, 58], [72, 78], [62, 100]] },
    ],
  },

  'estiramiento-de-espalda-gato': {
    alt: 'Gato: a cuatro patas, redondeando y arqueando la espalda',
    frames: [
      { ...QUAD, head: [146, 106], spine: [[134, 112], [106, 106], [80, 120]] },
      { ...QUAD, head: [148, 126], spine: [[136, 130], [106, 134], [80, 124]] },
    ],
  },

  'estiramiento-de-gluteo': {
    alt: 'Estiramiento de glúteo: tumbado, rodilla cruzada hacia el pecho',
    frames: [
      { ...SUPINE, spine: [[62, 164], [114, 170]],
        arm: [[64, 174], [88, 177], [110, 178]],
        leg: [[114, 170], [92, 132], [62, 128]], legFar: [[114, 172], [146, 174], [178, 176]] },
    ],
  },

  'respiracion-final': {
    alt: 'Respiración final: sentado, tranquilo, manos en las rodillas',
    frames: [
      { ...FRONT, arm: [[112, 58], [128, 80], [108, 96]], armFar: [[88, 58], [72, 80], [92, 96]] },
    ],
  },
});

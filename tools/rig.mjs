// Rig de figura para las ilustraciones de Beat.
//
// Una ilustración es una FIGURA articulada descrita por las coordenadas de sus
// articulaciones, no un dibujo. Retocar una postura es mover un punto; el estilo
// (grosor, color, remates) sale de aquí y es el mismo para todas por construcción.
//
// Lienzo 200x200. Suelo en y=182. La figura de pie mide ~158 px (≈6,5 cabezas).

export const IN = '#f2efe3';   // miembro cercano al espectador
export const FAR = '#75765f';  // miembro lejano: mismo trazo, menos peso -> profundidad
export const PROP = '#2a2c1f'; // suelo, barra, silla
export const ACC = '#ff7e33';  // mancuernas y banda: lo que llevas en las manos

const n = (v) => Math.round(v * 10) / 10;
const pts = (a) => a.map(([x, y]) => `${n(x)} ${n(y)}`).join(' L ');

const path = (a, stroke, w = 5) =>
  a && a.length > 1 ? `<path d="M ${pts(a)}" fill="none" stroke="${stroke}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>` : '';

const circle = (c, r, stroke, w = 5, fill = 'none') =>
  `<circle cx="${n(c[0])}" cy="${n(c[1])}" r="${n(r)}" fill="${fill}" stroke="${stroke}" stroke-width="${w}" vector-effect="non-scaling-stroke"/>`;

/* ---------- props ---------- */
// El suelo NO se pone a mano: lo calcula el generador a partir del punto más bajo de
// los dos fotogramas, para que la figura siempre se apoye en él y la línea no se mueva
// entre fotograma y fotograma.
export function groundFor(posesArr, drop = 4) {
  const all = posesArr.flatMap(points);
  if (!all.length) return '';
  const xs = all.map((p) => p[0]), ys = all.map((p) => p[1]);
  const y = Math.max(...ys) + drop;
  return floor(Math.min(...xs) - 16, Math.max(...xs) + 16, y);
}

export const floor = (x1 = 26, x2 = 174, y = 182) =>
  `<path d="M ${n(x1)} ${n(y)} L ${n(x2)} ${n(y)}" fill="none" stroke="${PROP}" stroke-width="5" stroke-linecap="round" vector-effect="non-scaling-stroke"/>`;

export const bar = (y = 26, x1 = 50, x2 = 150) =>
  `<path d="M ${n(x1)} ${n(y)} L ${n(x2)} ${n(y)}" fill="none" stroke="${PROP}" stroke-width="6" stroke-linecap="round" vector-effect="non-scaling-stroke"/>`;

// Silla / banco: asiento + dos patas.
export const chair = (x, y, w = 40, h = 34, dir = 1) => {
  const x2 = x + w * dir;
  return `<path d="M ${n(x)} ${n(y)} L ${n(x2)} ${n(y)} M ${n(x + 4 * dir)} ${n(y)} L ${n(x + 4 * dir)} ${n(y + h)} M ${n(x2 - 4 * dir)} ${n(y)} L ${n(x2 - 4 * dir)} ${n(y + h)}" fill="none" stroke="${PROP}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>`;
};

// Mancuerna: barrita corta perpendicular al antebrazo, centrada en la mano.
export const dumbbell = (at, ang = 0, len = 15) => {
  const r = (ang * Math.PI) / 180, dx = Math.cos(r) * len / 2, dy = Math.sin(r) * len / 2;
  return `<path d="M ${n(at[0] - dx)} ${n(at[1] - dy)} L ${n(at[0] + dx)} ${n(at[1] + dy)}" fill="none" stroke="${ACC}" stroke-width="7" stroke-linecap="round" vector-effect="non-scaling-stroke"/>`;
};

// Banda elástica: curva suave entre dos puntos.
export const band = (a, b, bow = 14) => {
  const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
  return `<path d="M ${n(a[0])} ${n(a[1])} Q ${n(mx)} ${n(my + bow)} ${n(b[0])} ${n(b[1])}" fill="none" stroke="${ACC}" stroke-width="4" stroke-linecap="round" vector-effect="non-scaling-stroke"/>`;
};

// Flechita de movimiento, para posturas donde el gesto no se lee solo.
export const arrow = (from, to) => {
  const a = Math.atan2(to[1] - from[1], to[0] - from[0]);
  const w = 6, s = 2.5;
  const p1 = [to[0] - w * Math.cos(a - s), to[1] - w * Math.sin(a - s)];
  const p2 = [to[0] - w * Math.cos(a + s), to[1] - w * Math.sin(a + s)];
  return `<path d="M ${n(from[0])} ${n(from[1])} L ${n(to[0])} ${n(to[1])} M ${n(p1[0])} ${n(p1[1])} L ${n(to[0])} ${n(to[1])} L ${n(p2[0])} ${n(p2[1])}" fill="none" stroke="${ACC}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>`;
};

/**
 * Dibuja la figura.
 *  head  [x,y]            centro de la cabeza
 *  r     radio de la cabeza (12 por defecto)
 *  spine [[x,y], ...]     de cuello a cadera (2 puntos = recto, 3 = espalda curvada)
 *  arm / leg              miembro cercano: [hombro|cadera, codo|rodilla, mano|tobillo, (punta)]
 *  armFar / legFar        miembro lejano; si falta, no se dibuja
 *  behind / front         SVG extra detrás y delante de la figura (props)
 */
export function figure({ head, r = 12, spine, arm, armFar, leg, legFar, behind = '', front = '' }, transform) {
  const neck = spine && spine[0];
  const body = [
    behind,
    path(armFar, FAR), path(legFar, FAR),
    head ? circle(head, r, IN) : '',
    // cuello: une cabeza y tronco sin que se vea el hueco
    head && neck ? path([head, neck], IN) : '',
    path(spine, IN),
    path(arm, IN), path(leg, IN),
    front,
  ].filter(Boolean).join('\n  ');
  return transform ? `<g transform="${transform}">\n  ${body}\n  </g>` : body;
}

// Puntos de la figura (sin props: los props acompañan, no mandan en el encuadre).
export function points({ head, r = 12, spine, arm, armFar, leg, legFar }) {
  const all = [].concat(spine || [], arm || [], armFar || [], leg || [], legFar || []);
  if (head) all.push([head[0] - r, head[1] - r], [head[0] + r, head[1] + r]);
  return all;
}

// Auto-encuadre COMÚN a los dos fotogramas: se mide la caja que los contiene a ambos
// y se aplica la misma transformación. Si cada uno se escalara por su cuenta, la
// figura pegaría un salto de tamaño en mitad del fundido.
export function fitPair(poses) {
  const all = poses.flatMap(points);
  if (!all.length) return null;
  const xs = all.map((p) => p[0]), ys = all.map((p) => p[1]);
  const pad = 5; // medio grosor de trazo, para que los remates no se corten
  const x0 = Math.min(...xs) - pad, x1 = Math.max(...xs) + pad;
  const y0 = Math.min(...ys) - pad, y1 = Math.max(...ys) + pad;
  const box = 184, off = (200 - box) / 2;
  const s = Math.min(box / (x1 - x0), box / (y1 - y0), 1.45); // tope: no agrandar de más
  const tx = off + (box - (x1 - x0) * s) / 2 - x0 * s;
  const ty = off + (box - (y1 - y0) * s) / 2 - y0 * s;
  return `translate(${n(tx)} ${n(ty)}) scale(${n(s)})`;
}

// Espejo horizontal: para los ejercicios de vista frontal que alternan lado
// (rodillas arriba, patinador, rotaciones…). El segundo fotograma es el primero del revés.
export function mirror(pose, axis = 100) {
  const m = (p) => p && p.map(([x, y]) => [2 * axis - x, y]);
  const out = { ...pose };
  if (pose.head) out.head = [2 * axis - pose.head[0], pose.head[1]];
  for (const k of ['spine', 'arm', 'armFar', 'leg', 'legFar']) if (pose[k]) out[k] = m(pose[k]);
  return out;
}

// Cambio de lado: intercambia miembro cercano y lejano. Para las vistas de perfil que
// alternan (escaladores, bird-dog): ahí no vale el espejo, que giraría todo el cuerpo.
export function swapSides(pose) {
  return { ...pose, arm: pose.armFar, armFar: pose.arm, leg: pose.legFar, legFar: pose.leg };
}

export function svg(inner, label) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" role="img" aria-label="${label.replace(/"/g, '&quot;')}">
  ${inner}
</svg>
`;
}

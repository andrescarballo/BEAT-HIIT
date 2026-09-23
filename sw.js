// Beat service worker — app shell sin conexion.
//
// La lista de assets y la version de cache las genera build.mjs a partir del contenido
// real que se sirve, asi que no hay que tocar nada a mano al publicar.

/* === ASSETS:START — generado por build.mjs. No editar a mano. === */
const CACHE = 'beat-5788992e46';
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png',
  './icon-maskable.png',
  './fonts/archivo-black-latin.woff2',
  './fonts/fraunces-latin.woff2',
  './fonts/spline-sans-mono-latin.woff2',
  './media/bicicleta-abdominal-1.svg',
  './media/bicicleta-abdominal-2.svg',
  './media/bird-dog-1.svg',
  './media/bird-dog-2.svg',
  './media/buenos-dias-con-mancuerna-1.svg',
  './media/buenos-dias-con-mancuerna-2.svg',
  './media/burpees-1.svg',
  './media/burpees-2.svg',
  './media/burpees-sin-salto-1.svg',
  './media/burpees-sin-salto-2.svg',
  './media/crunch-russian-twist-1.svg',
  './media/crunch-russian-twist-2.svg',
  './media/curl-de-biceps-1.svg',
  './media/curl-de-biceps-2.svg',
  './media/dead-bug-1.svg',
  './media/dead-bug-2.svg',
  './media/dominadas-1.svg',
  './media/dominadas-2.svg',
  './media/elevacion-de-gemelos-1.svg',
  './media/elevacion-de-gemelos-2.svg',
  './media/elevacion-de-piernas-1.svg',
  './media/elevacion-de-piernas-2.svg',
  './media/escaladores-cruzados-1.svg',
  './media/escaladores-cruzados-2.svg',
  './media/estiramiento-de-cuadriceps-1.svg',
  './media/estiramiento-de-espalda-gato-1.svg',
  './media/estiramiento-de-espalda-gato-2.svg',
  './media/estiramiento-de-femoral-1.svg',
  './media/estiramiento-de-gluteo-1.svg',
  './media/estiramiento-de-pecho-y-hombros-1.svg',
  './media/flexiones-1.svg',
  './media/flexiones-2.svg',
  './media/fondos-de-triceps-1.svg',
  './media/fondos-de-triceps-2.svg',
  './media/hip-thrust-1.svg',
  './media/hip-thrust-2.svg',
  './media/hollow-hold-1.svg',
  './media/jumping-jacks-suaves-1.svg',
  './media/jumping-jacks-suaves-2.svg',
  './media/marcha-en-el-sitio-1.svg',
  './media/marcha-en-el-sitio-2.svg',
  './media/mountain-climbers-1.svg',
  './media/mountain-climbers-2.svg',
  './media/movilidad-de-cadera-1.svg',
  './media/movilidad-de-cadera-2.svg',
  './media/movilidad-de-hombros-1.svg',
  './media/movilidad-de-hombros-2.svg',
  './media/pajaro-apertura-inversa-1.svg',
  './media/pajaro-apertura-inversa-2.svg',
  './media/patada-de-gluteo-1.svg',
  './media/patada-de-gluteo-2.svg',
  './media/peso-muerto-rumano-1.svg',
  './media/peso-muerto-rumano-2.svg',
  './media/plancha-1.svg',
  './media/plancha-con-toque-de-hombro-1.svg',
  './media/plancha-con-toque-de-hombro-2.svg',
  './media/plancha-lateral-1.svg',
  './media/press-arnold-1.svg',
  './media/press-arnold-2.svg',
  './media/press-de-hombros-1.svg',
  './media/press-de-hombros-2.svg',
  './media/puente-a-una-pierna-1.svg',
  './media/puente-a-una-pierna-2.svg',
  './media/puente-de-gluteo-1.svg',
  './media/puente-de-gluteo-2.svg',
  './media/remo-con-banda-1.svg',
  './media/remo-con-banda-2.svg',
  './media/remo-con-mancuerna-1.svg',
  './media/remo-con-mancuerna-2.svg',
  './media/remo-renegado-1.svg',
  './media/remo-renegado-2.svg',
  './media/respiracion-final-1.svg',
  './media/rodillas-arriba-1.svg',
  './media/rodillas-arriba-2.svg',
  './media/rotaciones-de-tronco-1.svg',
  './media/rotaciones-de-tronco-2.svg',
  './media/saltos-de-patinador-1.svg',
  './media/saltos-de-patinador-2.svg',
  './media/sentadilla-bulgara-1.svg',
  './media/sentadilla-bulgara-2.svg',
  './media/sentadilla-con-salto-1.svg',
  './media/sentadilla-con-salto-2.svg',
  './media/sentadillas-1.svg',
  './media/sentadillas-2.svg',
  './media/sentadillas-sin-peso-1.svg',
  './media/sentadillas-sin-peso-2.svg',
  './media/superman-1.svg',
  './media/superman-2.svg',
  './media/swing-con-mancuerna-1.svg',
  './media/swing-con-mancuerna-2.svg',
  './media/thrusters-1.svg',
  './media/thrusters-2.svg',
  './media/zancada-lateral-1.svg',
  './media/zancada-lateral-2.svg',
  './media/zancadas-1.svg',
  './media/zancadas-2.svg',
  './media/zancadas-con-salto-1.svg',
  './media/zancadas-con-salto-2.svg'
];
/* === ASSETS:END === */

self.addEventListener('install', (e) => {
  // Ojo: NO se llama a skipWaiting() aqui. El worker nuevo espera a que la pagina
  // confirme (boton "Recargar"), para no cambiar los assets bajo un entreno en curso.
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// La pagina pide el relevo cuando el usuario acepta la actualizacion.
self.addEventListener('message', (e) => {
  if (e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting();
});

// Cache-first para el shell; la red es solo el respaldo.
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  e.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((res) => {
        // Guarda los extras propios que aparezcan despues (p. ej. media nueva de un pack).
        if (res && res.ok && new URL(req.url).origin === self.location.origin) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
        }
        return res;
      }).catch(() => cached);
    })
  );
});

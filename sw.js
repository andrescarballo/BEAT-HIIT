// Beat service worker — app shell sin conexion.
//
// La lista de assets y la version de cache las genera build.mjs a partir del contenido
// real que se sirve, asi que no hay que tocar nada a mano al publicar.

/* === ASSETS:START — generado por build.mjs. No editar a mano. === */
const CACHE = 'beat-73ecc32ead';
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png',
  './icon-maskable.png',
  './fonts/archivo-black-latin.woff2',
  './fonts/fraunces-latin.woff2',
  './fonts/spline-sans-mono-latin.woff2'
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

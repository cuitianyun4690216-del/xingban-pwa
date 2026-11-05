/* 星伴学园 Service Worker d96833d5d0 */
const CACHE = 'xingban-d96833d5d0';
const CORE = [
  "./",
  "./assets/avatars/player.webp",
  "./assets/backgrounds/academy-dusk.webp",
  "./assets/backgrounds/home-bg.webp",
  "./assets/favicon.svg",
  "./assets/icons/apple-touch-icon.png",
  "./assets/icons/icon-192.png",
  "./assets/icons/icon-512.png",
  "./assets/icons/icon-maskable-512.png",
  "./assets/pets/capybara/blink.webp",
  "./assets/pets/capybara/eat.webp",
  "./assets/pets/capybara/evolved.webp",
  "./assets/pets/capybara/happy.webp",
  "./assets/pets/capybara/idle.webp",
  "./assets/pets/capybara/sleep.webp",
  "./assets/pets/hamster/blink.webp",
  "./assets/pets/hamster/eat.webp",
  "./assets/pets/hamster/evolved.webp",
  "./assets/pets/hamster/happy.webp",
  "./assets/pets/hamster/idle.webp",
  "./assets/pets/hamster/sleep.webp",
  "./assets/scenes/bedroom.webp",
  "./assets/scenes/forest.webp",
  "./assets/scenes/observatory.webp",
  "./assets/scenes/study.webp",
  "./index.html",
  "./js/app.js",
  "./js/assets.js",
  "./js/audio.js",
  "./js/components/bottom-nav.js",
  "./js/components/home-view.js",
  "./js/components/modals.js",
  "./js/components/onboarding.js",
  "./js/components/parent-ui.js",
  "./js/components/pet-actor.js",
  "./js/components/pet-switcher.js",
  "./js/components/placeholder-view.js",
  "./js/components/quest-card.js",
  "./js/components/study-timer.js",
  "./js/components/today-card.js",
  "./js/components/top-bar.js",
  "./js/components/ui.js",
  "./js/components/wardrobe.js",
  "./js/data/catalog.js",
  "./js/data/wardrobe.js",
  "./js/data/world.js",
  "./js/fx.js",
  "./js/icons.js",
  "./js/ornaments.js",
  "./js/pets.js",
  "./js/profiles.js",
  "./js/store-parent.js",
  "./js/store-reset.js",
  "./js/store-world.js",
  "./js/store.js",
  "./js/vendor/vue.global.prod.js",
  "./js/views/collection.js",
  "./js/views/diary.js",
  "./js/views/explore.js",
  "./js/views/garden.js",
  "./js/views/home.js",
  "./js/views/parent.js",
  "./js/views/pet.js",
  "./js/views/study.js",
  "./manifest.webmanifest",
  "./styles/base.css",
  "./styles/components.css",
  "./styles/extras.css",
  "./styles/garden.css",
  "./styles/home.css",
  "./styles/modal.css",
  "./styles/pages.css",
  "./styles/pet.css",
  "./styles/polish.css",
  "./styles/responsive.css",
  "./styles/tokens.css",
  "./styles/wardrobe.css"
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(CORE)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(
    caches.match(req, { ignoreSearch: true }).then((hit) => {
      if (hit) return hit;
      return fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy));
        return res;
      }).catch(() => caches.match('./index.html'));
    })
  );
});

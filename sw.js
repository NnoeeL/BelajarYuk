// BelajarYuk - Service Worker (Offline Support & PWA)

const CACHE_NAME = 'belajaryuk-v21';

const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './LICENSE',
  './css/base.css',
  './css/components.css',
  './js/app.js',
  './js/state.js',
  './js/storage.js',
  './js/srs.js',
  './js/mock-data.js',
  './js/prompts.js',
  './js/extract.js',
  './js/gemini.js',
  './js/views/home.js',
  './js/views/create.js',
  './js/views/file-upload.js',
  './js/views/detail.js',
  './js/views/flashcards.js',
  './js/views/quiz.js',
  './js/views/quiz-setup.js',
  './js/views/quiz-completed.js',
  './js/views/settings.js',
  './js/views/api-tutorial.js',
  './assets/tutorial/groq-01-masuk.png',
  './assets/tutorial/groq-02-dashboard.png',
  './assets/tutorial/groq-03-api-keys.png',
  './assets/tutorial/groq-04-buat-api-key.png',
  './assets/tutorial/gemini-01-ai-studio.png',
  './assets/tutorial/gemini-02-dashboard.png',
  './assets/tutorial/gemini-03-api-keys.png',
  './assets/tutorial/app-settings.png',
  './assets/tutorial/app-create.png',
  './assets/tutorial/app-detail.png',
  './assets/tutorial/app-quiz-setup.png',
  './assets/tutorial/app-backup.png'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Never cache AI provider API calls
  if (url.hostname.includes('googleapis.com') || url.hostname === 'api.groq.com') {
    return;
  }

  // Network-First with cache fallback for instant development updates & offline support
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const resClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, resClone));
        }
        return networkResponse;
      })
      .catch(() => caches.match(event.request))
  );
});

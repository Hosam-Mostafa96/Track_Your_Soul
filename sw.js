
const CACHE_NAME = 'mizan-worship-v2';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/widget.html',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=IBM+Plex+Sans+Arabic:wght@400;700&family=Cairo:wght@400;700&display=swap'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// التعامل مع تحديثات البيانات من التطبيق الرئيسي
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'UPDATE_WIDGET_SCORE') {
    // تخزين الرصيد في التخزين المخصص للـ SW ليتمكن الودجت من قراءته
    const score = event.data.score;
    // إذا كان المتصفح يدعم Widgets API
    if (self.widgets && self.widgets.updateByTag) {
      self.widgets.updateByTag('mizan-score', { score });
    }
  }
});

// التعامل مع أحداث الودجت (PWA Widgets API)
self.addEventListener('widgetinstall', (event) => {
  event.waitUntil(updateWidget(event.widget));
});

self.addEventListener('widgetresume', (event) => {
  event.waitUntil(updateWidget(event.widget));
});

self.addEventListener('widgetclick', (event) => {
  // فتح التطبيق عند الضغط على الودجت
  event.waitUntil(clients.openWindow('/'));
});

async function updateWidget(widget) {
  // منطق تحديث شكل الودجت
  console.log('Widget logic update triggered');
}

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).then((fetchResponse) => {
        return caches.open(CACHE_NAME).then((cache) => {
          if (event.request.url.startsWith('http')) {
             cache.put(event.request, fetchResponse.clone());
          }
          return fetchResponse;
        });
      });
    }).catch(() => {
      if (event.request.mode === 'navigate') {
        return caches.match('/index.html');
      }
    })
  );
});

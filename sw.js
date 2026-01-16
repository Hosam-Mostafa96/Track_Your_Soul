
const CACHE_NAME = 'mizan-worship-v1';
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

// التعامل مع أحداث الودجت (PWA Widgets API)
self.addEventListener('widgetinstall', (event) => {
  console.log('Widget installed:', event.widget);
  event.waitUntil(updateWidget(event.widget));
});

self.addEventListener('widgetresume', (event) => {
  console.log('Widget resumed:', event.widget);
  event.waitUntil(updateWidget(event.widget));
});

self.addEventListener('widgetclick', (event) => {
  if (event.action === 'log-prayer') {
    event.waitUntil(clients.openWindow('/?tab=entry'));
  } else {
    event.waitUntil(clients.openWindow('/'));
  }
});

async function updateWidget(widget) {
  // هنا يمكن جلب البيانات من IndexedDB أو Cache لتحديث شكل الودجت
  // ملاحظة: دعم الودجت يختلف حسب النظام، بعض الأنظمة تستخدم Adaptive Cards
  console.log('Updating widget logic here...');
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

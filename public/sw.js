// Basic Service Worker to enable PWA installability
self.addEventListener('install', (event) => {
  console.log('Ondar Service Worker installed');
});

self.addEventListener('fetch', (event) => {
  // Pass-through for now
});

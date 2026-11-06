/**
 * Retires the service worker of the former Angular app.
 *
 * Browsers that visited it keep checking this URL for an update to that
 * worker. Without this file they would get index.html, keep the old worker
 * and its caches, and hold the new worker back behind an update prompt. This
 * one takes over, deletes the Angular caches and unregisters itself, so the
 * next visit loads the new app and its own worker.
 *
 * Angular's safety worker (@angular/service-worker/safety-worker.js):
 * Copyright Google LLC All Rights Reserved.
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());

  event.waitUntil(
    self.registration.unregister().then(() => {
      console.log('NGSW Safety Worker - unregistered old service worker');
    }),
  );

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      const ngswCacheNames = cacheNames.filter((name) => /^ngsw:/.test(name));
      return Promise.all(ngswCacheNames.map((name) => caches.delete(name)));
    }),
  );
});

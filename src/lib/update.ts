import { registerSW } from 'virtual:pwa-register';

import { createStore } from './store';

// Long-lived sessions (an installed app left open) only look for a new service
// worker on navigation, so check periodically too.
const UPDATE_CHECK_INTERVAL = 60 * 60 * 1000;

const updateReady = createStore(false);

// The new service worker waits until the user accepts, so an open page keeps
// being served the precached chunks of the version it was built against.
const updateServiceWorker = registerSW({
  onNeedRefresh: () => updateReady.set(true),
  onRegisteredSW(_swUrl, registration) {
    if (!registration) {
      return;
    }
    setInterval(() => {
      if (navigator.onLine) {
        registration.update().catch(() => {});
      }
    }, UPDATE_CHECK_INTERVAL);
  },
});

export const useUpdateReady = updateReady.use;

/** Activates the waiting service worker, which reloads the page. */
export function applyUpdate(): void {
  void updateServiceWorker();
}

export function dismissUpdate(): void {
  updateReady.set(false);
}

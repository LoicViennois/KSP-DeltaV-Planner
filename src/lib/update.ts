import { registerSW } from 'virtual:pwa-register';

import { createStore } from './store';

// Long-lived sessions (an installed app left open) only look for a new service
// worker on navigation, so check periodically too.
const UPDATE_CHECK_INTERVAL = 60 * 60 * 1000;

const updateReady = createStore(false);

/**
 * Retires the service worker of the former Angular app when it still controls
 * the page, which happens when the visit before left too soon for
 * public/ngsw-worker.js to take over. Registering ours meanwhile would leave
 * it waiting behind the old one, with an update prompt on every visit, so it
 * is registered on the next visit instead.
 */
function retireAngularWorker(): boolean {
  if (
    !navigator.serviceWorker?.controller?.scriptURL.endsWith('/ngsw-worker.js')
  ) {
    return false;
  }
  void navigator.serviceWorker
    .getRegistration()
    .then((registration) => registration?.unregister());
  void caches
    .keys()
    .then((names) =>
      Promise.all(
        names
          .filter((name) => name.startsWith('ngsw:'))
          .map((name) => caches.delete(name)),
      ),
    );
  return true;
}

// The new service worker waits until the user accepts, so an open page keeps
// being served the precached chunks of the version it was built against.
const updateServiceWorker = retireAngularWorker()
  ? () => Promise.resolve()
  : registerSW({
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

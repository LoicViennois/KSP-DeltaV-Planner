import { registerSW } from 'virtual:pwa-register';

// Long-lived sessions (an installed app left open) only look for a new service
// worker on navigation, so check again when the user comes back after a while.
const UPDATE_CHECK_INTERVAL = 60 * 60 * 1000;

/**
 * Retires the service worker of the former Angular app when it still controls
 * the page, which happens when the visit before left too soon for
 * public/ngsw-worker.js to take over. Registering ours meanwhile would leave
 * it waiting behind the old one, so it is registered on the next visit instead.
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

// The new service worker waits until all tabs are closed and takes over on the
// next launch. We intentionally avoid reloading tabs in the background: it
// triggers phantom analytics visits on deploy days and overwrites the original
// document.referrer on restored browser sessions.
if (!retireAngularWorker()) {
  registerSW({
    onRegisteredSW(_swUrl, registration) {
      if (!registration) {
        return;
      }
      let lastCheck = Date.now();
      document.addEventListener('visibilitychange', () => {
        if (
          document.visibilityState !== 'visible' ||
          !navigator.onLine ||
          Date.now() - lastCheck < UPDATE_CHECK_INTERVAL
        ) {
          return;
        }
        lastCheck = Date.now();
        registration.update().catch(() => {});
      });
    },
  });
}

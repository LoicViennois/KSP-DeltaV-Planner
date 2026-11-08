import { registerSW } from 'virtual:pwa-register';

// Long-lived sessions (an installed app left open) only look for a new service
// worker on navigation, so check periodically too.
const UPDATE_CHECK_INTERVAL = 60 * 60 * 1000;

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

/**
 * Activates the waiting service worker, which reloads the page, while nobody
 * is looking: once the page is hidden (another tab, the app sent to the
 * background, the phone locked). A closed app picks the update up on its next
 * launch anyway, so there is never anything to click. The trip is saved, so
 * the reload does not lose it.
 */
function applyWhenHidden(update: () => Promise<void>): void {
  const apply = () => {
    if (document.visibilityState === 'hidden') {
      document.removeEventListener('visibilitychange', apply);
      void update();
    }
  };
  document.addEventListener('visibilitychange', apply);
  apply();
}

// The new service worker waits meanwhile, so an open page keeps being served
// the precached chunks of the version it was built against.
if (!retireAngularWorker()) {
  const updateServiceWorker = registerSW({
    onNeedRefresh: () => applyWhenHidden(() => updateServiceWorker()),
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
}

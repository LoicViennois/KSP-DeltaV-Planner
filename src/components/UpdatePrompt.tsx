import { LoaderCircle } from 'lucide-react';
import { useState } from 'react';

import { applyUpdate, dismissUpdate, useUpdateReady } from '../lib/update';

/** Offers to reload when a new version has been installed in the background. */
export function UpdatePrompt() {
  const updateReady = useUpdateReady();
  // The page only reloads once the new service worker has taken control, which
  // can take a few seconds on mobile, so acknowledge the click straight away.
  const [updating, setUpdating] = useState(false);

  function reload() {
    if (updating) {
      return;
    }
    setUpdating(true);
    applyUpdate();
  }

  return (
    // The live region stays mounted so screen readers announce the message when it appears.
    <div
      role="status"
      className="pointer-events-none fixed inset-x-0 bottom-10 z-40 flex justify-center px-4"
    >
      {updateReady && (
        <div
          data-testid="update-prompt"
          className="pointer-events-auto flex animate-rise flex-wrap items-center gap-x-4 gap-y-2 rounded-xl bg-surface py-2 pr-2 pl-5 text-ink shadow-2xl ring-1 ring-line"
        >
          <p className="font-semibold">
            {updating
              ? 'Updating to the new version…'
              : 'A new version is available.'}
          </p>
          <div className="flex gap-2">
            {!updating && (
              <button
                type="button"
                onClick={dismissUpdate}
                className="btn btn-ghost"
              >
                Later
              </button>
            )}
            {/* aria-disabled rather than disabled keeps focus on the button. */}
            <button
              type="button"
              onClick={reload}
              aria-disabled={updating}
              className="btn btn-primary aria-disabled:cursor-progress"
            >
              {updating && (
                <LoaderCircle aria-hidden className="size-4 animate-spin" />
              )}
              {updating ? 'Reloading…' : 'Reload'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

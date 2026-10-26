import { MapIcon, Sparkles, X } from 'lucide-react';
import { useState } from 'react';

import { readJson, writeJson } from '../lib/storage';

const STORAGE_KEY = 'ksp_whats_new_dismissed';
// Only regular visitors of the former app need it, and they will have come
// back by then.
const SHOWN_UNTIL = Date.parse('2027-02-01');

interface WhatsNewProps {
  /** Opens the map in full screen. */
  onOpenMap: () => void;
  /** Called once the banner is gone, to move the focus elsewhere. */
  onDismiss: () => void;
}

/** Tells regular visitors about the new map, until they close it. */
export function WhatsNew({ onOpenMap, onDismiss }: WhatsNewProps) {
  const [shown, setShown] = useState(
    () => Date.now() < SHOWN_UNTIL && readJson<boolean>(STORAGE_KEY) !== true,
  );

  if (!shown) {
    return null;
  }

  function dismiss() {
    writeJson(STORAGE_KEY, true);
    setShown(false);
    onDismiss();
  }

  return (
    <section
      aria-label="What's new"
      className="flex animate-rise flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border border-thrust/40 bg-thrust-surface py-2 pr-2 pl-4"
    >
      <Sparkles aria-hidden className="size-5 shrink-0 text-thrust-text" />
      <p className="min-w-0 flex-1 basis-60">
        <strong>New look!</strong> The Δv map now opens in full screen, and on
        phones too.
      </p>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => {
            dismiss();
            onOpenMap();
          }}
          className="btn btn-primary py-1.5 text-sm"
        >
          <MapIcon aria-hidden className="size-4" />
          Open the map
        </button>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss"
          title="Dismiss"
          className="grid size-9 cursor-pointer place-items-center rounded-lg text-ink-soft transition hover:bg-tint hover:text-ink"
        >
          <X aria-hidden className="size-5" />
        </button>
      </div>
    </section>
  );
}

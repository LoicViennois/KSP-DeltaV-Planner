/** Where floating buttons sit, at the bottom right of the screen. */
export const floatingBar =
  'fixed right-4 bottom-[max(1.25rem,env(safe-area-inset-bottom))] z-30 flex gap-3';

/** The look shared by the buttons over the map: quiet until hovered. */
const floating =
  'cursor-pointer rounded-full bg-surface/80 text-ink-soft shadow-lg ring-[1.5px] ring-line backdrop-blur transition hover:bg-surface hover:text-ink hover:ring-thrust active:scale-95 disabled:pointer-events-none disabled:opacity-50';

/** A button over the map with a label. */
export const floatingButton = `flex animate-rise items-center gap-2 py-3 pr-5 pl-4 font-semibold ${floating}`;

/** A button over the map with an icon only, as high as the labelled ones. */
export const floatingIconButton = `grid size-11 shrink-0 place-items-center ${floating}`;

/** The button opening the map on phones, the one call to action there. */
export const mapButton =
  'flex animate-rise cursor-pointer items-center gap-2 rounded-full bg-thrust py-3 pr-5 pl-4 font-semibold text-thrust-ink shadow-lg transition hover:-translate-y-0.5 active:scale-95';

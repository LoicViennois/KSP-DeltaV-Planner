/** Where floating buttons sit, at the bottom right of the screen. */
export const floatingBar =
  'fixed right-4 bottom-[max(1.25rem,env(safe-area-inset-bottom))] z-30 flex gap-3';

/** The look shared by every button floating over the page or the map. */
const floating =
  'cursor-pointer rounded-full bg-surface/90 text-ink shadow-[0_10px_28px_-6px_rgb(0_0_0/0.55)] ring-2 ring-thrust backdrop-blur transition hover:-translate-y-0.5 hover:bg-surface active:scale-95';

/** A floating button with a label, set apart from the green Δv. */
export const floatingButton = `flex animate-rise items-center gap-2 py-3 pr-5 pl-4 font-semibold ${floating}`;

/** A floating button with an icon only, as high as the labelled ones. */
export const floatingIconButton = `grid size-11 shrink-0 place-items-center ${floating}`;

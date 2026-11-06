import { createStore } from './store';
import { readJson, writeJson } from './storage';

export type Theme = 'light' | 'dark';

// Keep in sync with the pre-paint script in index.html.
const STORAGE_KEY = 'ksp_theme';
const THEME_COLORS: Record<Theme, string> = {
  light: '#f3f2f7',
  dark: '#14111c',
};

// Dark by default, regardless of the system preference.
const DEFAULT_THEME: Theme = 'dark';

function storedTheme(): Theme | null {
  const stored = readJson<Theme>(STORAGE_KEY);
  return stored === 'light' || stored === 'dark' ? stored : null;
}

const theme = createStore<Theme>(storedTheme() ?? DEFAULT_THEME);

function apply(next: Theme): void {
  document.documentElement.dataset.theme = next;
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', THEME_COLORS[next]);
  theme.set(next);
}

apply(theme.get());

export const useTheme = theme.use;

/**
 * Switches the theme in one go. Colour transitions are off meanwhile: each
 * element animating at its own pace, some from colours they inherit while
 * those animate too, made the text flicker. Where supported, a view transition
 * cross-fades the whole page instead.
 */
export function toggleTheme(): void {
  const next: Theme = theme.get() === 'dark' ? 'light' : 'dark';
  writeJson(STORAGE_KEY, next);

  const root = document.documentElement;
  root.dataset.themeSwitching = '';
  const done = () => {
    // Once the new colours are painted, so that nothing animates towards them.
    requestAnimationFrame(() =>
      requestAnimationFrame(() => delete root.dataset.themeSwitching),
    );
  };

  const reduceMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)',
  ).matches;
  if (!document.startViewTransition || reduceMotion) {
    apply(next);
    done();
    return;
  }
  document.startViewTransition(() => apply(next)).finished.finally(done);
}

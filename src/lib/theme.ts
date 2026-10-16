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

export function toggleTheme(): void {
  const next: Theme = theme.get() === 'dark' ? 'light' : 'dark';
  writeJson(STORAGE_KEY, next);
  apply(next);
}

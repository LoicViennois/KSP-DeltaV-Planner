import { Moon, Sun } from 'lucide-react';

import { toggleTheme, useTheme } from '../lib/theme';

export function ThemeToggle() {
  const theme = useTheme();
  const Icon = theme === 'dark' ? Sun : Moon;

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={
        theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'
      }
      className="grid size-9 cursor-pointer place-items-center rounded-lg text-ink-soft transition hover:bg-tint hover:text-ink active:scale-90"
    >
      <Icon key={theme} className="size-5 animate-pop" aria-hidden />
    </button>
  );
}

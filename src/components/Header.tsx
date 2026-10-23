import { Link } from '@tanstack/react-router';
import { Info } from 'lucide-react';
import { useState } from 'react';

import { repoUrl } from '../lib/build-info';
import { AboutDialog } from './AboutDialog';
import { GitHubIcon } from './GitHubIcon';
import { Logo } from './Logo';
import { ThemeToggle } from './ThemeToggle';

const iconButton =
  'grid size-9 cursor-pointer place-items-center rounded-lg text-ink-soft transition hover:bg-tint hover:text-ink active:scale-90';

export function Header() {
  const [aboutOpen, setAboutOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-(--shell-width) items-center justify-between gap-2 px-4 lg:px-6">
        <Link
          to="/"
          className="flex items-center gap-2.5 rounded-lg"
          aria-label="KSP Delta-V Planner, home"
        >
          <Logo />
          <span className="text-lg font-semibold tracking-tight whitespace-nowrap">
            KSP <span className="hidden sm:inline">Delta-V</span>
            <span className="sm:hidden">Δv</span> Planner
          </span>
        </Link>
        <nav aria-label="Site" className="flex items-center gap-1">
          <a
            href={repoUrl}
            target="_blank"
            rel="noopener"
            aria-label="GitHub repository"
            className={iconButton}
          >
            <GitHubIcon className="size-5" />
          </a>
          <button
            type="button"
            onClick={() => setAboutOpen(true)}
            aria-label="About"
            className={iconButton}
          >
            <Info className="size-5" aria-hidden />
          </button>
          <ThemeToggle />
        </nav>
      </div>
      <AboutDialog open={aboutOpen} onClose={() => setAboutOpen(false)} />
    </header>
  );
}

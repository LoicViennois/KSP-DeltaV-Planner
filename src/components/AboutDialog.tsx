import { Coffee, MapIcon, MessageCircle } from 'lucide-react';
import type { ReactNode } from 'react';

import {
  commitSha,
  commitUrl,
  repoUrl,
  shortSha,
  sponsorUrl,
} from '../lib/build-info';
import { Logo } from './Logo';
import { Modal } from './Modal';

interface AboutDialogProps {
  open: boolean;
  onClose: () => void;
}

const CC_BY_NC_SA =
  'https://creativecommons.org/licenses/by-nc-sa/4.0/legalcode';

function External({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener" className="text-ink">
      {children}
    </a>
  );
}

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof MapIcon;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-xl border border-line p-4">
      <h3 className="mb-1 flex items-center gap-2 font-bold">
        <Icon className="size-4" aria-hidden />
        {title}
      </h3>
      <div className="text-ink-soft">{children}</div>
    </section>
  );
}

/** What the planner is, how to reach and support its author, and who made its map. */
export function AboutDialog({ open, onClose }: AboutDialogProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="About"
      className="w-[min(44rem,calc(100%-2rem))]"
    >
      <div className="space-y-4 leading-relaxed [&_a]:link">
        <div className="flex items-center gap-3">
          <Logo className="size-10" />
          <p>
            <span className="font-bold">KSP Delta-V Planner</span>, build{' '}
            <a
              href={commitUrl}
              title={commitSha}
              target="_blank"
              rel="noopener"
              data-testid="commit-link"
              className="font-digits"
            >
              {shortSha}
            </a>
            <br />
            <span className="text-ink-soft">
              Copyright &copy; 2020-2026{' '}
              <a
                href="https://loicviennois.com/"
                target="_blank"
                rel="noopener"
              >
                Loïc Viennois
              </a>
            </span>
          </p>
        </div>

        <p>
          This is a Δv planner for the game{' '}
          <External href="https://www.kerbalspaceprogram.com">
            Kerbal Space Program
          </External>
          . Pick where your rocket starts and where it goes: it adds up the Δv
          of each step of the trip. Pick a step to find it on the map.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <Section icon={MessageCircle} title="Send feedback">
            <ul className="space-y-1">
              <li>
                Found a bug or have an idea?
                <br />
                <External href={`${repoUrl}/issues/new`}>
                  Open an issue on GitHub
                </External>
              </li>
              <li>
                Want to say hi?
                <br />
                <External href="https://www.reddit.com/message/compose/?to=LoicViennois">
                  Message me on Reddit
                </External>
              </li>
            </ul>
          </Section>
          <Section icon={Coffee} title="Buy me a coffee">
            <p>
              The planner is free and always will be. If you find it useful, you
              can buy me a coffee!
              <br />
              <a
                href={sponsorUrl}
                target="_blank"
                rel="noopener"
                data-testid="sponsor-link"
                className="text-ink"
              >
                Support me on GitHub Sponsors
              </a>
            </p>
          </Section>
        </div>

        <Section icon={MapIcon} title="The Δv map">
          <div className="space-y-2">
            <p>
              The <span className="text-ink">Kerbal Space Program Δv Map</span>{' '}
              is licensed under{' '}
              <External href={CC_BY_NC_SA}>CC BY-NC-SA 4.0</External> by Loïc
              Viennois. It is a derivative of{' '}
              <External href="https://github.com/Kowgan/ksp_cheat_sheets">
                Cheat Sheets for Kerbal Space Program
              </External>{' '}
              by Kowgan, used under the same license.
            </p>
            <p>
              Map design by{' '}
              <External href="https://www.reddit.com/user/swashlebucky/">
                /u/swashlebucky
              </External>
              , inspired by Kowgan and WAC. Atmospheric numbers by Kowgan,
              vacuum numbers by{' '}
              <External href="https://www.reddit.com/user/CuriousMetaphor/">
                /u/CuriousMetaphor
              </External>
              . Relay antenna calculations from the{' '}
              <External href="https://wiki.kerbalspaceprogram.com/wiki/CommNet">
                KSP wiki
              </External>
              . Original subway concept by{' '}
              <External href="https://www.reddit.com/user/JellyCubes/">
                /u/JellyCubes
              </External>
              .
            </p>
            <p>
              More about the game on{' '}
              <External href="https://forum.kerbalspaceprogram.com">
                the KSP forum
              </External>{' '}
              and{' '}
              <External href="https://www.reddit.com/r/KerbalSpaceProgram">
                r/KerbalSpaceProgram
              </External>
              .
            </p>
          </div>
        </Section>

        <p className="border-t border-line pt-4 text-sm text-ink-soft">
          This program is free software, released under the{' '}
          <External href={`${repoUrl}/blob/master/LICENSE`}>
            GNU General Public License v3
          </External>
          . You may redistribute and modify it under its terms, either version 3
          of the License or any later version.
        </p>
      </div>
    </Modal>
  );
}

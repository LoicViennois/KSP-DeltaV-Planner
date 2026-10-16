import { BookOpen } from 'lucide-react';

import { Modal } from './Modal';

interface HelpDialogProps {
  open: boolean;
  onClose: () => void;
}

const NOTES = [
  'Low orbits are 10 km above the atmosphere or terrain obstacles.',
  'All values are vacuum Δv, in m/s.',
  'When two values are given, the lower one includes no plane change, the higher one the maximum plane change.',
  'Atmospheric ascent values are typical: more or less efficient ascents are likely, depending on the ascent profile, the TWR and aerodynamic effects.',
  "Flight times are based on 10 years of average flight possibilities simulated on AlexMoon's Launch Window Planner, from day 1.",
];

export function HelpDialog({ open, onClose }: HelpDialogProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Help"
      className="w-[min(40rem,calc(100%-2rem))]"
    >
      <div className="space-y-4 leading-relaxed [&_a]:link">
        <p>
          This is a Δv planner for the game{' '}
          <a
            href="https://www.kerbalspaceprogram.com"
            target="_blank"
            rel="noopener"
          >
            Kerbal Space Program
          </a>
          . Pick where your rocket starts and where it goes: it adds up the Δv
          of each step of the trip. Hover a step to find it on the map.
        </p>
        <ul className="list-disc space-y-1 pl-5 text-ink-soft marker:text-thrust">
          {NOTES.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
        <section className="rounded-xl border border-line p-4">
          <h3 className="mb-1 flex items-center gap-2 font-bold">
            <BookOpen className="size-4" aria-hidden />
            More information
          </h3>
          <ul className="space-y-1 text-ink-soft">
            <li>
              <a
                href="https://forum.kerbalspaceprogram.com"
                target="_blank"
                rel="noopener"
                className="text-ink"
              >
                The KSP forum
              </a>
            </li>
            <li>
              <a
                href="https://www.reddit.com/r/KerbalSpaceProgram"
                target="_blank"
                rel="noopener"
                className="text-ink"
              >
                r/KerbalSpaceProgram
              </a>
            </li>
          </ul>
        </section>
      </div>
    </Modal>
  );
}

import { Modal } from './Modal';

const NOTES = [
  'Low orbits are 10 km above the atmosphere or terrain obstacles.',
  'All values are vacuum Δv, in m/s.',
  'When two values are given, the lower one includes no plane change, the higher one the maximum plane change.',
  'Atmospheric ascent values are typical: more or less efficient ascents are likely, depending on the ascent profile, the TWR and aerodynamic effects.',
  "Flight times are based on 10 years of average flight possibilities simulated on AlexMoon's Launch Window Planner, from day 1.",
];

interface NotesDialogProps {
  open: boolean;
  onClose: () => void;
}

/** How the Δv values of the planner and the map are worked out. */
export function NotesDialog({ open, onClose }: NotesDialogProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Reading the numbers"
      className="w-[min(36rem,calc(100%-2rem))]"
    >
      <ul className="list-disc space-y-2 pl-5 leading-relaxed text-ink-soft marker:text-thrust">
        {NOTES.map((note) => (
          <li key={note}>{note}</li>
        ))}
      </ul>
    </Modal>
  );
}

import { X } from 'lucide-react';
import { type ReactNode, useEffect, useId, useRef } from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
  /** Leaves out the title and close button, for dialogs that close otherwise. */
  hideHeader?: boolean;
}

/** Native modal dialog: focus trapping, Escape and backdrop click close it. */
export function Modal({
  open,
  onClose,
  title,
  children,
  className,
  bodyClassName = 'px-6 pt-3 pb-6',
  hideHeader = false,
}: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }
    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onClick={(e) => e.target === e.currentTarget && onClose()}
      aria-labelledby={hideHeader ? undefined : titleId}
      aria-label={hideHeader ? title : undefined}
      className={`m-auto overscroll-contain rounded-2xl border border-line bg-surface p-0 text-left text-ink shadow-2xl backdrop:bg-black/40 backdrop:backdrop-blur-sm open:animate-rise ${className ?? ''}`}
    >
      {!hideHeader && (
        <div className="flex items-center justify-between gap-4 px-6 pt-5">
          <h2 id={titleId} className="text-xl font-bold">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid size-9 cursor-pointer place-items-center rounded-lg text-ink-soft transition hover:bg-tint hover:text-ink"
          >
            <X className="size-5" aria-hidden />
          </button>
        </div>
      )}
      <div className={bodyClassName}>{children}</div>
    </dialog>
  );
}

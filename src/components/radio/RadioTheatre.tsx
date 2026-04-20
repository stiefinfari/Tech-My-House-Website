import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import useReducedMotionPreference from '../../hooks/useReducedMotionPreference';

type RadioTheatreProps = {
  open: boolean;
  title: string;
  coverUrl?: string;
  onClose: () => void;
  children: React.ReactNode;
};

export default function RadioTheatre({ open, title, coverUrl, onClose, children }: RadioTheatreProps) {
  const shouldReduceMotion = useReducedMotionPreference();
  const closeBtnRef = React.useRef<HTMLButtonElement | null>(null);
  const lastFocusedRef = React.useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    lastFocusedRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    window.setTimeout(() => closeBtnRef.current?.focus(), 0);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();

      if (event.key === 'Tab') {
        const focusable = Array.from(
          document.querySelectorAll<HTMLElement>(
            '[role="dialog"] button, [role="dialog"] a, [role="dialog"] input, [role="dialog"] select, [role="dialog"] textarea, [role="dialog"] [tabindex]:not([tabindex="-1"])'
          )
        ).filter((el) => !el.hasAttribute('disabled'));

        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        const active = document.activeElement as HTMLElement | null;

        if (!event.shiftKey && active === last) {
          event.preventDefault();
          first.focus();
        } else if (event.shiftKey && active === first) {
          event.preventDefault();
          last.focus();
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      lastFocusedRef.current?.focus();
    };
  }, [onClose, open]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Radio theatre mode"
      className={`fixed inset-0 z-[140] bg-ink/95 backdrop-blur-md ${shouldReduceMotion ? '' : 'animate-fade-in'}`}
    >
      <div className="container-shell flex h-full flex-col py-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-[13px] font-extrabold uppercase tracking-[0.2em] text-acid">
            Theatre Mode
          </h2>
          <button
            ref={closeBtnRef}
            type="button"
            onClick={onClose}
            aria-label="Close theatre mode"
            className="inline-flex h-10 w-10 items-center justify-center border border-white/20 bg-black/40 text-white transition-colors hover:border-white hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-acid"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-6 grid flex-1 gap-6 lg:grid-cols-[minmax(320px,480px)_1fr] lg:items-center">
          <div className="aspect-square overflow-hidden border border-white/10 bg-black">
            {coverUrl ? (
              <img src={coverUrl} alt={title} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center font-mono text-[11px] uppercase tracking-[0.26em] text-smoke">
                No Cover
              </div>
            )}
          </div>
          <div className="min-w-0">{children}</div>
        </div>
      </div>
    </div>
  );
}

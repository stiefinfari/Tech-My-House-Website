import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import useReducedMotionPreference from '../../hooks/useReducedMotionPreference';

type RadioTheatreProps = {
  open: boolean;
  title: string;
  coverUrl?: string;
  accentRgb?: string;
  onClose: () => void;
  children: React.ReactNode;
};

export default function RadioTheatre({ open, title, coverUrl, accentRgb, onClose, children }: RadioTheatreProps) {
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
      className={`fixed inset-0 z-[140] bg-ink cement-texture ${shouldReduceMotion ? '' : 'animate-fade-in'}`}
    >
      {coverUrl && (
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden opacity-30">
          <img src={coverUrl} alt="" className="h-full w-full scale-110 object-cover blur-3xl" />
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse at center, rgba(0,0,0,0) 0%, rgba(0,0,0,0.7) 55%, rgba(0,0,0,0.95) 100%)',
            }}
          />
        </div>
      )}

      <div className="absolute inset-0 z-0 pointer-events-none grain-heavy opacity-70" aria-hidden="true" />
      <div className="absolute inset-0 z-0 pointer-events-none plastic-crinkle opacity-50" aria-hidden="true" />

      <div className="container-shell relative z-10 flex h-full flex-col py-8 sm:py-12">
        <div className="tmh-wallpaper tmh-wallpaper--outline text-white/15" aria-hidden="true">
          <span className="tmh-wallpaper__row" style={{ ['--wp-offset' as string]: '-8%' }}>
            THEATRE MODE · TECH MY HOUSE ·
          </span>
          <span className="tmh-wallpaper__row" style={{ ['--wp-offset' as string]: '-18%' }}>
            THEATRE MODE · TECH MY HOUSE ·
          </span>
        </div>
        <div className="flex items-center justify-between">
          <h2 className="font-mono text-[10px] uppercase tracking-[0.24em] text-acid">THEATRE MODE</h2>
          <button
            ref={closeBtnRef}
            type="button"
            onClick={onClose}
            aria-label="Close theatre mode"
            className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-md transition-colors hover:border-acid/60 hover:text-acid focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-acid"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mt-8 grid flex-1 gap-12 lg:grid-cols-[minmax(400px,500px)_1fr] lg:items-center">
          <div className="relative mx-auto aspect-square w-full max-w-[500px] rotate-[-1.5deg] transform-gpu overflow-hidden rounded-3xl shadow-2xl lg:mx-0">
            {coverUrl ? (
              <img src={coverUrl} alt={title} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-black/50 font-mono text-[11px] uppercase tracking-[0.26em] text-smoke">
                No Cover
              </div>
            )}
            <div className="absolute inset-0 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12)] pointer-events-none" />
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-black/35 via-transparent to-white/5" />
            {accentRgb ? (
              <div
                className="pointer-events-none absolute inset-0 opacity-20 mix-blend-screen"
                style={{
                  background: `radial-gradient(120% 90% at 30% 20%, rgb(${accentRgb} / 0.9) 0%, transparent 70%)`,
                }}
              />
            ) : null}
          </div>
          <div className="min-w-0 flex flex-col h-full justify-center">{children}</div>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import Marquee from '../../components/Marquee';

export default function RecordsSection() {
  const [submitted, setSubmitted] = React.useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
  };

  return (
    <section id="records" className="relative py-20 sm:py-24 lg:py-28">
      <div className="container-shell">
        <div className="warehouse-plate relative z-10 flex min-h-[60svh] flex-col justify-center border border-white/10 bg-ink-raise/30 px-5 py-10 sm:px-8 sm:py-14 lg:px-10 lg:py-16">
          <div className="mb-8 sm:mb-10">
            <div className="section-tag">Imprint</div>
            <h2 className="mt-3 font-display text-[clamp(3.5rem,12vw,9rem)] font-extrabold uppercase leading-[0.9] tracking-[-0.08em] stencil">TMH RECORDS</h2>
          </div>

          <div className="mb-8 sm:mb-10">
            <Marquee text="COMING SOON • TMH001 • TMH002 • TMH003 • EST. 2026 • " className="warning-stripes" />
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-14">
            <p className="max-w-[48ch] font-sans text-sm leading-relaxed text-smoke">
              TMH Records is where the radio show becomes vinyl. Underground house, tech house and techno from the
              roster. First catalogue drops in 2026. No hype, no deadlines we don&apos;t keep.
            </p>

            <form
              onSubmit={handleSubmit}
              aria-label="Notify me when TMH Records launches"
              className="flex w-full flex-col justify-start gap-3"
            >
              <div className="flex items-end gap-3">
                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  required
                  placeholder="your@email.here"
                  className="w-full border-0 border-b border-acid bg-transparent px-0 py-2 font-sans text-sm text-white placeholder:text-smoke/70 focus-visible:outline-none"
                />
                <button
                  type="submit"
                  className="shrink-0 border border-acid bg-acid px-4 py-2 font-display text-xs font-extrabold uppercase tracking-widest text-ink transition-colors hover:bg-acid-deep focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-acid"
                >
                  SUBMIT ↗
                </button>
              </div>
              {submitted && (
                <p className="pt-1 font-sans text-[10px] font-bold uppercase tracking-widest text-acid">
                  THANKS, YOU&apos;RE ON THE LIST
                </p>
              )}
            </form>
          </div>

          <p className="mt-10 font-sans text-[10px] uppercase tracking-widest text-smoke">
            CAT # TMH0xx · FORMAT 12&quot; VINYL + DIGITAL · DISTRIBUTION TBA
          </p>
        </div>
      </div>
    </section>
  );
}

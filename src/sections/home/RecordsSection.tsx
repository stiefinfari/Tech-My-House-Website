import React from 'react';
import PillButton from '../../components/ui/PillButton';

export default function RecordsSection() {
  const [submitted, setSubmitted] = React.useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
  };

  return (
    <section id="records" className="cement-texture relative isolate overflow-hidden py-20 sm:py-24 lg:py-28">
      <div className="container-shell relative z-10">
        <div className="records-panel grid grid-cols-1 gap-12 border border-white/10 bg-black/20 p-8 sm:p-10 lg:grid-cols-[1.15fr_1fr] lg:items-end lg:gap-14">
          <div>
            <div className="section-tag">Imprint</div>
            <h2 className="mt-4 text-white leading-[0.86]">
              <span className="display-title block text-[clamp(4.5rem,16vw,13rem)]">TMH</span>
              <span className="accent-script block -mt-2 text-[clamp(3.6rem,14vw,12.5rem)] text-white">Records</span>
            </h2>

            <div className="mt-6 flex flex-wrap items-center gap-4">
              <span className="tape-strip">CATALOGUE 2026</span>
              <span className="accent-script -rotate-[2deg] text-[clamp(1.2rem,3vw,1.8rem)] text-acid">
                first drops incoming
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <form
              onSubmit={handleSubmit}
              aria-label="Notify me when TMH Records launches"
              className="flex w-full flex-col gap-3"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  required
                  placeholder="your@email.here"
                  className="h-12 w-full rounded-none border-2 border-acid bg-ink px-4 font-sans text-sm text-white placeholder:text-smoke/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-acid"
                />
                <PillButton
                  type="submit"
                  variant="primary"
                  className="h-12 shrink-0 px-8 py-0"
                >
                  NOTIFY
                </PillButton>
              </div>
              {submitted ? (
                <p className="pt-1 font-display text-[11px] uppercase tracking-[0.18em] text-acid">Thanks — you&apos;re on the list</p>
              ) : null}
            </form>
            <div className="font-mono text-[10px] uppercase tracking-widest text-smoke">
              LIMITED IMPRINT RELEASES
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

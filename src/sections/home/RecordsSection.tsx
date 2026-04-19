import React from 'react';
import TMHWallpaper from '../../components/TMHWallpaper';
import PillButton from '../../components/ui/PillButton';

export default function RecordsSection() {
  const [submitted, setSubmitted] = React.useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
  };

  return (
    <section id="records" className="cement-texture relative isolate overflow-hidden py-20 sm:py-24 lg:py-28">
      <div className="text-cement-light">
        <TMHWallpaper text={['TMH RECORDS', 'COMING SOON']} mode="mixed" opacity={0.14} />
      </div>

      <div className="container-shell relative z-10">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-end lg:gap-14">
          <div>
            <div className="section-tag">Imprint</div>
            <h2 className="display-title mt-4 text-[clamp(5rem,18vw,15rem)] leading-[0.86] text-white">
              TMH
              <br />
              RECORDS
            </h2>

            <div className="mt-6 flex flex-wrap items-center gap-4">
              <span className="tape-strip">CATALOGUE 2026</span>
              <span className="accent-script -rotate-[2deg] text-[clamp(1.2rem,3vw,1.8rem)] text-acid">
                first drops incoming
              </span>
            </div>

            <p className="mt-7 max-w-[56ch] font-sans text-base font-medium leading-relaxed text-white/80">
              TMH Records is where the radio show becomes vinyl. Underground house, tech house and techno from the roster.
              First catalogue drops in 2026.
            </p>
          </div>

          <div className="space-y-6">
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

            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center border border-white/15 bg-black/20 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.26em] text-smoke">
                12&quot; VINYL
              </span>
              <span className="inline-flex items-center border border-white/15 bg-black/20 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.26em] text-smoke">
                DIGITAL
              </span>
              <span className="inline-flex items-center border border-white/15 bg-black/20 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.26em] text-smoke">
                DISTRO TBA
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

import React from 'react';
import LatestEpisode from '../../components/LatestEpisode';

class RadioShowErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full border border-white/10 bg-white/[0.02] p-8">
          <a
            href="https://soundcloud.com/techmyhouse"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-full border border-acid/80 px-6 py-3 font-display text-[12px] font-extrabold uppercase tracking-[0.16em] text-acid transition-colors hover:bg-acid hover:text-ink hover:shadow-[0_10px_40px_-12px_rgba(204,255,0,0.4)] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[4px] focus-visible:outline-acid"
          >
            LISTEN ON SOUNDCLOUD ↗
          </a>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function RadioShowSection() {
  return (
    <section id="podcast" className="py-20 sm:py-24 lg:py-28">
      <div className="container-shell">
        <RadioShowErrorBoundary>
          <LatestEpisode />
        </RadioShowErrorBoundary>
      </div>
    </section>
  );
}

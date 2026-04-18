import React from 'react';
import LatestEpisode from '../../components/LatestEpisode';

export default function PodcastSection() {
  return (
    <section id="podcast" className="py-20 sm:py-24 lg:py-28">
      <div className="container-shell">
        <LatestEpisode />
      </div>
    </section>
  );
}

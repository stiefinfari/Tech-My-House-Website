import React, { useMemo } from 'react';
import { Bookmark, BookmarkCheck, Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import { DEFAULT_COVER } from '../../utils/episodeFeed';

export type RadioEpisodeRowData = {
  episodeCode: string;
  title: string;
  link: string;
  pubDate: string;
  audioUrl: string;
  coverUrl: string;
  durationSec: number | null;
};

type MatchTerm = { term: string; count: number };

type RadioEpisodeRowProps = {
  episode: RadioEpisodeRowData;
  isCurrentlyPlaying: boolean;
  bookmarked: boolean;
  onPlay: () => void;
  onToggleBookmark: () => void;
  matchTerms: MatchTerm[];
};

function formatDate(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatDuration(sec: number | null) {
  if (!sec || !Number.isFinite(sec)) return '';
  const s = Math.max(0, Math.floor(sec));
  const hh = Math.floor(s / 3600);
  const mm = Math.floor((s % 3600) / 60);
  const ss = s % 60;
  if (hh > 0) return `${hh}:${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
  return `${mm}:${String(ss).padStart(2, '0')}`;
}

export default function RadioEpisodeRow({
  episode,
  isCurrentlyPlaying,
  bookmarked,
  onPlay,
  onToggleBookmark,
  matchTerms,
}: RadioEpisodeRowProps) {
  const numericCode = useMemo(() => episode.episodeCode.match(/^ep(\d{1,4})$/i)?.[1] ?? null, [episode.episodeCode]);
  const episodeLabel = numericCode ? `EP${numericCode}` : episode.episodeCode.toUpperCase();
  const dateText = useMemo(() => formatDate(episode.pubDate), [episode.pubDate]);
  const durationText = useMemo(() => formatDuration(episode.durationSec), [episode.durationSec]);

  return (
    <article className="surface-panel group relative overflow-hidden p-3 transition-colors hover:border-acid/60 sm:p-4">
      <Link
        to={`/radio/${episode.episodeCode}`}
        className="absolute inset-0 z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-acid"
        aria-label={`View ${episode.title}`}
      />

      <div className="relative z-20 pointer-events-none pr-28">
        <div className="flex gap-4">
          <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] sm:h-28 sm:w-28">
            <img
              src={episode.coverUrl}
              alt={episode.title}
              loading="lazy"
              onError={(event) => {
                event.currentTarget.onerror = null;
                event.currentTarget.src = DEFAULT_COVER;
              }}
              className={`h-full w-full object-cover transition-transform duration-700 ${
                isCurrentlyPlaying ? 'scale-[1.04]' : 'group-hover:scale-[1.02]'
              }`}
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/20 to-transparent" />
          </div>

          <div className="min-w-0 flex-1 py-1">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-[10px] uppercase tracking-[0.24em] text-white/60">
              <span className="text-acid">{episodeLabel}</span>
              {dateText ? <span>{dateText}</span> : null}
              {durationText ? <span>{durationText}</span> : null}
            </div>

            <div className="mt-2 font-display text-[clamp(1.05rem,2.2vw,1.6rem)] font-extrabold uppercase leading-[1.0] tracking-[-0.03em] text-white">
              {episode.title}
            </div>

            {matchTerms.length ? (
              <div className="mt-2 text-xs text-white/65">
                Tracklist match:{' '}
                {matchTerms.map((m) => (
                  <span key={m.term} className="mr-2">
                    “{m.term}” ({m.count})
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="absolute right-3 top-1/2 z-30 flex -translate-y-1/2 items-center gap-2 pointer-events-auto sm:right-4">
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onPlay();
          }}
          aria-label={`Play ${episode.title}`}
          className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-acid text-ink transition-transform duration-200 hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
        >
          {isCurrentlyPlaying ? (
            <div className="flex h-5 items-end gap-[4px]">
              <span className="h-full w-1.5 bg-ink animate-[bounce_1s_infinite]" style={{ animationDelay: '0ms' }} />
              <span className="h-2/3 w-1.5 bg-ink animate-[bounce_1s_infinite]" style={{ animationDelay: '200ms' }} />
              <span className="h-4/5 w-1.5 bg-ink animate-[bounce_1s_infinite]" style={{ animationDelay: '400ms' }} />
            </div>
          ) : (
            <Play size={22} fill="currentColor" className="ml-0.5" />
          )}
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onToggleBookmark();
          }}
          aria-label={bookmarked ? `Remove bookmark ${episode.title}` : `Bookmark ${episode.title}`}
          className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-ink/60 text-white/80 backdrop-blur-md transition-colors hover:border-acid/60 hover:text-acid focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-acid"
        >
          {bookmarked ? <BookmarkCheck size={16} className="text-acid" /> : <Bookmark size={16} />}
        </button>
      </div>
    </article>
  );
}


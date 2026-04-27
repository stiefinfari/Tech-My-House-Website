import React from 'react';
import { LayoutGrid, List, Search } from 'lucide-react';

export type RadioArchiveView = 'list' | 'grid';
export type RadioArchiveSort = 'latest' | 'oldest';

type RadioArchiveControlsProps = {
  query: string;
  onQueryChange: (value: string) => void;
  view: RadioArchiveView;
  onViewChange: (value: RadioArchiveView) => void;
  sort: RadioArchiveSort;
  onSortChange: (value: RadioArchiveSort) => void;
};

export default function RadioArchiveControls({
  query,
  onQueryChange,
  view,
  onViewChange,
  sort,
  onSortChange,
}: RadioArchiveControlsProps) {
  return (
    <div className="surface-panel flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:gap-4 sm:p-4">
      <div className="flex flex-1 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2.5">
        <Search size={16} className="text-white/55" />
        <input
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search shows + tracklist…"
          className="w-full bg-transparent text-sm text-white placeholder:text-white/35 focus:outline-none"
          aria-label="Search shows and tracklist"
        />
        {query ? (
          <button
            type="button"
            onClick={() => onQueryChange('')}
            className="rounded-lg px-2 py-1 text-xs text-white/55 hover:text-white"
          >
            Clear
          </button>
        ) : null}
      </div>

      <div className="flex items-center gap-2">
        <div className="inline-flex overflow-hidden rounded-xl border border-white/10 bg-white/[0.02]">
          <button
            type="button"
            onClick={() => onViewChange('list')}
            className={`inline-flex items-center gap-2 px-3 py-2 text-xs uppercase tracking-[0.18em] transition-colors ${
              view === 'list' ? 'bg-acid/15 text-acid' : 'text-white/60 hover:text-white'
            }`}
          >
            <List size={16} />
            List
          </button>
          <button
            type="button"
            onClick={() => onViewChange('grid')}
            className={`inline-flex items-center gap-2 px-3 py-2 text-xs uppercase tracking-[0.18em] transition-colors ${
              view === 'grid' ? 'bg-acid/15 text-acid' : 'text-white/60 hover:text-white'
            }`}
          >
            <LayoutGrid size={16} />
            Grid
          </button>
        </div>

        <select
          value={sort}
          onChange={(e) => onSortChange(e.target.value as RadioArchiveSort)}
          className="rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2 text-xs uppercase tracking-[0.18em] text-white/80 focus:outline-none"
          aria-label="Sort episodes"
        >
          <option value="latest">Latest → Old</option>
          <option value="oldest">Old → Latest</option>
        </select>
      </div>
    </div>
  );
}


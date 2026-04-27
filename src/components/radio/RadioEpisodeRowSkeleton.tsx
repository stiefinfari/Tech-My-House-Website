import React from 'react';

type RadioEpisodeRowSkeletonProps = {
  count?: number;
};

export default function RadioEpisodeRowSkeleton({ count = 6 }: RadioEpisodeRowSkeletonProps) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="surface-panel relative overflow-hidden p-3 sm:p-4"
        >
          <div className="flex gap-4">
            <div className="h-24 w-24 shrink-0 animate-pulse rounded-2xl bg-white/10 sm:h-28 sm:w-28" />
            <div className="flex-1 space-y-3 py-1">
              <div className="h-4 w-10/12 animate-pulse rounded bg-white/10" />
              <div className="h-3 w-7/12 animate-pulse rounded bg-white/10" />
              <div className="h-3 w-8/12 animate-pulse rounded bg-white/10" />
            </div>
            <div className="ml-auto flex items-center gap-2">
              <div className="h-11 w-11 animate-pulse rounded-full bg-white/10" />
              <div className="h-11 w-11 animate-pulse rounded-full bg-white/10" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}


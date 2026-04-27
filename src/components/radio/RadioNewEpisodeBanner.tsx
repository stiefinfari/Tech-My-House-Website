import React from 'react';
import { RefreshCcw, X } from 'lucide-react';

type RadioNewEpisodeBannerProps = {
  visible: boolean;
  onRefresh: () => void;
  onDismiss: () => void;
};

export default function RadioNewEpisodeBanner({ visible, onRefresh, onDismiss }: RadioNewEpisodeBannerProps) {
  if (!visible) return null;

  return (
    <div className="mt-3 rounded-2xl border border-acid/25 bg-acid/10 p-3 shadow-[0_0_0_1px_rgba(204,255,0,0.06),0_18px_45px_rgba(0,0,0,0.55)] sm:p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="font-display text-sm uppercase tracking-[0.18em] text-white">Nuovo episodio disponibile</div>
          <div className="mt-1 text-sm text-white/70">Abbiamo trovato una nuova puntata nel feed.</div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onRefresh}
            className="inline-flex items-center gap-2 rounded-xl border border-acid/35 bg-acid/15 px-3 py-2 text-xs uppercase tracking-[0.18em] text-acid hover:bg-acid/20"
          >
            <RefreshCcw size={16} />
            Aggiorna
          </button>
          <button
            type="button"
            onClick={onDismiss}
            className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.03] px-3 py-2 text-xs uppercase tracking-[0.18em] text-white/70 hover:text-white"
          >
            <X size={16} />
            Chiudi
          </button>
        </div>
      </div>
    </div>
  );
}


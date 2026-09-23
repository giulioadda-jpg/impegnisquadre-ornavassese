import React from 'react';
import { Shield, Sparkles, RefreshCw, Trash2, Cpu } from 'lucide-react';

interface HeaderProps {
  onLoadExample: () => void;
  onClearAll: () => void;
  hasEvents: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onLoadExample, onClearAll, hasEvents }) => {
  return (
    <header className="border-b border-neutral-800 bg-neutral-900/90 backdrop-blur sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        {/* Brand & Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-black border border-neutral-700 flex items-center justify-center text-white shadow-inner font-black text-xl tracking-tight">
            UO
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-white">
                USD Ornavassese
              </h1>
              <span className="hidden sm:inline-block text-xs font-semibold px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 border border-neutral-700">
                1080×1350 px (4:5)
              </span>
            </div>
            <p className="text-xs text-neutral-400 flex items-center gap-1.5">
              <span>Generatore Locandine Social Impegni Squadre</span>
              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                <Cpu className="w-3 h-3" />
                OCR Locale nel Browser
              </span>
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onLoadExample}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 transition cursor-pointer"
            title="Carica dati di esempio realistici"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Carica Esempio</span>
          </button>

          {hasEvents && (
            <button
              type="button"
              onClick={onClearAll}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md bg-neutral-800/60 hover:bg-red-950/40 text-neutral-400 hover:text-red-300 border border-neutral-800 hover:border-red-900/50 transition cursor-pointer"
              title="Azzera testo ed eventi"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Pulisci</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

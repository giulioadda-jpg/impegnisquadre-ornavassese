import React from 'react';
import {
  ListFilter,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Copy,
  Clock,
  MapPin,
  Trophy,
  Tag,
  Layers,
} from 'lucide-react';
import { ScheduleEvent, EVENTS_PER_PAGE } from '../types';
import { detectBadgeType } from '../utils/parser';

interface EventsManagerProps {
  events: ScheduleEvent[];
  onUpdateEvent: (id: string, field: keyof ScheduleEvent, value: string) => void;
  onAddEvent: () => void;
  onRemoveEvent: (id: string) => void;
  onMoveEvent: (index: number, direction: 'up' | 'down') => void;
  onDuplicateEvent: (id: string) => void;
}

export const EventsManager: React.FC<EventsManagerProps> = ({
  events,
  onUpdateEvent,
  onAddEvent,
  onRemoveEvent,
  onMoveEvent,
  onDuplicateEvent,
}) => {
  const totalEvents = events.length;
  const totalPages = Math.max(1, Math.ceil(totalEvents / EVENTS_PER_PAGE));

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 sm:p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-neutral-800 text-amber-400 border border-neutral-700">
            <ListFilter className="w-4 h-4" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-white">
                Schede Gara ({totalEvents})
              </h2>
              {totalPages > 1 && (
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/30">
                  {totalPages} Pagine
                </span>
              )}
            </div>
            <p className="text-xs text-neutral-400">
              Max 5 gare per scheda grafica (1080×1350 px) con impaginazione automatica
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onAddEvent}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md bg-amber-400 hover:bg-amber-300 text-black shadow-sm transition cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Aggiungi Gara</span>
        </button>
      </div>

      {totalEvents === 0 ? (
        <div className="p-6 text-center border border-dashed border-neutral-800 rounded-lg text-neutral-400 space-y-2">
          <p className="text-sm font-medium text-neutral-300">
            Nessuna gara presente
          </p>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            Incolla il testo nel riquadro, carica uno screenshot o fai clic su "Aggiungi Gara" per generare le schede calendario.
          </p>
          <button
            type="button"
            onClick={onAddEvent}
            className="mt-2 text-xs text-amber-400 hover:text-amber-300 underline font-medium cursor-pointer"
          >
            + Crea prima scheda gara
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {events.map((event, index) => {
            const currentBadge = event.badge || detectBadgeType(event.category, event.match);
            const pageIndex = Math.floor(index / EVENTS_PER_PAGE);
            const isFirstOfPage = index % EVENTS_PER_PAGE === 0;

            return (
              <React.Fragment key={event.id}>
                {/* Page Separation Header if multi-page */}
                {totalPages > 1 && isFirstOfPage && (
                  <div className="flex items-center gap-2 pt-2 pb-1 border-t border-neutral-800 first:border-0 first:pt-0">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded border border-amber-400/20">
                      <Layers className="w-3.5 h-3.5" />
                      PAGINA {pageIndex + 1} DI {totalPages}
                    </span>
                    <span className="text-[11px] text-neutral-500">
                      (Gare #{pageIndex * EVENTS_PER_PAGE + 1} - #{Math.min(totalEvents, (pageIndex + 1) * EVENTS_PER_PAGE)})
                    </span>
                  </div>
                )}

                <div className="relative bg-[#141414] border border-[#2a2a2a] hover:border-[#383838] rounded-xl p-3.5 sm:p-4 transition space-y-3 group pl-5 overflow-hidden shadow-sm">
                  {/* 4px solid light-gray accent bar representing canvas chiaroscuro style */}
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#E5E5E5]" />

                  {/* Card header row with category, badge pill, and GARA #X */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#222222] pb-2.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded border border-[#333333] text-[#888888] bg-[#1c1c1c]">
                        GARA #{index + 1}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold tracking-wider bg-[#262626] border border-[#404040] text-[#D4D4D4] uppercase">
                        {currentBadge}
                      </span>
                      <span className="text-xs font-bold text-[#F5F5F5] uppercase tracking-wide truncate max-w-[220px] sm:max-w-xs">
                        {event.category || 'IMPEGNO SQUADRA'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      {/* Move Up */}
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => onMoveEvent(index, 'up')}
                        className="p-1 rounded text-neutral-400 hover:text-white hover:bg-neutral-800 disabled:opacity-30 disabled:hover:bg-transparent transition cursor-pointer"
                        title="Sposta prima"
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>

                      {/* Move Down */}
                      <button
                        type="button"
                        disabled={index === events.length - 1}
                        onClick={() => onMoveEvent(index, 'down')}
                        className="p-1 rounded text-neutral-400 hover:text-white hover:bg-neutral-800 disabled:opacity-30 disabled:hover:bg-transparent transition cursor-pointer"
                        title="Sposta dopo"
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>

                      {/* Duplicate */}
                      <button
                        type="button"
                        onClick={() => onDuplicateEvent(event.id)}
                        className="p-1 rounded text-neutral-400 hover:text-white hover:bg-neutral-800 transition cursor-pointer"
                        title="Duplica gara"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => onRemoveEvent(event.id)}
                        className="p-1 rounded text-neutral-400 hover:text-red-400 hover:bg-red-950/30 transition cursor-pointer"
                        title="Elimina gara"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Form Grid corresponding to Canvas fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs">
                    {/* Category Title */}
                    <div className="sm:col-span-8 space-y-1">
                      <label className="text-[11px] font-semibold text-neutral-300 flex items-center gap-1.5">
                        <span>Titolo Categoria / Squadra</span>
                      </label>
                      <input
                        type="text"
                        value={event.category}
                        onChange={(e) => onUpdateEvent(event.id, 'category', e.target.value)}
                        placeholder="es. TORNEO 2016 2017 U11"
                        className="w-full bg-[#181818] border border-[#333333] rounded px-2.5 py-1.5 text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-neutral-400 font-medium"
                      />
                    </div>

                    {/* Badge Label */}
                    <div className="sm:col-span-4 space-y-1">
                      <label className="text-[11px] font-semibold text-neutral-300 flex items-center gap-1.5">
                        <Tag className="w-3 h-3 text-neutral-400" />
                        <span>Tipologia (Badge)</span>
                      </label>
                      <input
                        type="text"
                        value={event.badge || ''}
                        onChange={(e) => onUpdateEvent(event.id, 'badge', e.target.value.toUpperCase())}
                        placeholder={detectBadgeType(event.category, event.match)}
                        className="w-full bg-[#181818] border border-[#333333] rounded px-2.5 py-1.5 text-[#D4D4D4] placeholder-neutral-500 focus:outline-none focus:border-neutral-400 uppercase text-center font-bold"
                      />
                    </div>

                    {/* Line 1: Clock Icon + Date & Time */}
                    <div className="sm:col-span-12 space-y-1">
                      <label className="text-[11px] font-semibold text-neutral-300 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#9E9E9E] stroke-[2.2]" />
                        <span>Data e Orario (Canvas #EEEEEE)</span>
                      </label>
                      <input
                        type="text"
                        value={event.date}
                        onChange={(e) => onUpdateEvent(event.id, 'date', e.target.value)}
                        placeholder="es. SABATO 26 SETTEMBRE 2026 (14:00 - 15:30)"
                        className="w-full bg-[#181818] border border-[#333333] rounded px-2.5 py-1.5 text-[#EEEEEE] placeholder-neutral-600 focus:outline-none focus:border-neutral-400 font-bold"
                      />
                    </div>

                    {/* Line 2: MapPin Icon + Location / Address */}
                    <div className="sm:col-span-12 space-y-1">
                      <label className="text-[11px] font-semibold text-neutral-300 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#9E9E9E] stroke-[2.2]" />
                        <span>Indirizzo / Luogo (Canvas #CCCCCC)</span>
                      </label>
                      <input
                        type="text"
                        value={event.location}
                        onChange={(e) => onUpdateEvent(event.id, 'location', e.target.value)}
                        placeholder="es. Corso Sempione 200 - 28883 Gravellona Toce VB"
                        className="w-full bg-[#181818] border border-[#333333] rounded px-2.5 py-1.5 text-[#CCCCCC] placeholder-neutral-600 focus:outline-none focus:border-neutral-400"
                      />
                    </div>

                    {/* Line 3: Trophy Icon + Match / Opponent */}
                    <div className="sm:col-span-12 space-y-1">
                      <label className="text-[11px] font-semibold text-neutral-300 flex items-center gap-1.5">
                        <Trophy className="w-3.5 h-3.5 text-[#9E9E9E] stroke-[2.2]" />
                        <span>Dettaglio Incontro / Squadre (Canvas #CCCCCC)</span>
                      </label>
                      <input
                        type="text"
                        value={event.match}
                        onChange={(e) => onUpdateEvent(event.id, 'match', e.target.value)}
                        placeholder="es. ASD Gravellona San Pietro - USD Ornavassese"
                        className="w-full bg-[#181818] border border-[#333333] rounded px-2.5 py-1.5 text-[#CCCCCC] placeholder-neutral-600 focus:outline-none focus:border-neutral-400 font-bold"
                      />
                    </div>
                  </div>
                </div>
              </React.Fragment>
            );
          })}
        </div>
      )}
    </div>
  );
};

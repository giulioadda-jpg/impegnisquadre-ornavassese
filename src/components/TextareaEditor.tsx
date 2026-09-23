import React, { useState } from 'react';
import { AlignLeft, RefreshCw, Wand2, HelpCircle, Copy, Check } from 'lucide-react';

interface TextareaEditorProps {
  rawText: string;
  setRawText: (text: string) => void;
  onParseText: (text: string) => void;
  onSyncFromEvents: () => void;
  eventsCount: number;
}

export const TextareaEditor: React.FC<TextareaEditorProps> = ({
  rawText,
  setRawText,
  onParseText,
  onSyncFromEvents,
  eventsCount,
}) => {
  const [copied, setCopied] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const handleCopy = () => {
    if (!rawText) return;
    navigator.clipboard.writeText(rawText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setRawText(newText);
    // Auto-parse on typing or pasting
    onParseText(newText);
  };

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 sm:p-5 shadow-sm space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-neutral-800 text-amber-400 border border-neutral-700">
            <AlignLeft className="w-4 h-4" />
          </span>
          <div>
            <h2 className="text-sm font-semibold text-white">
              Inserimento e Modifica Testuale
            </h2>
            <p className="text-xs text-neutral-400">
              Incolla o modifica qui il testo degli appuntamenti
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowHelp(!showHelp)}
            className="text-xs text-neutral-400 hover:text-neutral-200 flex items-center gap-1 px-2 py-1 rounded bg-neutral-800/80 border border-neutral-700 transition cursor-pointer"
            title="Formati testo supportati"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Formato</span>
          </button>

          {rawText && (
            <button
              type="button"
              onClick={handleCopy}
              className="text-xs text-neutral-300 hover:text-white flex items-center gap-1 px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 transition cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{copied ? 'Copiato' : 'Copia'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={onSyncFromEvents}
            className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 px-2.5 py-1 rounded bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/30 transition cursor-pointer"
            title="Rigenera il testo dalla lista degli eventi modificati"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Da Eventi ({eventsCount})</span>
          </button>
        </div>
      </div>

      {showHelp && (
        <div className="p-3 bg-neutral-950 rounded-lg border border-neutral-800 text-xs text-neutral-300 space-y-1.5">
          <p className="font-semibold text-white">
            💡 Il parser selettivo filtra automaticamente il rumore (barra iOS, notifiche, pulsanti):
          </p>
          <div className="bg-neutral-900/80 p-2.5 rounded font-mono text-[11px] text-neutral-300 leading-relaxed border border-neutral-800">
            Amichevole 2018 2019 U9<br />
            Tipo di evento: Amichevole<br />
            Data e orario: Sabato 26 settembre 2026 dalle 14:00 alle 15:30<br />
            Luogo: Corso Sempione 200 - 28883 Gravellona Toce VB<br />
            Descrizione: ASD Gravellona San Pietro - USD Ornavassese
          </div>
          <p className="text-[11px] text-neutral-400">
            Orario di stato (15:18), batteria, etichette "Dettagli", "Visibilità" e pulsanti come "Condividi" o "Modifica" vengono rimossi in automatico.
          </p>
        </div>
      )}

      {/* Main Textarea */}
      <div className="relative">
        <textarea
          rows={7}
          value={rawText}
          onChange={handleTextChange}
          placeholder="Inserisci o incolla qui gli appuntamenti (es. testo estratto dall'OCR o messaggi WhatsApp)..."
          className="w-full bg-neutral-950 border border-neutral-700/80 rounded-lg p-3 text-xs sm:text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-amber-400/50 focus:border-amber-400 font-mono transition leading-relaxed"
        />
        <div className="flex items-center justify-between mt-1 text-[11px] text-neutral-500">
          <span>Il testo viene analizzato in tempo reale.</span>
          <button
            type="button"
            onClick={() => onParseText(rawText)}
            className="text-amber-400/90 hover:text-amber-300 flex items-center gap-1 font-medium hover:underline cursor-pointer"
          >
            <Wand2 className="w-3 h-3" /> Forza nuova scansione
          </button>
        </div>
      </div>
    </div>
  );
};

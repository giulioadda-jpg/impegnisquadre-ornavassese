import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  Download,
  Copy,
  Maximize2,
  Check,
  Sliders,
  X,
  FileCheck,
  ChevronLeft,
  ChevronRight,
  Layers,
  Upload,
  RotateCcw,
} from 'lucide-react';
import { ScheduleEvent, GraphicSettings, EVENTS_PER_PAGE } from '../types';
import {
  renderScheduleToCanvas,
  downloadCanvasAsPng,
  copyCanvasToClipboard,
  downloadAllPages,
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  CLUB_LOGO_BASE64,
} from '../utils/canvasRenderer';

interface PreviewCanvasProps {
  events: ScheduleEvent[];
  settings: GraphicSettings;
  setSettings: React.Dispatch<React.SetStateAction<GraphicSettings>>;
}

export const PreviewCanvas: React.FC<PreviewCanvasProps> = ({
  events,
  settings,
  setSettings,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentPage, setCurrentPage] = useState<number>(0); // 0-indexed
  const [copied, setCopied] = useState(false);
  const [downloadingAll, setDownloadingAll] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [previewDataUrl, setPreviewDataUrl] = useState<string>('');

  const totalEvents = events?.length || 0;
  const totalPages = Math.max(1, Math.ceil(totalEvents / EVENTS_PER_PAGE));

  // Ensure currentPage remains in bounds if events are deleted or changed
  useEffect(() => {
    if (currentPage >= totalPages) {
      setCurrentPage(Math.max(0, totalPages - 1));
    }
  }, [totalPages, currentPage]);

  // Re-render canvas whenever events, settings or currentPage change
  const renderCurrent = useCallback(() => {
    if (canvasRef.current) {
      renderScheduleToCanvas(
        canvasRef.current,
        events,
        settings,
        currentPage,
        () => {
          // Callback when logo finishes asynchronous load
          if (canvasRef.current) {
            renderScheduleToCanvas(canvasRef.current, events, settings, currentPage);
            try {
              setPreviewDataUrl(canvasRef.current.toDataURL('image/png'));
            } catch (err) {
              // ignore
            }
          }
        }
      );
      try {
        setPreviewDataUrl(canvasRef.current.toDataURL('image/png'));
      } catch (err) {
        // ignore
      }
    }
  }, [events, settings, currentPage]);

  useEffect(() => {
    renderCurrent();
  }, [renderCurrent]);

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(0, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1));
  };

  const handleDownloadCurrent = () => {
    if (canvasRef.current) {
      const now = new Date();
      const dateStr = `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}`;
      const suffix = totalPages > 1 ? `-pag-${currentPage + 1}` : '';
      downloadCanvasAsPng(canvasRef.current, `locandina-impegni-ornavassese-${dateStr}${suffix}.png`);
    }
  };

  const handleDownloadAll = async () => {
    if (downloadingAll) return;
    setDownloadingAll(true);
    try {
      const now = new Date();
      const dateStr = `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}`;
      await downloadAllPages(events, settings, `locandina-impegni-ornavassese-${dateStr}`);
    } finally {
      setDownloadingAll(false);
    }
  };

  const handleCopy = async () => {
    if (canvasRef.current) {
      const success = await copyCanvasToClipboard(canvasRef.current);
      if (success) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2200);
      }
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (base64) {
        setSettings((prev) => ({ ...prev, customLogo: base64 }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleResetLogo = () => {
    setSettings((prev) => ({ ...prev, customLogo: undefined }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const currentStartEvent = currentPage * EVENTS_PER_PAGE + 1;
  const currentEndEvent = Math.min(totalEvents, (currentPage + 1) * EVENTS_PER_PAGE);

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 sm:p-5 shadow-sm space-y-4">
      {/* Header bar */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-white">
              Anteprima Grafica 4:5
            </h2>
            <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-black text-neutral-300 border border-neutral-700">
              1080×1350 px
            </span>
            {totalPages > 1 && (
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/30">
                {totalPages} Pagine Carosello
              </span>
            )}
          </div>
          <p className="text-xs text-neutral-400">
            {totalPages > 1
              ? `Pagina ${currentPage + 1} di ${totalPages} (Gare #${currentStartEvent} - #${currentEndEvent})`
              : 'Logo USD Ornavassese • Testata riga singola • Scale di grigio'}
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setShowSettings(!showSettings)}
            className={`p-1.5 rounded-lg border transition cursor-pointer ${
              showSettings
                ? 'bg-amber-400/20 border-amber-400 text-amber-300'
                : 'bg-neutral-800 border-neutral-700 text-neutral-300 hover:text-white'
            }`}
            title="Personalizza opzioni logo e grafica"
          >
            <Sliders className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setIsFullscreen(true)}
            className="p-1.5 rounded-lg bg-neutral-800 border border-neutral-700 text-neutral-300 hover:text-white transition cursor-pointer"
            title="Ingrandisci anteprima"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Settings Drawer */}
      {showSettings && (
        <div className="p-3.5 bg-neutral-950 border border-neutral-800 rounded-lg space-y-3.5 text-xs">
          <div className="flex items-center justify-between text-neutral-300 font-medium">
            <span>Configurazione Logo & Testata</span>
            <button
              onClick={() => setShowSettings(false)}
              className="text-neutral-500 hover:text-neutral-300 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Logo Management */}
          <div className="p-3 rounded-lg bg-neutral-900 border border-neutral-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-neutral-200 text-xs">
                Logo Ufficiale USD Ornavassese:
              </span>
              {settings.customLogo && (
                <button
                  type="button"
                  onClick={handleResetLogo}
                  className="flex items-center gap-1 text-[11px] text-neutral-400 hover:text-amber-400 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Ripristina predefinito</span>
                </button>
              )}
            </div>

            <p className="text-[11px] text-neutral-400 leading-relaxed">
              Il logo è gestito permanentemente nel codice tramite la costante{' '}
              <code className="text-amber-300 bg-neutral-950 px-1 py-0.5 rounded border border-neutral-800 font-mono">
                CLUB_LOGO_BASE64
              </code>{' '}
              in <code className="text-neutral-300 font-mono">src/utils/canvasRenderer.ts</code>.
              Viene renderizzato centrato sopra il titolo (~84×84 px) con trasparenza alpha nativa.
            </p>

            <div className="flex items-center gap-2 pt-1">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/webp,image/svg+xml"
                onChange={handleLogoUpload}
                className="hidden"
                id="logo-upload"
              />
              <label
                htmlFor="logo-upload"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-[11px] font-medium border border-neutral-700 cursor-pointer transition"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Carica file PNG trasparente (test istantaneo)</span>
              </label>

              {settings.customLogo && (
                <span className="text-[11px] text-emerald-400 font-medium">
                  ✓ PNG caricato attivo
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-neutral-300">
            <div className="p-2.5 rounded bg-neutral-900 border border-neutral-800 space-y-1">
              <span className="text-[11px] font-semibold text-neutral-200">Titolo su riga singola:</span>
              <p className="text-[11px] text-neutral-400">
                "IMPEGNI SQUADRE • USD ORNAVASSESE" a 38px con separatore "•" grigio (#888888) e linea divisoria sottile (#262626).
              </p>
            </div>
            <div className="p-2.5 rounded bg-neutral-900 border border-neutral-800 space-y-1">
              <span className="text-[11px] font-semibold text-neutral-200">Layout fisso carosello:</span>
              <p className="text-[11px] text-neutral-400">
                Fino a 5 eventi per pagina con dimensioni e padding identici e numerazione sequenziale continua.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Carousel Navigation Toolbar if totalPages > 1 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs">
          <button
            type="button"
            disabled={currentPage === 0}
            onClick={handlePrevPage}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-neutral-800 hover:bg-neutral-700 text-neutral-200 disabled:opacity-30 disabled:hover:bg-neutral-800 transition cursor-pointer font-medium"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Precedente</span>
          </button>

          {/* Dots & Page Counter */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              {Array.from({ length: totalPages }).map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentPage(idx)}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    currentPage === idx
                      ? 'w-6 bg-amber-400'
                      : 'w-2 bg-neutral-700 hover:bg-neutral-500'
                  }`}
                  title={`Vai a Pagina ${idx + 1}`}
                />
              ))}
            </div>
            <span className="text-xs font-semibold text-neutral-300 ml-1">
              Pagina {currentPage + 1} di {totalPages}
            </span>
          </div>

          <button
            type="button"
            disabled={currentPage === totalPages - 1}
            onClick={handleNextPage}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-neutral-800 hover:bg-neutral-700 text-neutral-200 disabled:opacity-30 disabled:hover:bg-neutral-800 transition cursor-pointer font-medium"
          >
            <span className="hidden sm:inline">Successiva</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Canvas Container maintaining exact 4:5 ratio */}
      <div className="relative flex justify-center items-center bg-neutral-950 p-2 sm:p-4 rounded-xl border border-neutral-800 shadow-inner overflow-hidden">
        <div className="relative w-full max-w-[390px] aspect-[4/5] rounded-lg shadow-2xl overflow-hidden border border-neutral-800 bg-[#080808] flex items-center justify-center">
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            className="w-full h-full object-contain block select-none"
            style={{ imageRendering: 'crisp-edges' }}
          />
        </div>
      </div>

      {/* Official Guidelines Info Banner */}
      <div className="bg-black/60 border border-neutral-800/80 rounded-lg p-2.5 flex items-start gap-2 text-[11px] text-neutral-400">
        <FileCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        <div className="leading-snug">
          <span className="text-neutral-200 font-semibold">Testata USD Ornavassese: </span>
          Logo PNG trasparente centrato in alto (~84px), titolo orizzontale su riga singola <span className="text-white font-bold">"IMPEGNI SQUADRE • USD ORNAVASSESE"</span> con punto medio in grigio (#888888), linea sottile divisoria (#262626) e schede gara in chiaroscuro (#141414 con accento #E5E5E5).
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2 pt-1">
        <div className="flex flex-col sm:flex-row gap-2.5">
          {/* Download Current Page */}
          <button
            type="button"
            onClick={handleDownloadCurrent}
            className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-sm shadow-lg shadow-amber-400/20 active:scale-[0.99] transition cursor-pointer"
          >
            <Download className="w-4 h-4 stroke-[2.5]" />
            <span>
              {totalPages > 1
                ? `Scarica Pagina ${currentPage + 1} PNG`
                : 'Scarica Grafica PNG (1080×1350)'}
            </span>
          </button>

          {/* Download All Pages if totalPages > 1 */}
          {totalPages > 1 && (
            <button
              type="button"
              disabled={downloadingAll}
              onClick={handleDownloadAll}
              className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white hover:bg-neutral-200 text-black font-bold text-sm shadow-md active:scale-[0.99] transition cursor-pointer disabled:opacity-50"
              title="Scarica tutte le pagine del carosello in sequenza ad alta risoluzione"
            >
              <Layers className="w-4 h-4 stroke-[2.5]" />
              <span>{downloadingAll ? 'Download in corso...' : `Scarica Tutte (${totalPages} PNG)`}</span>
            </button>
          )}

          {/* Copy to clipboard */}
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-semibold text-sm border border-neutral-700 transition cursor-pointer"
            title="Copia l'immagine corrente negli appunti per incollarla in WhatsApp o Telegram"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400 stroke-[2.5]" />
                <span className="text-emerald-300">Copiata!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span className="hidden sm:inline">Copia</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Fullscreen Modal with Carousel Navigation */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col p-4 sm:p-6">
          <div className="flex items-center justify-between text-white max-w-4xl w-full mx-auto pb-4">
            <div className="flex items-center gap-2">
              <span className="font-bold text-base">Anteprima Ingrandita (1080×1350 px)</span>
              {totalPages > 1 && (
                <span className="text-xs bg-amber-400 text-black font-bold px-2 py-0.5 rounded">
                  Pagina {currentPage + 1} di {totalPages}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDownloadCurrent}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-400 text-black font-semibold text-xs cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                Scarica PNG
              </button>
              <button
                type="button"
                onClick={() => setIsFullscreen(false)}
                className="p-1.5 rounded-lg bg-neutral-800 text-neutral-300 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 relative flex items-center justify-center overflow-auto p-2">
            {totalPages > 1 && (
              <>
                <button
                  type="button"
                  disabled={currentPage === 0}
                  onClick={handlePrevPage}
                  className="absolute left-4 z-10 p-3 rounded-full bg-neutral-900/80 hover:bg-neutral-800 text-white disabled:opacity-20 border border-neutral-700 transition cursor-pointer"
                  title="Pagina Precedente"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  type="button"
                  disabled={currentPage === totalPages - 1}
                  onClick={handleNextPage}
                  className="absolute right-4 z-10 p-3 rounded-full bg-neutral-900/80 hover:bg-neutral-800 text-white disabled:opacity-20 border border-neutral-700 transition cursor-pointer"
                  title="Pagina Successiva"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            {previewDataUrl && (
              <img
                src={previewDataUrl}
                alt={`Locandina USD Ornavassese Pagina ${currentPage + 1}`}
                className="max-h-[85vh] w-auto aspect-[4/5] object-contain border border-neutral-800 rounded shadow-2xl"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

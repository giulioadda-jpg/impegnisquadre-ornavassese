import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, Image as ImageIcon, CheckCircle, AlertTriangle, Loader2, Sparkles, Files, Clipboard } from 'lucide-react';
import { recognizeImagesLocally } from '../services/ocrService';
import { OcrStatus } from '../types';

interface OcrUploadZoneProps {
  onTextExtracted: (extractedText: string) => void;
  ocrStatus: OcrStatus;
  setOcrStatus: React.Dispatch<React.SetStateAction<OcrStatus>>;
}

export const OcrUploadZone: React.FC<OcrUploadZoneProps> = ({
  onTextExtracted,
  ocrStatus,
  setOcrStatus,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFileNames, setSelectedFileNames] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Allow pasting screenshots directly from clipboard (e.g. Snipping tool / Stamp / Command+V)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      const imageFiles: File[] = [];
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) imageFiles.push(file);
        }
      }

      if (imageFiles.length > 0) {
        processFiles(imageFiles);
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  const processFiles = async (files: File[]) => {
    if (!files || files.length === 0) return;

    setSelectedFileNames(files.map((f) => f.name || 'Screenshot'));
    setOcrStatus({
      isProcessing: true,
      stage: 'Inizializzazione motore OCR Tesseract (Client-side)...',
      progress: 5,
      fileCount: files.length,
      currentFileIndex: 1,
      error: null,
    });

    try {
      const extractedText = await recognizeImagesLocally(files, (status) => {
        setOcrStatus(status);
      });

      if (extractedText && extractedText.trim()) {
        onTextExtracted(extractedText);
      } else {
        setOcrStatus((prev) => ({
          ...prev,
          isProcessing: false,
          error: 'Nessun testo rilevato chiaramente nelle immagini. Prova con uno screenshot a risoluzione maggiore o inserisci il testo manualmente.',
        }));
      }
    } catch (err: any) {
      console.error('OCR Error:', err);
      setOcrStatus((prev) => ({
        ...prev,
        isProcessing: false,
        error:
          err.message ||
          'Errore durante il caricamento di Tesseract.js. Puoi inserire o incollare il testo direttamente nell\'area sottostante.',
      }));
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);

    const files: File[] = [];
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      for (let i = 0; i < e.dataTransfer.files.length; i++) {
        const file = e.dataTransfer.files[i];
        if (file.type.startsWith('image/')) {
          files.push(file);
        }
      }
    }

    if (files.length > 0) {
      processFiles(files);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      processFiles(filesArray);
      // reset input value so re-selecting the same file fires change
      e.target.value = '';
    }
  };

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 sm:p-5 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-neutral-800 text-amber-400 border border-neutral-700">
            <UploadCloud className="w-4 h-4" />
          </span>
          <div>
            <h2 className="text-sm font-semibold text-white">
              Motore OCR Locale (Screenshot)
            </h2>
            <p className="text-xs text-neutral-400">
              Analisi 100% nel browser con Tesseract.js (Zero costi, privacy assoluta)
            </p>
          </div>
        </div>
        <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-neutral-400 bg-neutral-800/80 px-2 py-0.5 rounded border border-neutral-700">
          <Clipboard className="w-3 h-3" /> Incolla con Ctrl+V
        </span>
      </div>

      {/* Drop Area */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-lg p-6 sm:p-8 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2 ${
          isDragOver
            ? 'border-amber-400 bg-amber-400/5'
            : 'border-neutral-700/80 hover:border-neutral-500 bg-neutral-950/50 hover:bg-neutral-950/80'
        } ${ocrStatus.isProcessing ? 'pointer-events-none opacity-80' : ''}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          className="hidden"
        />

        {ocrStatus.isProcessing ? (
          <div className="flex flex-col items-center gap-3 py-2 w-full max-w-xs">
            <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
            <div className="w-full text-center">
              <p className="text-xs font-semibold text-white truncate">
                {ocrStatus.stage}
              </p>
              <div className="w-full bg-neutral-800 rounded-full h-2 mt-2 overflow-hidden border border-neutral-700">
                <div
                  className="bg-amber-400 h-full transition-all duration-300 rounded-full"
                  style={{ width: `${ocrStatus.progress}%` }}
                />
              </div>
              <p className="text-[10px] text-neutral-400 mt-1">
                Progresso: {ocrStatus.progress}% • File {ocrStatus.currentFileIndex} di {ocrStatus.fileCount}
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="w-12 h-12 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-300 border border-neutral-700 shadow-sm">
              <Files className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">
                Trascina qui uno o più screenshot o <span className="text-amber-400 underline underline-offset-2">sfoglia</span>
              </p>
              <p className="text-xs text-neutral-400 mt-0.5">
                Supporta messaggi WhatsApp, circolari LND, fogli gara (JPG, PNG, WebP)
              </p>
            </div>
            {selectedFileNames.length > 0 && !ocrStatus.error && (
              <div className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium bg-emerald-950/40 border border-emerald-900/50 px-2 py-0.5 rounded">
                <CheckCircle className="w-3 h-3" />
                Ultima scansione: {selectedFileNames.length} file elaborati
              </div>
            )}
          </>
        )}
      </div>

      {/* Error alert with manual fallback hint */}
      {ocrStatus.error && (
        <div className="p-3 rounded-lg bg-red-950/40 border border-red-900/60 text-xs text-red-200 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-red-300">Avviso OCR</p>
            <p className="text-red-300/90">{ocrStatus.error}</p>
            <p className="text-neutral-300 text-[11px]">
              👉 Puoi digitare o incollare direttamente il testo degli impegni nella casella di testo qui sotto.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

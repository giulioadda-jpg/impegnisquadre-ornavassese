import { OcrStatus } from '../types';

declare global {
  interface Window {
    Tesseract?: {
      recognize: (
        image: string | File | Blob | HTMLCanvasElement,
        lang?: string,
        options?: {
          logger?: (arg: { status: string; progress?: number }) => void;
        }
      ) => Promise<{
        data: {
          text: string;
        };
      }>;
    };
  }
}

/**
 * Ensures Tesseract.js is available on window.
 */
export async function ensureTesseractLoaded(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  if (window.Tesseract) return true;

  // Check if script tag is already in head
  const existingScript = document.querySelector('script[src*="tesseract.min.js"]');
  if (existingScript) {
    // Wait a brief moment in case it's still loading
    for (let i = 0; i < 20; i++) {
      if (window.Tesseract) return true;
      await new Promise((res) => setTimeout(res, 200));
    }
  }

  // If not yet available, dynamically inject
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';
    script.async = true;
    script.onload = () => {
      resolve(!!window.Tesseract);
    };
    script.onerror = () => {
      resolve(false);
    };
    document.head.appendChild(script);
  });
}

/**
 * Preprocess image on canvas to boost OCR clarity (contrast & grayscale)
 */
async function preprocessImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const maxDim = 2000;
          let width = img.width;
          let height = img.height;

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(e.target?.result as string);
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);

          // Get image data to enhance contrast
          const imgData = ctx.getImageData(0, 0, width, height);
          const data = imgData.data;

          // Grayscale + slight contrast stretch
          for (let i = 0; i < data.length; i += 4) {
            const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
            // Contrast adjustment
            const contrast = 1.15;
            const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
            const newGray = Math.min(255, Math.max(0, factor * (gray - 128) + 128));
            data[i] = newGray;
            data[i + 1] = newGray;
            data[i + 2] = newGray;
          }

          ctx.putImageData(imgData, 0, 0);
          resolve(canvas.toDataURL('image/png'));
        } catch {
          // Fallback to raw data url if canvas security or memory issue
          resolve(e.target?.result as string);
        }
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Recognizes text from one or more image files client-side.
 */
export async function recognizeImagesLocally(
  files: File[],
  onProgress: (status: OcrStatus) => void
): Promise<string> {
  const loaded = await ensureTesseractLoaded();
  if (!loaded || !window.Tesseract) {
    throw new Error(
      'Motore OCR Tesseract non disponibile. Verifica la connessione internet per il CDN o incolla manualmente il testo.'
    );
  }

  const results: string[] = [];
  const total = files.length;

  for (let i = 0; i < total; i++) {
    const file = files[i];
    onProgress({
      isProcessing: true,
      stage: `Pre-elaborazione screenshot ${i + 1} di ${total} (${file.name})...`,
      progress: Math.round((i / total) * 100),
      fileCount: total,
      currentFileIndex: i + 1,
    });

    const processedImageUrl = await preprocessImage(file);

    onProgress({
      isProcessing: true,
      stage: `Riconoscimento testo OCR (${i + 1}/${total})...`,
      progress: Math.round((i / total) * 100 + 5),
      fileCount: total,
      currentFileIndex: i + 1,
    });

    const recognized = await window.Tesseract.recognize(processedImageUrl, 'ita+eng', {
      logger: (m) => {
        if (m.progress !== undefined) {
          const subProgress = Math.round(m.progress * 100);
          const totalProgress = Math.round((i / total) * 100 + (subProgress / total) * 0.9);
          onProgress({
            isProcessing: true,
            stage: `${m.status === 'recognizing text' ? 'Lettura caratteri' : m.status}... (${subProgress}%)`,
            progress: Math.min(99, totalProgress),
            fileCount: total,
            currentFileIndex: i + 1,
          });
        }
      },
    });

    if (recognized?.data?.text) {
      results.push(recognized.data.text.trim());
    }
  }

  onProgress({
    isProcessing: false,
    stage: 'Analisi completata!',
    progress: 100,
    fileCount: total,
    currentFileIndex: total,
  });

  return results.join('\n\n--- NUOVO SCREENSHOT ---\n\n');
}

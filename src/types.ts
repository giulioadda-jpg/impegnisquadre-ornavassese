export interface ScheduleEvent {
  id: string;
  category: string; // Categoria / Squadra (es. "Torneo 2016 2017 U11" o "Amichevole U9")
  match: string;    // Dettaglio / Match (es. "ASD Gravellona San Pietro - USD Ornavassese")
  date: string;     // Data e Orario (es. "Sabato 26 settembre 2026 (13:30 - 18:00)")
  location: string; // Indirizzo / Luogo (es. "Località Praudina, 28857 Santa Maria Maggiore VB")
  badge?: string;   // Opzionale: es. "TORNEO", "AMICHEVOLE", "CAMPIONATO" (auto-rilevato se vuoto)
}

export const EVENTS_PER_PAGE = 5;

export type FontDensity = 'auto' | 'compact' | 'normal' | 'spacious';
export type BadgeStyle = 'solid' | 'outline';
export type SeparatorStyle = 'subtle' | 'dotted' | 'minimal' | 'none';

export interface GraphicSettings {
  density: FontDensity;
  badgeStyle: BadgeStyle;
  showDivider: boolean;
  customLogo?: string;
}

export interface OcrStatus {
  isProcessing: boolean;
  stage: string;
  progress: number; // 0 - 100
  fileCount: number;
  currentFileIndex: number;
  error?: string | null;
}


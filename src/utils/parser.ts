import { ScheduleEvent } from '../types';

export const INITIAL_EVENTS: ScheduleEvent[] = [];
export const EXAMPLE_EVENTS: ScheduleEvent[] = [];

const ITALIAN_DAYS_MAP: Record<string, string> = {
  lunedi: 'LUNEDÌ',
  lunedì: 'LUNEDÌ',
  martedi: 'MARTEDÌ',
  martedì: 'MARTEDÌ',
  mercoledi: 'MERCOLEDÌ',
  mercoledì: 'MERCOLEDÌ',
  giovedi: 'GIOVEDÌ',
  giovedì: 'GIOVEDÌ',
  venerdi: 'VENERDÌ',
  venerdì: 'VENERDÌ',
  sabato: 'SABATO',
  domenica: 'DOMENICA',
};

const ITALIAN_MONTHS_NAMES = [
  'GENNAIO', 'FEBBRAIO', 'MARZO', 'APRILE', 'MAGGIO', 'GIUGNO',
  'LUGLIO', 'AGOSTO', 'SETTEMBRE', 'OTTOBRE', 'NOVEMBRE', 'DICEMBRE',
];

const MONTHS_MAP_NUMERIC: Record<string, number> = {
  GENNAIO: 0,
  FEBBRAIO: 1,
  MARZO: 2,
  APRILE: 3,
  MAGGIO: 4,
  GIUGNO: 5,
  LUGLIO: 6,
  AGOSTO: 7,
  SETTEMBRE: 8,
  OTTOBRE: 9,
  NOVEMBRE: 10,
  DICEMBRE: 11,
};

export function detectBadgeType(category: string, match?: string): string {
  const combined = `${category || ''} ${match || ''}`.toUpperCase();
  if (combined.includes('TORNEO')) return 'TORNEO';
  if (combined.includes('AMICHEVOLE')) return 'AMICHEVOLE';
  if (combined.includes('CAMPIONATO')) return 'CAMPIONATO';
  if (combined.includes('COPPA')) return 'COPPA';
  if (combined.includes('PRIMI CALCI')) return 'PRIMI CALCI';
  if (combined.includes('PICCOLI AMICI')) return 'PICCOLI AMICI';
  if (combined.includes('ESORDIENTI')) return 'ESORDIENTI';
  if (combined.includes('PULCINI')) return 'PULCINI';
  if (combined.includes('JUNIORES')) return 'JUNIORES';
  if (combined.includes('ALLIEVI')) return 'ALLIEVI';
  if (combined.includes('GIOVANISSIMI')) return 'GIOVANISSIMI';
  if (combined.includes('PRIMA SQUADRA')) return '1ª SQUADRA';
  const uMatch = combined.match(/\bU\s*(\d{1,2})\b/);
  if (uMatch) return `U${uMatch[1]}`;
  return 'GARA';
}

export function normalizeDateAndOrario(raw: string): string {
  if (!raw || typeof raw !== 'string') return '';
  let str = raw.trim();

  str = str.replace(/^(data(\s*e\s*orario)?|quando|giorno|ora|orario)\s*[:=-]?\s*/i, '').trim();

  let timeStr = '';
  const rangeMatch = str.match(/(?:dalle\s*)?(\d{1,2})[:.](\d{2})\s*(?:-|–|—|alle|to)\s*(\d{1,2})[:.](\d{2})/i);
  if (rangeMatch) {
    const startH = rangeMatch[1].padStart(2, '0');
    const startM = rangeMatch[2];
    timeStr = `${startH}:${startM}`;
  } else {
    const singleMatch = str.match(/(?:ore|h)?\s*(\d{1,2})[:.](\d{2})/i);
    if (singleMatch) {
      const h = singleMatch[1].padStart(2, '0');
      const m = singleMatch[2];
      timeStr = `${h}:${m}`;
    }
  }

  let dayOfWeek = '';
  const dayMatch = str.match(/(lunedì|lunedi|martedì|martedi|mercoledì|mercoledi|giovedì|giovedi|venerdì|venerdi|sabato|domenica)/i);
  if (dayMatch) {
    dayOfWeek = ITALIAN_DAYS_MAP[dayMatch[1].toLowerCase()] || dayMatch[1].toUpperCase();
  }

  let day = '';
  let monthName = '';
  let year = '';

  const fullDateMatch = str.match(/(\d{1,2})\s+(gennaio|febbraio|marzo|aprile|maggio|giugno|luglio|agosto|settembre|ottobre|novembre|dicembre)\s*(\d{4})?/i);
  if (fullDateMatch) {
    day = fullDateMatch[1];
    monthName = fullDateMatch[2].toUpperCase();
    year = fullDateMatch[3] || '2026';
  } else {
    const numericDateMatch = str.match(/(\d{1,2})[\/.-](\d{1,2})(?:[\/.-](\d{2,4}))?/);
    if (numericDateMatch) {
      day = numericDateMatch[1];
      const monthNum = parseInt(numericDateMatch[2], 10);
      if (monthNum >= 1 && monthNum <= 12) {
        monthName = ITALIAN_MONTHS_NAMES[monthNum - 1];
      }
      if (numericDateMatch[3]) {
        year = numericDateMatch[3].length === 2 ? `20${numericDateMatch[3]}` : numericDateMatch[3];
      } else {
        year = '2026';
      }
    }
  }

  if (!dayOfWeek && day && monthName && year) {
    const monthIdx = ITALIAN_MONTHS_NAMES.indexOf(monthName);
    if (monthIdx !== -1) {
      const parsedDate = new Date(parseInt(year, 10), monthIdx, parseInt(day, 10));
      const dayIdx = parsedDate.getDay();
      const DAYS_ORDER = ['DOMENICA', 'LUNEDÌ', 'MARTEDÌ', 'MERCOLEDÌ', 'GIOVEDÌ', 'VENERDÌ', 'SABATO'];
      dayOfWeek = DAYS_ORDER[dayIdx];
    }
  }

  if (day && monthName) {
    const dayPrefix = dayOfWeek ? `${dayOfWeek} ` : '';
    const yearStr = year ? ` ${year}` : '';
    const timeFormatted = timeStr ? ` (${timeStr})` : '';
    return `${dayPrefix}${day} ${monthName}${yearStr}${timeFormatted}`.trim().toUpperCase();
  }

  str = str.replace(/[()]/g, '').trim();
  if (timeStr) {
    str = str.replace(new RegExp(timeStr.replace(/[-]/g, '[-–]'), 'i'), '')
      .replace(/dalle|alle|ore|-|–/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    return `${str} (${timeStr})`.toUpperCase();
  }

  return str.toUpperCase();
}

export function getEventTimestamp(dateStr: unknown): number {
  if (!dateStr || typeof dateStr !== 'string') {
    return Number.MAX_SAFE_INTEGER;
  }

  const upper = dateStr.toUpperCase();
  if (upper.includes('DA DEFINIRE')) {
    return Number.MAX_SAFE_INTEGER;
  }

  let day = 1;
  let month = 0;
  let year = 2026;

  try {
    const fullDateMatch = upper.match(/(\d{1,2})\s+([A-Z]+)\s*(\d{4})?/);
    if (fullDateMatch) {
      day = parseInt(fullDateMatch[1], 10);
      const monthKey = fullDateMatch[2];
      if (MONTHS_MAP_NUMERIC[monthKey] !== undefined) {
        month = MONTHS_MAP_NUMERIC[monthKey];
      }
      if (fullDateMatch[3]) {
        year = parseInt(fullDateMatch[3], 10);
      }
    } else {
      const numMatch = upper.match(/(\d{1,2})[\/.-](\d{1,2})(?:[\/.-](\d{2,4}))?/);
      if (numMatch) {
        day = parseInt(numMatch[1], 10);
        month = Math.max(0, parseInt(numMatch[2], 10) - 1);
        if (numMatch[3]) {
          year = numMatch[3].length === 2 ? parseInt(`20${numMatch[3]}`, 10) : parseInt(numMatch[3], 10);
        }
      }
    }

    let hours = 0;
    let minutes = 0;
    const timeMatch = upper.match(/(\d{1,2})[:.](\d{2})/);
    if (timeMatch) {
      hours = parseInt(timeMatch[1], 10);
      minutes = parseInt(timeMatch[2], 10);
    }

    const t = new Date(year, month, day, hours, minutes).getTime();
    return Number.isNaN(t) ? Number.MAX_SAFE_INTEGER : t;
  } catch {
    return Number.MAX_SAFE_INTEGER;
  }
}

function isStopLine(line: string): boolean {
  const trimmed = line.trim().toLowerCase();
  return (
    /^(visibilit|pubblico|scheda\s*pubblica|condividi|note|modifica|duplica|elimina)\b/i.test(trimmed) ||
    /\b(visib|visb|vist|visita|visibile)\b/i.test(trimmed) ||
    /visibile\s+anche/i.test(trimmed) ||
    /condividi/i.test(trimmed)
  );
}

function isNoiseLine(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed) return true;

  if (/^\s*\d{1,2}[:.]\d{2}\s*$/.test(trimmed)) return true;
  if (/^\s*(\d{1,3}\s*%|[45]g|lte|wi-?fi|tim|vodafone|wind\s*tre|iliad|fastweb|kena|ho\.)\s*$/i.test(trimmed)) return true;
  if (/\b\d{1,2}[:.]\d{2}\b/.test(trimmed) && (/\b([45]g|lte|wi-?fi|\d{1,3}%)\b/i.test(trimmed))) return true;

  if (/^([<‹«x✕✖•●▪►@]\s*)?(dettagli(\s+evento)?|partecipanti|impostazioni|indietro|back|eventi|calendario|info|chiudi|menu)\s*$/i.test(trimmed)) return true;
  if (/^(creato\s+da|gestito\s+da|organizzato\s+da|amministratore|inviti|convocazioni|ruolo|autore)\b/i.test(trimmed)) return true;

  return isStopLine(trimmed);
}

function isSectionLabel(line: string): boolean {
  const lower = line.trim().toLowerCase();
  return (
    /^tipo(\s+di)?\s+evento\b/i.test(lower) ||
    /^data(\s*e\s*orario)?\b/i.test(lower) ||
    /^luogo\b/i.test(lower) ||
    /^indirizzo\b/i.test(lower) ||
    /^campo\b/i.test(lower) ||
    /^descrizione\b/i.test(lower) ||
    /^dettagli(o)?\b/i.test(lower) ||
    /^visibilit[àa]\b/i.test(lower) ||
    /^creato\s+da\b/i.test(lower) ||
    /^gestito\s+da\b/i.test(lower)
  );
}

function splitIntoEventBlocks(rawText: string): string[] {
  if (rawText.includes('--- NUOVO SCREENSHOT ---')) {
    return rawText
      .split('--- NUOVO SCREENSHOT ---')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  }

  if (/\n\s*[-=_]{3,}\s*\n/.test(rawText)) {
    return rawText
      .split(/\n\s*[-=_]{3,}\s*\n/g)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  }

  const lines = rawText.split('\n');
  const splitIndices: number[] = [];

  for (let i = 0; i < lines.length; i++) {
    const l = lines[i].trim();
    if (/^(gara\s*#\d+|appuntamento\s*#\d+)/i.test(l)) {
      if (i > 0) splitIndices.push(i);
    }
  }

  if (splitIndices.length > 0) {
    const blocks: string[] = [];
    let prev = 0;
    for (const idx of splitIndices) {
      const block = lines.slice(prev, idx).join('\n').trim();
      if (block) blocks.push(block);
      prev = idx;
    }
    const last = lines.slice(prev).join('\n').trim();
    if (last) blocks.push(last);
    return blocks;
  }

  return [rawText.trim()];
}

function parseEventBlock(block: string, fallbackIdx: number): ScheduleEvent | null {
  const rawLines = block
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  const cleanLines: string[] = [];
  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i];
    if (i === 0 && /^\s*\d{1,2}[:.]\d{2}\s*$/.test(line)) continue;
    if (isStopLine(line)) break;
    if (isNoiseLine(line)) continue;
    cleanLines.push(line);
  }

  if (cleanLines.length === 0) return null;

  let category = '';
  let badge = '';
  let date = '';
  let location = '';
  let match = '';

  for (let i = 0; i < cleanLines.length; i++) {
    const line = cleanLines[i];

    if (/^tipo(\s+di)?\s+evento\b/i.test(line)) {
      const inline = line.replace(/^tipo(\s+di)?\s+evento\s*[:=-]?\s*/i, '').trim();
      if (inline && !isSectionLabel(inline)) {
        badge = inline.toUpperCase();
      } else if (i + 1 < cleanLines.length && !isSectionLabel(cleanLines[i + 1])) {
        badge = cleanLines[i + 1].toUpperCase();
      }
    }

    if (/^data(\s*e\s*orario)?\b/i.test(line) && !date) {
      const inline = line.replace(/^data(\s*e\s*orario)?\s*[:=-]?\s*/i, '').trim();
      if (inline && !isSectionLabel(inline)) {
        date = normalizeDateAndOrario(inline);
      } else if (i + 1 < cleanLines.length && !isSectionLabel(cleanLines[i + 1])) {
        let dateCombined = cleanLines[i + 1];
        if (i + 2 < cleanLines.length && !isSectionLabel(cleanLines[i + 2]) && /\d{1,2}[:.]\d{2}/.test(cleanLines[i + 2])) {
          dateCombined += ` ${cleanLines[i + 2]}`;
        }
        date = normalizeDateAndOrario(dateCombined);
      }
    }

    if (/^(luogo|indirizzo|campo|stadio)\b/i.test(line) && !location) {
      const inline = line.replace(/^(luogo|indirizzo|campo|stadio)\s*[:=-]?\s*/i, '').trim();
      if (inline && !isSectionLabel(inline)) {
        location = inline;
      } else {
        const locParts: string[] = [];
        let j = i + 1;
        while (j < cleanLines.length && !isSectionLabel(cleanLines[j]) && !isStopLine(cleanLines[j])) {
          locParts.push(cleanLines[j]);
          j++;
        }
        if (locParts.length > 0) {
          location = locParts.join(' - ');
        }
      }
    }

    if (/^(descrizione|match|partita|incontro)\b/i.test(line) && !match) {
      const inline = line.replace(/^(descrizione|match|partita|incontro)\s*[:=-]?\s*/i, '').trim();
      if (inline && !isSectionLabel(inline)) {
        match = inline;
      } else {
        const descParts: string[] = [];
        let j = i + 1;
        while (j < cleanLines.length && !isSectionLabel(cleanLines[j]) && !isStopLine(cleanLines[j])) {
          descParts.push(cleanLines[j]);
          j++;
        }
        if (descParts.length > 0) {
          match = descParts.join(' - ');
        }
      }
    }
  }

  const titleKeywords = /(amichevole|torneo|campionato|coppa|prima squadra|juniores|allievi|giovanissimi|esordienti|pulcini|primi calci|piccoli amici)/i;

  for (const line of cleanLines) {
    if (isSectionLabel(line)) continue;
    if (line === match || line === location) continue;
    if (/\b(usd|asd|fc|ac|gs)\b/i.test(line) && (line.includes(' - ') || line.includes(' – '))) continue;
    if (/\b\d{1,2}[:.]\d{2}\b/.test(line) && /(settembre|ottobre|novembre|dicembre|gennaio|febbraio|marzo|aprile|maggio|giugno|sabato|domenica)/i.test(line)) continue;

    if (titleKeywords.test(line)) {
      if (line.trim().length > 15 || /u\d{1,2}|\d{4}|giornata|girone/i.test(line)) {
        category = line;
        break;
      } else if (!category) {
        category = line;
      }
    }
  }

  if (!date) {
    const fullDateRegex = /(lunedì|lunedi|martedì|martedi|mercoledì|mercoledi|giovedì|giovedi|venerdì|venerdi|sabato|domenica)?\s*\d{1,2}\s+(gennaio|febbraio|marzo|aprile|maggio|giugno|luglio|agosto|settembre|ottobre|novembre|dicembre)\s+\d{4}.*?\d{1,2}[:.]\d{2}\s*[-–]\s*\d{1,2}[:.]\d{2}/i;
    for (const line of cleanLines) {
      if (fullDateRegex.test(line)) {
        date = normalizeDateAndOrario(line);
        break;
      }
    }
  }

  if (!date) {
    const monthDateRegex = /(lunedì|lunedi|martedì|martedi|mercoledì|mercoledi|giovedì|giovedi|venerdì|venerdi|sabato|domenica)?\s*\d{1,2}\s+(gennaio|febbraio|marzo|aprile|maggio|giugno|luglio|agosto|settembre|ottobre|novembre|dicembre)/i;
    for (const line of cleanLines) {
      if (monthDateRegex.test(line)) {
        date = normalizeDateAndOrario(line);
        break;
      }
    }
  }

  if (!match) {
    for (const line of cleanLines) {
      if (isSectionLabel(line) || line === category) continue;
      if (line.includes(' - ') || line.includes(' – ') || line.includes(' vs ')) {
        match = line;
        break;
      }
    }
  }

  if (!location) {
    const addressKeywords = ['via ', 'corso ', 'viale ', 'località', 'localita', 'piazza ', 'campo ', 'stadio '];
    for (const line of cleanLines) {
      if (isSectionLabel(line) || line === category || line === match) continue;
      const lower = line.toLowerCase();
      if (addressKeywords.some((k) => lower.includes(k)) || /\b\d{5}\b/.test(line)) {
        location = line;
        break;
      }
    }
  }

  if (!badge) {
    badge = detectBadgeType(category, match);
  }

  if (match) {
    match = match
      .replace(/\s*[-–—]\s*(visibilit[àa]?|visbita|visib|visti|visita|pubblico|scheda).*$/i, '')
      .replace(/\b(visibilit[àa]?|visbita|visib|visti|visita)\b.*$/i, '')
      .replace(/^[@©®•*#\-–—\s]+/, '')
      .trim();
  }

  if (category) {
    category = category
      .replace(/(\d{4})\s*(\d{4})0?(\d)\b/, '$1 $2 U$3')
      .replace(/\bU\s*2\b/i, 'U12')
      .replace(/^[@©®•*#\-–—\s]+/, '')
      .replace(/\s+[x✕✖]$/i, '')
      .trim()
      .toUpperCase();
  }

  badge = badge.replace(/^[@©®•*#\-–—\s]+/, '').trim().toUpperCase();
  date = (date || 'DATA E ORARIO DA DEFINIRE').replace(/^[@©®•*#\-–—\s]+/, '').trim();
  location = (location || 'Campo da definire').replace(/^[@©®•*#\-–—\s]+/, '').trim();
  match = (match || 'Partita in definizione').trim();

  if (!category && !match && !date) {
    return null;
  }

  return {
    id: `evt-${Date.now()}-${fallbackIdx}-${Math.random().toString(36).substring(2, 6)}`,
    category: category || 'IMPEGNO SQUADRA',
    badge,
    date,
    location,
    match,
  };
}

export function parseScheduleText(rawText: string): ScheduleEvent[] {
  if (!rawText || typeof rawText !== 'string' || !rawText.trim()) {
    return [];
  }

  const clean = rawText
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/[•●▪►]/g, '')
    .trim();

  const blocks = splitIntoEventBlocks(clean);
  const events: ScheduleEvent[] = [];

  blocks.forEach((block, index) => {
    const parsed = parseEventBlock(block, index);
    if (parsed) {
      events.push(parsed);
    }
  });

  if (events.length > 1) {
    events.sort((a, b) => getEventTimestamp(a?.date) - getEventTimestamp(b?.date));
  }

  return events;
}

export function eventsToText(events: ScheduleEvent[]): string {
  if (!events || !Array.isArray(events) || events.length === 0) return '';
  return events
    .map((evt, idx) => {
      if (!evt) return '';
      const parts = [
        `GARA #${idx + 1}`,
        evt.category ? `CATEGORIA: ${evt.category}` : '',
        evt.badge ? `TIPO DI EVENTO: ${evt.badge}` : '',
        evt.date ? `DATA E ORARIO: ${evt.date}` : '',
        evt.location ? `LUOGO: ${evt.location}` : '',
        evt.match ? `DESCRIZIONE: ${evt.match}` : '',
      ].filter(Boolean);
      return parts.join('\n');
    })
    .filter(Boolean)
    .join('\n\n---\n\n');
}
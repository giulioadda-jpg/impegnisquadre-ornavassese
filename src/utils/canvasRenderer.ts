import { ScheduleEvent, GraphicSettings, EVENTS_PER_PAGE } from '../types';
import { detectBadgeType } from './parser';

export const CANVAS_WIDTH = 1080;
export const CANVAS_HEIGHT = 1350;

// ============================================================================
// 1. GESTIONE LOGO PERMANENTE (BASE64)
// INCOLLA QUI LA STRINGA BASE64 DEL PNG TRASPARENTE
// ============================================================================
export const CLUB_LOGO_BASE64: string = "";

export interface CompetitionStyle {
  bg: string;
  border: string;
  text: string;
  accentBar: string;
}

export const COMPETITION_STYLES: Record<string, CompetitionStyle> = {
  CAMPIONATO: {
    bg: 'rgba(217, 119, 6, 0.20)',
    border: '#B45309',
    text: '#FBBF24',
    accentBar: '#F59E0B',
  },
  COPPA: {
    bg: 'rgba(220, 38, 38, 0.20)',
    border: '#B91C1C',
    text: '#F87171',
    accentBar: '#EF4444',
  },
  TORNEO: {
    bg: 'rgba(37, 99, 235, 0.20)',
    border: '#1D4ED8',
    text: '#60A5FA',
    accentBar: '#3B82F6',
  },
  AMICHEVOLE: {
    bg: 'rgba(16, 185, 129, 0.18)',
    border: '#047857',
    text: '#34D399',
    accentBar: '#10B981',
  },
  DEFAULT: {
    bg: '#262626',
    border: '#404040',
    text: '#D4D4D4',
    accentBar: '#E5E5E5',
  },
};

export function getCompetitionStyle(badge: string): CompetitionStyle {
  const norm = (badge || '').trim().toUpperCase();
  if (norm.includes('CAMPIONATO')) return COMPETITION_STYLES.CAMPIONATO;
  if (norm.includes('COPPA')) return COMPETITION_STYLES.COPPA;
  if (norm.includes('TORNEO')) return COMPETITION_STYLES.TORNEO;
  if (norm.includes('AMICHEVOLE')) return COMPETITION_STYLES.AMICHEVOLE;
  return COMPETITION_STYLES.DEFAULT;
}

/**
 * High-fidelity vector SVG representation of the official USD Ornavassese emblem
 */
const DEFAULT_ORNAVASSESE_LOGO_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 230" fill="none">
  <!-- Outer double oval -->
  <ellipse cx="100" cy="115" rx="93" ry="109" stroke="#FFFFFF" stroke-width="4" fill="none"/>
  <ellipse cx="100" cy="115" rx="87" ry="103" stroke="#FFFFFF" stroke-width="1.8" fill="none"/>

  <!-- Crown at top -->
  <path d="M74 38 L78 50 L122 50 L126 38 L114 43 L100 30 L86 43 Z" fill="#FFFFFF"/>
  <circle cx="100" cy="27" r="3" fill="#FFFFFF"/>
  <circle cx="74" cy="35" r="2.5" fill="#FFFFFF"/>
  <circle cx="126" cy="35" r="2.5" fill="#FFFFFF"/>
  <circle cx="86" cy="40" r="2" fill="#FFFFFF"/>
  <circle cx="114" cy="40" r="2" fill="#FFFFFF"/>
  <rect x="78" y="52" width="44" height="4" rx="2" fill="#FFFFFF"/>

  <!-- Shield -->
  <path d="M68 62 H132 V110 C132 135 100 148 100 148 C100 148 68 135 68 110 Z" fill="#141414" stroke="#FFFFFF" stroke-width="2.5"/>
  
  <!-- Shield top bar (white with 3 black stars) -->
  <path d="M68 62 H132 V85 H68 Z" fill="#FFFFFF"/>
  <!-- Star 1 -->
  <polygon points="80,68 82,73 87,73 83,76 84,81 80,78 76,81 77,76 73,73 78,73" fill="#000000"/>
  <!-- Star 2 -->
  <polygon points="100,68 102,73 107,73 103,76 104,81 100,78 96,81 97,76 93,73 98,73" fill="#000000"/>
  <!-- Star 3 -->
  <polygon points="120,68 122,73 127,73 123,76 124,81 120,78 116,81 117,76 113,73 118,73" fill="#000000"/>

  <!-- Sanctuary / Monument silhouette inside shield -->
  <path d="M96 124 H104 V108 H96 Z M94 124 H106 V127 H94 Z M98 108 L100 96 L102 108 Z" fill="#FFFFFF"/>
  <circle cx="100" cy="94" r="2" fill="#FFFFFF"/>
  <ellipse cx="100" cy="116" rx="14" ry="4" stroke="#FFFFFF" stroke-width="1.5" fill="none"/>

  <!-- Laurel wreath garland around shield -->
  <path d="M52 82 C42 105 45 135 70 162 M148 82 C158 105 155 135 130 162" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" fill="none"/>
  <!-- Leaves left -->
  <path d="M46 95 C41 93 42 88 47 90 M44 110 C38 108 40 102 46 105 M46 125 C41 124 43 118 49 120 M52 140 C47 140 48 133 55 136 M62 153 C57 155 57 148 64 149" stroke="#FFFFFF" stroke-width="2" fill="none"/>
  <!-- Leaves right -->
  <path d="M154 95 C159 93 158 88 153 90 M156 110 C162 108 160 102 154 105 M154 125 C159 124 157 118 151 120 M148 140 C153 140 152 133 145 136 M138 153 C143 155 143 148 136 149" stroke="#FFFFFF" stroke-width="2" fill="none"/>
  <!-- Ribbon at bottom of wreath -->
  <path d="M85 168 C95 165 105 165 115 168 M92 168 L80 180 M108 168 L120 180" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round"/>

  <!-- Letters: U. on left, O. on right, S. D. bottom, 1919 -->
  <text x="22" y="118" font-family="'Inter', -apple-system, sans-serif" font-weight="900" font-size="24" fill="#FFFFFF">U.</text>
  <text x="162" y="118" font-family="'Inter', -apple-system, sans-serif" font-weight="900" font-size="24" fill="#FFFFFF">O.</text>
  <text x="56" y="188" font-family="'Inter', -apple-system, sans-serif" font-weight="900" font-size="22" fill="#FFFFFF">S.</text>
  <text x="134" y="188" font-family="'Inter', -apple-system, sans-serif" font-weight="900" font-size="22" fill="#FFFFFF">D.</text>
  <text x="100" y="214" font-family="'Inter', -apple-system, sans-serif" font-weight="900" font-size="24" text-anchor="middle" fill="#FFFFFF">1919</text>
</svg>
`)}`;

const imageCache: Map<string, HTMLImageElement> = new Map();

function normalizeImageSrc(src: string): string {
  if (!src) return '';
  const trimmed = src.trim();
  if (trimmed.startsWith('data:') || trimmed.startsWith('http') || trimmed.startsWith('/') || trimmed.startsWith('blob:')) {
    return trimmed;
  }
  return `data:image/png;base64,${trimmed}`;
}

export function getOrLoadClubLogo(
  customSrc?: string,
  onLoaded?: () => void
): HTMLImageElement | null {
  const rawSrc = (CLUB_LOGO_BASE64 && CLUB_LOGO_BASE64.trim()) || customSrc || DEFAULT_ORNAVASSESE_LOGO_SVG;
  const src = normalizeImageSrc(rawSrc);
  if (!src) return null;

  const cached = imageCache.get(src);
  if (cached) {
    if (cached.complete && cached.naturalWidth > 0) {
      return cached;
    }
  }

  const img = new Image();
  imageCache.set(src, img);
  img.crossOrigin = 'anonymous';
  img.onload = () => {
    if (onLoaded) onLoaded();
  };
  img.src = src;

  if (img.complete && img.naturalWidth > 0) {
    return img;
  }
  return null;
}

if (typeof window !== 'undefined') {
  getOrLoadClubLogo();
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  if (!text) return [];
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let currentLine = '';

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const testWidth = ctx.measureText(testLine).width;

    if (testWidth > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function drawClubLogo(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  maxSize: number = 84,
  customSrc?: string,
  onLoaded?: () => void
): void {
  const img = getOrLoadClubLogo(customSrc, onLoaded);
  if (!img || !img.complete || img.naturalWidth === 0) {
    return;
  }

  const nw = img.naturalWidth;
  const nh = img.naturalHeight;
  const ratio = Math.min(maxSize / nw, maxSize / nh);
  const drawW = nw * ratio;
  const drawH = nh * ratio;
  const drawX = centerX - drawW / 2;
  const drawY = centerY - drawH / 2;

  ctx.save();
  ctx.drawImage(img, drawX, drawY, drawW, drawH);
  ctx.restore();
}

function drawClockIcon(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  color: string = '#9E9E9E'
) {
  const r = size / 2;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(1.8, size * 0.095);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx, cy - r * 0.55);
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx + r * 0.45, cy);
  ctx.stroke();
  ctx.restore();
}

function drawPinIcon(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  color: string = '#9E9E9E'
) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = Math.max(1.8, size * 0.085);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const scale = size / 24;
  ctx.translate(cx - 12 * scale, cy - 12 * scale);
  ctx.scale(scale, scale);

  ctx.beginPath();
  ctx.moveTo(12, 22);
  ctx.bezierCurveTo(7.5, 16.5, 4.5, 12.5, 4.5, 9);
  ctx.bezierCurveTo(4.5, 4.86, 7.86, 1.5, 12, 1.5);
  ctx.bezierCurveTo(16.14, 1.5, 19.5, 4.86, 19.5, 9);
  ctx.bezierCurveTo(19.5, 12.5, 16.5, 16.5, 12, 22);
  ctx.closePath();
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(12, 9, 2.3, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawTrophyIcon(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  color: string = '#9E9E9E'
) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = Math.max(1.8, size * 0.085);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const scale = size / 24;
  ctx.translate(cx - 12 * scale, cy - 12 * scale);
  ctx.scale(scale, scale);

  ctx.beginPath();
  ctx.moveTo(6, 4);
  ctx.lineTo(18, 4);
  ctx.lineTo(18, 9);
  ctx.bezierCurveTo(18, 12.5, 15.3, 14.5, 12, 14.5);
  ctx.bezierCurveTo(8.7, 14.5, 6, 12.5, 6, 9);
  ctx.closePath();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(6, 6);
  ctx.bezierCurveTo(3.5, 6, 2.5, 7.5, 2.5, 9);
  ctx.bezierCurveTo(2.5, 11, 4.5, 12, 6, 11.5);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(18, 6);
  ctx.bezierCurveTo(20.5, 6, 21.5, 7.5, 21.5, 9);
  ctx.bezierCurveTo(21.5, 11, 19.5, 12, 18, 11.5);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(12, 14.5);
  ctx.lineTo(12, 18.5);
  ctx.moveTo(7, 18.5);
  ctx.lineTo(17, 18.5);
  ctx.moveTo(6, 21.5);
  ctx.lineTo(18, 21.5);
  ctx.stroke();

  ctx.restore();
}

/**
 * Draw colored tipologia badge with custom competition styling
 */
function drawCategoryBadge(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  text: string,
  style: CompetitionStyle
): number {
  ctx.save();
  ctx.font = '700 12px "Inter", "Roboto", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const paddingX = 10;
  const badgeHeight = 22;
  const textWidth = ctx.measureText(text).width;
  const badgeWidth = Math.max(48, textWidth + paddingX * 2);
  const radius = 5;

  roundRect(ctx, x, y - badgeHeight / 2, badgeWidth, badgeHeight, radius);

  ctx.fillStyle = style.bg;
  ctx.fill();

  ctx.strokeStyle = style.border;
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = style.text;
  ctx.fillText(text, x + badgeWidth / 2, y);

  ctx.restore();
  return badgeWidth;
}

function drawGaraLabel(
  ctx: CanvasRenderingContext2D,
  rightX: number,
  y: number,
  text: string
) {
  ctx.save();
  ctx.font = '700 13px "Inter", "Roboto", monospace';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';

  const textWidth = ctx.measureText(text).width;
  const boxPaddingX = 10;
  const boxHeight = 24;
  const boxWidth = textWidth + boxPaddingX * 2;
  const boxX = rightX - boxWidth;

  roundRect(ctx, boxX, y - boxHeight / 2, boxWidth, boxHeight, 4);
  ctx.fillStyle = '#1c1c1c';
  ctx.fill();
  ctx.strokeStyle = '#2d2d2d';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = '#999999';
  ctx.textAlign = 'center';
  ctx.fillText(text, boxX + boxWidth / 2, y + 0.5);

  ctx.restore();
}

function drawCarouselIndicator(
  ctx: CanvasRenderingContext2D,
  currentPage: number,
  totalPages: number
) {
  const y = 1302;
  ctx.save();

  const dotSpacing = 16;
  const activeDotWidth = 24;
  const inactiveDotRadius = 4;
  const totalDotsSpan = (totalPages - 1) * dotSpacing + activeDotWidth;
  let currentDotX = CANVAS_WIDTH / 2 - totalDotsSpan / 2;

  for (let i = 1; i <= totalPages; i++) {
    const isActive = i === currentPage;
    if (isActive) {
      ctx.fillStyle = '#E5E5E5';
      roundRect(ctx, currentDotX, y - 4, activeDotWidth, 8, 4);
      ctx.fill();
      currentDotX += activeDotWidth + 8;
    } else {
      ctx.fillStyle = '#2c2c2c';
      ctx.beginPath();
      ctx.arc(currentDotX + inactiveDotRadius, y, inactiveDotRadius, 0, Math.PI * 2);
      ctx.fill();
      currentDotX += dotSpacing;
    }
  }

  ctx.font = '600 12px "Inter", monospace';
  ctx.fillStyle = '#666666';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  ctx.fillText(`PAGINA ${currentPage} DI ${totalPages}`, CANVAS_WIDTH - 64, y);

  ctx.restore();
}

export function renderScheduleToCanvas(
  canvas: HTMLCanvasElement,
  events: ScheduleEvent[],
  settings: GraphicSettings,
  pageIndex: number = 0,
  onImageRedraw?: () => void
): { totalPages: number; currentPage: number } {
  const ctx = canvas.getContext('2d');
  if (!ctx) return { totalPages: 1, currentPage: 1 };

  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;

  const totalEvents = events?.length || 0;
  const totalPages = Math.max(1, Math.ceil(totalEvents / EVENTS_PER_PAGE));
  const safePageIndex = Math.min(Math.max(0, pageIndex), totalPages - 1);
  const currentPageNumber = safePageIndex + 1;

  const startIdx = safePageIndex * EVENTS_PER_PAGE;
  const pageEvents = events.slice(startIdx, startIdx + EVENTS_PER_PAGE);

  // 1. Sfondo Nero profondo (#080808)
  ctx.fillStyle = '#080808';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // 2. Logo Ornavassese centrato
  const logoCenterY = 76;
  const logoSize = 82;
  drawClubLogo(ctx, CANVAS_WIDTH / 2, logoCenterY, logoSize, settings.customLogo, onImageRedraw);

  // 3. Titolo su riga singola: "IMPEGNI SQUADRE • USD ORNAVASSESE"
  const titleY = 154;
  const titleFontSize = 38;
  ctx.save();
  ctx.font = `900 ${titleFontSize}px "Inter", "Roboto", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
  ctx.textBaseline = 'middle';

  const part1 = 'IMPEGNI SQUADRE ';
  const partBullet = '• ';
  const part2 = 'USD ORNAVASSESE';

  const w1 = ctx.measureText(part1).width;
  const wb = ctx.measureText(partBullet).width;
  const w2 = ctx.measureText(part2).width;
  const totalTitleW = w1 + wb + w2;
  const titleStartX = (CANVAS_WIDTH - totalTitleW) / 2;

  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'left';
  ctx.fillText(part1, titleStartX, titleY);

  ctx.fillStyle = '#888888';
  ctx.fillText(partBullet, titleStartX + w1, titleY);

  ctx.fillStyle = '#FFFFFF';
  ctx.fillText(part2, titleStartX + w1 + wb, titleY);
  ctx.restore();

  // 4. Linea divisoria sottile (#262626)
  const dividerLineY = 194;
  const sideMargin = 64;
  const cardWidth = CANVAS_WIDTH - sideMargin * 2;

  const grad = ctx.createLinearGradient(sideMargin, 0, CANVAS_WIDTH - sideMargin, 0);
  grad.addColorStop(0, 'rgba(38, 38, 38, 0)');
  grad.addColorStop(0.12, '#262626');
  grad.addColorStop(0.88, '#262626');
  grad.addColorStop(1, 'rgba(38, 38, 38, 0)');

  ctx.strokeStyle = grad;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(sideMargin, dividerLineY);
  ctx.lineTo(CANVAS_WIDTH - sideMargin, dividerLineY);
  ctx.stroke();

  if (totalEvents === 0) {
    ctx.font = '500 28px "Inter", sans-serif';
    ctx.fillStyle = '#444444';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Nessun appuntamento inserito.', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
    ctx.font = '400 20px "Inter", sans-serif';
    ctx.fillStyle = '#333333';
    ctx.fillText(
      'Carica uno o più screenshot o incolla il testo per generare le schede gara.',
      CANVAS_WIDTH / 2,
      CANVAS_HEIGHT / 2 + 42
    );
    return { totalPages: 1, currentPage: 1 };
  }

  // 5. Schede Evento (max 5 per pagina con gerarchia cromatica)
  const cardHeight = 186;
  const cardGap = 20;
  const bodyStartY = 216;
  const cardX = sideMargin;
  const borderRadius = 12;
  const leftAccentWidth = 4;

  pageEvents.forEach((evt, localIdx) => {
    const globalIdx = startIdx + localIdx + 1;
    const cardY = bodyStartY + localIdx * (cardHeight + cardGap);

    const categoryText = (evt.category || 'IMPEGNO SQUADRA').toUpperCase();
    const badgeText = (evt.badge || detectBadgeType(evt.category, evt.match)).toUpperCase();
    const garaText = `GARA #${globalIdx}`;

    const compStyle = getCompetitionStyle(badgeText);

    ctx.save();
    roundRect(ctx, cardX, cardY, cardWidth, cardHeight, borderRadius);
    ctx.fillStyle = '#141414';
    ctx.fill();

    ctx.clip();

    ctx.fillStyle = compStyle.accentBar;
    ctx.fillRect(cardX, cardY, leftAccentWidth, cardHeight);
    ctx.restore();

    ctx.save();
    roundRect(ctx, cardX + 0.5, cardY + 0.5, cardWidth - 1, cardHeight - 1, borderRadius);
    ctx.strokeStyle = '#2a2a2a';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();

    const headerCenterY = cardY + 28;
    const contentLeftX = cardX + 24;
    const contentRightX = cardX + cardWidth - 22;

    drawGaraLabel(ctx, contentRightX, headerCenterY, garaText);

    ctx.save();
    ctx.font = '800 19px "Inter", "Roboto", sans-serif';
    ctx.fillStyle = '#F5F5F5';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';

    const maxHeaderAvailable = cardWidth - 48 - 120;
    const fullCatWidth = ctx.measureText(categoryText).width;

    const badgeWidth = drawCategoryBadge(
      ctx,
      contentLeftX + Math.min(fullCatWidth + 14, maxHeaderAvailable - 105),
      headerCenterY,
      badgeText,
      compStyle
    );

    let displayCat = categoryText;
    const maxCatWidth = maxHeaderAvailable - badgeWidth - 20;
    if (fullCatWidth > maxCatWidth) {
      while (displayCat.length > 4 && ctx.measureText(displayCat + '...').width > maxCatWidth) {
        displayCat = displayCat.slice(0, -1);
      }
      displayCat += '...';
    }

    ctx.font = '800 19px "Inter", "Roboto", sans-serif';
    ctx.fillStyle = '#F5F5F5';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(displayCat, contentLeftX, headerCenterY);
    ctx.restore();

    const cardDividerY = cardY + 52;
    ctx.strokeStyle = '#1e1e1e';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cardX + 16, cardDividerY);
    ctx.lineTo(cardX + cardWidth - 16, cardDividerY);
    ctx.stroke();

    const iconCenterX = contentLeftX + 16;
    const textStartX = contentLeftX + 40;
    const maxRowTextWidth = cardWidth - (textStartX - cardX) - 24;
    const iconSize = 17;

    const row1Y = cardY + 75;
    drawClockIcon(ctx, iconCenterX, row1Y, iconSize, '#9E9E9E');

    ctx.save();
    ctx.font = '700 16px "Inter", "Roboto", sans-serif';
    ctx.fillStyle = '#EEEEEE';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    const dateStr = (evt.date || 'DATA E ORARIO DA DEFINIRE').toUpperCase();
    const dateLines = wrapText(ctx, dateStr, maxRowTextWidth);
    ctx.fillText(dateLines[0] || dateStr, textStartX, row1Y);
    ctx.restore();

    const row2Y = cardY + 113;
    drawPinIcon(ctx, iconCenterX, row2Y, iconSize, '#9E9E9E');

    ctx.save();
    ctx.font = '400 15px "Inter", "Roboto", sans-serif';
    ctx.fillStyle = '#CCCCCC';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    let locStr = evt.location || 'Campo da definire';
    if (ctx.measureText(locStr).width > maxRowTextWidth) {
      while (locStr.length > 5 && ctx.measureText(locStr + '...').width > maxRowTextWidth) {
        locStr = locStr.slice(0, -1);
      }
      locStr += '...';
    }
    ctx.fillText(locStr, textStartX, row2Y);
    ctx.restore();

    const row3Y = cardY + 151;
    drawTrophyIcon(ctx, iconCenterX, row3Y, iconSize, '#9E9E9E');

    ctx.save();
    ctx.font = '700 16px "Inter", "Roboto", sans-serif';
    ctx.fillStyle = '#CCCCCC';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    let matchStr = evt.match || 'Partita da definire';
    if (ctx.measureText(matchStr).width > maxRowTextWidth) {
      while (matchStr.length > 5 && ctx.measureText(matchStr + '...').width > maxRowTextWidth) {
        matchStr = matchStr.slice(0, -1);
      }
      matchStr += '...';
    }
    ctx.fillText(matchStr, textStartX, row3Y);
    ctx.restore();
  });

  if (totalPages > 1) {
    drawCarouselIndicator(ctx, currentPageNumber, totalPages);
  }

  return { totalPages, currentPage: currentPageNumber };
}

/**
 * Downloads a canvas element as a high-res PNG file.
 * Uses Web Share API on iOS/Safari mobile and Blob URL for desktop browsers.
 */
export async function downloadCanvasAsPng(canvas: HTMLCanvasElement, filename: string): Promise<void> {
  return new Promise((resolve) => {
    canvas.toBlob(async (blob) => {
      if (!blob) {
        resolve();
        return;
      }

      // 1. Su iOS / Safari mobile attiva la schermata nativa per "Salva immagine" in Foto o "Salva su File"
      if (navigator.share && navigator.canShare) {
        try {
          const file = new File([blob], filename, { type: 'image/png' });
          if (navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: filename,
            });
            resolve();
            return;
          }
        } catch (err) {
          if ((err as Error).name === 'AbortError') {
            resolve();
            return;
          }
        }
      }

      // 2. Download standard con Blob URL per desktop e fallback browser
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();

      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
        resolve();
      }, 1500);
    }, 'image/png', 1.0);
  });
}

export async function copyCanvasToClipboard(canvas: HTMLCanvasElement): Promise<boolean> {
  if (!navigator.clipboard || !window.ClipboardItem) {
    return false;
  }
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        resolve(false);
        return;
      }
      navigator.clipboard
        .write([
          new ClipboardItem({
            'image/png': blob,
          }),
        ])
        .then(() => resolve(true))
        .catch(() => resolve(false));
    }, 'image/png');
  });
}

export async function downloadAllPages(
  events: ScheduleEvent[],
  settings: GraphicSettings,
  baseFilename: string = 'locandina-impegni-ornavassese'
): Promise<number> {
  const totalEvents = events?.length || 0;
  const totalPages = Math.max(1, Math.ceil(totalEvents / EVENTS_PER_PAGE));

  const offscreen = document.createElement('canvas');
  offscreen.width = CANVAS_WIDTH;
  offscreen.height = CANVAS_HEIGHT;

  for (let p = 0; p < totalPages; p++) {
    renderScheduleToCanvas(offscreen, events, settings, p);
    const suffix = totalPages > 1 ? `-pag-${p + 1}` : '';
    await downloadCanvasAsPng(offscreen, `${baseFilename}${suffix}.png`);

    if (totalPages > 1 && p < totalPages - 1) {
      await new Promise((resolve) => setTimeout(resolve, 400));
    }
  }

  return totalPages;
}
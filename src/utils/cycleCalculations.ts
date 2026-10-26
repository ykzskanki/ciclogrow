import { PlantProfile, PhaseType, DayCellData } from '../types/grow';

export const MONTH_NAMES_PT = [
  'jan', 'fev', 'mar', 'abr', 'mai', 'jun',
  'jul', 'ago', 'set', 'out', 'nov', 'dez'
];

export const MONTH_NAMES_FULL_PT = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

/**
 * Format a Date or YYYY-MM-DD string into "15/mar" format as in the reference image
 */
export function formatDisplayDate(dateInput: Date | string): string {
  const date = typeof dateInput === 'string' ? parseDateString(dateInput) : dateInput;
  const day = String(date.getDate()).padStart(2, '0');
  const month = MONTH_NAMES_PT[date.getMonth()];
  return `${day}/${month}`;
}

/**
 * Formats full date in Brazilian Portuguese
 */
export function formatFullDatePt(dateInput: Date | string): string {
  const date = typeof dateInput === 'string' ? parseDateString(dateInput) : dateInput;
  return date.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Returns the current date and time from the computer / Windows system clock
 */
export function getWindowsCurrentDateTime(): {
  date: Date;
  dateStr: string;
  timeStr: string;
  formattedFull: string;
  formattedShort: string;
  dayOfWeekName: string;
} {
  const now = new Date();
  const dateStr = toDateString(now);
  const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const formattedFull = now.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
  const formattedShort = now.toLocaleDateString('pt-BR');
  const dayOfWeekName = now.toLocaleDateString('pt-BR', { weekday: 'long' });
  return { date: now, dateStr, timeStr, formattedFull, formattedShort, dayOfWeekName };
}

/**
 * Parses YYYY-MM-DD into a local Date object without timezone offset issues
 */
export function parseDateString(dateStr: string): Date {
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    return new Date(year, month, day, 12, 0, 0);
  }
  return new Date(dateStr);
}

/**
 * Converts a Date to YYYY-MM-DD string
 */
export function toDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Adds N days to a date string and returns a new YYYY-MM-DD
 */
export function addDays(dateStr: string, days: number): string {
  const d = parseDateString(dateStr);
  d.setDate(d.getDate() + days);
  return toDateString(d);
}

/**
 * Calculates day difference between two dates (date2 - date1)
 */
export function diffDays(dateStr1: string, dateStr2: string): number {
  const d1 = parseDateString(dateStr1);
  const d2 = parseDateString(dateStr2);
  const diffTime = d2.getTime() - d1.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Finds the Sunday of the week for a given date (DOM is column 0)
 */
export function getSundayOfWeek(dateStr: string): string {
  const d = parseDateString(dateStr);
  const dayOfWeek = d.getDay(); // 0 is Sunday
  d.setDate(d.getDate() - dayOfWeek);
  return toDateString(d);
}

/**
 * Determine default phase for a given day offset from start date based on plant plan
 */
export function getPhaseForDayOffset(dayOffset: number, plant: PlantProfile): PhaseType {
  // dayOffset 0 is start date
  if (dayOffset < 0) {
    return 'germinacao';
  }

  const germDays = plant.germinationWeeks * 7;
  const vegDays = plant.vegetativeWeeks * 7;
  const floraDays = plant.floweringWeeks * 7;
  const flushDays = plant.flushWeeks * 7;

  if (dayOffset < germDays) {
    return 'germinacao';
  } else if (dayOffset < germDays + vegDays) {
    return 'vegetativo';
  } else if (dayOffset < germDays + vegDays + floraDays) {
    return 'floracao';
  } else if (dayOffset < germDays + vegDays + floraDays + flushDays) {
    return 'flush';
  } else {
    return 'colheita';
  }
}

/**
 * Calculate Vapor Pressure Deficit (VPD) in kPa
 * T: Air temperature in Celsius
 * RH: Relative humidity in %
 * leafTempOffset: leaf temp relative to air (usually -1 to -2 °C under LED)
 */
export function calculateVpd(tempC: number, rhPct: number, leafTempOffset = -1.5): {
  vpdAir: number;
  vpdLeaf: number;
  status: 'baixa' | 'ideal_veg' | 'ideal_flora' | 'alta' | 'perigo';
  description: string;
} {
  const leafTemp = tempC + leafTempOffset;
  
  // Saturated vapor pressure (Tetens equation)
  const vpsatAir = 0.61078 * Math.exp((17.27 * tempC) / (tempC + 237.3));
  const vpsatLeaf = 0.61078 * Math.exp((17.27 * leafTemp) / (leafTemp + 237.3));
  
  // Actual vapor pressure
  const vpair = vpsatAir * (rhPct / 100);
  
  const vpdAir = Math.max(0, parseFloat((vpsatAir - vpair).toFixed(2)));
  const vpdLeaf = Math.max(0, parseFloat((vpsatLeaf - vpair).toFixed(2)));

  let status: 'baixa' | 'ideal_veg' | 'ideal_flora' | 'alta' | 'perigo' = 'ideal_veg';
  let description = 'Transpiração ótima para vegetativo (0.8 - 1.1 kPa)';

  if (vpdLeaf < 0.4) {
    status = 'baixa';
    description = 'Muito úmido! Risco de mofo e transpiração estagnada (< 0.4 kPa)';
  } else if (vpdLeaf < 0.8) {
    status = 'baixa';
    description = 'Transpiração suave, excelente para germinação e clones (0.4 - 0.8 kPa)';
  } else if (vpdLeaf <= 1.15) {
    status = 'ideal_veg';
    description = 'Faixa perfeita para fase Vegetativa (0.8 - 1.15 kPa)';
  } else if (vpdLeaf <= 1.55) {
    status = 'ideal_flora';
    description = 'Faixa perfeita para fase de Floração (1.2 - 1.55 kPa)';
  } else if (vpdLeaf <= 1.8) {
    status = 'alta';
    description = 'Transpiração intensa, monitore consumo de água (1.6 - 1.8 kPa)';
  } else {
    status = 'perigo';
    description = 'Ar muito seco! Risco de estresse hídrico e fechamento estomático (> 1.8 kPa)';
  }

  return { vpdAir, vpdLeaf, status, description };
}

/**
 * Generate full week grid data for a plant
 */
export function generateCalendarGrid(plant: PlantProfile, referenceDateStr?: string): {
  weeks: {
    weekNumber: number;
    days: DayCellData[];
    monthGroupNumber?: number; // 1, 2, 3, 4 for the side marker
    monthGroupStart?: boolean;
    monthGroupSpan?: number;
  }[];
  totalDays: number;
  currentDayOfCycle: number;
  currentWeekNumber: number;
  currentPhase: PhaseType;
  estimatedHarvestDate: string;
  daysToHarvest: number;
  referenceDateStr: string;
} {
  // Windows System Calendar is always the default real-time reference
  const todayReal = toDateString(new Date());
  const effectiveRefDate = referenceDateStr || todayReal;
  const gridStartSunday = getSundayOfWeek(plant.startDate);
  
  const totalWeeks = Math.max(12, plant.totalWeeks || 13);
  const plannedTotalDays = (plant.germinationWeeks + plant.vegetativeWeeks + plant.floweringWeeks + plant.flushWeeks) * 7;
  const estimatedHarvestDate = addDays(plant.startDate, plannedTotalDays);
  
  const daysSinceStart = diffDays(plant.startDate, effectiveRefDate);
  const currentDayOfCycle = Math.max(1, daysSinceStart + 1);
  const currentWeekNumber = Math.max(1, Math.min(totalWeeks, Math.ceil(currentDayOfCycle / 7)));
  const daysToHarvest = Math.max(0, diffDays(effectiveRefDate, estimatedHarvestDate));

  const currentPhase = getPhaseForDayOffset(daysSinceStart, plant);

  const weeks = [];

  for (let w = 0; w < totalWeeks; w++) {
    const weekNumber = w + 1;
    const days: DayCellData[] = [];

    for (let d = 0; d < 7; d++) {
      const dayOffsetFromSunday = w * 7 + d;
      const dateStr = addDays(gridStartSunday, dayOffsetFromSunday);
      const dayOffsetFromStart = diffDays(plant.startDate, dateStr);
      const dayOfCycle = dayOffsetFromStart + 1;

      const log = plant.logs[dateStr];
      const defaultPhase = getPhaseForDayOffset(dayOffsetFromStart, plant);
      const phase = log?.phaseOverride || defaultPhase;

      const isToday = dateStr === effectiveRefDate;
      const isPast = dateStr < effectiveRefDate;
      const isFuture = dateStr > effectiveRefDate;

      days.push({
        dateStr,
        displayDate: formatDisplayDate(dateStr),
        dayOfWeek: d,
        weekNumber,
        dayOfCycle,
        phase,
        isToday,
        isPast,
        isFuture,
        log,
        hasRega: Boolean(log?.hasWatered || (log?.waterVolumeL && log.waterVolumeL > 0)),
        hasFerti: Boolean(log?.hasFertilized || (log?.nutrients && log.nutrients.length > 0)),
        hasPoda: Boolean(log?.hasTrained || (log?.trainingType && log.trainingType.length > 0)),
        hasNotes: Boolean(log?.notes && log.notes.trim().length > 0),
        hasPhotos: Boolean(log?.photos && log.photos.length > 0),
      });
    }

    // Month group block markers on the right:
    // Weeks 1-4 -> Month 1
    // Weeks 5-8 -> Month 2
    // Weeks 9-11 -> Month 3
    // Weeks 12-14 -> Month 4
    let monthGroupNumber: number | undefined;
    let monthGroupStart = false;
    let monthGroupSpan = 1;

    if (w === 0) {
      monthGroupNumber = 1;
      monthGroupStart = true;
      monthGroupSpan = 4;
    } else if (w === 4) {
      monthGroupNumber = 2;
      monthGroupStart = true;
      monthGroupSpan = 4;
    } else if (w === 8) {
      monthGroupNumber = 3;
      monthGroupStart = true;
      monthGroupSpan = 3;
    } else if (w === 11) {
      monthGroupNumber = 4;
      monthGroupStart = true;
      monthGroupSpan = Math.max(2, totalWeeks - 11);
    }

    weeks.push({
      weekNumber,
      days,
      monthGroupNumber,
      monthGroupStart,
      monthGroupSpan,
    });
  }

  return {
    weeks,
    totalDays: plannedTotalDays,
    currentDayOfCycle,
    currentWeekNumber,
    currentPhase,
    estimatedHarvestDate,
    daysToHarvest,
    referenceDateStr: effectiveRefDate,
  };
}

/**
 * Color metadata matching the reference visual
 */
export const PHASE_VISUAL_STYLES: Record<PhaseType, {
  name: string;
  bgHex: string;
  tailwindClass: string;
  badgeBg: string;
  textClass: string;
  description: string;
}> = {
  germinacao: {
    name: 'Germinação / Plântula',
    bgHex: '#e5e7eb', // pale light gray as in row 1
    tailwindClass: 'bg-zinc-200 text-zinc-900 border-zinc-300',
    badgeBg: 'bg-zinc-400 text-zinc-950',
    textClass: 'text-zinc-900 font-semibold',
    description: 'Etapa inicial de brotação e primeiras folhas'
  },
  vegetativo: {
    name: 'Crescimento Vegetativo',
    bgHex: '#16a34a', // vibrant green
    tailwindClass: 'bg-emerald-600 text-white border-emerald-500',
    badgeBg: 'bg-emerald-500 text-emerald-950',
    textClass: 'text-white font-semibold',
    description: 'Desenvolvimento de folhas, ramos e estrutura radicular'
  },
  floracao: {
    name: 'Floração',
    bgHex: '#6b21a8', // vibrant purple
    tailwindClass: 'bg-purple-800 text-white border-purple-700',
    badgeBg: 'bg-purple-600 text-purple-100',
    textClass: 'text-purple-100 font-semibold',
    description: 'Produção e engorda de flores/frutos'
  },
  rega_pura: {
    name: 'Rega com Água / Nutrição',
    bgHex: '#0284c7', // vibrant cyan/sky blue
    tailwindClass: 'bg-sky-600 text-white border-sky-500',
    badgeBg: 'bg-sky-400 text-sky-950',
    textClass: 'text-white font-semibold',
    description: 'Dia de hidratação ou rega sem fertilizantes'
  },
  flush: {
    name: 'Flush (Lavagem de Raízes)',
    bgHex: '#dc2626', // vibrant red
    tailwindClass: 'bg-red-600 text-white border-red-500',
    badgeBg: 'bg-red-500 text-red-950',
    textClass: 'text-white font-semibold',
    description: 'Lavagem de excesso de sais e nutrientes antes da colheita'
  },
  colheita: {
    name: 'Colheita & Secagem',
    bgHex: '#eab308', // vibrant yellow
    tailwindClass: 'bg-amber-400 text-zinc-950 border-amber-300',
    badgeBg: 'bg-amber-400 text-amber-950',
    textClass: 'text-zinc-950 font-bold',
    description: 'Ponto ideal dos tricomas, corte e início da secagem'
  },
  cura: {
    name: 'Cura & Maturação',
    bgHex: '#ca8a04',
    tailwindClass: 'bg-amber-600 text-white border-amber-500',
    badgeBg: 'bg-amber-500 text-amber-950',
    textClass: 'text-white font-bold',
    description: 'Controle de umidade em potes para aroma e potência máxima'
  }
};

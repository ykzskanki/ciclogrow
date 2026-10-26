export type PhaseType =
  | 'germinacao'     // Germinação / Plântula (Cinza/Branco)
  | 'vegetativo'     // Vegetativo / Crescimento (Verde)
  | 'floracao'       // Floração / Florada (Roxo / Púrpura)
  | 'rega_pura'      // Rega com Água Pura (Azul ciano)
  | 'flush'          // Lavagem de raízes (Vermelho)
  | 'colheita'       // Colheita e Secagem (Amarelo)
  | 'cura';          // Cura / Pós-colheita

export interface PhaseConfig {
  id: PhaseType;
  label: string;
  shortLabel: string;
  bgColor: string;       // Tailwind or hex color
  textColor: string;
  borderColor: string;
  description: string;
  defaultWeeks: number;
}

export type EventCornerType = 'rega' | 'fertilizacao' | 'poda' | 'transplante' | 'diario';

export interface NutrientItem {
  id: string;
  name: string;
  doseMlPerL: number;
  type?: 'base' | 'bloom' | 'calmag' | 'root' | 'booster' | 'micro';
}

export interface DayLog {
  date: string;               // YYYY-MM-DD
  phaseOverride?: PhaseType;  // Custom phase for this specific day
  
  // Rega (Watering)
  hasWatered?: boolean;
  waterVolumeL?: number;
  waterPh?: number;
  waterEc?: number;          // mS/cm or PPM
  runoffPh?: number;
  runoffEc?: number;

  // Fertilização (Nutrients)
  hasFertilized?: boolean;
  nutrients?: NutrientItem[];
  nutrientNotes?: string;

  // Manejo e Treinamento
  hasTrained?: boolean;
  trainingType?: string[];   // 'poda_apical', 'lst', 'desfoliacao', 'super_crop', etc.

  // Ambiente
  temperatureC?: number;
  humidityPct?: number;
  vpdKpa?: number;
  lightHours?: number;       // e.g. 18 or 12

  // Anotações gerais
  notes?: string;
  photos?: string[];         // Image data URLs or paths
}

export interface PlantProfile {
  id: string;
  name: string;
  strain: string;
  seedType: 'automatica' | 'fotoperiodo' | 'regular' | 'clonagem';
  startDate: string;         // YYYY-MM-DD (germination start)
  totalWeeks: number;        // Total weeks in grid (e.g. 13-16)
  
  // Phase planned durations in weeks
  germinationWeeks: number;  // typically 1-2
  vegetativeWeeks: number;   // typically 3-5
  floweringWeeks: number;    // typically 8-10
  flushWeeks: number;        // typically 1-2
  harvestDays: number;       // typically 3-7

  // Logs keyed by YYYY-MM-DD
  logs: Record<string, DayLog>;

  targetVpdVeg?: number;     // e.g. 0.8 - 1.1 kPa
  targetVpdFlora?: number;   // e.g. 1.2 - 1.5 kPa
  notes?: string;
}

export interface DayCellData {
  dateStr: string;           // YYYY-MM-DD
  displayDate: string;       // e.g. "15/mar"
  dayOfWeek: number;         // 0 (DOM) - 6 (SÁB)
  weekNumber: number;        // 1 to N
  dayOfCycle: number;        // 1 to N
  phase: PhaseType;
  isToday: boolean;
  isPast: boolean;
  isFuture: boolean;
  log?: DayLog;
  hasRega: boolean;
  hasFerti: boolean;
  hasPoda: boolean;
  hasNotes: boolean;
  hasPhotos: boolean;
}

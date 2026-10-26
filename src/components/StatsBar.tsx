import React from 'react';
import { PlantProfile } from '../types/grow';
import { generateCalendarGrid, PHASE_VISUAL_STYLES } from '../utils/cycleCalculations';
import { Clock, Calendar, Sprout, Sparkles, Droplets, Scissors, SunMedium, Gauge } from 'lucide-react';

interface StatsBarProps {
  plant: PlantProfile;
  referenceDateStr?: string;
  onOpenVpdCalc: () => void;
  onOpenCycleSettings: () => void;
}

export const StatsBar: React.FC<StatsBarProps> = ({
  plant,
  referenceDateStr,
  onOpenVpdCalc,
  onOpenCycleSettings,
}) => {
  const {
    totalDays,
    currentDayOfCycle,
    currentWeekNumber,
    currentPhase,
    estimatedHarvestDate,
    daysToHarvest,
  } = generateCalendarGrid(plant, referenceDateStr);

  const phaseStyle = PHASE_VISUAL_STYLES[currentPhase];
  const progressPercent = Math.min(100, Math.round((currentDayOfCycle / totalDays) * 100));

  // Count accumulated logs
  let totalWaterings = 0;
  let totalNutrientFeeds = 0;
  let totalPrunings = 0;
  let totalWaterVolumeL = 0;
  let lastWaterDate: string | null = null;

  Object.entries(plant.logs).forEach(([dateStr, log]) => {
    if (log.hasWatered || (log.waterVolumeL && log.waterVolumeL > 0)) {
      totalWaterings++;
      totalWaterVolumeL += log.waterVolumeL || 0;
      if (!lastWaterDate || dateStr > lastWaterDate) {
        lastWaterDate = dateStr;
      }
    }
    if (log.hasFertilized || (log.nutrients && log.nutrients.length > 0)) {
      totalNutrientFeeds++;
    }
    if (log.hasTrained || (log.trainingType && log.trainingType.length > 0)) {
      totalPrunings++;
    }
  });

  const isFlowering = currentPhase === 'floracao' || currentPhase === 'flush' || currentPhase === 'colheita';
  const targetPhotoperiod = isFlowering ? '12h Luz / 12h Escuro' : '18h Luz / 6h Escuro';
  const recommendedVpd = isFlowering ? '1.2 - 1.5 kPa' : '0.8 - 1.1 kPa';

  return (
    <div className="space-y-3">
      {/* Top 4 Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Card 1: Dias de Vida & Progresso */}
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-3.5 shadow-lg relative overflow-hidden group">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-1.5">
            <span className="flex items-center gap-1.5 font-medium">
              <Clock className="w-4 h-4 text-emerald-400" />
              Tempo de Vida Total
            </span>
            <span className="font-mono text-emerald-400 font-bold">{progressPercent}%</span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-white tracking-tight">
              Dia {currentDayOfCycle}
            </span>
            <span className="text-xs text-zinc-500 font-medium">
              de {totalDays} dias planejados
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden mt-3">
            <div
              className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Card 2: Semana e Fase Atual */}
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-3.5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-1.5">
            <span className="flex items-center gap-1.5 font-medium">
              <Calendar className="w-4 h-4 text-purple-400" />
              Semana do Cultivo
            </span>
            <button
              type="button"
              onClick={onOpenCycleSettings}
              className="text-[11px] text-zinc-500 hover:text-zinc-300 underline"
            >
              Ajustar
            </button>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="text-2xl font-black text-white tracking-tight">
              Semana {currentWeekNumber}
            </span>
            <div
              className="px-2 py-0.5 rounded text-[11px] font-bold shadow-sm"
              style={{
                backgroundColor: phaseStyle.bgHex,
                color: currentPhase === 'germinacao' || currentPhase === 'colheita' ? '#09090b' : '#ffffff',
              }}
            >
              {phaseStyle.name}
            </div>
          </div>

          <div className="text-[11px] text-zinc-400 mt-2 truncate">
            {phaseStyle.description}
          </div>
        </div>

        {/* Card 3: Previsão e Contagem para Colheita */}
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-3.5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-1.5">
            <span className="flex items-center gap-1.5 font-medium">
              <Sprout className="w-4 h-4 text-amber-400" />
              Contagem para Colheita
            </span>
            <span className="text-[11px] text-amber-400/80 font-mono">
              Est. {estimatedHarvestDate.split('-').reverse().slice(0, 2).join('/')}
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-400 tracking-tight">
              {daysToHarvest > 0 ? `${daysToHarvest} dias` : 'Pronta para colheita!'}
            </span>
            <span className="text-xs text-zinc-500 font-medium">
              {daysToHarvest > 0 ? 'restantes' : 'Aproveite!'}
            </span>
          </div>

          <div className="text-[11px] text-zinc-400 mt-2 flex items-center gap-1.5">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span>Colheita estimada em {plant.flushWeeks} semanas após flush</span>
          </div>
        </div>

        {/* Card 4: Manejo Acumulado & Clima */}
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-3.5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-1.5">
            <span className="flex items-center gap-1.5 font-medium">
              <Sparkles className="w-4 h-4 text-sky-400" />
              Manejos Registrados
            </span>
            <button
              type="button"
              onClick={onOpenVpdCalc}
              className="text-[11px] text-sky-400 hover:text-sky-300 flex items-center gap-1 font-semibold"
            >
              <Gauge className="w-3 h-3" /> VPD
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center mt-1">
            <div className="bg-zinc-950/60 p-1.5 rounded border border-zinc-800/80">
              <div className="text-base font-black text-sky-400">{totalWaterings}</div>
              <div className="text-[10px] text-zinc-500">Regas</div>
            </div>
            <div className="bg-zinc-950/60 p-1.5 rounded border border-zinc-800/80">
              <div className="text-base font-black text-red-400">{totalNutrientFeeds}</div>
              <div className="text-[10px] text-zinc-500">Fertilizações</div>
            </div>
            <div className="bg-zinc-950/60 p-1.5 rounded border border-zinc-800/80">
              <div className="text-base font-black text-purple-400">{totalPrunings}</div>
              <div className="text-[10px] text-zinc-500">Podas/LST</div>
            </div>
          </div>

          <div className="text-[11px] text-zinc-400 mt-2 flex items-center justify-between">
            <span className="flex items-center gap-1 text-zinc-400">
              <SunMedium className="w-3 h-3 text-amber-300" /> {targetPhotoperiod}
            </span>
            <span className="text-zinc-500">VPD Alvo: {recommendedVpd}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

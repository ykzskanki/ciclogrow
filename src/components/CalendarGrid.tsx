import React, { useState } from 'react';
import { PlantProfile, DayCellData, PhaseType } from '../types/grow';
import { generateCalendarGrid, PHASE_VISUAL_STYLES, toDateString } from '../utils/cycleCalculations';
import { Droplet, Sparkles, Scissors, FileText, Camera, Flame, CheckCircle2 } from 'lucide-react';

interface CalendarGridProps {
  plant: PlantProfile;
  referenceDateStr?: string;
  onSetReferenceDate?: (dateStr: string) => void;
  onDayClick: (day: DayCellData) => void;
  activeBrushPhase: PhaseType | null;
  onPaintDay: (dateStr: string, phase: PhaseType) => void;
}

export const CalendarGrid: React.FC<CalendarGridProps> = ({
  plant,
  referenceDateStr,
  onSetReferenceDate,
  onDayClick,
  activeBrushPhase,
  onPaintDay,
}) => {
  const [hoveredDay, setHoveredDay] = useState<DayCellData | null>(null);
  const [filterMode, setFilterMode] = useState<'all' | 'actions_only'>('all');

  const { weeks, currentDayOfCycle, currentWeekNumber, referenceDateStr: effectiveRefDate } = generateCalendarGrid(
    plant,
    referenceDateStr
  );

  const dayHeaders = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];

  const handleCellClick = (day: DayCellData) => {
    if (activeBrushPhase) {
      onPaintDay(day.dateStr, activeBrushPhase);
    } else {
      onDayClick(day);
    }
  };

  // Format reference date and live Windows calendar date
  const now = new Date();
  const windowsTodayStr = toDateString(now);
  const refDateObj = new Date(effectiveRefDate + 'T12:00:00');
  const monthEnglish = refDateObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const windowsDateFormattedPt = now.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden flex flex-col">
      {/* Top utility bar above calendar */}
      <div className="bg-zinc-900/90 px-4 py-2.5 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <span className="font-bold text-zinc-300">Grade de Desenvolvimento Semanal</span>
          <span className="text-zinc-600 hidden sm:inline">•</span>
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-zinc-400">Data Base:</span>
            <button
              type="button"
              onClick={() => onSetReferenceDate && onSetReferenceDate(windowsTodayStr)}
              className={`px-2.5 py-0.5 rounded text-[11px] font-mono transition-colors flex items-center gap-1 ${
                effectiveRefDate === windowsTodayStr
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                  : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Hoje no Windows ({windowsTodayStr.split('-').reverse().slice(0, 2).join('/')})
            </button>
            <button
              type="button"
              onClick={() => onSetReferenceDate && onSetReferenceDate('2026-03-21')}
              className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
                effectiveRefDate === '2026-03-21'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                  : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              21/mar (Foto)
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-zinc-400 text-[11px]">Visualização:</span>
          <button
            type="button"
            onClick={() => setFilterMode('all')}
            className={`px-2.5 py-1 rounded text-xs transition-colors ${
              filterMode === 'all'
                ? 'bg-zinc-700 text-white font-medium'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Completo (Original)
          </button>
          <button
            type="button"
            onClick={() => setFilterMode('actions_only')}
            className={`px-2.5 py-1 rounded text-xs transition-colors ${
              filterMode === 'actions_only'
                ? 'bg-zinc-700 text-white font-medium'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Apenas Dias com Manejo
          </button>
        </div>
      </div>

      {/* The authentic grid container */}
      <div className="overflow-x-auto select-none">
        <div className="min-w-[860px] w-full">
          {/* Header row: SEMANA | DOM | SEG | TER | QUA | QUI | SEX | SÁB with Windows date on right */}
          <div className="grid grid-cols-[80px_repeat(7,1fr)_72px] bg-black text-white border-b-2 border-zinc-950 font-black tracking-wider text-xs">
            <div className="py-2.5 px-3 flex items-center justify-center border-r border-zinc-800 tracking-wider">
              SEMANA
            </div>
            {dayHeaders.map((header, idx) => (
              <div
                key={header}
                className="py-2.5 px-2 text-center border-r border-zinc-800 tracking-wider relative"
              >
                <div>{header}</div>
                {/* On Saturday column, replicate the date badge from the photo, synced with Windows */}
                {idx === 6 && (
                  <div className="text-[10px] text-zinc-300 font-normal tracking-normal lowercase first-letter:uppercase absolute -bottom-4 right-1/2 translate-x-1/2 sm:translate-x-0 sm:right-2 z-20 pointer-events-none drop-shadow">
                    {effectiveRefDate === '2026-03-21' ? monthEnglish : windowsDateFormattedPt}
                  </div>
                )}
              </div>
            ))}
            <div className="py-2.5 px-1 text-center bg-black text-[10px] text-amber-400 font-bold flex items-center justify-center">
              FASES
            </div>
          </div>

          {/* Week rows */}
          {weeks.map((week, weekIdx) => {
            return (
              <div
                key={week.weekNumber}
                className="grid grid-cols-[80px_repeat(7,1fr)_72px] border-b border-zinc-800/80 group"
              >
                {/* Week number column (Left Gray Column inspired by image) */}
                <div className="bg-zinc-300 text-zinc-950 border-r border-zinc-400 font-serif font-black text-2xl flex items-center justify-center shadow-inner select-none">
                  {week.weekNumber}
                </div>

                {/* The 7 Day Cells */}
                {week.days.map((day) => {
                  const style = PHASE_VISUAL_STYLES[day.phase];
                  const hasDimming = filterMode === 'actions_only' && !day.hasRega && !day.hasFerti && !day.hasPoda && !day.hasNotes;
                  const isLightBg = day.phase === 'germinacao' || day.phase === 'colheita';

                  return (
                    <button
                      type="button"
                      key={day.dateStr}
                      onClick={() => handleCellClick(day)}
                      onMouseEnter={() => setHoveredDay(day)}
                      onMouseLeave={() => setHoveredDay(null)}
                      aria-label={`Dia ${day.displayDate}, fase ${style.name}, semana ${day.weekNumber}`}
                      className={`relative min-h-[58px] p-1.5 border-r border-zinc-900/60 cursor-pointer transition-all duration-150 flex flex-col justify-between text-left ${
                        hasDimming ? 'opacity-30 saturate-50' : 'opacity-100'
                      } ${
                        day.isToday
                          ? 'ring-2 ring-emerald-400 ring-offset-2 ring-offset-black z-10'
                          : 'hover:brightness-110'
                      }`}
                      style={{
                        backgroundColor: style.bgHex,
                      }}
                    >
                      {/* Top-Right Triangle Corner Tag: Fertilization (Red) */}
                      {day.hasFerti && (
                        <div
                          className="absolute top-0 right-0 w-0 h-0 border-t-[14px] border-t-red-600 border-l-[14px] border-l-transparent z-10"
                          title="Fertilização aplicada neste dia"
                        />
                      )}

                      {/* Top-Left Triangle Corner Tag: Training/Pruning (Purple) */}
                      {day.hasPoda && (
                        <div
                          className="absolute top-0 left-0 w-0 h-0 border-t-[14px] border-t-purple-500 border-r-[14px] border-r-transparent z-10"
                          title="Poda / Treinamento realizado"
                        />
                      )}

                      {/* Bottom-Right Triangle Corner Tag: Water (Cyan/Blue) */}
                      {day.hasRega && (
                        <div
                          className="absolute bottom-0 right-0 w-0 h-0 border-b-[14px] border-b-sky-300 border-l-[14px] border-l-transparent z-10"
                          title="Rega com água registrada"
                        />
                      )}

                      {/* Bottom-Left Triangle Corner Tag: Notes (Amber) */}
                      {day.hasNotes && (
                        <div
                          className="absolute bottom-0 left-0 w-0 h-0 border-b-[12px] border-b-amber-300 border-r-[12px] border-r-transparent z-10"
                          title="Diário / Observação escrita"
                        />
                      )}

                      {/* Cell header: Date label e.g. "15/mar" */}
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-xs font-bold tracking-tight select-none ${
                            isLightBg ? 'text-zinc-950 font-black' : 'text-white drop-shadow-sm'
                          }`}
                        >
                          {day.displayDate}
                        </span>

                        {day.isToday && (
                          <span className="bg-emerald-500 text-zinc-950 text-[9px] font-black uppercase px-1 py-0.2 rounded shadow-sm animate-pulse">
                            HOJE
                          </span>
                        )}
                      </div>

                      {/* Middle indicator icons if actions recorded */}
                      <div className="flex items-center gap-1 mt-1 text-[11px] flex-wrap">
                        {day.hasRega && (
                          <span
                            className={`flex items-center text-[10px] font-bold ${
                              isLightBg ? 'text-sky-800' : 'text-sky-200'
                            }`}
                          >
                            <Droplet className="w-2.5 h-2.5 inline fill-current" />
                            {day.log?.waterVolumeL ? `${day.log.waterVolumeL}L` : ''}
                          </span>
                        )}
                        {day.hasFerti && (
                          <span
                            className={`text-[10px] font-bold ${
                              isLightBg ? 'text-red-700' : 'text-red-200'
                            }`}
                          >
                            <Sparkles className="w-2.5 h-2.5 inline" />
                          </span>
                        )}
                        {day.hasPoda && (
                          <span
                            className={`text-[10px] font-bold ${
                              isLightBg ? 'text-purple-800' : 'text-purple-200'
                            }`}
                          >
                            <Scissors className="w-2.5 h-2.5 inline" />
                          </span>
                        )}
                      </div>

                      {/* Bottom subtle day of cycle counter */}
                      <div className="flex items-center justify-between text-[10px] opacity-75 mt-auto pt-0.5">
                        <span className={isLightBg ? 'text-zinc-800' : 'text-zinc-200'}>
                          D{day.dayOfCycle}
                        </span>
                        {day.log?.waterPh && (
                          <span className={`text-[9px] font-mono ${isLightBg ? 'text-zinc-700' : 'text-zinc-200'}`}>
                            pH {day.log.waterPh}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}

                {/* Right Column: Month block markers (Yellow boxes 1, 2, 3, 4 like in the picture) */}
                <div className="bg-zinc-950 border-l border-zinc-800 flex items-center justify-center p-1">
                  {week.monthGroupNumber && (
                    <div
                      className="w-full h-full min-h-[44px] bg-amber-400 hover:bg-amber-300 text-zinc-950 font-black text-xl flex items-center justify-center rounded shadow-md border border-amber-500 cursor-default select-none"
                      title={`Mês ${week.monthGroupNumber} de cultivo`}
                    >
                      {week.monthGroupNumber}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom status bar showing hovered cell preview */}
      <div className="bg-zinc-900 border-t border-zinc-800 px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-3 text-zinc-400 min-h-[38px]">
        {hoveredDay ? (
          <div className="flex items-center gap-4 text-zinc-200">
            <span className="font-bold text-white">
              {hoveredDay.displayDate} ({dayHeaders[hoveredDay.dayOfWeek]})
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              Fase: <strong>{PHASE_VISUAL_STYLES[hoveredDay.phase].name}</strong>
            </span>
            <span>•</span>
            <span>Dia do Ciclo: <strong>{hoveredDay.dayOfCycle}</strong> (Semana {hoveredDay.weekNumber})</span>
            {hoveredDay.log?.waterVolumeL && (
              <>
                <span>•</span>
                <span className="text-sky-400 flex items-center gap-1">
                  <Droplet className="w-3.5 h-3.5" /> {hoveredDay.log.waterVolumeL}L (pH: {hoveredDay.log.waterPh || '-'}, EC: {hoveredDay.log.waterEc || '-'})
                </span>
              </>
            )}
            {hoveredDay.log?.notes && (
              <>
                <span>•</span>
                <span className="text-amber-300 italic max-w-sm truncate">
                  "{hoveredDay.log.notes}"
                </span>
              </>
            )}
          </div>
        ) : (
          <span className="text-zinc-500 italic">
            Passe o mouse sobre os dias para inspecionar ou clique para editar registros de rega, nutrientes e manejo.
          </span>
        )}

        <div className="text-[11px] text-zinc-500">
          Clique no dia para abrir o Diário de Bordo
        </div>
      </div>
    </div>
  );
};

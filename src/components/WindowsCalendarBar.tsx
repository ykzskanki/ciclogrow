import React, { useState, useEffect } from 'react';
import { PlantProfile } from '../types/grow';
import { diffDays, toDateString, addDays } from '../utils/cycleCalculations';
import { Monitor, Clock, Calendar as CalendarIcon, RefreshCw, CheckCircle2, Sparkles, ArrowRight } from 'lucide-react';

interface WindowsCalendarBarProps {
  plant: PlantProfile;
  referenceDateStr: string;
  onSetReferenceDate: (dateStr: string) => void;
  onSyncPlantStartToToday: (offsetDays?: number) => void;
}

export const WindowsCalendarBar: React.FC<WindowsCalendarBarProps> = ({
  plant,
  referenceDateStr,
  onSetReferenceDate,
  onSyncPlantStartToToday,
}) => {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const todayStr = toDateString(currentTime);
  const timeFormatted = currentTime.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const fullDateFormatted = currentTime.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const daysSincePlantStart = diffDays(plant.startDate, todayStr);
  const dayOfCycleToday = daysSincePlantStart + 1;
  const isTodayActive = referenceDateStr === todayStr;

  return (
    <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-3 shadow-lg flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-300">
      {/* Left: Windows clock and date */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
          <Monitor className="w-4 h-4" />
        </div>

        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-white flex items-center gap-1.5 capitalize">
              <CalendarIcon className="w-3.5 h-3.5 text-sky-400 inline" />
              {fullDateFormatted}
            </span>
            <span className="text-zinc-600">•</span>
            <span className="font-mono text-sky-400 font-bold flex items-center gap-1">
              <Clock className="w-3 h-3 text-sky-400" />
              {timeFormatted}
            </span>
            <span className="hidden md:inline-flex items-center gap-1 text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.2 rounded font-medium">
              <CheckCircle2 className="w-3 h-3" /> Sincronizado com o Windows
            </span>
          </div>

          <div className="text-[11px] text-zinc-400 mt-0.5">
            {dayOfCycleToday > 0 ? (
              <span>
                Hoje no calendário real é o <strong>Dia {dayOfCycleToday}</strong> do cultivo da planta{' '}
                <strong className="text-zinc-200">"{plant.name}"</strong> (iniciado em{' '}
                {plant.startDate.split('-').reverse().join('/')}).
              </span>
            ) : (
              <span>
                Cultivo programado para iniciar em {plant.startDate.split('-').reverse().join('/')}.
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right: Quick actions for calendar synchronization */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => onSetReferenceDate(todayStr)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-medium text-xs transition-colors ${
            isTodayActive
              ? 'bg-sky-500/20 border-sky-500/50 text-sky-300 font-bold'
              : 'bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-zinc-300'
          }`}
        >
          <CalendarIcon className="w-3.5 h-3.5" />
          <span>Focar em Hoje ({todayStr.split('-').reverse().slice(0, 2).join('/')})</span>
        </button>

        <div className="relative group">
          <button
            type="button"
            onClick={() => onSyncPlantStartToToday(0)}
            title="Ajusta o início da germinação para a data atual do Windows"
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 font-medium text-xs transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
            <span>Germinou Hoje</span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => onSyncPlantStartToToday(21)}
          title="Define que a planta começou há 3 semanas a partir do calendário de hoje (início do Vegetativo)"
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 text-xs transition-colors hidden sm:flex"
        >
          <span>Começou há 3 sem. (Vega)</span>
        </button>
      </div>
    </div>
  );
};

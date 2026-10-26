import React, { useState } from 'react';
import { PlantProfile, DayLog } from '../types/grow';
import { addDays, diffDays } from '../utils/cycleCalculations';
import { X, CalendarClock, Droplet, Sparkles, Check } from 'lucide-react';

interface BatchWateringModalProps {
  plant: PlantProfile;
  isOpen: boolean;
  onClose: () => void;
  onApplyBatch: (updatedLogs: Record<string, DayLog>) => void;
}

export const BatchWateringModal: React.FC<BatchWateringModalProps> = ({
  plant,
  isOpen,
  onClose,
  onApplyBatch,
}) => {
  if (!isOpen) return null;

  const [intervalDays, setIntervalDays] = useState<number>(3);
  const [alternateFerti, setAlternateFerti] = useState<boolean>(true);
  const [waterVolumeL, setWaterVolumeL] = useState<string>('1.5');
  const [waterPh, setWaterPh] = useState<string>('6.3');
  const [startOffsetWeeks, setStartOffsetWeeks] = useState<number>(2); // Start from week 2
  const [endOffsetWeeks, setEndOffsetWeeks] = useState<number>(11); // Up to week 11

  const handleApply = () => {
    const totalDays = plant.totalWeeks * 7;
    const startDay = (startOffsetWeeks - 1) * 7;
    const endDay = Math.min(totalDays, endOffsetWeeks * 7);

    const newLogs = { ...plant.logs };
    let toggleFerti = false;

    for (let day = startDay; day < endDay; day += intervalDays) {
      const dateStr = addDays(plant.startDate, day);
      const existing = newLogs[dateStr] || { date: dateStr };

      const isFertiDay = alternateFerti ? toggleFerti : false;

      newLogs[dateStr] = {
        ...existing,
        hasWatered: true,
        phaseOverride: isFertiDay ? existing.phaseOverride : 'rega_pura',
        waterVolumeL: parseFloat(waterVolumeL) || 1.5,
        waterPh: parseFloat(waterPh) || 6.3,
        hasFertilized: isFertiDay ? true : existing.hasFertilized,
        nutrients: isFertiDay && (!existing.nutrients || existing.nutrients.length === 0)
          ? [{ id: Date.now().toString() + day, name: 'Nutriente Programado', doseMlPerL: 2.0, type: 'base' }]
          : existing.nutrients,
      };

      toggleFerti = !toggleFerti;
    }

    onApplyBatch(newLogs);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-zinc-900 border border-zinc-700/80 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden text-zinc-100">
        <div className="px-5 py-4 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarClock className="w-5 h-5 text-sky-400" />
            <h2 className="text-lg font-bold text-white">
              Gerador de Agenda de Regas & Nutrição
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar gerador de agenda"
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <p className="text-xs text-zinc-400">
            Preencha automaticamente os dias de rega na grade, alternando água pura (azul) e fertilização (marcador vermelho), como no cronograma clássico.
          </p>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">
                Intervalo entre Regas
              </label>
              <select
                value={intervalDays}
                onChange={(e) => setIntervalDays(parseInt(e.target.value, 10))}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500"
              >
                <option value={2}>A cada 2 dias (vasos menores)</option>
                <option value={3}>A cada 3 dias (padrão 11L)</option>
                <option value={4}>A cada 4 dias (vasos grandes)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">
                Volume Padrão (L)
              </label>
              <input
                type="number"
                step="0.1"
                value={waterVolumeL}
                onChange={(e) => setWaterVolumeL(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">
                A partir da Semana
              </label>
              <input
                type="number"
                min="1"
                max={plant.totalWeeks}
                value={startOffsetWeeks}
                onChange={(e) => setStartOffsetWeeks(parseInt(e.target.value, 10) || 1)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">
                Até a Semana
              </label>
              <input
                type="number"
                min={startOffsetWeeks}
                max={plant.totalWeeks}
                value={endOffsetWeeks}
                onChange={(e) => setEndOffsetWeeks(parseInt(e.target.value, 10) || 12)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          {/* Toggle Alternate */}
          <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-zinc-200 block">
                Alternar Água Pura e Nutrientes
              </span>
              <span className="text-[11px] text-zinc-400 block">
                Padrão clássico: Rega 1 (Água) ➔ Rega 2 (Nutrientes) ➔ Rega 3 (Água)
              </span>
            </div>
            <input
              type="checkbox"
              checked={alternateFerti}
              onChange={(e) => setAlternateFerti(e.target.checked)}
              className="w-5 h-5 rounded text-sky-500 focus:ring-sky-400 bg-zinc-800 border-zinc-700"
            />
          </div>
        </div>

        <div className="px-5 py-3.5 bg-zinc-950 border-t border-zinc-800 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="px-5 py-2 text-xs font-bold text-zinc-950 bg-sky-400 hover:bg-sky-300 rounded-lg shadow-lg flex items-center gap-1.5 transition-all"
          >
            <Check className="w-4 h-4" /> Aplicar na Grade
          </button>
        </div>
      </div>
    </div>
  );
};

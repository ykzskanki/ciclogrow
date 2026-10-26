import React, { useState } from 'react';
import { PlantProfile } from '../types/grow';
import { CYCLE_PRESETS } from '../utils/defaultData';
import { X, Save, Sliders, Sparkles, Plus, Trash2 } from 'lucide-react';

interface PlantSettingsModalProps {
  plant: PlantProfile;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: PlantProfile) => void;
  onDeletePlant?: (id: string) => void;
}

export const PlantSettingsModal: React.FC<PlantSettingsModalProps> = ({
  plant,
  isOpen,
  onClose,
  onSave,
  onDeletePlant,
}) => {
  if (!isOpen) return null;

  const [name, setName] = useState(plant.name);
  const [strain, setStrain] = useState(plant.strain);
  const [seedType, setSeedType] = useState(plant.seedType);
  const [startDate, setStartDate] = useState(plant.startDate);
  const [totalWeeks, setTotalWeeks] = useState(plant.totalWeeks);

  const [germinationWeeks, setGerminationWeeks] = useState(plant.germinationWeeks);
  const [vegetativeWeeks, setVegetativeWeeks] = useState(plant.vegetativeWeeks);
  const [floweringWeeks, setFloweringWeeks] = useState(plant.floweringWeeks);
  const [flushWeeks, setFlushWeeks] = useState(plant.flushWeeks);
  const [notes, setNotes] = useState(plant.notes || '');

  const handleApplyPreset = (preset: typeof CYCLE_PRESETS[0]) => {
    setTotalWeeks(preset.totalWeeks);
    setGerminationWeeks(preset.germinationWeeks);
    setVegetativeWeeks(preset.vegetativeWeeks);
    setFloweringWeeks(preset.floweringWeeks);
    setFlushWeeks(preset.flushWeeks);
    setSeedType(preset.seedType);
  };

  const handleSave = () => {
    const updated: PlantProfile = {
      ...plant,
      name: name.trim() || 'Minha Planta',
      strain: strain.trim() || 'Genética Padrão',
      seedType,
      startDate,
      totalWeeks: Math.max(10, totalWeeks),
      germinationWeeks: Math.max(1, germinationWeeks),
      vegetativeWeeks: Math.max(1, vegetativeWeeks),
      floweringWeeks: Math.max(1, floweringWeeks),
      flushWeeks: Math.max(1, flushWeeks),
      notes: notes.trim() || undefined,
    };
    onSave(updated);
    onClose();
  };

  const totalCycleWeeks = germinationWeeks + vegetativeWeeks + floweringWeeks + flushWeeks;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-zinc-900 border border-zinc-700/80 rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-zinc-100">
        <div className="px-5 py-4 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold text-white">
              Configurações de Ciclo da Planta
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar configurações"
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Quick Presets */}
          <div>
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-2">
              Modelos Prontos de Ciclo (Presets)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {CYCLE_PRESETS.map((preset) => (
                <button
                  type="button"
                  key={preset.name}
                  onClick={() => handleApplyPreset(preset)}
                  className="p-2.5 bg-zinc-950 border border-zinc-800 hover:border-emerald-500 rounded-xl text-left text-xs transition-colors"
                >
                  <div className="font-bold text-emerald-300">{preset.name}</div>
                  <div className="text-[11px] text-zinc-400 mt-0.5">{preset.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Plant Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-zinc-800">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">
                Nome da Planta / Identificador
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">
                Genética / Strain
              </label>
              <input
                type="text"
                value={strain}
                onChange={(e) => setStrain(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-zinc-400">
                  Data Inicial (Germinação)
                </label>
                <span className="text-[10px] text-sky-400 font-mono">Calendário Windows</span>
              </div>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
              <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                <button
                  type="button"
                  onClick={() => setStartDate(new Date().toISOString().split('T')[0])}
                  className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-emerald-400 text-[10px] font-semibold"
                >
                  Hoje no Windows
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const d = new Date();
                    d.setDate(d.getDate() - 14);
                    setStartDate(d.toISOString().split('T')[0]);
                  }}
                  className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px]"
                >
                  Há 2 semanas
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const d = new Date();
                    d.setDate(d.getDate() - 28);
                    setStartDate(d.toISOString().split('T')[0]);
                  }}
                  className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px]"
                >
                  Há 4 semanas
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">
                Tipo de Genética
              </label>
              <select
                value={seedType}
                onChange={(e) => setSeedType(e.target.value as any)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="fotoperiodo">Fotoperíodo (18h Veg / 12h Flora)</option>
                <option value="automatica">Automática (Autoflower)</option>
                <option value="regular">Regular / Horta Comum</option>
                <option value="clonagem">Clone / Mudas</option>
              </select>
            </div>
          </div>

          {/* Phase Durations in Weeks */}
          <div className="pt-2 border-t border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                Duração Planejada das Fases (em Semanas)
              </span>
              <span className="text-xs font-mono font-bold text-emerald-400">
                Total: {totalCycleWeeks} semanas
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-800">
                <label className="block text-[11px] text-zinc-400 mb-1">Germinação</label>
                <input
                  type="number"
                  min="1"
                  max="4"
                  value={germinationWeeks}
                  onChange={(e) => setGerminationWeeks(parseInt(e.target.value, 10) || 1)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-sm font-bold text-white text-center"
                />
              </div>

              <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-800">
                <label className="block text-[11px] text-emerald-400 mb-1">Vegetativo</label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={vegetativeWeeks}
                  onChange={(e) => setVegetativeWeeks(parseInt(e.target.value, 10) || 1)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-sm font-bold text-white text-center"
                />
              </div>

              <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-800">
                <label className="block text-[11px] text-purple-400 mb-1">Floração</label>
                <input
                  type="number"
                  min="1"
                  max="16"
                  value={floweringWeeks}
                  onChange={(e) => setFloweringWeeks(parseInt(e.target.value, 10) || 1)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-sm font-bold text-white text-center"
                />
              </div>

              <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-800">
                <label className="block text-[11px] text-red-400 mb-1">Flush</label>
                <input
                  type="number"
                  min="1"
                  max="4"
                  value={flushWeeks}
                  onChange={(e) => setFlushWeeks(parseInt(e.target.value, 10) || 1)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-sm font-bold text-white text-center"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">
                Linhas de Semanas Visíveis na Tabela Principal (Mínimo 12, Padrão 13)
              </label>
              <input
                type="number"
                min="12"
                max="24"
                value={totalWeeks}
                onChange={(e) => setTotalWeeks(parseInt(e.target.value, 10) || 13)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Plant notes */}
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1">
              Notas e Equipamentos (Substrato, Iluminação, Vaso)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              placeholder="ex: Vaso de feltro 11L, LED 240W, substrato 50% turfa 50% perlita..."
            />
          </div>
        </div>

        <div className="px-5 py-3.5 bg-zinc-950 border-t border-zinc-800 flex items-center justify-between">
          {onDeletePlant ? (
            <button
              type="button"
              onClick={() => {
                if (confirm('Deseja excluir esta planta e todos os seus registros?')) {
                  onDeletePlant(plant.id);
                  onClose();
                }
              }}
              className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 font-semibold"
            >
              <Trash2 className="w-3.5 h-3.5" /> Excluir Planta
            </button>
          ) : <div />}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 text-xs font-bold text-zinc-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg shadow-lg flex items-center gap-1.5 transition-all"
            >
              <Save className="w-3.5 h-3.5" /> Salvar Configurações
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

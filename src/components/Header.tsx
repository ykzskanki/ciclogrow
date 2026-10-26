import React, { useRef } from 'react';
import { PlantProfile } from '../types/grow';
import {
  Sprout,
  Plus,
  Sliders,
  CalendarClock,
  Gauge,
  Download,
  Upload,
  ChevronDown,
  Printer,
  Monitor,
} from 'lucide-react';

interface HeaderProps {
  plants: PlantProfile[];
  activePlantId: string;
  onSelectPlant: (id: string) => void;
  onNewPlant: () => void;
  onOpenSettings: () => void;
  onOpenBatchWatering: () => void;
  onOpenVpdCalc: () => void;
  onOpenInstallModal?: () => void;
  onExportData: () => void;
  onImportData: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const Header: React.FC<HeaderProps> = ({
  plants,
  activePlantId,
  onSelectPlant,
  onNewPlant,
  onOpenSettings,
  onOpenBatchWatering,
  onOpenVpdCalc,
  onOpenInstallModal,
  onExportData,
  onImportData,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const activePlant = plants.find((p) => p.id === activePlantId) || plants[0];

  return (
    <header className="bg-zinc-950 border-b border-zinc-800 text-zinc-100 sticky top-0 z-40 backdrop-blur-md bg-zinc-950/90">
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Logo and Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-zinc-950 shadow-lg shadow-emerald-500/20">
            <Sprout className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black tracking-tight text-white">
                CicloGrow <span className="text-emerald-400 font-mono text-xs">PRO</span>
              </h1>
              <span className="text-[10px] bg-zinc-800 text-zinc-300 px-1.5 py-0.5 rounded font-mono border border-zinc-700">
                Tema Escuro
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Rastreador de Ciclos e Desenvolvimento Diário
            </p>
          </div>
        </div>

        {/* Plant Switcher Dropdown */}
        <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-xl px-2.5 py-1.5 shadow-sm">
          <Sprout className="w-4 h-4 text-emerald-400 shrink-0" />
          <div className="flex flex-col">
            <label htmlFor="plantSelect" className="text-[9px] uppercase tracking-wider text-zinc-500 font-bold">
              Planta / Lote
            </label>
            <select
              id="plantSelect"
              value={activePlantId}
              onChange={(e) => onSelectPlant(e.target.value)}
              className="bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer pr-4"
            >
              {plants.map((p) => (
                <option key={p.id} value={p.id} className="bg-zinc-900 text-white">
                  {p.name} ({p.strain})
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={onNewPlant}
            aria-label="Adicionar nova planta"
            title="Adicionar nova planta"
            className="p-1.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 rounded-lg transition-colors ml-1"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
          </button>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <button
            type="button"
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 transition-colors font-medium"
          >
            <Sliders className="w-3.5 h-3.5 text-emerald-400" />
            <span>Ciclo</span>
          </button>

          <button
            type="button"
            onClick={onOpenBatchWatering}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 transition-colors font-medium"
          >
            <CalendarClock className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden sm:inline">Agenda de</span> Regas
          </button>

          <button
            type="button"
            onClick={onOpenVpdCalc}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 transition-colors font-medium"
          >
            <Gauge className="w-3.5 h-3.5 text-amber-400" />
            <span>VPD</span>
          </button>

          {/* Install on Windows button */}
          {onOpenInstallModal && (
            <button
              type="button"
              onClick={onOpenInstallModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold transition-all shadow-md shadow-emerald-500/20"
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Instalar no Windows</span>
            </button>
          )}

          {/* Export / Import */}
          <button
            type="button"
            onClick={onExportData}
            title="Exportar backup em JSON"
            aria-label="Exportar dados de cultivo"
            className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={onImportData}
            accept=".json"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            title="Importar dados de arquivo JSON"
            aria-label="Importar dados de cultivo"
            className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            title="Imprimir ou Salvar PDF"
            aria-label="Imprimir grade de cultivo"
            className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 transition-colors hidden sm:block"
          >
            <Printer className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};

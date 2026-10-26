import React from 'react';
import { PhaseType } from '../types/grow';
import { PHASE_VISUAL_STYLES } from '../utils/cycleCalculations';
import { Paintbrush, X } from 'lucide-react';

interface ColorLegendProps {
  activeBrushPhase: PhaseType | null;
  onSelectBrushPhase: (phase: PhaseType | null) => void;
}

export const ColorLegend: React.FC<ColorLegendProps> = ({
  activeBrushPhase,
  onSelectBrushPhase,
}) => {
  const phases: PhaseType[] = [
    'germinacao',
    'vegetativo',
    'floracao',
    'rega_pura',
    'flush',
    'colheita',
  ];

  return (
    <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-4 shadow-xl backdrop-blur-md">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3 pb-2 border-b border-zinc-800/80">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
            Legenda de Cores & Fases do Cultivo
          </h3>
          <span className="text-[11px] text-zinc-500 hidden sm:inline">
            (Inspirado no padrão original da tabela)
          </span>
        </div>

        <div className="flex items-center gap-2">
          {activeBrushPhase ? (
            <div className="flex items-center gap-1.5 bg-amber-500/20 border border-amber-500/40 text-amber-300 px-2 py-0.5 rounded text-xs">
              <Paintbrush className="w-3.5 h-3.5 animate-bounce" />
              <span>Pincel Ativo: <strong>{PHASE_VISUAL_STYLES[activeBrushPhase].name}</strong></span>
              <button
                type="button"
                onClick={() => onSelectBrushPhase(null)}
                aria-label="Desativar modo pincel"
                className="hover:text-white ml-1 p-0.5 rounded hover:bg-zinc-700"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <span className="text-[11px] text-zinc-500 hidden md:inline">
              Clique numa cor para ativar o <strong>Pincel de Fases</strong> e pintar dias
            </span>
          )}
        </div>
      </div>

      {/* Main phase chips */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {phases.map((phaseKey) => {
          const style = PHASE_VISUAL_STYLES[phaseKey];
          const isSelected = activeBrushPhase === phaseKey;

          return (
            <button
              type="button"
              key={phaseKey}
              onClick={() => onSelectBrushPhase(isSelected ? null : phaseKey)}
              aria-label={`Pintar com fase ${style.name}`}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg border text-left transition-all ${
                isSelected
                  ? 'ring-2 ring-white scale-102 shadow-lg border-white'
                  : 'hover:brightness-110 hover:border-zinc-500 border-zinc-800'
              }`}
              style={{
                backgroundColor: style.bgHex,
                color: phaseKey === 'germinacao' || phaseKey === 'colheita' ? '#09090b' : '#ffffff',
              }}
            >
              <div
                className={`w-3.5 h-3.5 rounded-sm shrink-0 border border-black/30 shadow-inner`}
                style={{ backgroundColor: style.bgHex }}
              />
              <div className="min-w-0">
                <div className="text-xs font-bold truncate leading-tight">{style.name}</div>
                <div className="text-[10px] opacity-80 truncate hidden sm:block">
                  {phaseKey === 'rega_pura' ? 'Água / Rega' : style.description.split(' ')[0]}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Corner marks legend (inspired by the small colored triangles on cells in the screenshot) */}
      <div className="mt-3 pt-2 border-t border-zinc-800/80 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[11px] text-zinc-400">
        <span className="text-zinc-500 font-medium">Marcadores nos Cantos:</span>
        <div className="flex items-center gap-1.5">
          <span className="w-0 h-0 border-t-[8px] border-t-red-500 border-l-[8px] border-l-transparent inline-block" />
          <span>Fertilização / Nutrientes</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-0 h-0 border-t-[8px] border-t-purple-500 border-l-[8px] border-l-transparent inline-block" />
          <span>Poda / Treinamento (LST/Topping)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-0 h-0 border-b-[8px] border-b-sky-400 border-l-[8px] border-l-transparent inline-block" />
          <span>Rega Registrada</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-0 h-0 border-t-[8px] border-t-amber-400 border-l-[8px] border-l-transparent inline-block" />
          <span>Nota / Diário de Bordo</span>
        </div>
      </div>
    </div>
  );
};

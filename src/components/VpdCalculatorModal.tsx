import React, { useState } from 'react';
import { calculateVpd } from '../utils/cycleCalculations';
import { X, Gauge, Info, Thermometer, Droplets } from 'lucide-react';

interface VpdCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VpdCalculatorModal: React.FC<VpdCalculatorModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const [tempC, setTempC] = useState<number>(25);
  const [humidityPct, setHumidityPct] = useState<number>(60);
  const [leafOffset, setLeafOffset] = useState<number>(-1.5);

  const { vpdAir, vpdLeaf, status, description } = calculateVpd(tempC, humidityPct, leafOffset);

  const getStatusColor = () => {
    switch (status) {
      case 'baixa':
        return 'text-sky-400 bg-sky-950/40 border-sky-800';
      case 'ideal_veg':
        return 'text-emerald-400 bg-emerald-950/40 border-emerald-800';
      case 'ideal_flora':
        return 'text-purple-400 bg-purple-950/40 border-purple-800';
      case 'alta':
        return 'text-amber-400 bg-amber-950/40 border-amber-800';
      case 'perigo':
        return 'text-red-400 bg-red-950/40 border-red-800';
    }
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
            <Gauge className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold text-white">
              Calculadora de VPD (Déficit de Pressão de Vapor)
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar calculadora VPD"
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Main big display */}
          <div className={`p-4 rounded-xl border flex flex-col items-center justify-center text-center ${getStatusColor()}`}>
            <span className="text-xs uppercase font-bold tracking-wider opacity-80">
              VPD da Folha Calculado
            </span>
            <div className="text-4xl font-black font-mono my-1 tracking-tight">
              {vpdLeaf} <span className="text-xl font-normal">kPa</span>
            </div>
            <div className="text-xs font-semibold px-3 py-1 rounded-full bg-black/30 border border-white/10 mt-1">
              VPD do Ar ambiente: {vpdAir} kPa
            </div>
            <p className="text-xs mt-2 max-w-sm">{description}</p>
          </div>

          {/* Sliders */}
          <div className="space-y-4 bg-zinc-950 p-4 rounded-xl border border-zinc-800">
            {/* Temp */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-zinc-300 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Thermometer className="w-4 h-4 text-amber-400" />
                  Temperatura do Ar
                </span>
                <span className="font-mono text-emerald-400 text-sm">{tempC}°C</span>
              </div>
              <input
                type="range"
                min="16"
                max="36"
                step="0.5"
                value={tempC}
                onChange={(e) => setTempC(parseFloat(e.target.value))}
                className="w-full accent-emerald-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
                <span>16°C</span>
                <span>26°C</span>
                <span>36°C</span>
              </div>
            </div>

            {/* Humidity */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-zinc-300 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Droplets className="w-4 h-4 text-sky-400" />
                  Umidade Relativa (UR)
                </span>
                <span className="font-mono text-sky-400 text-sm">{humidityPct}%</span>
              </div>
              <input
                type="range"
                min="20"
                max="90"
                step="1"
                value={humidityPct}
                onChange={(e) => setHumidityPct(parseFloat(e.target.value))}
                className="w-full accent-sky-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
                <span>20%</span>
                <span>55%</span>
                <span>90%</span>
              </div>
            </div>

            {/* Leaf offset */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-zinc-300 mb-1.5">
                <span>Diferencial de Temperatura da Folha (LED)</span>
                <span className="font-mono text-zinc-400 text-sm">{leafOffset}°C</span>
              </div>
              <input
                type="range"
                min="-3"
                max="1"
                step="0.5"
                value={leafOffset}
                onChange={(e) => setLeafOffset(parseFloat(e.target.value))}
                className="w-full accent-zinc-400 cursor-pointer"
              />
              <span className="text-[10px] text-zinc-500 block">
                Folhas sob luz LED geralmente transpiram a -1.5°C a -2°C da temperatura do ar ambiente.
              </span>
            </div>
          </div>

          {/* Reference Targets Guide */}
          <div className="space-y-1.5 text-xs">
            <span className="text-zinc-400 font-bold uppercase tracking-wider text-[11px] block">
              Zonas Recomendadas por Fase:
            </span>
            <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
              <div className="p-2 bg-zinc-950 rounded-lg border border-zinc-800">
                <div className="text-zinc-400 font-semibold">Germinação</div>
                <div className="text-sky-300 font-mono font-bold">0.4 - 0.8 kPa</div>
              </div>
              <div className="p-2 bg-zinc-950 rounded-lg border border-zinc-800">
                <div className="text-emerald-400 font-semibold">Vegetativo</div>
                <div className="text-emerald-300 font-mono font-bold">0.8 - 1.15 kPa</div>
              </div>
              <div className="p-2 bg-zinc-950 rounded-lg border border-zinc-800">
                <div className="text-purple-400 font-semibold">Floração</div>
                <div className="text-purple-300 font-mono font-bold">1.2 - 1.55 kPa</div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-5 py-3.5 bg-zinc-950 border-t border-zinc-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-zinc-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg shadow transition-colors"
          >
            Entendido / Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { DayCellData, DayLog, PhaseType, NutrientItem } from '../types/grow';
import { PHASE_VISUAL_STYLES, calculateVpd } from '../utils/cycleCalculations';
import {
  X,
  Droplet,
  Sparkles,
  Scissors,
  Thermometer,
  FileText,
  Trash2,
  Save,
  Plus,
  AlertCircle,
  Check,
} from 'lucide-react';

interface DayDetailsModalProps {
  day: DayCellData | null;
  onClose: () => void;
  onSaveLog: (dateStr: string, log: DayLog) => void;
  onDeleteLog: (dateStr: string) => void;
}

export const DayDetailsModal: React.FC<DayDetailsModalProps> = ({
  day,
  onClose,
  onSaveLog,
  onDeleteLog,
}) => {
  if (!day) return null;

  const [activeTab, setActiveTab] = useState<'rega' | 'ferti' | 'manejo' | 'clima' | 'notas'>('rega');

  // Form states initialized with existing log or defaults
  const [phaseOverride, setPhaseOverride] = useState<PhaseType>(day.phase);
  
  // Rega
  const [hasWatered, setHasWatered] = useState<boolean>(day.hasRega);
  const [waterVolumeL, setWaterVolumeL] = useState<string>(
    day.log?.waterVolumeL !== undefined ? String(day.log.waterVolumeL) : ''
  );
  const [waterPh, setWaterPh] = useState<string>(
    day.log?.waterPh !== undefined ? String(day.log.waterPh) : ''
  );
  const [waterEc, setWaterEc] = useState<string>(
    day.log?.waterEc !== undefined ? String(day.log.waterEc) : ''
  );
  const [runoffPh, setRunoffPh] = useState<string>(
    day.log?.runoffPh !== undefined ? String(day.log.runoffPh) : ''
  );
  const [runoffEc, setRunoffEc] = useState<string>(
    day.log?.runoffEc !== undefined ? String(day.log.runoffEc) : ''
  );

  // Ferti
  const [hasFertilized, setHasFertilized] = useState<boolean>(day.hasFerti);
  const [nutrients, setNutrients] = useState<NutrientItem[]>(day.log?.nutrients || []);
  const [nutrientNotes, setNutrientNotes] = useState<string>(day.log?.nutrientNotes || '');
  const [newNutrientName, setNewNutrientName] = useState('');
  const [newNutrientDose, setNewNutrientDose] = useState('');
  const [newNutrientType, setNewNutrientType] = useState<NutrientItem['type']>('base');

  // Manejo
  const [hasTrained, setHasTrained] = useState<boolean>(day.hasPoda);
  const [trainingList, setTrainingList] = useState<string[]>(day.log?.trainingType || []);

  // Clima
  const [temperatureC, setTemperatureC] = useState<string>(
    day.log?.temperatureC !== undefined ? String(day.log.temperatureC) : ''
  );
  const [humidityPct, setHumidityPct] = useState<string>(
    day.log?.humidityPct !== undefined ? String(day.log.humidityPct) : ''
  );
  const [lightHours, setLightHours] = useState<string>(
    day.log?.lightHours !== undefined ? String(day.log.lightHours) : ''
  );

  // Notas
  const [notes, setNotes] = useState<string>(day.log?.notes || '');

  // Live VPD calculation
  const tempNum = parseFloat(temperatureC);
  const rhNum = parseFloat(humidityPct);
  const liveVpd = !isNaN(tempNum) && !isNaN(rhNum) ? calculateVpd(tempNum, rhNum) : null;

  const trainingOptions = [
    { id: 'poda_apical', label: 'Poda Apical (Topping)' },
    { id: 'fim', label: 'FIM Cut' },
    { id: 'lst', label: 'LST (Low Stress Training)' },
    { id: 'desfoliacao', label: 'Desfoliação / Lollipop' },
    { id: 'super_crop', label: 'Super Cropping' },
    { id: 'transplante', label: 'Transplante de Vaso' },
    { id: 'troca_luz', label: 'Ajuste de Luz / Altura' },
  ];

  const handleToggleTraining = (typeId: string) => {
    setHasTrained(true);
    setTrainingList((prev) =>
      prev.includes(typeId) ? prev.filter((t) => t !== typeId) : [...prev, typeId]
    );
  };

  const handleAddNutrient = () => {
    if (!newNutrientName.trim()) return;
    const dose = parseFloat(newNutrientDose) || 1.0;
    const newItem: NutrientItem = {
      id: Date.now().toString(),
      name: newNutrientName.trim(),
      doseMlPerL: dose,
      type: newNutrientType,
    };
    setNutrients((prev) => [...prev, newItem]);
    setHasFertilized(true);
    setNewNutrientName('');
    setNewNutrientDose('');
  };

  const handleRemoveNutrient = (id: string) => {
    setNutrients((prev) => prev.filter((n) => n.id !== id));
  };

  const handleSave = () => {
    const logData: DayLog = {
      date: day.dateStr,
      phaseOverride,
      hasWatered: hasWatered || Boolean(waterVolumeL && parseFloat(waterVolumeL) > 0),
      waterVolumeL: waterVolumeL ? parseFloat(waterVolumeL) : undefined,
      waterPh: waterPh ? parseFloat(waterPh) : undefined,
      waterEc: waterEc ? parseFloat(waterEc) : undefined,
      runoffPh: runoffPh ? parseFloat(runoffPh) : undefined,
      runoffEc: runoffEc ? parseFloat(runoffEc) : undefined,

      hasFertilized: hasFertilized || nutrients.length > 0,
      nutrients: nutrients.length > 0 ? nutrients : undefined,
      nutrientNotes: nutrientNotes.trim() || undefined,

      hasTrained: hasTrained || trainingList.length > 0,
      trainingType: trainingList.length > 0 ? trainingList : undefined,

      temperatureC: temperatureC ? parseFloat(temperatureC) : undefined,
      humidityPct: humidityPct ? parseFloat(humidityPct) : undefined,
      vpdKpa: liveVpd ? liveVpd.vpdAir : undefined,
      lightHours: lightHours ? parseFloat(lightHours) : undefined,

      notes: notes.trim() || undefined,
    };

    onSaveLog(day.dateStr, logData);
    onClose();
  };

  const handleDelete = () => {
    onDeleteLog(day.dateStr);
    onClose();
  };

  const allPhases: PhaseType[] = [
    'germinacao',
    'vegetativo',
    'floracao',
    'rega_pura',
    'flush',
    'colheita',
    'cura',
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-day-title"
    >
      <div className="bg-zinc-900 border border-zinc-700/80 rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-zinc-100">
        {/* Header */}
        <div className="px-5 py-3.5 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold">
                Semana {day.weekNumber} • Dia {day.dayOfCycle} do Cultivo
              </span>
              {day.isToday && (
                <span className="bg-emerald-500 text-zinc-950 font-black text-[10px] px-1.5 py-0.5 rounded">
                  HOJE
                </span>
              )}
            </div>
            <h2 id="modal-day-title" className="text-xl font-black text-white tracking-tight">
              Diário de Manejo: {day.displayDate} ({day.dateStr})
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar diário"
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Phase Selector Row */}
        <div className="px-5 py-3 bg-zinc-900/60 border-b border-zinc-800">
          <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
            Fase / Cor deste Dia na Tabela
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            {allPhases.map((phaseKey) => {
              const style = PHASE_VISUAL_STYLES[phaseKey];
              const isSelected = phaseOverride === phaseKey;

              return (
                <button
                  type="button"
                  key={phaseKey}
                  onClick={() => setPhaseOverride(phaseKey)}
                  className={`px-2 py-1.5 rounded-lg text-xs font-bold border flex items-center justify-between transition-all ${
                    isSelected
                      ? 'ring-2 ring-white scale-102 border-white'
                      : 'border-zinc-800 opacity-70 hover:opacity-100'
                  }`}
                  style={{
                    backgroundColor: style.bgHex,
                    color: phaseKey === 'germinacao' || phaseKey === 'colheita' ? '#09090b' : '#ffffff',
                  }}
                >
                  <span className="truncate">{style.name.split(' ')[0]}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 ml-1 shrink-0 stroke-[3]" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-zinc-800 bg-zinc-950/40 text-xs px-5 pt-2 gap-1 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('rega')}
            className={`pb-2.5 px-3 font-semibold flex items-center gap-1.5 border-b-2 transition-colors ${
              activeTab === 'rega'
                ? 'border-sky-400 text-sky-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Droplet className="w-3.5 h-3.5" />
            Rega & Solução
            {(hasWatered || waterVolumeL) && <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ferti')}
            className={`pb-2.5 px-3 font-semibold flex items-center gap-1.5 border-b-2 transition-colors ${
              activeTab === 'ferti'
                ? 'border-red-400 text-red-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Nutrientes & NPK
            {nutrients.length > 0 && <span className="w-1.5 h-1.5 rounded-full bg-red-400" />}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('manejo')}
            className={`pb-2.5 px-3 font-semibold flex items-center gap-1.5 border-b-2 transition-colors ${
              activeTab === 'manejo'
                ? 'border-purple-400 text-purple-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Scissors className="w-3.5 h-3.5" />
            Poda & Treino
            {trainingList.length > 0 && <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('clima')}
            className={`pb-2.5 px-3 font-semibold flex items-center gap-1.5 border-b-2 transition-colors ${
              activeTab === 'clima'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Thermometer className="w-3.5 h-3.5" />
            Clima & VPD
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('notas')}
            className={`pb-2.5 px-3 font-semibold flex items-center gap-1.5 border-b-2 transition-colors ${
              activeTab === 'notas'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Notas & Diário
            {notes && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* TAB: REGA */}
          {activeTab === 'rega' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-3 bg-sky-950/30 border border-sky-800/40 rounded-xl">
                <input
                  type="checkbox"
                  id="waterCheckbox"
                  checked={hasWatered}
                  onChange={(e) => setHasWatered(e.target.checked)}
                  className="w-4 h-4 rounded text-sky-500 focus:ring-sky-400 bg-zinc-800 border-zinc-700"
                />
                <label htmlFor="waterCheckbox" className="text-sm font-bold text-sky-200 cursor-pointer">
                  Marcar rega realizada neste dia
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">
                    Volume da Rega (Litros)
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    min="0"
                    placeholder="ex: 1.5"
                    value={waterVolumeL}
                    onChange={(e) => {
                      setWaterVolumeL(e.target.value);
                      if (e.target.value) setHasWatered(true);
                    }}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">
                    pH da Calda de Entrada
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="4.0"
                    max="9.0"
                    placeholder="ex: 6.2"
                    value={waterPh}
                    onChange={(e) => setWaterPh(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">
                    EC de Entrada (mS/cm)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="5.0"
                    placeholder="ex: 1.2"
                    value={waterEc}
                    onChange={(e) => setWaterEc(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              {/* Runoff monitoring */}
              <div className="p-3 bg-zinc-950/60 rounded-xl border border-zinc-800 space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 block">
                  Medições de Runoff (Água de Escorrimento do Vaso)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">pH do Runoff</label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="ex: 6.4"
                      value={runoffPh}
                      onChange={(e) => setRunoffPh(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-zinc-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">EC do Runoff (mS/cm)</label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="ex: 1.5"
                      value={runoffEc}
                      onChange={(e) => setRunoffEc(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-zinc-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: FERTILIZAÇÃO */}
          {activeTab === 'ferti' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-3 bg-red-950/30 border border-red-800/40 rounded-xl">
                <input
                  type="checkbox"
                  id="fertiCheckbox"
                  checked={hasFertilized}
                  onChange={(e) => setHasFertilized(e.target.checked)}
                  className="w-4 h-4 rounded text-red-500 focus:ring-red-400 bg-zinc-800 border-zinc-700"
                />
                <label htmlFor="fertiCheckbox" className="text-sm font-bold text-red-200 cursor-pointer">
                  Marcar fertilização / nutrição aplicada
                </label>
              </div>

              {/* Add nutrient input */}
              <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 space-y-2">
                <span className="text-xs font-bold text-zinc-300 block">
                  Adicionar Fertilizante / Suplemento
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="Nome (ex: Bio Bloom, Cal-Mag)"
                    value={newNutrientName}
                    onChange={(e) => setNewNutrientName(e.target.value)}
                    className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-red-500"
                  />
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Dose (ml/L)"
                    value={newNutrientDose}
                    onChange={(e) => setNewNutrientDose(e.target.value)}
                    className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-red-500"
                  />
                  <select
                    value={newNutrientType}
                    onChange={(e) => setNewNutrientType(e.target.value as any)}
                    className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="base">Nutriente Base</option>
                    <option value="bloom">Bloom (Floração)</option>
                    <option value="calmag">Cal-Mag</option>
                    <option value="root">Enraizador</option>
                    <option value="booster">PK Booster</option>
                    <option value="micro">Microbiologia / Sílica</option>
                  </select>
                </div>
                <button
                  type="button"
                  onClick={handleAddNutrient}
                  className="mt-2 w-full sm:w-auto bg-red-600 hover:bg-red-500 text-white font-bold text-xs px-3 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Adicionar à Solução
                </button>
              </div>

              {/* List of nutrients */}
              {nutrients.length > 0 ? (
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-zinc-400">Produtos Registrados:</span>
                  {nutrients.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-2.5 bg-zinc-950/80 border border-zinc-800 rounded-lg text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-400" />
                        <span className="font-bold text-zinc-200">{item.name}</span>
                        <span className="text-xs text-zinc-400 font-mono">({item.doseMlPerL} ml/L)</span>
                        <span className="text-[10px] bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-400 uppercase">
                          {item.type}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveNutrient(item.id)}
                        className="text-zinc-500 hover:text-red-400 p-1"
                        aria-label={`Remover ${item.name}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-zinc-500 italic">
                  Nenhum fertilizante adicionado para este dia ainda.
                </p>
              )}
            </div>
          )}

          {/* TAB: MANEJO */}
          {activeTab === 'manejo' && (
            <div className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-400 block">
                Técnicas de Treinamento e Poda Realizadas
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {trainingOptions.map((opt) => {
                  const isChecked = trainingList.includes(opt.id);
                  return (
                    <button
                      type="button"
                      key={opt.id}
                      onClick={() => handleToggleTraining(opt.id)}
                      className={`p-3 rounded-xl border text-left text-xs font-bold flex items-center justify-between transition-all ${
                        isChecked
                          ? 'bg-purple-900/40 border-purple-500 text-purple-200'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      <span>{opt.label}</span>
                      {isChecked && <Check className="w-4 h-4 text-purple-400" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB: CLIMA & VPD */}
          {activeTab === 'clima' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">
                    Temperatura do Ar (°C)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    placeholder="ex: 25.5"
                    value={temperatureC}
                    onChange={(e) => setTemperatureC(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">
                    Umidade Relativa (%)
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="10"
                    max="100"
                    placeholder="ex: 60"
                    value={humidityPct}
                    onChange={(e) => setHumidityPct(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">
                    Horas de Luz (Fotoperíodo)
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    max="24"
                    placeholder="ex: 18 ou 12"
                    value={lightHours}
                    onChange={(e) => setLightHours(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {liveVpd && (
                <div className="p-3.5 bg-zinc-950 rounded-xl border border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-400">VPD Calculado Automático:</span>
                    <span className="text-base font-black text-emerald-400 font-mono">
                      {liveVpd.vpdAir} kPa (Ar) • {liveVpd.vpdLeaf} kPa (Folha)
                    </span>
                  </div>
                  <p className="text-xs text-zinc-300">{liveVpd.description}</p>
                </div>
              )}
            </div>
          )}

          {/* TAB: NOTAS */}
          {activeTab === 'notas' && (
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-zinc-400">
                Diário de Bordo & Observações da Planta
              </label>
              <textarea
                rows={5}
                placeholder="Descreva o aspecto da planta, cor das folhas, desenvolvimento das raízes, tricomas ou aromas..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-amber-500 resize-none"
              />
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="px-5 py-3.5 bg-zinc-950 border-t border-zinc-800 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleDelete}
            className="text-xs text-red-400 hover:text-red-300 font-semibold px-3 py-2 rounded-lg hover:bg-red-950/30 flex items-center gap-1.5 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" /> Limpar Dados do Dia
          </button>

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
              <Save className="w-3.5 h-3.5" /> Salvar Diário
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

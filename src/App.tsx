import React, { useState, useEffect } from 'react';
import { PlantProfile, DayCellData, DayLog, PhaseType } from './types/grow';
import { INITIAL_PLANTS } from './utils/defaultData';
import { Header } from './components/Header';
import { StatsBar } from './components/StatsBar';
import { CalendarGrid } from './components/CalendarGrid';
import { ColorLegend } from './components/ColorLegend';
import { DayDetailsModal } from './components/DayDetailsModal';
import { PlantSettingsModal } from './components/PlantSettingsModal';
import { VpdCalculatorModal } from './components/VpdCalculatorModal';
import { BatchWateringModal } from './components/BatchWateringModal';
import { InstallWindowsModal } from './components/InstallWindowsModal';
import { WindowsCalendarBar } from './components/WindowsCalendarBar';
import { toDateString, addDays } from './utils/cycleCalculations';
import { Table, LayoutGrid, Calendar, HelpCircle, Eye } from 'lucide-react';

const STORAGE_KEY = 'ciclogrow_plants_data_v1';

export default function App() {
  const [plants, setPlants] = useState<PlantProfile[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to parse saved plants:', e);
    }
    return INITIAL_PLANTS;
  });

  const [activePlantId, setActivePlantId] = useState<string>(() => {
    return plants[0]?.id || 'plant-aurora-windows';
  });

  // Windows system calendar live date
  const windowsTodayStr = toDateString(new Date());

  // Modals & Drawers
  const [selectedDay, setSelectedDay] = useState<DayCellData | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isVpdCalcOpen, setIsVpdCalcOpen] = useState(false);
  const [isBatchWateringOpen, setIsBatchWateringOpen] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [showOriginalRef, setShowOriginalRef] = useState(false);
  const [referenceDateStr, setReferenceDateStr] = useState<string>(windowsTodayStr);

  // Phase Brush mode
  const [activeBrushPhase, setActiveBrushPhase] = useState<PhaseType | null>(null);

  // Active plant object
  const activePlant = plants.find((p) => p.id === activePlantId) || plants[0];

  const handleSyncPlantStartToToday = (offsetDays: number = 0) => {
    const todayStr = toDateString(new Date());
    const newStart = addDays(todayStr, -offsetDays);
    setPlants((prev) =>
      prev.map((p) => {
        if (p.id !== activePlantId) return p;
        return {
          ...p,
          startDate: newStart,
        };
      })
    );
    setReferenceDateStr(todayStr);
  };

  // Save to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(plants));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  }, [plants]);

  // Handle saving log for a specific date
  const handleSaveDayLog = (dateStr: string, log: DayLog) => {
    setPlants((prev) =>
      prev.map((p) => {
        if (p.id !== activePlantId) return p;
        return {
          ...p,
          logs: {
            ...p.logs,
            [dateStr]: log,
          },
        };
      })
    );
  };

  // Handle deleting log
  const handleDeleteDayLog = (dateStr: string) => {
    setPlants((prev) =>
      prev.map((p) => {
        if (p.id !== activePlantId) return p;
        const newLogs = { ...p.logs };
        delete newLogs[dateStr];
        return {
          ...p,
          logs: newLogs,
        };
      })
    );
  };

  // Handle painting day with brush phase
  const handlePaintDay = (dateStr: string, phase: PhaseType) => {
    setPlants((prev) =>
      prev.map((p) => {
        if (p.id !== activePlantId) return p;
        const existing = p.logs[dateStr] || { date: dateStr };
        return {
          ...p,
          logs: {
            ...p.logs,
            [dateStr]: {
              ...existing,
              phaseOverride: phase,
            },
          },
        };
      })
    );
  };

  // Update plant profile
  const handleUpdatePlant = (updatedPlant: PlantProfile) => {
    setPlants((prev) =>
      prev.map((p) => (p.id === updatedPlant.id ? updatedPlant : p))
    );
  };

  // Add new plant
  const handleNewPlant = () => {
    const newId = `plant-${Date.now()}`;
    const todayStr = new Date().toISOString().split('T')[0];
    const newPlant: PlantProfile = {
      id: newId,
      name: `Nova Planta #${plants.length + 1}`,
      strain: 'Genética a Definir',
      seedType: 'fotoperiodo',
      startDate: todayStr,
      totalWeeks: 13,
      germinationWeeks: 1,
      vegetativeWeeks: 3,
      floweringWeeks: 7,
      flushWeeks: 2,
      harvestDays: 7,
      logs: {},
    };
    setPlants((prev) => [...prev, newPlant]);
    setActivePlantId(newId);
    setIsSettingsOpen(true);
  };

  // Delete plant
  const handleDeletePlant = (id: string) => {
    if (plants.length <= 1) {
      alert('Você precisa manter pelo menos uma planta ativa.');
      return;
    }
    const remaining = plants.filter((p) => p.id !== id);
    setPlants(remaining);
    setActivePlantId(remaining[0].id);
  };

  // Batch watering
  const handleApplyBatchWatering = (updatedLogs: Record<string, DayLog>) => {
    setPlants((prev) =>
      prev.map((p) => {
        if (p.id !== activePlantId) return p;
        return {
          ...p,
          logs: updatedLogs,
        };
      })
    );
  };

  // Export JSON
  const handleExportData = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(plants, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `ciclogrow_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import JSON
  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        if (Array.isArray(imported) && imported.length > 0) {
          setPlants(imported);
          setActivePlantId(imported[0].id);
          alert('Dados de cultivo importados com sucesso!');
        } else {
          alert('Arquivo JSON inválido.');
        }
      } catch (err) {
        alert('Erro ao carregar o arquivo JSON.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-black">
      {/* Top Header */}
      <Header
        plants={plants}
        activePlantId={activePlantId}
        onSelectPlant={setActivePlantId}
        onNewPlant={handleNewPlant}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenBatchWatering={() => setIsBatchWateringOpen(true)}
        onOpenVpdCalc={() => setIsVpdCalcOpen(true)}
        onOpenInstallModal={() => setIsInstallModalOpen(true)}
        onExportData={handleExportData}
        onImportData={handleImportData}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-4 py-4 space-y-4">
        {/* Windows Live System Clock and Calendar Sync Bar */}
        <WindowsCalendarBar
          plant={activePlant}
          referenceDateStr={referenceDateStr}
          onSetReferenceDate={setReferenceDateStr}
          onSyncPlantStartToToday={handleSyncPlantStartToToday}
        />

        {/* Plant Summary & Live Time Counters */}
        <StatsBar
          plant={activePlant}
          referenceDateStr={referenceDateStr}
          onOpenVpdCalc={() => setIsVpdCalcOpen(true)}
          onOpenCycleSettings={() => setIsSettingsOpen(true)}
        />

        {/* Phase Color Legend with Phase Brush activation */}
        <ColorLegend
          activeBrushPhase={activeBrushPhase}
          onSelectBrushPhase={setActiveBrushPhase}
        />

        {/* The Authentic Calendar Grid */}
        <CalendarGrid
          plant={activePlant}
          referenceDateStr={referenceDateStr}
          onSetReferenceDate={setReferenceDateStr}
          onDayClick={setSelectedDay}
          activeBrushPhase={activeBrushPhase}
          onPaintDay={handlePaintDay}
        />

        {/* Reference Image Comparison Toggle */}
        <div className="pt-2 flex items-center justify-between text-xs text-zinc-500 border-t border-zinc-900">
          <div className="flex items-center gap-2">
            <span>Visual de cronograma semanal inspirado no padrão clássico de cultivo.</span>
            <button
              type="button"
              onClick={() => setShowOriginalRef(!showOriginalRef)}
              className="text-emerald-400 hover:text-emerald-300 underline flex items-center gap-1 font-medium ml-2"
            >
              <Eye className="w-3.5 h-3.5" />
              {showOriginalRef ? 'Ocultar Imagem de Referência' : 'Ver Referência Original'}
            </button>
          </div>

          <span>CicloGrow Desktop • Modo Escuro Ativo</span>
        </div>

        {/* Reference Image Drawer if toggled */}
        {showOriginalRef && (
          <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                Imagem de Referência Fornecida pelo Usuário:
              </span>
              <button
                type="button"
                onClick={() => setShowOriginalRef(false)}
                className="text-xs text-zinc-400 hover:text-white"
              >
                Fechar
              </button>
            </div>
            <div className="max-w-2xl mx-auto rounded-lg overflow-hidden border border-zinc-700 shadow-2xl">
              <img
                src="/assets/aistudio/Capturar_0f21e416.PNG"
                alt="Referência original de tabela de cultivo semanal"
                className="w-full h-auto object-contain"
              />
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      {selectedDay && (
        <DayDetailsModal
          day={selectedDay}
          onClose={() => setSelectedDay(null)}
          onSaveLog={handleSaveDayLog}
          onDeleteLog={handleDeleteDayLog}
        />
      )}

      {isSettingsOpen && (
        <PlantSettingsModal
          plant={activePlant}
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          onSave={handleUpdatePlant}
          onDeletePlant={plants.length > 1 ? handleDeletePlant : undefined}
        />
      )}

      {isVpdCalcOpen && (
        <VpdCalculatorModal
          isOpen={isVpdCalcOpen}
          onClose={() => setIsVpdCalcOpen(false)}
        />
      )}

      {isBatchWateringOpen && (
        <BatchWateringModal
          plant={activePlant}
          isOpen={isBatchWateringOpen}
          onClose={() => setIsBatchWateringOpen(false)}
          onApplyBatch={handleApplyBatchWatering}
        />
      )}

      {isInstallModalOpen && (
        <InstallWindowsModal
          isOpen={isInstallModalOpen}
          onClose={() => setIsInstallModalOpen(false)}
        />
      )}
    </div>
  );
}

import { PlantProfile } from '../types/grow';
import { toDateString, addDays } from './cycleCalculations';

export function createDefaultPlants(): PlantProfile[] {
  const todayStr = toDateString(new Date());

  // Planta 1: Iniciada há 28 dias a partir de hoje no calendário do Windows (Semana 5 - Floração)
  const startPlant1 = addDays(todayStr, -28);

  const logsPlant1: PlantProfile['logs'] = {
    // Semana 1: Germinação
    [startPlant1]: {
      date: startPlant1,
      hasWatered: true,
      waterVolumeL: 0.1,
      waterPh: 6.0,
      waterEc: 0.2,
      trainingType: ['diario'],
      notes: 'Semente germinada e colocada no substrato úmido.',
      temperatureC: 25.0,
      humidityPct: 75,
    },
    [addDays(startPlant1, 1)]: {
      date: addDays(startPlant1, 1),
      hasWatered: true,
      waterVolumeL: 0.05,
      waterPh: 6.1,
      hasFertilized: true,
      nutrients: [{ id: '1', name: 'Enraizador Root', doseMlPerL: 1.0, type: 'root' }],
    },
    [addDays(startPlant1, 6)]: {
      date: addDays(startPlant1, 6),
      phaseOverride: 'vegetativo',
      hasWatered: true,
      waterVolumeL: 0.25,
      waterPh: 6.2,
      waterEc: 0.6,
      hasFertilized: true,
      nutrients: [
        { id: '2', name: 'Cal-Mag', doseMlPerL: 1.0, type: 'calmag' },
        { id: '3', name: 'Bio Vega A+B', doseMlPerL: 1.5, type: 'base' }
      ],
      notes: 'Primeiro par de folhas bem formado. Início do Vegetativo!',
    },
    // Semana 2: Vegetativo
    [addDays(startPlant1, 9)]: {
      date: addDays(startPlant1, 9),
      hasWatered: true,
      waterVolumeL: 0.5,
      waterPh: 6.2,
      waterEc: 0.8,
    },
    [addDays(startPlant1, 12)]: {
      date: addDays(startPlant1, 12),
      hasWatered: true,
      waterVolumeL: 0.6,
      waterPh: 6.3,
      hasFertilized: true,
      nutrients: [{ id: '4', name: 'Bio Vega A+B', doseMlPerL: 2.0, type: 'base' }],
    },
    // Semana 3: Poda & Regas
    [addDays(startPlant1, 14)]: {
      date: addDays(startPlant1, 14),
      hasTrained: true,
      trainingType: ['poda_apical'],
      notes: 'Poda apical no 4º nó.',
    },
    [addDays(startPlant1, 15)]: {
      date: addDays(startPlant1, 15),
      phaseOverride: 'rega_pura',
      hasWatered: true,
      waterVolumeL: 1.0,
      waterPh: 6.3,
    },
    // Semana 4: LST & Transição
    [addDays(startPlant1, 21)]: {
      date: addDays(startPlant1, 21),
      phaseOverride: 'rega_pura',
      hasWatered: true,
      waterVolumeL: 1.2,
      waterPh: 6.4,
    },
    [addDays(startPlant1, 23)]: {
      date: addDays(startPlant1, 23),
      hasTrained: true,
      trainingType: ['lst', 'desfoliacao'],
      notes: 'Amarras para abrir copa.',
    },
    [addDays(startPlant1, 24)]: {
      date: addDays(startPlant1, 24),
      phaseOverride: 'rega_pura',
      hasWatered: true,
      waterVolumeL: 1.5,
      waterPh: 6.4,
    },
    // Hoje: Entrada na Floração (Semana 5)
    [todayStr]: {
      date: todayStr,
      phaseOverride: 'floracao',
      hasWatered: true,
      waterVolumeL: 1.5,
      waterPh: 6.4,
      waterEc: 1.2,
      hasFertilized: true,
      nutrients: [
        { id: '5', name: 'Bio Bloom Booster', doseMlPerL: 2.0, type: 'bloom' },
        { id: '6', name: 'Cal-Mag', doseMlPerL: 1.0, type: 'calmag' }
      ],
      notes: 'Flip de fotoperíodo para 12/12. Registro do dia de hoje!',
      temperatureC: 25.0,
      humidityPct: 58,
    }
  };

  return [
    {
      id: 'plant-aurora-windows',
      name: 'Aurora Haze (Ciclo Ativo - Windows)',
      strain: 'Super Silver Haze x Northern Lights',
      seedType: 'fotoperiodo',
      startDate: startPlant1,
      totalWeeks: 13,
      germinationWeeks: 1,
      vegetativeWeeks: 3,
      floweringWeeks: 7,
      flushWeeks: 2,
      harvestDays: 7,
      targetVpdVeg: 1.0,
      targetVpdFlora: 1.35,
      notes: 'Cultivo indoor sincronizado com o calendário do Windows. Hoje é dia de transição para Floração (12/12).',
      logs: logsPlant1,
    },
    {
      id: 'plant-nova-hoje',
      name: 'Gorilla Glue (Germinada Hoje no Windows)',
      strain: 'Gorilla Glue #4 Auto',
      seedType: 'automatica',
      startDate: todayStr,
      totalWeeks: 10,
      germinationWeeks: 1,
      vegetativeWeeks: 3,
      floweringWeeks: 5,
      flushWeeks: 1,
      harvestDays: 5,
      targetVpdVeg: 0.95,
      targetVpdFlora: 1.3,
      notes: 'Genética automática iniciando germinação hoje no calendário real.',
      logs: {
        [todayStr]: {
          date: todayStr,
          hasWatered: true,
          waterVolumeL: 0.1,
          notes: 'Semente colocada para germinar hoje.',
          temperatureC: 25.0,
          humidityPct: 80,
        }
      }
    },
    {
      id: 'plant-exemplo-foto',
      name: 'Exemplo Original da Foto (Março 2026)',
      strain: 'Genética da Imagem de Referência',
      seedType: 'fotoperiodo',
      startDate: '2026-03-15',
      totalWeeks: 13,
      germinationWeeks: 1,
      vegetativeWeeks: 3,
      floweringWeeks: 7,
      flushWeeks: 2,
      harvestDays: 7,
      targetVpdVeg: 1.0,
      targetVpdFlora: 1.35,
      notes: 'Cronograma exatamente idêntico à imagem de referência de 15/mar a 13/jun/2026.',
      logs: {
        '2026-03-15': { date: '2026-03-15', hasWatered: true, waterVolumeL: 0.1 },
        '2026-03-16': { date: '2026-03-16', hasWatered: true, hasFertilized: true },
        '2026-03-21': { date: '2026-03-21', phaseOverride: 'vegetativo', hasWatered: true, hasFertilized: true },
        '2026-03-30': { date: '2026-03-30', phaseOverride: 'rega_pura', hasWatered: true },
        '2026-04-06': { date: '2026-04-06', phaseOverride: 'rega_pura', hasWatered: true },
        '2026-04-09': { date: '2026-04-09', phaseOverride: 'rega_pura', hasWatered: true },
        '2026-04-11': { date: '2026-04-11', phaseOverride: 'rega_pura', hasWatered: true },
        '2026-04-16': { date: '2026-04-16', phaseOverride: 'rega_pura', hasWatered: true },
        '2026-04-18': { date: '2026-04-18', phaseOverride: 'rega_pura', hasWatered: true },
        '2026-04-24': { date: '2026-04-24', phaseOverride: 'rega_pura', hasWatered: true },
        '2026-06-04': { date: '2026-06-04', phaseOverride: 'flush', hasWatered: true },
        '2026-06-05': { date: '2026-06-05', phaseOverride: 'colheita' },
        '2026-06-11': { date: '2026-06-11', phaseOverride: 'flush', hasWatered: true },
        '2026-06-12': { date: '2026-06-12', phaseOverride: 'colheita' }
      }
    }
  ];
}

export const INITIAL_PLANTS: PlantProfile[] = createDefaultPlants();

export const CYCLE_PRESETS = [
  {
    name: 'Fotoperíodo Completo (13 Semanas - Inspirado na Imagem)',
    totalWeeks: 13,
    germinationWeeks: 1,
    vegetativeWeeks: 3,
    floweringWeeks: 7,
    flushWeeks: 2,
    harvestDays: 7,
    seedType: 'fotoperiodo' as const,
    description: '1 sem. germinação, 3 sem. vegetativo, 7 sem. floração, 2 sem. flush/colheita.'
  },
  {
    name: 'Genética Automática Express (10 Semanas)',
    totalWeeks: 10,
    germinationWeeks: 1,
    vegetativeWeeks: 3,
    floweringWeeks: 5,
    flushWeeks: 1,
    harvestDays: 5,
    seedType: 'automatica' as const,
    description: 'Ciclo rápido com floração precoce automática sem troca de fotoperíodo.'
  },
  {
    name: 'Vegetativo Estendido / Scrog (16 Semanas)',
    totalWeeks: 16,
    germinationWeeks: 1,
    vegetativeWeeks: 6,
    floweringWeeks: 7,
    flushWeeks: 2,
    harvestDays: 7,
    seedType: 'fotoperiodo' as const,
    description: 'Vegetativo prolongado para treinamento intenso, LST e copa grande.'
  },
  {
    name: 'Tomates e Frutíferas de Horta (16 Semanas)',
    totalWeeks: 16,
    germinationWeeks: 2,
    vegetativeWeeks: 5,
    floweringWeeks: 7,
    flushWeeks: 1,
    harvestDays: 14,
    seedType: 'regular' as const,
    description: 'Ciclo para plantas frutíferas como tomates, pimentas e berinjelas.'
  }
];

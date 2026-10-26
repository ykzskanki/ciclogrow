import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatDisplayDate,
  parseDateString,
  toDateString,
  addDays,
  diffDays,
  getSundayOfWeek,
  getPhaseForDayOffset,
  calculateVpd,
  generateCalendarGrid,
} from './cycleCalculations';
import { PlantProfile } from '../types/grow';

test('formatDisplayDate formats DD/month correctly', () => {
  assert.equal(formatDisplayDate('2026-03-15'), '15/mar');
  assert.equal(formatDisplayDate('2026-04-01'), '01/abr');
  assert.equal(formatDisplayDate('2026-06-04'), '04/jun');
});

test('addDays and diffDays compute accurate dates', () => {
  const start = '2026-03-15';
  const after7 = addDays(start, 7);
  assert.equal(after7, '2026-03-22');
  assert.equal(diffDays(start, after7), 7);
});

test('getSundayOfWeek finds correct Sunday', () => {
  // 2026-03-18 is Wednesday; Sunday is 2026-03-15
  assert.equal(getSundayOfWeek('2026-03-18'), '2026-03-15');
  // 2026-03-15 is Sunday itself
  assert.equal(getSundayOfWeek('2026-03-15'), '2026-03-15');
});

test('getPhaseForDayOffset matches cycle stages', () => {
  const dummyPlant: PlantProfile = {
    id: 'test-plant',
    name: 'Teste',
    strain: 'Amnesia',
    seedType: 'fotoperiodo',
    startDate: '2026-03-15',
    totalWeeks: 13,
    germinationWeeks: 1, // days 0..6
    vegetativeWeeks: 3,  // days 7..27
    floweringWeeks: 7,   // days 28..76
    flushWeeks: 2,       // days 77..90
    harvestDays: 7,
    logs: {},
  };

  assert.equal(getPhaseForDayOffset(0, dummyPlant), 'germinacao');
  assert.equal(getPhaseForDayOffset(6, dummyPlant), 'germinacao');
  assert.equal(getPhaseForDayOffset(7, dummyPlant), 'vegetativo');
  assert.equal(getPhaseForDayOffset(27, dummyPlant), 'vegetativo');
  assert.equal(getPhaseForDayOffset(28, dummyPlant), 'floracao');
  assert.equal(getPhaseForDayOffset(76, dummyPlant), 'floracao');
  assert.equal(getPhaseForDayOffset(77, dummyPlant), 'flush');
  assert.equal(getPhaseForDayOffset(92, dummyPlant), 'colheita');
});

test('calculateVpd calculates reasonable VPD range', () => {
  // 25C and 60% RH
  const result = calculateVpd(25, 60);
  assert.ok(result.vpdAir > 0.8 && result.vpdAir < 1.5);
  assert.ok(result.status === 'ideal_veg' || result.status === 'ideal_flora');
});

test('generateCalendarGrid creates 13+ weeks with 7 days each', () => {
  const dummyPlant: PlantProfile = {
    id: 'test-plant',
    name: 'Teste',
    strain: 'Kush',
    seedType: 'fotoperiodo',
    startDate: '2026-03-15',
    totalWeeks: 13,
    germinationWeeks: 1,
    vegetativeWeeks: 3,
    floweringWeeks: 7,
    flushWeeks: 2,
    harvestDays: 7,
    logs: {},
  };

  const grid = generateCalendarGrid(dummyPlant, '2026-03-21');
  assert.equal(grid.weeks.length, 13);
  assert.equal(grid.weeks[0].days.length, 7);
  assert.equal(grid.weeks[0].days[0].displayDate, '15/mar');
  assert.equal(grid.currentDayOfCycle, 7);
  assert.equal(grid.currentWeekNumber, 1);
});

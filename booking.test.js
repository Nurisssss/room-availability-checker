import { describe, test, expect } from 'vitest';
import { checkAvailability } from './checker.js';

const canBook = ({ start, end, now, blocked, bookings }) =>
  checkAvailability({ start, end }, { name: 'Room A101', blocked, bookings }, now).ok;

const fixture = (over = {}) => ({
  now: 540,
  blocked: false,
  bookings: [{ start: 600, end: 660 }],
  ...over,
});

describe('canBook decisions', () => {
  const cases = [
    ['T01', 'touching after',       { start: 660, end: 720 }, true,  'AC4'],
    ['T02', 'starts now',           { start: 540, end: 570 }, false, 'AC1'],
    ['T03', 'zero duration',        { start: 720, end: 720 }, false, 'AC1'],
    ['T04', 'reversed',             { start: 750, end: 720 }, false, 'AC1'],
    ['T05', 'past day end',         { start: 1380, end: 1441 }, false, 'AC1'],
    ['T06', 'exactly 120 minutes',  { start: 720, end: 840 }, true,  'AC2'],
    ['T07', '121 minutes',          { start: 720, end: 841 }, false, 'AC2'],
    ['T08', 'touching before',      { start: 570, end: 600 }, true,  'AC4'],
    ['T09', 'partial overlap',      { start: 630, end: 690 }, false, 'AC4'],
    ['T10', 'contains booking',     { start: 570, end: 690 }, false, 'AC4'],
    ['T11', 'inside booking',       { start: 615, end: 645 }, false, 'AC4'],
    ['T12', 'identical interval',   { start: 600, end: 660 }, false, 'AC4'],
    ['T13', 'blocked room',         { start: 660, end: 720, blocked: true }, false, 'AC3'],
    ['T14', 'no bookings',          { start: 630, end: 690, bookings: [] }, true, 'AC4'],
    ['X1', 'starts one minute after now (smallest valid future start)', { start: 541, end: 570 }, true, 'AC1'],
    ['X2', 'ends exactly at day end 1440 (last valid minute)',          { start: 1380, end: 1440 }, true, 'AC1'],
    ['X3', 'blocked AND otherwise invalid is still unavailable',        { start: 750, end: 720, blocked: true }, false, 'AC3'],
    ['X4', 'second of two bookings overlaps',
      { start: 700, end: 760, bookings: [{ start: 600, end: 660 }, { start: 720, end: 780 }] }, false, 'AC4'],
  ];

  test.each(cases)('%s %s (%s)', (_id, _label, over, expected) => {
    expect(canBook(fixture(over))).toBe(expected);
  });
});

describe('AC5: existing booking data is preserved', () => {
  test('deep-equal after available and unavailable checks, repeated', () => {
    const input = fixture({
      start: 660, end: 720,
      bookings: [{ start: 600, end: 660 }, { start: 900, end: 960 }],
    });
    const snapshot = JSON.parse(JSON.stringify(input));
    expect(canBook(input)).toBe(true);
    expect(canBook({ ...input, start: 630, end: 690 })).toBe(false);
    expect(canBook(input)).toBe(true);
    expect(input).toEqual(snapshot);
  });
});

describe('Invalid input is not a decision (Practice #06 cleanup)', () => {
  test.each([
    ['empty start', { start: undefined, end: 720 }],
    ['empty end',   { start: 660, end: undefined }],
    ['NaN start',   { start: NaN, end: 720 }],
    ['decimal end', { start: 660, end: 700.5 }],
  ])('%s -> invalid:true and not ok', (_n, req) => {
    const r = checkAvailability(req, { blocked: false, bookings: [] }, 540);
    expect(r.ok).toBe(false);
    expect(r.invalid).toBe(true);
  });
});

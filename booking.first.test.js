import { describe, test, expect } from 'vitest';
import { checkAvailability } from './checker.js';

const canBook = ({ start, end, now, blocked, bookings }) =>
  checkAvailability({ start, end }, { name: 'Room A101', blocked, bookings }, now).ok;

const base = () => ({ now: 540, blocked: false, bookings: [{ start: 600, end: 660 }] });

describe('canBook', () => {
  test('T01 touching after is available (AC4)', () => {
    expect(canBook({ ...base(), start: 660, end: 720 })).toBe(true);
  });
  test('T02 starts now is unavailable (AC1)', () => {
    expect(canBook({ ...base(), start: 540, end: 570 })).toBe(false);
  });
  test('T03 zero duration is unavailable (AC1)', () => {
    expect(canBook({ ...base(), start: 720, end: 720 })).toBe(false);
  });
  test('T04 reversed is unavailable (AC1)', () => {
    expect(canBook({ ...base(), start: 750, end: 720 })).toBe(false);
  });
  test('T05 past day end is unavailable (AC1)', () => {
    expect(canBook({ ...base(), start: 1380, end: 1441 })).toBe(false);
  });
  test('T06 exactly 120 minutes is available (AC2)', () => {
    expect(canBook({ ...base(), start: 720, end: 840 })).toBe(true);
  });
  test('T07 121 minutes is unavailable (AC2)', () => {
    expect(canBook({ ...base(), start: 720, end: 841 })).toBe(false);
  });
  test('T08 touching before is available (AC4)', () => {
    expect(canBook({ ...base(), start: 570, end: 600 })).toBe(true);
  });
  test('T09 partial overlap is unavailable (AC4)', () => {
    expect(canBook({ ...base(), start: 630, end: 690 })).toBe(false);
  });
  test('T10 contains booking is unavailable (AC4)', () => {
    expect(canBook({ ...base(), start: 570, end: 690 })).toBe(false);
  });
  test('T11 inside booking is unavailable (AC4)', () => {
    expect(canBook({ ...base(), start: 615, end: 645 })).toBe(false);
  });
  test('T12 identical interval is unavailable (AC4)', () => {
    expect(canBook({ ...base(), start: 600, end: 660 })).toBe(false);
  });
  test('T13 blocked room is unavailable (AC3)', () => {
    expect(canBook({ ...base(), start: 660, end: 720, blocked: true })).toBe(false);
  });
  test('T14 empty bookings is available (AC4)', () => {
    expect(canBook({ ...base(), start: 630, end: 690, bookings: [] })).toBe(true);
  });
  test('X1 short valid booking is available', () => {
    expect(canBook({ ...base(), start: 700, end: 730 })).toBeTruthy();
  });
  test('X2 negative start is unavailable', () => {
    expect(canBook({ ...base(), start: -10, end: 30 })).toBe(false);
  });
  test('AC5 booking list keeps its length', () => {
    const input = { ...base(), start: 660, end: 720 };
    const n = input.bookings.length;
    canBook(input);
    expect(input.bookings.length).toBe(n);
  });
});

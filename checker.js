export function checkAvailability(request, room, now) {
  const { start, end } = request;
  if (![start, end, now].every(Number.isInteger)) return { ok: false, invalid: true, reason: 'Enter whole numbers for start, end and current time.' };
  if (start < 0 || end > 1440 || start >= end) return { ok: false, reason: 'Use 0 <= start < end <= 1440.' };
  if (start <= now) return { ok: false, reason: 'Start must be after the current time.' };
  if (end - start > 120) return { ok: false, reason: 'Maximum length is 120 minutes.' };
  if (room.blocked) return { ok: false, reason: 'This room is blocked.' };
  for (const b of room.bookings) {
    if (start < b.end && end > b.start) return { ok: false, reason: `Overlaps ${b.start}-${b.end}.` };
  }
  return { ok: true, reason: `The room is free for ${start}-${end}.` };
}
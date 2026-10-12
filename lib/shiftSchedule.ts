export function parseShiftStartHour(schedule?: string | null): number | null {
  const match = schedule?.match(/^(\d{1,2})(?::\d{2})?\s*(AM|PM)/i);
  if (!match) return null;
  let hour = Number(match[1]) % 12;
  if (match[2].toUpperCase() === 'PM') hour += 12;
  return hour;
}

export function getShiftDate(date: Date, schedule?: string | null): Date {
  const shiftDate = new Date(date);
  const startHour = parseShiftStartHour(schedule);
  if (startHour !== null && shiftDate.getHours() < startHour) {
    shiftDate.setDate(shiftDate.getDate() - 1);
  }
  return shiftDate;
}

export function formatStoredShiftTime(value?: string | null): string {
  if (!value) return '';
  const [rawHour, rawMinute = '00'] = value.slice(0, 5).split(':');
  const hour24 = Number(rawHour);
  const minute = Number(rawMinute);
  if (!Number.isInteger(hour24) || hour24 < 0 || hour24 > 23 || !Number.isInteger(minute) || minute < 0 || minute > 59) return '';
  const suffix = hour24 >= 12 ? 'PM' : 'AM';
  const hour12 = hour24 % 12 || 12;
  return `${hour12}:${String(minute).padStart(2, '0')} ${suffix}`;
}

export function formatShiftRange(start?: string | null, end?: string | null): string {
  const formattedStart = formatStoredShiftTime(start);
  const formattedEnd = formatStoredShiftTime(end);
  return formattedStart && formattedEnd ? `${formattedStart} – ${formattedEnd}` : '';
}

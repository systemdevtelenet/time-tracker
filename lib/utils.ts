import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format total seconds into "X minutes, Y seconds" or "HH:MM:SS"
 */
export function formatSecondsToTrackerText(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  if (mins === 0) {
    return `${secs} seconds`;
  }
  return `${mins} minutes, ${secs} seconds`;
}

export function formatStopwatchTime(totalSeconds: number): string {
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;
  return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Parses duration strings like "28 minutes, 49 seconds", "15 mins", "45s", or numbers
 */
export function parseDurationToSeconds(durationStr: string | number | null | undefined): number {
  if (!durationStr) return 0;
  if (typeof durationStr === 'number') return Math.round(durationStr * 60); // assume decimal mins if number

  const str = durationStr.toString().toLowerCase().trim();

  // Match "X minutes, Y seconds" or "X min, Y sec" or "X mins"
  let totalSecs = 0;
  const minMatch = str.match(/(\d+)\s*(?:minutes|minute|mins|min|m)/);
  const secMatch = str.match(/(\d+)\s*(?:seconds|second|secs|sec|s)/);
  const hrMatch = str.match(/(\d+)\s*(?:hours|hour|hrs|hr|h)/);

  if (hrMatch) totalSecs += parseInt(hrMatch[1], 10) * 3600;
  if (minMatch) totalSecs += parseInt(minMatch[1], 10) * 60;
  if (secMatch) totalSecs += parseInt(secMatch[1], 10);

  if (totalSecs > 0) return totalSecs;

  // Try parsing "HH:MM:SS" or "MM:SS"
  const timeParts = str.split(':');
  if (timeParts.length === 3) {
    return (
      (parseInt(timeParts[0], 10) || 0) * 3600 +
      (parseInt(timeParts[1], 10) || 0) * 60 +
      (parseInt(timeParts[2], 10) || 0)
    );
  } else if (timeParts.length === 2) {
    return (parseInt(timeParts[0], 10) || 0) * 60 + (parseInt(timeParts[1], 10) || 0);
  }

  // Fallback float (assume minutes if number)
  const num = parseFloat(str);
  if (!isNaN(num)) return Math.round(num * 60);

  return 0;
}

export function formatTotalDurationHuman(totalSeconds: number): string {
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;

  if (hrs > 0) {
    return `${hrs}h ${mins}m`;
  }
  if (mins > 0) {
    return `${mins}m ${secs}s`;
  }
  return `${secs}s`;
}

export function getTodayFormatted(): string {
  const today = new Date();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const yyyy = today.getFullYear();
  return `${mm}/${dd}/${yyyy}`;
}

import { WEEKDAYS_SHORT, formatTime } from './hours';

/**
 * Time selection thinks in "nights": a night starts at 12:00 on its day and
 * ends at 12:00 the next day. Picking "02:00" on the night "Fr/Sa" therefore
 * means Saturday 02:00 – which is what people mean when they plan a night out.
 */
export interface TimeSelection {
  live: boolean;
  /** 0 = tonight, 1 = tomorrow night, … */
  nightOffset: number;
  /** Minutes since 12:00 on the night's day (0–1439). */
  minutes: number;
}

export const NIGHT_START_HOUR = 12;

/** The calendar day the night containing `d` started on (at 00:00). */
export function nightOf(d: Date): Date {
  const n = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  if (d.getHours() < NIGHT_START_HOUR) n.setDate(n.getDate() - 1);
  return n;
}

export function resolveTime(sel: TimeSelection, now: Date): Date {
  if (sel.live) return now;
  const base = nightOf(now);
  base.setDate(base.getDate() + sel.nightOffset);
  base.setHours(NIGHT_START_HOUR, 0, 0, 0);
  return new Date(base.getTime() + sel.minutes * 60000);
}

/** Converts an absolute date into a selection relative to `now`. */
export function selectionFor(d: Date, now: Date, live = false): TimeSelection {
  const night = nightOf(d);
  const today = nightOf(now);
  const nightOffset = Math.round((night.getTime() - today.getTime()) / 86400000);
  const start = new Date(night);
  start.setHours(NIGHT_START_HOUR, 0, 0, 0);
  return { live, nightOffset, minutes: Math.round((d.getTime() - start.getTime()) / 60000) };
}

/** Minutes-since-noon for a clock time, e.g. 2 → 840 (02:00). */
export function minutesForHour(hour: number, minute = 0): number {
  return (((hour - NIGHT_START_HOUR + 24) % 24) * 60 + minute) % 1440;
}

export function shiftSelection(sel: TimeSelection, now: Date, deltaMinutes: number): TimeSelection {
  const current = sel.live ? selectionFor(now, now) : sel;
  let minutes = current.minutes + deltaMinutes;
  let nightOffset = current.nightOffset;
  while (minutes < 0) {
    minutes += 1440;
    nightOffset -= 1;
  }
  while (minutes >= 1440) {
    minutes -= 1440;
    nightOffset += 1;
  }
  nightOffset = Math.max(0, Math.min(6, nightOffset));
  return { live: false, nightOffset, minutes };
}

export function nightLabel(offset: number, now: Date): string {
  if (offset === 0) return 'Heute';
  if (offset === 1) return 'Morgen';
  const d = nightOf(now);
  d.setDate(d.getDate() + offset);
  const next = new Date(d);
  next.setDate(d.getDate() + 1);
  return `${WEEKDAYS_SHORT[d.getDay()]}/${WEEKDAYS_SHORT[next.getDay()]}`;
}

export function describeSelection(sel: TimeSelection, now: Date): string {
  if (sel.live) return `Jetzt · ${formatTime(now)}`;
  const at = resolveTime(sel, now);
  const night = nightOf(now);
  night.setDate(night.getDate() + sel.nightOffset);
  const next = new Date(night);
  next.setDate(night.getDate() + 1);
  return `${WEEKDAYS_SHORT[night.getDay()]}/${WEEKDAYS_SHORT[next.getDay()]} · ${formatTime(at)}`;
}

export const QUICK_HOURS = [18, 20, 22, 0, 2, 4, 6];

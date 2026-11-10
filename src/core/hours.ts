import OpeningHours from 'opening_hours';
import type { OpenStatus, Tags } from './types';

/**
 * Wrapper around opening_hours.js: parses the OSM `opening_hours` tag and
 * answers "is it open at time X?" in a nightlife-friendly way.
 */

export interface HoursRegion {
  lat: number;
  lon: number;
  /** Nominatim style address, used to resolve public/school holidays. */
  address: { country_code: string; state?: string; [k: string]: string | undefined };
}

let region: HoursRegion = { lat: 52.52, lon: 13.405, address: { country_code: 'de', state: 'Berlin' } };
let regionKey = 'de|Berlin';
const cache = new Map<string, OpeningHours | null>();

export function setHoursRegion(r: HoursRegion) {
  const key = `${r.address.country_code}|${r.address.state ?? ''}|${r.address['ISO3166-2-lvl4'] ?? ''}`;
  region = r;
  if (key !== regionKey) {
    regionKey = key;
    cache.clear();
  }
}

export function getHoursRegion(): HoursRegion {
  return region;
}

const OH_CONF = { locale: 'de', mode: 0 as const, tag_key: 'opening_hours' } as never;

/** Parses an opening_hours value. Returns null when it can't be parsed. */
export function parseHours(value: string | undefined): OpeningHours | null {
  if (!value) return null;
  const v = value.trim();
  if (!v) return null;
  const hit = cache.get(v);
  if (hit !== undefined) return hit;
  let oh: OpeningHours | null = null;
  try {
    oh = new OpeningHours(v, region as never, OH_CONF);
  } catch {
    // Holiday definitions for the region might be missing (e.g. "SH" without a
    // state) – retry without location information before giving up.
    try {
      oh = new OpeningHours(v, null, OH_CONF);
    } catch {
      oh = null;
    }
  }
  cache.set(v, oh);
  return oh;
}

const pad = (n: number) => String(n).padStart(2, '0');
export const WEEKDAYS_SHORT = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
export const WEEKDAYS_LONG = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];

export function formatTime(d: Date): string {
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

/** "05:00" if within 24h (and not more than a day ahead), otherwise "Sa 05:00". */
export function formatRelativeTime(target: Date, from: Date): string {
  const diff = target.getTime() - from.getTime();
  if (sameDay(target, from) || (diff > 0 && diff < 20 * 3600 * 1000)) return formatTime(target);
  if (diff > 6 * 24 * 3600 * 1000) {
    return `${WEEKDAYS_SHORT[target.getDay()]} ${pad(target.getDate())}.${pad(target.getMonth() + 1)}. ${formatTime(target)}`;
  }
  return `${WEEKDAYS_SHORT[target.getDay()]} ${formatTime(target)}`;
}

export function getStatus(tags: Tags, at: Date): OpenStatus {
  const raw = tags.opening_hours;
  if (!raw) return { state: 'unknown', label: 'Öffnungszeiten unbekannt' };
  const oh = parseHours(raw);
  if (!oh) return { state: 'unknown', label: 'Öffnungszeiten nicht lesbar' };

  let open: boolean;
  let unknown: boolean;
  let comment: string | undefined;
  let next: Date | undefined;
  try {
    open = oh.getState(at);
    unknown = oh.getUnknown(at);
    comment = oh.getComment(at);
    next = oh.getNextChange(at, new Date(at.getTime() + 8 * 24 * 3600 * 1000));
  } catch {
    return { state: 'unknown', label: 'Öffnungszeiten nicht lesbar' };
  }

  if (unknown) {
    return {
      state: 'unknown',
      label: comment ? `Unklar · ${comment}` : 'Vielleicht geöffnet',
      comment,
      nextChange: next,
    };
  }
  if (open) {
    const label = next ? `Geöffnet · bis ${formatRelativeTime(next, at)}` : 'Durchgehend geöffnet';
    return { state: 'open', label, comment, nextChange: next };
  }
  const label = next ? `Geschlossen · öffnet ${formatRelativeTime(next, at)}` : 'Geschlossen';
  return { state: 'closed', label, comment, nextChange: next };
}

/** True if the place is open continuously from `at` for at least `minutes`. */
export function isOpenFor(tags: Tags, at: Date, minutes: number): boolean {
  const oh = parseHours(tags.opening_hours);
  if (!oh) return false;
  const end = new Date(at.getTime() + minutes * 60000);
  try {
    const intervals = oh.getOpenIntervals(at, end).filter((i) => !i[2]);
    let cursor = at.getTime();
    for (const [from, to] of intervals.sort((a, b) => a[0].getTime() - b[0].getTime())) {
      if (from.getTime() > cursor + 60000) return false;
      cursor = Math.max(cursor, to.getTime());
      if (cursor >= end.getTime() - 60000) return true;
    }
    return cursor >= end.getTime() - 60000;
  } catch {
    return false;
  }
}

export interface NightSchedule {
  /** The calendar day the night starts on. */
  date: Date;
  label: string;
  /** e.g. ["22:00–04:00"], empty = closed */
  ranges: string[];
  unknown: boolean;
  isSelected: boolean;
}

/**
 * Builds a week of "nights": each night runs from 12:00 on day D to 12:00 on
 * day D+1, so that "Fr 23:00–05:00" shows up as one range on Friday.
 */
export function getNightSchedule(raw: string | undefined, selectedNight: Date, days = 7): NightSchedule[] | null {
  const oh = parseHours(raw);
  if (!oh) return null;
  const out: NightSchedule[] = [];
  const start = new Date(selectedNight);
  start.setHours(12, 0, 0, 0);
  for (let i = 0; i < days; i++) {
    const from = new Date(start.getTime());
    from.setDate(start.getDate() + i);
    const to = new Date(from.getTime());
    to.setDate(from.getDate() + 1);
    let intervals: [Date, Date, boolean, string | undefined][] = [];
    try {
      intervals = oh.getOpenIntervals(from, to);
    } catch {
      return null;
    }
    const ranges = intervals.map(([a, b]) => {
      const left = a.getTime() <= from.getTime() ? 'mittags' : formatTime(a);
      const right = b.getTime() >= to.getTime() ? 'mittags' : formatTime(b);
      return `${left}–${right}`;
    });
    out.push({
      date: from,
      label: `${WEEKDAYS_SHORT[from.getDay()]}/${WEEKDAYS_SHORT[to.getDay()]}`,
      ranges,
      unknown: intervals.some((i) => i[2]),
      isSelected: i === 0,
    });
  }
  return out;
}

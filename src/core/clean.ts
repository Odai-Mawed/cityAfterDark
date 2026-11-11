import { parseHours } from './hours';
import type { Place, Tags, TransitLine } from './types';

/**
 * Cleaning rules for the daily Berlin data snapshot (scripts/build-berlin-data.ts).
 * Kept here, free of I/O, so they are unit-tested.
 */

/** Tags the app actually uses – everything else is dropped to keep the file small. */
const KEEP_TAGS = new Set([
  'name', 'brand', 'operator', 'amenity', 'shop', 'leisure', 'bar', 'cuisine', 'cocktails', 'drink',
  'opening_hours', 'website', 'contact:website', 'url', 'phone', 'contact:phone',
  'addr:street', 'addr:housenumber', 'addr:postcode', 'addr:city', 'addr:suburb',
  'outdoor_seating', 'beer_garden', 'smoking', 'wheelchair', 'live_music', 'dance', 'dance:venue',
  'lgbtq', 'gay', 'diet:vegan', 'fee', 'description',
  'payment:cards', 'payment:debit_cards', 'payment:credit_cards', 'payment:girocard', 'payment:contactless',
]);

export function trimTags(tags: Tags): Tags {
  const out: Tags = {};
  for (const [k, v] of Object.entries(tags)) {
    if (KEEP_TAGS.has(k) && v) out[k] = v;
  }
  return out;
}

const DAY = 24 * 3600 * 1000;

/** Opening intervals in the next `days`, or null when the hours can't be evaluated. */
function intervals(tags: Tags, from: Date, days: number): [Date, Date][] | null {
  const oh = parseHours(tags.opening_hours);
  if (!oh) return null;
  try {
    return oh.getOpenIntervals(from, new Date(from.getTime() + days * DAY)).map(([a, b]) => [a, b] as [Date, Date]);
  } catch {
    return null;
  }
}

/** True if the place opens at all in the next two weeks (unknown hours count as yes). */
export function opensSoon(tags: Tags, now: Date): boolean {
  const iv = intervals(tags, now, 14);
  return iv === null || iv.length > 0;
}

/** True if the place is open at some point between 22:30 and 05:00 within the next week. */
export function isLateNight(tags: Tags, now: Date): boolean {
  const iv = intervals(tags, now, 7);
  if (iv === null) return false;
  for (const [a, b] of iv) {
    if (b.getTime() - a.getTime() >= DAY) return true;
    // walk the interval in 30 min steps – intervals are short, this is cheap
    for (let t = a.getTime(); t < b.getTime(); t += 30 * 60000) {
      const d = new Date(t);
      const m = d.getHours() * 60 + d.getMinutes();
      if (m >= 22 * 60 + 30 || m < 5 * 60) return true;
    }
  }
  return false;
}

export interface CleanStats {
  input: number;
  notOpening: number;
  notLate: number;
  output: number;
}

/**
 * - drops places that won't open in the next 14 days (closed for good, seasonal)
 * - keeps food places and supermarkets only if they are open late
 * - trims tags and rounds coordinates
 */
export function cleanPlaces(places: Place[], now: Date): { places: Place[]; stats: CleanStats } {
  const stats: CleanStats = { input: places.length, notOpening: 0, notLate: 0, output: 0 };
  const seen = new Set<string>();
  const out: Place[] = [];
  for (const p of places) {
    if (seen.has(p.id)) continue;
    seen.add(p.id);
    if (!opensSoon(p.tags, now)) {
      stats.notOpening++;
      continue;
    }
    const lateOnly = p.category === 'food' || (p.category === 'essentials' && p.tags.shop === 'supermarket');
    if (lateOnly && !isLateNight(p.tags, now)) {
      stats.notLate++;
      continue;
    }
    out.push({ ...p, lat: round(p.lat, 6), lon: round(p.lon, 6), tags: trimTags(p.tags) });
  }
  stats.output = out.length;
  return { places: out, stats };
}

const round = (n: number, d: number) => Math.round(n * 10 ** d) / 10 ** d;

/** Ramer–Douglas–Peucker on [lat, lon] pairs, tolerance in degrees. */
export function simplify(points: [number, number][], tolerance: number): [number, number][] {
  if (points.length < 3) return points;
  const sq = tolerance * tolerance;
  const keep = new Uint8Array(points.length);
  keep[0] = keep[points.length - 1] = 1;
  const stack: [number, number][] = [[0, points.length - 1]];
  while (stack.length) {
    const [first, last] = stack.pop()!;
    let maxD = 0;
    let index = 0;
    for (let i = first + 1; i < last; i++) {
      const d = segDistSq(points[i], points[first], points[last]);
      if (d > maxD) {
        maxD = d;
        index = i;
      }
    }
    if (maxD > sq) {
      keep[index] = 1;
      stack.push([first, index], [index, last]);
    }
  }
  return points.filter((_, i) => keep[i]);
}

function segDistSq(p: [number, number], a: [number, number], b: [number, number]): number {
  let [x, y] = a;
  let dx = b[0] - x;
  let dy = b[1] - y;
  if (dx !== 0 || dy !== 0) {
    const t = ((p[0] - x) * dx + (p[1] - y) * dy) / (dx * dx + dy * dy);
    if (t > 1) {
      x = b[0];
      y = b[1];
    } else if (t > 0) {
      x += dx * t;
      y += dy * t;
    }
  }
  dx = p[0] - x;
  dy = p[1] - y;
  return dx * dx + dy * dy;
}

/** Simplifies line geometry (~5 m) and rounds coordinates to ~1 m. */
export function cleanLines(lines: TransitLine[]): TransitLine[] {
  return lines.map((l) => ({
    ...l,
    coords: l.coords
      .map((seg) => simplify(seg, 0.00005).map(([a, b]) => [round(a, 5), round(b, 5)] as [number, number]))
      .filter((seg) => seg.length > 1),
    stops: l.stops.map((s) => ({ ...s, lat: round(s.lat, 5), lon: round(s.lon, 5) })),
    center: { lat: round(l.center.lat, 5), lon: round(l.center.lon, 5) },
  }));
}

// ── Snapshot file format ─────────────────────────────────────────────────

export const SNAPSHOT_VERSION = 1;

export interface Snapshot {
  version: number;
  /** ISO timestamp of the Overpass download. */
  generated: string;
  attribution: string;
  places: Place[];
  lines: TransitLine[];
}

export function isSnapshot(x: unknown): x is Snapshot {
  const s = x as Snapshot;
  return !!s && s.version === SNAPSHOT_VERSION && typeof s.generated === 'string' && Array.isArray(s.places) && Array.isArray(s.lines);
}

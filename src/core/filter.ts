import { distance } from './geo';
import { getStatus, isOpenFor } from './hours';
import { INTEREST_BY_ID, type InterestId } from './interests';
import type { CategoryId, LatLon, OpenStatus, Place, TransitLine } from './types';

export type OpenMode = 'open' | 'all';

export interface Filters {
  categories: CategoryId[];
  interests: InterestId[];
  /** 'open' = only places open at the selected time. */
  openMode: OpenMode;
  /** Show places without (readable) opening hours. */
  includeUnknown: boolean;
  /** Only places still open for at least this many minutes (0 = off). */
  minOpenMinutes: number;
  query: string;
}

export const DEFAULT_FILTERS: Filters = {
  categories: ['club', 'bar', 'spaeti', 'food', 'transit'],
  interests: [],
  openMode: 'open',
  includeUnknown: false,
  minOpenMinutes: 0,
  query: '',
};

export interface PlaceResult {
  place: Place;
  status: OpenStatus;
  distance: number;
}

const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');

export function matchesQuery(text: string[], query: string): boolean {
  const q = normalize(query.trim());
  if (!q) return true;
  const hay = normalize(text.filter(Boolean).join(' '));
  return q.split(/\s+/).every((w) => hay.includes(w));
}

const STATE_ORDER = { open: 0, unknown: 1, closed: 2 } as const;

export function filterPlaces(places: Iterable<Place>, f: Filters, at: Date, origin: LatLon): PlaceResult[] {
  const out: PlaceResult[] = [];
  for (const place of places) {
    if (!f.categories.includes(place.category)) continue;
    if (f.interests.length && !f.interests.every((i) => INTEREST_BY_ID[i].test(place.tags))) continue;
    if (
      f.query &&
      !matchesQuery([place.name, place.kind, place.tags.cuisine ?? '', place.tags['addr:street'] ?? ''], f.query)
    ) {
      continue;
    }
    const status = getStatus(place.tags, at);
    if (f.openMode === 'open') {
      if (status.state === 'closed') continue;
      if (status.state === 'unknown' && !f.includeUnknown) continue;
      if (f.minOpenMinutes > 0 && status.state === 'open' && !isOpenFor(place.tags, at, f.minOpenMinutes)) continue;
    } else if (status.state === 'unknown' && !f.includeUnknown) {
      continue;
    }
    out.push({ place, status, distance: distance(origin, place) });
  }
  out.sort((a, b) => STATE_ORDER[a.status.state] - STATE_ORDER[b.status.state] || a.distance - b.distance);
  return out;
}

export function filterLines(lines: Iterable<TransitLine>, f: Filters, origin: LatLon): TransitLine[] {
  if (!f.categories.includes('transit')) return [];
  const out = [...lines].filter((l) =>
    matchesQuery([l.ref, l.name, l.modeLabel, l.from ?? '', l.to ?? '', ...l.stops.map((s) => s.name ?? '')], f.query),
  );
  return out.sort((a, b) => distance(origin, a.center) - distance(origin, b.center));
}

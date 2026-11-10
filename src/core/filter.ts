import { berlinServiceStatus, isInBerlin, type ServiceStatus } from './berlin';
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
  /** Categories whose places are shown even without opening hours (Berlin clubs rarely publish them). */
  unknownCategories: CategoryId[];
  /** Only places still open for at least this many minutes (0 = off). */
  minOpenMinutes: number;
  query: string;
}

export const DEFAULT_FILTERS: Filters = {
  categories: ['club', 'bar', 'spaeti', 'food', 'transit'],
  interests: [],
  openMode: 'open',
  includeUnknown: false,
  unknownCategories: ['club'],
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
    const showUnknown = f.includeUnknown || f.unknownCategories.includes(place.category) || !!place.highlight;
    if (status.state === 'unknown' && !showUnknown) continue;
    if (f.openMode === 'open') {
      if (status.state === 'closed') continue;
      if (f.minOpenMinutes > 0 && status.state === 'open' && !isOpenFor(place.tags, at, f.minOpenMinutes)) continue;
    }
    out.push({ place, status, distance: distance(origin, place) });
  }
  out.sort((a, b) => STATE_ORDER[a.status.state] - STATE_ORDER[b.status.state] || a.distance - b.distance);
  return out;
}

export interface LineResult {
  line: TransitLine;
  service: ServiceStatus;
  distance: number;
}

const SERVICE_ORDER = { running: 0, unknown: 1, paused: 2 } as const;

export function lineService(line: TransitLine, at: Date): ServiceStatus {
  if (isInBerlin(line.center)) return berlinServiceStatus(line, at);
  return { state: 'unknown', label: 'Nachtlinie · Fahrplan prüfen' };
}

export function filterLines(lines: Iterable<TransitLine>, f: Filters, at: Date, origin: LatLon): LineResult[] {
  if (!f.categories.includes('transit')) return [];
  const out: LineResult[] = [];
  for (const line of lines) {
    if (
      !matchesQuery(
        [line.ref, line.name, line.modeLabel, line.from ?? '', line.to ?? '', ...line.stops.map((s) => s.name ?? '')],
        f.query,
      )
    ) {
      continue;
    }
    const service = lineService(line, at);
    if (f.openMode === 'open' && service.state === 'paused') continue;
    out.push({ line, service, distance: distance(origin, line.center) });
  }
  return out.sort((a, b) => SERVICE_ORDER[a.service.state] - SERVICE_ORDER[b.service.state] || a.distance - b.distance);
}

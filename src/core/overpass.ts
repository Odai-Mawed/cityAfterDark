import { BERLIN_MODE_LABELS, bboxIntersectsBerlin, berlinProduct, isInBerlin } from './berlin';
import { CATEGORY_BY_ID, TRANSIT_MODE_LABELS, classify } from './categories';
import type { BBox, CategoryId, LatLon, Place, Tags, TransitLine, TransitStop } from './types';

// The main instance is often at capacity – several mirrors, tried in order.
export const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass.private.coffee/api/interpreter',
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
];

const NIGHT_MODES = 'bus|trolleybus|tram|subway|light_rail|train|ferry';

const fmt = (n: number) => n.toFixed(5);
export function bboxString(b: BBox): string {
  return `${fmt(b.south)},${fmt(b.west)},${fmt(b.north)},${fmt(b.east)}`;
}

/** Builds one Overpass QL query for the requested categories in a bbox. */
export function buildQuery(bbox: BBox, categories: CategoryId[], timeout = 25): string {
  const bb = bboxString(bbox);
  const placeCats = categories.filter((c) => c !== 'transit');
  const lines: string[] = [`[out:json][timeout:${timeout}];`];
  if (placeCats.length) {
    lines.push('(');
    for (const c of placeCats) {
      for (const s of CATEGORY_BY_ID[c].selectors) lines.push(`  ${s}(${bb});`);
    }
    lines.push(')->.p;');
    lines.push('node.p;out qt;');
    lines.push('(way.p;rel.p;);out tags center qt;');
  }
  if (categories.includes('transit')) {
    lines.push('(');
    lines.push(`  rel["type"="route"]["route"~"^(${NIGHT_MODES})$"]["by_night"~"^(yes|only)$"](${bb});`);
    lines.push(`  rel["type"="route"]["route"~"^(bus|trolleybus|tram)$"]["ref"~"^N ?[0-9]+[A-Z]?$"](${bb});`);
    lines.push(`  rel["type"="route"]["route"="train"]["service"="night"](${bb});`);
    if (bboxIntersectsBerlin(bbox)) {
      // Berlin: the night network also includes U-/S-Bahn (all night on weekends),
      // MetroTram and MetroBus (24/7).
      lines.push(`  rel["type"="route"]["route"="subway"]["ref"~"^U ?[0-9]+$"](${bb});`);
      lines.push(`  rel["type"="route"]["route"~"^(light_rail|train)$"]["ref"~"^S ?[0-9]+$"](${bb});`);
      lines.push(`  rel["type"="route"]["route"~"^(tram|bus)$"]["ref"~"^M ?[0-9]+$"](${bb});`);
    }
    lines.push(')->.nr;');
    // clip geometry to the bbox – long S-Bahn routes would otherwise be huge
    lines.push(`.nr out geom(${bb}) qt;`);
    lines.push('node(r.nr)["name"];out qt;');
  }
  return lines.join('\n');
}

interface OsmMember {
  type: 'node' | 'way' | 'relation';
  ref: number;
  role: string;
  lat?: number;
  lon?: number;
  geometry?: (LatLon | null)[];
}

export interface OsmElement {
  type: 'node' | 'way' | 'relation';
  id: number;
  lat?: number;
  lon?: number;
  center?: LatLon;
  tags?: Tags;
  members?: OsmMember[];
}

export interface ParsedData {
  places: Place[];
  lines: TransitLine[];
}

export function placeName(tags: Tags, kind: string): string {
  const name = tags.name || tags.brand || tags.operator || kind;
  // chains like "Aral" or "Shell" are only distinguishable by street
  if (tags.amenity === 'fuel' && tags['addr:street'] && !name.includes(tags['addr:street'])) {
    return `${name} · ${tags['addr:street']}`;
  }
  return name;
}

export function parseResponse(elements: OsmElement[], categories: CategoryId[]): ParsedData {
  const places: Place[] = [];
  const nodeNames = new Map<number, string>();
  const routes: OsmElement[] = [];

  for (const el of elements) {
    const tags = el.tags ?? {};
    if (el.type === 'relation' && tags.type === 'route' && el.members) {
      routes.push(el);
      continue;
    }
    if (el.type === 'node' && tags.name) nodeNames.set(el.id, tags.name);
    const lat = el.lat ?? el.center?.lat;
    const lon = el.lon ?? el.center?.lon;
    if (lat == null || lon == null) continue;
    const cls = classify(tags, categories);
    if (!cls) continue;
    places.push({
      id: `${el.type}/${el.id}`,
      lat,
      lon,
      name: placeName(tags, cls.kind),
      category: cls.category,
      kind: cls.kind,
      tags,
    });
  }

  return { places: dedupePlaces(places), lines: categories.includes('transit') ? buildLines(routes, nodeNames) : [] };
}

/** Removes duplicates (e.g. a node and a building with the same name). */
function dedupePlaces(places: Place[]): Place[] {
  const seen = new Map<string, Place>();
  const out: Place[] = [];
  for (const p of places) {
    const key = `${p.category}|${p.name.toLowerCase()}|${p.lat.toFixed(3)}|${p.lon.toFixed(3)}`;
    const prev = seen.get(key);
    if (prev && p.name !== p.kind) {
      // keep the one with more information
      if (Object.keys(p.tags).length > Object.keys(prev.tags).length) {
        out[out.indexOf(prev)] = p;
        seen.set(key, p);
      }
      continue;
    }
    seen.set(key, p);
    out.push(p);
  }
  return out;
}

function buildLines(routes: OsmElement[], nodeNames: Map<number, string>): TransitLine[] {
  const byKey = new Map<string, TransitLine>();
  for (const r of routes) {
    const tags = r.tags ?? {};
    const mode = tags.route ?? 'bus';
    const ref = tags.ref ?? '';
    const key = `${mode}:${ref || tags.name || r.id}`;
    const coords: [number, number][][] = [];
    const stops: TransitStop[] = [];
    for (const m of r.members ?? []) {
      if (m.type === 'way' && m.geometry) {
        const seg = m.geometry.filter((g): g is LatLon => !!g).map((g) => [g.lat, g.lon] as [number, number]);
        if (seg.length > 1) coords.push(seg);
      } else if (m.type === 'node' && m.lat != null && m.lon != null && /^(stop|platform)/.test(m.role)) {
        stops.push({ lat: m.lat, lon: m.lon, name: nodeNames.get(m.ref) });
      }
    }
    const existing = byKey.get(key);
    if (existing) {
      existing.coords.push(...coords);
      existing.stops.push(...stops);
      existing.osmIds.push(`relation/${r.id}`);
      continue;
    }
    byKey.set(key, {
      id: key,
      ref,
      name: tags.name ?? ref,
      mode,
      modeLabel: modeLabel(mode, ref, r.members ?? []),
      color: tags.colour,
      from: tags.from,
      to: tags.to,
      operator: tags.operator ?? tags.network,
      coords,
      stops,
      center: { lat: 0, lon: 0 },
      osmIds: [`relation/${r.id}`],
    });
  }
  const lines = [...byKey.values()].filter((l) => l.coords.length || l.stops.length);
  for (const l of lines) {
    l.stops = dedupeStops(l.stops);
    l.center = lineCenter(l);
  }
  return lines;
}

function modeLabel(mode: string, ref: string, members: OsmMember[]): string {
  const product = berlinProduct(mode, ref);
  const first = members.find((m) => m.lat != null || m.geometry?.some(Boolean));
  const p = first?.lat != null ? { lat: first.lat, lon: first.lon! } : first?.geometry?.find(Boolean);
  if (product && (!p || isInBerlin(p))) return BERLIN_MODE_LABELS[product];
  return TRANSIT_MODE_LABELS[mode] ?? 'Nachtlinie';
}

function dedupeStops(stops: TransitStop[]): TransitStop[] {
  const out: TransitStop[] = [];
  for (const s of stops) {
    // platforms and stop positions of the same stop are ~10–40m apart
    const dup = out.find(
      (o) => (s.name && o.name === s.name && Math.abs(o.lat - s.lat) < 0.002 && Math.abs(o.lon - s.lon) < 0.003) ||
        (Math.abs(o.lat - s.lat) < 0.0002 && Math.abs(o.lon - s.lon) < 0.0003),
    );
    if (dup) {
      if (!dup.name && s.name) dup.name = s.name;
      continue;
    }
    out.push({ ...s });
  }
  return out;
}

function lineCenter(l: TransitLine): LatLon {
  const pts: [number, number][] = l.stops.length ? l.stops.map((s) => [s.lat, s.lon]) : l.coords.flat();
  const lat = pts.reduce((a, p) => a + p[0], 0) / pts.length;
  const lon = pts.reduce((a, p) => a + p[1], 0) / pts.length;
  return { lat, lon };
}

export class OverpassError extends Error {}

/** Per-server time limit – a slow public instance should not block the app. */
export const ENDPOINT_TIMEOUT_MS = 30000;

/** Fetches places and night lines, trying several public Overpass instances. */
export async function fetchNightlife(
  bbox: BBox,
  categories: CategoryId[],
  signal?: AbortSignal,
  fetchImpl: typeof fetch = fetch,
  timeoutMs = ENDPOINT_TIMEOUT_MS,
): Promise<ParsedData> {
  const query = buildQuery(bbox, categories);
  let lastError: unknown;
  for (const endpoint of OVERPASS_ENDPOINTS) {
    const ctrl = new AbortController();
    const onAbort = () => ctrl.abort();
    signal?.addEventListener('abort', onAbort);
    const timer = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
      const res = await fetchImpl(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `data=${encodeURIComponent(query)}`,
        signal: ctrl.signal,
      });
      if (!res.ok) throw new OverpassError(`Overpass ${res.status}`);
      const json = (await res.json()) as { elements?: OsmElement[]; remark?: string };
      if (!json.elements) throw new OverpassError(json.remark ?? 'Ungültige Antwort');
      if (json.remark && /runtime error|timed out/i.test(json.remark) && json.elements.length === 0) {
        throw new OverpassError(json.remark);
      }
      return parseResponse(json.elements, categories);
    } catch (e) {
      if (signal?.aborted) throw e;
      lastError = ctrl.signal.aborted ? new OverpassError('Zeitüberschreitung') : e;
    } finally {
      clearTimeout(timer);
      signal?.removeEventListener('abort', onAbort);
    }
  }
  throw lastError instanceof Error ? lastError : new OverpassError('Overpass nicht erreichbar');
}

/**
 * Reads nightlife places and night lines from an OSM extract (.osm.pbf) with
 * osmium-tool and turns them into the same element shape the Overpass API
 * returns, so the rest of the pipeline (parseResponse, cleaning) is shared.
 *
 * Needs the `osmium` CLI (apt: osmium-tool).
 */
import { execFileSync } from 'node:child_process';
import { createReadStream } from 'node:fs';
import { createInterface } from 'node:readline';
import { classify } from '../src/core/categories';
import type { OsmElement } from '../src/core/overpass';
import type { LatLon, Tags } from '../src/core/types';

/** osmium tags-filter expressions – a superset, the exact selection happens below. */
export const OSMIUM_FILTERS = [
  'nwr/amenity=nightclub,music_venue,bar,pub,biergarten,fast_food,restaurant,cinema,theatre,casino,arts_centre,fuel,pharmacy',
  'nwr/shop=convenience,kiosk,supermarket',
  'nwr/leisure=bowling_alley,escape_game',
  'r/route=bus,trolleybus,tram,subway,light_rail,train,ferry',
];

/** Same selection as the Overpass query in src/core/overpass.ts (Berlin variant). */
export function wantedPlace(tags: Tags): boolean {
  const cls = classify(tags);
  if (!cls) return false;
  if (cls.category === 'food' && !tags.opening_hours) return false;
  if (tags.shop === 'supermarket' && !tags.opening_hours) return false;
  return true;
}

export function wantedRoute(tags: Tags): boolean {
  if (tags.type !== 'route') return false;
  const route = tags.route ?? '';
  const ref = (tags.ref ?? '').replace(/\s+/g, '');
  if (!/^(bus|trolleybus|tram|subway|light_rail|train|ferry)$/.test(route)) return false;
  if (tags.by_night === 'yes' || tags.by_night === 'only') return true;
  if (/^(bus|trolleybus|tram)$/.test(route) && /^N\d+[A-Z]?$/.test(ref)) return true;
  if (route === 'train' && tags.service === 'night') return true;
  if (route === 'subway' && /^U\d+$/.test(ref)) return true;
  if ((route === 'light_rail' || route === 'train') && /^S\d+$/.test(ref)) return true;
  if ((route === 'tram' || route === 'bus') && /^M\d+$/.test(ref)) return true;
  return false;
}

/** OPL escapes special characters as %<hex codepoint>%. */
export function oplUnescape(s: string): string {
  return s.replace(/%([0-9a-fA-F]+)%/g, (_, hex: string) => String.fromCodePoint(parseInt(hex, 16)));
}

export function parseOplTags(field: string): Tags {
  const tags: Tags = {};
  if (!field) return tags;
  for (const kv of field.split(',')) {
    const i = kv.indexOf('=');
    if (i <= 0) continue;
    tags[oplUnescape(kv.slice(0, i))] = oplUnescape(kv.slice(i + 1));
  }
  return tags;
}

interface RawWay {
  id: number;
  tags: Tags;
  nodes: number[];
}
interface RawRelation {
  id: number;
  tags: Tags;
  members: { type: 'node' | 'way' | 'relation'; ref: number; role: string }[];
}

const MEMBER_TYPE = { n: 'node', w: 'way', r: 'relation' } as const;

/** Parses OPL lines (osmium cat -f opl,add_metadata=false) and assembles Overpass-like elements. */
export async function elementsFromOpl(lines: AsyncIterable<string> | Iterable<string>): Promise<OsmElement[]> {
  const coords = new Map<number, LatLon>();
  const tagged: OsmElement[] = [];
  const ways = new Map<number, RawWay>();
  const relations: RawRelation[] = [];

  for await (const line of lines) {
    if (!line) continue;
    const kind = line[0];
    const parts = line.split(' ');
    const id = Number(parts[0].slice(1));
    const field = (p: string) => parts.find((x) => x[0] === p)?.slice(1) ?? '';
    const tags = parseOplTags(field('T'));
    if (kind === 'n') {
      const lon = Number(field('x'));
      const lat = Number(field('y'));
      if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue;
      coords.set(id, { lat, lon });
      if (Object.keys(tags).length) tagged.push({ type: 'node', id, lat, lon, tags });
    } else if (kind === 'w') {
      const nodes = field('N')
        .split(',')
        .filter(Boolean)
        .map((n) => Number(n.slice(1)));
      ways.set(id, { id, tags, nodes });
    } else if (kind === 'r') {
      const members = field('M')
        .split(',')
        .filter(Boolean)
        .map((m) => {
          const at = m.indexOf('@');
          const type = MEMBER_TYPE[m[0] as 'n' | 'w' | 'r'];
          return { type, ref: Number(m.slice(1, at)), role: oplUnescape(m.slice(at + 1)) };
        });
      relations.push({ id, tags, members });
    }
  }

  const wayGeom = (w: RawWay) => w.nodes.map((n) => coords.get(n)).filter((c): c is LatLon => !!c);
  const center = (pts: LatLon[]): LatLon | undefined => {
    if (!pts.length) return undefined;
    let s = 90, n = -90, w = 180, e = -180;
    for (const p of pts) {
      s = Math.min(s, p.lat);
      n = Math.max(n, p.lat);
      w = Math.min(w, p.lon);
      e = Math.max(e, p.lon);
    }
    return { lat: (s + n) / 2, lon: (w + e) / 2 };
  };

  const out: OsmElement[] = [];
  for (const el of tagged) {
    // named nodes are kept as well – parseResponse uses them to name transit stops
    if (wantedPlace(el.tags!) || el.tags!.name) out.push(el);
  }
  for (const w of ways.values()) {
    if (!wantedPlace(w.tags)) continue;
    const c = center(wayGeom(w));
    if (c) out.push({ type: 'way', id: w.id, center: c, tags: w.tags });
  }
  for (const r of relations) {
    if (wantedRoute(r.tags)) {
      out.push({
        type: 'relation',
        id: r.id,
        tags: r.tags,
        members: r.members.map((m) => {
          if (m.type === 'node') return { ...m, ...coords.get(m.ref) };
          if (m.type === 'way') {
            const w = ways.get(m.ref);
            return { ...m, geometry: w ? wayGeom(w) : [] };
          }
          return m;
        }),
      });
    } else if (wantedPlace(r.tags)) {
      const pts = r.members.flatMap((m) => (m.type === 'way' && ways.get(m.ref) ? wayGeom(ways.get(m.ref)!) : []));
      const c = center(pts);
      if (c) out.push({ type: 'relation', id: r.id, center: c, tags: r.tags });
    }
  }
  return out;
}

/** Filters an .osm.pbf with osmium and returns the elements. */
export async function elementsFromPbf(pbf: string, workDir: string): Promise<OsmElement[]> {
  const filtered = `${workDir}/filtered.osm.pbf`;
  const opl = `${workDir}/filtered.opl`;
  execFileSync('osmium', ['tags-filter', pbf, ...OSMIUM_FILTERS, '-o', filtered, '--overwrite'], { stdio: 'inherit' });
  execFileSync('osmium', ['cat', filtered, '-f', 'opl,add_metadata=false', '-o', opl, '--overwrite'], { stdio: 'inherit' });
  const rl = createInterface({ input: createReadStream(opl), crlfDelay: Infinity });
  return elementsFromOpl(rl);
}

/**
 * Daily Berlin data snapshot.
 *
 * Downloads all nightlife places and night lines in Berlin from Overpass (in
 * tiles, with retries and several mirrors), cleans them (src/core/clean.ts)
 * and writes public/data/berlin.json, which the web build serves next to the
 * app. The app then needs no Overpass request inside Berlin.
 *
 *   npm run data:berlin
 *
 * Runs daily in .github/workflows/berlin-data.yml. Data © OpenStreetMap
 * contributors, ODbL.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { BERLIN_BBOX } from '../src/core/berlin';
import { CATEGORIES } from '../src/core/categories';
import { SNAPSHOT_VERSION, cleanLines, cleanPlaces, type Snapshot } from '../src/core/clean';
import { setHoursRegion } from '../src/core/hours';
import { OVERPASS_ENDPOINTS, buildQuery, parseResponse, type OsmElement } from '../src/core/overpass';
import type { BBox, CategoryId } from '../src/core/types';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = resolve(ROOT, 'public/data/berlin.json');
const GRID = Number(process.env.BERLIN_GRID ?? 3); // GRID x GRID tiles
const UA = 'CityAfterDark/1.0 (daily data snapshot; https://cityafterdark.netlify.app)';
const ALL: CategoryId[] = CATEGORIES.map((c) => c.id);

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function tiles(b: BBox, n: number): BBox[] {
  const out: BBox[] = [];
  const dLat = (b.north - b.south) / n;
  const dLon = (b.east - b.west) / n;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      out.push({ south: b.south + i * dLat, north: b.south + (i + 1) * dLat, west: b.west + j * dLon, east: b.west + (j + 1) * dLon });
    }
  }
  return out;
}

async function fetchTile(bbox: BBox, label: string): Promise<OsmElement[]> {
  const query = buildQuery(bbox, ALL, 180);
  let wait = 10_000;
  for (let attempt = 1; attempt <= 6; attempt++) {
    const endpoint = OVERPASS_ENDPOINTS[(attempt - 1) % OVERPASS_ENDPOINTS.length];
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': UA },
        body: `data=${encodeURIComponent(query)}`,
        signal: AbortSignal.timeout(240_000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as { elements?: OsmElement[]; remark?: string };
      if (!json.elements) throw new Error(json.remark ?? 'no elements');
      if (json.remark && /runtime error|timed out|out of memory/i.test(json.remark)) throw new Error(json.remark);
      console.log(`  ${label}: ${json.elements.length} Elemente (${new URL(endpoint).host})`);
      return json.elements;
    } catch (e) {
      console.warn(`  ${label}: Versuch ${attempt} über ${new URL(endpoint).host} fehlgeschlagen – ${(e as Error).message}`);
      await sleep(wait);
      wait = Math.min(wait * 2, 120_000);
    }
  }
  throw new Error(`Kachel ${label} konnte nicht geladen werden`);
}

async function main() {
  setHoursRegion({ lat: 52.52, lon: 13.405, address: { country_code: 'de', state: 'Berlin', 'ISO3166-2-lvl4': 'DE-BE' } });
  const now = new Date();
  console.log(`Berlin-Daten: ${GRID}x${GRID} Kacheln, Kategorien: ${ALL.join(', ')}`);

  const elements: OsmElement[] = [];
  const seen = new Set<string>();
  const list = tiles(BERLIN_BBOX, GRID);
  for (const [i, t] of list.entries()) {
    const els = await fetchTile(t, `Kachel ${i + 1}/${list.length}`);
    for (const el of els) {
      // relations appear in several tiles with differently clipped geometry – keep all of them
      const key = `${el.type}/${el.id}`;
      if (el.type !== 'relation' && seen.has(key)) continue;
      seen.add(key);
      elements.push(el);
    }
    await sleep(3000); // be nice to the public servers
  }

  const parsed = parseResponse(elements, ALL);
  const { places, stats } = cleanPlaces(parsed.places, now);
  const lines = cleanLines(parsed.lines);

  const snapshot: Snapshot = {
    version: SNAPSHOT_VERSION,
    generated: now.toISOString(),
    attribution: '© OpenStreetMap-Mitwirkende (ODbL), über die Overpass API',
    places,
    lines,
  };
  mkdirSync(dirname(OUT), { recursive: true });
  const json = JSON.stringify(snapshot);
  writeFileSync(OUT, json);

  const byCat = new Map<string, number>();
  for (const p of places) byCat.set(p.category, (byCat.get(p.category) ?? 0) + 1);
  console.log(`Bereinigt: ${stats.input} → ${stats.output} Orte (${stats.notOpening} öffnen nicht in 14 Tagen, ${stats.notLate} nicht spät geöffnet)`);
  console.log(`Kategorien: ${[...byCat].map(([k, v]) => `${k} ${v}`).join(', ')} · ${lines.length} Linien`);
  console.log(`Geschrieben: ${OUT} (${(json.length / 1024 / 1024).toFixed(2)} MB)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

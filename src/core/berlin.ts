import { distance, inBBox } from './geo';
import { formatTime, parseHours } from './hours';
import { nightOf } from './time';
import type { BBox, LatLon, Tags, TransitLine } from './types';

/**
 * Berlin specifics: Kieze (neighbourhoods) and a simplified model of the BVG /
 * S-Bahn night network ("Nachtnetz"). The rules are deliberately coarse – the
 * app says so and links to the BVG trip planner.
 */

export const BERLIN_BBOX: BBox = { south: 52.3383, west: 13.0883, north: 52.6755, east: 13.7612 };

export function isInBerlin(p: LatLon): boolean {
  return inBBox(BERLIN_BBOX, p);
}

export function bboxIntersectsBerlin(b: BBox): boolean {
  return !(b.north < BERLIN_BBOX.south || b.south > BERLIN_BBOX.north || b.east < BERLIN_BBOX.west || b.west > BERLIN_BBOX.east);
}

/** Nightlife hotspots for quick jumps. */
export interface Kiez extends LatLon {
  name: string;
  hint: string;
  zoom: number;
}

export const KIEZE: Kiez[] = [
  { name: 'Kotti / SO36', hint: 'Kreuzberg', lat: 52.4993, lon: 13.4185, zoom: 16 },
  { name: 'Schlesisches Tor', hint: 'Kreuzberg', lat: 52.5009, lon: 13.4418, zoom: 16 },
  { name: 'Weserstraße', hint: 'Neukölln', lat: 52.4872, lon: 13.4322, zoom: 16 },
  { name: 'Simon-Dach-Kiez', hint: 'Friedrichshain', lat: 52.5101, lon: 13.4571, zoom: 16 },
  { name: 'Ostkreuz / Rummelsburg', hint: 'Friedrichshain', lat: 52.5031, lon: 13.4692, zoom: 15 },
  { name: 'Rosenthaler Platz', hint: 'Mitte', lat: 52.5297, lon: 13.4013, zoom: 16 },
  { name: 'Kastanienallee', hint: 'Prenzlauer Berg', lat: 52.5372, lon: 13.4085, zoom: 16 },
  { name: 'Nollendorfkiez', hint: 'Schöneberg', lat: 52.4995, lon: 13.3540, zoom: 16 },
  { name: 'Leopoldplatz', hint: 'Wedding', lat: 52.5465, lon: 13.3592, zoom: 16 },
  { name: 'Alt-Treptow', hint: 'Treptow', lat: 52.4935, lon: 13.4560, zoom: 16 },
];

/** Approximate Ortsteil centres, used when a place has no `addr:suburb`. */
const ORTSTEILE: [string, number, number][] = [
  ['Mitte', 52.5205, 13.4015],
  ['Kreuzberg', 52.4975, 13.4035],
  ['Friedrichshain', 52.5135, 13.4545],
  ['Neukölln', 52.4775, 13.4385],
  ['Prenzlauer Berg', 52.5395, 13.4235],
  ['Wedding', 52.5495, 13.3555],
  ['Gesundbrunnen', 52.5515, 13.3885],
  ['Moabit', 52.5290, 13.3410],
  ['Tiergarten', 52.5115, 13.3575],
  ['Schöneberg', 52.4845, 13.3525],
  ['Friedenau', 52.4710, 13.3290],
  ['Charlottenburg', 52.5165, 13.3045],
  ['Wilmersdorf', 52.4870, 13.3150],
  ['Tempelhof', 52.4665, 13.3855],
  ['Alt-Treptow', 52.4915, 13.4605],
  ['Plänterwald', 52.4795, 13.4745],
  ['Rummelsburg', 52.4975, 13.4920],
  ['Lichtenberg', 52.5150, 13.4985],
  ['Fennpfuhl', 52.5300, 13.4730],
  ['Pankow', 52.5695, 13.4025],
  ['Weißensee', 52.5540, 13.4630],
  ['Oberschöneweide', 52.4625, 13.5190],
  ['Steglitz', 52.4570, 13.3210],
  ['Britz', 52.4450, 13.4330],
];

/** Kiez label for a place: `addr:suburb` if tagged, else the nearest Ortsteil centre. */
export function kiezOf(p: LatLon, tags?: Tags): string | undefined {
  const tagged = tags?.['addr:suburb'];
  if (tagged) return tagged;
  if (!isInBerlin(p)) return undefined;
  let best: string | undefined;
  let bestD = 3200; // further away than that we'd rather say nothing
  for (const [name, lat, lon] of ORTSTEILE) {
    const d = distance(p, { lat, lon });
    if (d < bestD) {
      bestD = d;
      best = name;
    }
  }
  return best;
}

// ── BVG night network ──────────────────────────────────────────────────────

export type ServiceState = 'running' | 'paused' | 'unknown';

export interface ServiceStatus {
  state: ServiceState;
  label: string;
  /** e.g. "Ersatz: N8" or "ersetzt U8" */
  hint?: string;
}

/**
 * True if the night starting on `night` (calendar day) is a "weekend night":
 * Fr→Sa, Sa→So, or any night before a public holiday.
 */
export function isWeekendNight(night: Date): boolean {
  const d = night.getDay();
  if (d === 5 || d === 6) return true;
  const ph = parseHours('PH');
  if (!ph) return false;
  const next = new Date(night.getFullYear(), night.getMonth(), night.getDate() + 1, 12);
  try {
    return ph.getState(next);
  } catch {
    return false;
  }
}

const hm = (h: number, m = 0) => h * 60 + m;
const fmt = (min: number) => formatTime(new Date(2000, 0, 1, Math.floor(min / 60), min % 60));

/** Classifies a line into the BVG/S-Bahn product it belongs to. */
export function berlinProduct(mode: string, ref: string): 'U' | 'U4' | 'S' | 'MetroTram' | 'MetroBus' | 'N-U' | 'N' | null {
  const r = ref.replace(/\s+/g, '').toUpperCase();
  if (mode === 'subway' && /^U\d+$/.test(r)) return r === 'U4' ? 'U4' : 'U';
  if ((mode === 'light_rail' || mode === 'train') && /^S\d+$/.test(r)) return 'S';
  if (mode === 'tram' && /^M\d+$/.test(r)) return 'MetroTram';
  if (mode === 'bus' && /^M\d+$/.test(r)) return 'MetroBus';
  if (mode === 'bus' && /^N[1-9]$/.test(r)) return 'N-U';
  if (mode === 'bus' && /^N\d+$/.test(r)) return 'N';
  return null;
}

export const BERLIN_MODE_LABELS = {
  U: 'U-Bahn',
  U4: 'U-Bahn',
  S: 'S-Bahn',
  MetroTram: 'MetroTram',
  MetroBus: 'MetroBus',
  'N-U': 'Nachtbus',
  N: 'Nachtbus',
} as const;

/** Simplified night service rules of BVG / S-Bahn Berlin. */
export function berlinServiceStatus(line: Pick<TransitLine, 'mode' | 'ref'>, at: Date): ServiceStatus {
  const product = berlinProduct(line.mode, line.ref);
  if (!product) return { state: 'unknown', label: 'Nachtlinie · Fahrplan prüfen' };
  const t = hm(at.getHours(), at.getMinutes());
  const weekend = isWeekendNight(nightOf(at));
  const ref = line.ref.replace(/\s+/g, '').toUpperCase();
  const num = ref.replace(/^\D+/, '');
  const pause = (from: number, to: number) => t >= from && t < to;

  switch (product) {
    case 'MetroTram':
    case 'MetroBus':
      return {
        state: 'running',
        label: pause(hm(0, 30), hm(4, 30)) ? 'Fährt · nachts ca. alle 30 Min' : 'Fährt rund um die Uhr',
      };
    case 'U':
    case 'S': {
      const [from, to] = product === 'U' ? [hm(1, 0), hm(4, 30)] : [hm(1, 30), hm(4, 0)];
      const every = product === 'U' ? 15 : 30;
      if (weekend) return { state: 'running', label: `Fährt die ganze Nacht · ca. alle ${every} Min` };
      if (pause(from, to)) {
        return {
          state: 'paused',
          label: `Nachtpause bis ca. ${fmt(to)}`,
          hint: product === 'U' ? `Ersatz: Nachtbus N${num}` : 'Ersatz: Nachtbusse',
        };
      }
      return { state: 'running', label: `Fährt · Nachtpause ca. ${fmt(from)}–${fmt(to)}` };
    }
    case 'U4':
      if (pause(hm(1, 0), hm(4, 30))) return { state: 'paused', label: 'Nachtpause bis ca. 04:30', hint: 'U4 fährt nachts nie durch' };
      return { state: 'running', label: 'Fährt · auch am Wochenende Nachtpause' };
    case 'N-U':
      if (weekend) return { state: 'paused', label: 'Fährt heute nicht', hint: `U${num} fährt durch` };
      if (pause(hm(0, 30), hm(4, 45))) return { state: 'running', label: 'Fährt · ca. alle 30 Min', hint: `ersetzt U${num}` };
      return { state: 'paused', label: 'Fährt ca. 00:30–04:45', hint: `ersetzt U${num} (So–Do)` };
    case 'N':
      if (pause(hm(0, 30), hm(5, 0))) return { state: 'running', label: 'Fährt · ca. alle 30 Min' };
      return { state: 'paused', label: 'Fährt nachts ca. 00:30–05:00' };
  }
}

/** Short summary of the night network at a given time, for the info card. */
export function berlinNightSummary(at: Date): { title: string; text: string } {
  const night = nightOf(at);
  const weekend = isWeekendNight(night);
  const holiday = weekend && night.getDay() !== 5 && night.getDay() !== 6;
  if (weekend) {
    return {
      title: holiday ? 'Nacht vor einem Feiertag' : 'Wochenendnacht',
      text: 'U-Bahn (außer U4) und S-Bahn fahren durchgehend. Dazu MetroTram, MetroBus und Nachtbusse ab N10.',
    };
  }
  return {
    title: 'Nacht unter der Woche',
    text: 'U-Bahn ca. 1:00–4:30 Uhr Pause, dann fahren N1–N9 auf der U-Bahn-Strecke. MetroTram und MetroBus fahren rund um die Uhr.',
  };
}

export const BVG_TRIP_PLANNER = 'https://www.bvg.de/de/verbindungen/verbindungssuche';

import { describe, expect, it } from 'vitest';
import { classify } from '../src/core/categories';
import { DEFAULT_FILTERS, filterLines, filterPlaces, matchesQuery } from '../src/core/filter';
import { clampBBox, containsBBox, distance, formatDistance } from '../src/core/geo';
import { getNightSchedule, getStatus, isOpenFor, parseHours } from '../src/core/hours';
import { INTEREST_BY_ID } from '../src/core/interests';
import { buildQuery, fetchNightlife, parseResponse, type OsmElement } from '../src/core/overpass';
import { describeSelection, minutesForHour, nightOf, resolveTime, shiftSelection } from '../src/core/time';
import { generateDemo } from '../src/core/demo';
import { berlinNightSummary, berlinServiceStatus, isWeekendNight, kiezOf } from '../src/core/berlin';
import type { Place } from '../src/core/types';

// Tuesday, 10 Nov 2026, 21:00 local time
const NOW = new Date(2026, 10, 10, 21, 0);
const FRI_0130 = new Date(2026, 10, 13, 1, 30); // Thu/Fri night
const SAT_0300 = new Date(2026, 10, 14, 3, 0); // Fri/Sat night

const place = (tags: Record<string, string>, extra: Partial<Place> = {}): Place => {
  const cls = classify(tags)!;
  return { id: `node/${Math.random()}`, lat: 52.52, lon: 13.4, name: tags.name ?? 'x', category: cls.category, kind: cls.kind, tags, ...extra };
};

describe('categories', () => {
  it('classifies nightlife tags', () => {
    expect(classify({ amenity: 'nightclub' })).toEqual({ category: 'club', kind: 'Club' });
    expect(classify({ amenity: 'pub' })).toEqual({ category: 'bar', kind: 'Kneipe' });
    expect(classify({ shop: 'convenience', name: 'Späti am Eck' })).toEqual({ category: 'spaeti', kind: 'Späti' });
    expect(classify({ shop: 'convenience', name: 'Kaufhalle' })?.kind).toBe('Spätkauf');
    expect(classify({ amenity: 'fast_food', cuisine: 'kebab;pizza' })).toEqual({ category: 'food', kind: 'Döner' });
    expect(classify({ amenity: 'fuel' })?.category).toBe('essentials');
    expect(classify({ amenity: 'bench' })).toBeNull();
  });
  it('respects allowed categories', () => {
    expect(classify({ amenity: 'nightclub' }, ['bar'])).toBeNull();
  });
});

describe('opening hours', () => {
  it('handles hours past midnight', () => {
    const tags = { opening_hours: 'Fr,Sa 23:00-08:00' };
    const s = getStatus(tags, SAT_0300);
    expect(s.state).toBe('open');
    expect(s.label).toBe('Geöffnet · bis 08:00');
    const closed = getStatus(tags, FRI_0130);
    expect(closed.state).toBe('closed');
    expect(closed.label).toBe('Geschlossen · öffnet 23:00');
  });
  it('shows weekday when opening is far away', () => {
    const s = getStatus({ opening_hours: 'Fr,Sa 23:00-08:00' }, NOW);
    expect(s.label).toBe('Geschlossen · öffnet Fr 23:00');
  });
  it('treats 24/7 as always open', () => {
    expect(getStatus({ opening_hours: '24/7' }, NOW)).toMatchObject({ state: 'open', label: 'Durchgehend geöffnet' });
  });
  it('reports unknown and invalid values', () => {
    expect(getStatus({}, NOW).state).toBe('unknown');
    expect(getStatus({ opening_hours: 'nach Absprache!!' }, NOW)).toMatchObject({
      state: 'unknown',
      label: 'Öffnungszeiten nicht lesbar',
    });
    expect(parseHours('Mo-Fr 08:00-20:00; SH off')).not.toBeNull();
  });
  it('checks minimum remaining open time', () => {
    const tags = { opening_hours: 'Mo-Su 18:00-02:00' };
    const at = new Date(2026, 10, 10, 23, 0);
    expect(isOpenFor(tags, at, 120)).toBe(true);
    expect(isOpenFor(tags, at, 240)).toBe(false);
    expect(isOpenFor({ opening_hours: '24/7' }, at, 600)).toBe(true);
  });
  it('builds a night schedule', () => {
    const sched = getNightSchedule('Th 22:00-03:00; Sa 23:00-06:00', new Date(2026, 10, 12))!;
    expect(sched[0]).toMatchObject({ label: 'Do/Fr', ranges: ['22:00–03:00'] });
    expect(sched[1]).toMatchObject({ label: 'Fr/Sa', ranges: [] });
    expect(sched[2]).toMatchObject({ label: 'Sa/So', ranges: ['23:00–06:00'] });
  });
});

describe('time selection', () => {
  it('maps night offsets and minutes to dates', () => {
    expect(nightOf(new Date(2026, 10, 11, 3, 0))).toEqual(new Date(2026, 10, 10));
    const d = resolveTime({ live: false, nightOffset: 0, minutes: minutesForHour(2) }, NOW);
    expect(d).toEqual(new Date(2026, 10, 11, 2, 0));
    const fri = resolveTime({ live: false, nightOffset: 3, minutes: minutesForHour(23) }, NOW);
    expect(fri).toEqual(new Date(2026, 10, 13, 23, 0));
  });
  it('shifts across nights', () => {
    const s = shiftSelection({ live: false, nightOffset: 0, minutes: 1430 }, NOW, 30);
    expect(s).toEqual({ live: false, nightOffset: 1, minutes: 20 });
    expect(describeSelection(s, NOW)).toBe('Mi/Do · 12:20');
  });
});

describe('geo', () => {
  it('computes distances', () => {
    expect(distance({ lat: 52.52, lon: 13.405 }, { lat: 52.5163, lon: 13.3777 })).toBeGreaterThan(1800);
    expect(formatDistance(1234)).toBe('1,2 km');
    expect(formatDistance(234)).toBe('230 m');
  });
  it('handles bboxes', () => {
    const b = { south: 0, west: 0, north: 1, east: 1 };
    expect(containsBBox(b, { south: 0.1, west: 0.1, north: 0.9, east: 0.9 })).toBe(true);
    expect(clampBBox(b, 0.5)).toEqual({ south: 0.25, west: 0.25, north: 0.75, east: 0.75 });
  });
});

describe('overpass', () => {
  it('builds a query only for selected categories', () => {
    const q = buildQuery({ south: 52.5, west: 13.3, north: 52.6, east: 13.5 }, ['club', 'transit']);
    expect(q).toContain('nwr["amenity"="nightclub"](52.50000,13.30000,52.60000,13.50000);');
    expect(q).not.toContain('convenience');
    expect(q).toContain('by_night');
  });

  const elements: OsmElement[] = [
    { type: 'node', id: 1, lat: 52.5, lon: 13.4, tags: { amenity: 'nightclub', name: 'Testclub', opening_hours: 'Fr 23:00-06:00' } },
    { type: 'way', id: 2, center: { lat: 52.51, lon: 13.41 }, tags: { amenity: 'pub', name: 'Kneipe X' } },
    { type: 'node', id: 3, lat: 52.5, lon: 13.4, tags: { amenity: 'bench' } },
    { type: 'node', id: 10, lat: 52.52, lon: 13.42, tags: { name: 'Hauptbahnhof', public_transport: 'platform' } },
    {
      type: 'relation',
      id: 99,
      tags: { type: 'route', route: 'bus', ref: 'N5', name: 'N5: A => B', from: 'A', to: 'B' },
      members: [
        { type: 'node', ref: 10, role: 'platform', lat: 52.52, lon: 13.42 },
        { type: 'way', ref: 20, role: '', geometry: [{ lat: 52.52, lon: 13.42 }, { lat: 52.53, lon: 13.43 }] },
      ],
    },
    {
      type: 'relation',
      id: 100,
      tags: { type: 'route', route: 'bus', ref: 'N5', name: 'N5: B => A' },
      members: [{ type: 'way', ref: 21, role: '', geometry: [{ lat: 52.53, lon: 13.43 }, { lat: 52.52, lon: 13.42 }] }],
    },
  ];

  it('parses places and merges route directions', () => {
    const { places, lines } = parseResponse(elements, ['club', 'bar', 'transit']);
    expect(places.map((p) => p.name)).toEqual(['Testclub', 'Kneipe X']);
    expect(places[1]).toMatchObject({ id: 'way/2', lat: 52.51, kind: 'Kneipe' });
    expect(lines).toHaveLength(1);
    expect(lines[0]).toMatchObject({ ref: 'N5', modeLabel: 'Nachtbus', from: 'A', osmIds: ['relation/99', 'relation/100'] });
    expect(lines[0].coords).toHaveLength(2);
    expect(lines[0].stops).toEqual([{ lat: 52.52, lon: 13.42, name: 'Hauptbahnhof' }]);
  });

  it('falls back to the next endpoint', async () => {
    let calls = 0;
    const fake = (async () => {
      calls++;
      if (calls === 1) return new Response('busy', { status: 429 });
      return new Response(JSON.stringify({ elements }), { status: 200 });
    }) as typeof fetch;
    const data = await fetchNightlife({ south: 0, west: 0, north: 1, east: 1 }, ['club'], undefined, fake);
    expect(calls).toBe(2);
    expect(data.places).toHaveLength(1);
  });
});

describe('filter', () => {
  const at = new Date(2026, 10, 14, 2, 0); // Sat 02:00
  const club = place({ amenity: 'nightclub', name: 'Club', opening_hours: 'Fr,Sa 23:00-08:00' });
  const bar = place({ amenity: 'bar', name: 'Früh-Bar', opening_hours: 'Mo-Su 18:00-01:00', outdoor_seating: 'yes' });
  const kiosk = place({ shop: 'kiosk', name: 'Kiosk' });
  const all = [club, bar, kiosk];

  it('shows only open places by default', () => {
    const r = filterPlaces(all, { ...DEFAULT_FILTERS }, at, { lat: 52.52, lon: 13.4 });
    expect(r.map((x) => x.place.name)).toEqual(['Club']);
  });
  it('can include unknown and closed places, open first', () => {
    const r = filterPlaces(all, { ...DEFAULT_FILTERS, openMode: 'all', includeUnknown: true }, at, { lat: 52.52, lon: 13.4 });
    expect(r.map((x) => x.status.state)).toEqual(['open', 'unknown', 'closed']);
  });
  it('filters by interests, query and category', () => {
    const f = { ...DEFAULT_FILTERS, openMode: 'all' as const, interests: ['outdoor' as const] };
    expect(filterPlaces(all, f, at, club).map((x) => x.place.name)).toEqual(['Früh-Bar']);
    expect(filterPlaces(all, { ...DEFAULT_FILTERS, openMode: 'all', query: 'fruh' }, at, club)).toHaveLength(1);
    expect(filterPlaces(all, { ...DEFAULT_FILTERS, categories: ['bar'] }, at, club)).toHaveLength(0);
  });
  it('filters by minimum remaining time', () => {
    const f = { ...DEFAULT_FILTERS, minOpenMinutes: 7 * 60 };
    expect(filterPlaces(all, f, at, club)).toHaveLength(0);
  });
  it('matches accents loosely', () => {
    expect(matchesQuery(['Späti am Platz'], 'spati platz')).toBe(true);
  });
  it('interest tests', () => {
    expect(INTEREST_BY_ID.smoking.test({ smoking: 'separated' })).toBe(true);
    expect(INTEREST_BY_ID.cards.test({ 'payment:girocard': 'yes' })).toBe(true);
  });
});

describe('demo data', () => {
  it('is deterministic, fictional and filterable', () => {
    const a = generateDemo({ lat: 52.52, lon: 13.4 });
    const b = generateDemo({ lat: 52.52, lon: 13.4 });
    expect(a.places.map((p) => p.name)).toEqual(b.places.map((p) => p.name));
    expect(a.places.every((p) => p.demo)).toBe(true);
    expect(new Set(a.places.map((p) => p.category)).size).toBeGreaterThanOrEqual(5);
    const all = filterLines(a.lines, { ...DEFAULT_FILTERS, openMode: 'all' }, NOW, { lat: 52.52, lon: 13.4 });
    expect(all.map((l) => l.line.ref).sort()).toEqual(['M99', 'N99', 'U10']);
  });
});

describe('berlin', () => {
  const at = (y: number, m: number, d: number, h: number, min = 0) => new Date(y, m - 1, d, h, min);
  const u8 = { mode: 'subway', ref: 'U8' };

  it('knows weekend nights and nights before holidays', () => {
    expect(isWeekendNight(new Date(2026, 10, 13))).toBe(true); // Fri
    expect(isWeekendNight(new Date(2026, 10, 10))).toBe(false); // Tue
    expect(isWeekendNight(new Date(2026, 11, 24))).toBe(true); // Thu before Christmas Day
  });

  it('runs U-Bahn all night on weekends, pauses on weekdays', () => {
    expect(berlinServiceStatus(u8, at(2026, 11, 14, 3)).state).toBe('running'); // Sat 03:00
    const tue = berlinServiceStatus(u8, at(2026, 11, 11, 2)); // Wed 02:00 (Tue night)
    expect(tue).toMatchObject({ state: 'paused', hint: 'Ersatz: Nachtbus N8' });
    expect(berlinServiceStatus(u8, at(2026, 11, 10, 23)).state).toBe('running');
    expect(berlinServiceStatus({ mode: 'subway', ref: 'U4' }, at(2026, 11, 14, 3)).state).toBe('paused');
  });

  it('runs N1–N9 only when the U-Bahn pauses', () => {
    const n8 = { mode: 'bus', ref: 'N8' };
    expect(berlinServiceStatus(n8, at(2026, 11, 11, 2))).toMatchObject({ state: 'running', hint: 'ersetzt U8' });
    expect(berlinServiceStatus(n8, at(2026, 11, 14, 2)).state).toBe('paused');
    expect(berlinServiceStatus({ mode: 'bus', ref: 'N40' }, at(2026, 11, 14, 2)).state).toBe('running');
    expect(berlinServiceStatus({ mode: 'bus', ref: 'N40' }, at(2026, 11, 13, 22)).state).toBe('paused');
  });

  it('runs MetroTram around the clock', () => {
    expect(berlinServiceStatus({ mode: 'tram', ref: 'M10' }, at(2026, 11, 11, 3)).state).toBe('running');
  });

  it('summarises the night network', () => {
    expect(berlinNightSummary(at(2026, 11, 14, 2)).title).toBe('Wochenendnacht');
    expect(berlinNightSummary(at(2026, 11, 11, 2)).title).toBe('Nacht unter der Woche');
  });

  it('labels Kieze', () => {
    expect(kiezOf({ lat: 52.4993, lon: 13.4185 })).toBe('Kreuzberg');
    expect(kiezOf({ lat: 52.4872, lon: 13.4322 })).toBe('Neukölln');
    expect(kiezOf({ lat: 52.5, lon: 13.4 }, { 'addr:suburb': 'Mitte' })).toBe('Mitte');
    expect(kiezOf({ lat: 48.13, lon: 11.58 })).toBeUndefined();
  });

  it('adds the Berlin network to the query inside Berlin only', () => {
    const berlin = buildQuery({ south: 52.49, west: 13.4, north: 52.51, east: 13.43 }, ['transit']);
    expect(berlin).toContain('"route"="subway"');
    expect(berlin).toContain('out geom(');
    const munich = buildQuery({ south: 48.1, west: 11.5, north: 48.2, east: 11.6 }, ['transit']);
    expect(munich).not.toContain('"route"="subway"');
  });

  it('shows clubs without opening hours by default', () => {
    const club = place({ amenity: 'nightclub', name: 'Ohne Zeiten' });
    const r = filterPlaces([club], DEFAULT_FILTERS, at(2026, 11, 14, 2), club);
    expect(r).toHaveLength(1);
    expect(filterPlaces([club], { ...DEFAULT_FILTERS, unknownCategories: [] }, NOW, club)).toHaveLength(0);
  });
});

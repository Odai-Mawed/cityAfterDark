import { classify } from './categories';
import type { LatLon, Place, Tags, TransitLine } from './types';

/**
 * Fictional demo data, used when the live OpenStreetMap data can't be
 * reached (offline, Overpass overloaded) or for screenshots/tests.
 * All names are invented and clearly marked as demo.
 */

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const TEMPLATES: { tags: Tags; names: string[]; hours: string[] }[] = [
  {
    tags: { amenity: 'nightclub' },
    names: ['Mondschein', 'Kellerwerk', 'Nachtfalter', 'Bassgarten', 'Zirkel', 'Halle 9', 'Neonwald'],
    hours: ['Fr,Sa 23:00-08:00', 'Th-Sa 23:00-06:00', 'Fr 23:00-Su 12:00', 'We,Fr,Sa 22:00-05:00'],
  },
  {
    tags: { amenity: 'bar', smoking: 'yes' },
    names: ['Eule', 'Blaue Stunde', 'Zum Laternchen', 'Rauschgold', 'Tresen 12', 'Fuchsbau'],
    hours: ['Mo-Su 19:00-03:00', 'Tu-Sa 20:00-04:00', 'Mo-Th 18:00-01:00; Fr,Sa 18:00-05:00'],
  },
  {
    tags: { amenity: 'bar', bar: 'cocktail', 'payment:cards': 'yes', outdoor_seating: 'yes' },
    names: ['Copper & Lime', 'Sternbild', 'Velvet Ecke', 'Hinterhof Bar'],
    hours: ['Tu-Sa 19:00-03:00', 'Mo-Su 18:00-02:00'],
  },
  {
    tags: { amenity: 'pub', live_music: 'yes' },
    names: ['Alte Schmiede', 'Zur Ecke', 'Kiezklause', 'Hafenkneipe'],
    hours: ['Mo-Su 16:00-02:00', 'Mo-Sa 17:00-03:00; Su 15:00-24:00'],
  },
  {
    tags: { shop: 'convenience' },
    names: ['Späti am Platz', 'Spätkauf 24', 'Späti Sonnenallee', 'Kiosk Mitternacht', 'Späti Ecke'],
    hours: ['24/7', 'Mo-Su 08:00-04:00', 'Mo-Th 10:00-02:00; Fr,Sa 10:00-06:00; Su 12:00-24:00'],
  },
  {
    tags: { amenity: 'fast_food', cuisine: 'kebab', 'diet:vegan': 'yes' },
    names: ['Döner Nachtwache', 'Grill Mitte', 'Kebab Express', 'Falafel Freund'],
    hours: ['Mo-Su 11:00-05:00', 'Mo-Th 11:00-02:00; Fr,Sa 11:00-06:00'],
  },
  {
    tags: { amenity: 'fast_food', cuisine: 'pizza' },
    names: ['Pizza Notte', 'Slice Night'],
    hours: ['Mo-Su 17:00-04:00'],
  },
  {
    tags: { amenity: 'cinema', wheelchair: 'yes' },
    names: ['Lichtspiele Demo', 'Kino Nachtschicht'],
    hours: ['Mo-Su 14:00-01:30'],
  },
  {
    tags: { amenity: 'fuel', shop: 'yes' },
    names: ['Tankstelle Nord', 'Tankstelle Ring'],
    hours: ['24/7'],
  },
  {
    tags: { amenity: 'pharmacy' },
    names: ['Stern-Apotheke'],
    hours: ['Mo-Fr 08:00-20:00; Sa 09:00-16:00'],
  },
];

const STREETS = ['Demostraße', 'Nachtallee', 'Mondweg', 'Sternplatz', 'Laternengasse', 'Uferstraße'];

export function generateDemo(center: LatLon, seed = 42): { places: Place[]; lines: TransitLine[] } {
  const rand = rng(seed);
  const places: Place[] = [];
  let i = 0;
  for (const t of TEMPLATES) {
    for (const name of t.names) {
      const tags: Tags = {
        ...t.tags,
        name,
        opening_hours: t.hours[Math.floor(rand() * t.hours.length)],
        'addr:street': STREETS[Math.floor(rand() * STREETS.length)],
        'addr:housenumber': String(1 + Math.floor(rand() * 120)),
      };
      if (rand() > 0.7) tags.wheelchair = 'yes';
      if (rand() > 0.75) tags.lgbtq = 'welcome';
      const cls = classify(tags);
      if (!cls) continue;
      const r = 0.002 + rand() * 0.016;
      const a = rand() * Math.PI * 2;
      places.push({
        id: `demo/${i++}`,
        lat: center.lat + Math.sin(a) * r,
        lon: center.lon + (Math.cos(a) * r) / Math.cos((center.lat * Math.PI) / 180),
        name,
        category: cls.category,
        kind: cls.kind,
        tags,
        demo: true,
      });
    }
  }
  // a couple of Spätis without opening hours
  for (let k = 0; k < 3; k++) {
    const tags: Tags = { shop: 'kiosk', name: `Kiosk Demo ${k + 1}` };
    places.push({
      id: `demo/${i++}`,
      lat: center.lat + (rand() - 0.5) * 0.02,
      lon: center.lon + (rand() - 0.5) * 0.03,
      name: tags.name,
      category: 'spaeti',
      kind: 'Kiosk',
      tags,
      demo: true,
    });
  }

  const mkLine = (ref: string, angle: number, color: string): TransitLine => {
    const coords: [number, number][] = [];
    for (let s = -6; s <= 6; s++) {
      const d = s * 0.003;
      coords.push([center.lat + Math.sin(angle) * d + Math.sin(s) * 0.0006, center.lon + Math.cos(angle) * d * 1.6]);
    }
    return {
      id: `bus:${ref}`,
      ref,
      name: `Nachtbus ${ref}: Demo-Nord ⇄ Demo-Süd`,
      mode: 'bus',
      modeLabel: 'Nachtbus',
      color,
      from: 'Demo-Nord',
      to: 'Demo-Süd',
      operator: 'Demo-Verkehrsbetriebe',
      coords: [coords],
      stops: coords.filter((_, j) => j % 3 === 0).map((c, j) => ({ lat: c[0], lon: c[1], name: `Haltestelle ${ref}-${j + 1}` })),
      center,
      osmIds: [],
      demo: true,
    };
  };

  return { places, lines: [mkLine('N1', 0.4, '#ffe066'), mkLine('N7', 2.1, '#ffb703')] };
}

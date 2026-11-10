import type { CategoryId, Tags } from './types';

export interface CategoryDef {
  id: CategoryId;
  label: string;
  emoji: string;
  color: string;
  description: string;
  /** Overpass selectors without bbox, e.g. `nwr["amenity"="bar"]`. */
  selectors: string[];
  /** Returns a sub type label if the tags belong to this category. */
  match?: (tags: Tags) => string | null;
}

const CUISINE_LABELS: Record<string, string> = {
  kebab: 'Döner',
  doner: 'Döner',
  pizza: 'Pizza',
  burger: 'Burger',
  falafel: 'Falafel',
  sushi: 'Sushi',
  asian: 'Asiatisch',
  vietnamese: 'Vietnamesisch',
  thai: 'Thai',
  chinese: 'Chinesisch',
  indian: 'Indisch',
  turkish: 'Türkisch',
  arab: 'Arabisch',
  lebanese: 'Libanesisch',
  italian: 'Italienisch',
  sausage: 'Currywurst',
  currywurst: 'Currywurst',
  chicken: 'Chicken',
  sandwich: 'Sandwiches',
  mexican: 'Mexikanisch',
  noodle: 'Nudeln',
  ramen: 'Ramen',
};

function cuisineLabel(tags: Tags): string | null {
  const cuisine = tags.cuisine?.split(';')[0]?.trim().toLowerCase();
  return cuisine ? CUISINE_LABELS[cuisine] ?? null : null;
}

const SPAETI_NAME = /sp[äa]ti|sp[äa]tkauf|sp[äa]tshop|sp[äa]tverkauf|trinkhalle|büdchen|wasserhäuschen/i;

export const CATEGORIES: CategoryDef[] = [
  {
    id: 'club',
    label: 'Clubs',
    emoji: '🪩',
    color: '#d65cff',
    description: 'Clubs, Diskos und Live-Musik',
    selectors: ['nwr["amenity"="nightclub"]', 'nwr["amenity"="music_venue"]'],
    match: (t) => {
      if (t.amenity === 'nightclub') return 'Club';
      if (t.amenity === 'music_venue') return 'Live-Musik';
      return null;
    },
  },
  {
    id: 'bar',
    label: 'Bars & Kneipen',
    emoji: '🍸',
    color: '#ffb347',
    description: 'Bars, Kneipen und Biergärten',
    selectors: ['nwr["amenity"~"^(bar|pub|biergarten)$"]'],
    match: (t) => {
      if (t.amenity === 'bar') return t.bar === 'cocktail' || t.cocktails === 'yes' ? 'Cocktailbar' : 'Bar';
      if (t.amenity === 'pub') return 'Kneipe';
      if (t.amenity === 'biergarten') return 'Biergarten';
      return null;
    },
  },
  {
    id: 'spaeti',
    label: 'Spätis',
    emoji: '🍺',
    color: '#4dd0e1',
    description: 'Spätis, Kioske und Spätkäufe',
    selectors: ['nwr["shop"~"^(convenience|kiosk)$"]'],
    match: (t) => {
      if (t.shop !== 'convenience' && t.shop !== 'kiosk') return null;
      if (SPAETI_NAME.test(t.name ?? '')) return 'Späti';
      return t.shop === 'kiosk' ? 'Kiosk' : 'Spätkauf';
    },
  },
  {
    id: 'food',
    label: 'Spätes Essen',
    emoji: '🌯',
    color: '#ff7f50',
    description: 'Imbisse und Restaurants mit Öffnungszeiten',
    selectors: [
      'nwr["amenity"="fast_food"]["opening_hours"]',
      'nwr["amenity"="restaurant"]["opening_hours"]',
    ],
    match: (t) => {
      if (t.amenity === 'fast_food') return cuisineLabel(t) ?? 'Imbiss';
      if (t.amenity === 'restaurant') return cuisineLabel(t) ?? 'Restaurant';
      return null;
    },
  },
  {
    id: 'culture',
    label: 'Kultur & Spiel',
    emoji: '🎬',
    color: '#7c9cff',
    description: 'Kinos, Theater, Bowling, Casinos',
    selectors: [
      'nwr["amenity"~"^(cinema|theatre|casino|arts_centre)$"]',
      'nwr["leisure"~"^(bowling_alley|escape_game)$"]',
    ],
    match: (t) => {
      switch (t.amenity) {
        case 'cinema':
          return 'Kino';
        case 'theatre':
          return 'Theater';
        case 'casino':
          return 'Casino';
        case 'arts_centre':
          return 'Kulturzentrum';
      }
      if (t.leisure === 'bowling_alley') return 'Bowling';
      if (t.leisure === 'escape_game') return 'Escape Room';
      return null;
    },
  },
  {
    id: 'essentials',
    label: 'Versorgung',
    emoji: '⛽',
    color: '#7ee081',
    description: 'Tankstellen, Apotheken, Supermärkte',
    selectors: [
      'nwr["amenity"="fuel"]',
      'nwr["amenity"="pharmacy"]',
      'nwr["shop"="supermarket"]["opening_hours"]',
    ],
    match: (t) => {
      if (t.amenity === 'fuel') return 'Tankstelle';
      if (t.amenity === 'pharmacy') return 'Apotheke';
      if (t.shop === 'supermarket') return 'Supermarkt';
      return null;
    },
  },
  {
    id: 'transit',
    label: 'Nachtverkehr',
    emoji: '🌙',
    color: '#ffe066',
    description: 'Nachtbusse, Nacht-Trams und Nachtzüge',
    selectors: [],
  },
];

export const CATEGORY_BY_ID: Record<CategoryId, CategoryDef> = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c]),
) as Record<CategoryId, CategoryDef>;

export const PLACE_CATEGORIES = CATEGORIES.filter((c) => c.id !== 'transit');

/** Finds the first category (in display order) matching the tags. */
export function classify(tags: Tags, allowed?: CategoryId[]): { category: CategoryId; kind: string } | null {
  for (const cat of PLACE_CATEGORIES) {
    if (allowed && !allowed.includes(cat.id)) continue;
    const kind = cat.match?.(tags);
    if (kind) return { category: cat.id, kind };
  }
  return null;
}

export const TRANSIT_MODE_LABELS: Record<string, string> = {
  bus: 'Nachtbus',
  trolleybus: 'Nacht-O-Bus',
  tram: 'Nacht-Tram',
  subway: 'U-Bahn (Nacht)',
  light_rail: 'S-Bahn (Nacht)',
  train: 'Nachtzug',
  ferry: 'Nachtfähre',
};

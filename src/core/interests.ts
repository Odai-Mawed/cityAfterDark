import type { Tags } from './types';

export type InterestId =
  | 'live_music'
  | 'outdoor'
  | 'smoking'
  | 'wheelchair'
  | 'cards'
  | 'vegan'
  | 'lgbtq'
  | 'cocktails'
  | 'dance'
  | 'open_24_7';

export interface InterestDef {
  id: InterestId;
  label: string;
  emoji: string;
  test: (tags: Tags) => boolean;
}

const yes = (v?: string) => v === 'yes' || v === 'only';

export const INTERESTS: InterestDef[] = [
  {
    id: 'live_music',
    label: 'Live-Musik',
    emoji: '🎸',
    test: (t) => yes(t.live_music) || t.amenity === 'music_venue',
  },
  {
    id: 'dance',
    label: 'Tanzen',
    emoji: '💃',
    test: (t) => t.amenity === 'nightclub' || yes(t.dance) || yes(t['dance:venue']),
  },
  {
    id: 'cocktails',
    label: 'Cocktails',
    emoji: '🍹',
    test: (t) => t.bar === 'cocktail' || yes(t.cocktails) || /cocktail/i.test(t.drink ?? ''),
  },
  {
    id: 'outdoor',
    label: 'Draußen sitzen',
    emoji: '🌳',
    test: (t) => yes(t.outdoor_seating) || t.amenity === 'biergarten' || yes(t.beer_garden),
  },
  {
    id: 'smoking',
    label: 'Raucher',
    emoji: '🚬',
    test: (t) => ['yes', 'separated', 'isolated', 'outside', 'dedicated'].includes(t.smoking ?? ''),
  },
  {
    id: 'wheelchair',
    label: 'Barrierefrei',
    emoji: '♿',
    test: (t) => t.wheelchair === 'yes' || t.wheelchair === 'designated',
  },
  {
    id: 'cards',
    label: 'Kartenzahlung',
    emoji: '💳',
    test: (t) =>
      yes(t['payment:cards']) ||
      yes(t['payment:debit_cards']) ||
      yes(t['payment:credit_cards']) ||
      yes(t['payment:girocard']) ||
      yes(t['payment:contactless']),
  },
  {
    id: 'vegan',
    label: 'Vegan',
    emoji: '🌱',
    test: (t) => yes(t['diet:vegan']) || t['diet:vegan'] === 'limited',
  },
  {
    id: 'lgbtq',
    label: 'LGBTQ+',
    emoji: '🏳️‍🌈',
    test: (t) => ['welcome', 'primary', 'only', 'yes'].includes(t.lgbtq ?? '') || yes(t.gay),
  },
  {
    id: 'open_24_7',
    label: 'Rund um die Uhr',
    emoji: '🔁',
    test: (t) => (t.opening_hours ?? '').trim() === '24/7',
  },
];

export const INTEREST_BY_ID: Record<InterestId, InterestDef> = Object.fromEntries(
  INTERESTS.map((i) => [i.id, i]),
) as Record<InterestId, InterestDef>;

export function matchingInterests(tags: Tags): InterestDef[] {
  return INTERESTS.filter((i) => i.test(tags));
}

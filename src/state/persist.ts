import AsyncStorage from '@react-native-async-storage/async-storage';
import { CATEGORY_BY_ID } from '../core/categories';
import { DEFAULT_FILTERS, type Filters } from '../core/filter';
import { INTEREST_BY_ID } from '../core/interests';

const KEY = 'cityafterdark/v1';

export interface Saved {
  filters: Filters;
  view?: { lat: number; lon: number; zoom: number };
}

export async function loadSaved(): Promise<Saved | null> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as Partial<Saved>;
    const f = { ...DEFAULT_FILTERS, ...(s.filters ?? {}) };
    // drop ids that no longer exist after updates
    f.categories = f.categories.filter((c) => c in CATEGORY_BY_ID);
    f.interests = f.interests.filter((i) => i in INTEREST_BY_ID);
    f.query = '';
    const v = s.view;
    const view = v && Number.isFinite(v.lat) && Number.isFinite(v.lon) && Number.isFinite(v.zoom) ? v : undefined;
    return { filters: f, view };
  } catch {
    return null;
  }
}

let timer: ReturnType<typeof setTimeout> | null = null;
export function save(s: Saved) {
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => {
    AsyncStorage.setItem(KEY, JSON.stringify({ ...s, filters: { ...s.filters, query: '' } })).catch(() => undefined);
  }, 500);
}

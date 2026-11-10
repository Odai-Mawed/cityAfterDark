import type { BBox, LatLon } from './types';
import type { HoursRegion } from './hours';

const NOMINATIM = 'https://nominatim.openstreetmap.org';
// Nominatim's usage policy asks for an identifying user agent (browsers send
// their own and a Referer, native apps send this).
const HEADERS = { 'Accept-Language': 'de', 'User-Agent': 'CityAfterDark/1.0 (nightlife map app)' };

export interface GeoResult extends LatLon {
  label: string;
  detail: string;
  bbox?: BBox;
  address?: HoursRegion['address'];
}

export interface City extends LatLon {
  name: string;
  zoom: number;
  address: HoursRegion['address'];
}

export const CITIES: City[] = [
  { name: 'Berlin', lat: 52.5145, lon: 13.4235, zoom: 14, address: { country_code: 'de', state: 'Berlin', 'ISO3166-2-lvl4': 'DE-BE' } },
  { name: 'Hamburg', lat: 53.5511, lon: 9.9667, zoom: 14, address: { country_code: 'de', state: 'Hamburg', 'ISO3166-2-lvl4': 'DE-HH' } },
  { name: 'München', lat: 48.1351, lon: 11.582, zoom: 14, address: { country_code: 'de', state: 'Bayern', 'ISO3166-2-lvl4': 'DE-BY' } },
  { name: 'Köln', lat: 50.9375, lon: 6.9453, zoom: 14, address: { country_code: 'de', state: 'Nordrhein-Westfalen', 'ISO3166-2-lvl4': 'DE-NW' } },
  { name: 'Frankfurt', lat: 50.1109, lon: 8.6821, zoom: 14, address: { country_code: 'de', state: 'Hessen', 'ISO3166-2-lvl4': 'DE-HE' } },
  { name: 'Leipzig', lat: 51.3397, lon: 12.3731, zoom: 14, address: { country_code: 'de', state: 'Sachsen', 'ISO3166-2-lvl4': 'DE-SN' } },
  { name: 'Wien', lat: 48.2082, lon: 16.3719, zoom: 14, address: { country_code: 'at', state: 'Wien' } },
  { name: 'Zürich', lat: 47.3769, lon: 8.5417, zoom: 14, address: { country_code: 'ch', state: 'Zürich' } },
];

interface NominatimItem {
  lat: string;
  lon: string;
  name?: string;
  display_name: string;
  boundingbox?: [string, string, string, string];
  address?: Record<string, string>;
}

function toAddress(a?: Record<string, string>): HoursRegion['address'] | undefined {
  if (!a?.country_code) return undefined;
  return { ...a, country_code: a.country_code, state: a.state };
}

export async function searchPlaces(query: string, signal?: AbortSignal): Promise<GeoResult[]> {
  const url = `${NOMINATIM}/search?format=jsonv2&addressdetails=1&limit=6&q=${encodeURIComponent(query)}`;
  const res = await fetch(url, { headers: HEADERS, signal });
  if (!res.ok) throw new Error(`Suche fehlgeschlagen (${res.status})`);
  const items = (await res.json()) as NominatimItem[];
  return items.map((i) => {
    const [south, north, west, east] = (i.boundingbox ?? []).map(Number);
    const parts = i.display_name.split(',').map((s) => s.trim());
    return {
      lat: Number(i.lat),
      lon: Number(i.lon),
      label: i.name || parts[0],
      detail: parts.slice(1, 4).join(', '),
      bbox: i.boundingbox ? { south, north, west, east } : undefined,
      address: toAddress(i.address),
    };
  });
}

/** Looks up country/state for holiday handling in opening hours. */
export async function reverseRegion(p: LatLon, signal?: AbortSignal): Promise<HoursRegion | null> {
  const url = `${NOMINATIM}/reverse?format=jsonv2&zoom=8&addressdetails=1&lat=${p.lat}&lon=${p.lon}`;
  const res = await fetch(url, { headers: HEADERS, signal });
  if (!res.ok) return null;
  const item = (await res.json()) as NominatimItem;
  const address = toAddress(item.address);
  return address ? { lat: p.lat, lon: p.lon, address } : null;
}

import type { BBox, LatLon, OpenState, Region } from '../core/types';

export interface MapMarker extends LatLon {
  id: string;
  name: string;
  emoji: string;
  color: string;
  state: OpenState;
}

export interface MapLine {
  id: string;
  label: string;
  ref: string;
  color: string;
  coords: [number, number][][];
  stops: { lat: number; lon: number; name?: string }[];
  /** Not running at the selected time. */
  dim?: boolean;
}

/** React → map */
export type ToMap =
  | { type: 'setData'; markers: MapMarker[]; lines: MapLine[] }
  | { type: 'select'; id: string | null; pan?: boolean }
  | { type: 'flyTo'; lat: number; lon: number; zoom?: number }
  | { type: 'fitBounds'; bbox: BBox }
  | { type: 'user'; lat: number; lon: number }
  | { type: 'invalidate' };

/** map → React */
export type FromMap =
  | { type: 'ready' }
  | ({ type: 'region' } & Region)
  | { type: 'select'; id: string | null };

export function parseFromMap(raw: unknown): FromMap | null {
  if (typeof raw !== 'string') return null;
  try {
    const msg = JSON.parse(raw) as FromMap;
    return msg && typeof msg.type === 'string' ? msg : null;
  } catch {
    return null;
  }
}

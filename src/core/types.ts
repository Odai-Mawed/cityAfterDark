export type CategoryId =
  | 'club'
  | 'bar'
  | 'spaeti'
  | 'food'
  | 'culture'
  | 'essentials'
  | 'transit';

export type Tags = Record<string, string>;

export interface BBox {
  south: number;
  west: number;
  north: number;
  east: number;
}

export interface LatLon {
  lat: number;
  lon: number;
}

export interface Region {
  bbox: BBox;
  center: LatLon;
  zoom: number;
}

/** A point of interest (club, bar, Späti, …) from OpenStreetMap. */
export interface Place {
  /** e.g. "node/123" */
  id: string;
  lat: number;
  lon: number;
  name: string;
  category: CategoryId;
  /** Human readable sub type, e.g. "Kneipe", "Döner", "Tankstelle". */
  kind: string;
  tags: Tags;
  demo?: boolean;
  /** Short description for curated Berlin venues ("Berliner Institution"). */
  highlight?: string;
}

export interface TransitStop extends LatLon {
  name?: string;
}

/** A night transport line (Nachtbus, Nacht-Tram, …). */
export interface TransitLine {
  /** e.g. "bus:N5" */
  id: string;
  ref: string;
  name: string;
  mode: string;
  modeLabel: string;
  color?: string;
  from?: string;
  to?: string;
  operator?: string;
  /** Polyline segments. */
  coords: [number, number][][];
  stops: TransitStop[];
  center: LatLon;
  osmIds: string[];
  demo?: boolean;
}

export type OpenState = 'open' | 'closed' | 'unknown';

export interface OpenStatus {
  state: OpenState;
  /** Short label, e.g. "Geöffnet · bis 05:00". */
  label: string;
  nextChange?: Date;
  comment?: string;
}

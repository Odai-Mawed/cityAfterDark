import type { BBox, LatLon } from './types';

const R = 6371000;
const rad = (d: number) => (d * Math.PI) / 180;

/** Haversine distance in meters. */
export function distance(a: LatLon, b: LatLon): number {
  const dLat = rad(b.lat - a.lat);
  const dLon = rad(b.lon - a.lon);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function formatDistance(m: number): string {
  if (m < 1000) return `${Math.round(m / 10) * 10} m`;
  return `${(m / 1000).toFixed(m < 10000 ? 1 : 0).replace('.', ',')} km`;
}

/** Approximate walking time at 4.8 km/h. */
export function walkingMinutes(m: number): number {
  return Math.max(1, Math.round(m / 80));
}

export function padBBox(b: BBox, factor: number): BBox {
  const dLat = (b.north - b.south) * factor;
  const dLon = (b.east - b.west) * factor;
  return { south: b.south - dLat, west: b.west - dLon, north: b.north + dLat, east: b.east + dLon };
}

export function containsBBox(outer: BBox, inner: BBox): boolean {
  return (
    outer.south <= inner.south && outer.west <= inner.west && outer.north >= inner.north && outer.east >= inner.east
  );
}

export function inBBox(b: BBox, p: LatLon): boolean {
  return p.lat >= b.south && p.lat <= b.north && p.lon >= b.west && p.lon <= b.east;
}

/** Shrinks a bbox around its center so neither side exceeds `maxDeg` degrees. */
export function clampBBox(b: BBox, maxDeg: number): BBox {
  const cLat = (b.north + b.south) / 2;
  const cLon = (b.east + b.west) / 2;
  const hLat = Math.min((b.north - b.south) / 2, maxDeg / 2);
  const hLon = Math.min((b.east - b.west) / 2, maxDeg / 2);
  return { south: cLat - hLat, west: cLon - hLon, north: cLat + hLat, east: cLon + hLon };
}

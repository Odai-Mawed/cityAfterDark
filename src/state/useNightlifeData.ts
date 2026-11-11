import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import { BERLIN_BBOX, isInBerlin } from '../core/berlin';
import { CATEGORIES, classify } from '../core/categories';
import { isSnapshot } from '../core/clean';
import { generateDemo } from '../core/demo';
import { BERLIN_FUEL } from '../data/berlinFuel';
import { HIGHLIGHT_BY_ID, highlightPlaces } from '../data/berlinHighlights';
import { clampBBox, containsBBox, distance, padBBox } from '../core/geo';
import { fetchNightlife } from '../core/overpass';
import type { BBox, CategoryId, LatLon, Place, Region, TransitLine } from '../core/types';

export const MIN_ZOOM = 13;

/** Real Berlin data bundled with the app: curated tips + fuel stations. */
function berlinBaseline(): Place[] {
  return [...highlightPlaces(classify), ...BERLIN_FUEL];
}
const MAX_BBOX_DEG = 0.22;

/**
 * Daily cleaned Berlin snapshot (scripts/build-berlin-data.ts), served next to
 * the web app. Native apps load it from the deployed site.
 */
const SNAPSHOT_URL =
  process.env.EXPO_PUBLIC_DATA_URL ??
  (Platform.OS === 'web' ? 'data/berlin.json' : 'https://cityafterdark.netlify.app/data/berlin.json');
/** Older snapshots are ignored – then live data from Overpass is used. */
const SNAPSHOT_MAX_AGE_DAYS = 7;
type SnapshotState = 'idle' | 'loading' | 'done' | 'failed';
const DEBOUNCE_MS = 700;
const PRUNE_KM = 40;

export type LoadStatus = 'idle' | 'loading' | 'zoom' | 'error';

interface LoadedArea {
  bbox: BBox;
  categories: Set<CategoryId>;
}

export interface NightlifeData {
  places: Place[];
  lines: TransitLine[];
  status: LoadStatus;
  error: string | null;
  demo: boolean;
  /** Offline mode shows the curated real Berlin venues instead of fictional demo data. */
  curated: boolean;
  /** Timestamp of the Berlin snapshot in use, if any. */
  snapshotDate: Date | null;
  setDemo: (on: boolean) => void;
  retry: () => void;
}

export function useNightlifeData(region: Region | null, categories: CategoryId[]): NightlifeData {
  const places = useRef(new Map<string, Place>());
  const lines = useRef(new Map<string, TransitLine>());
  const loaded = useRef<LoadedArea[]>([]);
  const [version, setVersion] = useState(0);
  const [status, setStatus] = useState<LoadStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [demo, setDemoState] = useState(false);
  const [retryNonce, setRetryNonce] = useState(0);
  const demoCenter = useRef<LatLon | null>(null);

  const catsKey = [...categories].sort().join(',');
  const inBerlinView = !!region && isInBerlin(region.center);
  const [snapState, setSnapState] = useState<SnapshotState>('idle');
  const [snapshotDate, setSnapshotDate] = useState<Date | null>(null);

  // Inside Berlin: load the prepared snapshot once. It covers all categories
  // for the whole city, so no Overpass request is needed there.
  useEffect(() => {
    if (!inBerlinView || snapState !== 'idle') return;
    setSnapState('loading');
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 20000);
    fetch(SNAPSHOT_URL, { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then((snap: unknown) => {
        if (!isSnapshot(snap)) throw new Error('Unbekanntes Format');
        const generated = new Date(snap.generated);
        if (Date.now() - generated.getTime() > SNAPSHOT_MAX_AGE_DAYS * 86400000) throw new Error('Veraltet');
        for (const p of snap.places) places.current.set(p.id, p);
        for (const l of snap.lines) lines.current.set(l.id, l);
        loaded.current.push({ bbox: BERLIN_BBOX, categories: new Set(CATEGORIES.map((c) => c.id)) });
        setSnapshotDate(generated);
        setSnapState('done');
        setError(null);
        setStatus('idle');
        setVersion((v) => v + 1);
      })
      .catch(() => setSnapState('failed'))
      .finally(() => clearTimeout(timer));
  }, [inBerlinView, snapState]);

  useEffect(() => {
    if (!region || demo) return;
    // wait for the Berlin snapshot before asking Overpass
    if (inBerlinView && (snapState === 'idle' || snapState === 'loading')) return;
    if (region.zoom < MIN_ZOOM) {
      setStatus('zoom');
      return;
    }
    const view = region.bbox;
    const missing = categories.filter(
      (c) => !loaded.current.some((a) => a.categories.has(c) && containsBBox(a.bbox, view)),
    );
    if (!missing.length) {
      setStatus('idle');
      return;
    }
    const ctrl = new AbortController();
    const timer = setTimeout(async () => {
      setStatus('loading');
      const bbox = clampBBox(padBBox(view, 0.35), MAX_BBOX_DEG);
      try {
        const data = await fetchNightlife(bbox, missing, ctrl.signal);
        if (ctrl.signal.aborted) return;
        // forget far-away data so memory stays small while travelling
        for (const [id, p] of places.current) {
          if (distance(p, region.center) > PRUNE_KM * 1000) places.current.delete(id);
        }
        for (const [id, l] of lines.current) {
          if (distance(l.center, region.center) > PRUNE_KM * 1000) lines.current.delete(id);
        }
        loaded.current = loaded.current.filter(
          (a) => distance({ lat: a.bbox.north, lon: a.bbox.east }, region.center) < PRUNE_KM * 1000,
        );
        for (const p of data.places) places.current.set(p.id, p);
        for (const l of data.lines) {
          const prev = lines.current.get(l.id);
          // keep the variant with more geometry (bbox-cut routes can be partial)
          if (!prev || l.coords.length >= prev.coords.length) lines.current.set(l.id, l);
        }
        loaded.current.push({ bbox, categories: new Set(missing) });
        setError(null);
        setStatus('idle');
        setVersion((v) => v + 1);
      } catch (e) {
        if (ctrl.signal.aborted) return;
        setError(
          e instanceof TypeError
            ? 'Keine Verbindung zu OpenStreetMap (Overpass).'
            : `Live-Daten gerade nicht verfügbar${e instanceof Error && e.message ? ` (${e.message})` : ''}.`,
        );
        setStatus('error');
      }
    }, DEBOUNCE_MS);
    return () => {
      clearTimeout(timer);
      ctrl.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [region, catsKey, demo, retryNonce, snapState]);

  const setDemo = useCallback(
    (on: boolean) => {
      if (on) {
        demoCenter.current = region?.center ?? { lat: 52.5145, lon: 13.4235 };
        setStatus('idle');
        setError(null);
      }
      setDemoState(on);
      setVersion((v) => v + 1);
    },
    [region],
  );

  const retry = useCallback(() => setRetryNonce((n) => n + 1), []);

  const [snapshot, setSnapshot] = useState<{ places: Place[]; lines: TransitLine[] }>({ places: [], lines: [] });
  useEffect(() => {
    if (demo && demoCenter.current) {
      setSnapshot(isInBerlin(demoCenter.current) ? { places: berlinBaseline(), lines: [] } : generateDemo(demoCenter.current));
    } else {
      const live = [...places.current.values()].map((p) => {
        const h = HIGHLIGHT_BY_ID.get(p.id);
        return h ? { ...p, highlight: h.highlight, ra: h.ra } : p;
      });
      // In Berlin the curated real venues show up right away, before (or
      // without) a live answer from Overpass.
      const extra = inBerlinView ? berlinBaseline().filter((h) => !places.current.has(h.id)) : [];
      setSnapshot({ places: [...live, ...extra], lines: [...lines.current.values()] });
    }
  }, [version, demo, inBerlinView]);

  const curated = demo && !!demoCenter.current && isInBerlin(demoCenter.current);
  return {
    ...snapshot,
    status: demo ? 'idle' : status,
    error: demo ? null : error,
    demo,
    curated,
    snapshotDate: demo ? null : snapshotDate,
    setDemo,
    retry,
  };
}

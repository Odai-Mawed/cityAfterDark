import { useCallback, useEffect, useRef, useState } from 'react';
import { isInBerlin } from '../core/berlin';
import { classify } from '../core/categories';
import { generateDemo } from '../core/demo';
import { HIGHLIGHT_BY_ID, highlightPlaces } from '../data/berlinHighlights';
import { clampBBox, containsBBox, distance, padBBox } from '../core/geo';
import { fetchNightlife } from '../core/overpass';
import type { BBox, CategoryId, LatLon, Place, Region, TransitLine } from '../core/types';

export const MIN_ZOOM = 13;
const MAX_BBOX_DEG = 0.22;
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

  useEffect(() => {
    if (!region || demo) return;
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
  }, [region, catsKey, demo, retryNonce]);

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
      setSnapshot(isInBerlin(demoCenter.current) ? { places: highlightPlaces(classify), lines: [] } : generateDemo(demoCenter.current));
    } else {
      const live = [...places.current.values()].map((p) => {
        const h = HIGHLIGHT_BY_ID.get(p.id);
        return h ? { ...p, highlight: h.highlight, ra: h.ra } : p;
      });
      // In Berlin the curated real venues show up right away, before (or
      // without) a live answer from Overpass.
      const extra = inBerlinView ? highlightPlaces(classify).filter((h) => !places.current.has(h.id)) : [];
      setSnapshot({ places: [...live, ...extra], lines: [...lines.current.values()] });
    }
  }, [version, demo, inBerlinView]);

  const curated = demo && !!demoCenter.current && isInBerlin(demoCenter.current);
  return { ...snapshot, status: demo ? 'idle' : status, error: demo ? null : error, demo, curated, setDemo, retry };
}

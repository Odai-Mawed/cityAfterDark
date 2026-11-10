import { memo, useCallback, useEffect, useMemo, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import type { LatLon, Region } from '../core/types';
import { buildMapHtml, type MapInit } from './mapHtml';
import { MapSurface, type MapSurfaceHandle } from './MapSurface';
import { parseFromMap, type MapLine, type MapMarker, type ToMap } from './protocol';

export type MapCommand = (Extract<ToMap, { type: 'flyTo' }> | Extract<ToMap, { type: 'fitBounds' }>) & { nonce: number };

interface Props {
  initial: MapInit;
  markers: MapMarker[];
  lines: MapLine[];
  selectedId: string | null;
  /** Whether a selection should pan the map (false when it came from the map). */
  panToSelection: boolean;
  userLocation: LatLon | null;
  command: MapCommand | null;
  onRegion: (r: Region) => void;
  onSelect: (id: string | null) => void;
}

function NightMapImpl(p: Props) {
  const surface = useRef<MapSurfaceHandle>(null);
  const ready = useRef(false);
  const queue = useRef<string[]>([]);
  // The HTML must not change after mount, otherwise the map reloads.
  const html = useMemo(() => buildMapHtml(p.initial), []); // eslint-disable-line react-hooks/exhaustive-deps

  const post = useCallback((msg: ToMap) => {
    const json = JSON.stringify(msg);
    if (ready.current && surface.current) surface.current.post(json);
    else queue.current.push(json);
  }, []);

  const handlers = useRef({ onRegion: p.onRegion, onSelect: p.onSelect });
  handlers.current = { onRegion: p.onRegion, onSelect: p.onSelect };

  const onMessage = useCallback((raw: string) => {
    const msg = parseFromMap(raw);
    if (!msg) return;
    if (msg.type === 'ready') {
      ready.current = true;
      for (const json of queue.current.splice(0)) surface.current?.post(json);
    } else if (msg.type === 'region') {
      handlers.current.onRegion({ bbox: msg.bbox, center: msg.center, zoom: msg.zoom });
    } else if (msg.type === 'select') {
      handlers.current.onSelect(msg.id);
    }
  }, []);

  useEffect(() => {
    // keep only the latest data in the queue
    queue.current = queue.current.filter((j) => !j.startsWith('{"type":"setData"'));
    post({ type: 'setData', markers: p.markers, lines: p.lines });
  }, [p.markers, p.lines, post]);

  useEffect(() => {
    post({ type: 'select', id: p.selectedId, pan: p.panToSelection });
  }, [p.selectedId, p.panToSelection, post]);

  useEffect(() => {
    if (p.userLocation) post({ type: 'user', ...p.userLocation });
  }, [p.userLocation, post]);

  useEffect(() => {
    if (!p.command) return;
    const { nonce: _n, ...cmd } = p.command;
    post(cmd as ToMap);
  }, [p.command, post]);

  return (
    <View style={styles.wrap}>
      <MapSurface ref={surface} html={html} onMessage={onMessage} />
    </View>
  );
}

export const NightMap = memo(NightMapImpl);

const styles = StyleSheet.create({ wrap: { flex: 1, backgroundColor: '#0b0b14' } });

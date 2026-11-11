import { StatusBar } from 'expo-status-bar';
import * as Location from 'expo-location';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { isInBerlin } from './src/core/berlin';
import { BERLIN_HIGHLIGHTS_DATE } from './src/data/berlinHighlights';
import { CATEGORY_BY_ID } from './src/core/categories';
import { DEFAULT_FILTERS, filterLines, filterPlaces, type Filters } from './src/core/filter';
import { CITIES, reverseRegion, type City, type GeoResult } from './src/core/geocode';
import { distance, inBBox, padBBox } from './src/core/geo';
import { getHoursRegion, setHoursRegion } from './src/core/hours';
import { describeSelection, resolveTime, type TimeSelection } from './src/core/time';
import type { LatLon, Region } from './src/core/types';
import { NightMap, type MapCommand } from './src/map/NightMap';
import type { MapLine, MapMarker } from './src/map/protocol';
import { loadSaved, save, type Saved } from './src/state/persist';
import { MIN_ZOOM, useNightlifeData } from './src/state/useNightlifeData';
import { BerlinNightCard } from './src/ui/BerlinNightCard';
import { LineDetail, PlaceDetail } from './src/ui/Detail';
import { CategoryChips, FilterPanel } from './src/ui/FilterPanel';
import { ResultList, type ListItem } from './src/ui/ResultList';
import { SearchBar } from './src/ui/SearchBar';
import { colors, radius } from './src/ui/theme';

const WIDE_BREAKPOINT = 860;
const DEFAULT_VIEW = { lat: CITIES[0].lat, lon: CITIES[0].lon, zoom: CITIES[0].zoom };

function webParams(): URLSearchParams | null {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return null;
  return new URLSearchParams(window.location.search);
}

export default function App() {
  const [saved, setSaved] = useState<Saved | null | undefined>(undefined);
  useEffect(() => {
    loadSaved().then(setSaved);
  }, []);
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      {saved === undefined ? (
        <View style={[styles.root, styles.center]}>
          <ActivityIndicator color={colors.accent} />
        </View>
      ) : (
        <Main saved={saved} />
      )}
    </SafeAreaProvider>
  );
}

type Tab = 'list' | 'filter';
type SheetMode = 'min' | 'mid' | 'max';

function Main({ saved }: { saved: Saved | null }) {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const wide = width >= WIDE_BREAKPOINT;

  const params = useMemo(webParams, []);
  const initialView = useMemo(() => {
    const lat = Number(params?.get('lat'));
    const lon = Number(params?.get('lon'));
    const z = Number(params?.get('z'));
    if (lat && lon) return { lat, lon, zoom: z || 15 };
    return saved?.view ?? DEFAULT_VIEW;
  }, [params, saved]);

  const [filters, setFilters] = useState<Filters>(saved?.filters ?? DEFAULT_FILTERS);
  const [time, setTime] = useState<TimeSelection>({ live: true, nightOffset: 0, minutes: 0 });
  const [now, setNow] = useState(() => new Date());
  const [region, setRegion] = useState<Region | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [panToSelection, setPanToSelection] = useState(false);
  const [tab, setTab] = useState<Tab>('list');
  const [sheet, setSheet] = useState<SheetMode>('mid');
  const [command, setCommand] = useState<MapCommand | null>(null);
  const [user, setUser] = useState<LatLon | null>(null);
  const [locating, setLocating] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [, setHoursVersion] = useState(0);

  const data = useNightlifeData(region, filters.categories);
  const { setDemo } = data;

  useEffect(() => {
    // `?demo=1`, or a host page that can't reach OpenStreetMap (e.g. a sandboxed preview) sets __CAD_DEMO__
    const forced = Platform.OS === 'web' && (globalThis as { __CAD_DEMO__?: boolean }).__CAD_DEMO__;
    if (params?.get('demo') || forced) setDemo(true);
  }, [params, setDemo]);

  // live clock
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(t);
  }, []);

  const at = useMemo(() => resolveTime(time, now), [time, now]);
  const origin: LatLon = useMemo(
    () => (user && region && distance(user, region.center) < 5000 ? user : region?.center ?? initialView),
    [user, region, initialView],
  );

  // persist filters + view
  useEffect(() => {
    save({ filters, view: region ? { lat: region.center.lat, lon: region.center.lon, zoom: region.zoom } : saved?.view });
  }, [filters, region, saved]);

  // public holidays depend on country/state → look it up when moving far
  const lastLookup = useRef<LatLon | null>(null);
  useEffect(() => {
    if (!region || region.zoom < 9) return;
    if (lastLookup.current && distance(lastLookup.current, region.center) < 60000) return;
    const first = !lastLookup.current;
    lastLookup.current = region.center;
    if (first && distance(region.center, getHoursRegion()) < 60000) return;
    const ctrl = new AbortController();
    reverseRegion(region.center, ctrl.signal)
      .then((r) => {
        if (r) {
          setHoursRegion(r);
          setHoursVersion((v) => v + 1);
        }
      })
      .catch(() => undefined);
    return () => ctrl.abort();
  }, [region]);

  // Only what's around the visible map: keeps thousands of Berlin places fast.
  const viewBox = useMemo(() => (region ? padBBox(region.bbox, 0.5) : null), [region]);
  const visiblePlaces = useMemo(
    () => (viewBox ? data.places.filter((p) => inBBox(viewBox, p) || p.id === selectedId) : data.places),
    [data.places, viewBox, selectedId],
  );
  const results = useMemo(() => filterPlaces(visiblePlaces, filters, at, origin), [visiblePlaces, filters, at, origin]);
  const visibleLines = useMemo(
    () =>
      viewBox
        ? data.lines.filter(
            (l) => l.id === selectedId || l.coords.some((seg) => seg.some(([lat, lon]) => inBBox(viewBox, { lat, lon }))),
          )
        : data.lines,
    [data.lines, viewBox, selectedId],
  );
  const lines = useMemo(() => filterLines(visibleLines, filters, at, origin), [visibleLines, filters, at, origin]);
  const inBerlin = isInBerlin(region?.center ?? initialView);

  const items: ListItem[] = useMemo(() => {
    const list: ListItem[] = results.map((r) => ({ kind: 'place', r }));
    // night lines go after the open places, before unknown/closed ones
    const insertAt = results.findIndex((r) => r.status.state !== 'open');
    const lineItems: ListItem[] = lines.map((r) => ({ kind: 'line', r }));
    list.splice(insertAt === -1 ? list.length : insertAt, 0, ...lineItems);
    return list;
  }, [results, lines]);

  const markers: MapMarker[] = useMemo(
    () =>
      results.map(({ place, status }) => ({
        id: place.id,
        lat: place.lat,
        lon: place.lon,
        name: place.name,
        emoji: CATEGORY_BY_ID[place.category].emoji,
        color: CATEGORY_BY_ID[place.category].color,
        state: status.state,
      })),
    [results],
  );
  const mapLines: MapLine[] = useMemo(
    () =>
      lines.map(({ line: l, service }) => ({
        id: l.id,
        ref: l.ref,
        label: `${l.ref ? l.ref + ' · ' : ''}${l.modeLabel} · ${service.label}`,
        color: l.color ?? CATEGORY_BY_ID.transit.color,
        coords: l.coords,
        stops: l.stops,
        dim: service.state === 'paused',
      })),
    [lines],
  );

  const selectedPlace = selectedId ? data.places.find((p) => p.id === selectedId) : undefined;
  const selectedLine = selectedId && !selectedPlace ? data.lines.find((l) => l.id === selectedId) : undefined;

  const select = useCallback((id: string | null, fromMap: boolean) => {
    setSelectedId(id);
    setPanToSelection(!fromMap);
    if (id) setSheet((s) => (s === 'min' ? 'mid' : s));
  }, []);
  const onMapSelect = useCallback((id: string | null) => select(id, true), [select]);
  const onListSelect = useCallback((id: string) => select(id, false), [select]);

  const flyTo = (lat: number, lon: number, zoom?: number) => setCommand({ type: 'flyTo', lat, lon, zoom, nonce: Date.now() });

  const onPickCity = (c: City) => {
    setHoursRegion({ lat: c.lat, lon: c.lon, address: c.address });
    lastLookup.current = { lat: c.lat, lon: c.lon };
    setSelectedId(null);
    flyTo(c.lat, c.lon, c.zoom);
  };
  const onPickPlace = (r: GeoResult) => {
    if (r.address) {
      setHoursRegion({ lat: r.lat, lon: r.lon, address: r.address });
      lastLookup.current = { lat: r.lat, lon: r.lon };
    }
    setSelectedId(null);
    const b = r.bbox;
    if (b && b.north - b.south > 0.02) {
      // cities: show the center at a zoom where data loads
      flyTo(r.lat, r.lon, 14);
    } else {
      flyTo(r.lat, r.lon, 16);
    }
  };

  const onLocate = async () => {
    setLocating(true);
    setNotice(null);
    try {
      const perm = await Location.requestForegroundPermissionsAsync();
      if (perm.status !== 'granted') {
        setNotice('Standortfreigabe abgelehnt – du kannst stattdessen nach einer Stadt suchen.');
        return;
      }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const p = { lat: pos.coords.latitude, lon: pos.coords.longitude };
      setUser(p);
      flyTo(p.lat, p.lon, 15);
    } catch {
      setNotice('Standort konnte nicht bestimmt werden.');
    } finally {
      setLocating(false);
    }
  };

  const openCount = results.filter((r) => r.status.state === 'open').length;
  const summary = (
    <View style={styles.summary}>
      <Text style={styles.summaryText} numberOfLines={1}>
        <Text style={{ color: colors.open, fontWeight: '700' }}>{openCount}</Text> geöffnet
        {results.length > openCount ? ` · ${results.length - openCount} weitere` : ''}
        {lines.length ? ` · ${lines.length} ${lines.length === 1 ? 'Linie' : 'Linien'}` : ''}
      </Text>
      <Pressable onPress={() => setTab('filter')} hitSlop={6}>
        <Text style={styles.summaryTime}>🕑 {describeSelection(time, now)}</Text>
      </Pressable>
    </View>
  );

  const banner = <StatusBanner data={data} region={region} notice={notice} onDismissNotice={() => setNotice(null)} />;

  const emptyState =
    data.status === 'loading' ? (
      <Text style={styles.emptyText}>Lade das Nachtleben in diesem Gebiet …</Text>
    ) : data.status === 'zoom' ? (
      <Text style={styles.emptyText}>Zoome in die Karte hinein, um Orte zu sehen.</Text>
    ) : (
      <>
        <Text style={styles.emptyTitle}>Nichts gefunden 🌒</Text>
        <Text style={styles.emptyText}>
          Zu dieser Zeit ist mit deinen Filtern hier nichts geöffnet. Probier eine frühere Uhrzeit, mehr Kategorien oder
          „Ohne Öffnungszeiten zeigen“.
        </Text>
        <Pressable onPress={() => setTab('filter')}>
          <Text style={styles.link}>Filter anpassen →</Text>
        </Pressable>
      </>
    );

  const body = selectedPlace ? (
    <PlaceDetail place={selectedPlace} at={at} origin={origin} onClose={() => setSelectedId(null)} />
  ) : selectedLine ? (
    <LineDetail line={selectedLine} at={at} origin={origin} onClose={() => setSelectedId(null)} />
  ) : tab === 'list' ? (
    <ResultList
      items={items}
      selectedId={selectedId}
      onSelect={onListSelect}
      empty={emptyState}
      header={
        <>
          {data.snapshotDate ? (
            <Text style={styles.dataNote}>
              Daten: OpenStreetMap, aufbereitet {formatDataDate(data.snapshotDate, now)}
            </Text>
          ) : null}
          {inBerlin && filters.categories.includes('transit') ? <BerlinNightCard at={at} /> : null}
        </>
      }
    />
  ) : (
    <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 32 }}>
      <FilterPanel filters={filters} onChange={setFilters} time={time} now={now} onTime={setTime} />
    </ScrollView>
  );

  const tabs = !selectedPlace && !selectedLine && (
    <View style={styles.tabs}>
      {(['list', 'filter'] as Tab[]).map((t) => (
        <Pressable
          key={t}
          onPress={() => {
            setTab(t);
            if (!wide && sheet === 'min') setSheet('mid');
          }}
          style={[styles.tab, tab === t && styles.tabActive]}
          accessibilityRole="tab"
          accessibilityState={{ selected: tab === t }}
        >
          <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
            {t === 'list' ? `Liste (${items.length})` : `Filter${filters.interests.length ? ` · ${filters.interests.length}` : ''}`}
          </Text>
        </Pressable>
      ))}
    </View>
  );

  const categoryRow = (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catRow} keyboardShouldPersistTaps="handled">
      <CategoryChips filters={filters} onChange={setFilters} />
    </ScrollView>
  );

  const search = (
    <SearchBar
      query={filters.query}
      onQuery={(q) => setFilters((f) => ({ ...f, query: q }))}
      onPickCity={onPickCity}
      onPickPlace={onPickPlace}
      onPickKiez={(k) => {
        setSelectedId(null);
        flyTo(k.lat, k.lon, k.zoom);
      }}
      onLocate={onLocate}
      locating={locating}
    />
  );

  const map = (
    <NightMap
      initial={initialView}
      markers={markers}
      lines={mapLines}
      selectedId={selectedId}
      panToSelection={panToSelection}
      userLocation={user}
      command={command}
      onRegion={setRegion}
      onSelect={onMapSelect}
    />
  );

  if (wide) {
    return (
      <View style={[styles.root, styles.row]}>
        <View style={[styles.side, { paddingTop: insets.top + 14, paddingBottom: insets.bottom }]}>
          <Brand />
          {search}
          {categoryRow}
          {banner}
          {summary}
          {tabs}
          <View style={styles.body}>{body}</View>
        </View>
        <View style={styles.mapWrap}>{map}</View>
      </View>
    );
  }

  const sheetHeight = sheet === 'min' ? 178 + insets.bottom : sheet === 'mid' ? Math.round(height * 0.5) : Math.round(height * 0.86);
  return (
    <View style={styles.root}>
      <View style={[styles.mapWrap, { marginBottom: Math.min(sheetHeight, height * 0.5) - 16 }]}>{map}</View>
      <View style={[styles.sheet, { height: sheetHeight, paddingBottom: insets.bottom }]}>
        <Pressable
          onPress={() => setSheet((s) => (s === 'min' ? 'mid' : s === 'mid' ? 'max' : 'min'))}
          style={styles.handleArea}
          accessibilityRole="button"
          accessibilityLabel="Liste vergrößern oder verkleinern"
        >
          <View style={styles.handle} />
        </Pressable>
        {categoryRow}
        {banner}
        {summary}
        {sheet !== 'min' || selectedId ? (
          <>
            {tabs}
            <View style={styles.body}>{body}</View>
          </>
        ) : null}
      </View>
      {/* rendered last so the search dropdown overlays the sheet */}
      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]} pointerEvents="box-none">
        {search}
      </View>
    </View>
  );
}

function formatDataDate(d: Date, now: Date): string {
  const time = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')} Uhr`;
  const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
  if (d.toDateString() === now.toDateString()) return `heute, ${time}`;
  if (d.toDateString() === yesterday.toDateString()) return `gestern, ${time}`;
  return `am ${d.getDate()}.${d.getMonth() + 1}., ${time}`;
}

function Brand() {
  return (
    <View style={styles.brand}>
      <Text style={styles.brandTitle}>
        🌙 City<Text style={{ color: colors.accent }}>After</Text>Dark
      </Text>
      <Text style={styles.brandSub}>Das Nachtleben auf einer Karte</Text>
    </View>
  );
}

function StatusBanner({
  data,
  region,
  notice,
  onDismissNotice,
}: {
  data: ReturnType<typeof useNightlifeData>;
  region: Region | null;
  notice: string | null;
  onDismissNotice: () => void;
}) {
  if (notice) {
    return (
      <Pressable style={[styles.banner, { borderColor: colors.unknown }]} onPress={onDismissNotice}>
        <Text style={styles.bannerText}>{notice}</Text>
      </Pressable>
    );
  }
  if (data.demo && data.curated) {
    return (
      <View style={[styles.banner, { borderColor: colors.accent }]}>
        <Text style={[styles.bannerText, { flex: 1 }]}>
          <Text style={{ color: colors.accent, fontWeight: '800' }}>Offline-Auswahl</Text> – {data.places.length} echte
          Berliner Orte (OpenStreetMap, Stand {BERLIN_HIGHLIGHTS_DATE}).
        </Text>
        <Pressable onPress={() => data.setDemo(false)} hitSlop={8}>
          <Text style={styles.bannerAction}>Live-Daten</Text>
        </Pressable>
      </View>
    );
  }
  if (data.demo) {
    return (
      <View style={[styles.banner, { borderColor: colors.demo }]}>
        <Text style={[styles.bannerText, { flex: 1 }]}>
          <Text style={{ color: colors.demo, fontWeight: '800' }}>Demo-Modus</Text> – fiktive Orte zum Ausprobieren.
        </Text>
        <Pressable onPress={() => data.setDemo(false)} hitSlop={8}>
          <Text style={styles.bannerAction}>Live-Daten</Text>
        </Pressable>
      </View>
    );
  }
  if (data.status === 'error') {
    return (
      <View style={[styles.banner, { borderColor: colors.closed }]}>
        <Text style={[styles.bannerText, { flex: 1 }]}>{data.error}</Text>
        <Pressable onPress={data.retry} hitSlop={8}>
          <Text style={styles.bannerAction}>Erneut</Text>
        </Pressable>
        <Pressable onPress={() => data.setDemo(true)} hitSlop={8}>
          <Text style={[styles.bannerAction, { marginLeft: 14 }]}>{region && isInBerlin(region.center) ? 'Offline-Auswahl' : 'Demo'}</Text>
        </Pressable>
      </View>
    );
  }
  if (data.status === 'zoom') {
    return (
      <View style={styles.banner}>
        <Text style={styles.bannerText}>
          🔍 Zoome näher heran (Stufe {MIN_ZOOM}+), um Orte zu laden{region ? ` – aktuell ${Math.round(region.zoom)}` : ''}.
        </Text>
      </View>
    );
  }
  if (data.status === 'loading') {
    return (
      <View style={styles.banner}>
        <ActivityIndicator size="small" color={colors.accent} />
        <Text style={[styles.bannerText, { marginLeft: 8 }]}>Lade Orte aus OpenStreetMap …</Text>
      </View>
    );
  }
  return null;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  center: { alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row' },
  side: {
    width: 400,
    backgroundColor: colors.surface,
    borderRightWidth: 1,
    borderRightColor: colors.border,
    paddingHorizontal: 16,
  },
  mapWrap: { flex: 1 },
  body: { flex: 1, minHeight: 0 },
  brand: { marginBottom: 14 },
  brandTitle: { color: colors.text, fontSize: 24, fontWeight: '800', letterSpacing: -0.3 },
  brandSub: { color: colors.muted, fontSize: 13, marginTop: 2 },
  catRow: { flexGrow: 0, marginTop: 12, marginBottom: 2 },
  summary: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  summaryText: { color: colors.muted, fontSize: 14, flexShrink: 1 },
  summaryTime: { color: colors.text, fontSize: 14, fontWeight: '600', marginLeft: 10 },
  tabs: {
    flexDirection: 'row',
    backgroundColor: colors.surface2,
    borderRadius: radius.md,
    padding: 3,
    marginBottom: 10,
  },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: radius.sm },
  tabActive: { backgroundColor: colors.surface3 },
  tabText: { color: colors.muted, fontWeight: '600', fontSize: 14 },
  tabTextActive: { color: colors.text },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface2,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 9,
    marginBottom: 10,
  },
  bannerText: { color: colors.text, fontSize: 13, lineHeight: 18, flexShrink: 1 },
  bannerAction: { color: colors.accent, fontWeight: '700', fontSize: 13, marginLeft: 10 },
  topBar: { position: 'absolute', top: 0, left: 0, right: 0, paddingHorizontal: 12 },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.surface,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    borderTopWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: -4 },
    elevation: 16,
  },
  handleArea: { alignItems: 'center', paddingTop: 8, paddingBottom: 2 },
  handle: { width: 42, height: 5, borderRadius: 3, backgroundColor: colors.surface3 },
  dataNote: { color: colors.faint, fontSize: 12, marginBottom: 8 },
  emptyTitle: { color: colors.text, fontSize: 17, fontWeight: '700', marginBottom: 6 },
  emptyText: { color: colors.muted, fontSize: 14, textAlign: 'center', lineHeight: 20 },
  link: { color: colors.accent, fontWeight: '700', marginTop: 12 },
});

import { memo } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { CATEGORY_BY_ID } from '../core/categories';
import { kiezOf } from '../core/berlin';
import type { LineResult, PlaceResult } from '../core/filter';
import { formatDistance, walkingMinutes } from '../core/geo';
import { colors, radius, stateColor } from './theme';

export type ListItem = { kind: 'place'; r: PlaceResult } | { kind: 'line'; r: LineResult };

interface Props {
  items: ListItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  empty: React.ReactNode;
  header?: React.ReactElement;
}

export function ResultList({ items, selectedId, onSelect, empty, header }: Props) {
  return (
    <FlatList
      data={items}
      keyExtractor={(it) => (it.kind === 'place' ? it.r.place.id : it.r.line.id)}
      renderItem={({ item }) =>
        item.kind === 'place' ? (
          <PlaceRow r={item.r} selected={item.r.place.id === selectedId} onSelect={onSelect} />
        ) : (
          <LineRow r={item.r} selected={item.r.line.id === selectedId} onSelect={onSelect} />
        )
      }
      ListEmptyComponent={<View style={styles.empty}>{empty}</View>}
      ListHeaderComponent={header}
      initialNumToRender={20}
      windowSize={7}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ paddingBottom: 24 }}
    />
  );
}

const PlaceRow = memo(function PlaceRow({
  r,
  selected,
  onSelect,
}: {
  r: PlaceResult;
  selected: boolean;
  onSelect: (id: string) => void;
}) {
  const cat = CATEGORY_BY_ID[r.place.category];
  const kiez = kiezOf(r.place, r.place.tags);
  return (
    <Pressable
      onPress={() => onSelect(r.place.id)}
      style={({ pressed }) => [styles.row, selected && styles.selected, pressed && { backgroundColor: colors.surface3 }]}
      accessibilityRole="button"
      accessibilityLabel={`${r.place.name}, ${r.place.kind}, ${r.status.label}`}
    >
      <View style={[styles.badge, { backgroundColor: cat.color + '26', borderColor: cat.color }]}>
        <Text style={styles.emoji}>{cat.emoji}</Text>
      </View>
      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={1}>
          {r.place.name}
          {r.place.highlight ? <Text style={styles.star}> ★</Text> : null}
          {r.place.demo ? <Text style={styles.demo}> DEMO</Text> : null}
        </Text>
        <Text style={styles.meta} numberOfLines={1}>
          {r.place.kind}
          {kiez ? ` · ${kiez}` : ''} · {formatDistance(r.distance)} · {walkingMinutes(r.distance)} min
        </Text>
        <View style={styles.statusRow}>
          <View style={[styles.dot, { backgroundColor: stateColor[r.status.state] }]} />
          <Text style={[styles.status, { color: stateColor[r.status.state] }]} numberOfLines={1}>
            {r.status.label}
          </Text>
        </View>
      </View>
    </Pressable>
  );
});

const SERVICE_COLOR = { running: colors.open, paused: colors.closed, unknown: colors.muted } as const;

const LineRow = memo(function LineRow({
  r,
  selected,
  onSelect,
}: {
  r: LineResult;
  selected: boolean;
  onSelect: (id: string) => void;
}) {
  const { line, service, distance } = r;
  const color = line.color ?? CATEGORY_BY_ID.transit.color;
  return (
    <Pressable
      onPress={() => onSelect(line.id)}
      style={({ pressed }) => [styles.row, selected && styles.selected, pressed && { backgroundColor: colors.surface3 }]}
      accessibilityRole="button"
      accessibilityLabel={`${line.modeLabel} ${line.ref}, ${service.label}`}
    >
      <View style={[styles.lineBadge, { backgroundColor: color }]}>
        <Text style={styles.lineRef} numberOfLines={1}>
          {line.ref || '🌙'}
        </Text>
      </View>
      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={1}>
          {line.from && line.to ? `${line.from} ⇄ ${line.to}` : line.name}
          {line.demo ? <Text style={styles.demo}> DEMO</Text> : null}
        </Text>
        <Text style={styles.meta} numberOfLines={1}>
          {line.modeLabel}
          {line.operator ? ` · ${line.operator}` : ''} · {formatDistance(distance)}
        </Text>
        <View style={styles.statusRow}>
          <View style={[styles.dot, { backgroundColor: SERVICE_COLOR[service.state] }]} />
          <Text style={[styles.status, { color: SERVICE_COLOR[service.state] }]} numberOfLines={1}>
            {service.label}
            {service.hint ? <Text style={{ color: colors.muted, fontWeight: '500' }}> · {service.hint}</Text> : null}
          </Text>
        </View>
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: radius.md,
    marginBottom: 4,
  },
  selected: { backgroundColor: colors.accentSoft },
  badge: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  emoji: { fontSize: 19 },
  lineBadge: {
    minWidth: 42,
    height: 30,
    borderRadius: 8,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  lineRef: { color: '#111', fontWeight: '800', fontSize: 14 },
  body: { flex: 1, minWidth: 0 },
  name: { color: colors.text, fontSize: 16, fontWeight: '600' },
  demo: { color: colors.demo, fontSize: 11, fontWeight: '800' },
  star: { color: '#ffd166', fontSize: 14 },
  meta: { color: colors.muted, fontSize: 13, marginTop: 2 },
  statusRow: { flexDirection: 'row', alignItems: 'center', marginTop: 3 },
  dot: { width: 7, height: 7, borderRadius: 4, marginRight: 6 },
  status: { fontSize: 13, fontWeight: '600' },
  empty: { padding: 20, alignItems: 'center' },
});

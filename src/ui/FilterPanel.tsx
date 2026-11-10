import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { CATEGORIES } from '../core/categories';
import type { Filters } from '../core/filter';
import { INTERESTS, type InterestId } from '../core/interests';
import type { CategoryId } from '../core/types';
import type { TimeSelection } from '../core/time';
import { Chip } from './Chip';
import { TimePanel } from './TimePanel';
import { colors, radius } from './theme';

interface Props {
  filters: Filters;
  onChange: (f: Filters) => void;
  time: TimeSelection;
  now: Date;
  onTime: (t: TimeSelection) => void;
}

const MIN_OPEN_OPTIONS = [
  { minutes: 0, label: 'egal' },
  { minutes: 60, label: '1 Std' },
  { minutes: 120, label: '2 Std' },
  { minutes: 180, label: '3 Std' },
];

export function toggle<T>(list: T[], item: T): T[] {
  return list.includes(item) ? list.filter((x) => x !== item) : [...list, item];
}

export function CategoryChips({ filters, onChange }: Pick<Props, 'filters' | 'onChange'>) {
  return (
    <>
      {CATEGORIES.map((c) => (
        <Chip
          key={c.id}
          label={c.label}
          emoji={c.emoji}
          color={c.color}
          active={filters.categories.includes(c.id)}
          onPress={() => onChange({ ...filters, categories: toggle<CategoryId>(filters.categories, c.id) })}
          small
          accessibilityHint={c.description}
        />
      ))}
    </>
  );
}

export function FilterPanel({ filters, onChange, time, now, onTime }: Props) {
  const set = (patch: Partial<Filters>) => onChange({ ...filters, ...patch });
  return (
    <View>
      <Text style={styles.section}>Uhrzeit</Text>
      <TimePanel value={time} now={now} onChange={onTime} />

      <View style={styles.card}>
        <Row
          label="Nur geöffnete Orte"
          detail="Blendet zur gewählten Zeit geschlossene Orte aus"
          value={filters.openMode === 'open'}
          onValue={(v) => set({ openMode: v ? 'open' : 'all' })}
        />
        <Row
          label="Ohne Öffnungszeiten zeigen"
          detail="Viele Spätis haben keine Zeiten in OpenStreetMap"
          value={filters.includeUnknown}
          onValue={(v) => set({ includeUnknown: v })}
        />
        <Text style={[styles.rowLabel, { marginTop: 10 }]}>Noch mindestens geöffnet</Text>
        <View style={styles.wrap}>
          {MIN_OPEN_OPTIONS.map((o) => (
            <Chip
              key={o.minutes}
              label={o.label}
              small
              active={filters.minOpenMinutes === o.minutes}
              onPress={() => set({ minOpenMinutes: o.minutes, openMode: o.minutes ? 'open' : filters.openMode })}
            />
          ))}
        </View>
      </View>

      <Text style={styles.section}>Kategorien</Text>
      <View style={styles.wrap}>
        <CategoryChips filters={filters} onChange={onChange} />
      </View>

      <View style={styles.sectionRow}>
        <Text style={styles.section}>Interessen</Text>
        {filters.interests.length ? (
          <Pressable onPress={() => set({ interests: [] })} hitSlop={8}>
            <Text style={styles.reset}>Zurücksetzen</Text>
          </Pressable>
        ) : null}
      </View>
      <View style={styles.wrap}>
        {INTERESTS.map((i) => (
          <Chip
            key={i.id}
            label={i.label}
            emoji={i.emoji}
            small
            active={filters.interests.includes(i.id)}
            onPress={() => set({ interests: toggle<InterestId>(filters.interests, i.id) })}
          />
        ))}
      </View>
      <Text style={styles.note}>
        Interessen basieren auf Angaben in OpenStreetMap und sind nicht überall gepflegt. Mehrere Interessen müssen alle
        zutreffen.
      </Text>
    </View>
  );
}

function Row({ label, detail, value, onValue }: { label: string; detail: string; value: boolean; onValue: (v: boolean) => void }) {
  return (
    <View style={styles.row}>
      <View style={{ flex: 1, paddingRight: 12 }}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowDetail}>{detail}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValue}
        trackColor={{ false: colors.surface3, true: colors.accent }}
        thumbColor="#fff"
        accessibilityLabel={label}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: 18,
    marginBottom: 10,
  },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  reset: { color: colors.accent, fontSize: 13, marginTop: 8 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap' },
  card: {
    marginTop: 14,
    backgroundColor: colors.surface2,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
  },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6 },
  rowLabel: { color: colors.text, fontSize: 15, fontWeight: '600', marginBottom: 6 },
  rowDetail: { color: colors.muted, fontSize: 12, marginTop: -4 },
  note: { color: colors.faint, fontSize: 12, marginTop: 4, lineHeight: 17 },
});

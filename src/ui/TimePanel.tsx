import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  QUICK_HOURS,
  describeSelection,
  minutesForHour,
  nightLabel,
  shiftSelection,
  type TimeSelection,
} from '../core/time';
import { Chip } from './Chip';
import { colors, radius } from './theme';

interface Props {
  value: TimeSelection;
  now: Date;
  onChange: (v: TimeSelection) => void;
}

export function TimePanel({ value, now, onChange }: Props) {
  const nights = [0, 1, 2, 3, 4, 5, 6];
  const pick = (patch: Partial<TimeSelection>) => {
    const base = value.live ? shiftSelection(value, now, 0) : value;
    onChange({ ...base, ...patch, live: false });
  };
  return (
    <View>
      <View style={styles.header}>
        <Pressable
          onPress={() => onChange(shiftSelection(value, now, -30))}
          style={styles.step}
          accessibilityLabel="30 Minuten früher"
        >
          <Text style={styles.stepText}>−30</Text>
        </Pressable>
        <View style={styles.current}>
          <Text style={styles.currentLabel}>Geöffnet um</Text>
          <Text style={styles.currentValue}>{describeSelection(value, now)}</Text>
        </View>
        <Pressable
          onPress={() => onChange(shiftSelection(value, now, 30))}
          style={styles.step}
          accessibilityLabel="30 Minuten später"
        >
          <Text style={styles.stepText}>+30</Text>
        </Pressable>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.row}>
        <Chip label="Jetzt" emoji="⚡" active={value.live} onPress={() => onChange({ ...value, live: true })} small />
        {nights.map((n) => (
          <Chip
            key={n}
            label={nightLabel(n, now)}
            active={!value.live && value.nightOffset === n}
            onPress={() => pick({ nightOffset: n })}
            small
          />
        ))}
      </ScrollView>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {QUICK_HOURS.map((h) => {
          const m = minutesForHour(h);
          return (
            <Chip
              key={h}
              label={`${String(h).padStart(2, '0')}:00`}
              active={!value.live && value.minutes === m}
              onPress={() => pick({ minutes: m })}
              small
            />
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface2,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 10,
  },
  step: { paddingHorizontal: 14, paddingVertical: 10 },
  stepText: { color: colors.accent, fontWeight: '700', fontSize: 15 },
  current: { flex: 1, alignItems: 'center', paddingVertical: 6 },
  currentLabel: { color: colors.muted, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.6 },
  currentValue: { color: colors.text, fontSize: 18, fontWeight: '700', marginTop: 2 },
  row: { marginBottom: 2 },
});

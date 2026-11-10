import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { BVG_TRIP_PLANNER, berlinNightSummary } from '../core/berlin';
import { colors, radius } from './theme';

/** Explains at a glance how Berlin's night network runs at the selected time. */
export function BerlinNightCard({ at }: { at: Date }) {
  const { title, text } = berlinNightSummary(at);
  return (
    <View style={styles.card}>
      <Text style={styles.title}>🚇 BVG-Nachtnetz · {title}</Text>
      <Text style={styles.text}>{text}</Text>
      <Pressable onPress={() => Linking.openURL(BVG_TRIP_PLANNER).catch(() => undefined)} hitSlop={6}>
        <Text style={styles.link}>Verbindung in der BVG-Fahrinfo suchen →</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface2,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: '#ffe06655',
    padding: 12,
    marginBottom: 10,
  },
  title: { color: '#ffe066', fontSize: 14, fontWeight: '700', marginBottom: 4 },
  text: { color: colors.text, fontSize: 13, lineHeight: 19 },
  link: { color: colors.accent, fontSize: 13, fontWeight: '600', marginTop: 8 },
});

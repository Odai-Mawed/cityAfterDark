import { Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';
import { colors, radius } from './theme';

interface Props {
  label: string;
  emoji?: string;
  active?: boolean;
  color?: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  small?: boolean;
  accessibilityHint?: string;
}

export function Chip({ label, emoji, active, color = colors.accent, onPress, style, small, accessibilityHint }: Props) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: !!active }}
      accessibilityHint={accessibilityHint}
      style={({ pressed }) => [
        styles.chip,
        small && styles.small,
        active ? { backgroundColor: color + '2e', borderColor: color } : null,
        pressed && { opacity: 0.7 },
        style,
      ]}
    >
      <Text style={[styles.label, small && styles.smallLabel, active && { color: colors.text }]} numberOfLines={1}>
        {emoji ? `${emoji} ` : ''}
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface2,
    marginRight: 8,
    marginBottom: 8,
  },
  small: { paddingHorizontal: 10, paddingVertical: 5 },
  label: { color: colors.muted, fontSize: 14, fontWeight: '600' },
  smallLabel: { fontSize: 13 },
});

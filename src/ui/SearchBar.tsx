import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { KIEZE, type Kiez } from '../core/berlin';
import { CITIES, searchPlaces, type City, type GeoResult } from '../core/geocode';
import { colors, radius } from './theme';

interface Props {
  query: string;
  onQuery: (q: string) => void;
  onPickPlace: (r: GeoResult) => void;
  onPickCity: (c: City) => void;
  onPickKiez: (k: Kiez) => void;
  onLocate: () => void;
  locating: boolean;
}

/**
 * One input for two things: it filters the visible places by name and, from
 * three characters on, offers to jump to a city/address (Nominatim).
 */
export function SearchBar({ query, onQuery, onPickPlace, onPickCity, onPickKiez, onLocate, locating }: Props) {
  const [focused, setFocused] = useState(false);
  const [results, setResults] = useState<GeoResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { height } = useWindowDimensions();
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 3 || !focused) {
      setResults([]);
      setError(null);
      return;
    }
    const ctrl = new AbortController();
    const t = setTimeout(() => {
      setLoading(true);
      searchPlaces(q, ctrl.signal)
        .then((r) => {
          setResults(r);
          setError(null);
        })
        .catch((e) => {
          if (!ctrl.signal.aborted) setError('Ortssuche nicht erreichbar');
          void e;
        })
        .finally(() => !ctrl.signal.aborted && setLoading(false));
    }, 450);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [query, focused]);

  const close = () => {
    setFocused(false);
    setResults([]);
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <View style={styles.inputWrap}>
          <Text style={styles.icon}>🔎</Text>
          <TextInput
            value={query}
            onChangeText={onQuery}
            placeholder="Kiez, Adresse oder Name suchen"
            placeholderTextColor={colors.faint}
            style={styles.input}
            onFocus={() => {
              if (blurTimer.current) clearTimeout(blurTimer.current);
              setFocused(true);
            }}
            onBlur={() => {
              blurTimer.current = setTimeout(() => setFocused(false), 250);
            }}
            returnKeyType="search"
            autoCorrect={false}
            accessibilityLabel="Suche"
          />
          {loading ? <ActivityIndicator size="small" color={colors.muted} /> : null}
          {query ? (
            <Pressable onPress={() => onQuery('')} hitSlop={10} accessibilityLabel="Suche leeren">
              <Text style={styles.clear}>✕</Text>
            </Pressable>
          ) : null}
        </View>
        <Pressable
          onPress={onLocate}
          style={({ pressed }) => [styles.locate, pressed && { opacity: 0.7 }]}
          accessibilityLabel="Mein Standort"
        >
          {locating ? <ActivityIndicator size="small" color={colors.text} /> : <Text style={styles.locateIcon}>◎</Text>}
        </Pressable>
      </View>

      {focused ? (
        <ScrollView
          style={[styles.dropdown, { maxHeight: Math.round(height * 0.6) }]}
          keyboardShouldPersistTaps="handled"
        >
          {!query.trim() ? (
            <>
              <Text style={styles.dropTitle}>Berliner Kieze</Text>
              <View style={styles.kiezGrid}>
                {KIEZE.map((k) => (
                  <Pressable
                    key={k.name}
                    style={({ pressed }) => [styles.kiez, pressed && { backgroundColor: colors.surface3 }]}
                    onPress={() => {
                      onPickKiez(k);
                      close();
                    }}
                  >
                    <Text style={styles.kiezName} numberOfLines={1}>
                      {k.name}
                    </Text>
                    <Text style={styles.kiezHint} numberOfLines={1}>
                      {k.hint}
                    </Text>
                  </Pressable>
                ))}
              </View>
              <Text style={[styles.dropTitle, { marginTop: 10 }]}>Andere Städte</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                {CITIES.filter((c) => c.name !== 'Berlin').map((c) => (
                  <Pressable
                    key={c.name}
                    style={styles.city}
                    onPress={() => {
                      onPickCity(c);
                      close();
                    }}
                  >
                    <Text style={styles.cityText}>{c.name}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </>
          ) : null}
          {query.trim() ? (
            <Text style={styles.hint}>Filtert die Orte nach „{query.trim()}“ · oder springe zu:</Text>
          ) : null}
          {error ? <Text style={styles.error}>{error}</Text> : null}
          {results.map((r, i) => (
            <Pressable
              key={`${r.lat},${r.lon},${i}`}
              style={({ pressed }) => [styles.result, pressed && { backgroundColor: colors.surface3 }]}
              onPress={() => {
                onPickPlace(r);
                onQuery('');
                close();
              }}
            >
              <Text style={styles.resultTitle} numberOfLines={1}>
                📍 {r.label}
              </Text>
              {r.detail ? (
                <Text style={styles.resultDetail} numberOfLines={1}>
                  {r.detail}
                </Text>
              ) : null}
            </Pressable>
          ))}
        </ScrollView>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { zIndex: 10 },
  row: { flexDirection: 'row', alignItems: 'center' },
  inputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface2,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    height: 44,
  },
  icon: { fontSize: 14, marginRight: 8 },
  input: { flex: 1, color: colors.text, fontSize: 15, height: 44, outlineStyle: 'none' } as never,
  clear: { color: colors.muted, fontSize: 15, paddingLeft: 8 },
  locate: {
    width: 44,
    height: 44,
    marginLeft: 8,
    borderRadius: radius.md,
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locateIcon: { color: colors.text, fontSize: 20, marginTop: -2 },
  dropdown: {
    marginTop: 6,
    backgroundColor: colors.surface2,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 10,
  },
  dropTitle: { color: colors.muted, fontSize: 12, fontWeight: '700', marginBottom: 8, textTransform: 'uppercase' },
  city: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radius.pill,
    backgroundColor: colors.surface3,
    marginRight: 8,
  },
  cityText: { color: colors.text, fontSize: 14 },
  kiezGrid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -3 },
  kiez: { width: '50%', paddingVertical: 6, paddingHorizontal: 8, borderRadius: radius.sm },
  kiezName: { color: colors.text, fontSize: 14, fontWeight: '600' },
  kiezHint: { color: colors.muted, fontSize: 12, marginTop: 1 },
  hint: { color: colors.faint, fontSize: 12, marginBottom: 4 },
  error: { color: colors.closed, fontSize: 13, paddingVertical: 6 },
  result: { paddingVertical: 8, paddingHorizontal: 6, borderRadius: radius.sm },
  resultTitle: { color: colors.text, fontSize: 15 },
  resultDetail: { color: colors.muted, fontSize: 12, marginTop: 2 },
});

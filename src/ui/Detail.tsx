import { Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BVG_TRIP_PLANNER, isInBerlin, kiezOf } from '../core/berlin';
import { CATEGORY_BY_ID } from '../core/categories';
import { lineService } from '../core/filter';
import { distance, formatDistance, walkingMinutes } from '../core/geo';
import { getNightSchedule, getStatus } from '../core/hours';
import { matchingInterests } from '../core/interests';
import { nightOf } from '../core/time';
import type { LatLon, Place, TransitLine } from '../core/types';
import { colors, radius, stateColor } from './theme';

function open(url: string) {
  Linking.openURL(url).catch(() => undefined);
}

export function directionsUrl(p: LatLon, name: string): string {
  const dest = `${p.lat},${p.lon}`;
  if (Platform.OS === 'ios') return `http://maps.apple.com/?daddr=${dest}&dirflg=w&q=${encodeURIComponent(name)}`;
  return `https://www.google.com/maps/dir/?api=1&destination=${dest}&travelmode=walking`;
}

function websiteOf(tags: Place['tags']): string | undefined {
  const w = tags.website ?? tags['contact:website'] ?? tags.url;
  if (!w) return undefined;
  return /^https?:\/\//.test(w) ? w : `https://${w}`;
}

function addressOf(tags: Place['tags']): string | undefined {
  const street = [tags['addr:street'], tags['addr:housenumber']].filter(Boolean).join(' ');
  const city = [tags['addr:postcode'], tags['addr:city']].filter(Boolean).join(' ');
  return [street, city].filter(Boolean).join(', ') || undefined;
}

interface PlaceDetailProps {
  place: Place;
  at: Date;
  origin: LatLon;
  onClose: () => void;
}

export function PlaceDetail({ place, at, origin, onClose }: PlaceDetailProps) {
  const cat = CATEGORY_BY_ID[place.category];
  const status = getStatus(place.tags, at);
  const schedule = getNightSchedule(place.tags.opening_hours, nightOf(at));
  const interests = matchingInterests(place.tags);
  const website = websiteOf(place.tags);
  const phone = place.tags.phone ?? place.tags['contact:phone'];
  const address = addressOf(place.tags);
  const d = distance(origin, place);
  const kiez = kiezOf(place, place.tags);

  return (
    <ScrollView contentContainerStyle={styles.wrap} keyboardShouldPersistTaps="handled">
      <BackButton onPress={onClose} />
      <View style={styles.titleRow}>
        <View style={[styles.badge, { backgroundColor: cat.color + '26', borderColor: cat.color }]}>
          <Text style={{ fontSize: 24 }}>{cat.emoji}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{place.name}</Text>
          <Text style={styles.sub}>
            {place.kind}
            {kiez ? ` · ${kiez}` : ''} · {formatDistance(d)} · ca. {walkingMinutes(d)} min zu Fuß
          </Text>
        </View>
      </View>
      {place.demo ? <Text style={styles.demoNote}>Demo-Ort – frei erfunden, nicht real.</Text> : null}
      {place.highlight ? (
        <View style={styles.highlight}>
          <Text style={styles.highlightTitle}>★ Berliner Institution</Text>
          <Text style={styles.highlightText}>{place.highlight}</Text>
        </View>
      ) : null}

      <View style={[styles.statusCard, { borderColor: stateColor[status.state] }]}>
        <Text style={[styles.statusText, { color: stateColor[status.state] }]}>{status.label}</Text>
        {status.comment && status.state !== 'unknown' ? <Text style={styles.comment}>„{status.comment}“</Text> : null}
      </View>

      {schedule ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nächte</Text>
          {schedule.map((n) => (
            <View key={n.date.toISOString()} style={[styles.nightRow, n.isSelected && styles.nightSelected]}>
              <Text style={[styles.nightLabel, n.isSelected && { color: colors.text }]}>{n.label}</Text>
              <Text style={[styles.nightValue, !n.ranges.length && { color: colors.faint }]}>
                {n.ranges.length ? n.ranges.join(', ') : 'geschlossen'}
                {n.unknown ? ' (?)' : ''}
              </Text>
            </View>
          ))}
          <Text style={styles.raw}>{place.tags.opening_hours}</Text>
        </View>
      ) : place.tags.opening_hours ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Öffnungszeiten (Rohdaten)</Text>
          <Text style={styles.raw}>{place.tags.opening_hours}</Text>
        </View>
      ) : null}

      {interests.length ? (
        <View style={styles.tags}>
          {interests.map((i) => (
            <View key={i.id} style={styles.tag}>
              <Text style={styles.tagText}>
                {i.emoji} {i.label}
              </Text>
            </View>
          ))}
        </View>
      ) : null}

      {address ? <InfoRow icon="📍" text={address} /> : null}
      {place.tags.cuisine ? <InfoRow icon="🍽" text={place.tags.cuisine.replace(/;/g, ', ')} /> : null}
      {place.tags.fee ? <InfoRow icon="🎟" text={`Eintritt: ${place.tags.fee === 'yes' ? 'ja' : place.tags.fee === 'no' ? 'frei' : place.tags.fee}`} /> : null}
      {place.tags.description ? <InfoRow icon="ℹ️" text={place.tags.description} /> : null}

      <View style={styles.actions}>
        <Action label="Route" icon="🧭" primary onPress={() => open(directionsUrl(place, place.name))} />
        {website ? <Action label="Website" icon="🌐" onPress={() => open(website)} /> : null}
        {phone ? <Action label="Anrufen" icon="📞" onPress={() => open(`tel:${phone.split(/[;,]/)[0].replace(/\s/g, '')}`)} /> : null}
        {!place.demo ? (
          <Action label="In OSM" icon="🗺" onPress={() => open(`https://www.openstreetmap.org/${place.id}`)} />
        ) : null}
      </View>
      <Text style={styles.footnote}>
        Daten: © OpenStreetMap-Mitwirkende. Angaben ohne Gewähr – Öffnungszeiten können abweichen. Fehler? Du kannst
        sie direkt in OpenStreetMap korrigieren.
      </Text>
    </ScrollView>
  );
}

export function LineDetail({
  line,
  at,
  origin,
  onClose,
}: {
  line: TransitLine;
  at: Date;
  origin: LatLon;
  onClose: () => void;
}) {
  const color = line.color ?? CATEGORY_BY_ID.transit.color;
  const service = lineService(line, at);
  const berlin = isInBerlin(line.center);
  const serviceColor = service.state === 'running' ? colors.open : service.state === 'paused' ? colors.closed : colors.muted;
  const nearest = [...line.stops].sort((a, b) => distance(origin, a) - distance(origin, b))[0];
  return (
    <ScrollView contentContainerStyle={styles.wrap}>
      <BackButton onPress={onClose} />
      <View style={styles.titleRow}>
        <View style={[styles.lineBadge, { backgroundColor: color }]}>
          <Text style={styles.lineRef}>{line.ref || '🌙'}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{line.from && line.to ? `${line.from} ⇄ ${line.to}` : line.name}</Text>
          <Text style={styles.sub}>
            {line.modeLabel}
            {line.operator ? ` · ${line.operator}` : ''}
          </Text>
        </View>
      </View>
      {line.demo ? <Text style={styles.demoNote}>Demo-Linie – frei erfunden, nicht real.</Text> : null}
      <View style={[styles.statusCard, { borderColor: serviceColor }]}>
        <Text style={[styles.statusText, { color: serviceColor }]}>{service.label}</Text>
        {service.hint ? <Text style={styles.comment}>{service.hint}</Text> : null}
      </View>
      {nearest ? (
        <View style={[styles.statusCard, { borderColor: color }]}>
          <Text style={[styles.statusText, { color }]}>
            Nächste Haltestelle: {nearest.name ?? 'ohne Namen'} · {formatDistance(distance(origin, nearest))}
          </Text>
          <Pressable onPress={() => open(directionsUrl(nearest, nearest.name ?? line.ref))}>
            <Text style={styles.link}>Route zur Haltestelle →</Text>
          </Pressable>
        </View>
      ) : null}
      {line.stops.some((s) => s.name) ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Haltestellen</Text>
          {line.stops
            .filter((s) => s.name)
            .map((s) => (
              <View key={`${s.lat},${s.lon}`} style={styles.stopRow}>
                <View style={[styles.stopDot, { borderColor: color }]} />
                <Text style={styles.stopName}>{s.name}</Text>
              </View>
            ))}
        </View>
      ) : null}
      <Text style={styles.footnote}>
        {berlin
          ? 'Betriebszeiten nach den vereinfachten BVG-/S-Bahn-Regeln fürs Nachtnetz. Baustellen und Ersatzverkehr sind nicht berücksichtigt – im Zweifel die BVG-Fahrinfo prüfen.'
          : 'Nachtlinien aus OpenStreetMap (by_night bzw. Liniennummern mit „N“). Fahrpläne bitte beim Verkehrsbetrieb prüfen.'}
      </Text>
      <View style={styles.actions}>
        {berlin ? <Action label="BVG-Fahrinfo" icon="🚇" primary onPress={() => open(BVG_TRIP_PLANNER)} /> : null}
        {!line.demo && line.osmIds[0] ? (
          <Action label="In OSM" icon="🗺" onPress={() => open(`https://www.openstreetmap.org/${line.osmIds[0]}`)} />
        ) : null}
      </View>
    </ScrollView>
  );
}

function BackButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.back} hitSlop={10} accessibilityRole="button" accessibilityLabel="Zurück zur Liste">
      <Text style={styles.backText}>‹ Zurück</Text>
    </Pressable>
  );
}

function InfoRow({ icon, text }: { icon: string; text: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoIcon}>{icon}</Text>
      <Text style={styles.infoText}>{text}</Text>
    </View>
  );
}

function Action({ label, icon, onPress, primary }: { label: string; icon: string; onPress: () => void; primary?: boolean }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.action, primary && styles.actionPrimary, pressed && { opacity: 0.75 }]}
      accessibilityRole="link"
    >
      <Text style={[styles.actionText, primary && { color: '#fff' }]}>
        {icon} {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingBottom: 32 },
  back: { paddingVertical: 6, alignSelf: 'flex-start', marginBottom: 6 },
  backText: { color: colors.accent, fontSize: 15, fontWeight: '600' },
  titleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  badge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  lineBadge: { minWidth: 52, height: 38, borderRadius: 9, paddingHorizontal: 8, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  lineRef: { color: '#111', fontWeight: '800', fontSize: 17 },
  title: { color: colors.text, fontSize: 21, fontWeight: '700' },
  sub: { color: colors.muted, fontSize: 14, marginTop: 3 },
  highlight: { backgroundColor: 'rgba(255,209,102,0.08)', borderRadius: radius.md, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(255,209,102,0.35)' },
  highlightTitle: { color: '#ffd166', fontSize: 13, fontWeight: '800', marginBottom: 4 },
  highlightText: { color: colors.text, fontSize: 14, lineHeight: 20 },
  demoNote: { color: colors.demo, fontSize: 13, marginBottom: 10 },
  statusCard: { borderWidth: 1, borderRadius: radius.md, padding: 12, backgroundColor: colors.surface2, marginBottom: 14 },
  statusText: { fontSize: 16, fontWeight: '700' },
  comment: { color: colors.muted, fontSize: 13, marginTop: 4 },
  link: { color: colors.accent, fontSize: 14, marginTop: 8, fontWeight: '600' },
  section: { backgroundColor: colors.surface2, borderRadius: radius.md, padding: 12, marginBottom: 14 },
  sectionTitle: { color: colors.muted, fontSize: 12, fontWeight: '700', textTransform: 'uppercase', marginBottom: 8, letterSpacing: 0.6 },
  nightRow: { flexDirection: 'row', paddingVertical: 4, paddingHorizontal: 6, borderRadius: 6 },
  nightSelected: { backgroundColor: colors.accentSoft },
  nightLabel: { color: colors.muted, width: 64, fontSize: 14, fontWeight: '600' },
  nightValue: { color: colors.text, fontSize: 14, flex: 1 },
  raw: { color: colors.faint, fontSize: 12, marginTop: 8, fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }) },
  tags: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 },
  tag: { backgroundColor: colors.surface3, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 5, marginRight: 6, marginBottom: 6 },
  tagText: { color: colors.text, fontSize: 13 },
  infoRow: { flexDirection: 'row', paddingVertical: 5 },
  infoIcon: { width: 26, fontSize: 15 },
  infoText: { color: colors.text, fontSize: 14, flex: 1, lineHeight: 20 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 12 },
  action: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radius.md,
    backgroundColor: colors.surface3,
    marginRight: 8,
    marginBottom: 8,
  },
  actionPrimary: { backgroundColor: colors.accent },
  actionText: { color: colors.text, fontWeight: '700', fontSize: 14 },
  footnote: { color: colors.faint, fontSize: 12, marginTop: 14, lineHeight: 17 },
  stopRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4 },
  stopDot: { width: 10, height: 10, borderRadius: 5, borderWidth: 2, marginRight: 10 },
  stopName: { color: colors.text, fontSize: 14 },
});

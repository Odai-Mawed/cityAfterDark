# 🌙 CityAfterDark – Das Nachtleben auf einer Karte

CityAfterDark zeigt **Clubs, Bars, Spätis, Nachtverkehr und Orte, die spät geöffnet sind** auf einer dunklen Karte.
Du kannst nach **Uhrzeit** („Was hat Freitagnacht um 02:00 noch offen?“) und nach **Interessen** (Live-Musik, Draußen
sitzen, Raucher, Barrierefrei, Vegan, LGBTQ+ …) filtern.

Gebaut mit **React Native + Expo**: ein Code-Stand für **Android, iOS und Web**.

## Funktionen

- **Karte** mit allen Orten im sichtbaren Bereich (Daten live aus OpenStreetMap über die Overpass API)
- **Kategorien:** 🪩 Clubs · 🍸 Bars & Kneipen · 🍺 Spätis/Kioske · 🌯 Spätes Essen · 🎬 Kultur & Spiel · ⛽ Versorgung
  (Tankstellen, Apotheken, Supermärkte) · 🌙 Nachtverkehr (Nachtbusse, Nacht-Trams, Nachtzüge)
- **Zeitfilter in „Nächten“:** Eine Nacht läuft von 12:00 bis 12:00. „Fr/Sa · 02:00“ bedeutet also Samstag 02:00 Uhr.
  Dazu gibt es „Jetzt“ (live), ±30 Minuten und Schnellwahl für 18 bis 06 Uhr.
- **„Noch mindestens geöffnet“:** z. B. nur Orte, die noch 2 Stunden offen haben
- **Öffnungszeiten** werden mit [opening_hours.js](https://github.com/opening-hours/opening_hours.js) ausgewertet,
  inklusive Feiertagen des jeweiligen Bundeslands und Zeiten über Mitternacht
- **Detailansicht** mit Status („Geöffnet · bis 05:00“), Wochenübersicht pro Nacht, Adresse, Website, Telefon,
  Route zu Fuß und Link zu OpenStreetMap
- **Suche** nach Namen in der Liste, nach Städten und Adressen (Nominatim) und **Mein Standort**
- **Optimiert für Berlin** (siehe unten)
- **Demo-Modus** mit frei erfundenen, deutlich markierten Orten, falls die Live-Daten nicht erreichbar sind
- Filter und Kartenausschnitt werden gespeichert

## Berlin

- **BVG-Nachtnetz:** Neben den Nachtbussen werden in Berlin auch U-Bahn, S-Bahn, MetroTram und MetroBus geladen.
  Für die gewählte Uhrzeit zeigt jede Linie, ob sie fährt:
  - In Wochenendnächten (Fr/Sa, Sa/So) und vor Feiertagen fahren U-Bahn (außer U4) und S-Bahn durchgehend.
  - Unter der Woche hat die U-Bahn ca. 1:00–4:30 Uhr Pause. N1–N9 fahren dann auf der Strecke der gleichnamigen U-Linie
    (U8 → N8).
  - MetroTram und MetroBus fahren rund um die Uhr, Nachtbusse ab N10 jede Nacht ca. 0:30–5:00 Uhr.

  Die Regeln sind vereinfacht. Baustellen und Ersatzverkehr kennt die App nicht, deshalb gibt es überall einen Link
  zur BVG-Fahrinfo.
- **Kieze:** Die Suche bietet Schnellsprünge zu Ausgehvierteln (Kotti, Weserstraße, Simon-Dach-Kiez, Ostkreuz …). Jeder
  Ort zeigt seinen Ortsteil: aus `addr:suburb`, sonst vom nächstgelegenen Ortsteil-Mittelpunkt (Näherung).
- **Clubs ohne Öffnungszeiten:** Viele Berliner Clubs veröffentlichen keine festen Zeiten. Sie werden deshalb
  standardmäßig mit „Öffnungszeiten unbekannt“ angezeigt. Das lässt sich im Filter abschalten.
- **Berliner Institutionen (★):** 19 bekannte Clubs, Bars und Spätis (Berghain, Tresor, Sisyphos, ://about blank,
  Destille, Klunkerkranich …). Die Auswahl stammt aus einer Web-Recherche, die Daten (Koordinaten, Adresse,
  Öffnungszeiten) aus OpenStreetMap, Stand 10.11.2026, siehe `src/data/berlinHighlights.ts`. In den Live-Daten sind
  diese Orte mit ★ und einer Kurzbeschreibung markiert. Ist Overpass nicht erreichbar, zeigt die App sie als
  „Offline-Auswahl“ statt erfundener Demo-Orte.
- Feiertage werden nach Berliner Recht ausgewertet (z. B. Frauentag am 8. März).

## Loslegen

```bash
npm install
npm run web        # im Browser
npm run android    # Android (Expo Go / Emulator)
npm run ios        # iOS (Expo Go / Simulator, macOS)
```

Weitere Befehle:

```bash
npm test           # Unit-Tests der Kernlogik (Vitest)
npm run typecheck  # TypeScript
npm run build:web  # statischer Web-Build nach dist/
npm run leaflet    # Leaflet-Bundle neu erzeugen (nach Leaflet-Update)
```

Web-Tipp: `?demo=1` startet direkt im Demo-Modus, `?lat=52.51&lon=13.42&z=15` öffnet einen bestimmten Ausschnitt.

### Web-Deployment (Netlify)

Live unter **https://cityafterdark.netlify.app**. `netlify.toml` enthält Build-Befehl, Ausgabeordner und
SPA-Weiterleitung. Für automatische Deploys bei jedem Push das GitHub-Repo in Netlify mit der Site verbinden.
Ein manuelles Deploy geht so:

```bash
npm run build:web
npx netlify-cli deploy --prod --dir dist
```

### App-Builds (Android / iOS)

Die App nutzt nur Module, die in Expo Go enthalten sind (`react-native-webview`, `expo-location`, AsyncStorage).
Für Store-Builds ist [EAS](https://docs.expo.dev/eas/) vorkonfiguriert (`eas.json`):

```bash
npx eas-cli@latest build --platform android --profile preview   # installierbare APK
npx eas-cli@latest build --platform ios --profile production
```

Vorher in `app.json` die `bundleIdentifier`/`package` (`com.cityafterdark.app`) auf eine eigene ID ändern.

## Architektur

```
App.tsx                  Layout (Seitenleiste ab 860 px, sonst Bottom-Sheet) und App-State
src/core/                Plattformunabhängige Logik (getestet)
  categories.ts          Kategorien → OSM-Tags / Overpass-Selektoren
  interests.ts           Interessen-Filter (live_music, outdoor_seating, smoking, …)
  overpass.ts            Query-Builder, Parser, Fallback auf mehrere Overpass-Server
  hours.ts               Öffnungszeiten: Status, „noch X Std offen“, Nachtplan
  time.ts                Zeitauswahl in Nächten
  filter.ts              Filtern und Sortieren (offen zuerst, dann Entfernung)
  geocode.ts, demo.ts    Ortssuche (Nominatim), Demo-Daten
src/map/                 Karte: Leaflet in einer HTML-Seite
  mapHtml.ts             Karten-Controller (Canvas-Marker, Linien, Auswahl)
  MapSurface.tsx         iOS/Android → WebView
  MapSurface.web.tsx     Web → iframe
  NightMap.tsx           React-Komponente + postMessage-Bridge
src/state/               Datenladen mit Bereichs-Cache, Speichern der Einstellungen
src/ui/                  Suche, Zeitwahl, Filter, Liste, Details
```

Die Karte läuft auf allen Plattformen mit **demselben Leaflet-Code**. Leaflet ist eingebettet, es wird also kein CDN
gebraucht, und es ist **kein Google-Maps-API-Key** nötig. Daten werden erst ab Zoomstufe 13 geladen. Bereits geladene
Bereiche und Kategorien werden nicht erneut abgefragt.

## Daten & Lizenzen

- Orte und Linien: © [OpenStreetMap](https://www.openstreetmap.org/copyright)-Mitwirkende (ODbL), über die Overpass API
- Kartenkacheln: © [CARTO](https://carto.com/attributions) (Dark Matter). Für einen kommerziellen Einsatz bitte die
  CARTO-Nutzungsbedingungen prüfen oder einen eigenen Tile-Anbieter eintragen (`mapHtml.ts`).
- Ortssuche: [Nominatim](https://operations.osmfoundation.org/policies/nominatim/). Bei vielen Nutzern ist ein eigener
  Geocoding-Dienst nötig.

Angaben ohne Gewähr. Fehlende Öffnungszeiten oder Fehler kannst du direkt in OpenStreetMap ergänzen. Davon profitieren
alle.

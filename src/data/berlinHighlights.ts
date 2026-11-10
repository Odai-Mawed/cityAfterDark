// Kuratierte Auswahl echter Berliner Orte.
// Auswahl: Web-Recherche (Nachtleben-Guides, Nov. 2026). Koordinaten, Adressen und
// Öffnungszeiten: OpenStreetMap über Nominatim, abgerufen am 10.11.2026.
// © OpenStreetMap-Mitwirkende, ODbL. Beschreibungen: eigene Kurztexte.
// Dient als Offline-Auswahl, wenn Overpass nicht erreichbar ist, und markiert
// diese Orte in den Live-Daten als „Berliner Institution“.
import type { CategoryId, Place, Tags } from '../core/types';

export interface Highlight {
  id: string;
  lat: number;
  lon: number;
  tags: Tags;
  highlight: string;
}

export const BERLIN_HIGHLIGHTS_DATE = '10.11.2026';

export const BERLIN_HIGHLIGHTS: Highlight[] = [
  {
    "id": "node/6341225967",
    "lat": 52.511167,
    "lon": 13.443036,
    "tags": {
      "smoking": "yes",
      "live_music": "yes",
      "wheelchair": "yes",
      "contact:website": "https://www.berghain.de",
      "name": "Berghain",
      "amenity": "nightclub",
      "addr:street": "Am Wriezener Bahnhof",
      "addr:postcode": "10243",
      "addr:city": "Berlin",
      "addr:suburb": "Friedrichshain"
    },
    "highlight": "Techno-Institution im ehemaligen Heizkraftwerk. Die Klubnacht läuft laut Web-Quellen meist von Samstag 24 Uhr bis Montagfrüh, strenge Tür."
  },
  {
    "id": "node/4870128450",
    "lat": 52.510681,
    "lon": 13.419484,
    "tags": {
      "smoking": "no",
      "live_music": "yes",
      "wheelchair": "yes",
      "contact:website": "https://tresorberlin.com",
      "name": "Tresor Berlin",
      "amenity": "nightclub",
      "addr:street": "Köpenicker Straße",
      "addr:housenumber": "70",
      "addr:postcode": "10179",
      "addr:city": "Berlin",
      "addr:suburb": "Mitte"
    },
    "highlight": "Techno-Klassiker seit 1991, heute im Kraftwerk an der Köpenicker Straße."
  },
  {
    "id": "node/2876098523",
    "lat": 52.510595,
    "lon": 13.419789,
    "tags": {
      "smoking": "no",
      "website": "https://ohmberlin.com/",
      "name": "Ohm",
      "amenity": "nightclub",
      "addr:street": "Köpenicker Straße",
      "addr:housenumber": "70",
      "addr:postcode": "10179",
      "addr:city": "Berlin",
      "addr:suburb": "Mitte"
    },
    "highlight": "Kleiner Club im ehemaligen Umspannwerk, direkt neben dem Tresor."
  },
  {
    "id": "way/148829988",
    "lat": 52.493326,
    "lon": 13.491899,
    "tags": {
      "smoking": "separated",
      "wheelchair": "yes",
      "opening_hours": "Mar-Dec: Sa,Su,PH 00:00-24:00",
      "contact:website": "http://www.sisyphos-berlin.net",
      "name": "Sisyphos",
      "amenity": "nightclub",
      "addr:street": "Hauptstraße",
      "addr:housenumber": "15",
      "addr:postcode": "10317",
      "addr:city": "Berlin",
      "addr:suburb": "Rummelsburg"
    },
    "highlight": "Weitläufiges Club-Gelände in einer alten Fabrik am Rummelsburger See, oft von Freitagnacht bis Montag."
  },
  {
    "id": "way/293386107",
    "lat": 52.511903,
    "lon": 13.425365,
    "tags": {
      "smoking": "separated",
      "wheelchair": "yes",
      "contact:website": "http://www.katerblau.de",
      "name": "Kater Blau",
      "amenity": "nightclub",
      "addr:street": "Holzmarktstraße",
      "addr:housenumber": "25",
      "addr:postcode": "10243",
      "addr:city": "Berlin",
      "addr:suburb": "Friedrichshain"
    },
    "highlight": "Club mit Spreeufer auf dem Holzmarkt-Gelände."
  },
  {
    "id": "node/729294555",
    "lat": 52.511207,
    "lon": 13.416916,
    "tags": {
      "smoking": "yes",
      "live_music": "yes",
      "wheelchair": "limited",
      "contact:website": "http://www.kitkatclub.org",
      "name": "Kit Kat Club",
      "amenity": "nightclub",
      "addr:street": "Köpenicker Straße",
      "addr:housenumber": "76",
      "addr:postcode": "10179",
      "addr:city": "Berlin",
      "addr:suburb": "Mitte"
    },
    "highlight": "Bekannter Fetisch- und Techno-Club – Dresscode beachten."
  },
  {
    "id": "node/979969868",
    "lat": 52.503012,
    "lon": 13.408136,
    "tags": {
      "smoking": "no",
      "wheelchair": "yes",
      "opening_hours": "\"siehe Website\"",
      "contact:website": "https://club.ritterbutzke.com",
      "name": "Ritter Butzke",
      "amenity": "nightclub",
      "addr:street": "Ritterstraße",
      "addr:housenumber": "26",
      "addr:postcode": "10969",
      "addr:city": "Berlin",
      "addr:suburb": "Kreuzberg"
    },
    "highlight": "Club in einer alten Fabrik in Kreuzberg, laut Web-Quellen meist Fr & Sa ab 18 Uhr bis in den Morgen."
  },
  {
    "id": "way/232536532",
    "lat": 52.495248,
    "lon": 13.462778,
    "tags": {
      "wheelchair": "no",
      "opening_hours": "Tu-Sa 16:00+",
      "contact:website": "http://else.tv/",
      "name": "Else",
      "amenity": "nightclub",
      "addr:street": "An den Treptowers",
      "addr:housenumber": "10",
      "addr:postcode": "12435",
      "addr:city": "Berlin",
      "addr:suburb": "Alt-Treptow"
    },
    "highlight": "Open-Air-Club an der Spree bei den Treptowers, vor allem im Sommer."
  },
  {
    "id": "way/355476495",
    "lat": 52.507612,
    "lon": 13.474944,
    "tags": {
      "lgbtq": "welcome",
      "wheelchair": "limited",
      "contact:website": "https://oxi-garten.de/",
      "name": "OXI",
      "amenity": "nightclub",
      "addr:street": "Wiesenweg",
      "addr:housenumber": "1-4",
      "addr:postcode": "10365",
      "addr:city": "Berlin",
      "addr:suburb": "Lichtenberg"
    },
    "highlight": "Techno-Club in Lichtenberg, nah am Ostkreuz."
  },
  {
    "id": "node/8069721818",
    "lat": 52.497068,
    "lon": 13.465032,
    "tags": {
      "phone": "+49 30 29369990",
      "website": "https://clubost.de/",
      "name": "OST",
      "amenity": "nightclub",
      "addr:street": "Alt-Stralau",
      "addr:housenumber": "1-2",
      "addr:postcode": "10245",
      "addr:city": "Berlin",
      "addr:suburb": "Friedrichshain"
    },
    "highlight": "Club in Alt-Stralau, wenige Minuten vom Ostkreuz."
  },
  {
    "id": "node/5906879511",
    "lat": 52.502477,
    "lon": 13.466302,
    "tags": {
      "smoking": "yes",
      "wheelchair": "yes",
      "opening_hours": "Fr,Sa,Su,PH \"je nach Veranstaltung\"",
      "contact:website": "https://aboutblank.li",
      "name": "://about blank",
      "amenity": "nightclub",
      "addr:street": "Markgrafendamm",
      "addr:housenumber": "24c",
      "addr:postcode": "10245",
      "addr:city": "Berlin",
      "addr:suburb": "Friedrichshain"
    },
    "highlight": "Kollektiv-Club mit Garten am Ostkreuz, Zeiten je nach Veranstaltung."
  },
  {
    "id": "way/36908987",
    "lat": 52.496065,
    "lon": 13.387474,
    "tags": {
      "smoking": "isolated",
      "wheelchair": "yes",
      "opening_hours": "\"Je nach Veranstaltung\"",
      "contact:website": "https://www.gretchen-club.de/",
      "name": "Gretchen",
      "amenity": "nightclub",
      "addr:street": "Obentrautstraße",
      "addr:housenumber": "19-21",
      "addr:postcode": "10963",
      "addr:city": "Berlin",
      "addr:suburb": "Kreuzberg"
    },
    "highlight": "Club für Konzerte und Partys in Kreuzberg."
  },
  {
    "id": "node/339749949",
    "lat": 52.504678,
    "lon": 13.449021,
    "tags": {
      "smoking": "isolated",
      "wheelchair": "limited",
      "opening_hours": "Mo-Su 22:00-07:00",
      "contact:website": "https://www.matrix-berlin.de/",
      "name": "Matrix",
      "amenity": "nightclub",
      "addr:street": "Warschauer Platz",
      "addr:housenumber": "18",
      "addr:postcode": "10245",
      "addr:city": "Berlin",
      "addr:suburb": "Friedrichshain"
    },
    "highlight": "Großer Club in den Bögen unter dem Bahnhof Warschauer Straße."
  },
  {
    "id": "node/891502072",
    "lat": 52.529737,
    "lon": 13.397179,
    "tags": {
      "cuisine": "juice;coffee_shop",
      "smoking": "yes",
      "website": "https://schokoladen-mitte.de/",
      "wheelchair": "limited",
      "opening_hours": "Tu-Th 19:00-02:00, Fr-Sa 19:00-03:00",
      "outdoor_seating": "yes",
      "name": "Schokoladen",
      "amenity": "bar",
      "addr:street": "Ackerstraße",
      "addr:housenumber": "169",
      "addr:postcode": "10115",
      "addr:city": "Berlin",
      "addr:suburb": "Mitte"
    },
    "highlight": "Kulturprojekt in Mitte mit Konzerten und Bar."
  },
  {
    "id": "node/512575817",
    "lat": 52.491959,
    "lon": 13.388557,
    "tags": {
      "smoking": "yes",
      "website": "https://clash-berlin.de/",
      "wheelchair": "limited",
      "name": "Clash",
      "amenity": "pub",
      "addr:street": "Gneisenaustraße",
      "addr:housenumber": "2",
      "addr:postcode": "10961",
      "addr:city": "Berlin",
      "addr:suburb": "Kreuzberg"
    },
    "highlight": "Kreuzberger Kneipe mit Konzerten, laut Web-Quellen bis tief in die Nacht geöffnet."
  },
  {
    "id": "node/2496651187",
    "lat": 52.490386,
    "lon": 13.387044,
    "tags": {
      "phone": "+49 30 6925124",
      "smoking": "yes",
      "website": "https://destille-kreuzberg.de",
      "wheelchair": "limited",
      "opening_hours": "Mo-Sa 15:00-05:00, Su 15:00-02:00",
      "outdoor_seating": "yes",
      "name": "Destille",
      "amenity": "pub",
      "addr:street": "Mehringdamm",
      "addr:housenumber": "67",
      "addr:postcode": "10961",
      "addr:city": "Berlin",
      "addr:suburb": "Kreuzberg"
    },
    "highlight": "Kneipe am Mehringdamm, unter der Woche bis 5 Uhr früh."
  },
  {
    "id": "node/2941462114",
    "lat": 52.482071,
    "lon": 13.431332,
    "tags": {
      "amenity": "bar",
      "cuisine": "sandwich",
      "smoking": "outside",
      "website": "https://klunkerkranich.org/",
      "wheelchair": "yes",
      "opening_hours": "Mo-We 17:00-00:00; Th 16:00-02:00; Fr-Sa 16:00-03:00; Su 16:00-00:00",
      "outdoor_seating": "yes",
      "name": "Klunkerkranich",
      "addr:street": "Karl-Marx-Straße",
      "addr:housenumber": "66",
      "addr:postcode": "12043",
      "addr:city": "Berlin",
      "addr:suburb": "Neukölln"
    },
    "highlight": "Dachgarten-Bar auf einem Parkhausdeck in Neukölln, mit Blick über die Stadt."
  },
  {
    "id": "node/459645666",
    "lat": 52.482771,
    "lon": 13.43746,
    "tags": {
      "smoking": "yes",
      "wheelchair": "limited",
      "opening_hours": "24/7",
      "outdoor_seating": "yes",
      "name": "Bierbaum 2",
      "amenity": "pub",
      "addr:street": "Sonnenallee",
      "addr:housenumber": "86",
      "addr:postcode": "12045",
      "addr:city": "Berlin",
      "addr:suburb": "Neukölln"
    },
    "highlight": "Kneipe an der Sonnenallee, laut OpenStreetMap rund um die Uhr geöffnet."
  },
  {
    "id": "node/4908049915",
    "lat": 52.51146,
    "lon": 13.457831,
    "tags": {
      "wheelchair": "no",
      "opening_hours": "Mo-Su 00:00-24:00",
      "name": "Spätkauf 24h",
      "shop": "convenience",
      "addr:street": "Grünberger Straße",
      "addr:housenumber": "64",
      "addr:postcode": "10245",
      "addr:city": "Berlin",
      "addr:suburb": "Friedrichshain"
    },
    "highlight": "Späti in Friedrichshain, rund um die Uhr geöffnet."
  }
];

/** Highlights as app places (classified like live OSM data). */
export function highlightPlaces(classify: (tags: Tags) => { category: CategoryId; kind: string } | null): Place[] {
  return BERLIN_HIGHLIGHTS.flatMap((h): Place[] => {
    const cls = classify(h.tags);
    return cls
      ? [{ id: h.id, lat: h.lat, lon: h.lon, name: h.tags.name ?? cls.kind, category: cls.category, kind: cls.kind, tags: h.tags, highlight: h.highlight }]
      : [];
  });
}

export const HIGHLIGHT_BY_ID = new Map(BERLIN_HIGHLIGHTS.map((h) => [h.id, h.highlight]));

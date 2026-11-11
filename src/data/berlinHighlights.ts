// Kuratierte Auswahl echter Berliner Orte.
// Auswahl: Web-Recherche (Nachtleben-, Bar-, Konzert-, Imbiss- und Queer-Guides sowie Resident Advisor, Nov. 2026).
// Club-Beschreibungen teils nach Angaben von RA (ra.co), in eigenen Worten. Koordinaten, Adressen und
// Öffnungszeiten: OpenStreetMap über Nominatim, abgerufen am 10./11.11.2026.
// © OpenStreetMap-Mitwirkende, ODbL. Beschreibungen: eigene Kurztexte.
// Dient als Offline-Auswahl, wenn Overpass nicht erreichbar ist, und markiert
// diese Orte in den Live-Daten als „Berlin-Tipp“.
import type { CategoryId, Place, Tags } from '../core/types';

export interface Highlight {
  id: string;
  lat: number;
  lon: number;
  tags: Tags;
  highlight: string;
  /** Club page on Resident Advisor (programme, tickets). */
  ra?: string;
}

export const BERLIN_HIGHLIGHTS_DATE = '11.11.2026';

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
    "highlight": "Techno-Institution im ehemaligen Heizkraftwerk mit drei Floors (Berghain, Panorama Bar, Säule). Die Klubnacht läuft meist von Samstag 24 Uhr bis Montagfrüh; strenge Tür, Fotoverbot.",
    "ra": "https://ra.co/clubs/5031"
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
    "highlight": "Techno-Klassiker seit 1991 im Kraftwerk an der Köpenicker Straße – mit dem Tresor-Keller und dem musikalisch offeneren Globus.",
    "ra": "https://ra.co/clubs/5494"
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
    "highlight": "Kleiner Club im ehemaligen Batterieraum des Kraftwerks, direkt neben dem Tresor.",
    "ra": "https://ra.co/clubs/75457"
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
    "highlight": "Weitläufiges Gelände in einer alten Fabrik am Rummelsburger See mit Halle und Garten. Partys oft von Freitagnacht bis Montag, Line-ups werden fast nie angekündigt.",
    "ra": "https://ra.co/clubs/17118"
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
    "highlight": "Club an der Spree auf dem Holzmarkt-Gelände, heißt inzwischen nur noch „Kater“: House-, Techno- und Leftfield-Floors plus Terrasse am Wasser."
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
    "highlight": "Fetisch- und Techno-Club gleich um die Ecke vom Tresor – Dresscode beachten.",
    "ra": "https://ra.co/clubs/10546"
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
    "highlight": "Club im Erdgeschoss einer alten Fabrik in Kreuzberg, meist Fr & Sa bis in den Morgen.",
    "ra": "https://ra.co/clubs/6950"
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
    "highlight": "Club nahe Ostkreuz (früheres Kosmonaut-Gelände), bekannt für experimentelle Bookings, queer-freundlich, im Sommer mit Terrasse."
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
    "highlight": "Kollektiv-Club mit Garten am Ostkreuz in einem umgenutzten Gebäude, vor allem House und Techno.",
    "ra": "https://ra.co/clubs/28354"
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
    "highlight": "Großer Club in den Bögen unter dem Bahnhof Warschauer Straße.",
    "ra": "https://ra.co/clubs/49006"
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
  },
  {
    "id": "node/30022140",
    "lat": 52.493492,
    "lon": 13.387687,
    "tags": {
      "cuisine": "sausage",
      "smoking": "outside",
      "wheelchair": "yes",
      "opening_hours": "Mo-Su,PH 09:00-05:00",
      "contact:website": "https://curry36.de/mehringdamm/",
      "outdoor_seating": "sidewalk",
      "name": "Curry 36",
      "amenity": "fast_food",
      "addr:street": "Mehringdamm",
      "addr:housenumber": "36",
      "addr:postcode": "10961",
      "addr:suburb": "Kreuzberg",
      "addr:city": "Berlin"
    },
    "highlight": "Currywurst-Klassiker am Mehringdamm, laut OpenStreetMap täglich bis 5 Uhr früh."
  },
  {
    "id": "node/7060011377",
    "lat": 52.493449,
    "lon": 13.388524,
    "tags": {
      "cuisine": "kebab",
      "wheelchair": "yes",
      "opening_hours": "Mo-Th 10:00-01:00, Fr 13:00-03:00, Sa 10:00-02:00, Su 10:00-01:00",
      "contact:website": "http://www.mustafas.de",
      "outdoor_seating": "no",
      "name": "Mustafa's Gemüse Kebap",
      "amenity": "fast_food",
      "addr:street": "Mehringdamm",
      "addr:housenumber": "33",
      "addr:postcode": "10961",
      "addr:suburb": "Kreuzberg",
      "addr:city": "Berlin"
    },
    "highlight": "Berühmter Gemüse-Kebap am Mehringdamm, oft mit langer Schlange."
  },
  {
    "id": "node/997194070",
    "lat": 52.490494,
    "lon": 13.422942,
    "tags": {
      "phone": "+49 30 43027868",
      "cuisine": "middle_eastern",
      "wheelchair": "limited",
      "opening_hours": "Mo-Su 08:00-02:00",
      "outdoor_seating": "yes",
      "name": "Imren Grill",
      "amenity": "fast_food",
      "addr:street": "Boppstraße",
      "addr:housenumber": "10",
      "addr:postcode": "10967",
      "addr:suburb": "Kreuzberg",
      "addr:city": "Berlin"
    },
    "highlight": "Döner-Imbiss in Kreuzberg, laut OpenStreetMap täglich bis 2 Uhr."
  },
  {
    "id": "node/2687685191",
    "lat": 52.529842,
    "lon": 13.400808,
    "tags": {
      "cuisine": "turkish",
      "smoking": "no",
      "wheelchair": "no",
      "opening_hours": "24/7",
      "outdoor_seating": "yes",
      "name": "Rosenthaler Grill und Schlemmerbuffet",
      "amenity": "fast_food",
      "addr:street": "Torstraße",
      "addr:housenumber": "125",
      "addr:postcode": "10119",
      "addr:suburb": "Mitte",
      "addr:city": "Berlin"
    },
    "highlight": "Imbiss am Rosenthaler Platz, rund um die Uhr geöffnet – Anlaufstelle nach dem Feiern."
  },
  {
    "id": "node/1908183924",
    "lat": 52.501121,
    "lon": 13.442458,
    "tags": {
      "cuisine": "burger",
      "smoking": "outside",
      "wheelchair": "yes",
      "opening_hours": "Mo-Th 11:00-03:00, Fr 11:00-04:00, Sa 12:00-04:00, Su 12:00-03:00",
      "contact:website": "http://www.burger-meister.de",
      "outdoor_seating": "yes",
      "name": "Burgermeister",
      "amenity": "fast_food",
      "addr:street": "Oberbaumstraße",
      "addr:housenumber": "8",
      "addr:postcode": "10997",
      "addr:suburb": "Kreuzberg",
      "addr:city": "Berlin"
    },
    "highlight": "Burger-Imbiss in einem alten Toilettenhäuschen unter der U1 am Schlesischen Tor."
  },
  {
    "id": "node/871610948",
    "lat": 52.501083,
    "lon": 13.416616,
    "tags": {
      "smoking": "no",
      "wheelchair": "no",
      "opening_hours": "Mo-Su,PH 19:00-03:00+",
      "contact:website": "http://www.wuergeengel.de/",
      "name": "Würgeengel",
      "amenity": "pub",
      "addr:street": "Dresdener Straße",
      "addr:housenumber": "122",
      "addr:postcode": "10999",
      "addr:suburb": "Kreuzberg",
      "addr:city": "Berlin"
    },
    "highlight": "Bar mit 50er-Jahre-Interieur neben dem Kino Babylon in Kreuzberg."
  },
  {
    "id": "node/1190874905",
    "lat": 52.484871,
    "lon": 13.437557,
    "tags": {
      "wheelchair": "limited",
      "outdoor_seating": "yes",
      "name": "Tier",
      "amenity": "pub",
      "addr:street": "Weserstraße",
      "addr:postcode": "12045",
      "addr:suburb": "Neukölln",
      "addr:city": "Berlin"
    },
    "highlight": "Eine der bekanntesten Bars an der Weserstraße in Neukölln."
  },
  {
    "id": "node/5352672812",
    "lat": 52.497532,
    "lon": 13.424177,
    "tags": {
      "smoking": "isolated",
      "wheelchair": "no",
      "name": "Bohnengold",
      "amenity": "pub",
      "addr:street": "Reichenberger Straße",
      "addr:housenumber": "153",
      "addr:postcode": "10999",
      "addr:suburb": "Kreuzberg",
      "addr:city": "Berlin"
    },
    "highlight": "Entspannte Wohnzimmer-Kneipe in der Reichenberger Straße."
  },
  {
    "id": "node/2432755484",
    "lat": 52.502204,
    "lon": 13.432854,
    "tags": {
      "smoking": "yes",
      "name": "Schwarze Traube",
      "amenity": "bar",
      "addr:street": "Wrangelstraße",
      "addr:housenumber": "24",
      "addr:postcode": "10997",
      "addr:suburb": "Kreuzberg",
      "addr:city": "Berlin"
    },
    "highlight": "Kleine Bar im Wrangelkiez, bekannt für Drinks nach Wunsch."
  },
  {
    "id": "node/288468824",
    "lat": 52.492721,
    "lon": 13.421701,
    "tags": {
      "wheelchair": "no",
      "opening_hours": "24/7",
      "name": "Bei Schlawinchen",
      "amenity": "pub",
      "addr:street": "Schönleinstraße",
      "addr:housenumber": "34",
      "addr:postcode": "10967",
      "addr:suburb": "Kreuzberg",
      "addr:city": "Berlin"
    },
    "highlight": "Urige Kreuzberger Kneipe, laut OpenStreetMap rund um die Uhr geöffnet."
  },
  {
    "id": "node/616308956",
    "lat": 52.500058,
    "lon": 13.417443,
    "tags": {
      "lgbtq": "welcome",
      "smoking": "yes",
      "website": "https://www.moebel-olfe.de/",
      "wheelchair": "yes",
      "opening_hours": "Tu-Sa 18:00+",
      "outdoor_seating": "yes",
      "name": "Möbel Olfe",
      "amenity": "bar",
      "addr:street": "Reichenberger Straße",
      "addr:housenumber": "177",
      "addr:postcode": "10999",
      "addr:suburb": "Kreuzberg",
      "addr:city": "Berlin"
    },
    "highlight": "Queere Bar am Kottbusser Tor – laut Web-Quellen dienstags FLINTA*-, donnerstags Gay-Abend."
  },
  {
    "id": "node/4034138654",
    "lat": 52.500536,
    "lon": 13.421642,
    "tags": {
      "lgbtq": "welcome",
      "phone": "+49 30 6156570",
      "smoking": "no",
      "wheelchair": "no",
      "name": "Roses Bar",
      "amenity": "bar",
      "addr:street": "Oranienstraße",
      "addr:housenumber": "187",
      "addr:postcode": "10999",
      "addr:suburb": "Kreuzberg",
      "addr:city": "Berlin"
    },
    "highlight": "Kleine, plüschige queere Bar an der Oranienstraße."
  },
  {
    "id": "way/65425822",
    "lat": 52.498545,
    "lon": 13.416795,
    "tags": {
      "lgbtq": "welcome",
      "phone": "+49 30 60941853",
      "cuisine": "salad;german;burger",
      "smoking": "isolated",
      "website": "https://www.suedblock.org/",
      "wheelchair": "yes",
      "opening_hours": "Mo-Sa 17:00-23:00; Su 15:00-23:00",
      "contact:website": "http://www.suedblock.org",
      "outdoor_seating": "yes",
      "name": "Südblock",
      "amenity": "bar",
      "addr:street": "Admiralstraße",
      "addr:housenumber": "1-2",
      "addr:postcode": "10999",
      "addr:suburb": "Kreuzberg",
      "addr:city": "Berlin"
    },
    "highlight": "Queere Bar und Kiez-Treff am Kottbusser Tor mit Terrasse und vielen Veranstaltungen."
  },
  {
    "id": "node/1589659413",
    "lat": 52.503083,
    "lon": 13.366354,
    "tags": {
      "smoking": "yes",
      "website": "http://kumpelnest3000.com/",
      "wheelchair": "no",
      "outdoor_seating": "yes",
      "name": "Kumpelnest 3000",
      "amenity": "bar",
      "addr:street": "Lützowstraße",
      "addr:postcode": "10785",
      "addr:suburb": "Tiergarten",
      "addr:city": "Berlin"
    },
    "highlight": "Legendäre Bar in einem ehemaligen Bordell in Tiergarten, ab spät abends voll."
  },
  {
    "id": "node/9673939669",
    "lat": 52.49961,
    "lon": 13.437406,
    "tags": {
      "phone": "+493098442730",
      "website": "https://madameclaude.de/",
      "wheelchair": "no",
      "name": "Madame Claude",
      "amenity": "pub",
      "addr:street": "Lübbener Straße",
      "addr:housenumber": "19",
      "addr:postcode": "10997",
      "addr:suburb": "Kreuzberg",
      "addr:city": "Berlin",
      "live_music": "yes"
    },
    "highlight": "Bar, in der die Möbel an der Decke hängen, mit Konzerten und Open Mics."
  },
  {
    "id": "way/150186494",
    "lat": 52.495823,
    "lon": 13.420585,
    "tags": {
      "cuisine": "fish;german",
      "smoking": "isolated",
      "wheelchair": "limited",
      "opening_hours": "Mo-Th 10:00-03:00, Fr,Sa 10:00-04:00, Su 10:00-01:00",
      "contact:website": "http://www.ankerklause.de/",
      "outdoor_seating": "yes",
      "name": "Ankerklause",
      "amenity": "pub",
      "addr:street": "Kottbusser Damm",
      "addr:housenumber": "104",
      "addr:postcode": "10967",
      "addr:suburb": "Kreuzberg",
      "addr:city": "Berlin"
    },
    "highlight": "Kneipe am Landwehrkanal mit Blick aufs Wasser, bis 3–4 Uhr geöffnet."
  },
  {
    "id": "node/1394776930",
    "lat": 52.508947,
    "lon": 13.460623,
    "tags": {
      "smoking": "separated",
      "wheelchair": "no",
      "opening_hours": "Mo-Th 17:00-01:00, Sa,Su 14:00+, Fr 16:00+",
      "contact:website": "http://hopsandbarley-berlin.de/",
      "outdoor_seating": "yes",
      "name": "Hops & Barley",
      "amenity": "pub",
      "addr:street": "Wühlischstraße",
      "addr:housenumber": "22/23",
      "addr:postcode": "10245",
      "addr:suburb": "Friedrichshain",
      "addr:city": "Berlin"
    },
    "highlight": "Kleine Hausbrauerei-Kneipe im Boxhagener Kiez."
  },
  {
    "id": "node/955932511",
    "lat": 52.501249,
    "lon": 13.431629,
    "tags": {
      "website": "https://www.pyonen.de/tantelisbeth/",
      "wheelchair": "limited",
      "opening_hours": "Mo-Fr 16:00-02:00+, Sa,Su 14:00-02:00+",
      "outdoor_seating": "no",
      "name": "Tante Lisbeth",
      "amenity": "pub",
      "addr:street": "Muskauer Straße",
      "addr:housenumber": "49",
      "addr:postcode": "10997",
      "addr:suburb": "Kreuzberg",
      "addr:city": "Berlin"
    },
    "highlight": "Kreuzberger Eckkneipe in der Muskauer Straße."
  },
  {
    "id": "node/1108168284",
    "lat": 52.499275,
    "lon": 13.419472,
    "tags": {
      "smoking": "yes",
      "wheelchair": "no",
      "contact:website": "http://www.kottimonarch.de/",
      "outdoor_seating": "no",
      "name": "Monarch",
      "amenity": "pub",
      "addr:street": "Skalitzer Straße",
      "addr:housenumber": "134",
      "addr:postcode": "10999",
      "addr:suburb": "Kreuzberg",
      "addr:city": "Berlin",
      "live_music": "yes"
    },
    "highlight": "Bar über dem Kaiser's am Kottbusser Tor mit Konzerten und Partys."
  },
  {
    "id": "node/4034138645",
    "lat": 52.500391,
    "lon": 13.422161,
    "tags": {
      "smoking": "isolated",
      "live_music": "yes",
      "wheelchair": "yes",
      "opening_hours": "\"Je nach Programm\"",
      "contact:website": "https://www.so36.de",
      "name": "SO36",
      "amenity": "nightclub",
      "addr:street": "Oranienstraße",
      "addr:housenumber": "190",
      "addr:postcode": "10999",
      "addr:suburb": "Kreuzberg",
      "addr:city": "Berlin"
    },
    "highlight": "Punk- und Konzertclub an der Oranienstraße, seit 1978 Teil der Kreuzberger Szene."
  },
  {
    "id": "node/360111407",
    "lat": 52.499217,
    "lon": 13.445075,
    "tags": {
      "smoking": "isolated",
      "live_music": "yes",
      "wheelchair": "yes",
      "contact:website": "https://www.lido-berlin.de/",
      "name": "Lido",
      "amenity": "nightclub",
      "addr:street": "Cuvrystraße",
      "addr:housenumber": "7",
      "addr:postcode": "10997",
      "addr:suburb": "Kreuzberg",
      "addr:city": "Berlin"
    },
    "highlight": "Ehemaliges Kino an der Cuvrystraße, heute Club für Indie- und Rock-Konzerte."
  },
  {
    "id": "way/123019464",
    "lat": 52.507582,
    "lon": 13.45515,
    "tags": {
      "wheelchair": "limited",
      "contact:website": "http://www.badehaus-berlin.com/",
      "name": "Badehaus",
      "amenity": "nightclub",
      "addr:street": "Revaler Straße",
      "addr:housenumber": "99",
      "addr:postcode": "10245",
      "addr:suburb": "Friedrichshain",
      "addr:city": "Berlin",
      "live_music": "yes"
    },
    "highlight": "Konzert- und Clubbühne auf dem RAW-Gelände."
  },
  {
    "id": "way/684464913",
    "lat": 52.507245,
    "lon": 13.454789,
    "tags": {
      "live_music": "yes",
      "wheelchair": "limited",
      "contact:website": "https://cassiopeia-berlin.de/",
      "name": "Cassiopeia",
      "amenity": "nightclub",
      "addr:street": "Revaler Straße",
      "addr:housenumber": "99",
      "addr:postcode": "10245",
      "addr:suburb": "Friedrichshain",
      "addr:city": "Berlin"
    },
    "highlight": "Konzertclub mit Partys auf dem RAW-Gelände."
  },
  {
    "id": "node/1667559178",
    "lat": 52.500756,
    "lon": 13.441461,
    "tags": {
      "leisure": "music_venue",
      "website": "http://www.bi-nuu.de/",
      "wheelchair": "yes",
      "name": "Bi Nuu",
      "amenity": "nightclub",
      "addr:street": "Skalitzer Straße",
      "addr:postcode": "10997",
      "addr:suburb": "Kreuzberg",
      "addr:city": "Berlin",
      "live_music": "yes"
    },
    "highlight": "Konzertclub in den Bögen am U-Bahnhof Schlesisches Tor."
  },
  {
    "id": "way/277805717",
    "lat": 52.496823,
    "lon": 13.451556,
    "tags": {
      "phone": "+49 30 403655630",
      "smoking": "outside",
      "website": "https://www.festsaal-kreuzberg.de/",
      "wheelchair": "yes",
      "name": "Festsaal Kreuzberg",
      "amenity": "nightclub",
      "addr:street": "Am Flutgraben",
      "addr:housenumber": "2",
      "addr:postcode": "12435",
      "addr:suburb": "Alt-Treptow",
      "addr:city": "Berlin",
      "live_music": "yes"
    },
    "highlight": "Konzert-Venue, inzwischen am Flutgraben in Treptow."
  },
  {
    "id": "node/2147941967",
    "lat": 52.500071,
    "lon": 13.434849,
    "tags": {
      "phone": "+49 30 35522598",
      "amenity": "music_venue",
      "wheelchair": "yes",
      "contact:website": "http://www.privatclub-berlin.de",
      "name": "Privatclub",
      "leisure": "music_venue",
      "addr:street": "Skalitzer Straße",
      "addr:housenumber": "85-86",
      "addr:postcode": "10997",
      "addr:suburb": "Kreuzberg",
      "addr:city": "Berlin",
      "live_music": "yes"
    },
    "highlight": "Kleiner Konzertkeller in der Skalitzer Straße."
  },
  {
    "id": "node/410135945",
    "lat": 52.497469,
    "lon": 13.431097,
    "tags": {
      "website": "http://wildatheartberlin.de",
      "wheelchair": "no",
      "opening_hours": "\"When they host a concert, doors opens at 20h. Otherwise they are closed\"",
      "name": "Wild at Heart",
      "amenity": "nightclub",
      "addr:street": "Wiener Straße",
      "addr:postcode": "10999",
      "addr:suburb": "Kreuzberg",
      "addr:city": "Berlin",
      "live_music": "yes"
    },
    "highlight": "Rock'n'Roll- und Punk-Bar mit Konzerten in der Wiener Straße."
  },
  {
    "id": "node/1370001597",
    "lat": 52.5033,
    "lon": 13.408727,
    "tags": {
      "smoking": "yes",
      "wheelchair": "yes",
      "contact:website": "https://www.princecharlesberlin.com/",
      "name": "Prince Charles",
      "amenity": "nightclub",
      "addr:street": "Prinzenstraße",
      "addr:housenumber": "85f",
      "addr:postcode": "10969",
      "addr:suburb": "Kreuzberg",
      "addr:city": "Berlin"
    },
    "highlight": "Club in einem ehemaligen Schwimmbad am Moritzplatz."
  },
  {
    "id": "node/256754256",
    "lat": 52.525899,
    "lon": 13.411436,
    "tags": {
      "wheelchair": "limited",
      "opening_hours": "Mo-Fr 17:00+; Sa,Su \"eine halbe Stunde vor der ersten Vorstellung\"",
      "contact:website": "http://www.babylonberlin.de",
      "name": "Babylon",
      "amenity": "cinema",
      "addr:street": "Rosa-Luxemburg-Straße",
      "addr:housenumber": "30",
      "addr:postcode": "10178",
      "addr:suburb": "Mitte",
      "addr:city": "Berlin"
    },
    "highlight": "Programmkino am Rosa-Luxemburg-Platz mit Spätvorstellungen."
  },
  {
    "id": "node/448811295",
    "lat": 52.490334,
    "lon": 13.423401,
    "tags": {
      "phone": "+49 30 6924785",
      "website": "https://www.moviemento.de/",
      "wheelchair": "no",
      "name": "Moviemento",
      "amenity": "cinema",
      "addr:street": "Kottbusser Damm",
      "addr:housenumber": "22",
      "addr:postcode": "10967",
      "addr:suburb": "Kreuzberg",
      "addr:city": "Berlin"
    },
    "highlight": "Ältestes noch bespieltes Kino Berlins, am Kottbusser Damm."
  },
  {
    "id": "way/24240975",
    "lat": 52.520682,
    "lon": 13.423045,
    "tags": {
      "wheelchair": "yes",
      "opening_hours": "\"30 minutes before first screening\"",
      "contact:website": "https://yorck.de/kinos/kino-international",
      "name": "Kino International",
      "amenity": "cinema",
      "addr:street": "Karl-Marx-Allee",
      "addr:housenumber": "33",
      "addr:postcode": "10178",
      "addr:suburb": "Mitte",
      "addr:city": "Berlin"
    },
    "highlight": "DDR-Premierenkino an der Karl-Marx-Allee."
  },
  {
    "id": "way/291111616",
    "lat": 52.497313,
    "lon": 13.449516,
    "tags": {
      "website": "http://aedenberlin.com",
      "wheelchair": "no",
      "opening_hours": "Tu 22:00-08:00; Th 22:00-08:00; Fr 22:00-10:00; Sa 18:00-10:00",
      "name": "ÆDEN",
      "amenity": "nightclub",
      "addr:street": "Schleusenufer",
      "addr:housenumber": "3",
      "addr:postcode": "10997",
      "addr:suburb": "Kreuzberg",
      "addr:city": "Berlin"
    },
    "highlight": "Club auf der Lohmühleninsel in Kreuzberg mit zwei Indoor-Floors, im Sommer mit Open-Air-Floor; Live-Musik, Kunst und Performance.",
    "ra": "https://ra.co/clubs/187744"
  },
  {
    "id": "way/23787721",
    "lat": 52.487314,
    "lon": 13.477479,
    "tags": {
      "website": "https://zenner.berlin",
      "name": "Zenner",
      "amenity": "nightclub",
      "addr:street": "Alt-Treptow",
      "addr:housenumber": "14-17",
      "addr:postcode": "12435",
      "addr:suburb": "Alt-Treptow",
      "addr:city": "Berlin"
    },
    "highlight": "Club mitten im Treptower Park mit zwei Floors und großem Außenbereich.",
    "ra": "https://ra.co/clubs/188239"
  },
  {
    "id": "node/11804553537",
    "lat": 52.459911,
    "lon": 13.505335,
    "tags": {
      "website": "https://www.reviersuedost.de",
      "live_music": "yes",
      "wheelchair": "limited",
      "name": "RSO.Berlin",
      "amenity": "nightclub",
      "addr:street": "Schnellerstraße",
      "addr:postcode": "12439",
      "addr:suburb": "Niederschöneweide",
      "addr:city": "Berlin"
    },
    "highlight": "Mehrräumiger Club in Schöneweide auf dem früheren Griessmühle-Gelände, seit 2021."
  },
  {
    "id": "way/45001954",
    "lat": 52.50717,
    "lon": 13.451077,
    "tags": {
      "smoking": "yes",
      "website": "https://www.lokschuppen-berlin.com/",
      "wheelchair": "limited",
      "name": "Lokschuppen",
      "amenity": "nightclub",
      "addr:street": "Revaler Straße",
      "addr:housenumber": "99",
      "addr:postcode": "10245",
      "addr:suburb": "Friedrichshain",
      "addr:city": "Berlin"
    },
    "highlight": "Großer Veranstaltungsort im alten Lokschuppen auf dem RAW-Gelände.",
    "ra": "https://ra.co/clubs/293771"
  },
  {
    "id": "node/485640732",
    "lat": 52.49739,
    "lon": 13.465307,
    "tags": {
      "smoking": "yes",
      "wheelchair": "no",
      "opening_hours": "Th 18:00+; Fr 16:00+; Sa 14:00+",
      "contact:website": "https://www.renate.cc",
      "outdoor_seating": "yes",
      "name": "Zur Wilden Renate",
      "amenity": "nightclub",
      "addr:street": "Alt-Stralau",
      "addr:housenumber": "70",
      "addr:postcode": "10245",
      "addr:suburb": "Friedrichshain",
      "addr:city": "Berlin"
    },
    "highlight": "Club in einem verwinkelten Altbau in Alt-Stralau, Wohnzimmer-Atmosphäre auf mehreren Etagen. RA führt ihn als „Renate“."
  }
];

/** Highlights as app places (classified like live OSM data). */
export function highlightPlaces(classify: (tags: Tags) => { category: CategoryId; kind: string } | null): Place[] {
  return BERLIN_HIGHLIGHTS.flatMap((h): Place[] => {
    const cls = classify(h.tags);
    return cls
      ? [{ id: h.id, lat: h.lat, lon: h.lon, name: h.tags.name ?? cls.kind, category: cls.category, kind: cls.kind, tags: h.tags, highlight: h.highlight, ra: h.ra }]
      : [];
  });
}

export const HIGHLIGHT_BY_ID = new Map(BERLIN_HIGHLIGHTS.map((h) => [h.id, h]));

// Tankstellen in der Berliner Innenstadt – echte Daten aus OpenStreetMap
// (Nominatim, abgerufen am 11.11.2026). © OpenStreetMap-Mitwirkende, ODbL.
// Grunddaten, die sofort erscheinen; Live-Daten aus Overpass ergänzen/ersetzen sie.
import { placeName } from '../core/overpass';
import type { Place, Tags } from '../core/types';

interface FuelStation {
  id: string;
  lat: number;
  lon: number;
  tags: Tags;
}

const STATIONS: FuelStation[] = [
  {
    "id": "way/364588563",
    "lat": 52.481566,
    "lon": 13.441281,
    "tags": {
      "amenity": "fuel",
      "name": "Aral",
      "opening_hours": "24/7",
      "website": "https://tankstelle.aral.de/tankstelle/berlin/sonnenallee-113/11029500/",
      "wheelchair": "yes",
      "compressed_air": "yes",
      "addr:street": "Sonnenallee",
      "addr:housenumber": "113",
      "addr:postcode": "12045",
      "addr:suburb": "Neukölln",
      "addr:city": "Berlin"
    }
  },
  {
    "id": "way/547040234",
    "lat": 52.484599,
    "lon": 13.429252,
    "tags": {
      "amenity": "fuel",
      "name": "Sprint",
      "opening_hours": "24/7",
      "wheelchair": "yes",
      "compressed_air": "yes",
      "addr:street": "Reuterstraße",
      "addr:housenumber": "18-19",
      "addr:postcode": "12043",
      "addr:suburb": "Neukölln",
      "addr:city": "Berlin"
    }
  },
  {
    "id": "node/1892331562",
    "lat": 52.465764,
    "lon": 13.442995,
    "tags": {
      "amenity": "fuel",
      "name": "JET",
      "opening_hours": "24/7",
      "website": "https://www.jet-tankstellen.de/kraftstoff/filialfinder/XJ05811",
      "compressed_air": "yes",
      "addr:street": "Karl-Marx-Straße",
      "addr:housenumber": "259-263",
      "addr:postcode": "12057",
      "addr:suburb": "Neukölln",
      "addr:city": "Berlin"
    }
  },
  {
    "id": "node/271882472",
    "lat": 52.465272,
    "lon": 13.443016,
    "tags": {
      "amenity": "fuel",
      "name": "Shell",
      "opening_hours": "24/7",
      "website": "https://www.shell.de/",
      "wheelchair": "limited",
      "compressed_air": "yes",
      "addr:street": "Karl-Marx-Straße",
      "addr:housenumber": "267",
      "addr:postcode": "12057",
      "addr:suburb": "Neukölln",
      "addr:city": "Berlin"
    }
  },
  {
    "id": "node/12313785836",
    "lat": 52.504065,
    "lon": 13.408343,
    "tags": {
      "amenity": "fuel",
      "name": "Shell",
      "website": "http://www.shell.de",
      "wheelchair": "limited",
      "compressed_air": "yes",
      "addr:street": "Oranienstraße",
      "addr:housenumber": "138",
      "addr:postcode": "10969",
      "addr:suburb": "Kreuzberg",
      "addr:city": "Berlin"
    }
  },
  {
    "id": "way/932153077",
    "lat": 52.501986,
    "lon": 13.409774,
    "tags": {
      "amenity": "fuel",
      "name": "Aral",
      "opening_hours": "24/7",
      "wheelchair": "yes",
      "compressed_air": "no",
      "addr:street": "Prinzenstraße",
      "addr:housenumber": "29",
      "addr:postcode": "10969",
      "addr:suburb": "Kreuzberg",
      "addr:city": "Berlin"
    }
  },
  {
    "id": "node/12208920752",
    "lat": 52.540701,
    "lon": 13.393173,
    "tags": {
      "amenity": "fuel",
      "name": "Aral",
      "opening_hours": "24/7",
      "compressed_air": "yes",
      "addr:street": "Brunnenstraße",
      "addr:housenumber": "119",
      "addr:postcode": "13355",
      "addr:suburb": "Gesundbrunnen",
      "addr:city": "Berlin"
    }
  },
  {
    "id": "way/379688485",
    "lat": 52.5005,
    "lon": 13.376601,
    "tags": {
      "amenity": "fuel",
      "name": "TotalEnergies Tempelhofer Ufer",
      "opening_hours": "24/7",
      "website": "https://www.circlek-deutschland.de/",
      "wheelchair": "yes",
      "compressed_air": "yes",
      "car_wash": "yes",
      "addr:housenumber": "33-35",
      "addr:postcode": "10963",
      "addr:suburb": "Kreuzberg",
      "addr:city": "Berlin"
    }
  },
  {
    "id": "node/3163972569",
    "lat": 52.492754,
    "lon": 13.390369,
    "tags": {
      "amenity": "fuel",
      "name": "Esso",
      "wheelchair": "yes",
      "compressed_air": "no",
      "addr:street": "Gneisenaustraße",
      "addr:housenumber": "106",
      "addr:postcode": "10961",
      "addr:suburb": "Kreuzberg",
      "addr:city": "Berlin"
    }
  },
  {
    "id": "node/669888809",
    "lat": 52.528872,
    "lon": 13.41825,
    "tags": {
      "amenity": "fuel",
      "name": "Total",
      "opening_hours": "24/7",
      "wheelchair": "limited",
      "compressed_air": "yes",
      "addr:street": "Prenzlauer Allee",
      "addr:housenumber": "1",
      "addr:postcode": "10405",
      "addr:suburb": "Prenzlauer Berg",
      "addr:city": "Berlin"
    }
  },
  {
    "id": "node/64707597",
    "lat": 52.513854,
    "lon": 13.421876,
    "tags": {
      "amenity": "fuel",
      "name": "Aral",
      "opening_hours": "24/7",
      "website": "https://tankstelle.aral.de/tankstelle/berlin/holzmarktstrasse-1214/27100000/",
      "wheelchair": "limited",
      "compressed_air": "yes",
      "addr:street": "Holzmarktstraße",
      "addr:housenumber": "12/14",
      "addr:postcode": "10179",
      "addr:suburb": "Mitte",
      "addr:city": "Berlin"
    }
  },
  {
    "id": "way/255182361",
    "lat": 52.537447,
    "lon": 13.37548,
    "tags": {
      "amenity": "fuel",
      "name": "TotalEnergies Chausseestraße",
      "opening_hours": "24/7",
      "website": "https://www.circlek-deutschland.de/",
      "wheelchair": "limited",
      "compressed_air": "yes",
      "car_wash": "yes",
      "addr:housenumber": "61",
      "addr:postcode": "10115",
      "addr:suburb": "Mitte",
      "addr:city": "Berlin"
    }
  },
  {
    "id": "node/2820273578",
    "lat": 52.469461,
    "lon": 13.462115,
    "tags": {
      "amenity": "fuel",
      "name": "Aral",
      "opening_hours": "24/7",
      "website": "https://tankstelle.aral.de/tankstelle/berlin/grenzallee-6/11034500/",
      "wheelchair": "yes",
      "compressed_air": "yes",
      "addr:street": "Grenzallee",
      "addr:housenumber": "6",
      "addr:postcode": "12057",
      "addr:suburb": "Neukölln",
      "addr:city": "Berlin"
    }
  },
  {
    "id": "node/12295940984",
    "lat": 52.498772,
    "lon": 13.422852,
    "tags": {
      "amenity": "fuel",
      "name": "Aral",
      "opening_hours": "24/7",
      "wheelchair": "yes",
      "compressed_air": "no",
      "addr:street": "Skalitzer Straße",
      "addr:housenumber": "26",
      "addr:postcode": "10999",
      "addr:suburb": "Kreuzberg",
      "addr:city": "Berlin"
    }
  },
  {
    "id": "node/272517807",
    "lat": 52.489294,
    "lon": 13.374468,
    "tags": {
      "amenity": "fuel",
      "name": "JET",
      "opening_hours": "24/7",
      "website": "https://www.jet.de/tankstellen/berlin/kreuzbergstrasse-41",
      "wheelchair": "limited",
      "compressed_air": "yes",
      "addr:street": "Kreuzbergstraße",
      "addr:housenumber": "41",
      "addr:postcode": "10965",
      "addr:suburb": "Schöneberg",
      "addr:city": "Berlin"
    }
  },
  {
    "id": "node/12303608936",
    "lat": 52.484604,
    "lon": 13.38146,
    "tags": {
      "amenity": "fuel",
      "name": "Aral",
      "opening_hours": "Mo-Su,PH 00:00-24:00+",
      "compressed_air": "yes",
      "addr:street": "Dudenstraße",
      "addr:housenumber": "19;21",
      "addr:postcode": "10965",
      "addr:suburb": "Tempelhof",
      "addr:city": "Berlin"
    }
  },
  {
    "id": "node/12312317164",
    "lat": 52.55469,
    "lon": 13.391796,
    "tags": {
      "amenity": "fuel",
      "name": "Shell",
      "opening_hours": "Mo-Su,PH 00:00+",
      "wheelchair": "yes",
      "compressed_air": "yes",
      "addr:street": "Jülicher Straße",
      "addr:housenumber": "1",
      "addr:postcode": "13357",
      "addr:suburb": "Gesundbrunnen",
      "addr:city": "Berlin"
    }
  },
  {
    "id": "node/12307330205",
    "lat": 52.525405,
    "lon": 13.357041,
    "tags": {
      "amenity": "fuel",
      "name": "Aral",
      "opening_hours": "24/7",
      "wheelchair": "yes",
      "compressed_air": "yes",
      "addr:street": "Rathenower Straße",
      "addr:housenumber": "8",
      "addr:postcode": "10559",
      "addr:suburb": "Moabit",
      "addr:city": "Berlin"
    }
  },
  {
    "id": "node/9222066871",
    "lat": 52.555215,
    "lon": 13.384325,
    "tags": {
      "amenity": "fuel",
      "name": "Shell",
      "opening_hours": "Mo-Su,PH 00:00-24:00",
      "website": "https://www.shell.de/",
      "wheelchair": "yes",
      "compressed_air": "yes",
      "addr:street": "Prinzenallee",
      "addr:housenumber": "20",
      "addr:postcode": "13357",
      "addr:suburb": "Gesundbrunnen",
      "addr:city": "Berlin"
    }
  },
  {
    "id": "way/263824280",
    "lat": 52.519909,
    "lon": 13.355156,
    "tags": {
      "amenity": "fuel",
      "name": "Shell",
      "opening_hours": "24/7",
      "wheelchair": "limited",
      "compressed_air": "yes",
      "addr:street": "Paulstraße",
      "addr:housenumber": "20",
      "addr:postcode": "10557",
      "addr:suburb": "Moabit",
      "addr:city": "Berlin"
    }
  },
  {
    "id": "way/37419537",
    "lat": 52.499207,
    "lon": 13.433106,
    "tags": {
      "amenity": "fuel",
      "name": "Shell",
      "opening_hours": "24/7",
      "website": "https://find.shell.com/de/fuel/10026602-berlin-skalitzer-str-48/de_DE",
      "wheelchair": "no",
      "compressed_air": "no",
      "addr:street": "Skalitzer Straße",
      "addr:housenumber": "48",
      "addr:postcode": "10997",
      "addr:suburb": "Kreuzberg",
      "addr:city": "Berlin"
    }
  },
  {
    "id": "node/308811402",
    "lat": 52.556368,
    "lon": 13.415022,
    "tags": {
      "amenity": "fuel",
      "name": "Shell",
      "opening_hours": "PH,Mo-Su 06:00-22:00",
      "wheelchair": "yes",
      "compressed_air": "yes",
      "addr:street": "Berliner Straße",
      "addr:housenumber": "83",
      "addr:postcode": "13189",
      "addr:suburb": "Prenzlauer Berg",
      "addr:city": "Berlin"
    }
  },
  {
    "id": "node/388418547",
    "lat": 52.563621,
    "lon": 13.407693,
    "tags": {
      "amenity": "fuel",
      "name": "Aral",
      "opening_hours": "24/7",
      "wheelchair": "yes",
      "compressed_air": "yes",
      "addr:street": "Mühlenstraße",
      "addr:housenumber": "26",
      "addr:postcode": "13187",
      "addr:suburb": "Pankow",
      "addr:city": "Berlin"
    }
  },
  {
    "id": "node/669891011",
    "lat": 52.530777,
    "lon": 13.441158,
    "tags": {
      "amenity": "fuel",
      "name": "Total Station",
      "opening_hours": "24/7",
      "website": "http://store.total.de/de/germany/store-total-de/berlin/berlin-margarete-sommer-str-2/ND020487",
      "wheelchair": "yes",
      "compressed_air": "yes",
      "addr:street": "Margarete-Sommer-Straße",
      "addr:housenumber": "2",
      "addr:postcode": "10407",
      "addr:suburb": "Prenzlauer Berg",
      "addr:city": "Berlin"
    }
  },
  {
    "id": "node/3241060681",
    "lat": 52.55887,
    "lon": 13.370438,
    "tags": {
      "amenity": "fuel",
      "name": "Sprint",
      "opening_hours": "05:00-23:00",
      "compressed_air": "yes",
      "addr:street": "Residenzstraße",
      "addr:housenumber": "79",
      "addr:postcode": "13409",
      "addr:suburb": "Gesundbrunnen",
      "addr:city": "Berlin"
    }
  },
  {
    "id": "node/1964624280",
    "lat": 52.535374,
    "lon": 13.350318,
    "tags": {
      "amenity": "fuel",
      "name": "Westfehling",
      "opening_hours": "Mo-Fr 05:00-22:00; Sa 07:00-22:00; Su 09:00-22:00",
      "compressed_air": "yes",
      "addr:street": "Quitzowstraße",
      "addr:housenumber": "33",
      "addr:postcode": "10559",
      "addr:suburb": "Moabit",
      "addr:city": "Berlin"
    }
  },
  {
    "id": "way/38070640",
    "lat": 52.470188,
    "lon": 13.372089,
    "tags": {
      "amenity": "fuel",
      "name": "Total",
      "opening_hours": "24/7",
      "website": "http://store.total.de/de/germany/store-total-de/berlin/berlin-schoeneberger-str/ND039149",
      "wheelchair": "yes",
      "compressed_air": "yes",
      "addr:street": "Schöneberger Straße",
      "addr:housenumber": "17",
      "addr:postcode": "12103",
      "addr:suburb": "Tempelhof",
      "addr:city": "Berlin"
    }
  },
  {
    "id": "way/1329644964",
    "lat": 52.533784,
    "lon": 13.445084,
    "tags": {
      "amenity": "fuel",
      "name": "Sprint",
      "opening_hours": "Mo-Su,PH 00:00-24:00",
      "wheelchair": "yes",
      "compressed_air": "yes",
      "addr:street": "Kniprodestraße",
      "addr:housenumber": "25",
      "addr:postcode": "10407",
      "addr:suburb": "Prenzlauer Berg",
      "addr:city": "Berlin"
    }
  },
  {
    "id": "way/341796303",
    "lat": 52.496385,
    "lon": 13.346634,
    "tags": {
      "amenity": "fuel",
      "name": "Shell",
      "opening_hours": "24/7",
      "wheelchair": "yes",
      "compressed_air": "yes",
      "car_wash": "yes",
      "addr:street": "Martin-Luther-Straße",
      "addr:housenumber": "29",
      "addr:postcode": "10777",
      "addr:suburb": "Schöneberg",
      "addr:city": "Berlin"
    }
  },
  {
    "id": "node/260753895",
    "lat": 52.470025,
    "lon": 13.37099,
    "tags": {
      "amenity": "fuel",
      "name": "Aral",
      "wheelchair": "yes",
      "compressed_air": "yes",
      "car_wash": "yes",
      "addr:street": "Schöneberger Straße",
      "addr:housenumber": "20",
      "addr:postcode": "12103",
      "addr:suburb": "Tempelhof",
      "addr:city": "Berlin"
    }
  },
  {
    "id": "node/27259583",
    "lat": 52.519722,
    "lon": 13.341421,
    "tags": {
      "amenity": "fuel",
      "name": "Esso",
      "wheelchair": "no",
      "compressed_air": "yes",
      "addr:street": "Lessingstraße",
      "addr:housenumber": "4",
      "addr:postcode": "10555",
      "addr:suburb": "Hansaviertel",
      "addr:city": "Berlin"
    }
  },
  {
    "id": "node/9225259022",
    "lat": 52.559626,
    "lon": 13.428752,
    "tags": {
      "amenity": "fuel",
      "name": "Jet",
      "opening_hours": "24/7",
      "compressed_air": "yes",
      "addr:street": "Prenzlauer Promenade",
      "addr:housenumber": "41-42",
      "addr:postcode": "13089",
      "addr:suburb": "Heinersdorf",
      "addr:city": "Berlin"
    }
  },
  {
    "id": "node/12306559594",
    "lat": 52.53833,
    "lon": 13.343769,
    "tags": {
      "amenity": "fuel",
      "name": "Agip",
      "opening_hours": "Mo-Fr 05:00-23:00; Sa 06:00-23:00; Su,PH 07:00-22:00",
      "compressed_air": "yes",
      "addr:street": "Westhafenstraße",
      "addr:housenumber": "1-3",
      "addr:postcode": "13353",
      "addr:suburb": "Moabit",
      "addr:city": "Berlin"
    }
  },
  {
    "id": "node/2886852045",
    "lat": 52.558344,
    "lon": 13.432699,
    "tags": {
      "amenity": "fuel",
      "name": "Elan",
      "opening_hours": "24/7",
      "shop": "convenience",
      "compressed_air": "yes",
      "addr:street": "Tino-Schwierzina-Straße",
      "addr:housenumber": "37",
      "addr:postcode": "13089",
      "addr:suburb": "Heinersdorf",
      "addr:city": "Berlin"
    }
  },
  {
    "id": "node/6895416926",
    "lat": 52.478647,
    "lon": 13.35506,
    "tags": {
      "amenity": "fuel",
      "name": "Shell",
      "opening_hours": "24/7",
      "website": "https://find.shell.com/de/fuel/10026616-berlin-sachsendamm-90-92/de_DE",
      "shop": "yes",
      "compressed_air": "yes",
      "addr:street": "Sachsendamm",
      "addr:housenumber": "90-92",
      "addr:postcode": "10829",
      "addr:suburb": "Schöneberg",
      "addr:city": "Berlin"
    }
  },
  {
    "id": "node/2286559092",
    "lat": 52.464547,
    "lon": 13.377083,
    "tags": {
      "amenity": "fuel",
      "name": "Shell",
      "compressed_air": "yes",
      "addr:street": "Manteuffelstraße",
      "addr:housenumber": "6",
      "addr:postcode": "12103",
      "addr:suburb": "Tempelhof",
      "addr:city": "Berlin"
    }
  },
  {
    "id": "node/303068243",
    "lat": 52.49012,
    "lon": 13.345465,
    "tags": {
      "amenity": "fuel",
      "name": "Esso",
      "opening_hours": "Mo-Su,PH 00:00-24:00",
      "wheelchair": "yes",
      "compressed_air": "yes",
      "addr:street": "Martin-Luther-Straße",
      "addr:housenumber": "67",
      "addr:postcode": "10779",
      "addr:suburb": "Schöneberg",
      "addr:city": "Berlin"
    }
  },
  {
    "id": "node/16541597",
    "lat": 52.546315,
    "lon": 13.345599,
    "tags": {
      "amenity": "fuel",
      "name": "Aral",
      "opening_hours": "24/7",
      "wheelchair": "no",
      "compressed_air": "yes",
      "addr:street": "Seestraße",
      "addr:postcode": "13353",
      "addr:suburb": "Wedding",
      "addr:city": "Berlin"
    }
  }
];

export const BERLIN_FUEL: Place[] = STATIONS.map((s) => ({
  id: s.id,
  lat: s.lat,
  lon: s.lon,
  name: placeName(s.tags, 'Tankstelle'),
  category: 'fuel',
  kind: (s.tags.opening_hours ?? '').trim() === '24/7' ? 'Tankstelle 24h' : 'Tankstelle',
  tags: s.tags,
}));

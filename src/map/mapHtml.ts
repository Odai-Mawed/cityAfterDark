import { MAPLIBRE_CSS, MAPLIBRE_JS } from './mapAssets';
import { buildMapStyle, type MapStyleConfig } from './tiles';

export interface MapInit {
  lat: number;
  lon: number;
  /** Zoom in classic 256px-tile levels (as used by the rest of the app). */
  zoom: number;
}

/**
 * Self-contained MapLibre GL page with vector tiles. The same HTML runs inside
 * a WebView on iOS/Android and inside an iframe on the web; it talks to React
 * via postMessage (see protocol.ts).
 *
 * MapLibre uses 512px tiles, so its zoom is one lower than the classic 256px
 * zoom the app works with – converted at the boundary (Z_OFFSET).
 */
const CONTROLLER = String.raw`
(function () {
  var init = window.__CAD_INIT__;
  var Z_OFFSET = 1;
  var EMPTY = { type: 'FeatureCollection', features: [] };
  var FALLBACK_STYLE = {
    version: 8,
    sources: {},
    layers: [{ id: 'bg', type: 'background', paint: { 'background-color': '#0b0b14' } }],
  };

  var map = new maplibregl.Map({
    container: 'map',
    style: init.map.style,
    center: [init.lon, init.lat],
    zoom: init.zoom - Z_OFFSET,
    attributionControl: { compact: true },
    dragRotate: false,
    pitchWithRotate: false,
    touchPitch: false,
    maxPitch: 0,
    fadeDuration: 150,
  });
  map.touchZoomRotate.disableRotation();
  map.keyboard.disableRotation();

  var loaded = false;
  var labelsEnabled = !!init.map.labelFont;
  var pending = [];
  var data = { markers: [], lines: [] };
  var selectedId = null;
  var userPos = null;
  var fallbackUsed = false;

  function send(msg) {
    var s = JSON.stringify(msg);
    if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(s);
    else if (window.parent && window.parent !== window) window.parent.postMessage(s, '*');
  }

  // If the base map can't load (offline, blocked, bad key) keep the app usable
  // on a plain dark background.
  function useFallback() {
    if (loaded || fallbackUsed) return;
    fallbackUsed = true;
    labelsEnabled = false;
    map.setStyle(FALLBACK_STYLE);
  }
  var fallbackTimer = setTimeout(useFallback, 10000);
  map.on('error', function () { if (!loaded && !map.isStyleLoaded()) useFallback(); });

  // ── GeoJSON builders ────────────────────────────────────────────────
  function placesGeo() {
    return {
      type: 'FeatureCollection',
      features: data.markers.map(function (m) {
        return {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [m.lon, m.lat] },
          properties: { id: m.id, name: m.name, emoji: m.emoji, color: m.color, state: m.state, sel: m.id === selectedId },
        };
      }),
    };
  }
  function lineSelected() {
    return data.lines.some(function (l) { return l.id === selectedId; });
  }
  function linesGeo() {
    var anySel = lineSelected();
    return {
      type: 'FeatureCollection',
      features: data.lines.map(function (l) {
        var sel = l.id === selectedId;
        return {
          type: 'Feature',
          geometry: {
            type: 'MultiLineString',
            coordinates: l.coords.map(function (seg) { return seg.map(function (p) { return [p[1], p[0]]; }); }),
          },
          properties: { id: l.id, label: l.label, color: l.color, dim: !!l.dim && !sel, sel: sel, faded: anySel && !sel },
        };
      }),
    };
  }
  function stopsGeo() {
    var feats = [];
    data.lines.forEach(function (l) {
      (l.stops || []).forEach(function (s) {
        feats.push({
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [s.lon, s.lat] },
          properties: { name: s.name ? s.name + ' · ' + l.ref : l.ref, color: l.color, sel: l.id === selectedId },
        });
      });
    });
    return { type: 'FeatureCollection', features: feats };
  }
  function userGeo() {
    return userPos
      ? { type: 'FeatureCollection', features: [{ type: 'Feature', geometry: { type: 'Point', coordinates: [userPos.lon, userPos.lat] }, properties: {} }] }
      : EMPTY;
  }

  function refresh() {
    if (!loaded) return;
    map.getSource('cad-places').setData(placesGeo());
    map.getSource('cad-lines').setData(linesGeo());
    map.getSource('cad-stops').setData(stopsGeo());
    map.getSource('cad-user').setData(userGeo());
  }

  // ── Layers ──────────────────────────────────────────────────────────
  function safeAddLayer(def) {
    try { map.addLayer(def); } catch (e) { console.error('layer ' + def.id + ': ' + e.message); }
  }
  function addLayers() {
    map.addSource('cad-lines', { type: 'geojson', data: EMPTY });
    map.addSource('cad-stops', { type: 'geojson', data: EMPTY });
    map.addSource('cad-places', { type: 'geojson', data: EMPTY });
    map.addSource('cad-user', { type: 'geojson', data: EMPTY });

    safeAddLayer({
      id: 'cad-lines-casing', type: 'line', source: 'cad-lines',
      filter: ['==', ['get', 'sel'], true],
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: { 'line-color': '#0b0b14', 'line-width': 10, 'line-opacity': 0.8 },
    });
    safeAddLayer({
      id: 'cad-lines', type: 'line', source: 'cad-lines',
      filter: ['==', ['get', 'dim'], false],
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: {
        'line-color': ['get', 'color'],
        'line-width': ['interpolate', ['linear'], ['zoom'], 10, ['case', ['get', 'sel'], 6, 2], 15, ['case', ['get', 'sel'], 6, 4]],
        'line-opacity': ['case', ['get', 'faded'], 0.3, 0.85],
      },
    });
    safeAddLayer({
      id: 'cad-lines-dim', type: 'line', source: 'cad-lines',
      filter: ['==', ['get', 'dim'], true],
      layout: { 'line-join': 'round' },
      paint: { 'line-color': ['get', 'color'], 'line-width': 2.5, 'line-opacity': 0.35, 'line-dasharray': [2, 2] },
    });
    var stopPaint = {
      'circle-radius': ['case', ['get', 'sel'], 4.5, 3],
      'circle-color': '#0b0b14',
      'circle-stroke-color': ['get', 'color'],
      'circle-stroke-width': 2,
    };
    // all stops from (classic) zoom 15, the selected line's stops always
    safeAddLayer({ id: 'cad-stops', type: 'circle', source: 'cad-stops', minzoom: 15 - Z_OFFSET, paint: stopPaint });
    safeAddLayer({ id: 'cad-stops-sel', type: 'circle', source: 'cad-stops', filter: ['==', ['get', 'sel'], true], paint: stopPaint });
    safeAddLayer({
      id: 'cad-places', type: 'circle', source: 'cad-places',
      paint: {
        'circle-radius': [
          'interpolate', ['linear'], ['zoom'],
          11, ['case', ['get', 'sel'], 9, ['match', ['get', 'state'], 'open', 4.5, 3.5]],
          15, ['case', ['get', 'sel'], 11, ['match', ['get', 'state'], 'open', 8, 6]],
        ],
        'circle-color': ['get', 'color'],
        'circle-opacity': ['case', ['get', 'sel'], 1, ['match', ['get', 'state'], 'open', 0.95, 'unknown', 0.5, 0.22]],
        'circle-stroke-color': ['case', ['get', 'sel'], '#ffffff', ['==', ['get', 'state'], 'unknown'], ['get', 'color'], '#0b0b14'],
        'circle-stroke-width': ['case', ['get', 'sel'], 3, 1.3],
        'circle-stroke-opacity': ['match', ['get', 'state'], 'closed', 0.5, 1],
      },
    });
    if (labelsEnabled) {
      safeAddLayer({
        id: 'cad-place-labels', type: 'symbol', source: 'cad-places', minzoom: 16 - Z_OFFSET,
        layout: {
          'text-field': ['get', 'name'],
          'text-font': init.map.labelFont,
          'text-size': 12,
          'text-offset': [0, 1.1],
          'text-anchor': 'top',
          'text-max-width': 9,
          'text-optional': true,
        },
        paint: { 'text-color': '#ececf5', 'text-halo-color': '#0b0b14', 'text-halo-width': 1.6 },
      });
    }
    safeAddLayer({
      id: 'cad-user-halo', type: 'circle', source: 'cad-user',
      paint: { 'circle-radius': 16, 'circle-color': '#4da3ff', 'circle-opacity': 0.2 },
    });
    safeAddLayer({
      id: 'cad-user', type: 'circle', source: 'cad-user',
      paint: { 'circle-radius': 6, 'circle-color': '#4da3ff', 'circle-stroke-color': '#fff', 'circle-stroke-width': 2 },
    });
  }

  // ── Interaction ─────────────────────────────────────────────────────
  var HIT_LAYERS = ['cad-places', 'cad-lines', 'cad-lines-dim'];
  function featureAt(point) {
    var pad = 10;
    var feats = map.queryRenderedFeatures(
      [[point.x - pad, point.y - pad], [point.x + pad, point.y + pad]],
      { layers: HIT_LAYERS.filter(function (l) { return map.getLayer(l); }) }
    );
    var place = feats.filter(function (f) { return f.layer.id === 'cad-places'; })[0];
    return place || feats[0] || null;
  }

  var tip = new maplibregl.Popup({ closeButton: false, closeOnClick: false, className: 'cad-tip', offset: 12 });
  function onHover(e) {
    var f = featureAt(e.point);
    map.getCanvas().style.cursor = f ? 'pointer' : '';
    if (!f) { tip.remove(); return; }
    var p = f.properties;
    tip.setLngLat(e.lngLat).setText(p.emoji ? p.emoji + ' ' + p.name : p.label).addTo(map);
  }

  function select(id, pan) {
    selectedId = id;
    refresh();
    if (!id || !pan || !loaded) return;
    var m = data.markers.filter(function (x) { return x.id === id; })[0];
    if (m) {
      map.easeTo({ center: [m.lon, m.lat], duration: 500 });
      return;
    }
    var l = data.lines.filter(function (x) { return x.id === id; })[0];
    if (l) {
      var b = new maplibregl.LngLatBounds();
      l.coords.forEach(function (seg) { seg.forEach(function (p) { b.extend([p[1], p[0]]); }); });
      if (!b.isEmpty()) map.fitBounds(b, { padding: 50, maxZoom: 15 - Z_OFFSET, duration: 600 });
    }
  }

  function sendRegion() {
    var b = map.getBounds();
    var c = map.getCenter();
    send({
      type: 'region',
      bbox: { south: b.getSouth(), west: b.getWest(), north: b.getNorth(), east: b.getEast() },
      center: { lat: c.lat, lon: c.lng },
      zoom: map.getZoom() + Z_OFFSET,
    });
  }

  function handle(raw) {
    var msg;
    try { msg = typeof raw === 'string' ? JSON.parse(raw) : raw; } catch (e) { return; }
    if (!msg || !msg.type) return;
    if (!loaded && msg.type !== 'setData' && msg.type !== 'select' && msg.type !== 'user') {
      pending.push(msg);
      return;
    }
    switch (msg.type) {
      case 'setData':
        data = { markers: msg.markers || [], lines: msg.lines || [] };
        refresh();
        break;
      case 'select': select(msg.id, msg.pan); break;
      case 'flyTo':
        map.flyTo({ center: [msg.lon, msg.lat], zoom: msg.zoom ? msg.zoom - Z_OFFSET : map.getZoom(), duration: 900 });
        break;
      case 'fitBounds':
        map.fitBounds([[msg.bbox.west, msg.bbox.south], [msg.bbox.east, msg.bbox.north]], { maxZoom: 15 - Z_OFFSET });
        break;
      case 'user':
        userPos = { lat: msg.lat, lon: msg.lon };
        refresh();
        break;
      case 'invalidate': map.resize(); break;
    }
  }

  window.__cadReceive = handle;
  window.addEventListener('message', function (e) { handle(e.data); });
  document.addEventListener('message', function (e) { handle(e.data); }); // Android WebView

  map.on('load', function () {
    if (loaded) return;
    loaded = true;
    clearTimeout(fallbackTimer);
    // keep the attribution collapsed to its (i) button on small screens
    var attrib = document.querySelector('.maplibregl-ctrl-attrib');
    if (attrib && window.innerWidth < 700) attrib.classList.remove('maplibregl-compact-show');
    addLayers();
    refresh();
    map.on('mousemove', onHover);
    map.on('mouseout', function () { tip.remove(); });
    map.on('click', function (e) {
      var f = featureAt(e.point);
      send({ type: 'select', id: f ? f.properties.id : null });
    });
    map.on('moveend', sendRegion);
    pending.splice(0).forEach(handle);
    sendRegion();
  });
  window.addEventListener('resize', function () { map.resize(); });

  send({ type: 'ready' });
})();
`;

const PAGE_CSS = `
html, body, #map { margin: 0; padding: 0; width: 100%; height: 100%; background: #0b0b14; }
body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
.maplibregl-ctrl-attrib { background: rgba(11,11,20,0.75) !important; color: #8888a8; font-size: 10px; }
.maplibregl-ctrl-attrib a { color: #b9a6ff; }
.maplibregl-ctrl-attrib-button { filter: invert(1); }
.cad-tip .maplibregl-popup-content { background: #1e1e30; color: #ececf5; border: 1px solid #34344d; border-radius: 8px;
  box-shadow: 0 4px 14px rgba(0,0,0,.5); font-size: 13px; padding: 4px 8px; pointer-events: none; }
.cad-tip .maplibregl-popup-tip { display: none; }
`;

const safeScript = (s: string) => s.replace(/<\/script/gi, '<\\/script');

export function buildMapHtml(init: MapInit, style: MapStyleConfig = buildMapStyle()): string {
  const config = JSON.stringify({ ...init, map: style }).replace(/</g, '\\u003c');
  return `<!DOCTYPE html>
<html lang="de"><head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
<style>${MAPLIBRE_CSS}</style>
<style>${PAGE_CSS}</style>
</head><body>
<div id="map"></div>
<script>${safeScript(MAPLIBRE_JS)}</script>
<script>window.__CAD_INIT__ = ${config};</script>
<script>${safeScript(CONTROLLER)}</script>
</body></html>`;
}

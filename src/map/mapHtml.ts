import { LEAFLET_CSS, LEAFLET_JS } from './leafletAssets';

export interface MapInit {
  lat: number;
  lon: number;
  zoom: number;
}

/**
 * Self-contained Leaflet map page. The same HTML runs inside a WebView on
 * iOS/Android and inside an iframe on the web; it talks to React via
 * postMessage (see protocol.ts).
 */
const CONTROLLER = String.raw`
(function () {
  var init = window.__CAD_INIT__;
  var map = L.map('map', {
    zoomControl: false,
    preferCanvas: true,
    attributionControl: true,
    worldCopyJump: true,
  }).setView([init.lat, init.lon], init.zoom);

  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    maxZoom: 20,
    subdomains: 'abcd',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
  }).addTo(map);
  map.attributionControl.setPrefix('');

  var renderer = L.canvas({ padding: 0.3, tolerance: 6 });
  var linesLayer = L.layerGroup().addTo(map);
  var stopsLayer = L.layerGroup().addTo(map);
  var markersLayer = L.layerGroup().addTo(map);
  var userLayer = L.layerGroup().addTo(map);
  var markers = {};
  var lineLayers = {};
  var selectedId = null;
  var lastData = null;

  function send(msg) {
    var s = JSON.stringify(msg);
    if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(s);
    else if (window.parent && window.parent !== window) window.parent.postMessage(s, '*');
  }

  function styleFor(m, selected) {
    var fill = m.state === 'open' ? 0.92 : m.state === 'unknown' ? 0.5 : 0.22;
    return {
      renderer: renderer,
      radius: selected ? 11 : m.state === 'open' ? 7 : 5.5,
      color: selected ? '#ffffff' : m.state === 'unknown' ? m.color : '#0b0b14',
      weight: selected ? 3 : m.state === 'unknown' ? 1.5 : 1.2,
      dashArray: m.state === 'unknown' && !selected ? '2 3' : null,
      fillColor: m.color,
      fillOpacity: selected ? 1 : fill,
      opacity: m.state === 'closed' && !selected ? 0.5 : 1,
    };
  }

  function sendRegion() {
    var b = map.getBounds();
    var c = map.getCenter();
    send({
      type: 'region',
      bbox: { south: b.getSouth(), west: b.getWest(), north: b.getNorth(), east: b.getEast() },
      center: { lat: c.lat, lon: c.lng },
      zoom: map.getZoom(),
    });
  }

  function setData(data) {
    lastData = data;
    markersLayer.clearLayers();
    linesLayer.clearLayers();
    stopsLayer.clearLayers();
    markers = {};
    lineLayers = {};
    var lineSelected = (data.lines || []).some(function (l) { return l.id === selectedId; });
    (data.lines || []).forEach(function (l) {
      var sel = l.id === selectedId;
      var poly = L.polyline(l.coords, {
        renderer: renderer,
        color: l.color,
        weight: sel ? 6 : 3.5,
        opacity: lineSelected && !sel ? 0.3 : 0.85,
        lineCap: 'round',
      });
      poly.bindTooltip(l.label, { sticky: true, className: 'cad-tip' });
      poly.on('click', function (e) {
        L.DomEvent.stop(e);
        send({ type: 'select', id: l.id });
      });
      poly.addTo(linesLayer);
      lineLayers[l.id] = poly;
      if (sel || map.getZoom() >= 15) {
        (l.stops || []).forEach(function (s) {
          var st = L.circleMarker([s.lat, s.lon], {
            renderer: renderer, radius: sel ? 4.5 : 3, color: l.color, weight: 2, fillColor: '#0b0b14', fillOpacity: 1,
          });
          if (s.name) st.bindTooltip(s.name + ' · ' + l.ref, { className: 'cad-tip' });
          st.addTo(stopsLayer);
        });
      }
    });
    (data.markers || []).forEach(function (m) {
      var cm = L.circleMarker([m.lat, m.lon], styleFor(m, m.id === selectedId));
      cm.bindTooltip(m.emoji + ' ' + m.name, { direction: 'top', offset: [0, -6], className: 'cad-tip' });
      cm.on('click', function (e) {
        L.DomEvent.stop(e);
        send({ type: 'select', id: m.id });
      });
      cm.addTo(markersLayer);
      cm._cad = m;
      markers[m.id] = cm;
    });
    if (selectedId && markers[selectedId]) markers[selectedId].bringToFront();
  }

  function select(id, pan) {
    var prev = selectedId;
    selectedId = id;
    if (prev && markers[prev]) markers[prev].setStyle(styleFor(markers[prev]._cad, false));
    if (id && markers[id]) {
      markers[id].setStyle(styleFor(markers[id]._cad, true));
      markers[id].bringToFront();
      if (pan) map.panTo(markers[id].getLatLng(), { animate: true });
    }
    if ((prev && lineLayers[prev]) || (id && lineLayers[id])) {
      if (lastData) setData(lastData);
      if (id && lineLayers[id] && pan) map.fitBounds(lineLayers[id].getBounds(), { padding: [40, 40], maxZoom: 15 });
    }
  }

  function handle(raw) {
    var msg;
    try { msg = typeof raw === 'string' ? JSON.parse(raw) : raw; } catch (e) { return; }
    if (!msg || !msg.type) return;
    switch (msg.type) {
      case 'setData': setData(msg); break;
      case 'select': select(msg.id, msg.pan); break;
      case 'flyTo': map.flyTo([msg.lat, msg.lon], msg.zoom || map.getZoom(), { duration: 0.8 }); break;
      case 'fitBounds':
        map.fitBounds([[msg.bbox.south, msg.bbox.west], [msg.bbox.north, msg.bbox.east]], { maxZoom: 15 });
        break;
      case 'user':
        userLayer.clearLayers();
        L.circleMarker([msg.lat, msg.lon], { renderer: renderer, radius: 14, stroke: false, fillColor: '#4da3ff', fillOpacity: 0.2 }).addTo(userLayer);
        L.circleMarker([msg.lat, msg.lon], { renderer: renderer, radius: 6, color: '#fff', weight: 2, fillColor: '#4da3ff', fillOpacity: 1 }).addTo(userLayer);
        break;
      case 'invalidate': map.invalidateSize(); break;
    }
  }

  window.__cadReceive = handle;
  window.addEventListener('message', function (e) { handle(e.data); });
  document.addEventListener('message', function (e) { handle(e.data); }); // Android WebView

  var zoomBefore = map.getZoom();
  map.on('moveend', sendRegion);
  map.on('zoomend', function () {
    var z = map.getZoom();
    if (lastData && (z >= 15) !== (zoomBefore >= 15)) setData(lastData);
    zoomBefore = z;
  });
  map.on('click', function () { send({ type: 'select', id: null }); });
  window.addEventListener('resize', function () { map.invalidateSize(); });

  send({ type: 'ready' });
  sendRegion();
})();
`;

const PAGE_CSS = `
html, body, #map { margin: 0; padding: 0; width: 100%; height: 100%; background: #0b0b14; }
.leaflet-container { background: #0b0b14; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
.leaflet-control-attribution { background: rgba(11,11,20,0.7) !important; color: #8888a8; font-size: 10px; }
.leaflet-control-attribution a { color: #b9a6ff; }
.cad-tip { background: #1e1e30; color: #ececf5; border: 1px solid #34344d; border-radius: 8px; box-shadow: 0 4px 14px rgba(0,0,0,.5); font-size: 13px; padding: 4px 8px; }
.cad-tip::before { display: none; }
`;

const safeScript = (s: string) => s.replace(/<\/script/gi, '<\\/script');

export function buildMapHtml(init: MapInit): string {
  return `<!DOCTYPE html>
<html lang="de"><head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
<style>${LEAFLET_CSS}</style>
<style>${PAGE_CSS}</style>
</head><body>
<div id="map"></div>
<script>${safeScript(LEAFLET_JS)}</script>
<script>window.__CAD_INIT__ = ${JSON.stringify(init)};</script>
<script>${safeScript(CONTROLLER)}</script>
</body></html>`;
}

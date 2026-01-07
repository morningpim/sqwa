// src/components/map/utils/geo.js
export function pointsToPolygon(points) {
  if (!Array.isArray(points) || points.length < 3) return null;

  const ring = points.map((p) => [p.lon, p.lat]);

  const [x0, y0] = ring[0];
  const [xn, yn] = ring[ring.length - 1];
  if (x0 !== xn || y0 !== yn) ring.push([x0, y0]);

  return { type: "Polygon", coordinates: [ring] };
}

export function parseLatLng(text) {
  if (!text) return null;
  const s = String(text).trim().replace(/\s+/g, " ");
  const m = s.match(/^(-?\d+(?:\.\d+)?)[,\s]+(-?\d+(?:\.\d+)?)$/);
  if (!m) return null;

  const lat = Number(m[1]);
  const lon = Number(m[2]);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;

  if (lat < -90 || lat > 90) return null;
  if (lon < -180 || lon > 180) return null;

  return { lat, lon };
}

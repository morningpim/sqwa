export function parseLatLng(text) {
  if (!text) return null;
  const s = String(text).trim().replace(/\s+/g, " ");
  const m = s.match(/^(-?\d+(\.\d+)?)[,\s]+(-?\d+(\.\d+)?)$/);
  if (!m) return null;

  const lat = Number(m[1]);
  const lon = Number(m[3]);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;

  return { lat, lon };
}

import { useEffect, useRef } from "react";

function toLocFromLand(land) {
  // รองรับทั้ง land.location และ land.lat/lon
  if (land?.location && land.location.lat != null && land.location.lon != null) {
    return { lat: Number(land.location.lat), lon: Number(land.location.lon) };
  }
  if (land?.lat != null && land?.lon != null) {
    return { lat: Number(land.lat), lon: Number(land.lon) };
  }
  return null;
}

function centroidOfPolygonCoords(coords) {
  if (!Array.isArray(coords) || coords.length < 3) return null;

  let area = 0,
    cx = 0,
    cy = 0;

  for (let i = 0; i < coords.length; i++) {
    const [x1, y1] = coords[i];
    const [x2, y2] = coords[(i + 1) % coords.length];
    const f = x1 * y2 - x2 * y1;
    area += f;
    cx += (x1 + x2) * f;
    cy += (y1 + y2) * f;
  }

  area *= 0.5;
  if (!area) {
    const [lon, lat] = coords[0];
    return { lon, lat };
  }
  return { lon: cx / (6 * area), lat: cy / (6 * area) };
}

function getLandId(land) {
  return (
    land?.id ??
    land?._id ??
    land?.code ??
    land?.key ??
    land?.title ??
    // fallback สุดท้าย (ไม่แนะนำแต่กันพัง)
    JSON.stringify({ lat: land?.lat, lon: land?.lon, location: land?.location, geometry: land?.geometry })
  );
}

export default function LandMarkers({ map, lands = [], selectedLand, onSelect }) {
  const markerRef = useRef(new Map()); // id -> Marker
  const polyRef = useRef(new Map()); // id -> Polygon
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  // ✅ สร้าง marker (ถาวร) + polygon (ถาวร) ตาม lands
  useEffect(() => {
    if (!map || !window.longdo) return;
    const L = window.longdo;

    const ensureOne = (land) => {
      const id = getLandId(land);

      // ---------- หา loc ----------
      let loc = null;

      // 1) polygon centroid
      try {
        if (land?.geometry?.type === "Polygon" && Array.isArray(land.geometry.coordinates)) {
          const raw = land.geometry.coordinates;
          const ring = Array.isArray(raw[0]?.[0]) ? raw[0] : raw;
          const c = centroidOfPolygonCoords(ring);
          if (c) loc = c;
        }
      } catch {}

      // 2) location หรือ lat/lon
      if (!loc) loc = toLocFromLand(land);

      // ---------- Marker ----------
      if (loc && !markerRef.current.has(id)) {
        const marker = new L.Marker(loc, {
          title: land?.brokerName || land?.owner || "แปลงที่ดิน",
          icon: {
            url:
              "data:image/svg+xml;utf8," +
              encodeURIComponent(`
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
                  <path d="M12 2C7.58 2 4 5.58 4 10c0 5.25 5.4 10.58 7.2 12.19a1.2 1.2 0 0 0 1.6 0C14.6 20.58 20 15.25 20 10c0-4.42-3.58-8-8-8z"
                    fill="rgba(255,255,255,0.92)" stroke="#9ca3af" stroke-width="1"/>
                  <circle cx="12" cy="10" r="3" fill="#ef4444"/>
                </svg>
              `),
            size: { width: 28, height: 28 },
            offset: { x: 14, y: 28 },
          },
          // ✅ อย่าตั้ง min=7 ไม่งั้นซูมออกแล้ว “หมุดหาย”
          visibleRange: { min: 1, max: 20 },
        });

        marker.__id = id;
        marker.__land = land;
        marker.__loc = loc;

        // ✅ bind click แบบ longdo
        try {
          L.Event.bind(marker, "click", () => onSelectRef.current?.(land, loc));
        } catch {
          marker.onclick = () => onSelectRef.current?.(land, loc);
        }

        map.Overlays.add(marker);
        markerRef.current.set(id, marker);
      }

      // ---------- Polygon (ถ้ามี) ----------
      try {
        if (land?.geometry?.type === "Polygon" && Array.isArray(land.geometry.coordinates) && !polyRef.current.has(id)) {
          const raw = land.geometry.coordinates;
          const ring = Array.isArray(raw[0]?.[0]) ? raw[0] : raw;
          if (ring.length >= 3) {
            const pts = ring.map(([lon, lat]) => ({ lon, lat }));
            const poly = new L.Polygon(pts, {
              lineWidth: 2,
              lineColor: "rgba(255,215,0,0.90)",
              fillColor: "rgba(255,215,0,0.25)",
            });

            const polyLoc = loc || centroidOfPolygonCoords(ring);
            poly.__id = id;
            poly.__land = land;
            poly.__loc = polyLoc;

            try {
              L.Event.bind(poly, "click", () => onSelectRef.current?.(land, polyLoc));
            } catch {
              poly.onclick = () => onSelectRef.current?.(land, polyLoc);
            }

            map.Overlays.add(poly);
            polyRef.current.set(id, poly);
          }
        }
      } catch {}
    };

    // สร้าง overlays ตาม lands
    (Array.isArray(lands) ? lands : []).forEach(ensureOne);

    // ลบ overlay ที่ไม่มีใน lands แล้ว (กัน leak)
    const keep = new Set((Array.isArray(lands) ? lands : []).map(getLandId));

    for (const [id, m] of markerRef.current) {
      if (!keep.has(id)) {
        try {
          map.Overlays.remove(m);
        } catch {}
        markerRef.current.delete(id);
      }
    }
    for (const [id, p] of polyRef.current) {
      if (!keep.has(id)) {
        try {
          map.Overlays.remove(p);
        } catch {}
        polyRef.current.delete(id);
      }
    }
  }, [map, lands]);

  // ✅ highlight polygon เมื่อเลือก land (ไม่แตะ marker)
  useEffect(() => {
    if (!map || !window.longdo) return;
    const L = window.longdo;

    // ลบ polygon เก่า
    for (const [, p] of polyRef.current) {
      try {
        map.Overlays.remove(p);
      } catch {}
    }
    polyRef.current.clear();

    const selectedId = selectedLand ? getLandId(selectedLand) : null;

    (Array.isArray(lands) ? lands : []).forEach((land) => {
      try {
        if (land?.geometry?.type !== "Polygon" || !Array.isArray(land.geometry.coordinates)) return;

        const id = getLandId(land);
        const raw = land.geometry.coordinates;
        const ring = Array.isArray(raw[0]?.[0]) ? raw[0] : raw;
        if (ring.length < 3) return;

        const pts = ring.map(([lon, lat]) => ({ lon, lat }));
        const isSelected = selectedId && selectedId === id;

        const poly = new L.Polygon(pts, {
          lineWidth: isSelected ? 4 : 2,
          lineColor: isSelected ? "rgba(59,130,246,0.95)" : "rgba(255,215,0,0.90)",
          fillColor: isSelected ? "rgba(59,130,246,0.25)" : "rgba(255,215,0,0.25)",
        });

        const polyLoc = toLocFromLand(land) || centroidOfPolygonCoords(ring);
        try {
          L.Event.bind(poly, "click", () => onSelectRef.current?.(land, polyLoc));
        } catch {
          poly.onclick = () => onSelectRef.current?.(land, polyLoc);
        }

        map.Overlays.add(poly);
        polyRef.current.set(id, poly);
      } catch {}
    });
  }, [map, lands, selectedLand]);

  return null;
}

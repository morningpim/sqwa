import { useEffect, useRef } from "react";

/** -------- helpers -------- */

function getLandId(land) {
  // ต้อง “นิ่ง” เพื่อไม่ให้ overlay ถูกมองว่าเป็นตัวใหม่
  return (
    land?.id ??
    land?._id ??
    land?.code ??
    land?.key ??
    land?.title ??
    // fallback (กันพัง แต่ไม่แนะนำให้ใช้ระยะยาว)
    JSON.stringify({
      lat: land?.lat,
      lon: land?.lon,
      location: land?.location,
      geometry: land?.geometry,
    })
  );
}

function locFromLand(land) {
  // รองรับ land.location
  if (land?.location?.lon != null && land?.location?.lat != null) {
    return { lon: Number(land.location.lon), lat: Number(land.location.lat) };
  }
  // รองรับ land.lon/lat
  if (land?.lon != null && land?.lat != null) {
    return { lon: Number(land.lon), lat: Number(land.lat) };
  }
  return null;
}

function centroidOfRing(ring) {
  // ring: [[lon,lat], ...]
  if (!Array.isArray(ring) || ring.length < 3) return null;

  let area = 0,
    cx = 0,
    cy = 0;

  for (let i = 0; i < ring.length; i++) {
    const [x1, y1] = ring[i];
    const [x2, y2] = ring[(i + 1) % ring.length];
    const f = x1 * y2 - x2 * y1;
    area += f;
    cx += (x1 + x2) * f;
    cy += (y1 + y2) * f;
  }

  area *= 0.5;
  if (!area) {
    const [lon, lat] = ring[0];
    return { lon, lat };
  }
  return { lon: cx / (6 * area), lat: cy / (6 * area) };
}

function ringFromPolygon(geometry) {
  // รองรับ Polygon แบบ:
  // 1) [[lon,lat],...] หรือ
  // 2) [[[lon,lat],...]] (มี outer ring)
  if (!geometry || geometry.type !== "Polygon" || !Array.isArray(geometry.coordinates)) return null;
  const raw = geometry.coordinates;
  // ถ้ามี 2 ชั้น -> ใช้ outer ring ชั้นแรก
  const ring = Array.isArray(raw[0]?.[0]) ? raw[0] : raw;
  return Array.isArray(ring) ? ring : null;
}

function makePinSvg() {
  return (
    "data:image/svg+xml;utf8," +
    encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
        <path d="M12 2C7.58 2 4 5.58 4 10c0 5.25 5.4 10.58 7.2 12.19a1.2 1.2 0 0 0 1.6 0C14.6 20.58 20 15.25 20 10c0-4.42-3.58-8-8-8z"
          fill="rgba(255,255,255,0.92)" stroke="#9ca3af" stroke-width="1"/>
        <circle cx="12" cy="10" r="3" fill="#ef4444"/>
      </svg>
    `)
  );
}

/** -------- component -------- */

export default function LandMarkers({ map, lands = [], selectedLand, onSelect }) {
  // เก็บ overlay เพื่อ “ไม่ต้องล้างทุกครั้ง”
  const markerMapRef = useRef(new Map()); // id -> Marker
  const polyMapRef = useRef(new Map()); // id -> Polygon
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  /**
   * ✅ 1) สร้าง marker + polygon ตาม lands (ถาวร)
   *    - เพิ่มเฉพาะที่ยังไม่มี
   *    - ลบเฉพาะที่หายไปจาก lands จริงๆ
   */
  useEffect(() => {
    if (!map || !window.longdo) return;

    const L = window.longdo;

    const keepIds = new Set();

    (Array.isArray(lands) ? lands : []).forEach((land) => {
      const id = getLandId(land);
      keepIds.add(id);

      // --- หา loc: polygon centroid > location/latlon ---
      let loc = null;
      const ring = ringFromPolygon(land?.geometry);
      if (ring) loc = centroidOfRing(ring);
      if (!loc) loc = locFromLand(land);

      // --- Marker ---
      if (loc && !markerMapRef.current.has(id)) {
        const marker = new L.Marker(loc, {
          title: land?.brokerName || land?.owner || "แปลงที่ดิน",
          icon: {
            url: makePinSvg(),
            size: { width: 28, height: 28 },
            offset: { x: 14, y: 28 },
          },
          // ✅ อย่าตั้ง min zoom สูง ไม่งั้นซูมออกแล้วหมุดหาย
          visibleRange: { min: 1, max: 20 },
        });

        marker.__id = id;
        marker.__land = land;
        marker.__loc = loc;

        // ✅ สำคัญสุด: ต้องส่ง loc กลับไป MapPage เพื่อคำนวณ popupPos
        const clickHandler = () => onSelectRef.current?.(land, loc);

        // longdo event
        try {
          L.Event.bind(marker, "click", clickHandler);
        } catch {
          marker.onclick = clickHandler;
        }

        map.Overlays.add(marker);
        markerMapRef.current.set(id, marker);
      }

      // --- Polygon (ถ้ามี) ---
      if (ring && ring.length >= 3 && !polyMapRef.current.has(id)) {
        const pts = ring.map(([lon, lat]) => ({ lon, lat }));
        const poly = new L.Polygon(pts, {
          lineWidth: 2,
          lineColor: "rgba(255,215,0,0.90)",
          fillColor: "rgba(255,215,0,0.25)",
        });

        poly.__id = id;
        poly.__land = land;
        poly.__loc = loc || centroidOfRing(ring);

        const clickHandler = () => onSelectRef.current?.(land, poly.__loc || loc);

        try {
          L.Event.bind(poly, "click", clickHandler);
        } catch {
          poly.onclick = clickHandler;
        }

        map.Overlays.add(poly);
        polyMapRef.current.set(id, poly);
      }
    });

    // ลบ marker ที่ไม่อยู่ใน lands แล้ว
    for (const [id, marker] of markerMapRef.current.entries()) {
      if (!keepIds.has(id)) {
        try {
          map.Overlays.remove(marker);
        } catch {}
        markerMapRef.current.delete(id);
      }
    }

    // ลบ polygon ที่ไม่อยู่ใน lands แล้ว
    for (const [id, poly] of polyMapRef.current.entries()) {
      if (!keepIds.has(id)) {
        try {
          map.Overlays.remove(poly);
        } catch {}
        polyMapRef.current.delete(id);
      }
    }
  }, [map, lands]);

  /**
   * ✅ 2) Highlight polygon เมื่อเลือก land
   *    - เพื่อความชัวร์ เรา rebuild เฉพาะ polygon (marker ไม่ยุ่ง)
   */
  useEffect(() => {
    if (!map || !window.longdo) return;
    const L = window.longdo;

    // ลบ polygon เดิมทั้งหมดก่อน (เฉพาะ polygon)
    for (const [, poly] of polyMapRef.current.entries()) {
      try {
        map.Overlays.remove(poly);
      } catch {}
    }
    polyMapRef.current.clear();

    const selectedId = selectedLand ? getLandId(selectedLand) : null;

    (Array.isArray(lands) ? lands : []).forEach((land) => {
      const ring = ringFromPolygon(land?.geometry);
      if (!ring || ring.length < 3) return;

      const id = getLandId(land);
      const isSelected = selectedId && selectedId === id;

      const pts = ring.map(([lon, lat]) => ({ lon, lat }));
      const loc = centroidOfRing(ring) || locFromLand(land);

      const poly = new L.Polygon(pts, {
        lineWidth: isSelected ? 4 : 2,
        lineColor: isSelected ? "rgba(59,130,246,0.95)" : "rgba(255,215,0,0.90)",
        fillColor: isSelected ? "rgba(59,130,246,0.25)" : "rgba(255,215,0,0.25)",
      });

      poly.__id = id;
      poly.__land = land;
      poly.__loc = loc;

      const clickHandler = () => onSelectRef.current?.(land, loc);

      try {
        L.Event.bind(poly, "click", clickHandler);
      } catch {
        poly.onclick = clickHandler;
      }

      map.Overlays.add(poly);
      polyMapRef.current.set(id, poly);
    });
  }, [map, lands, selectedLand]);

  return null;
}

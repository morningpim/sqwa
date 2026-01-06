import React, { useEffect, useRef } from "react";

/**
 * LandMarkers (FINAL+)
 * - ✅ กันหมุดซ้อน (StrictMode) ด้วย cleanup
 * - ✅ ใส่ __land / __loc / __onSelect
 * - ✅ ผูก click ที่ marker/polygon โดยตรง (ไม่พึ่ง overlayClick ของ map)
 * - ✅ เก็บ unbind ไว้บน overlay แล้ว cleanup เพื่อกัน "ข้อมูลเก่าค้าง"
 */

const DEFAULT_COLOR = "#E11D48"; // red-600

function safeId(v, i) {
  if (v == null) return `land_${i}`;
  return String(v);
}

function svgToDataUri(svg) {
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}

function makePinSvg({ color = DEFAULT_COLOR } = {}) {
  return `
  <svg xmlns="http://www.w3.org/2000/svg" width="34" height="44" viewBox="0 0 34 44">
    <defs>
      <filter id="s" x="-30%" y="-30%" width="160%" height="160%">
        <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="rgba(0,0,0,.25)"/>
      </filter>
    </defs>
    <path filter="url(#s)"
      d="M17 1C9.82 1 4 6.82 4 14c0 9.75 13 28 13 28s13-18.25 13-28C30 6.82 24.18 1 17 1z"
      fill="${color}"/>
    <circle cx="17" cy="14" r="5.6" fill="#fff"/>
  </svg>`;
}

function getLoc(land) {
  const l = land?.location ?? land ?? {};
  const lat = l.lat ?? l.latitude;
  const lon = l.lon ?? l.lng ?? l.long ?? l.longitude;

  if (lat == null || lon == null) return null;

  const la = Number(lat);
  const lo = Number(lon);
  if (!Number.isFinite(la) || !Number.isFinite(lo)) return null;

  return { lat: la, lon: lo };
}

function bindOverlayClick(overlay, fn) {
  // คืนค่า unbind เสมอ เพื่อ cleanup ได้
  try {
    overlay?.Event?.bind?.("click", fn);
    return () => {
      try {
        overlay?.Event?.unbind?.("click", fn);
      } catch {}
    };
  } catch {
    return () => {};
  }
}

export default function LandMarkers({ map, lands = [], onSelect }) {
  const markerMapRef = useRef(new Map());  // id -> marker overlay
  const polygonMapRef = useRef(new Map()); // id -> polygon overlay

  // -------------------------
  // Markers
  // -------------------------
  useEffect(() => {
    const L = window.longdo;
    if (!map || !L) return;

    const idsNow = new Set();

    lands.forEach((land, i) => {
      const id = safeId(land?.id ?? land?.code ?? land?.uid, i);
      const loc = getLoc(land);
      if (!loc) return;

      idsNow.add(id);

      let marker = markerMapRef.current.get(id);

      const selectFn = () => onSelect?.(land, { lon: loc.lon, lat: loc.lat });

      if (!marker) {
        marker = new L.Marker(
          { lon: loc.lon, lat: loc.lat },
          {
            icon: {
              url: svgToDataUri(makePinSvg({ color: DEFAULT_COLOR })),
              offset: { x: 17, y: 42 },
              size: { width: 34, height: 44 },
            },
            clickable: true,
          }
        );

        // ใส่ข้อมูล
        marker.__land = land;
        marker.__loc = { lon: loc.lon, lat: loc.lat };
        marker.__onSelect = selectFn;

        // ✅ ผูกคลิกที่ marker ตรง ๆ (ชัวร์สุด)
        marker.__unbindClick?.();
        marker.__unbindClick = bindOverlayClick(marker, () => {
          marker.__onSelect?.();
        });

        try {
          map.Overlays.add(marker);
        } catch (e) {
          console.warn("Overlays.add marker failed:", e);
        }

        markerMapRef.current.set(id, marker);
      } else {
        // อัปเดตตำแหน่ง + อัปเดตข้อมูล เพื่อกัน "ข้อมูลเก่า"
        try {
          marker.location({ lon: loc.lon, lat: loc.lat });
        } catch {}

        marker.__land = land;
        marker.__loc = { lon: loc.lon, lat: loc.lat };
        marker.__onSelect = selectFn;
      }
    });

    // ลบอันที่หายไปจาก lands
    for (const [id, marker] of markerMapRef.current.entries()) {
      if (!idsNow.has(id)) {
        try {
          marker.__unbindClick?.(); // ✅ unbind event กันค้าง
        } catch {}
        try {
          map.Overlays.remove(marker);
        } catch {}
        markerMapRef.current.delete(id);
      }
    }

    // cleanup (StrictMode mount/unmount)
    return () => {
      try {
        for (const marker of markerMapRef.current.values()) {
          try {
            marker.__unbindClick?.();
          } catch {}
          try {
            map.Overlays.remove(marker);
          } catch {}
        }
      } finally {
        markerMapRef.current.clear();
      }
    };
  }, [map, lands, onSelect]);

  // -------------------------
  // Polygons (optional)
  // -------------------------
  useEffect(() => {
    const L = window.longdo;
    if (!map || !L) return;

    const idsNow = new Set();

    lands.forEach((land, i) => {
      const id = safeId(land?.id ?? land?.code ?? land?.uid, i);
      const poly = land?.polygon;
      if (!poly || !Array.isArray(poly) || poly.length < 3) return;

      idsNow.add(id);

      let overlay = polygonMapRef.current.get(id);

      const pts = poly
        .map((p) => {
          const lon = Number(p?.lon ?? p?.lng ?? p?.x);
          const lat = Number(p?.lat ?? p?.y);
          if (!Number.isFinite(lon) || !Number.isFinite(lat)) return null;
          return { lon, lat };
        })
        .filter(Boolean);

      if (pts.length < 3) return;

      const centroid = pts.reduce(
        (acc, p) => ({ lon: acc.lon + p.lon, lat: acc.lat + p.lat }),
        { lon: 0, lat: 0 }
      );
      const centerLoc = { lon: centroid.lon / pts.length, lat: centroid.lat / pts.length };

      const selectFn = () => onSelect?.(land, centerLoc);

      if (!overlay) {
        overlay = new L.Polygon(pts, {
          lineWidth: 2,
          lineColor: "rgba(16,185,129,1)",
          fillColor: "rgba(16,185,129,0.18)",
          clickable: true,
        });

        overlay.__land = land;
        overlay.__loc = centerLoc;
        overlay.__onSelect = selectFn;

        // ✅ bind click ตรง ๆ
        overlay.__unbindClick?.();
        overlay.__unbindClick = bindOverlayClick(overlay, () => {
          overlay.__onSelect?.();
        });

        try {
          map.Overlays.add(overlay);
          polygonMapRef.current.set(id, overlay);
        } catch (e) {
          console.warn("add polygon failed:", e);
        }
      } else {
        try {
          overlay.location(pts);
        } catch {}

        // อัปเดตข้อมูลกัน land เก่า
        overlay.__land = land;
        overlay.__loc = centerLoc;
        overlay.__onSelect = selectFn;
      }
    });

    // ลบ polygon ที่หายไป
    for (const [id, overlay] of polygonMapRef.current.entries()) {
      if (!idsNow.has(id)) {
        try {
          overlay.__unbindClick?.();
        } catch {}
        try {
          map.Overlays.remove(overlay);
        } catch {}
        polygonMapRef.current.delete(id);
      }
    }

    return () => {
      try {
        for (const overlay of polygonMapRef.current.values()) {
          try {
            overlay.__unbindClick?.();
          } catch {}
          try {
            map.Overlays.remove(overlay);
          } catch {}
        }
      } finally {
        polygonMapRef.current.clear();
      }
    };
  }, [map, lands, onSelect]);

  return null;
}

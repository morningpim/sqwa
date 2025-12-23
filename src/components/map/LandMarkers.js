import React, { useEffect, useRef } from "react";

/**
 * LandMarkers (FINAL)
 * - ✅ แก้หมุดซ้อน 2 อัน (React StrictMode) ด้วย cleanup ตอน unmount
 * - ใส่ __land และ __loc ไว้บน overlay เพื่อให้ MapPage รับ overlayClick แล้วเปิด popup ได้
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
  const lat = land?.location?.lat ?? land?.lat;
  const lon = land?.location?.lon ?? land?.lon;
  if (lat == null || lon == null) return null;
  const la = Number(lat);
  const lo = Number(lon);
  if (!Number.isFinite(la) || !Number.isFinite(lo)) return null;
  return { lat: la, lon: lo };
}

export default function LandMarkers({ map, lands = [], onSelect }) {
  const markerMapRef = useRef(new Map()); // id -> overlay
  const polygonMapRef = useRef(new Map()); // id -> overlay

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

        marker.__land = land;
        marker.__loc = { lon: loc.lon, lat: loc.lat };
        marker.__onSelect = () => onSelect?.(land, { lon: loc.lon, lat: loc.lat });

        try {
          map.Overlays.add(marker);
        } catch (e) {
          console.warn("Overlays.add marker failed:", e);
        }

        markerMapRef.current.set(id, marker);
      } else {
        try {
          marker.location({ lon: loc.lon, lat: loc.lat });
        } catch {}
        marker.__land = land;
        marker.__loc = { lon: loc.lon, lat: loc.lat };
      }
    });

    for (const [id, marker] of markerMapRef.current.entries()) {
      if (!idsNow.has(id)) {
        try {
          map.Overlays.remove(marker);
        } catch {}
        markerMapRef.current.delete(id);
      }
    }

    // ✅ Cleanup กันหมุดซ้อน (StrictMode mount/unmount)
    return () => {
      try {
        for (const marker of markerMapRef.current.values()) {
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

      if (!overlay) {
        try {
          overlay = new L.Polygon(pts, {
            lineWidth: 2,
            lineColor: "rgba(16,185,129,1)",
            fillColor: "rgba(16,185,129,0.18)",
            clickable: true,
          });

          overlay.__land = land;
          const c = pts.reduce(
            (acc, p) => ({ lon: acc.lon + p.lon, lat: acc.lat + p.lat }),
            { lon: 0, lat: 0 }
          );
          overlay.__loc = { lon: c.lon / pts.length, lat: c.lat / pts.length };

          map.Overlays.add(overlay);
          polygonMapRef.current.set(id, overlay);
        } catch (e) {
          console.warn("add polygon failed:", e);
        }
      } else {
        try {
          overlay.location(pts);
        } catch {}
        overlay.__land = land;
      }
    });

    for (const [id, overlay] of polygonMapRef.current.entries()) {
      if (!idsNow.has(id)) {
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
            map.Overlays.remove(overlay);
          } catch {}
        }
      } finally {
        polygonMapRef.current.clear();
      }
    };
  }, [map, lands]);

  return null;
}

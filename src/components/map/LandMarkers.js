import React, { useEffect, useRef } from "react";

/**
 * LandMarkers (FINAL+ Fav Highlight)
 * - ✅ กันหมุดซ้อน (StrictMode) ด้วย cleanup
 * - ✅ ใส่ __land / __loc / __onSelect
 * - ✅ ผูก click ที่ marker/polygon โดยตรง
 * - ✅ รองรับ favoriteIds เพื่อ highlight หมุด/โพลิกอน
 * - ✅ รองรับ polygon ได้ทั้ง 2 แบบ:
 *    - land.polygon = [{lon,lat}...]
 *    - land.geometry = GeoJSON Polygon { type:"Polygon", coordinates:[[ [lon,lat], ... ]] }
 */

const DEFAULT_COLOR = "#E11D48"; // red-600 (ปกติ)
const FAV_COLOR = "#16A34A"; // green-600 (favorite)
const FAV_RING = "#ffffff"; // วงขาวรอบหมุด

const EIA_COLOR = "#2563EB";    // 🔵 blue-600 (EIA)

function safeId(v, i) {
  if (v == null) return `land_${i}`;
  return String(v);
}

function svgToDataUri(svg) {
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}

function makePinSvg({ color = DEFAULT_COLOR, ring = false } = {}) {
  // ring=true จะวาดวงกลมขาวรอบๆ ให้เด่นขึ้น
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

    ${ring ? `<circle cx="17" cy="14" r="7.4" fill="${FAV_RING}"/>` : ""}

    <circle cx="17" cy="14" r="5.6" fill="#fff"/>
  </svg>`;
}

/** GeoJSON Polygon -> pts [{lon,lat}...] */
function geojsonToPts(geometry) {
  if (!geometry || geometry.type !== "Polygon") return null;
  const ring = geometry?.coordinates?.[0];
  if (!Array.isArray(ring) || ring.length < 3) return null;

  const pts = ring
    .map((c) => {
      const lon = Number(c?.[0]);
      const lat = Number(c?.[1]);
      if (!Number.isFinite(lon) || !Number.isFinite(lat)) return null;
      return { lon, lat };
    })
    .filter(Boolean);

  return pts.length >= 3 ? pts : null;
}

function centroidFromPts(pts) {
  const c = pts.reduce(
    (acc, p) => ({ lon: acc.lon + p.lon, lat: acc.lat + p.lat }),
    { lon: 0, lat: 0 }
  );
  return { lon: c.lon / pts.length, lat: c.lat / pts.length };
}

function getLoc(land) {
  // 1) prefer land.location
  const loc = land?.location ?? null;
  const lat1 = Number(loc?.lat ?? loc?.latitude);
  const lon1 = Number(loc?.lon ?? loc?.lng ?? loc?.long ?? loc?.longitude);
  if (Number.isFinite(lat1) && Number.isFinite(lon1)) return { lat: lat1, lon: lon1 };

  // 2) fallback top-level lat/lon
  const lat2 = Number(land?.lat ?? land?.latitude);
  const lon2 = Number(land?.lon ?? land?.lng ?? land?.long ?? land?.longitude);
  if (Number.isFinite(lat2) && Number.isFinite(lon2)) return { lat: lat2, lon: lon2 };

  // 3) fallback: centroid from land.geometry (GeoJSON)
  const pts = geojsonToPts(land?.geometry);
  if (pts) {
    const c = centroidFromPts(pts);
    return { lat: c.lat, lon: c.lon };
  }

  return null;
}

function bindOverlayClick(overlay, fn) {
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

function isFavId(favoriteIds, id) {
  if (!favoriteIds) return false;
  if (favoriteIds instanceof Set) return favoriteIds.has(String(id));
  if (Array.isArray(favoriteIds)) return favoriteIds.map(String).includes(String(id));
  return false;
}


export default function LandMarkers({ map, lands = [], favoriteIds, onSelect, mode }) {
  const markerMapRef = useRef(new Map()); // id -> marker overlay
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

      const isEia = land?.__type === "eia";
      const fav = !isEia && isFavId(favoriteIds, id);

      let marker = markerMapRef.current.get(id);

      const selectFn = () => onSelect?.(land, { lon: loc.lon, lat: loc.lat });

      // ถ้ามี marker แล้ว แต่สถานะ fav เปลี่ยน -> สร้างใหม่ (ชัวร์สุดสำหรับ Longdo)
      if (marker && marker.__fav !== fav) {
        try {
          marker.__unbindClick?.();
        } catch {}
        try {
          map.Overlays.remove(marker);
        } catch {}
        markerMapRef.current.delete(id);
        marker = null;
      }

      if (!marker) {
        const color = isEia
          ? EIA_COLOR
          : fav
          ? FAV_COLOR
          : DEFAULT_COLOR;

        const url = svgToDataUri(
          makePinSvg({
            color,
            ring: fav && !isEia,
          })
        );

        marker = new L.Marker(
          { lon: loc.lon, lat: loc.lat },
          {
            icon: {
              url,
              offset: { x: 17, y: 42 },
              size: { width: 34, height: 44 },
            },
            clickable: true,
          }
        );

        marker.__fav = fav;
        marker.__land = land;
        marker.__loc = { lon: loc.lon, lat: loc.lat };
        marker.__onSelect = selectFn;

        marker.__unbindClick?.();
        marker.__unbindClick = bindOverlayClick(marker, () => marker.__onSelect?.());

        try {
          map.Overlays.add(marker);
        } catch (e) {
          console.warn("Overlays.add marker failed:", e);
        }

        markerMapRef.current.set(id, marker);
      } else {
        // อัปเดตข้อมูลเดิม
        try {
          marker.location({ lon: loc.lon, lat: loc.lat });
        } catch {}

        marker.__land = land;
        marker.__loc = { lon: loc.lon, lat: loc.lat };
        marker.__onSelect = selectFn;
      }
    });

    // ลบอันที่หายไป
    for (const [id, marker] of markerMapRef.current.entries()) {
      if (!idsNow.has(id)) {
        try {
          marker.__unbindClick?.();
        } catch {}
        try {
          map.Overlays.remove(marker);
        } catch {}
        markerMapRef.current.delete(id);
      }
    }

    // cleanup (StrictMode)
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
  }, [map, lands, favoriteIds, onSelect, mode]);

  // -------------------------
  // Polygons (optional)
  // -------------------------
  useEffect(() => {
    const L = window.longdo;
    if (!map || !L) return;

    const idsNow = new Set();

    lands.forEach((land, i) => {
      const id = safeId(land?.id ?? land?.code ?? land?.uid, i);
      const isEia = land?.__type === "eia";

      // ✅ รองรับ 2 แบบ: land.polygon หรือ land.geometry (GeoJSON)
      const poly = land?.polygon;
      const geoPts = geojsonToPts(land?.geometry);

      let pts = null;

      // A) old format: land.polygon = [{lon,lat}...]
      if (Array.isArray(poly) && poly.length >= 3) {
        pts = poly
          .map((p) => {
            const lon = Number(p?.lon ?? p?.lng ?? p?.x);
            const lat = Number(p?.lat ?? p?.y);
            if (!Number.isFinite(lon) || !Number.isFinite(lat)) return null;
            return { lon, lat };
          })
          .filter(Boolean);
      }

      // B) new format: GeoJSON polygon
      if ((!pts || pts.length < 3) && geoPts) {
        pts = geoPts;
      }

      if (!pts || pts.length < 3) return;

      idsNow.add(id);

      const fav = isFavId(favoriteIds, id);

      let overlay = polygonMapRef.current.get(id);

      const centerLoc = centroidFromPts(pts);
      const selectFn = () => onSelect?.(land, centerLoc);

      // ถ้า fav เปลี่ยน -> recreate เพื่อเปลี่ยน style ชัวร์สุด
      if (overlay && overlay.__fav !== fav) {
        try {
          overlay.__unbindClick?.();
        } catch {}
        try {
          map.Overlays.remove(overlay);
        } catch {}
        polygonMapRef.current.delete(id);
        overlay = null;
      }

      if (!overlay) {
        overlay = new L.Polygon(pts, {
          lineWidth: fav ? 3 : 2,
          lineColor: fav ? "rgba(22,163,74,1)" : "rgba(16,185,129,1)",
          fillColor: fav ? "rgba(22,163,74,0.22)" : "rgba(16,185,129,0.18)",
          clickable: true,
        });

        overlay.__fav = fav;
        overlay.__land = land;
        overlay.__loc = centerLoc;
        overlay.__onSelect = selectFn;

        overlay.__unbindClick?.();
        overlay.__unbindClick = bindOverlayClick(overlay, () => overlay.__onSelect?.());

        try {
          map.Overlays.add(overlay);
          polygonMapRef.current.set(id, overlay);
        } catch (e) {
          console.warn("add polygon failed:", e);
        }
      } else {
        // update shape (ถ้าแก้ไข polygon)
        try {
          overlay.location(pts);
        } catch {}

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
  }, [map, lands, favoriteIds, onSelect, mode]);

  return null;
}

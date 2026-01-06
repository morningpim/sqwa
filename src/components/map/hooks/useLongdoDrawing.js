import { useCallback, useEffect, useRef, useState } from "react";

export function useLongdoDrawing(mapObj, currentMode) {
  const [drawMode, setDrawMode] = useState(false);

  const pointsRef = useRef([]);
  const polylineRef = useRef(null);
  const polygonRef = useRef(null);

  // เก็บ handler เดิมไว้ unbind ให้ตรงตัว
  const clickHandlerRef = useRef(null);

  const removeOverlaySafe = useCallback(
    (ov) => {
      if (!mapObj || !ov) return;
      try {
        mapObj.Overlays.remove(ov);
      } catch {}
    },
    [mapObj]
  );

  const redraw = useCallback(() => {
    if (!mapObj) return;

    // ลบเส้นเก่าก่อน
    removeOverlaySafe(polylineRef.current);

    const pts = pointsRef.current;
    if (pts.length >= 2) {
      polylineRef.current = new window.longdo.Polyline(pts, {
        lineWidth: 3,
        lineColor: "rgba(0,0,0,0.75)",
      });
      mapObj.Overlays.add(polylineRef.current);
    } else {
      polylineRef.current = null;
    }
  }, [mapObj, removeOverlaySafe]);

  // ✅ แปลง event → {lat, lon}
  // รองรับ:
  // - raw = {x, y}  -> mapObj.location({x,y})
  // - raw = {lat, lon} / {latitude, longitude}
  // - raw.lat/raw.lon เป็น function
  const normalizeLoc = useCallback(
    (raw) => {
      if (!raw || !mapObj) return null;

      // 1) กรณีได้พิกัดจอ {x,y}
      if (typeof raw.x === "number" && typeof raw.y === "number") {
        try {
          const loc = mapObj.location(raw); // 🔥 สำคัญมากสำหรับ longdo เวอร์ชันนี้
          if (loc && typeof loc.lat === "number" && typeof loc.lon === "number") {
            return { lat: loc.lat, lon: loc.lon };
          }
        } catch (e) {
          console.warn("[DRAW] mapObj.location({x,y}) failed", e);
        }
      }

      // 2) fallback กรณีได้ lat/lon ตรงๆ
      const lat =
        typeof raw.lat === "function"
          ? raw.lat()
          : typeof raw.lat === "number"
          ? raw.lat
          : typeof raw.latitude === "number"
          ? raw.latitude
          : null;

      const lon =
        typeof raw.lon === "function"
          ? raw.lon()
          : typeof raw.lon === "number"
          ? raw.lon
          : typeof raw.longitude === "number"
          ? raw.longitude
          : null;

      if (typeof lat === "number" && typeof lon === "number") {
        return { lat, lon };
      }

      return null;
    },
    [mapObj]
  );

  const unbindMapClick = useCallback(() => {
    if (!mapObj || !clickHandlerRef.current) return;

    const fn = clickHandlerRef.current;

    try {
      mapObj.Event.unbind("click", fn);
    } catch {}
    try {
      mapObj.Event.unbind("mapClick", fn);
    } catch {}

    clickHandlerRef.current = null;
  }, [mapObj]);

  const bindMapClick = useCallback(() => {
    if (!mapObj?.Event?.bind) return;

    // กัน bind ซ้ำ
    unbindMapClick();

    const handler = (e) => {
      // ✅ debug: เปิดไว้ช่วยตรวจ (ปิดได้เมื่อมั่นใจแล้ว)
      console.log("[DRAW] map event fired ✅", e);

      const raw = e?.location ?? e;
      const loc = normalizeLoc(raw);

      console.log("[DRAW] raw/loc", raw, loc);

      if (!loc) return;

      pointsRef.current = [...pointsRef.current, loc];
      console.log("[DRAW] points:", pointsRef.current.length);

      redraw();
    };

    clickHandlerRef.current = handler;

    try {
      mapObj.Event.bind("click", handler);
    } catch (err) {
      console.warn("[DRAW] bind click failed", err);
    }

    // เผื่อบางเวอร์ชันใช้ชื่อ event นี้
    try {
      mapObj.Event.bind("mapClick", handler);
    } catch {}
  }, [mapObj, normalizeLoc, redraw, unbindMapClick]);

  const startDrawing = useCallback(() => {
    if (!mapObj) return;

    console.log("[DRAW] startDrawing called ✅");

    setDrawMode(true);

    // reset points + remove overlay เดิม
    pointsRef.current = [];
    removeOverlaySafe(polylineRef.current);
    removeOverlaySafe(polygonRef.current);
    polylineRef.current = null;
    polygonRef.current = null;

    // bind click เพื่อเก็บจุด
    bindMapClick();
  }, [mapObj, bindMapClick, removeOverlaySafe]);

  const finishDrawing = useCallback(() => {
    if (!mapObj) return;

    const pts = pointsRef.current;
    if (pts.length < 3) {
      alert("ต้องคลิกอย่างน้อย 3 จุด");
      return;
    }

    // stop listening click
    unbindMapClick();

    // clear polyline preview
    removeOverlaySafe(polylineRef.current);
    polylineRef.current = null;

    // remove old polygon
    removeOverlaySafe(polygonRef.current);
    polygonRef.current = null;

    const isEiaMode = currentMode === "eia";
    const lineColor = isEiaMode ? "rgba(255,0,0,0.95)" : "rgba(30,144,255,0.95)";
    const fillColor = isEiaMode ? "rgba(255,0,0,0.25)" : "rgba(30,144,255,0.25)";

    polygonRef.current = new window.longdo.Polygon(pts, {
      lineWidth: 2,
      lineColor,
      fillColor,
    });

    mapObj.Overlays.add(polygonRef.current);
    setDrawMode(false);
  }, [mapObj, currentMode, removeOverlaySafe, unbindMapClick]);

  const clearDrawing = useCallback(() => {
    if (!mapObj) return;

    unbindMapClick();

    setDrawMode(false);
    pointsRef.current = [];

    removeOverlaySafe(polylineRef.current);
    removeOverlaySafe(polygonRef.current);
    polylineRef.current = null;
    polygonRef.current = null;
  }, [mapObj, removeOverlaySafe, unbindMapClick]);

  // cleanup ตอน mapObj เปลี่ยน / unmount
  useEffect(() => {
    return () => {
      try {
        unbindMapClick();
      } catch {}
    };
  }, [unbindMapClick]);

  return {
    drawMode,
    startDrawing,
    finishDrawing,
    clearDrawing,
    getPoints: () => pointsRef.current,
  };
}

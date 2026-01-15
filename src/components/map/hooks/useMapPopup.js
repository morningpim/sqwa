// src/components/map/hooks/useMapPopup.js
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

/**
 * useMapPopup (FINAL)
 * - เปิด/ปิด popup แบบ React (ไม่ใช้ longdo popup)
 * - คำนวณตำแหน่งจาก loc -> screen point
 * - มี compat fields: open/pos สำหรับ MapPopup.jsx
 */

function normalizePoint(pt) {
  if (!pt) return null;

  // {x,y}
  if (pt.x != null && pt.y != null) {
    const x = Number(pt.x);
    const y = Number(pt.y);
    if (Number.isFinite(x) && Number.isFinite(y)) return { x, y };
  }
  // {u,v}
  if (pt.u != null && pt.v != null) {
    const x = Number(pt.u);
    const y = Number(pt.v);
    if (Number.isFinite(x) && Number.isFinite(y)) return { x, y };
  }
  // [x,y]
  if (Array.isArray(pt) && pt.length >= 2) {
    const x = Number(pt[0]);
    const y = Number(pt[1]);
    if (Number.isFinite(x) && Number.isFinite(y)) return { x, y };
  }
  return null;
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

export function useMapPopup({ mapObj, mapRef }) {
  // -------------------------
  // elements
  // -------------------------
  const [mapEl, setMapEl] = useState(null);

  useEffect(() => {
    setMapEl(document.getElementById("map"));
  }, []);

  // -------------------------
  // safe areas (กันชน UI ด้านบน/ขวา)
  // -------------------------
  const [safeTop, setSafeTop] = useState(92); // default กัน navbar/searchbar
  const [safeRight, setSafeRight] = useState(110); // default กันปุ่มขวา
  const [mapRect, setMapRect] = useState(null);

  const computeSafeAreas = useCallback(() => {
    if (!mapEl) return;
    const rect = mapEl.getBoundingClientRect?.();
    if (!rect) return;

    setMapRect(rect);

    // top blockers (navbar/search)
    const searchTopbar =
      document.querySelector(".map-topbar") ||
      document.querySelector(".search-bar") ||
      document.querySelector("#sqw-searchbar");

    const navEl =
      document.querySelector("header") ||
      document.querySelector("nav") ||
      document.querySelector(".navbar") ||
      document.querySelector(".topbar") ||
      document.querySelector(".site-header");

    const bottoms = [];
    if (navEl?.getBoundingClientRect) bottoms.push(navEl.getBoundingClientRect().bottom);
    if (searchTopbar?.getBoundingClientRect) bottoms.push(searchTopbar.getBoundingClientRect().bottom);

    const maxBottom = bottoms.length ? Math.max(...bottoms) : rect.top + 72;
    const TOP_GAP = 12;
    const localSafeTop = Math.max(0, maxBottom - rect.top);
    setSafeTop(localSafeTop + TOP_GAP);

    // right blockers (ปุ่ม stack ขวา)
    const rightStack =
      document.querySelector(".map-right-stack") || document.querySelector("#map-right-stack");

    if (rightStack?.getBoundingClientRect) {
      const rr = rightStack.getBoundingClientRect();
      const RIGHT_GAP = 12;
      const blockWidth = Math.max(0, rect.right - rr.left);
      setSafeRight(blockWidth + RIGHT_GAP);
    } else {
      setSafeRight(110);
    }
  }, [mapEl]);

  useEffect(() => {
    computeSafeAreas();
    window.addEventListener("resize", computeSafeAreas);
    return () => window.removeEventListener("resize", computeSafeAreas);
  }, [computeSafeAreas]);

  // -------------------------
  // popup state
  // -------------------------
  const [popupOpen, setPopupOpen] = useState(false);
  const [selectedLand, setSelectedLand] = useState(null);
  const [popupPos, setPopupPos] = useState(null); // {x,y} in map-local coord

  // refs (ให้ hook อื่นใช้งาน)
  const selectedLocRef = useRef(null);
  const lastPopupOpenAtRef = useRef(0);
  const lastPopupLandRef = useRef(null);
  const lastPopupLocRef = useRef(null);

  const popupOpenRef = useRef(false);
  useEffect(() => {
    popupOpenRef.current = popupOpen;
  }, [popupOpen]);

  // -------------------------
  // measure popup size (เพื่อจัดวางซ้าย/ขวา)
  // -------------------------
  const [popupSize, setPopupSize] = useState({ w: 360, h: 280 });

  const popupBoxRef = useCallback((node) => {
    if (!node) return;
    const r = node.getBoundingClientRect?.();
    if (!r) return;
    const w = Math.round(r.width);
    const h = Math.round(r.height);
    if (!Number.isFinite(w) || !Number.isFinite(h)) return;
    setPopupSize((prev) => (prev.w === w && prev.h === h ? prev : { w, h }));
  }, []);

  // -------------------------
  // loc -> point (map local)
  // -------------------------
  const setPopupPosFromLoc = useCallback(
    (loc) => {
      if (!mapObj || !mapEl || !loc) return;

      const rect = mapEl.getBoundingClientRect?.();
      if (!rect) return;
      setMapRect(rect);

      let pt = null;

      // 1) locationToScreen (บาง SDK คืนเป็น screen/page)
      try {
        if (typeof mapObj.locationToScreen === "function") {
          pt = normalizePoint(mapObj.locationToScreen(loc));
        }
      } catch {}

      // 2) locationToPoint (มักจะเป็น local)
      if (!pt) {
        try {
          if (typeof mapObj.locationToPoint === "function") pt = normalizePoint(mapObj.locationToPoint(loc));
          else if (mapObj.Projection && typeof mapObj.Projection.locationToPoint === "function") {
            pt = normalizePoint(mapObj.Projection.locationToPoint(loc));
          }
        } catch {}
      }

      if (!pt) {
        // fallback: กลางแผนที่
        setPopupPos({ x: rect.width / 2, y: rect.height / 2 });
        return;
      }

      // แปลงให้เป็น "map-local"
      // ถ้า pt.x/pt.y อยู่ในกรอบ mapRect => ถือว่า local แล้ว
      const isLocal = pt.x >= -2 && pt.y >= -2 && pt.x <= rect.width + 2 && pt.y <= rect.height + 2;

      const x = isLocal ? pt.x : pt.x - rect.left;
      const y = isLocal ? pt.y : pt.y - rect.top;

      setPopupPos({
        x: clamp(x, 0, rect.width),
        y: clamp(y, 0, rect.height),
      });
    },
    [mapObj, mapEl]
  );

  // -------------------------
  // actions
  // -------------------------
  const closePopup = useCallback(() => {
    setPopupOpen(false);
    setSelectedLand(null);
    selectedLocRef.current = null;
    setPopupPos(null);
  }, []);

  const openPopupFor = useCallback(
    (land, loc) => {
      if (!land || !loc) return;

      lastPopupLandRef.current = land;
      lastPopupLocRef.current = loc;
      selectedLocRef.current = loc;

      setSelectedLand(land);
      setPopupOpen(true);
      lastPopupOpenAtRef.current = Date.now();

      setPopupPosFromLoc(loc);
      computeSafeAreas();
    },
    [setPopupPosFromLoc, computeSafeAreas]
  );

  const openAt = useCallback(
    (loc) => {
      if (!loc) return;

      // ❗ ไม่ set selectedLand
      lastPopupLandRef.current = null;
      lastPopupLocRef.current = loc;
      selectedLocRef.current = loc;

      setSelectedLand(null);
      setPopupOpen(true);
      lastPopupOpenAtRef.current = Date.now();

      setPopupPosFromLoc(loc);
      computeSafeAreas();
    },
    [setPopupPosFromLoc, computeSafeAreas]
  );


  // helper (คลิกจาก marker/overlay)
  const handleSelectLand = useCallback(
    (land, loc) => {
      if (!land) return;

      const finalLoc =
        loc ??
        (land?.location?.lat != null && (land?.location?.lon != null || land?.location?.lng != null)
          ? {
              lat: land.location.lat,
              lon: land.location.lon ?? land.location.lng,
            }
          : land?.lat != null && land?.lon != null
          ? { lat: land.lat, lon: land.lon }
          : null);

      if (!finalLoc) return;
      openPopupFor(land, finalLoc);
    },
    [openPopupFor]
  );

  // popup follow marker (ตอนลาก/ซูม)
  useEffect(() => {
    if (!popupOpen) return;

    let raf = 0;
    let last = 0;

    const loop = (t) => {
      raf = requestAnimationFrame(loop);
      if (!popupOpenRef.current) return;
      if (t - last < 33) return;
      last = t;

      const loc = selectedLocRef.current;
      if (!loc) return;

      setPopupPosFromLoc(loc);
    };

    raf = requestAnimationFrame(loop);
    return () => raf && cancelAnimationFrame(raf);
  }, [popupOpen, setPopupPosFromLoc]);

  // -------------------------
  // layout (style)
  // -------------------------
  const popupSide = useMemo(() => {
    if (!mapRect || !popupPos) return "right";

    const x = popupPos.x;
    const W = popupSize.w;

    const SAFE_SIDE = 12;
    const GAP_X = 10;

    const canRight = x + GAP_X + W <= mapRect.width - SAFE_SIDE - safeRight;
    const canLeft = x - GAP_X - W >= SAFE_SIDE;

    if (canRight) return "right";
    if (canLeft) return "left";
    return "left";
  }, [mapRect, popupPos, popupSize.w, safeRight]);

  const popupStyle = useMemo(() => {
    if (!mapRect || !popupPos) return { display: "none" };

    const x = popupPos.x;
    const y = popupPos.y;

    const W = popupSize.w;
    const H = popupSize.h;

    const GAP_X = 10;
    const SAFE_SIDE = 12;
    const SAFE_BOTTOM = 16;

    let left = popupSide === "right" ? x + GAP_X : x - GAP_X - W;
    let top = y - H / 2;

    left = Math.max(SAFE_SIDE, left);
    left = Math.min(mapRect.width - W - SAFE_SIDE - safeRight, left);

    top = Math.max(safeTop, top);
    top = Math.min(mapRect.height - H - SAFE_BOTTOM, top);

    return {
      position: "fixed",
      left: `${mapRect.left + left}px`,
      top: `${mapRect.top + top}px`,
      zIndex: 999999,
      pointerEvents: "none", // กันบัง map (ข้างนอก)
      background: "transparent",
    };
  }, [mapRect, popupPos, popupSize.w, popupSize.h, popupSide, safeTop, safeRight]);

  const arrowStyle = useMemo(() => {
    const ARROW_SIZE = 14;
    const ARROW_GAP = 4;

    const base = {
      position: "absolute",
      width: `${ARROW_SIZE}px`,
      height: `${ARROW_SIZE}px`,
      transform: "rotate(45deg)",
      background: "#fff",
      boxShadow: "0 10px 30px rgba(0,0,0,.14)",
      border: "2px solid #118e44",
      zIndex: 1,
      top: "50%",
      marginTop: `${-ARROW_SIZE / 2}px`,
      pointerEvents: "none",
    };

    if (popupSide === "right") {
      return { ...base, left: `${-ARROW_SIZE / 2 - ARROW_GAP}px` };
    }
    return { ...base, right: `${-ARROW_SIZE / 2 - ARROW_GAP}px` };
  }, [popupSide]);

  return {
    // refs
    mapEl,
    popupOpenRef,
    selectedLocRef,
    lastPopupOpenAtRef,
    lastPopupLandRef,
    lastPopupLocRef,

    // state (ชื่อใหม่)
    popupOpen,
    popupPos,
    selectedLand,

    // ✅ compat: ให้ MapPopup.jsx ใช้เหมือนเดิม
    open: popupOpen,
    pos: popupPos,

    // actions
    openPopupFor,
    openAt, 
    closePopup,
    setSelectedLand,
    handleSelectLand,

    // layout
    popupBoxRef,
    popupStyle,
    arrowStyle,

    // safe area
    computeSafeAreas,

    // passthrough
    mapObj,
    mapRef,
  };
}

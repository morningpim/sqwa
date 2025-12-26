import { useCallback, useEffect, useMemo, useRef, useState } from "react";

function normalizePoint(pt) {
  if (!pt) return null;

  if (pt.x != null && pt.y != null) {
    const x = Number(pt.x);
    const y = Number(pt.y);
    if (Number.isFinite(x) && Number.isFinite(y)) return { x, y };
  }
  if (pt.u != null && pt.v != null) {
    const x = Number(pt.u);
    const y = Number(pt.v);
    if (Number.isFinite(x) && Number.isFinite(y)) return { x, y };
  }
  if (Array.isArray(pt) && pt.length >= 2) {
    const x = Number(pt[0]);
    const y = Number(pt[1]);
    if (Number.isFinite(x) && Number.isFinite(y)) return { x, y };
  }
  return null;
}

export function useMapPopup({ mapObj, mapRef }) {
  const [mapEl, setMapEl] = useState(null);
  const [overlayEl, setOverlayEl] = useState(null);

  useEffect(() => {
    setMapEl(document.getElementById("map"));
    setOverlayEl(document.getElementById("map-overlay"));
  }, []);

  // safe areas
  const [safeTop, setSafeTop] = useState(0);
  const [safeRight, setSafeRight] = useState(0);
  const [overlaySize, setOverlaySize] = useState({ w: 0, h: 0 });
  const [overlayOffset, setOverlayOffset] = useState({ left: 0, top: 0 });

  const computeSafeAreas = useCallback(() => {
    if (!overlayEl) return;
    const overlayRect = overlayEl.getBoundingClientRect?.();
    if (!overlayRect) return;

    setOverlaySize({ w: overlayRect.width, h: overlayRect.height });
    setOverlayOffset({ left: overlayRect.left, top: overlayRect.top });

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

    let maxBottom = bottoms.length ? Math.max(...bottoms) : overlayRect.top;

    if (!bottoms.length) {
      const root = getComputedStyle(document.documentElement);
      const navH = parseFloat(root.getPropertyValue("--nav-h")) || 72;
      const gap = parseFloat(root.getPropertyValue("--gap")) || 14;
      const searchH = 60;
      maxBottom = overlayRect.top + navH + gap + searchH;
    }

    const TOP_GAP = 12;
    const localSafeTop = Math.max(0, maxBottom - overlayRect.top);
    setSafeTop(localSafeTop + TOP_GAP);

    const rightStack = document.querySelector(".map-right-stack") || document.querySelector("#map-right-stack");
    if (rightStack?.getBoundingClientRect) {
      const rr = rightStack.getBoundingClientRect();
      const RIGHT_GAP = 12;
      const blockWidth = Math.max(0, overlayRect.right - rr.left);
      setSafeRight(blockWidth + RIGHT_GAP);
    } else {
      setSafeRight(110);
    }
  }, [overlayEl]);

  useEffect(() => {
    computeSafeAreas();
    window.addEventListener("resize", computeSafeAreas);
    return () => window.removeEventListener("resize", computeSafeAreas);
  }, [computeSafeAreas]);

  // popup state
  const [popupOpen, setPopupOpen] = useState(false);
  const [selectedLand, setSelectedLand] = useState(null);
  const [popupPos, setPopupPos] = useState(null);

  const selectedLocRef = useRef(null);
  const lastPopupOpenAtRef = useRef(0);
  const lastPopupLandRef = useRef(null);
  const lastPopupLocRef = useRef(null);

  const popupOpenRef = useRef(false);
  useEffect(() => {
    popupOpenRef.current = popupOpen;
  }, [popupOpen]);

  // popup size (วัดจาก ref)
  const [popupSize, setPopupSize] = useState({ w: 360, h: 360 });
  const popupBoxRef = useCallback((node) => {
    if (!node) return;
    const r = node.getBoundingClientRect?.();
    if (!r) return;
    const w = Math.round(r.width);
    const h = Math.round(r.height);
    if (Number.isFinite(w) && Number.isFinite(h)) {
      setPopupSize((prev) => (prev.w === w && prev.h === h ? prev : { w, h }));
    }
  }, []);

  const closePopup = useCallback(() => {
    setPopupOpen(false);
    setSelectedLand(null);
    selectedLocRef.current = null;
    setPopupPos(null);
  }, []);

  const setPopupPosFromLoc = useCallback(
    (loc) => {
      if (!mapObj || !mapEl || !overlayEl || !loc) return;

      const mapRect = mapEl.getBoundingClientRect?.();
      const overlayRect = overlayEl.getBoundingClientRect?.();
      if (!mapRect || !overlayRect) return;

      let pt = null;

      try {
        if (typeof mapObj.locationToScreen === "function") pt = normalizePoint(mapObj.locationToScreen(loc));
      } catch {}

      if (!pt) {
        try {
          if (typeof mapObj.locationToPoint === "function") pt = normalizePoint(mapObj.locationToPoint(loc));
          else if (mapObj.Projection && typeof mapObj.Projection.locationToPoint === "function")
            pt = normalizePoint(mapObj.Projection.locationToPoint(loc));
        } catch {}
      }

      if (!pt) {
        setPopupPos({ x: overlayRect.width / 2, y: overlayRect.height / 2 });
        return;
      }

      const isMapLocal = pt.x >= -2 && pt.y >= -2 && pt.x <= mapRect.width + 2 && pt.y <= mapRect.height + 2;

      const x = isMapLocal ? pt.x + (mapRect.left - overlayRect.left) : pt.x - overlayRect.left;
      const y = isMapLocal ? pt.y + (mapRect.top - overlayRect.top) : pt.y - overlayRect.top;

      setPopupPos({
        x: Math.max(0, Math.min(overlayRect.width, x)),
        y: Math.max(0, Math.min(overlayRect.height, y)),
      });
    },
    [mapObj, mapEl, overlayEl]
  );

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

  const handleSelectLand = useCallback(
    (land, loc) => {
      if (!land) return;

      const finalLoc =
        loc ??
        (land?.location?.lat != null && land?.location?.lon != null
          ? land.location
          : land?.lat != null && land?.lon != null
          ? { lat: land.lat, lon: land.lon }
          : null);

      if (!finalLoc) return;
      openPopupFor(land, finalLoc);
    },
    [openPopupFor]
  );

  // popup follow marker
  useEffect(() => {
    if (!popupOpen) return;

    let raf = 0;
    let last = 0;

    const loop = (t) => {
      raf = requestAnimationFrame(loop);
      if (!popupOpen) return;
      if (t - last < 33) return;
      last = t;

      const loc = selectedLocRef.current;
      if (!loc) return;
      setPopupPosFromLoc(loc);
      computeSafeAreas();
    };

    raf = requestAnimationFrame(loop);
    return () => raf && cancelAnimationFrame(raf);
  }, [popupOpen, setPopupPosFromLoc, computeSafeAreas]);

  // layout calc (ย้ายออกมาจาก MapPage)
  const GAP_X = 8;
  const GAP_Y = 0;
  const SAFE_BOTTOM = 16;
  const SAFE_SIDE = 12;
  const ARROW_SIZE = 14;
  const ARROW_GAP = 4;

  const popupSide = useMemo(() => {
    const x = popupPos?.x ?? 0;
    const W = popupSize.w;
    const OW = overlaySize.w || 0;
    if (!OW) return "right";

    const canRight = x + GAP_X + W <= OW - SAFE_SIDE - safeRight;
    const canLeft = x - GAP_X - W >= SAFE_SIDE;

    if (canRight) return "right";
    if (canLeft) return "left";
    return "left";
  }, [popupPos, popupSize.w, overlaySize.w, safeRight]);

  const popupStyle = useMemo(() => {
    const x = popupPos?.x ?? 0;
    const y = popupPos?.y ?? 0;

    const OW = overlaySize.w || 0;
    const OH = overlaySize.h || 0;

    const W = popupSize.w;
    const H = popupSize.h;

    let top = y - H / 2 + GAP_Y;
    let left = popupSide === "right" ? x + GAP_X : x - GAP_X - W;

    left = Math.max(SAFE_SIDE, left);

    if (OW) {
      const rightLimit = OW - W - SAFE_SIDE - safeRight;
      left = Math.min(rightLimit, left);
    }

    const minTop = safeTop;
    const maxTop = OH ? OH - SAFE_BOTTOM - H : top;
    top = Math.max(minTop, Math.min(maxTop, top));

    return {
      position: "fixed",
      left: `${overlayOffset.left + left}px`,
      top: `${overlayOffset.top + top}px`,
      zIndex: 999999,
      pointerEvents: "auto",
      background: "transparent",
    };
  }, [
    popupPos,
    popupSide,
    safeTop,
    safeRight,
    overlayOffset.left,
    overlayOffset.top,
    overlaySize.w,
    overlaySize.h,
    popupSize.w,
    popupSize.h,
  ]);

  const arrowStyle = useMemo(() => {
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

    if (popupSide === "right") return { ...base, left: `${-ARROW_SIZE / 2 - ARROW_GAP}px` };
    return { ...base, right: `${-ARROW_SIZE / 2 - ARROW_GAP}px` };
  }, [popupSide]);

  return {
    // elements
    mapEl,
    overlayEl,

    // popup refs for other hooks
    popupOpenRef,
    selectedLocRef,
    lastPopupOpenAtRef,
    lastPopupLandRef,
    lastPopupLocRef,

    // popup state
    popupOpen,
    popupPos,
    selectedLand,
    setSelectedLand,
    setPopupOpen,
    setPopupPos,
    closePopup,

    // open
    openPopupFor,
    handleSelectLand,

    // layout
    popupBoxRef,
    popupStyle,
    arrowStyle,

    // safe areas
    computeSafeAreas,

    // map access (optional)
    mapRef,
  };
}

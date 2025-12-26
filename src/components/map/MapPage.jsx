import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";

import ModeDisclaimerModal from "../Common/ModeDisclaimerModal";
import "../../css/MapPage.css";
import "../../css/land-popup.css";

import MapControls from "./MapControls";
import FilterPanel from "../Panels/FilterPanel";
import PayModal from "./Payments/PayModal";

import { useLongdoMap } from "./hooks/useLongdoMap";
import LandMarkers from "./LandMarkers";
import { mockLands } from "./lands/mockLands";

import buildLandPopupHtml from "./LandDetailPanel";
import UnlockPickerModal from "./UnlockPickerModal";

// -------------------------
// Utils
// -------------------------
function parseLatLng(text) {
  if (!text) return null;
  const s = String(text).trim().replace(/\s+/g, " ");
  const m = s.match(/^(-?\d+(\.\d+)?)[,\s]+(-?\d+(\.\d+)?)$/);
  if (!m) return null;
  const lat = Number(m[1]);
  const lon = Number(m[3]);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  return { lat, lon };
}

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

// -------------------------
// MAIN
// -------------------------
export default function MapPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const mode = params.get("mode") || "buy";

  const [showDisclaimer, setShowDisclaimer] = useState(true);
  useEffect(() => setShowDisclaimer(true), [mode]);

  const [openLayerMenu, setOpenLayerMenu] = useState(false);
  const [isSatellite, setIsSatellite] = useState(false);
  const [isTraffic, setIsTraffic] = useState(false);

  const [filterOpen, setFilterOpen] = useState(false);
  const [filterValue, setFilterValue] = useState({
    province: "",
    district: "",
    type: "",
    priceMin: "",
    priceMax: "",
    frontMin: "",
    frontMax: "",
    depthMin: "",
    depthMax: "",
  });

  const [lands] = useState(mockLands);

  // -------------------------
  // Access / Quota (FRONTEND MOCK)
  // -------------------------
  const ACCESS_KEY = "sqw_access_v1";
  const todayKeyTH = () => new Date().toLocaleDateString("en-CA");

  const loadAccess = useCallback(() => {
    try {
      const raw = localStorage.getItem(ACCESS_KEY);
      const data = raw ? JSON.parse(raw) : null;

      const dateKey = todayKeyTH();
      const savedDate = data?.dateKey ?? dateKey;
      const quotaUsed = savedDate === dateKey ? (data?.quotaUsed ?? 0) : 0;

      return {
        dateKey,
        isMember: !!data?.isMember,
        quotaUsed,
        unlockedFields: data?.unlockedFields ?? {},
      };
    } catch {
      return { dateKey: todayKeyTH(), isMember: false, quotaUsed: 0, unlockedFields: {} };
    }
  }, []);

  const saveAccess = useCallback((next) => {
    localStorage.setItem(ACCESS_KEY, JSON.stringify(next));
  }, []);

  const [access, setAccess] = useState(() => loadAccess());

  // -------------------------
  // Pay + Unlock Picker
  // -------------------------
  const [payOpen, setPayOpen] = useState(false);
  const [payDraft, setPayDraft] = useState(null); // { landId, selectedFields }

  const [unlockOpen, setUnlockOpen] = useState(false);
  const [unlockLandId, setUnlockLandId] = useState("");

  // ref กัน map click ปิด popup ตอน modal เปิด
  const payOpenRef = useRef(false);
  useEffect(() => {
    payOpenRef.current = payOpen;
  }, [payOpen]);

  const unlockOpenRef = useRef(false);
  useEffect(() => {
    unlockOpenRef.current = unlockOpen;
  }, [unlockOpen]);

  // -------------------------
  // Cart
  // -------------------------
  const CART_KEY = "sqw_cart_v1";

  const addToCart = useCallback(
    ({ landId, selectedFields, total }) => {
      if (!landId || !Array.isArray(selectedFields) || selectedFields.length === 0) return;

      const item = {
        id: `${landId}:${selectedFields.slice().sort().join(",")}:${Date.now()}`,
        landId: String(landId),
        selectedFields: selectedFields.slice(),
        total: Number(total || 0),
        createdAt: Date.now(),
      };

      let cart = [];
      try {
        cart = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
        if (!Array.isArray(cart)) cart = [];
      } catch {
        cart = [];
      }

      cart.push(item);
      localStorage.setItem(CART_KEY, JSON.stringify(cart));

      // ให้ Navbar badge อัปเดต
      window.dispatchEvent(new Event("sqw-cart-changed"));

      // ไปหน้า cart
      navigate("/cart");
    },
    [navigate]
  );

  const { mapRef, initMap, applySatellite, applyTraffic, zoomIn, zoomOut, locateMe } = useLongdoMap({
    isSatellite,
    isTraffic,
  });

  const [mapObj, setMapObj] = useState(null);

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

  const handleAcceptDisclaimer = useCallback(() => setShowDisclaimer(false), []);

  // init map
  useEffect(() => {
    if (showDisclaimer) {
      setMapObj(null);
      return;
    }

    initMap()
      .then(() => {
        const m = mapRef.current || null;
        setMapObj(m);
        setTimeout(() => {
          try {
            m?.resize?.();
          } catch {}
        }, 0);
      })
      .catch((e) => {
        console.error(e);
        alert("โหลดแผนที่ไม่สำเร็จ: กรุณาเช็ค longdo script/key");
      });
  }, [showDisclaimer, initMap, mapRef]);

  useEffect(() => {
    if (mapObj) applySatellite(isSatellite);
  }, [isSatellite, applySatellite, mapObj]);

  useEffect(() => {
    if (mapObj) applyTraffic(isTraffic);
  }, [isTraffic, applyTraffic, mapObj]);

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
  const [popupPos, setPopupPos] = useState(null);
  const selectedLocRef = useRef(null);
  const lastPopupOpenAtRef = useRef(0);
  const lastPopupLandRef = useRef(null);
  const lastPopupLocRef = useRef(null);

  const selectedLandRef = useRef(null);
  useEffect(() => {
    selectedLandRef.current = selectedLand;
  }, [selectedLand]);

  const popupOpenRef = useRef(false);
  useEffect(() => {
    popupOpenRef.current = popupOpen;
  }, [popupOpen]);

  // -------------------------
  // กันลากแผนที่แล้วเกิด click หลุด
  // -------------------------
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const DRAG_THRESHOLD = 6; // px

  useEffect(() => {
    const onDown = (e) => {
      if (!popupOpenRef.current) return;
      isDraggingRef.current = false;
      dragStartRef.current = { x: e.clientX ?? 0, y: e.clientY ?? 0 };
    };

    const onMove = (e) => {
      if (!popupOpenRef.current) return;
      const dx = (e.clientX ?? 0) - dragStartRef.current.x;
      const dy = (e.clientY ?? 0) - dragStartRef.current.y;
      if (Math.hypot(dx, dy) > DRAG_THRESHOLD) isDraggingRef.current = true;
    };

    const onUp = () => {
      setTimeout(() => {
        isDraggingRef.current = false;
      }, 0);
    };

    document.addEventListener("pointerdown", onDown, true);
    document.addEventListener("pointermove", onMove, true);
    document.addEventListener("pointerup", onUp, true);

    return () => {
      document.removeEventListener("pointerdown", onDown, true);
      document.removeEventListener("pointermove", onMove, true);
      document.removeEventListener("pointerup", onUp, true);
    };
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
      setAccess(loadAccess());
    },
    [setPopupPosFromLoc, computeSafeAreas, loadAccess]
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

  const handleSelectLandRef = useRef(null);
  useEffect(() => {
    handleSelectLandRef.current = handleSelectLand;
  }, [handleSelectLand]);

  const handleSelectLandSafe = useCallback((land, loc) => {
    handleSelectLandRef.current?.(land, loc);
  }, []);

  // overlayClick / markerClick
  useEffect(() => {
    const map = mapObj;
    if (!map) return;

    const onOverlayClick = (overlay) => {
      const land = overlay?.__land;
      const loc = overlay?.__loc;
      if (land && loc) openPopupFor(land, loc);
    };

    try {
      map.Event.bind("overlayClick", onOverlayClick);
    } catch {}

    return () => {
      try {
        map.Event.unbind("overlayClick", onOverlayClick);
      } catch {}
    };
  }, [mapObj, openPopupFor]);

  useEffect(() => {
    const map = mapObj;
    if (!map) return;

    const onMarkerClick = (overlay) => {
      const land = overlay?.__land;
      const loc = overlay?.__loc;
      if (land && loc) openPopupFor(land, loc);
    };

    try {
      map.Event.bind("markerClick", onMarkerClick);
    } catch {}

    return () => {
      try {
        map.Event.unbind("markerClick", onMarkerClick);
      } catch {}
    };
  }, [mapObj, openPopupFor]);

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

  // click map -> close popup
  useEffect(() => {
    const map = mapObj;
    if (!map) return;

    const onMapClick = () => {
      // ✅ ถ้ามี modal เปิดอยู่ อย่าปิด popup
      if (payOpenRef.current || unlockOpenRef.current) return;

      if (isDraggingRef.current) return;
      const dt = Date.now() - (lastPopupOpenAtRef.current || 0);
      if (dt < 250) return;
      closePopup();
    };

    try {
      map.Event.bind("click", onMapClick);
    } catch {}

    return () => {
      try {
        map.Event.unbind("click", onMapClick);
      } catch {}
    };
  }, [mapObj, closePopup]);

  useEffect(() => {
    closePopup();
  }, [mode, showDisclaimer, closePopup]);

  // search
  const handleSearch = useCallback(
    async (q) => {
      const map = mapObj;
      if (!map) return;

      const text = (q ?? "").trim();
      if (!text) return;

      const ll = parseLatLng(text);
      if (ll) {
        map.location({ lon: ll.lon, lat: ll.lat }, true);
        map.zoom(16, true);
        return;
      }

      try {
        const L = window.longdo;
        const res = await L?.Util?.locationSearch?.(text);
        if (Array.isArray(res) && res[0]?.location) {
          map.location(res[0].location, true);
          map.zoom(16, true);
        }
      } catch (e) {
        console.warn("search failed:", e);
      }
    },
    [mapObj]
  );

  // popup HTML
  const popupHtml = useMemo(() => {
    if (!selectedLand) return "";
    const landId = selectedLand?.id ?? selectedLand?.landId ?? "";
    const unlocked = access?.unlockedFields?.[landId] ?? [];

    return buildLandPopupHtml(selectedLand, {
      isMember: access?.isMember ?? false,
      quota: { limit: 10, used: access?.quotaUsed ?? 0 },
      unlockedFields: unlocked,
    });
  }, [selectedLand, access]);

  // popup layout
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

  // ✅ ฟังก์ชันเปิด unlock modal
  const openUnlockPicker = useCallback((landId) => {
    const id = String(landId || "");
    if (!id) return;

    setPopupOpen(false);
    setPopupPos(null);

    const cur = loadAccess(); // ✅ ใช้ตัวล่าสุด
    const arr = cur?.unlockedFields?.[id];
    const unlockedSet = new Set(Array.isArray(arr) ? arr : []);

    const allKeys = ["contactOwner", "broker", "phone", "line", "frame", "chanote"];
    const remaining = allKeys.filter((k) => !unlockedSet.has(k));

    if (remaining.length === 0) {
      alert("ปลดล็อกข้อมูลครบแล้ว ✅");
      return;
    }

    setUnlockLandId(id);
    setUnlockOpen(true);
  }, [loadAccess]);

  useEffect(() => {
    window.__unlockOpen = (landId) => openUnlockPicker(String(landId || ""));
    return () => {
      try {
        delete window.__unlockOpen;
      } catch {}
    };
  }, [openUnlockPicker]);

  // ✅ handler เดียว (delegation)
  const handlePopupDelegate = useCallback(
    (e) => {
      if (isDraggingRef.current) return;

      const t = e.target;

      const closeBtn = t?.closest?.('[data-sqw-close="1"]');
      if (closeBtn) {
        e.preventDefault();
        e.stopPropagation();
        closePopup();
        return;
      }

      const openBtn = t?.closest?.('[data-action="open-unlock-picker"]');
      if (openBtn) {
        e.preventDefault();
        e.stopPropagation();
        const landIdFromAttr = openBtn.getAttribute("data-land-id") || "";
        const curLand = selectedLandRef.current;
        const landId = landIdFromAttr || (curLand?.id ?? curLand?.landId ?? "");
        if (landId) openUnlockPicker(landId);
        return;
      }

      const unlockAllBtn = t?.closest?.('[data-action="unlock-all"]');
      if (unlockAllBtn) {
        e.preventDefault();
        e.stopPropagation();

        const landIdFromAttr = unlockAllBtn.getAttribute("data-land-id") || "";
        const curLand = selectedLandRef.current;
        const landId = landIdFromAttr || (curLand?.id ?? curLand?.landId ?? "");
        if (!landId) return;

        const cur = loadAccess();
        if (!cur.isMember) return;

        if (cur.quotaUsed >= 10) {
          alert("โควตาการดูข้อมูลวันนี้ครบ 10 ครั้งแล้ว");
          return;
        }

        const used = cur.quotaUsed + 1;
        const allFields = ["contactOwner", "broker", "phone", "line", "frame", "chanote"];

        const unlockedFields = { ...(cur.unlockedFields ?? {}) };
        unlockedFields[landId] = allFields;

        const saved = { dateKey: todayKeyTH(), isMember: true, quotaUsed: used, unlockedFields };
        saveAccess(saved);
        setAccess(saved);
      }
    },
    [closePopup, loadAccess, openUnlockPicker, saveAccess]
  );

  // -------------------------
  // ✅ Unlock Items (ซ่อนที่ปลดล็อกแล้ว)
  // -------------------------
  const ALL_UNLOCK_ITEMS = useMemo(
    () => [
      { k: "contactOwner", label: "เจ้าของ", price: 50, icon: "👤" },
      { k: "broker", label: "นายหน้า", price: 50, icon: "🧑‍💼" },
      { k: "phone", label: "เบอร์โทร", price: 200, icon: "📞" },
      { k: "line", label: "LINE ID", price: 150, icon: "💬" },
      { k: "frame", label: "กรอบที่ดิน", price: 100, icon: "🗺️" },
      { k: "chanote", label: "โฉนด/ระวาง", price: 200, icon: "📄" },
    ],
    []
  );

  const unlockedForThisLand = useMemo(() => {
    const landId = String(unlockLandId || "");
    const arr = access?.unlockedFields?.[landId];
    return Array.isArray(arr) ? arr : [];
  }, [access, unlockLandId]);

  const unlockedSetForThisLand = useMemo(() => new Set(unlockedForThisLand), [unlockedForThisLand]);

  const unlockItems = useMemo(() => {
    return ALL_UNLOCK_ITEMS.filter((it) => !unlockedSetForThisLand.has(it.k));
  }, [ALL_UNLOCK_ITEMS, unlockedSetForThisLand]);

  return (
    <div className="map-shell">
      <div id="map" className="map-canvas" />
      {showDisclaimer && <ModeDisclaimerModal onClose={handleAcceptDisclaimer} />}

      <FilterPanel
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        value={filterValue}
        onChange={setFilterValue}
        onApply={() => setFilterOpen(false)}
        onClear={() =>
          setFilterValue({
            province: "",
            district: "",
            type: "",
            priceMin: "",
            priceMax: "",
            frontMin: "",
            frontMax: "",
            depthMin: "",
            depthMax: "",
          })
        }
      />

      <div
        id="map-overlay"
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          zIndex: 1,
        }}
      />

      {!!mapObj && <LandMarkers map={mapObj} lands={lands} onSelect={handleSelectLandSafe} />}

      <MapControls
        onSearch={handleSearch}
        openLayerMenu={openLayerMenu}
        setOpenLayerMenu={setOpenLayerMenu}
        isSatellite={isSatellite}
        setIsSatellite={setIsSatellite}
        isTraffic={isTraffic}
        setIsTraffic={setIsTraffic}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onLocate={locateMe}
        onOpenFilter={() => setFilterOpen(true)}
        onOpenChat={() => alert("TODO: open chat")}
      />

      {/* popup */}
      {popupOpen && popupPos
        ? createPortal(
            <div style={popupStyle}>
              <div ref={popupBoxRef} style={{ position: "relative", pointerEvents: "auto" }}>
                <div style={arrowStyle} />
                <div
                  className="land-popup-shell"
                  style={{ position: "relative", zIndex: 2, pointerEvents: "auto" }}
                  onPointerDownCapture={handlePopupDelegate}
                  onClick={handlePopupDelegate}
                  dangerouslySetInnerHTML={{ __html: popupHtml }}
                />
              </div>
            </div>,
            document.body
          )
        : null}

      {/* ✅ Unlock Picker */}
      <UnlockPickerModal
        open={unlockOpen}
        landId={unlockLandId}
        title="ปลดล็อกข้อมูลที่ดินนี้"
        subtitle="ข้อมูลติดต่อ"
        items={unlockItems}
        initialSelected={[]}
        onCancel={() => {
          setUnlockOpen(false);
          if (lastPopupLandRef.current && lastPopupLocRef.current) {
            openPopupFor(
              lastPopupLandRef.current,
              lastPopupLocRef.current
            );
          }
        }}
        onAddToCart={({ selected, total }) => {
          addToCart({ landId: unlockLandId, selectedFields: selected, total });
          setUnlockOpen(false);
        }}
        onConfirm={({ selected }) => {
          if (!unlockLandId || !selected?.length) return;
          setPayDraft({ landId: unlockLandId, selectedFields: selected });
          setUnlockOpen(false);
          setPayOpen(true);
        }}
      />

      {/* ✅ PayModal (mock) */}
      <PayModal
        open={payOpen}
        draft={payDraft}
        onClose={() => {
          setPayOpen(false);
          // ✅ ถ้ายกเลิกชำระเงิน ให้ popup กลับมา
          if (lastPopupLandRef.current && lastPopupLocRef.current) {
            openPopupFor(lastPopupLandRef.current, lastPopupLocRef.current);
          }
        }}
        onPaid={(savedAccess) => {
          setAccess(savedAccess);
          setPayOpen(false);
          closePopup(); // ✅ ชำระแล้ว ไม่ให้ popup กลับมา
        }}
      />
    </div>
  );
}

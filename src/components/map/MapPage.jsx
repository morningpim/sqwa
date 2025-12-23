import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { createPortal } from "react-dom";

import ModeDisclaimerModal from "../Common/ModeDisclaimerModal";
import "../../css/MapPage.css";
import "../../css/land-popup.css";

import SearchBar from "../Panels/SearchPanel";
import MapControls from "./MapControls";
import FilterPanel from "../Panels/FilterPanel";

import { useLongdoMap } from "./hooks/useLongdoMap";
import LandMarkers from "./LandMarkers";
import { mockLands } from "./lands/mockLands";

import buildLandPopupHtml from "./LandDetailPanel";

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
  const mode = params.get("mode") || "buy";

  // ✅ PATCH: ให้ขึ้น Disclaimer "ทุกครั้งเมื่อเปลี่ยนโหมด"
  // - ไม่ใช้ sessionStorage แล้ว (เพราะต้องการให้แจ้งเตือนทุกครั้ง)
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  useEffect(() => {
    setShowDisclaimer(true);
  }, [mode]);

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

  const { mapRef, initMap, applySatellite, applyTraffic, zoomIn, zoomOut, locateMe } =
    useLongdoMap({ isSatellite, isTraffic });

  const [mapObj, setMapObj] = useState(null);

  // target DOM
  const [mapEl, setMapEl] = useState(null);
  const [overlayEl, setOverlayEl] = useState(null);
  useEffect(() => {
    setMapEl(document.getElementById("map"));
    setOverlayEl(document.getElementById("map-overlay"));
  }, []);

  // ✅ safeTop: ระยะจากบน overlay ที่ห้าม popup ทับ (Navbar + SearchBar)
  const [safeTop, setSafeTop] = useState(0);
  const [overlaySize, setOverlaySize] = useState({ w: 0, h: 0 });

  // ✅ วัดขนาด popup จริง (ใช้ clamp ให้ไม่เกินขอบ + วางขวาหมุด)
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

  const computeSafeTop = useCallback(() => {
    if (!overlayEl) return;
    const overlayRect = overlayEl.getBoundingClientRect?.();
    if (!overlayRect) return;

    setOverlaySize({ w: overlayRect.width, h: overlayRect.height });

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

    const GAP = 12;
    const localSafe = Math.max(0, maxBottom - overlayRect.top);
    setSafeTop(localSafe + GAP);
  }, [overlayEl]);

  // -------------------------
  // Disclaimer close
  // -------------------------
  // ✅ PATCH: กดรับทราบแล้วค่อยให้โหลดแผนที่/ข้อมูลต่อ
  const handleAcceptDisclaimer = useCallback(() => {
    setShowDisclaimer(false);
  }, []);

  // -------------------------
  // Init Map
  // -------------------------
  useEffect(() => {
    if (showDisclaimer) {
      setMapObj(null);
      return;
    }

    initMap()
      .then(() => setMapObj(mapRef.current || null))
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
    computeSafeTop();
    window.addEventListener("resize", computeSafeTop);
    return () => window.removeEventListener("resize", computeSafeTop);
  }, [computeSafeTop]);

  // -------------------------
  // Popup State
  // -------------------------
  const [popupOpen, setPopupOpen] = useState(false);
  const [selectedLand, setSelectedLand] = useState(null);
  const [popupPos, setPopupPos] = useState(null); // local to overlay
  const selectedLocRef = useRef(null);
  const lastPopupOpenAtRef = useRef(0);

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

      // 1) ดีสุด: locationToScreen
      try {
        if (typeof mapObj.locationToScreen === "function") {
          pt = normalizePoint(mapObj.locationToScreen(loc));
        }
      } catch {}

      // 2) fallback: locationToPoint
      if (!pt) {
        try {
          if (typeof mapObj.locationToPoint === "function") {
            pt = normalizePoint(mapObj.locationToPoint(loc));
          } else if (mapObj.Projection && typeof mapObj.Projection.locationToPoint === "function") {
            pt = normalizePoint(mapObj.Projection.locationToPoint(loc));
          }
        } catch {}
      }

      if (!pt) {
        setPopupPos({ x: overlayRect.width / 2, y: overlayRect.height / 2 });
        return;
      }

      // Detect pt เป็น map-local หรือ viewport
      const isMapLocal =
        pt.x >= -2 && pt.y >= -2 && pt.x <= mapRect.width + 2 && pt.y <= mapRect.height + 2;

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
      selectedLocRef.current = loc;
      setSelectedLand(land);
      setPopupOpen(true);
      lastPopupOpenAtRef.current = Date.now();
      setPopupPosFromLoc(loc);
      computeSafeTop();
    },
    [setPopupPosFromLoc, computeSafeTop]
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

  // ✅ overlayClick (ชัวร์สุด)
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

  // ✅ ทำให้ popup “ตามหมุดแน่นอน” แม้ event ของ map บางตัวไม่ยิง
  // ใช้ RAF loop เบา ๆ (ประมาณ 30fps)
  useEffect(() => {
    if (!popupOpen) return;

    let raf = 0;
    let last = 0;

    const loop = (t) => {
      raf = requestAnimationFrame(loop);
      if (!popupOpen) return;
      if (t - last < 33) return; // ~30fps
      last = t;

      const loc = selectedLocRef.current;
      if (!loc) return;
      setPopupPosFromLoc(loc);
      computeSafeTop();
    };

    raf = requestAnimationFrame(loop);
    return () => {
      if (raf) cancelAnimationFrame(raf);
    };
  }, [popupOpen, setPopupPosFromLoc, computeSafeTop]);

  // click map -> close popup (กันปิดทันทีหลังคลิกหมุด)
  useEffect(() => {
    const map = mapObj;
    if (!map) return;

    const onMapClick = () => {
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

  // ✅ โหมดเปลี่ยน หรือกลับไปขึ้น disclaimer -> ปิด popup ทันที
  useEffect(() => {
    closePopup();
  }, [mode, showDisclaimer, closePopup]);

  // -------------------------
  // Search
  // -------------------------
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

  // -------------------------
  // Popup HTML & style
  // -------------------------
  const popupHtml = useMemo(() => {
    if (!selectedLand) return "";
    return buildLandPopupHtml(selectedLand);
  }, [selectedLand]);

  // ✅ วาง “ด้านขวาหมุด” ก่อน (ไม่ทับหมุด) ถ้าไม่พอค่อยไปซ้าย
  const GAP_X = 14;
  const GAP_Y = 0;
  const SAFE_BOTTOM = 16;
  const SAFE_SIDE = 12;

  const popupSide = useMemo(() => {
    const x = popupPos?.x ?? 0;
    const W = popupSize.w;
    const OW = overlaySize.w || 0;
    if (!OW) return "right";

    const canRight = x + GAP_X + W <= OW - SAFE_SIDE;
    const canLeft = x - GAP_X - W >= SAFE_SIDE;

    if (canRight) return "right";
    if (canLeft) return "left";
    return "right";
  }, [popupPos, popupSize.w, overlaySize.w]);

  const popupStyle = useMemo(() => {
    const x = popupPos?.x ?? 0;
    const y = popupPos?.y ?? 0;

    const OW = overlaySize.w || 0;
    const OH = overlaySize.h || 0;

    const W = popupSize.w;
    const H = popupSize.h;

    let left = popupSide === "right" ? x + GAP_X : x - GAP_X - W;
    let top = y - H / 2 + GAP_Y;

    if (OW) left = Math.max(SAFE_SIDE, Math.min(OW - SAFE_SIDE - W, left));

    const minTop = safeTop;
    const maxTop = OH ? OH - SAFE_BOTTOM - H : top;
    top = Math.max(minTop, Math.min(maxTop, top));

    return {
      position: "absolute",
      left: `${left}px`,
      top: `${top}px`,
      zIndex: 50,
      pointerEvents: "none",
      background: "transparent",
    };
  }, [popupPos, popupSide, safeTop, overlaySize.w, overlaySize.h, popupSize.w, popupSize.h]);

  // ✅ กากบาทปิดได้ (แม้เป็น dangerouslySetInnerHTML)
  const handlePopupClick = useCallback(
    (e) => {
      const closeBtn = e.target?.closest?.('[data-sqw-close="1"]');
      if (closeBtn) {
        e.preventDefault();
        e.stopPropagation();
        closePopup();
      }
    },
    [closePopup]
  );

  // -------------------------
  // Render
  // -------------------------
  return (
    <div className="map-page">
      {showDisclaimer && <ModeDisclaimerModal onClose={handleAcceptDisclaimer} />}

      {/*<SearchBar onSearch={handleSearch} />*/}

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

      <div className="map-shell" style={{ position: "relative", zIndex: 0 }}>
        <div id="map" className="map-canvas" />

        {/* overlay ของเราเอง */}
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

        {/* popup portal เข้า overlay */}
        {popupOpen && popupPos && overlayEl
          ? createPortal(
              <div style={popupStyle}>
                <div
                  className="land-popup-shell"
                  ref={popupBoxRef}
                  style={{ pointerEvents: "auto" }}
                  onClick={handlePopupClick}
                  dangerouslySetInnerHTML={{ __html: popupHtml }}
                />
              </div>,
              overlayEl
            )
          : null}
      </div>
    </div>
  );
}

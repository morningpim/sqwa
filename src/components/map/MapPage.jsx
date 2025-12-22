import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import ModeDisclaimerModal from "../Common/ModeDisclaimerModal";
import "../../css/MapPage.css";

import SearchBar from "./SearchBar";
import MapControls from "./MapControls";
import FilterPanel from "../Panels/FilterPanel";

import { useLongdoMap } from "./hooks/useLongdoMap";
import LandMarkers from "./LandMarkers";
import { mockLands } from "./lands/mockLands";

// ✅ HTML generator ของ popup (Longdo Popup)
import buildLandPopupHtml from "./LandDetailPanel";

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

export default function MapPage() {
  const [params] = useSearchParams();
  const mode = params.get("mode") || "buy";

  const storageKey = `sqw_disclaimer_ok_${mode}`;
  const [showDisclaimer, setShowDisclaimer] = useState(
    () => sessionStorage.getItem(storageKey) !== "1"
  );

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

  const modeLabel = useMemo(() => {
    if (mode === "buy") return "โหมดซื้อขายที่ดิน";
    if (mode === "sell") return "โหมดฝากขายที่ดิน";
    return "";
  }, [mode]);

  // ✅ lands
  const [lands] = useState(mockLands);

  // ✅ selection
  const [selectedLand, setSelectedLand] = useState(null);
  const selectedLocRef = useRef(null);

  // ✅ longdo hook
  const {
    mapRef,
    initMap,
    applySatellite,
    applyTraffic,
    zoomIn,
    zoomOut,
    locateMe,
  } = useLongdoMap({ isSatellite, isTraffic });

  // ✅ map instance state
  const [mapObj, setMapObj] = useState(null);

  // ✅ popup ล่าสุด
  const popupRef = useRef(null);

  // ---- disclaimer ----
  useEffect(() => {
    const ok = sessionStorage.getItem(`sqw_disclaimer_ok_${mode}`) === "1";
    setShowDisclaimer(!ok);
  }, [mode]);

  useEffect(() => setOpenLayerMenu(false), [mode, showDisclaimer]);

  const handleAcceptDisclaimer = useCallback(() => {
    sessionStorage.setItem(storageKey, "1");
    setShowDisclaimer(false);
  }, [storageKey]);

  // ✅ init map
  useEffect(() => {
    if (!showDisclaimer) {
      initMap()
        .then(() => setMapObj(mapRef.current || null))
        .catch((e) => {
          console.error(e);
          alert("โหลดแผนที่ไม่สำเร็จ: กรุณาเช็ค script longdo");
        });
    } else {
      setMapObj(null);
    }
  }, [showDisclaimer, initMap, mapRef]);

  // ✅ apply layers
  useEffect(() => {
    if (mapObj) applySatellite(isSatellite);
  }, [isSatellite, applySatellite, mapObj]);

  useEffect(() => {
    if (mapObj) applyTraffic(isTraffic);
  }, [isTraffic, applyTraffic, mapObj]);

  // =========================
  // ✅ Popup helpers
  // =========================
  const closeLongdoPopup = useCallback(() => {
    const map = mapObj;
    if (!map || !popupRef.current) return;
    try {
      map.Overlays.remove(popupRef.current);
    } catch {}
    popupRef.current = null;
  }, [mapObj]);

  // (optional) ล้าง chrome ของ Longdo ถ้าต้องการลดกรอบ/เงา
  const stripLongdoChrome = useCallback((root) => {
    if (!root) return;

    const kill = (el) => {
      if (!el || !el.style) return;
      el.style.background = "transparent";
      el.style.border = "0";
      el.style.boxShadow = "none";
      el.style.padding = "0";
      el.style.margin = "0";
      el.style.borderRadius = "0";
      el.style.outline = "none";
      el.style.overflow = "visible";
      el.style.maxHeight = "none";
      el.style.height = "auto";
    };

    // ไล่จาก root → parent หลายชั้น
    let el = root;
    for (let i = 0; i < 18 && el; i++) {
      kill(el);
      el = el.parentElement;
    }
    root.querySelectorAll("*").forEach(kill);
  }, []);

  const openLongdoPopup = useCallback(
    (land, loc) => {
      const map = mapObj;
      if (!map || !window.longdo || !land || !loc) return;

      closeLongdoPopup();

      const html = buildLandPopupHtml(land);

      // ✅ ขนาดคงที่ (อยากเล็ก/ใหญ่ปรับ 2 ค่านี้)
      const popupWidth = 320;
      const popupHeight = 420;

      const popup = new window.longdo.Popup(loc, {
        title: "",
        detail: html,
        size: { width: popupWidth, height: popupHeight },
        // ถ้า lib รองรับ จะช่วยลดปุ่ม/ลาก
        closable: false,
        draggable: false,
        // จัดให้ชี้หมุด (ถ้า overlay อยู่กลาง ๆ)
        offset: { x: -(popupWidth / 2), y: -18 },
      });

      popupRef.current = popup;
      map.Overlays.add(popup);

      // bind ปุ่มปิดของเรา + strip chrome
      setTimeout(() => {
        const root = document.getElementById("sqw-popup-root");
        if (root) stripLongdoChrome(root);

        const btnClose = document.getElementById("sqwa-close-btn");
        if (btnClose) btnClose.onclick = () => closeLongdoPopup();
      }, 0);
    },
    [mapObj, closeLongdoPopup, stripLongdoChrome]
  );

  // ✅ คลิกหมุด/โพลิกอน -> เลือก land + เปิด popup ชี้หมุด
  const handleSelectLand = useCallback(
    (land, loc) => {
      if (!land) return;

      setSelectedLand(land);

      const finalLoc =
        loc ??
        (land?.location?.lon != null && land?.location?.lat != null
          ? land.location
          : land?.lat != null && land?.lon != null
          ? { lat: land.lat, lon: land.lon }
          : null);

      if (finalLoc) {
        selectedLocRef.current = finalLoc;
        openLongdoPopup(land, finalLoc);
      }
    },
    [openLongdoPopup]
  );

  // ✅ ref กัน closure (ใช้กับ event bind)
  const handleSelectLandRef = useRef(handleSelectLand);
  useEffect(() => {
    handleSelectLandRef.current = handleSelectLand;
  }, [handleSelectLand]);

  // ✅ จับคลิก overlay ที่ระดับ map (กรณี overlay ส่ง __land/__loc)
  useEffect(() => {
    const map = mapObj;
    if (!map) return;

    const onOverlayClick = (overlay) => {
      const land = overlay?.__land;
      const loc = overlay?.__loc;
      if (land && handleSelectLandRef.current) {
        handleSelectLandRef.current(land, loc);
      }
    };

    try {
      map.Event.bind("overlayClick", onOverlayClick);
    } catch (e) {
      console.warn("bind overlayClick failed", e);
    }

    return () => {
      try {
        map.Event.unbind("overlayClick", onOverlayClick);
      } catch {}
    };
  }, [mapObj]);

  // ✅ ปิด popup เมื่อเปลี่ยน mode หรือปิด disclaimer
  useEffect(() => {
    closeLongdoPopup();
    setSelectedLand(null);
    selectedLocRef.current = null;
  }, [mode, showDisclaimer, closeLongdoPopup]);

  // ✅ Search
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
        if (L?.Util?.locationSearch) {
          const res = await L.Util.locationSearch(text);
          if (Array.isArray(res) && res[0]?.location) {
            map.location(res[0].location, true);
            map.zoom(16, true);
          }
        }
      } catch (e) {
        console.warn("search failed:", e);
      }
    },
    [mapObj]
  );

  return (
    <div className="map-shell">
      <div id="map" className="map-canvas" />

      <SearchBar onSearch={handleSearch} />

      {/* ✅ MARKERS + POLYGONS */}
      <LandMarkers
        map={mapObj}
        lands={lands}
        selectedLand={selectedLand}
        onSelect={handleSelectLand} // ✅ คลิกแล้วเปิด popup ชี้หมุด
      />

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

      <MapControls
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
        onOpenChat={() => alert("TODO: Chat")}
        onOpenTools={() => alert("TODO: Tools")}
      />

      {showDisclaimer && (
        <ModeDisclaimerModal modeLabel={modeLabel} onClose={handleAcceptDisclaimer} />
      )}
    </div>
  );
}

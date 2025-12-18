import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import ModeDisclaimerModal from "../Common/ModeDisclaimerModal";
import "../../css/MapPage.css";

import SearchBar from "./SearchBar";
import MapControls from "./MapControls";
import FilterPanel from "../Panels/FilterPanel";

import { useLongdoMap } from "./hooks/useLongdoMap";
import LandMarkers from "./LandMarkers";
import LandDetailPanel from "./LandDetailPanel";
import { mockLands } from "./lands/mockLands";

function parseLatLng(text) {
  // รองรับ "13.7563, 100.5018" หรือ "13.7563 100.5018"
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
  const [showDisclaimer, setShowDisclaimer] = useState(() => sessionStorage.getItem(storageKey) !== "1");

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

  // ✅ selection + popup position
  const [selectedLand, setSelectedLand] = useState(null);
  const [popupPos, setPopupPos] = useState(null);
  const selectedLocRef = useRef(null);

  // ✅ longdo hook
  const { mapRef, initMap, applySatellite, applyTraffic, zoomIn, zoomOut, locateMe } = useLongdoMap({
    isSatellite,
    isTraffic,
  });

  useEffect(() => {
    const ok = sessionStorage.getItem(`sqw_disclaimer_ok_${mode}`) === "1";
    setShowDisclaimer(!ok);
  }, [mode]);

  useEffect(() => setOpenLayerMenu(false), [mode, showDisclaimer]);

  useEffect(() => {
    if (!showDisclaimer) {
      initMap().catch((e) => {
        console.error(e);
        alert("โหลดแผนที่ไม่สำเร็จ: กรุณาเช็ค script longdo");
      });
    }
  }, [showDisclaimer, initMap]);

  useEffect(() => {
    if (mapRef.current) applySatellite(isSatellite);
  }, [isSatellite, applySatellite, mapRef]);

  useEffect(() => {
    if (mapRef.current) applyTraffic(isTraffic);
  }, [isTraffic, applyTraffic, mapRef]);

  const handleAcceptDisclaimer = () => {
    sessionStorage.setItem(storageKey, "1");
    setShowDisclaimer(false);
  };

  const updatePopupFromLoc = useCallback((loc) => {
    const map = mapRef.current;
    if (!map || !loc) return;
    try {
      const pt = map.locationToPoint(loc);
      if (pt && typeof pt.x === "number" && typeof pt.y === "number") {
        setPopupPos({ x: pt.x, y: pt.y });
      }
    } catch (e) {}
  }, [mapRef]);

  // ✅ คลิกหมุด/โพลิกอน -> เลือก land + เก็บ loc เพื่อผูก popup
  const handleSelectLand = useCallback(
    (land, loc) => {
      setSelectedLand(land || null);

      if (loc) {
        selectedLocRef.current = loc;
        updatePopupFromLoc(loc);
      } else {
        // ถ้าไม่ได้ส่ง loc มา ลอง fallback จาก land.location
        const fallback = land?.location;
        if (fallback?.lon != null && fallback?.lat != null) {
          selectedLocRef.current = fallback;
          updatePopupFromLoc(fallback);
        }
      }
    },
    [updatePopupFromLoc]
  );

  // ✅ เวลาเลื่อน/ซูมแผนที่ -> ขยับ popup ตามหมุด
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !window.longdo) return;

    const L = window.longdo;

    const recalc = () => {
      if (selectedLocRef.current) updatePopupFromLoc(selectedLocRef.current);
    };

    try {
      L.Event.bind(map, "move", recalc);
      L.Event.bind(map, "zoom", recalc);
    } catch (e) {
      // ถ้า event name ไม่ตรงก็ยังอย่างน้อยจะคำนวณตอนคลิกได้
    }

    return () => {
      try {
        L.Event.unbind(map, "move", recalc);
        L.Event.unbind(map, "zoom", recalc);
      } catch (e) {}
    };
  }, [mapRef, updatePopupFromLoc]);

  // ✅ Search: รองรับ lat,lng และ search ชื่อสถานที่ด้วย longdo.Util.locationSearch
  const handleSearch = useCallback(
    async (q) => {
      const map = mapRef.current;
      if (!map) return;

      const text = (q ?? "").trim();
      if (!text) return;

      // 1) lat,lng
      const ll = parseLatLng(text);
      if (ll) {
        map.location({ lon: ll.lon, lat: ll.lat }, true);
        map.zoom(16, true);
        return;
      }

      // 2) place search
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
    [mapRef]
  );

  return (
    <div className="map-shell">
      <div id="map" className="map-canvas" />

      <SearchBar onSearch={handleSearch} />

      {/* ✅ MARKERS + POLYGONS */}
      {mapRef.current && (
        <LandMarkers
            map={mapRef.current}
            lands={lands}
            selectedLand={selectedLand}
            onSelect={handleSelectLand}
          />
      )}

      {/* ✅ POPUP ใกล้หมุด (แทนการ fixed ชิดขวา) */}
      {selectedLand && popupPos && (
        <LandDetailPanel
          land={selectedLand}
          mode="popup"
          pos={popupPos}
          onClose={() => {
            setSelectedLand(null);
            setPopupPos(null);
            selectedLocRef.current = null;
          }}
        />
      )}

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

      {showDisclaimer && <ModeDisclaimerModal modeLabel={modeLabel} onClose={handleAcceptDisclaimer} />}
    </div>
  );
}

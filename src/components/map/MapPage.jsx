// src/components/map/MapPage.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ModeDisclaimerModal from "../Common/ModeDisclaimerModal";
import "../../css/MapPage.css";

import SearchBar from "./SearchBar";
import MapControls from "./MapControls";
import FilterPanel from "../Panels/FilterPanel";

export default function MapPage() {
  const [params] = useSearchParams();
  const mode = params.get("mode") || "buy"; // buy | sell

  // ====== modal ======
  const storageKey = `sqw_disclaimer_ok_${mode}`;
  const [showDisclaimer, setShowDisclaimer] = useState(() => {
    return sessionStorage.getItem(storageKey) !== "1";
  });

  // ====== longdo map ======
  const mapRef = useRef(null);
  const mapInitedRef = useRef(false);

  // ====== UI state (controls) ======
  const [openLayerMenu, setOpenLayerMenu] = useState(false);
  const [isSatellite, setIsSatellite] = useState(false);
  const [isTraffic, setIsTraffic] = useState(false);

  // ====== filter (LEFT PANEL) ======
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

  // ====== utils ======
  const waitForLongdo = () =>
    new Promise((resolve, reject) => {
      const start = Date.now();
      const tick = () => {
        if (window.longdo && window.longdo.Map) return resolve(true);
        if (Date.now() - start > 12000) return reject(new Error("Longdo script not loaded"));
        requestAnimationFrame(tick);
      };
      tick();
    });

  const pickFirstLayer = (...keys) => {
    const L = window.longdo?.Layers;
    if (!L) return null;
    for (const k of keys) {
      if (L[k]) return L[k];
    }
    return null;
  };

  const hideLongdoUi = (map) => {
    const ui = map?.Ui;
    if (!ui) return;

    const tryHide = (key) => {
      try {
        const obj = ui[key];
        if (obj && typeof obj.visible === "function") obj.visible(false);
      } catch {}
    };

    [
      "Scale",
      "Zoombar",
      "DPad",
      "Toolbar",
      "LayerSelector",
      "Layers",
      "FullScreen",
      "Geolocation",
      "Crosshair",
      "Compass",
      "MiniMap",
    ].forEach(tryHide);
  };

  // ====== layer handlers ======
  const applySatellite = (on) => {
    const map = mapRef.current;
    if (!map || !window.longdo) return;

    try {
      const normal = pickFirstLayer("NORMAL", "ROAD", "BASE") || window.longdo.Layers?.NORMAL;
      const satellite =
        pickFirstLayer("SATELLITE", "SAT", "GOOGLE_SATELLITE", "HYBRID", "SATELLITE_HYBRID") ||
        window.longdo.Layers?.SATELLITE;

      const baseLayer = on ? satellite : normal;
      if (!baseLayer) {
        console.warn("No base layer found. longdo.Layers =", window.longdo?.Layers);
        return;
      }

      if (map.Layers && typeof map.Layers.setBase === "function") {
        map.Layers.setBase(baseLayer);
        return;
      }
      if (map.Layers && typeof map.Layers.set === "function") {
        map.Layers.set(baseLayer);
      }
    } catch (e) {
      console.warn("applySatellite failed:", e);
    }
  };

  const applyTraffic = (on) => {
    const map = mapRef.current;
    if (!map || !window.longdo) return;

    try {
      const traffic = pickFirstLayer("TRAFFIC", "TRAFFIC_LAYER") || window.longdo.Layers?.TRAFFIC;
      if (!traffic) {
        console.warn("No traffic layer found. longdo.Layers =", window.longdo?.Layers);
        return;
      }

      if (on) map.Layers?.add?.(traffic);
      else map.Layers?.remove?.(traffic);
    } catch (e) {
      console.warn("applyTraffic failed:", e);
    }
  };

  // ====== map actions ======
  const zoomIn = () => {
    const map = mapRef.current;
    if (!map) return;
    try {
      map.zoom(map.zoom() + 1, true);
    } catch {}
  };

  const zoomOut = () => {
    const map = mapRef.current;
    if (!map) return;
    try {
      map.zoom(map.zoom() - 1, true);
    } catch {}
  };

  const locateMe = () => {
    const map = mapRef.current;
    if (!map) return;

    if (!navigator.geolocation) {
      alert("เบราว์เซอร์ไม่รองรับ Geolocation");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;

        try {
          map.location({ lon: longitude, lat: latitude }, true);
          map.zoom(14, true);

          try {
            const mk = new window.longdo.Marker(
              { lon: longitude, lat: latitude },
              { title: "My location" }
            );
            map.Overlays?.add?.(mk);
          } catch {}
        } catch {}
      },
      () => alert("ไม่สามารถเข้าถึงตำแหน่งได้ (ตรวจ permission)"),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // ====== init map ======
  const initMap = async () => {
    if (mapInitedRef.current) return;
    mapInitedRef.current = true;

    await waitForLongdo();

    const el = document.getElementById("map");
    if (!el) throw new Error("Missing #map");

    const map = new window.longdo.Map({ placeholder: el });
    mapRef.current = map;

    hideLongdoUi(map);

    map.location({ lon: 100.5018, lat: 13.7563 }, true);
    map.zoom(10, true);

    applySatellite(isSatellite);
    applyTraffic(isTraffic);
  };

  // ====== effects ======
  useEffect(() => {
    const ok = sessionStorage.getItem(`sqw_disclaimer_ok_${mode}`) === "1";
    setShowDisclaimer(!ok);
  }, [mode]);

  useEffect(() => {
    setOpenLayerMenu(false);
  }, [mode, showDisclaimer]);

  useEffect(() => {
    if (!showDisclaimer) {
      initMap().catch((e) => {
        console.error(e);
        alert("โหลดแผนที่ไม่สำเร็จ: กรุณาเช็ค script longdo");
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showDisclaimer]);

  useEffect(() => {
    if (mapRef.current) applySatellite(isSatellite);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSatellite]);

  useEffect(() => {
    if (mapRef.current) applyTraffic(isTraffic);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTraffic]);

  const handleAcceptDisclaimer = () => {
    sessionStorage.setItem(storageKey, "1");
    setShowDisclaimer(false);
  };

  return (
    <div className="map-shell">
      <div id="map" className="map-canvas" />

      <SearchBar placeholder="Search Here" onSearch={(q) => console.log("search:", q)} />

      {/* ✅ FilterPanel อยู่ใน MapPage -> ย้ายซ้ายได้จริง */}
      <FilterPanel
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        value={filterValue}
        onChange={setFilterValue}
        onApply={() => {
          setFilterOpen(false);
          console.log("apply filter", filterValue);
        }}
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
        onOpenFilter={() => setFilterOpen(true)}   // ✅ เปิด filter ซ้าย
        onOpenChat={() => alert("TODO: Chat")}
        onOpenTools={() => alert("TODO: Tools")}
      />

      <div className="map-stats">
        <div className="stat-card">
          <div className="stat-title">ที่ดินทั้งหมด</div>
          <div className="stat-value">550</div>
          <div className="stat-unit">ประกาศ</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">จำนวนรวม</div>
          <div className="stat-value">4,007.43</div>
          <div className="stat-unit">ไร่</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">มูลค่าที่ดินรวม</div>
          <div className="stat-value">161,166</div>
          <div className="stat-unit">บาท</div>
        </div>
      </div>

      {showDisclaimer && (
        <ModeDisclaimerModal modeLabel={modeLabel} onClose={handleAcceptDisclaimer} />
      )}
    </div>
  );
}

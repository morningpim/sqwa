// src/components/map/MapPage.jsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import ModeDisclaimerModal from "../Common/ModeDisclaimerModal";
import "../../css/MapPage.css";
import "../../css/land-popup.css";

import MapControls from "./MapControls";
import FilterPanel from "../Panels/FilterPanel";
import PayModal from "./Payments/PayModal";
import MapPopup from "./MapPopup";

import { useLongdoMap } from "./hooks/useLongdoMap";
import { useMapAccess } from "./hooks/useMapAccess";
import { useMapCart } from "./hooks/useMapCart";
import { useMapPopup } from "./hooks/useMapPopup";
import { useMapEvents } from "./hooks/useMapEvents";
import { useDragGuard } from "./hooks/useDragGuard";
import { useReopenPopup } from "./hooks/useReopenPopup";
import { useMapSearch } from "./hooks/useMapSearch";
import { useSelectedLandAccess } from "./hooks/useSelectedLandAccess";
import { useLandSelection } from "./hooks/useLandSelection";
import { useUnlockFlow } from "./hooks/useUnlockFlow";

import { DEFAULT_FILTER } from "./constants/filter";

import LandMarkers from "./LandMarkers";
import { mockLands } from "./lands/mockLands";

import LandDetailPanel from "./LandDetailPanel";
import UnlockPickerModal from "./UnlockPickerModal";

import { useLandFilters } from "./hooks/useLandFilters";
import { useLongdoDrawing } from "./hooks/useLongdoDrawing";

// ✅ Role (mock – ยังไม่ทำ backend)
import { useAuth } from "../../auth/AuthProvider";
import RolePickerModal from "../../auth/RolePickerModal";

export default function MapPage() {
  // =========================================================================
  // Router
  // =========================================================================
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const mode = params.get("mode") || "buy"; // buy | sell | eia

  // =========================================================================
  // Role (mock)
  // =========================================================================
  const { role, updateRole } = useAuth();
  const [roleOpen, setRoleOpen] = useState(false);

  const canDrawInBuy = role === "landlord" || role === "seller" || role === "admin";
  const canSell = role === "seller" || role === "admin";

  const drawingEnabled = mode === "buy" ? canDrawInBuy : mode === "sell" ? canSell : mode === "eia";

  const [currentMode, setCurrentMode] = useState("normal"); // normal | eia

  // ✅ กัน buyer เข้า sell
  useEffect(() => {
    if (mode === "sell" && !canSell) {
      alert("ต้องเป็น Seller หรือ Admin เท่านั้นถึงจะใช้โหมด Sell ได้");
      navigate("/map?mode=buy", { replace: true });
    }
  }, [mode, canSell, navigate]);

  // =========================================================================
  // UI state
  // =========================================================================
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  useEffect(() => setShowDisclaimer(true), [mode]);
  const handleAcceptDisclaimer = useCallback(() => setShowDisclaimer(false), []);

  const [openLayerMenu, setOpenLayerMenu] = useState(false);
  const [isSatellite, setIsSatellite] = useState(false);
  const [isTraffic, setIsTraffic] = useState(false);
  const [dolEnabled, setDolEnabled] = useState(true);
  const [dolOpacity, setDolOpacity] = useState(0.35);

  // =========================================================================
  // Data
  // =========================================================================
  const lands = useMemo(() => mockLands, []);

  // =========================================================================
  // Filters
  // =========================================================================
  const {
    filterOpen,
    setFilterOpen,
    filterValue,
    setFilterValue,
    filteredLands,
    applyFilters,
    resetFilter,
  } = useLandFilters(lands, DEFAULT_FILTER);

  // =========================================================================
  // Access / Cart
  // =========================================================================
  const accessApi = useMapAccess();
  const { addToCart } = useMapCart(navigate);

  // =========================================================================
  // Longdo Map
  // =========================================================================
  const { mapRef, initMap, applySatellite, applyTraffic, applyDolVisibility, zoomIn, zoomOut, locateMe } =
    useLongdoMap({
      isSatellite,
      isTraffic,
      dolEnabled,
      dolOpacity,
    });

  const [mapObj, setMapObj] = useState(null);

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
  }, [mapObj, isSatellite, applySatellite]);

  useEffect(() => {
    if (mapObj) applyTraffic(isTraffic);
  }, [mapObj, isTraffic, applyTraffic]);

  useEffect(() => {
    if (mapObj) applyDolVisibility?.(dolEnabled, dolOpacity);
  }, [mapObj, dolEnabled, dolOpacity, applyDolVisibility]);

  // =========================================================================
  // Drawing
  // =========================================================================
  const { drawMode, startDrawing, finishDrawing, clearDrawing } = useLongdoDrawing(mapObj, currentMode);

  useEffect(() => {
    if (!drawingEnabled) {
      try {
        clearDrawing?.();
      } catch {}
      setCurrentMode("normal");
    }
  }, [drawingEnabled, clearDrawing]);

  // =========================================================================
  // Popup
  // =========================================================================
  const popupApi = useMapPopup({ mapObj, mapRef });

  const { openPopupForWithAccess, onSelectLand } = useLandSelection({
    popupApi,
    accessApi,
  });

  useDragGuard({
    enabledRef: popupApi.popupOpenRef,
    threshold: 6,
  });

  const { rememberPopup, reopenPopup } = useReopenPopup({
    popupApi,
    openPopupForWithAccess,
  });

  const unlockFlow = useUnlockFlow({
    mode,
    accessApi,
    addToCart,
    popupApi,
    rememberPopup,
    reopenPopup,
  });

  useMapEvents({
    mapObj,
    onOverlayOrMarkerSelect: openPopupForWithAccess,
    onMapClickClose: () => popupApi.closePopup(),
    isDrawing: drawMode,
  });

  useEffect(() => {
    popupApi.closePopup();
  }, [mode, showDisclaimer]); // eslint-disable-line react-hooks/exhaustive-deps

  // =========================================================================
  // Search
  // =========================================================================
  const handleSearch = useMapSearch(mapObj);

  // =========================================================================
  // Derived
  // =========================================================================
  const selectedLand = popupApi.selectedLand;
  const { unlockedFields } = useSelectedLandAccess(selectedLand, accessApi.access);

  // =========================================================================
  // Render
  // =========================================================================
  return (
    <div className="map-shell">
      <div id="map" className="map-canvas" />

      {showDisclaimer && <ModeDisclaimerModal onClose={handleAcceptDisclaimer} />}

      {/* Role Picker (mock) */}
      <RolePickerModal
        open={roleOpen}
        onClose={() => setRoleOpen(false)}
        initialRole={role}
        onSave={(r) => updateRole(r)}
      />

      <FilterPanel
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        value={filterValue}
        onChange={setFilterValue}
        onApply={applyFilters}
        onClear={resetFilter}
      />

      {!!mapObj && <LandMarkers map={mapObj} lands={filteredLands} onSelect={onSelectLand} />}

      <MapControls
        pageMode={mode}
        currentRole={role}
        onOpenRolePicker={() => setRoleOpen(true)}
        drawingEnabled={drawingEnabled}
        drawMode={drawMode}
        currentMode={currentMode}
        onSetMode={setCurrentMode}
        onStartDrawing={startDrawing}
        onFinishDrawing={finishDrawing}
        onClearDrawing={clearDrawing}
        onSearch={handleSearch}
        openLayerMenu={openLayerMenu}
        setOpenLayerMenu={setOpenLayerMenu}
        isSatellite={isSatellite}
        setIsSatellite={setIsSatellite}
        isTraffic={isTraffic}
        setIsTraffic={setIsTraffic}
        dolEnabled={dolEnabled}
        setDolEnabled={setDolEnabled}
        dolOpacity={dolOpacity}
        setDolOpacity={setDolOpacity}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onLocate={locateMe}
        onOpenFilter={() => setFilterOpen(true)}
        onOpenChat={() => alert("TODO")}
        onOpenTools={() => alert("TODO")}
      />

      {/* ✅ popup */}
      <MapPopup {...popupApi}>
        <LandDetailPanel
          mode={mode}
          land={selectedLand}
          unlockedFields={unlockedFields}
          onClose={() => popupApi.closePopup()}
          onOpenUnlockPicker={unlockFlow.onOpenUnlockPicker}
          onUnlockAll={unlockFlow.onUnlockAll}
        />
      </MapPopup>

      {/* Unlock Picker */}
      <UnlockPickerModal
        open={accessApi.unlockOpen}
        landId={accessApi.unlockLandId}
        title="ปลดล็อกข้อมูลที่ดินนี้"
        subtitle="ข้อมูลติดต่อ"
        items={accessApi.unlockItems}
        initialSelected={[]}
        onCancel={unlockFlow.onCancelUnlock}
        onAddToCart={unlockFlow.onAddToCartUnlock}
        onConfirm={unlockFlow.onConfirmUnlock}
      />

      {/* Pay Modal */}
      <PayModal
        open={unlockFlow.payOpen}
        draft={unlockFlow.payDraft}
        onClose={unlockFlow.onClosePay}
        onPaid={unlockFlow.onPaid}
      />
    </div>
  );
}

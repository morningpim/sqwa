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

// ✅ เพิ่ม import hook ที่แยกไฟล์
import { useLandFilters } from "./hooks/useLandFilters";

export default function MapPage() {
  // =========================================================================
  // Router
  // =========================================================================
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const mode = params.get("mode") || "buy";

  // =========================================================================
  // UI state: disclaimer / layer / filter
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
  // Data (mock)
  // =========================================================================
  const lands = useMemo(() => mockLands, []);

  // =========================================================================
  // ✅ Filter logic (แยกออกเป็น hook)
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
  // Hooks: access/cart
  // =========================================================================
  const accessApi = useMapAccess();
  const { addToCart } = useMapCart(navigate);

  // =========================================================================
  // Longdo map
  // =========================================================================
  const {
    mapRef,
    initMap,
    applySatellite,
    applyTraffic,
    applyDolVisibility,
    zoomIn,
    zoomOut,
    locateMe,
  } = useLongdoMap({
    isSatellite,
    isTraffic,
    dolEnabled,
    dolOpacity,
  });

  const [mapObj, setMapObj] = useState(null);

  // init map (หลัง accept disclaimer)
  useEffect(() => {
    if (showDisclaimer) {
      setMapObj(null);
      return;
    }

    initMap()
      .then(() => {
        const m = mapRef.current || null;
        setMapObj(m);

        // ensure size
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
  // Popup (map -> UI)
  // =========================================================================
  const popupApi = useMapPopup({ mapObj, mapRef });

  // =========================================================================
  // Helpers: open popup + sync access
  // =========================================================================
  const { openPopupForWithAccess, onSelectLand } = useLandSelection({
    popupApi,
    accessApi,
  });

  // =========================================================================
  // Drag guard
  // =========================================================================
  const { isDraggingRef } = useDragGuard({
    enabledRef: popupApi.popupOpenRef,
    threshold: 6,
  });

  // =========================================================================
  // UX: remember / reopen popup
  // =========================================================================
  const { rememberPopup, reopenPopup } = useReopenPopup({
    popupApi,
    openPopupForWithAccess,
  });

  // =========================================================================
  // Unlock + Pay flow
  // =========================================================================
  const unlockFlow = useUnlockFlow({
    mode,
    accessApi,
    addToCart,
    popupApi,
    rememberPopup,
    reopenPopup,
  });

  // =========================================================================
  // Map events
  // =========================================================================
  useMapEvents({
    mapObj,
    onOverlayOrMarkerSelect: openPopupForWithAccess,
    onMapClickClose: () => {
      if (unlockFlow.payOpenRef.current || unlockFlow.unlockOpenRef.current) return;
      if (isDraggingRef.current) return;

      const dt = Date.now() - (popupApi.lastPopupOpenAtRef.current || 0);
      if (dt < 250) return;

      popupApi.closePopup();
    },
  });

  // ปิด popup เมื่อเปลี่ยน mode หรือกลับไป disclaimer
  useEffect(() => {
    popupApi.closePopup();
  }, [mode, showDisclaimer]); // eslint-disable-line react-hooks/exhaustive-deps

  // =========================================================================
  // Search
  // =========================================================================
  const handleSearch = useMapSearch(mapObj);

  // =========================================================================
  // Derived: selected land + unlocked fields
  // =========================================================================
  const selectedLand = popupApi.selectedLand;
  const { unlockedFields: unlockedForSelected } = useSelectedLandAccess(
    selectedLand,
    accessApi.access
  );

  // =========================================================================
  // Render
  // =========================================================================
  return (
    <div className="map-shell">
      <div id="map" className="map-canvas" />
      {showDisclaimer && <ModeDisclaimerModal onClose={handleAcceptDisclaimer} />}

      <FilterPanel
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        value={filterValue}
        onChange={setFilterValue}
        onApply={applyFilters}
        onClear={resetFilter}
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

      {!!mapObj && (
        <LandMarkers map={mapObj} lands={filteredLands} onSelect={onSelectLand} />
      )}

      <MapControls
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
        onOpenChat={() => alert("TODO: open chat")}
      />

      {/* Popup */}
      <MapPopup
        open={popupApi.popupOpen}
        pos={popupApi.popupPos}
        popupStyle={popupApi.popupStyle}
        arrowStyle={popupApi.arrowStyle}
        popupBoxRef={popupApi.popupBoxRef}
      >
        <LandDetailPanel
          mode={mode}
          land={selectedLand}
          isMember={accessApi.access?.isMember ?? false}
          quotaUsed={accessApi.access?.quotaUsed ?? 0}
          unlockedFields={unlockedForSelected}
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

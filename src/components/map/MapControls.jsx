// src/components/map/MapControls.jsx
import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import LayersPanel from "../Panels/LayersPanel";
import SearchPanel from "../Panels/SearchPanel";
import MapToolsMenu from "./MapToolsMenu";

export default function MapControls({
  openLayerMenu,
  setOpenLayerMenu,

  isSatellite,
  setIsSatellite,
  isTraffic,
  setIsTraffic,

  dolEnabled,
  setDolEnabled,
  dolOpacity,
  setDolOpacity,

  onZoomIn,
  onZoomOut,
  onLocate,

  onOpenFilter,
  onOpenChat,
  onOpenTools,
  onSearch,

  // ✅ role picker
  onOpenRolePicker,
  currentRole,

  // ✅ mode ของหน้า
  pageMode = "buy", // "buy" | "sell" | "eia"

  /* =================== Drawing / EIA =================== */
  drawingEnabled = true,
  drawMode = false,
  currentMode = "normal", // "normal" | "eia"
  onSetMode,
  onStartDrawing,
  onFinishDrawing,
  onClearDrawing,
}) {
  const rootRef = useRef(null);

  // ===== local UI states =====
  const [layersOpen, setLayersOpen] = useState(false);
  const [plan, setPlan] = useState("bkk2556");
  const [baseOpacity, setBaseOpacity] = useState(1);
  const [searchOpen, setSearchOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const { t } = useTranslation("map");

  const layerLabel = useMemo(
    () => (isSatellite ? t("layer.satellite") : t("layer.map")),
    [isSatellite, t]
  );

  // ✅ Drawing visibility rules
  const showDrawing = useMemo(() => {
    const modeOk = pageMode === "buy" || pageMode === "sell" || pageMode === "eia";
    return !!drawingEnabled && modeOk;
  }, [drawingEnabled, pageMode]);

  const showEiaToggle = useMemo(() => pageMode === "eia", [pageMode]);

  // =========================
  // ✅ Core: Close/Open manager
  // =========================
  const closeAll = useCallback(() => {
    setOpenLayerMenu?.(false);
    setSearchOpen(false);
    setToolsOpen(false);
    setLayersOpen(false);
  }, [setOpenLayerMenu]);

  const openOnly = useCallback(
    (name) => {
      closeAll();
      if (name === "layer") setOpenLayerMenu?.(true);
      if (name === "search") setSearchOpen(true);
      if (name === "tools") setToolsOpen(true);
      if (name === "layersPanel") setLayersOpen(true);
    },
    [closeAll, setOpenLayerMenu]
  );

  // ===== close dropdown when click outside =====
  useEffect(() => {
    const onDocClick = (e) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target)) closeAll();
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [closeAll]);

  // =========================
  // ✅ Safe handlers
  // =========================
  const safeToggleDrawMode = useCallback(() => {
    if (!showEiaToggle) return;
    if (!onSetMode) return;
    onSetMode(currentMode === "eia" ? "normal" : "eia");
  }, [showEiaToggle, onSetMode, currentMode]);

  const safeStartDrawing = useCallback(() => {
    if (!showDrawing) return;
    onStartDrawing?.();
    closeAll();
  }, [showDrawing, onStartDrawing, closeAll]);

  const safeFinishDrawing = useCallback(() => {
    if (!showDrawing) return;
    onFinishDrawing?.();
    closeAll();
  }, [showDrawing, onFinishDrawing, closeAll]);

  const safeClearDrawing = useCallback(() => {
    if (!showDrawing) return;
    onClearDrawing?.();
    closeAll();
  }, [showDrawing, onClearDrawing, closeAll]);

  return (
    <div className="map-right-stack" ref={rootRef}>
      {/* ================= Layer dropdown (เล็ก) ================= */}
      <div className="map-layer-menu">
        <button
          className="map-layer-trigger"
          type="button"
          onClick={() => (openLayerMenu ? closeAll() : openOnly("layer"))}
          aria-haspopup="menu"
          aria-expanded={openLayerMenu ? "true" : "false"}
        >
          {layerLabel} ▾
        </button>

        {openLayerMenu && (
          <div className="map-layer-dropdown" role="menu">
            <button
              className={`map-layer-item ${!isSatellite ? "active" : ""}`}
              type="button"
              onClick={() => {
                setIsSatellite?.(false);
                closeAll();
              }}
            >
              {t("layer.map")}
            </button>

            <button
              className={`map-layer-item ${isSatellite ? "active" : ""}`}
              type="button"
              onClick={() => {
                setIsSatellite?.(true);
                closeAll();
              }}
            >
              {t("layer.satellite")}
            </button>

            <button
              className={`map-layer-item ${isTraffic ? "active" : ""}`}
              type="button"
              onClick={() => {
                setIsTraffic?.((v) => !v);
                closeAll();
              }}
            >
              {t("layer.traffic")}
            </button>
          </div>
        )}
      </div>

      {/* ================= Layers Panel (ใหญ่) ================= */}
      <LayersPanel
        open={layersOpen}
        onClose={() => setLayersOpen(false)}
        plan={plan}
        setPlan={setPlan}
        baseOpacity={baseOpacity}
        setBaseOpacity={setBaseOpacity}
        dolEnabled={dolEnabled}
        setDolEnabled={setDolEnabled}
        dolOpacity={dolOpacity}
        setDolOpacity={setDolOpacity}
      />

      {/* ================= FAB buttons ================= */}
      <div className="map-fab-stack">
        {/* ===== Search ===== */}
        <div className={`search-pop-wrap ${searchOpen ? "open" : ""}`}>
          <button
            className="map-fab"
            type="button"
            title={t("common.search")}
            onClick={() => (searchOpen ? closeAll() : openOnly("search"))}
          >
            <span className="material-icon" aria-hidden="true">
              search
            </span>
          </button>

          <SearchPanel
            open={searchOpen}
            onClose={() => setSearchOpen(false)}
            onSearch={(text) => {
              onSearch?.(text);
              closeAll();
            }}
          />
        </div>

        <button
          className="map-fab"
          type="button"
          title={t("layers")}
          onClick={() => openOnly("layersPanel")}
        >
          <span className="material-icon" aria-hidden="true">
            layers
          </span>
        </button>

        <button
          className="map-fab"
          type="button"
          title={t("filter")}
          onClick={() => {
            closeAll();
            onOpenFilter?.();
          }}
        >
          <span className="material-icon" aria-hidden="true">
            filter_alt
          </span>
        </button>

        <button
          className="map-fab"
          type="button"
          title={t("chat.open")}
          onClick={() => {
            closeAll();
            onOpenChat?.();
          }}
        >
          <span className="material-icon" aria-hidden="true">
            chat
          </span>
        </button>

        {/* ===== Tools ===== */}
        <div className="tools-pop-wrap">
          <button
            className="map-fab"
            type="button"
            title={t("tools")}
            onClick={() => (toolsOpen ? closeAll() : openOnly("tools"))}
          >
            <span className="material-icon" aria-hidden="true">
              build
            </span>
          </button>

          <MapToolsMenu
            open={toolsOpen}
            onClose={() => setToolsOpen(false)}
            onOpenTools={() => {
              closeAll();
              onOpenTools?.();
            }}
            showDrawing={showDrawing}
            showEiaToggle={showEiaToggle}
            currentMode={currentMode}
            drawMode={drawMode}
            onToggleDrawMode={() => {
              safeToggleDrawMode();
              closeAll();
            }}
            onStartDrawing={safeStartDrawing}
            onFinishDrawing={safeFinishDrawing}
            onClearDrawing={safeClearDrawing}
            currentRole={currentRole}
            onOpenRolePicker={() => {
              closeAll();
              onOpenRolePicker?.();
            }}
          />
        </div>
      </div>

      {/* ================= Zoom controls ================= */}
      <div className="map-zoom-box">
        <button
          className="map-zoom-btn"
          type="button"
          title={t("zoomIn")}
          onClick={onZoomIn}
        >
          <span className="material-icon" aria-hidden="true">
            add
          </span>
        </button>

        <button
          className="map-zoom-btn"
          type="button"
          title={t("zoomOut")}
          onClick={onZoomOut}
        >
          <span className="material-icon" aria-hidden="true">
            remove
          </span>
        </button>
      </div>


      {/* ================= Locate ================= */}
      <div className="map-locate-row">
        <button className="map-target-btn" 
          type="button" 
          title={t("locate")} 
          onClick={onLocate}>
          <span className="material-icon" aria-hidden="true">
            my_location
          </span>
        </button>
      </div>
    </div>
  );
}

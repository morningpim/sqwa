// src/components/map/MapControls.jsx
import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import LayersPanel from "../Panels/LayersPanel";
import SearchPanel from "../Panels/SearchPanel";
import MapToolsMenu from "./MapToolsMenu";

export default function MapControls({
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

  onOpenRolePicker,
  currentRole,

  pageMode = "buy",

  drawingEnabled = true,
  drawMode = false,
  currentMode = "normal",
  onSetMode,
  onStartDrawing,
  onFinishDrawing,
  onClearDrawing,
}) {
  const rootRef = useRef(null);

  /* ================= STATE ================= */
  const [activePanel, setActivePanel] = useState(null);
  const { t } = useTranslation("map");

  const searchOpen = activePanel === "search";
  const toolsOpen = activePanel === "tools";
  const layersOpen = activePanel === "layers";
  const layerMenuOpen = activePanel === "layer";

  /* ================= HELPERS ================= */
  const openPanel = useCallback((name) => {
    setActivePanel((prev) => (prev === name ? null : name));
  }, []);

  const closeAll = useCallback(() => {
    setActivePanel(null);
  }, []);

  /* ================= CLOSE ON OUTSIDE CLICK ================= */
  useEffect(() => {
    const onDocClick = (e) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target)) closeAll();
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [closeAll]);

  /* ================= LABEL ================= */
  const layerLabel = useMemo(
    () => (isSatellite ? t("layer.satellite") : t("layer.map")),
    [isSatellite, t]
  );

  /* ================= DRAWING ================= */
  const showDrawing = useMemo(() => {
    return drawingEnabled && ["buy", "sell", "eia"].includes(pageMode);
  }, [drawingEnabled, pageMode]);

  const showEiaToggle = pageMode === "eia";

  const safeToggleDrawMode = () => {
    if (!showEiaToggle || !onSetMode) return;
    onSetMode(currentMode === "eia" ? "normal" : "eia");
  };

  const safeStartDrawing = () => {
    if (!showDrawing) return;
    onStartDrawing?.();
    closeAll();
  };

  const safeFinishDrawing = () => {
    if (!showDrawing) return;
    onFinishDrawing?.();
    closeAll();
  };

  const safeClearDrawing = () => {
    if (!showDrawing) return;
    onClearDrawing?.();
    closeAll();
  };

  /* ============================================================ */

  return (
    <div className="map-right-stack" ref={rootRef}>
      {/* ================= Layer dropdown ================= */}
      <div className="map-layer-menu">
        <button
          className="map-layer-trigger"
          onClick={() => openPanel("layer")}
        >
          {layerLabel} ▾
        </button>

        {layerMenuOpen && (
          <div className="map-layer-dropdown">
            <button
              className={`map-layer-item ${!isSatellite ? "active" : ""}`}
              onClick={() => {
                setIsSatellite(false);
                closeAll();
              }}
            >
              {t("layer.map")}
            </button>

            <button
              className={`map-layer-item ${isSatellite ? "active" : ""}`}
              onClick={() => {
                setIsSatellite(true);
                closeAll();
              }}
            >
              {t("layer.satellite")}
            </button>

            <button
              className={`map-layer-item ${isTraffic ? "active" : ""}`}
              onClick={() => {
                setIsTraffic((v) => !v);
                closeAll();
              }}
            >
              {t("layer.traffic")}
            </button>
          </div>
        )}
      </div>

      {/* ================= Layers Panel ================= */}
      <LayersPanel
        open={layersOpen}
        onClose={closeAll}
        dolEnabled={dolEnabled}
        setDolEnabled={setDolEnabled}
        dolOpacity={dolOpacity}
        setDolOpacity={setDolOpacity}
      />

      {/* ================= FAB ================= */}
      <div className="map-fab-stack">
        {/* SEARCH */}
        <div className={`search-pop-wrap ${searchOpen ? "open" : ""}`}>
          <button className="map-fab" onClick={() => openPanel("search")}>
            <span className="material-symbols-outlined">search</span>
          </button>

          <SearchPanel
            open={searchOpen}
            onClose={closeAll}
            onSearch={(txt) => {
              onSearch?.(txt);
              closeAll();
            }}
          />
        </div>

        {/* LAYERS */}
        <button className="map-fab" onClick={() => openPanel("layers")}>
          <span className="material-symbols-outlined">layers</span>
        </button>

        {/* FILTER */}
        <button
          className="map-fab"
          onClick={() => {
            closeAll();
            onOpenFilter?.();
          }}
        >
          <span className="material-symbols-outlined">filter_alt</span>
        </button>

        {/* CHAT */}
        <button
          className="map-fab"
          onClick={() => {
            closeAll();
            onOpenChat?.();
          }}
        >
          <span className="material-symbols-outlined">chat</span>
        </button>

        {/* TOOLS */}
        <div className="tools-pop-wrap">
          <button className="map-fab" onClick={() => openPanel("tools")}>
            <span className="material-symbols-outlined">build</span>
          </button>

          <MapToolsMenu
            open={toolsOpen}
            onClose={closeAll}
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

      {/* ================= ZOOM ================= */}
      <div className="map-zoom-box">
        <button className="map-zoom-btn" onClick={onZoomIn}>
          <span className="material-symbols-outlined">add</span>
        </button>

        <button className="map-zoom-btn" onClick={onZoomOut}>
          <span className="material-symbols-outlined">remove</span>
        </button>
      </div>

      {/* ================= LOCATE ================= */}
      <div className="map-locate-row">
        <button className="map-target-btn" onClick={onLocate}>
          <span className="material-symbols-outlined">my_location</span>
        </button>
      </div>
    </div>
  );
}

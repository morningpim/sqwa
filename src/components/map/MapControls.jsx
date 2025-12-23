import React, { useEffect, useRef, useState } from "react";
import LayersPanel from "../Panels/LayersPanel";
import SearchPanel from "../Panels/SearchPanel";

export default function MapControls({
  openLayerMenu,
  setOpenLayerMenu,

  isSatellite,
  setIsSatellite,
  isTraffic,
  setIsTraffic,

  onZoomIn,
  onZoomOut,
  onLocate,

  onOpenFilter,
  onOpenChat,
  onOpenTools,
  onSearch,
}) {
  const rootRef = useRef(null);

  // ===== Layers panel state =====
  const [layersOpen, setLayersOpen] = useState(false);
  const [plan, setPlan] = useState("bkk2556");
  const [baseOpacity, setBaseOpacity] = useState(1);
  const [redRoadEnabled, setRedRoadEnabled] = useState(true);
  const [redRoadOpacity, setRedRoadOpacity] = useState(0.45);
  const [searchOpen, setSearchOpen] = useState(false);

  // ===== close dropdown when click outside =====
  useEffect(() => {
    const onDocClick = (e) => {
      if (!openLayerMenu) return;
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target)) {
        setOpenLayerMenu(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [openLayerMenu, setOpenLayerMenu]);

  const layerLabel = isSatellite ? "ดาวเทียม" : "แผนที่";

  return (
    <div className="map-right-stack" ref={rootRef}>
      <div className="map-layer-menu">
        <button
          className="map-layer-trigger"
          type="button"
          onClick={() => setOpenLayerMenu((v) => !v)}
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
                setIsSatellite(false);
                setOpenLayerMenu(false);
              }}
            >
              แผนที่
            </button>

            <button
              className={`map-layer-item ${isSatellite ? "active" : ""}`}
              type="button"
              onClick={() => {
                setIsSatellite(true);
                setOpenLayerMenu(false);
              }}
            >
              ดาวเทียม
            </button>

            <button
              className={`map-layer-item ${isTraffic ? "active" : ""}`}
              type="button"
              onClick={() => {
                setIsTraffic((v) => !v);
                setOpenLayerMenu(false);
              }}
            >
              จราจร
            </button>
          </div>
        )}
      </div>

      {/* ===== Layers Panel ===== */}
      <LayersPanel
        open={layersOpen}
        onClose={() => setLayersOpen(false)}
        plan={plan}
        setPlan={setPlan}
        baseOpacity={baseOpacity}
        setBaseOpacity={setBaseOpacity}
        redRoadEnabled={redRoadEnabled}
        setRedRoadEnabled={setRedRoadEnabled}
        redRoadOpacity={redRoadOpacity}
        setRedRoadOpacity={setRedRoadOpacity}
      />

      {/* ===== FAB buttons ===== */}
      
      <div className="map-fab-stack">
          <div className={`search-pop-wrap ${searchOpen ? "open" : ""}`}>
            <button
              className="map-fab"
              type="button"
              title="Search"
              onClick={() => setSearchOpen((v) => !v)}
            >
              <span className="material-icon" aria-hidden="true">search</span>
            </button>

            <SearchPanel
              open={searchOpen}
              onClose={() => setSearchOpen(false)}
              onSearch={(text) => {
                onSearch?.(text);
                setSearchOpen(false);
              }}
            />
          </div>

        <button
          className="map-fab"
          type="button"
          title="Layers"
          onClick={() => {
            setLayersOpen(true);
            setOpenLayerMenu(false);
          }}
        >
          <span className="material-icon" aria-hidden="true">
            layers
          </span>
        </button>

        <button
          className="map-fab"
          type="button"
          title="Filter"
          onClick={() => {
            onOpenFilter?.();
            setOpenLayerMenu(false);
          }}
        >
          <span className="material-icon" aria-hidden="true">
            filter_alt
          </span>
        </button>

        <button
          className="map-fab"
          type="button"
          title="Chat"
          onClick={onOpenChat}
        >
          <span className="material-icon" aria-hidden="true">
            chat
          </span>
        </button>

        <button
          className="map-fab"
          type="button"
          title="Tools"
          onClick={onOpenTools}
        >
          <span className="material-icon" aria-hidden="true">
            build
          </span>
        </button>
      </div>

      {/* ===== Zoom controls ===== */}
      <div className="map-zoom-box">
        <button
          className="map-zoom-btn"
          type="button"
          title="Zoom in"
          onClick={onZoomIn}
        >
          <span className="material-icon" aria-hidden="true">
            add
          </span>
        </button>

        <button
          className="map-zoom-btn"
          type="button"
          title="Zoom out"
          onClick={onZoomOut}
        >
          <span className="material-icon" aria-hidden="true">
            remove
          </span>
        </button>
      </div>

      {/* ===== Locate ===== */}
      <div className="map-locate-row">
        <button
          className="map-target-btn"
          type="button"
          title="Locate"
          onClick={onLocate}
        >
          <span className="material-icon" aria-hidden="true">
            my_location
          </span>
        </button>
      </div>
    </div>
  );
}

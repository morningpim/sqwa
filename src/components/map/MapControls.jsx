// src/components/map/MapControls.jsx
import React, { useEffect, useRef } from "react";

/**
 * MapControls
 * - แถบเครื่องมือด้านขวา (dropdown layer + fab + zoom + my location)
 * - MapPage เป็นคนถือ state/logic จริง (longdo mapRef) แล้วส่ง props ลงมา
 */
export default function MapControls({
  // layer menu state
  openLayerMenu,
  setOpenLayerMenu,

  // layer toggles
  isSatellite,
  setIsSatellite,
  isTraffic,
  setIsTraffic,

  // actions
  onZoomIn,
  onZoomOut,
  onLocate,

  // fab actions (ทำเป็น placeholder / เปิด panel)
  onOpenLayers,
  onOpenFilter,
  onOpenChat,
  onOpenTools,
}) {
  const rootRef = useRef(null);

  // ปิด dropdown เมื่อคลิกนอกกล่อง
  useEffect(() => {
    const onDocClick = (e) => {
      if (!openLayerMenu) return;
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target)) setOpenLayerMenu(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [openLayerMenu, setOpenLayerMenu]);

  // label บนปุ่ม dropdown
  const layerLabel = isSatellite ? "ดาวเทียม" : "แผนที่";

  return (
    <div className="map-right-stack" ref={rootRef}>
      {/* Dropdown เลือกชั้นแผนที่ */}
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
              role="menuitem"
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
              role="menuitem"
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
              role="menuitem"
            >
              จราจร
            </button>
          </div>
        )}
      </div>

      {/* ปุ่มวงกลม (fab stack) */}
      <div className="map-fab-stack">
        <button
          className="map-fab"
          type="button"
          title="Layers"
          onClick={onOpenLayers}
        >
          🗺️
        </button>
        <button
          className="map-fab"
          type="button"
          title="Filter"
          onClick={onOpenFilter}
        >
          🔻
        </button>
        <button className="map-fab" type="button" title="Chat" onClick={onOpenChat}>
          💬
        </button>
        <button
          className="map-fab"
          type="button"
          title="Tools"
          onClick={onOpenTools}
        >
          🛠️
        </button>
      </div>

      {/* Zoom box */}
      <div className="map-zoom-box">
        <button className="map-zoom-btn" type="button" onClick={onZoomIn} title="Zoom in">
          ＋
        </button>
        <button className="map-zoom-btn" type="button" onClick={onZoomOut} title="Zoom out">
          －
        </button>
      </div>

      {/* My location */}
      <div className="map-locate-row">
        <button className="map-my-location" type="button" onClick={onLocate}>
          MY location
        </button>
        <button className="map-target-btn" type="button" onClick={onLocate} title="Locate">
          ⌖
        </button>
      </div>
    </div>
  );
}

// src/components/map/MapToolsMenu.jsx
import React from "react";
import "../../css/MapToolsMenu.css";

export default function MapToolsMenu({
  open,
  onClose,

  onOpenTools,

  showDrawing,
  drawMode,

  // EIA toggle (optional)
  showEiaToggle,
  currentMode,
  onToggleDrawMode,

  onStartDrawing,
  onFinishDrawing,
  onClearDrawing,

  // role picker (optional)
  currentRole,
  onOpenRolePicker,
}) {
  if (!open) return null;

  return (
    <div className="mtm-pop">
      <div className="mtm-drawCard">
        <div className="mtm-drawHeader">
          <div className="mtm-title">
            <span className="mtm-titleText">draw</span>
          </div>

          <button className="mtm-x" onClick={onClose} aria-label="close">
            ✕
          </button>
        </div>

        {/* (optional) EIA toggle */}
        {showEiaToggle && (
          <button
            className={`mtm-chip ${currentMode === "eia" ? "is-eia" : ""}`}
            type="button"
            onClick={() => onToggleDrawMode?.()}
            style={{ marginBottom: 8 }}
          >
            <span className="material-icon" aria-hidden="true">
              swap_horiz
            </span>
            {currentMode === "eia" ? "EIA" : "Normal"}
          </button>
        )}

        {showDrawing && (
          <div className="mtm-actionsCol">
            <button
              className="mtm-btn mtm-btn--soft"
              onClick={() => {
                onStartDrawing?.();
                onClose?.();
              }}
            >
              ▶ start
            </button>

            <button
              className="mtm-btn mtm-btn--green"
              disabled={!drawMode}
              onClick={() => {
                if (!drawMode) return;
                onFinishDrawing?.();
                onClose?.();
              }}
            >
              ✔ Finish
            </button>

            <button
              className="mtm-btn mtm-btn--red"
              onClick={() => {
                onClearDrawing?.();
                onClose?.();
              }}
            >
              🧍 Clear
            </button>
          </div>
        )}
      </div>

      {/* (optional) list ใต้การ์ด */}
      <div className="mtm-list">
        <button className="mtm-item" type="button" onClick={() => onOpenTools?.()}>
          <span className="material-icon" aria-hidden="true">
            build
          </span>
          <span className="mtm-itemText">Tools</span>
        </button>

        <button className="mtm-item" type="button" onClick={() => onOpenRolePicker?.()}>
          <span className="material-icon" aria-hidden="true">
            badge
          </span>
          <span className="mtm-itemText">Role</span>
          {currentRole ? <span className="mtm-badge">{currentRole}</span> : null}
        </button>
      </div>
    </div>
  );
}

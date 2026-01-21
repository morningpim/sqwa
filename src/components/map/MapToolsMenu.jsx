// src/components/map/MapToolsMenu.jsx
import React from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation("map");
  const { t: tCommon } = useTranslation("common");
  const { t: tRole } = useTranslation("rolePicker"); // ถ้า role.change อยู่ที่นี่


  return (
    <div className="mtm-pop">
      <div className="mtm-drawCard">
        <div className="mtm-drawHeader">
          <div className="mtm-title">
            <span className="mtm-titleText">{t("draw")}</span>
          </div>

          <button className="mtm-x" onClick={onClose} aria-label={tCommon("close")}>
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
            {currentMode === "eia"
              ? t("eiaMode")
              : t("normalMode")}
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
              ▶ {t("drawStart")}
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
              ✔ {t("drawFinish")}
            </button>

            <button
              className="mtm-btn mtm-btn--red"
              onClick={() => {
                onClearDrawing?.();
                onClose?.();
              }}
            >
              🧍 {t("drawClear")}
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
          <span className="mtm-itemText">{t("tools")}</span>
        </button>

        <button className="mtm-item" type="button" onClick={() => onOpenRolePicker?.()}>
          <span className="material-icon" aria-hidden="true">
            badge
          </span>
          <span className="mtm-itemText">{tRole("change")}</span>
          {currentRole ? <span className="mtm-badge">{currentRole}</span> : null}
        </button>
      </div>
    </div>
  );
}

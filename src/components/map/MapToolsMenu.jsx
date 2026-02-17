import React from "react";
import { useTranslation } from "react-i18next";
import "../../css/MapToolsMenu.css";

export default function MapToolsMenu({
  open,
  onClose,
  onOpenTools,
  showDrawing,
  drawMode,
  showEiaToggle,
  currentMode,
  onToggleDrawMode,
  onStartDrawing,
  onFinishDrawing,
  onClearDrawing,
}) {
  if (!open) return null;

  const { t } = useTranslation("map");
  const { t: tCommon } = useTranslation("common");

  return (
    <div className="mtm-pop">
      <div className="mtm-drawCard">

        <div className="mtm-drawHeader">
          <div className="mtm-title">
            <span className="mtm-titleText">{t("draw")}</span>
          </div>

          <button className="mtm-x" onClick={onClose}>
            ✕
          </button>
        </div>

        {showEiaToggle && (
          <button
            className={`mtm-chip ${currentMode === "eia" ? "is-eia" : ""}`}
            onClick={() => onToggleDrawMode?.()}
          >
            <span className="material-icon">swap_horiz</span>
            {currentMode === "eia" ? t("eiaMode") : t("normalMode")}
          </button>
        )}

        {showDrawing && (
          <div className="mtm-actionsCol">

            <button
              className="mtm-btn mtm-btn--soft"
              onClick={()=>{
                onStartDrawing?.();
                onClose?.();
              }}
            >
              ▶ {t("drawStart")}
            </button>

            <button
              className="mtm-btn mtm-btn--green"
              disabled={!drawMode}
              onClick={()=>{
                if(!drawMode) return;
                onFinishDrawing?.();
                onClose?.();
              }}
            >
              ✔ {t("drawFinish")}
            </button>

            <button
              className="mtm-btn mtm-btn--red"
              onClick={()=>{
                onClearDrawing?.();
                onClose?.();
              }}
            >
              🧍 {t("drawClear")}
            </button>

          </div>
        )}
      </div>

      <div className="mtm-list">
        <button className="mtm-item" onClick={()=>onOpenTools?.()}>
          <span className="material-icon">build</span>
          <span className="mtm-itemText">{t("tools")}</span>
        </button>
      </div>
    </div>
  );
}

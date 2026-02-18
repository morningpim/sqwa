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
  const { t } = useTranslation("map");

  if (!open) return null;

  const safe = fn => () => {
    fn?.();
    onClose?.();
  };

  return (
    <div className="mtm-pop" role="dialog">

      <div className="mtm-drawCard">

        {/* header */}
        <div className="mtm-drawHeader">
          <span className="mtm-titleText">{t("draw")}</span>

          <button className="mtm-x" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* toggle mode */}
        {showEiaToggle && (
          <button
            className={`mtm-chip ${currentMode === "eia" ? "is-eia" : ""}`}
            onClick={onToggleDrawMode}
          >
            <span className="material-symbols-outlined">swap_horiz</span>
            {currentMode === "eia" ? t("eiaMode") : t("normalMode")}
          </button>
        )}

        {/* drawing actions */}
        {showDrawing && (
          <div className="mtm-actionsCol">

            <button
              className="mtm-btn mtm-btn--soft"
              onClick={safe(onStartDrawing)}
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
              onClick={safe(onClearDrawing)}
            >
              🧍 {t("drawClear")}
            </button>

          </div>
        )}
      </div>

      {/* footer */}
      <div className="mtm-list">
        <button
          className="mtm-item"
          onClick={safe(onOpenTools)}
        >
          <span className="material-symbols-outlined">build</span>
          <span className="mtm-itemText">{t("tools")}</span>
        </button>
      </div>
    </div>
  );
}

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
  currentRole,
  pageMode,
}) {
  const { t } = useTranslation("map");
  const rootRef = React.useRef(null);
  const finishingRef = React.useRef(false);
  const DRAWABLE_MODES = ["buy","sell","eia"];
  const canDraw = currentRole === "admin" && showDrawing;

  /* ---------- safe wrapper ---------- */
  const safe = React.useCallback(
    fn => () => {
      fn?.();
      onClose?.();
    },
    [onClose]
  );

  /* ---------- ESC close ---------- */
  React.useEffect(() => {
    if (!open) return;

    const handler = e => {
      if (e.key === "Escape") onClose?.();
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  React.useEffect(() => {
    if (!drawMode) {
      finishingRef.current = false;
    }
  }, [drawMode]);

  /* ---------- click outside close ---------- */
  React.useEffect(() => {
    if (!open) return;

    const handleClick = e => {
      if (rootRef.current && !rootRef.current.contains(e.target))
        onClose?.();
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open, onClose]);

  /* ---------- finish handler ---------- */
  const handleFinish = () => {
    if (!drawMode || finishingRef.current) return;
    finishingRef.current = true;
    onFinishDrawing?.();
    onClose?.();
  };

  const handleStart = React.useCallback(() => {
    if (!canDraw) return;
    onStartDrawing?.();
    onClose?.();
  }, [canDraw, onStartDrawing, onClose]);

  /* ❗ condition ต้องอยู่ตรงนี้ */
  if (!open) return null;

  return (
    <div
      ref={rootRef}
      className="mtm-pop"
      role="dialog"
      aria-modal="true"
      aria-label="Map tools menu"
    >
      <div className="mtm-drawCard">
        <div className="mtm-drawHeader">
          <span className="mtm-titleText">{t("draw")}</span>

          <button type="button" className="mtm-x" onClick={onClose}>
            ✕
          </button>
        </div>

        {showEiaToggle && (
          <button
            type="button"
            className={`mtm-chip ${currentMode === "eia" ? "is-eia" : ""}`}
            onClick={onToggleDrawMode}
          >
            <span className="material-symbols-outlined">swap_horiz</span>
            {currentMode === "eia" ? t("eiaMode") : t("normalMode")}
          </button>
        )}

        {showDrawing && (
          <div className="mtm-actionsCol">
            <button
            type="button"
            className="mtm-btn mtm-btn--soft"
            disabled={!canDraw}
            onClick={handleStart}
            >
              ▶ {t("drawStart")}
            </button>

            <button
            type="button"
            className="mtm-btn mtm-btn--green"
            disabled={!drawMode || !canDraw}
            onClick={handleFinish}
            >
              ✔ {t("drawFinish")}
            </button>

            <button
            type="button"
            className="mtm-btn mtm-btn--red"
            disabled={!canDraw}
            onClick={canDraw ? safe(onClearDrawing) : undefined}
            >
              🧍 {t("drawClear")}
            </button>
          </div>
        )}
      </div>

      <div className="mtm-list">
        <button
          type="button"
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
import React from "react";
import { useTranslation } from "react-i18next";
import "../../css/LayersPanel.css";

export default function LayersPanel({
  open,
  onClose,
  plan,
  setPlan,
  baseOpacity,
  setBaseOpacity,
  dolEnabled,
  setDolEnabled,
  dolOpacity,
  setDolOpacity,
}) {
  const { t } = useTranslation("common");

  if (!open) return null;

  const plans = [
    { key: "bkk2556", label: t("layers.plans.bkk2556") },
    { key: "bkk2570", label: t("layers.plans.bkk2570") },
    { key: "sub", label: t("layers.plans.sub") },
  ];

  return (
    <div
      className="layers-panel"
      role="dialog"
      aria-label={t("layers.title")}
    >
      {/* ===== Base / Plan ===== */}
      <div className="layers-card">
        <div className="layers-header">
          <div className="layers-title">{t("layers.title")}</div>

          <button
            className="layers-close"
            type="button"
            onClick={onClose}
            aria-label={t("close")}
          >
            ×
          </button>
        </div>

        <div className="layers-tabs">
          {plans.map((p) => (
            <button
              key={p.key}
              type="button"
              className={`layers-tab ${plan === p.key ? "active" : ""}`}
              onClick={() => setPlan(p.key)}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="layers-row">
          <div className="layers-label">{t("layers.opacity")}</div>

          <input
            className="layers-range"
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={baseOpacity}
            onChange={(e) => setBaseOpacity(parseFloat(e.target.value))}
          />

          <div className="layers-value">
            {Number(baseOpacity).toFixed(2)}
          </div>
        </div>
      </div>

      {/* ===== DOL Layer ===== */}
      <div className="layers-card">
        <div className="layers-row layers-row-top">
          <label className="layers-check">
            <input
              type="checkbox"
              checked={dolEnabled}
              onChange={(e) => setDolEnabled(e.target.checked)}
            />
            <span className="layers-checkmark" />
            <span className="layers-checktext">
              {t("layers.dol_label")}
            </span>
          </label>
        </div>

        <div className="layers-row">
          <div className="layers-label">{t("layers.opacity")}</div>

          <input
            className="layers-range"
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={dolOpacity}
            disabled={!dolEnabled}
            onChange={(e) => setDolOpacity(parseFloat(e.target.value))}
          />

          <div className="layers-value">
            {Number(dolOpacity).toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  );
}

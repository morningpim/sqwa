// src/components/map/eia/EiaDetailPanel.jsx
import React from "react";
import { useTranslation } from "react-i18next";
import "./eia-popup.css";

export default function EiaDetailPanel({ data, onClose }) {
  // ✅ bind eia namespace
  const { t } = useTranslation("eia");
  const { t: tCommon } = useTranslation("common");

  if (!data?.item) return null;

  const eia = data.item.raw ?? data.item;

  const statusKey = eia.status ? "approved" : "unknown";

  return (
    <div className="eia-card" role="dialog" aria-modal="true">
      {/* Header */}
      <div className="eia-head">
        <div className="eia-title">
          <span className="eia-badge">{t("badge")}</span>
          <span className="eia-name">
            {eia.name || t("projectFallback")}
          </span>
        </div>

        <button
          className="eia-close"
          onClick={onClose}
          type="button"
          aria-label={tCommon("close")}
        >
          ×
        </button>
      </div>

      {/* Images */}
      {(eia.images?.length ?? 0) > 0 && (
        <div className="eia-images">
          {eia.images.slice(0, 3).map((src, i) => (
            <img
              key={i}
              src={src}
              alt={`${t("badge")} ${i + 1}`}
            />
          ))}
        </div>
      )}

      {/* Project Value */}
      <div className="eia-row">
        <span>{t("field.projectValue")}</span>
        <b>
          {eia.projectValue ?? "-"} {t("unit.millionBaht")}
        </b>
      </div>

      {/* Area & Status */}
      <div className="eia-area">
        <div className="eia-area-box main">
          <div className="k">{t("field.area")}</div>
          <div className="v">{eia.areaRnw ?? "-"}</div>
        </div>

        <div className="eia-area-box">
          <div className="k">{t("field.status")}</div>
          <div className={`v ${statusKey}`}>
            {t(`status.${statusKey}`)}
          </div>
        </div>
      </div>

      {/* Meta */}
      <div className="eia-meta">
        <div>
          <span>{t("field.owner")}</span>
          <b>{eia.owner || "-"}</b>
        </div>

        <div>
          <span>{t("field.location")}</span>
          <b>
            {eia.location?.lat ?? "-"}, {eia.location?.lon ?? "-"}
          </b>
        </div>
      </div>

      {/* Actions */}
      <div className="eia-actions">
        <button className="btn ghost" type="button">
          {t("action.news")}
        </button>

        <button className="btn primary" type="button">
          {t("action.detail")}
        </button>
      </div>
    </div>
  );
}

// src/components/map/SellModePickerModal.jsx
import React from "react";
import { useTranslation } from "react-i18next";
import "../../css/SellModePickerModal.css";

export default function SellModePickerModal({ open, onClose, onPick }) {
  const { t } = useTranslation("sell");
  const { t: tCommon } = useTranslation("common");
  if (!open) return null;

  return (
    <div className="smp-backdrop" role="dialog" aria-modal="true">
      <div className="smp-card">
        <div className="smp-title">{t("pick.title")}</div>
        <div className="smp-sub">{t("pick.subtitle")}</div>

        <div className="smp-grid">
          <button
            className="smp-option"
            type="button"
            onClick={() => onPick?.("seller")}
          >
            <div className="smp-icon">💰</div>
            <div className="smp-label">{t("pick.seller")}</div>
          </button>

          <button
            className="smp-option"
            type="button"
            onClick={() => onPick?.("investor")}
          >
            <div className="smp-icon">🧑‍💼</div>
            <div className="smp-label">{t("pick.investor")}</div>
          </button>
        </div>

        <div className="smp-actions">
          <button className="smp-cancel" type="button" onClick={onClose}>
            {tCommon("close")}
          </button>
        </div>
      </div>
    </div>
  );
}

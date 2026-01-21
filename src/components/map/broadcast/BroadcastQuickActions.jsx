import React from "react";
import { useTranslation } from "react-i18next";
import "./broadcast.css";

export default function BroadcastQuickActions({
  land,
  role,
  mode,
  sellIntent,
  onAdminClick,
  onConsignorClick,
}) {
  if (!land?.id) return null;

  // ✅ bind broadcast namespace
  const { t } = useTranslation("broadcast");

  const canAdmin = role === "admin";
  const isConsignment = mode === "sell" && sellIntent === "seller";

  return (
    <div className="bc-quick">
      {canAdmin && (
        <button
          className="bc-quick-btn"
          type="button"
          onClick={onAdminClick}
          title={t("quick.adminTitle")}
        >
          📣 {t("quick.adminLabel")}
        </button>
      )}

      {isConsignment && !canAdmin && (
        <button
          className="bc-quick-btn hot"
          type="button"
          onClick={onConsignorClick}
          title={t("quick.consignorTitle")}
        >
          🔥 {t("quick.consignorLabel")}
        </button>
      )}
    </div>
  );
}

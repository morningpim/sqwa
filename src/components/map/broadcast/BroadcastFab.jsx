import React from "react";
import { useTranslation } from "react-i18next";
import "./broadcast.css";

export default function BroadcastFab({ onClick }) {
  // ✅ bind broadcast namespace
  const { t } = useTranslation("broadcast");

  return (
    <button 
      className="bc-fab" 
      type="button" 
      onClick={onClick}
      aria-label={t("title")}
    >
      📣
      <span className="bc-fab-text">{t("fabLabel")}</span>
    </button>
  );
}

// src/components/map/eia/EiaDashboardStats.jsx
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import "./eia-dashboard.css";

function normalizeStatus(raw) {
  if (!raw) return "unknown";
  if (raw === "ผ่าน EIA" || raw === "approved") return "approved";
  if (raw === "รอพิจารณา" || raw === "pending") return "pending";
  return "unknown";
}

export default function EiaDashboardStats({ eias = [] }) {
  // ✅ bind eia namespace
  const { t } = useTranslation("eia");

  const stats = useMemo(() => {
    const list = Array.isArray(eias) ? eias : [];

    let approved = 0;
    let pending = 0;

    list.forEach((e) => {
      const status = normalizeStatus(e?.raw?.status || e?.status);
      if (status === "approved") approved += 1;
      if (status === "pending") pending += 1;
    });

    return {
      total: list.length,
      approved,
      pending,
    };
  }, [eias]);

  if (!stats.total) return null;

  return (
    <div className="eia-dashboard">
      <div className="eia-stat">
        <div className="v">{stats.total}</div>
        <div className="k">{t("dashboard.total")}</div>
      </div>

      <div className="eia-stat success">
        <div className="v">{stats.approved}</div>
        <div className="k">{t("dashboard.approved")}</div>
      </div>

      <div className="eia-stat warn">
        <div className="v">{stats.pending}</div>
        <div className="k">{t("dashboard.pending")}</div>
      </div>
    </div>
  );
}

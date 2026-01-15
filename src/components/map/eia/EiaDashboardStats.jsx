// src/components/map/eia/EiaDashboardStats.jsx
import React, { useMemo } from "react";
import "./eia-dashboard.css";

export default function EiaDashboardStats({ eias = [] }) {
  const stats = useMemo(() => {
    const total = eias.length;

    const approved = eias.filter(
      (e) => e.raw?.status === "ผ่าน EIA"
    ).length;

    const pending = eias.filter(
      (e) => e.raw?.status === "รอพิจารณา"
    ).length;

    return { total, approved, pending };
  }, [eias]);

  if (!eias.length) return null;

  return (
    <div className="eia-dashboard">
      <div className="eia-stat">
        <div className="v">{stats.total}</div>
        <div className="k">โครงการทั้งหมด</div>
      </div>

      <div className="eia-stat success">
        <div className="v">{stats.approved}</div>
        <div className="k">ผ่าน EIA</div>
      </div>

      <div className="eia-stat warn">
        <div className="v">{stats.pending}</div>
        <div className="k">รอพิจารณา</div>
      </div>
    </div>
  );
}

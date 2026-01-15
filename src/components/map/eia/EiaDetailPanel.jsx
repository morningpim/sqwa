// src/components/map/eia/EiaDetailPanel.jsx
import React from "react";
import "./eia-popup.css";

export default function EiaDetailPanel({ data, onClose }) {
  if (!data?.item) return null;

  const eia = data.item.raw ?? data.item;

  return (
    <div className="eia-card">
      {/* Header */}
      <div className="eia-head">
        <div className="eia-title">
          <span className="eia-badge">EIA</span>
          <span className="eia-name">{eia.name || "EIA Project"}</span>
        </div>

        <button className="eia-close" onClick={onClose}>×</button>
      </div>

      {/* Images */}
      <div className="eia-images">
        {(eia.images || []).slice(0, 3).map((src, i) => (
          <img key={i} src={src} alt={`eia-${i}`} />
        ))}
      </div>

      {/* Project Value */}
      <div className="eia-row">
        <span>Project Value</span>
        <b>{eia.projectValue ?? "N/A"} ล้านบาท</b>
      </div>

      {/* Area */}
      <div className="eia-area">
        <div className="eia-area-box main">
          <div className="k">ขนาดที่ดิน</div>
          <div className="v">{eia.areaRnw ?? "N/A"}</div>
        </div>

        <div className="eia-area-box">
          <div className="k">สถานะ</div>
          <div className="v success">{eia.status ?? "ผ่าน EIA"}</div>
        </div>
      </div>

      {/* Meta */}
      <div className="eia-meta">
        <div><span>เจ้าของ</span><b>{eia.owner ?? "-"}</b></div>
        <div>
          <span>พิกัด</span>
          <b>{eia.location?.lat}, {eia.location?.lon}</b>
        </div>
      </div>

      {/* Actions */}
      <div className="eia-actions">
        <button className="btn ghost">Link ข่าวสาร</button>
        <button className="btn primary">Link EIA</button>
      </div>
    </div>
  );
}

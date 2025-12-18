import React from "react";
import "../../css/LandDetailPanel.css";

export default function LandDetailPanel({ land, mode = "side", pos, onClose }) {
  if (!land) return null;

  const isPopup = mode === "popup";

  // ถ้าเป็น popup แต่ไม่มีตำแหน่ง → ยังไม่ต้อง render
  if (isPopup && (!pos || typeof pos.x !== "number" || typeof pos.y !== "number")) {
    return null;
  }

  return (
    <div
      className={`land-detail-panel ${isPopup ? "is-popup" : "is-side"}`}
      style={
        isPopup
          ? {
              position: "absolute",
              left: pos.x + 14,   // ขยับออกจากหมุด
              top: pos.y - 22,    // ยกขึ้นนิดหน่อย
              transform: "translateY(-100%)", // ให้อยู่ “เหนือ” หมุด
              zIndex: 100000,
            }
          : undefined
      }
    >
      {isPopup && <div className="land-detail-arrow" />}

      <button className="land-detail-close" onClick={onClose} aria-label="close">
        ×
      </button>

      <div className="land-detail-date">วันที่ลงข้อมูล {land.updatedAt || "-"}</div>
      <div className="land-detail-title">{land.brokerName || "-"} (นายหน้า)</div>

      <div className="land-detail-grid">
        <InfoCard label="ขนาดที่ดิน" value={`${(land.areaSqWa ?? 0).toLocaleString()} ตร.วา`} />
        <InfoCard label="ไร่/งาน/วา" value={`${land.rai ?? 0} - ${land.ngan ?? 0} - ${land.wa ?? 0}`} />
        <InfoCard label="หน้ากว้างติดถนน" value={`${land.frontage ?? "-"} ม.`} />
        <InfoCard label="ขนาดถนน" value={`${land.roadWidth ?? "-"} ม.`} />
      </div>

      <div className="land-detail-divider" />

      <div className="land-detail-price-row">
        <div className="muted">ราคา/ตร.วา</div>
        <div className="strong">{(land.pricePerWa ?? 0).toLocaleString()} บ.</div>
      </div>

      <div className="land-detail-total">{(land.totalPrice ?? 0).toLocaleString()} บ.</div>

      <div className="land-detail-contact">
        <div className="muted">ข้อมูลติดต่อ</div>
        <div>โทร: {land.phone || "-"}</div>
        <div>LINE: {land.line || "-"}</div>
      </div>

      <div className="land-detail-actions">
        <button className="btn-primary" onClick={() => alert("TODO: Chat")}>
          แชทผู้ขาย
        </button>
        <button
          className="btn-outline"
          onClick={() => navigator.clipboard?.writeText(JSON.stringify(land, null, 2))}
        >
          คัดลอกข้อมูล
        </button>
      </div>
    </div>
  );
}

function InfoCard({ label, value }) {
  return (
    <div className="land-detail-card">
      <div className="muted">{label}</div>
      <div className="strong">{value}</div>
    </div>
  );
}

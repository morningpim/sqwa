// src/components/map/SellModePickerModal.jsx
import React from "react";
import "../../css/SellModePickerModal.css";

export default function SellModePickerModal({ open, onClose, onPick }) {
  if (!open) return null;

  return (
    <div className="smp-backdrop" role="dialog" aria-modal="true">
      <div className="smp-card">
        <div className="smp-title">เลือกประเภทการใช้งาน</div>
        <div className="smp-sub">โหมดฝากขายที่ดิน</div>

        <div className="smp-grid">
          <button
            className="smp-option"
            type="button"
            onClick={() => onPick?.("seller")}
          >
            <div className="smp-icon">💰</div>
            <div className="smp-label">ผู้ขายฝาก</div>
          </button>

          <button
            className="smp-option"
            type="button"
            onClick={() => onPick?.("investor")}
          >
            <div className="smp-icon">🧑‍💼</div>
            <div className="smp-label">นักลงทุน</div>
          </button>
        </div>

        <div className="smp-actions">
          <button className="smp-cancel" type="button" onClick={onClose}>
            ยกเลิก
          </button>
        </div>
      </div>
    </div>
  );
}

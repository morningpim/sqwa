import React from "react";
import "../../css/ModeDisclaimerModal.css";

export default function ModeDisclaimerModal({ onClose }) {
  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <div className="modal-icon">⚠️</div>

        <p className="modal-text">
          ข้อมูลนี้เพื่อใช้แสดงสภาพพื้นที่ตำแหน่งแปลงที่ดิน
          <br />
          และแปลงจำแนกร่วมกับ Google Maps เท่านั้น
          <br />
          ไม่ใช่หลักฐานที่ใช้ในทางกฎหมาย
        </p>

        <button className="btn btn-primary" onClick={onClose}>
          รับทราบ
        </button>
      </div>
    </div>
  );
}

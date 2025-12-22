import React from "react";
import "../../css/land-popup.css";

export default function buildLandPopupHtml(land = {}) {
  return `
  <div id="sqw-popup-root" class="sqw-popup">
    <div class="sqw-head">
      <div class="sqw-pill">
        ${land.owner || "คุณปาลิส (นายหน้า)"}
      </div>
      <button id="sqwa-close-btn" class="sqw-x">×</button>
    </div>

    <div class="sqw-meta">
      🕒 วันที่ลงข้อมูล ${land.updatedAt || "05/11/2025"}
    </div>

    <div class="sqw-grid">
      <div class="sqw-box">
        <div class="sqw-box-k">ขนาดที่ดิน</div>
        <div class="sqw-box-v">${land.area || "429"} ตร.วา</div>
      </div>

      <div class="sqw-box">
        <div class="sqw-box-k">ไร่-งาน-วา</div>
        <div class="sqw-box-v">${land.raw || "1-0-/-29"}</div>
      </div>

      <div class="sqw-box">
        <div class="sqw-box-k">หน้ากว้างติดถนน</div>
        <div class="sqw-box-v">${land.frontage || "34"} ม.</div>
      </div>

      <div class="sqw-box">
        <div class="sqw-box-k">ขนาดถนน</div>
        <div class="sqw-box-v">${land.roadWidth || "18"} ม.</div>
      </div>
    </div>

    <div class="sqw-divider"></div>

    <div class="sqw-row">
      <span>ราคา/ตร.วา</span>
      <span class="sqw-row-v">${land.pricePerWa || "17,000"} บ.</span>
    </div>

    <div class="sqw-row">
      <span>ราคารวม</span>
      <span class="sqw-row-v">${land.totalPrice || "7,293,000"} บ.</span>
    </div>

    <div class="sqw-divider"></div>

    <div class="sqw-h">ข้อมูลติดต่อ</div>

    <div class="sqw-contact-row">
      <span>เจ้าของ</span><span>🏢</span><span>${land.owner || "-"}</span>
    </div>

    <div class="sqw-contact-row">
      <span>โทร</span><span>📞</span><span>${land.phone || "**********"}</span>
    </div>

    <div class="sqw-contact-row">
      <span>LINE ID</span><span>💬</span><span>${land.line || "**********"}</span>
    </div>

    <div class="sqw-actions">
      <button class="sqw-btn sqw-btn-solid">แชทกับผู้ขาย</button>
      <button class="sqw-btn sqw-btn-solid">คลิกเพื่อปลดล็อคข้อมูล</button>
    </div>
  </div>
  `;
}
// src/pages/Cart/components/PromptPayQrModal.jsx
import React from "react";
import { QRCodeCanvas } from "qrcode.react";

/**
 * PromptPay QR Modal
 * props:
 * - open: boolean
 * - data: { orderId, amount, qrText, expiresAt? }
 * - status: "PENDING" | "PAID" | "FAILED"
 * - onClose: () => void
 */
export default function PromptPayQrModal({ open, data, onClose, status }) {
  if (!open || !data) return null;

  return (
    <div className="pm-qr-backdrop" onClick={onClose}>
      <div className="pm-qr-card" onClick={(e) => e.stopPropagation()}>
        <div className="pm-qr-title">สแกนเพื่อชำระเงิน (PromptPay)</div>

        <div className="pm-qr-sub">
          Order: <b>{data.orderId}</b> • <b>{Number(data.amount).toLocaleString("th-TH")}</b> บาท
        </div>

        <div className="pm-qr-box">
          <QRCodeCanvas value={String(data.qrText || "")} size={240} />
        </div>

        <div className="pm-qr-hint">
          {status === "PAID"
            ? "ชำระสำเร็จ ✅ กำลังดำเนินการ..."
            : status === "FAILED"
            ? "การชำระไม่สำเร็จ ❌ (ลองใหม่หรือเลือกวิธีอื่น)"
            : "เปิดแอปธนาคาร → สแกน QR → รอระบบยืนยันสถานะ"}
        </div>

        <button className="ds-btn ds-btn-outline" onClick={onClose}>
          ปิด
        </button>
      </div>
    </div>
  );
}

// src/pages/PayModal/components/PromptPayQrModal.jsx
import React from "react";
import { createPortal } from "react-dom";
import { QRCodeCanvas } from "qrcode.react";

export default function PromptPayQrModal({ open, data, status, onClose }) {
  if (!open || !data) return null;

  return createPortal(
    <div className="pm-qr-backdrop" onClick={onClose}>
      <div className="pm-qr-card" onClick={(e) => e.stopPropagation()}>
        <div className="pm-qr-title">สแกนเพื่อชำระเงิน (PromptPay)</div>

        <div className="pm-qr-sub">
          Order: <b>{data.orderId}</b> •{" "}
          <b>{Number(data.amount).toLocaleString("th-TH")}</b> บาท
        </div>

        <div className="pm-qr-box">
          <QRCodeCanvas value={String(data.qrText || "")} size={240} />
        </div>

        <div className="pm-qr-hint">
          {status === "PAID"
            ? "ชำระสำเร็จ ✅"
            : status === "FAILED"
            ? "ชำระไม่สำเร็จ ❌"
            : "เปิดแอปธนาคาร → สแกน QR → รอระบบยืนยัน"}
        </div>

        <button className="ds-btn ds-btn-outline" onClick={onClose}>
          ปิด
        </button>
      </div>
    </div>,
    document.body
  );
}

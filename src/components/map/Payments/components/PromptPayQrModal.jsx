// src/pages/PayModal/components/PromptPayQrModal.jsx
import React from "react";
import { createPortal } from "react-dom";
import { QRCodeCanvas } from "qrcode.react";

export default function PromptPayQrModal({ open, data, status, onClose, onPaid }) {
  if (!open || !data) return null;

  const isPaid = status === "PAID";
  const isFailed = status === "FAILED";
  const isPending = !isPaid && !isFailed;

  return createPortal(
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
          {isPaid ? "ชำระสำเร็จ ✅" : isFailed ? "ชำระไม่สำเร็จ ❌" : "เปิดแอปธนาคาร → สแกน QR → กด “ฉันชำระแล้ว”"}
        </div>

        {/* ✅ actions */}
        <div className="pm-qr-actions">
          <button className="ds-btn ds-btn-outline" onClick={onClose} type="button">
            ปิด
          </button>

          {/* mock flow: ให้ user กดยืนยันเอง */}
          {isPending ? (
            <button className="ds-btn ds-btn-primary" onClick={onPaid} type="button">
              ฉันชำระแล้ว
            </button>
          ) : null}
        </div>
      </div>
    </div>,
    document.body
  );
}

// src/pages/Cart/components/PromptPayQrModal.jsx
import React from "react";
import { QRCodeCanvas } from "qrcode.react";
import { useTranslation } from "react-i18next";

export default function PromptPayQrModal({ open, data, onClose, status }) {
  const { t } = useTranslation("payment");

  if (!open || !data) return null;

  return (
    <div className="pm-qr-backdrop" onClick={onClose}>
      <div className="pm-qr-card" onClick={(e) => e.stopPropagation()}>
        {/* title */}
        <div className="pm-qr-title">
          {t("promptpay.title")}
        </div>

        {/* order + amount */}
        <div className="pm-qr-sub">
          {t("promptpay.order")}:{" "}
          <b>{data.orderId}</b> •{" "}
          <b>{Number(data.amount).toLocaleString()}</b>{" "}
          {t("promptpay.amountUnit")}
        </div>

        {/* QR */}
        <div className="pm-qr-box">
          <QRCodeCanvas value={String(data.qrText || "")} size={240} />
        </div>

        {/* status */}
        <div className="pm-qr-hint">
          {status === "PAID"
            ? t("promptpay.status.paid")
            : status === "FAILED"
            ? t("promptpay.status.failed")
            : t("promptpay.status.pending")}
        </div>

        {/* close */}
        <button
          className="ds-btn ds-btn-outline"
          onClick={onClose}
        >
          {t("action.close")}
        </button>
      </div>
    </div>
  );
}

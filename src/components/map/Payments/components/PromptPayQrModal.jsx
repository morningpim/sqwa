import React from "react";
import { createPortal } from "react-dom";
import { QRCodeCanvas } from "qrcode.react";
import { useTranslation } from "react-i18next";

export default function PromptPayQrModal({
  open,
  data,
  status,
  onClose,
  onPaid,
}) {
  const { t } = useTranslation("payment");
  const { t: tCommon } = useTranslation("common");

  if (!open || !data) return null;

  const isPaid = status === "PAID";
  const isFailed = status === "FAILED";
  const isPending = !isPaid && !isFailed;

  return createPortal(
    <div
      className="pm-qr-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div className="pm-qr-card" onClick={(e) => e.stopPropagation()}>
        {/* ================= TITLE ================= */}
        <div className="pm-qr-title">
          {t("promptpay.title")}
        </div>

        {/* ================= META ================= */}
        <div className="pm-qr-sub">
          {t("promptpay.order", { id: data.orderId })} •{" "}
          <b>
            {Number(data.amount).toLocaleString()}{" "}
            {t("promptpay.amountUnit")}
          </b>
        </div>

        {/* ================= QR ================= */}
        <div className="pm-qr-box">
          <QRCodeCanvas
            value={String(data.qrText || "")}
            size={240}
          />
        </div>

        {/* ================= STATUS ================= */}
        <div className="pm-qr-hint">
          {isPaid
            ? t("promptpay.status.paid")
            : isFailed
            ? t("promptpay.status.failed")
            : t("promptpay.status.pending")}
        </div>

        {/* ================= ACTIONS ================= */}
        <div className="pm-qr-actions">
          <button
            className="ds-btn ds-btn-outline"
            onClick={onClose}
            type="button"
            aria-label={tCommon("close")}
          >
            {t("action.close")}
          </button>

          {/* mock flow: ให้ user กดยืนยันเอง */}
          {isPending && (
            <button
              className="ds-btn ds-btn-primary"
              onClick={onPaid}
              type="button"
            >
              {t("action.confirmPaid")}
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import "../../../css/PayModal.css";

import { LABEL, PAYMENT_METHODS, PRICE } from "./constants";
import { buildPromptPayMockQr, todayKeyTH } from "./utils";
import PaymentMethodDropdown from "./components/PaymentMethodDropdown";
import PromptPayQrModal from "./components/PromptPayQrModal";

import { addPurchase } from "../../../utils/purchases";

export default function PayModal({ open, draft, onClose, onPaid, dock = "center" }) {
  const { t } = useTranslation("payment");
  const { t: tCommon } = useTranslation("common");
  const [loading, setLoading] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState("");
  const [qrOpen, setQrOpen] = useState(false);
  const [qrData, setQrData] = useState(null);
  const [payStatus, setPayStatus] = useState("PENDING"); // PENDING | PAID | FAILED

  const landId = draft?.landId ?? "";
  const selectedFields = Array.isArray(draft?.selectedFields)
    ? draft.selectedFields
    : [];

  /* =========================
     reset state เมื่อเปิด / เปลี่ยน land
  ========================= */
  useEffect(() => {
    if (!open) return;
    setLoading(false);
    setPaymentMethod("");
    setQrOpen(false);
    setQrData(null);
    setPayStatus("PENDING");
  }, [open, landId]);

  /* =========================
     normalize field (phone_line)
  ========================= */
  const normalizedSelected = useMemo(() => {
    const set = new Set();
    selectedFields.forEach((k) => {
      if (k === "phone_line") {
        set.add("phone");
        set.add("line");
      } else {
        set.add(k);
      }
    });
    return Array.from(set);
  }, [selectedFields]);

  /* =========================
     UI items
  ========================= */
  const itemsUi = useMemo(
    () =>
      normalizedSelected.map((k) => ({
        k,
        label: t(`field.${k}`, LABEL[k] || k),
        price: PRICE[k] || 0,
      })),
    [normalizedSelected, t]
  );

  const amount = useMemo(
    () => itemsUi.reduce((sum, i) => sum + i.price, 0),
    [itemsUi]
  );

  const canPay = Boolean(paymentMethod && amount > 0 && !loading);

  /* =========================
     PAY HANDLER
  ========================= */
  const onPay = async () => {
    if (!paymentMethod) {
      alert(t("alert.selectMethod"));
      return;
    }
    if (!amount) return;

    const orderId = `PM_${todayKeyTH()}_${landId}`;

    // PromptPay → แสดง QR
    if (paymentMethod === "promptpay") {
      setLoading(true);
      setPayStatus("PENDING");

      const qrText = buildPromptPayMockQr(amount);
      setQrData({ orderId, amount, qrText });

      setQrOpen(true);
      setLoading(false);
      return;
    }

    // Card / Bank (mock)
    alert(t("alert.notReady"));
  };

  if (!open || !landId) return null;

  return createPortal(
    <div
      className={`pay-backdrop ${dock === "left" ? "is-left" : ""}`}
      onClick={onClose}
    >
      <div className="pay-card" onClick={(e) => e.stopPropagation()}>
        {/* ================= HEAD ================= */}
        <div className="pay-head">
          <div className="pay-title">{t("title")}</div>
          <button
            className="pay-close"
            onClick={onClose}
            disabled={loading}
            type="button"
            aria-label={t("common.close")}
          >
            ×
          </button>
        </div>

        <div className="pay-meta">
          {t("landId", { id: landId })}
        </div>

        {/* ================= ITEMS ================= */}
        <div className="pay-section">
          <div className="pay-section-title">
            {t("section.items")}
          </div>

          {itemsUi.length ? (
            <ul className="pay-items">
              {itemsUi.map((it) => (
                <li key={it.k}>
                  {it.label}{" "}
                  <span style={{ opacity: 0.75 }}>
                    ({it.price.toLocaleString()} {t("total.unit")})
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="pay-empty">
              {t("empty.items")}
            </div>
          )}
        </div>

        {/* ================= TOTAL ================= */}
        <div className="pay-total">
          {t("total.label")}:{" "}
          {amount.toLocaleString()} {t("total.unit")}
        </div>

        {/* ================= PAYMENT METHOD ================= */}
        <div className="pay-pm">
          <div className="pm-head">
            {t("section.paymentMethod")}:
          </div>

          <PaymentMethodDropdown
            value={paymentMethod}
            options={PAYMENT_METHODS.map((m) => ({
              ...m,
              label: t(`method.${m.value}`),
            }))}
            onChange={setPaymentMethod}
            disabled={loading}
          />

          <div className="pay-note">
            {paymentMethod === "promptpay"
              ? t("note.promptpay")
              : t("note.redirect")}
          </div>
        </div>

        {/* ================= ACTIONS ================= */}
        <div className="pay-actions">
          <button
            className="pay-btn pay-btn-outline"
            onClick={onClose}
            disabled={loading}
            type="button"
          >
            {t("action.cancel")}
          </button>

          <button
            className="pay-btn pay-btn-primary"
            disabled={!canPay}
            onClick={onPay}
            type="button"
          >
            {paymentMethod === "promptpay"
              ? t("action.generateQr")
              : t("action.pay")}
          </button>
        </div>

        <div className="pay-foot">
          {t("footer.mock")}
        </div>
      </div>

      {/* ================= QR MODAL ================= */}
      <PromptPayQrModal
        open={qrOpen}
        data={qrData}
        status={payStatus}
        onClose={() => {
          setQrOpen(false);
          setQrData(null);
          setPayStatus("PENDING");
        }}
        onPaid={() => {
          setPayStatus("PAID");
          setQrOpen(false);

          const paidAt = todayKeyTH();
          const title = t("title");
          const note = itemsUi.map((x) => x.label).join(", ");

          addPurchase({
            id: qrData?.orderId || `PM_${paidAt}_${landId}_${Date.now()}`,
            landId,
            title,
            seller: draft?.owner || draft?.seller || "-",
            totalPrice: amount,
            status: "paid",
            paidAt,
            note: note ? `Unlock: ${note}` : "",
            paymentMethod,
          });

          onPaid?.();
          onClose?.();
        }}
      />
    </div>,
    document.body
  );
}

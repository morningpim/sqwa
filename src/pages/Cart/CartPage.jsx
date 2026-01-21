// src/pages/Cart/CartPage.jsx
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { clearCart, readCart, removeCartItem } from "../../utils/cartStorage";
import "../../css/CartPage.css";
import { useTranslation } from "react-i18next";


import { PRICE, PAYMENT_METHODS, FIELD_I18N_KEY } from "./constants";
import PaymentMethodDropdown from "./components/PaymentMethodDropdown";
import PromptPayQrModal from "./components/PromptPayQrModal";
import { applyUnlockFromCartMock } from "./utils/applyUnlockFromCartMock";
import { createHybridPayHandler } from "./hooks/useHybridPayment";
import { usePaymentStatusPoll } from "./hooks/usePaymentStatusPoll";

export default function CartPage() {
  const nav = useNavigate();
  const { t } = useTranslation("payment");
  const { t: tCommon } = useTranslation("common");

  const [loading, setLoading] = useState(false);
  const [cart, setCart] = useState(() => readCart());

  // payment
  const [paymentMethod, setPaymentMethod] = useState(""); // "promptpay" | "card" | "bank"

  // QR flow
  const [qrOpen, setQrOpen] = useState(false);
  const [qrData, setQrData] = useState(null); // { orderId, amount, qrText, expiresAt? }
  const [payStatus, setPayStatus] = useState("PENDING"); // PENDING|PAID|FAILED

  const total = useMemo(() => {
    return cart.reduce((sum, it) => {
      const fields = Array.isArray(it?.selectedFields) ? it.selectedFields : [];
      const s = fields.reduce((x, k) => x + (PRICE[k] || 0), 0);
      return sum + s;
    }, 0);
  }, [cart]);

  const refresh = () => setCart(readCart());

  const canPay = cart.length > 0 && !!paymentMethod && !loading;

  const onPayHybrid = React.useMemo(
    () =>
      createHybridPayHandler({
        cart,
        total,
        paymentMethod,
        setLoading,
        setPayStatus,
        setQrData,
        setQrOpen,
      }),
    [cart, total, paymentMethod]
  );

  // Poll payment status when QR open
  usePaymentStatusPoll({
    qrOpen,
    orderId: qrData?.orderId,
    setPayStatus,
    onPaid: () => {
      // ✅ ของจริง: backend ควรเป็นคนปลดล็อก/clear cart หลัง confirm
      clearCart();
      setCart([]);
      setQrOpen(false);
      alert(t("status.paid"));
      nav("/map?mode=buy");
    },
  });

  // ✅ ปุ่มทดสอบโฟลว์เดิม (จะลบออกก็ได้)
  const onPayAllInstantMock = () => {
    if (!cart.length) return;

    try {
      setLoading(true);

      applyUnlockFromCartMock(cart);
      clearCart();
      setCart([]);

      alert(t("footer.mock"));
      nav("/map?mode=buy");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ds-container ds-section cart-page">
      {/* Header */}
      <div className="cart-header">
        <h2 className="ds-h3 cart-title-line">
          <span className="material-icon">shopping_cart</span>
          {t("cart.title")}
        </h2>

        <div className="cart-sub text-sub">
          <span className="material-icon">info</span>
          {t("cart.subtitle")}
        </div>
      </div>

      <div className="cart-layout">
        {/* LEFT: Items */}
        <div className="cart-items ds-col ds-gap-4">
          {cart.length === 0 ? (
            <div className="ds-card ds-card-pad cart-empty">
              <div className="cart-empty-icon">
                <span className="material-icon">shopping_cart</span>
              </div>
              <div className="cart-empty-title">{t("cart.empty.title")}</div>
              <div className="cart-empty-sub text-sub">
                {t("cart.empty.subtitle")}
              </div>

              <button
                type="button"
                className="ds-btn ds-btn-primary cart-empty-btn"
                onClick={() => nav("/map?mode=buy")}
              >
                <span className="material-icon">map</span>
                {t("cart.action.goMap")}
              </button>
            </div>
          ) : (
            cart.map((it) => {
              const fields = Array.isArray(it?.selectedFields) ? it.selectedFields : [];
              const sub = fields.reduce((sum, k) => sum + (PRICE[k] || 0), 0);

              return (
                <div key={String(it.landId)} className="ds-card ds-card-pad cart-item">
                  <div className="cart-item-left">
                    <div className="cart-item-row cart-land">
                      <span className="material-icon">location_on</span>
                      <span className="cart-land-label">Land ID:</span>
                      <span className="cart-land-id text-primary">{String(it.landId)}</span>
                    </div>

                    <div className="cart-item-row cart-fields text-sub">
                      <span className="material-icon">checklist</span>
                      <span className="cart-fields-text">
                        {tCommon("field.selected")}
                        {fields
                          .map((k) => tCommon(FIELD_I18N_KEY[k] || "unknown"))
                          .join(", ")
                        }
                      </span>
                    </div>

                    <div className="cart-item-row cart-date text-muted">
                      <span className="material-icon">schedule</span>
                      <span>
                        {tCommon("date.added")}: {it.createdAt ? new Date(it.createdAt).toLocaleString("th-TH") : "-"}
                      </span>
                    </div>
                  </div>

                  <div className="cart-item-right">
                    <div className="cart-item-row cart-price">
                      <span className="material-icon">payments</span>
                      <span className="cart-price-amount">{sub.toLocaleString("th-TH")} {t("total.unit")}</span>
                    </div>

                    <button
                      type="button"
                      className="ds-btn ds-btn-outline cart-remove-btn"
                      disabled={loading}
                      onClick={() => {
                        removeCartItem(it.landId);
                        refresh();
                      }}
                    >
                      <span className="material-icon">delete</span>
                      {tCommon("action.delete")}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* RIGHT: Summary */}
        <aside className="cart-summary">
          <div className="ds-card ds-card-pad cart-summary-box">
            <div className="summary-head">
              <div className="summary-title">
                <span className="material-icon">receipt_long</span>
                {t("cart.summary.title")}
              </div>
              <div className="summary-badge">
                <span className="material-icon">shopping_bag</span>
                {cart.length} รายการ
              </div>
            </div>

            <div className="summary-total">
              <div className="summary-total-label">
                <span className="material-icon">payments</span>
                {t("cart.summary.total")}
              </div>
              <div className="summary-total-value">{total.toLocaleString("th-TH")} บาท</div>
            </div>

            {/* Payment method (Custom Dropdown) */}
            <div className="pm-wrap">
              <div className="pm-head">{t("cart.paymentMethod")}</div>

              <PaymentMethodDropdown
                value={paymentMethod}
                options={PAYMENT_METHODS}
                onChange={setPaymentMethod}
                disabled={loading}
              />

              <div className="pm-note">{t("note.promptpay")} • {t("note.redirect")}</div>
            </div>

            <div className="summary-hint text-sub" style={{ marginTop: 12 }}>
              <span className="material-icon">lock_open</span>
              {t("hint.postPaid")}
            </div>

            {/* Actions (sticky bottom) */}
            <div className="summary-actions">
              <button
                type="button"
                className="ds-btn ds-btn-primary summary-pay-btn"
                disabled={!canPay}
                onClick={onPayHybrid}
              >
                <span className="material-icon">credit_card</span>
                {loading
                  ? `${tCommon("loading")}...`
                  : paymentMethod === "promptpay"
                  ? t("action.generateQr")
                  : t("action.pay")
                }
              </button>

              {/* (ทางเลือก) โฟลว์เดิม mock */}
              <button
                type="button"
                className="ds-btn ds-btn-outline summary-pay-btn"
                disabled={loading || cart.length === 0}
                onClick={onPayAllInstantMock}
                title="ทดสอบโฟลว์เดิม (ปลดล็อกทันที) — แนะนำลบเมื่อจะใช้ของจริง"
              >
                <span className="material-icon">science</span>
                {loading ? tCommon("loading") : t("cart.action.mockPay")}
              </button>

              <button
                type="button"
                className="ds-btn ds-btn-outline summary-back-btn"
                onClick={() => nav("/map?mode=buy")}
                disabled={loading}
              >
                <span className="material-icon">arrow_back</span>
                {t("cart.action.back")}
              </button>
            </div>
          </div>
        </aside>
      </div>

      {/* PromptPay QR Modal */}
      <PromptPayQrModal
        open={qrOpen}
        data={qrData}
        status={payStatus}
        onClose={() => {
          setQrOpen(false);
          setPayStatus("PENDING");
        }}
      />
    </div>
  );
}

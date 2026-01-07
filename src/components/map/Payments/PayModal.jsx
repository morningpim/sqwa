// src/components/map/Payments/PayModal.jsx
import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import "../../../css/PayModal.css";

import { LABEL, PAYMENT_METHODS, PRICE } from "./constants";
import { buildPromptPayMockQr, todayKeyTH } from "./utils";
import PaymentMethodDropdown from "./components/PaymentMethodDropdown";
import PromptPayQrModal from "./components/PromptPayQrModal";

import { addPurchase } from "../../../utils/purchases";

export default function PayModal({ open, draft, onClose, onPaid, dock = "center" }) {
  const [loading, setLoading] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState("");
  const [qrOpen, setQrOpen] = useState(false);
  const [qrData, setQrData] = useState(null);
  const [payStatus, setPayStatus] = useState("PENDING"); // PENDING|PAID|FAILED

  const landId = draft?.landId ?? "";
  const selectedFields = Array.isArray(draft?.selectedFields) ? draft.selectedFields : [];

  // ✅ reset ทุกครั้งที่เปิด/เปลี่ยน landId กัน state ค้าง
  useEffect(() => {
    if (!open) return;
    setLoading(false);
    setPaymentMethod("");
    setQrOpen(false);
    setQrData(null);
    setPayStatus("PENDING");
  }, [open, landId]);

  const normalizedSelected = useMemo(() => {
    const set = new Set();
    selectedFields.forEach((k) => {
      if (k === "phone_line") {
        set.add("phone");
        set.add("line");
      } else set.add(k);
    });
    return Array.from(set);
  }, [selectedFields]);

  const itemsUi = useMemo(
    () =>
      normalizedSelected.map((k) => ({
        k,
        label: LABEL[k] || k,
        price: PRICE[k] || 0,
      })),
    [normalizedSelected]
  );

  const amount = useMemo(() => itemsUi.reduce((sum, i) => sum + i.price, 0), [itemsUi]);

  const canPay = !!paymentMethod && amount > 0 && !loading;

  const onPay = async () => {
    if (!paymentMethod) return alert("กรุณาเลือกวิธีชำระเงิน");
    if (!amount) return;

    const orderId = `PM_${todayKeyTH()}_${landId}`;

    // ✅ PromptPay -> ขึ้น QR ก่อน (ไม่ redirect)
    if (paymentMethod === "promptpay") {
      setLoading(true);
      setPayStatus("PENDING");

      const qrText = buildPromptPayMockQr(amount); // mock payload
      setQrData({ orderId, amount, qrText });

      setQrOpen(true);
      setLoading(false);
      return;
    }

    // Card/Bank (ยังไม่ทำ ChillPay) -> mock
    alert("Card/Bank: ยังไม่เชื่อม ChillPay API (mock)");
  };

  if (!open || !landId) return null;

  return createPortal(
    <div className={`pay-backdrop ${dock === "left" ? "is-left" : ""}`} onClick={onClose}>
      <div className="pay-card" onClick={(e) => e.stopPropagation()}>
        <div className="pay-head">
          <div className="pay-title">ชำระเงินเพื่อปลดล็อกข้อมูล</div>
          <button className="pay-close" onClick={onClose} disabled={loading} type="button">
            ×
          </button>
        </div>

        <div className="pay-meta">
          Land ID: <b>{landId}</b>
        </div>

        <div className="pay-section">
          <div className="pay-section-title">รายการปลดล็อก</div>
          {itemsUi.length ? (
            <ul className="pay-items">
              {itemsUi.map((it) => (
                <li key={it.k}>
                  {it.label}{" "}
                  <span style={{ opacity: 0.75 }}>({it.price.toLocaleString("th-TH")} บาท)</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="pay-empty">ยังไม่ได้เลือกรายการ</div>
          )}
        </div>

        <div className="pay-total">ยอดชำระ: {amount.toLocaleString("th-TH")} บาท</div>

        {/* ✅ dropdown custom */}
        <div className="pay-pm">
          <div className="pm-head">เลือกวิธีชำระเงิน:</div>
          <PaymentMethodDropdown
            value={paymentMethod}
            options={PAYMENT_METHODS}
            onChange={setPaymentMethod}
            disabled={loading}
          />
          <div className="pay-note">* PromptPay = แสดง QR ในหน้า • Card/Bank = Redirect</div>
        </div>

        <div className="pay-actions">
          <button className="pay-btn pay-btn-outline" onClick={onClose} disabled={loading} type="button">
            ยกเลิก
          </button>

          <button className="pay-btn pay-btn-primary" disabled={!canPay} onClick={onPay} type="button">
            {paymentMethod === "promptpay" ? "สร้าง QR เพื่อชำระเงิน" : "ไปชำระเงิน"}
          </button>
        </div>

        <div className="pay-foot">* ตอนนี้ยังไม่เชื่อม ChillPay API (โหมด mock)</div>
      </div>

      {/* ✅ QR Modal */}
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
          // ✅ 1) อัปเดตสถานะใน UI
          setPayStatus("PAID");
          setQrOpen(false);

          // ✅ 2) บันทึกประวัติการซื้อ (localStorage)
          const paidAt = todayKeyTH();
          const title = `ปลดล็อกข้อมูลแปลง ${landId}`;
          const note = itemsUi.map((x) => x.label).join(", ");

          addPurchase({
            // กันชนกันกรณีซื้อซ้ำวันเดียวกัน
            id: qrData?.orderId || `PM_${paidAt}_${landId}_${Date.now()}`,
            landId,
            title,
            seller: draft?.owner || draft?.seller || "-",
            totalPrice: amount, // ✅ เก็บเป็น number
            status: "paid",
            paidAt,
            note: note ? `ปลดล็อก: ${note}` : "",
            paymentMethod,
          });

          // ✅ 3) แจ้ง parent ให้ปลดล็อกข้อมูล
          onPaid?.();

          // ✅ 4) ปิด modal หลัก
          onClose?.();
        }}
      />
    </div>,
    document.body
  );
}

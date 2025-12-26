// src/pages/Cart/CartPage.jsx
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { clearCart, readCart, removeCartItem } from "../utils/cartStorage";
import "../css/CartPage.css";

const ACCESS_KEY = "sqw_access_v1";

const PRICE = {
  contactOwner: 50,
  broker: 50,
  phone: 200,
  line: 150,
  frame: 100,
  chanote: 200,
};

const LABEL = {
  contactOwner: "เจ้าของ",
  broker: "นายหน้า",
  phone: "เบอร์โทร",
  line: "LINE ID",
  frame: "กรอบที่ดิน",
  chanote: "โฉนด/ระวาง",
};

function todayKeyTH() {
  return new Date().toLocaleDateString("en-CA");
}

function loadAccess() {
  try {
    const raw = localStorage.getItem(ACCESS_KEY);
    const data = raw ? JSON.parse(raw) : null;

    const dateKey = todayKeyTH();
    const savedDate = data?.dateKey ?? dateKey;
    const quotaUsed = savedDate === dateKey ? (data?.quotaUsed ?? 0) : 0;

    return {
      dateKey,
      isMember: !!data?.isMember,
      quotaUsed,
      unlockedFields: data?.unlockedFields ?? {},
    };
  } catch {
    return { dateKey: todayKeyTH(), isMember: false, quotaUsed: 0, unlockedFields: {} };
  }
}

function saveAccess(next) {
  localStorage.setItem(ACCESS_KEY, JSON.stringify(next));
}

export default function CartPage() {
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);
  const [cart, setCart] = useState(() => readCart());

  const total = useMemo(() => {
    return cart.reduce((sum, it) => {
      const fields = Array.isArray(it?.selectedFields) ? it.selectedFields : [];
      const s = fields.reduce((x, k) => x + (PRICE[k] || 0), 0);
      return sum + s;
    }, 0);
  }, [cart]);

  const refresh = () => setCart(readCart());

  const onPayAllMock = () => {
    if (!cart.length) return;

    try {
      setLoading(true);

      // ✅ 1) โหลด access เดิม
      const cur = loadAccess();

      // ✅ 2) merge unlockedFields ตาม cart
      const unlockedFields = { ...(cur.unlockedFields || {}) };

      for (const item of cart) {
        const landId = String(item?.landId || "");
        const fields = Array.isArray(item?.selectedFields) ? item.selectedFields : [];
        if (!landId || !fields.length) continue;

        const prev = Array.isArray(unlockedFields[landId]) ? unlockedFields[landId] : [];
        unlockedFields[landId] = Array.from(new Set([...prev, ...fields]));
      }

      // ✅ 3) เพิ่ม quotaUsed ตามจำนวน land ที่ชำระ (นับ 1 ต่อ land)
      const landIds = Array.from(new Set(cart.map((x) => String(x?.landId || "")).filter(Boolean)));
      const used = (cur.quotaUsed || 0) + landIds.length;

      const saved = {
        ...cur,
        dateKey: todayKeyTH(),
        quotaUsed: used,
        unlockedFields,
      };

      saveAccess(saved);

      // ✅ 4) เคลียร์ cart
      clearCart();
      setCart([]);

      alert("ชำระรวมสำเร็จ (mock) ✅");

      // ✅ 5) กลับไปหน้า map
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
          รายการที่เลือกไว้เพื่อปลดล็อกข้อมูล (Mock)
        </h2>

        <div className="cart-sub text-sub">
          <span className="material-icon">info</span>
          เลือกข้อมูลที่ต้องการปลดล็อก แล้วชำระรวมครั้งเดียว
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
              <div className="cart-empty-title">ยังไม่มีรายการในตะกร้า</div>
              <div className="cart-empty-sub text-sub">
                ไปที่หน้าแผนที่ แล้วเลือกข้อมูลที่ต้องการปลดล็อกก่อนนะ
              </div>

              <button
                type="button"
                className="ds-btn ds-btn-primary cart-empty-btn"
                onClick={() => nav("/map?mode=buy")}
              >
                <span className="material-icon">map</span>
                ไปหน้าแผนที่
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
                        เลือก: {fields.map((k) => LABEL[k] || k).join(", ")}
                      </span>
                    </div>

                    <div className="cart-item-row cart-date text-muted">
                      <span className="material-icon">schedule</span>
                      <span>
                        เพิ่มเมื่อ:{" "}
                        {it.createdAt ? new Date(it.createdAt).toLocaleString("th-TH") : "-"}
                      </span>
                    </div>
                  </div>

                  <div className="cart-item-right">
                    <div className="cart-item-row cart-price">
                      <span className="material-icon">payments</span>
                      <span className="cart-price-amount">{sub.toLocaleString("th-TH")} บาท</span>
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
                      ลบ
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
                สรุปรายการ
              </div>
              <div className="summary-badge">
                <span className="material-icon">shopping_bag</span>
                {cart.length} รายการ
              </div>
            </div>

            <div className="summary-total">
              <div className="summary-total-label">
                <span className="material-icon">payments</span>
                ยอดรวมทั้งหมด
              </div>
              <div className="summary-total-value">{total.toLocaleString("th-TH")} บาท</div>
            </div>

            <div className="summary-hint text-sub">
              <span className="material-icon">lock_open</span>
              หลังชำระแล้ว ระบบจะปลดล็อก fields ที่เลือกไว้ให้กับ Land ID แต่ละรายการ
            </div>

            <button
              type="button"
              className="ds-btn ds-btn-primary summary-pay-btn"
              disabled={loading || cart.length === 0}
              onClick={onPayAllMock}
            >
              <span className="material-icon">credit_card</span>
              {loading ? "กำลังชำระ..." : "ชำระรวม (mock)"}
            </button>

            <button
              type="button"
              className="ds-btn ds-btn-outline summary-back-btn"
              onClick={() => nav("/map?mode=buy")}
              disabled={loading}
            >
              <span className="material-icon">arrow_back</span>
              กลับไปเลือกเพิ่ม
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}

// src/pages/Map/UnlockPickerModal.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { addToCart } from "../../utils/cartStorage";

/**
 * props:
 *  open: boolean
 *  title, subtitle
 *  items: [{k,label,price,icon}]
 *  initialSelected: string[]
 *  onCancel()
 *  onConfirm({selected})
 *  landId: string
 */
export default function UnlockPickerModal({
  open,
  title,
  subtitle,
  items = [],
  initialSelected = [],
  onCancel,
  onConfirm,
  landId,
}) {
  const nav = useNavigate();
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    if (!open) return;
    setSelected(Array.isArray(initialSelected) ? initialSelected : []);
  }, [open, initialSelected]);

  const total = useMemo(() => {
    const set = new Set(selected);
    return (items || []).reduce((sum, it) => (set.has(it.k) ? sum + (it.price || 0) : sum), 0);
  }, [items, selected]);

  if (!open) return null;

  const canAct = !!landId && selected.length > 0;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.35)",
        zIndex: 1000001,
        display: "grid",
        placeItems: "center",
        padding: 16,
        pointerEvents: "auto",
      }}
      onClick={onCancel}
    >
      <div
        style={{
          width: 720,
          maxWidth: "100%",
          background: "#fff",
          borderRadius: 18,
          padding: 14,
          boxShadow: "0 18px 60px rgba(0,0,0,.25)",
          pointerEvents: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
          <div>
            <div style={{ fontWeight: 900, fontSize: 18 }}>{title}</div>
            <div style={{ opacity: 0.65, marginTop: 2 }}>{subtitle}</div>

            {landId ? (
              <div style={{ opacity: 0.6, marginTop: 6, fontSize: 12 }}>
                Land ID: <b>{landId}</b>
              </div>
            ) : (
              <div style={{ opacity: 0.6, marginTop: 6, fontSize: 12 }}>
                * ยังไม่ได้ส่ง landId เข้ามา (ปุ่มเพิ่มลงตะกร้าจะถูกปิด)
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onCancel?.();
            }}
            style={{
              width: 36,
              height: 36,
              borderRadius: 999,
              border: "1px solid #ddd",
              background: "#fff",
              cursor: "pointer",
              fontWeight: 900,
            }}
            aria-label="close"
          >
            ×
          </button>
        </div>

        <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
          {(items || []).map((it) => {
            const checked = selected.includes(it.k);
            return (
              <button
                key={it.k}
                type="button"
                onClick={() => {
                  setSelected((prev) => (prev.includes(it.k) ? prev.filter((x) => x !== it.k) : [...prev, it.k]));
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                  padding: "12px 14px",
                  borderRadius: 14,
                  border: "1px solid #e8e8e8",
                  background: "#fff",
                  cursor: "pointer",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ fontSize: 20 }}>{it.icon}</div>
                  <div>
                    <div style={{ fontWeight: 900 }}>{it.label}</div>
                    <div style={{ opacity: 0.7, fontSize: 13 }}>{(it.price || 0).toLocaleString("th-TH")} บาท</div>
                  </div>
                </div>

                <div
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 6,
                    border: "2px solid #cfcfcf",
                    background: checked ? "#118e44" : "#fff",
                  }}
                />
              </button>
            );
          })}
        </div>

        <div style={{ marginTop: 14, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <div style={{ fontWeight: 900 }}>รวม: {total.toLocaleString("th-TH")} บาท</div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "flex-end" }}>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onCancel?.();
              }}
              style={{
                height: 40,
                padding: "0 18px",
                borderRadius: 999,
                border: "2px solid #118e44",
                background: "#fff",
                fontWeight: 900,
                cursor: "pointer",
              }}
            >
              ยกเลิก
            </button>

            {/* ✅ เพิ่มลงตะกร้า */}
            <button
              type="button"
              disabled={!canAct}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();

                if (!canAct) return;

                const r = addToCart({ landId, selectedFields: selected });
                if (!r?.ok) return;

                // ✅ ไปหน้า cart (และไม่เรียก onCancel เพราะ onCancel จะคืน popup)
                nav("/cart");
              }}
              style={{
                height: 40,
                padding: "0 18px",
                borderRadius: 999,
                border: "2px solid #118e44",
                background: "#fff",
                fontWeight: 900,
                cursor: !canAct ? "not-allowed" : "pointer",
                opacity: !canAct ? 0.6 : 1,
              }}
            >
              เพิ่มลงตะกร้า
            </button>

            {/* เดิม: ดำเนินการชำระเงิน */}
            <button
              type="button"
              disabled={selected.length === 0}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onConfirm?.({ selected });
              }}
              style={{
                height: 40,
                padding: "0 18px",
                borderRadius: 999,
                border: 0,
                background: "#118e44",
                color: "#fff",
                fontWeight: 900,
                cursor: selected.length === 0 ? "not-allowed" : "pointer",
                opacity: selected.length === 0 ? 0.6 : 1,
              }}
            >
              ดำเนินการชำระเงิน
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

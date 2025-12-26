import React, { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { confirmUnlockContactMock } from "./paymentMock";

/**
 * PayModal
 * draft:
 *  - landId: string
 *  - selectedFields: string[]  // ex. ["phone","line","broker"]
 *
 * props:
 *  - dock: "center" | "left"   // ✅ เพิ่ม: เวลา dock=left จะไม่บัง popup ขวา
 */
export default function PayModal({
  open,
  draft, // { landId, selectedFields }
  onClose,
  onPaid,
  dock = "center",
}) {
  const [loading, setLoading] = useState(false);

  const landId = draft?.landId ?? "";
  const selectedFields = Array.isArray(draft?.selectedFields) ? draft.selectedFields : [];

  const PRICE = useMemo(
    () => ({
      contactOwner: 50,
      broker: 50,
      phone: 200,
      line: 150,
      frame: 100,
      chanote: 200,
      phone_line: 300,
    }),
    []
  );

  const LABEL = useMemo(
    () => ({
      contactOwner: "เจ้าของ",
      broker: "นายหน้า",
      phone: "เบอร์โทร",
      line: "LINE ID",
      frame: "กรอบที่ดิน",
      chanote: "โฉนด/ระวาง",
      phone_line: "เบอร์โทร / LINE ID",
    }),
    []
  );

  const normalizedSelected = useMemo(() => {
    if (!selectedFields.length) return [];
    const set = new Set();
    for (const k of selectedFields) {
      if (!k) continue;
      if (k === "phone_line") {
        set.add("phone");
        set.add("line");
      } else set.add(k);
    }
    return Array.from(set);
  }, [selectedFields]);

  const amount = useMemo(() => {
    return normalizedSelected.reduce((sum, k) => sum + (PRICE[k] ?? 0), 0);
  }, [normalizedSelected, PRICE]);

  const itemsUi = useMemo(() => {
    if (!normalizedSelected.length) return [];
    return normalizedSelected.map((k) => ({
      k,
      label: LABEL[k] ?? k,
      price: PRICE[k] ?? 0,
    }));
  }, [normalizedSelected, LABEL, PRICE]);

  if (!open || !landId) return null;

  // ✅ Dock layout: center vs left
  const isLeft = dock === "left";

  return createPortal(
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.35)",
        zIndex: 1000000, // ให้สูงกว่าพวก popup/map
        display: "flex",
        alignItems: "center",
        justifyContent: isLeft ? "flex-start" : "center",
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: 440,
          maxWidth: "100%",
          background: "#fff",
          borderRadius: 16,
          padding: 14,
          boxShadow: "0 18px 60px rgba(0,0,0,.25)",
          marginLeft: isLeft ? 16 : 0, // ✅ ดันไปซ้าย (ไม่ทับ popup ขวา)
        }}
        onClick={(ev) => ev.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
          <div style={{ fontWeight: 900 }}>ชำระเงินเพื่อปลดล็อกข้อมูล</div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            style={{
              width: 34,
              height: 34,
              borderRadius: 999,
              border: "1px solid #ddd",
              background: "#fff",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
            }}
            aria-label="close"
          >
            ×
          </button>
        </div>

        <div style={{ marginTop: 10, fontSize: 13, opacity: 0.8 }}>
          Land ID: <b>{landId}</b>
        </div>

        <div style={{ marginTop: 10 }}>
          <div style={{ fontWeight: 800, marginBottom: 6 }}>รายการปลดล็อก:</div>

          {itemsUi.length ? (
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {itemsUi.map((it) => (
                <li key={it.k}>
                  {it.label}{" "}
                  <span style={{ opacity: 0.75 }}>({it.price.toLocaleString("th-TH")} บาท)</span>
                </li>
              ))}
            </ul>
          ) : (
            <div style={{ fontSize: 13, opacity: 0.7 }}>ยังไม่ได้เลือกรายการ</div>
          )}
        </div>

        <div style={{ marginTop: 12, fontWeight: 900, fontSize: 16 }}>
          ยอดชำระ: {amount.toLocaleString("th-TH")} บาท
        </div>

        <div style={{ marginTop: 12, display: "flex", gap: 10 }}>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            style={{
              flex: 1,
              height: 40,
              borderRadius: 999,
              border: "2px solid #118e44",
              background: "#fff",
              fontWeight: 900,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
            }}
          >
            ยกเลิก
          </button>

          <button
            type="button"
            disabled={loading || !itemsUi.length}
            onClick={() => {
              try {
                setLoading(true);

                // ✅ สำคัญ: ส่ง selectedFields เข้าไป
                const saved = confirmUnlockContactMock({
                  landId,
                  selectedFields: normalizedSelected,
                });

                onPaid?.(saved);
                onClose?.();
                alert("ชำระเงินสำเร็จ (mock) ✅");
              } finally {
                setLoading(false);
              }
            }}
            style={{
              flex: 1,
              height: 40,
              borderRadius: 999,
              border: "0",
              background: "#118e44",
              color: "#fff",
              fontWeight: 900,
              cursor: loading || !itemsUi.length ? "not-allowed" : "pointer",
              opacity: loading || !itemsUi.length ? 0.7 : 1,
            }}
          >
            {loading ? "กำลังยืนยัน..." : "ยืนยันชำระเงิน (mock)"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

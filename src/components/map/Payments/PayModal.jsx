import React from "react";

export default function PayModal({
  open,
  draft,          // { landId, fields }
  onClose,        // () => void
  onConfirm,      // () => void
}) {
  if (!open || !draft) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.35)",
        zIndex: 999999,
        display: "grid",
        placeItems: "center",
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: 420,
          maxWidth: "100%",
          background: "#fff",
          borderRadius: 16,
          padding: 14,
          boxShadow: "0 18px 60px rgba(0,0,0,.25)",
        }}
        onClick={(ev) => ev.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontWeight: 900 }}>ชำระเงินเพื่อปลดล็อกข้อมูล</div>
          <button
            onClick={onClose}
            style={{
              width: 34,
              height: 34,
              borderRadius: 999,
              border: "1px solid #ddd",
              background: "#fff",
              cursor: "pointer",
            }}
          >
            ×
          </button>
        </div>

        <div style={{ marginTop: 10, fontSize: 13, opacity: 0.8 }}>
          Land ID: <b>{draft.landId}</b>
        </div>

        <div style={{ marginTop: 10 }}>
          <div style={{ fontWeight: 800, marginBottom: 6 }}>ข้อมูลที่เลือก:</div>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {draft.fields.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </div>

        <div style={{ marginTop: 12, display: "flex", gap: 10 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              height: 40,
              borderRadius: 999,
              border: "2px solid #118e44",
              background: "#fff",
              fontWeight: 900,
              cursor: "pointer",
            }}
          >
            ยกเลิก
          </button>

          <button
            onClick={onConfirm}
            style={{
              flex: 1,
              height: 40,
              borderRadius: 999,
              border: "0",
              background: "#118e44",
              color: "#fff",
              fontWeight: 900,
              cursor: "pointer",
            }}
          >
            ยืนยันชำระเงิน (mock)
          </button>
        </div>
      </div>
    </div>
  );
}

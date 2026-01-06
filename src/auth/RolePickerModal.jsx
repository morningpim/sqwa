// src/auth/RolePickerModal.jsx
import React, { useEffect, useState } from "react";

export default function RolePickerModal({
  open,
  onClose,
  initialRole = "buyer",
  onSave,
}) {
  const [role, setRole] = useState(initialRole);

  // ✅ sync ค่า role ทุกครั้งที่เปิด modal / role เปลี่ยน
  useEffect(() => {
    setRole(initialRole);
  }, [initialRole, open]);

  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.4)",
        zIndex: 99999,
        display: "grid",
        placeItems: "center",
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: 360,
          maxWidth: "100%",
          background: "#fff",
          borderRadius: 12,
          padding: 16,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ margin: 0, marginBottom: 12 }}>เลือก Role (Mock)</h3>

        <label style={{ display: "block", marginBottom: 6 }}>Role</label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          style={{ width: "100%", padding: 10, borderRadius: 10 }}
        >
          <option value="buyer">buyer (ผู้ซื้อ)</option>
          <option value="seller">seller (ผู้ขาย)</option>
          <option value="landlord">landlord (เจ้าของที่ดิน)</option>
          <option value="staff">staff (เจ้าหน้าที่)</option>
          <option value="admin">admin</option>
        </select>

        <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
          <button
            style={{ flex: 1, padding: 10, borderRadius: 10 }}
            onClick={onClose}
          >
            ยกเลิก
          </button>
          <button
            style={{
              flex: 1,
              padding: 10,
              borderRadius: 10,
              background: "#16a34a",
              color: "#fff",
              border: "none",
            }}
            onClick={() => {
              onSave?.(role);
              onClose?.();
            }}
          >
            บันทึก
          </button>
        </div>
      </div>
    </div>
  );
}

// src/auth/RolePickerModal.jsx
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

export default function RolePickerModal({
  open,
  onClose,
  initialRole = "buyer",
  onSave,
}) {
  const [role, setRole] = useState(initialRole);

  // ✅ bind rolePicker namespace
  const { t } = useTranslation("rolePicker");

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
        <h3 style={{ margin: 0, marginBottom: 12 }}>
          {t("title")}
        </h3>

        <label style={{ display: "block", marginBottom: 6 }}>
          {t("label")}
        </label>

        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          style={{ width: "100%", padding: 10, borderRadius: 10 }}
        >
          <option value="buyer">
            {t("roles.buyer")}
          </option>
          <option value="seller">
            {t("roles.seller")}
          </option>
          <option value="landlord">
            {t("roles.landlord")}
          </option>
          <option value="staff">
            {t("roles.staff")}
          </option>
          <option value="admin">
            {t("roles.admin")}
          </option>
        </select>

        <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
          <button
            style={{ flex: 1, padding: 10, borderRadius: 10 }}
            onClick={onClose}
          >
            {t("action.cancel")}
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
            {t("action.save")}
          </button>
        </div>
      </div>
    </div>
  );
}

// src/pages/Map/UnlockPickerModal.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { addToCart } from "../../utils/cartStorage";

export default function UnlockPickerModal({
  open,
  //title,
  //subtitle,
  items = [],
  initialSelected = [],
  onCancel,
  onConfirm,
  landId,
}) {
  const nav = useNavigate();
  const [selected, setSelected] = useState([]);

  // ✅ bind unlock namespace
  const { t, i18n } = useTranslation("unlock");

  useEffect(() => {
    if (!open) return;
    setSelected(Array.isArray(initialSelected) ? initialSelected : []);
  }, [open, initialSelected]);

  const total = useMemo(() => {
    const set = new Set(selected);
    return (items || []).reduce(
      (sum, it) => (set.has(it.k) ? sum + (it.price || 0) : sum),
      0
    );
  }, [items, selected]);

  if (!open) return null;

  const canAct = !!landId && selected.length > 0;
  const locale = i18n.language === "th" ? "th-TH" : "en-US";

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
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ===== Header ===== */}
        <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
          <div>
            <div style={{ fontWeight: 900, fontSize: 18 }}>
              {t("title")}
            </div>
            <div style={{ opacity: 0.65, marginTop: 2 }}>
              {t("subtitle")}
            </div>

            {landId ? (
              <div style={{ opacity: 0.6, marginTop: 6, fontSize: 12 }}>
                {t("picker.landId", { id: landId })}
              </div>
            ) : (
              <div style={{ opacity: 0.6, marginTop: 6, fontSize: 12 }}>
                * {t("picker.noLandId")}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onCancel?.();
            }}
            aria-label={t("picker.aria.close")}
            style={{
              width: 36,
              height: 36,
              borderRadius: 999,
              border: "1px solid #ddd",
              background: "#fff",
              fontWeight: 900,
              cursor: "pointer",
            }}
          >
            ×
          </button>
        </div>

        {/* ===== Items ===== */}
        <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
          {(items || []).map((it) => {
            const checked = selected.includes(it.k);
            return (
              <button
                key={it.k}
                type="button"
                onClick={() =>
                  setSelected((prev) =>
                    prev.includes(it.k)
                      ? prev.filter((x) => x !== it.k)
                      : [...prev, it.k]
                  )
                }
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "12px 14px",
                  borderRadius: 14,
                  border: "1px solid #e8e8e8",
                  background: "#fff",
                }}
              >
                <div style={{ display: "flex", gap: 12 }}>
                  <div style={{ fontSize: 20 }}>{it.icon}</div>
                  <div>
                    <div style={{ fontWeight: 900 }}>{it.label}</div>
                    <div style={{ opacity: 0.7, fontSize: 13 }}>
                      {(it.price || 0).toLocaleString(locale)}{" "}
                      {t("picker.priceUnit")}
                    </div>
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

        {/* ===== Footer ===== */}
        <div
          style={{
            marginTop: 14,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div style={{ fontWeight: 900 }}>
            {t("picker.total", {
              total: total.toLocaleString(locale),
            })}
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={onCancel}
              style={{
                height: 40,
                padding: "0 18px",
                borderRadius: 999,
                border: "2px solid #118e44",
                background: "#fff",
                fontWeight: 900,
              }}
            >
              {t("picker.action.cancel")}
            </button>

            <button
              type="button"
              disabled={!canAct}
              onClick={() => {
                if (!canAct) return;
                const r = addToCart({ landId, selectedFields: selected });
                if (r?.ok) nav("/cart");
              }}
              style={{
                height: 40,
                padding: "0 18px",
                borderRadius: 999,
                border: "2px solid #118e44",
                background: "#fff",
                fontWeight: 900,
                opacity: canAct ? 1 : 0.6,
              }}
            >
              {t("picker.action.addToCart")}
            </button>

            <button
              type="button"
              disabled={!selected.length}
              onClick={() => onConfirm?.({ selected })}
              style={{
                height: 40,
                padding: "0 18px",
                borderRadius: 999,
                border: 0,
                background: "#118e44",
                color: "#fff",
                fontWeight: 900,
                opacity: selected.length ? 1 : 0.6,
              }}
            >
              {t("picker.action.pay")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

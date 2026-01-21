// src/pages/PayModal/components/PaymentMethodDropdown.jsx
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

export default function PaymentMethodDropdown({
  value,
  options = [],
  onChange,
  disabled,
}) {
  const { t } = useTranslation("payment");
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const selected = options.find((o) => o.key === value) || null;

  /* ---------------------------
     close on outside click
  ---------------------------- */
  useEffect(() => {
    const onClick = (e) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  /* ---------------------------
     close on ESC
  ---------------------------- */
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="pm-dd" ref={ref}>
      <button
        type="button"
        className={`pm-dd-btn ${open ? "is-open" : ""} ${
          disabled ? "is-disabled" : ""
        }`}
        onClick={() => !disabled && setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <div className="pm-dd-main">
          <div
            className={`pm-dd-label ${selected ? "" : "is-placeholder"}`}
          >
            {selected
              ? t(`method.${selected.key}`)
              : t("placeholder.selectMethod")}
          </div>

          <div className="pm-dd-sub">
            {selected
              ? t(`note.${selected.key}`, { defaultValue: "" })
              : t("placeholder.selectMethodHint")}
          </div>
        </div>

        <div className="pm-dd-icon">▾</div>
      </button>

      {open && !disabled && (
        <div className="pm-dd-menu" role="listbox">
          {options.map((o) => {
            const active = o.key === value;
            return (
              <button
                key={o.key}
                type="button"
                role="option"
                aria-selected={active}
                className={`pm-dd-item ${active ? "is-active" : ""}`}
                onClick={() => {
                  onChange(o.key);
                  setOpen(false);
                }}
              >
                <div className="pm-dd-item-title">
                  {t(`method.${o.key}`)}
                </div>
                <div className="pm-dd-item-desc">
                  {t(`note.${o.key}`, { defaultValue: "" })}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

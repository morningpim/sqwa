// src/pages/PayModal/components/PaymentMethodDropdown.jsx
import React, { useEffect, useRef, useState } from "react";

export default function PaymentMethodDropdown({ value, options, onChange, disabled }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const selected = options.find((o) => o.key === value) || null;

  useEffect(() => {
    const onClick = (e) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="pm-dd" ref={ref}>
      <button
        type="button"
        className={`pm-dd-btn ${open ? "is-open" : ""} ${disabled ? "is-disabled" : ""}`}
        onClick={() => !disabled && setOpen((v) => !v)}
      >
        <div className="pm-dd-main">
          <div className={`pm-dd-label ${selected ? "" : "is-placeholder"}`}>
            {selected ? selected.title : "— กรุณาเลือกวิธีชำระเงิน —"}
          </div>
          <div className="pm-dd-sub">
            {selected ? selected.desc : "เลือกช่องทางชำระเงินก่อนกดชำระเงิน"}
          </div>
        </div>
        <div className="pm-dd-icon">▾</div>
      </button>

      {open && !disabled && (
        <div className="pm-dd-menu">
          {options.map((o) => {
            const active = o.key === value;
            return (
              <button
                key={o.key}
                type="button"
                className={`pm-dd-item ${active ? "is-active" : ""}`}
                onClick={() => {
                  onChange(o.key);
                  setOpen(false);
                }}
              >
                <div className="pm-dd-item-title">{o.title}</div>
                <div className="pm-dd-item-desc">{o.desc}</div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// src/pages/Cart/components/PaymentMethodDropdown.jsx
import React from "react";

/**
 * Custom Dropdown (เปิดรายการเอง)
 * props:
 * - value: string
 * - options: [{key,title,desc}]
 * - onChange: (key) => void
 * - disabled: boolean
 */
export default function PaymentMethodDropdown({ value, options, onChange, disabled }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);

  const selected = options.find((o) => o.key === value) || null;

  React.useEffect(() => {
    const onDocClick = (e) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  React.useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="pm-dd" ref={ref}>
      <button
        type="button"
        className={`pm-dd-btn ${open ? "is-open" : ""} ${disabled ? "is-disabled" : ""}`}
        onClick={() => !disabled && setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <div className="pm-dd-main">
          <div className={`pm-dd-label ${selected ? "" : "is-placeholder"}`}>
            {selected ? selected.title : "— กรุณาเลือกวิธีชำระเงิน —"}
          </div>
          <div className="pm-dd-sub">{selected ? selected.desc : "เลือกช่องทางชำระเงินก่อนกดไปชำระเงิน"}</div>
        </div>

        <div className="pm-dd-icon" aria-hidden="true">
          ▾
        </div>
      </button>

      {open && !disabled && (
        <div className="pm-dd-menu" role="listbox">
          {options.map((o) => {
            const active = o.key === value;
            return (
              <button
                key={o.key}
                type="button"
                className={`pm-dd-item ${active ? "is-active" : ""}`}
                role="option"
                aria-selected={active}
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

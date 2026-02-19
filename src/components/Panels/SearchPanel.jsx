import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

export default function SearchPanel({ open, onClose, onSearch }) {
  const { t } = useTranslation("common");
  const [q, setQ] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 0);
  }, [open]);

  if (!open) return null;

  const handleSubmit = () => {
    const text = q.trim();
    if (!text) return;
    onSearch?.(text);
  };

  return (
    <div
      className="search-pop"
      role="dialog"
      aria-label={t("search.title")}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="search-pop-head">
        <div className="search-pop-title">{t("search.title")}</div>

        <button
          className="search-pop-close"
          type="button"
          onClick={onClose}
          aria-label={t("close")}
        >
          ×
        </button>
      </div>

      <div className="search-pop-body">
        <div className="search-pop-row">
          <input
            ref={inputRef}
            className="search-pop-input"
            placeholder={t("search.placeholder")}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSubmit();
              if (e.key === "Escape") onClose?.();
            }}
          />

          <button
            className="search-pop-btn"
            type="button"
            onClick={handleSubmit}
          >
            {t("search.button")}
          </button>
        </div>

        <div className="search-pop-hint">
          {t("search.hint")}
        </div>
      </div>
    </div>
  );
}

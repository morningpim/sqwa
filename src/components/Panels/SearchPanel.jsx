import React, { useEffect, useRef, useState } from "react";

export default function SearchPanel({ open, onClose, onSearch }) {
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
    <div className="search-pop" onMouseDown={(e) => e.stopPropagation()}>
      <div className="search-pop-head">
        <div className="search-pop-title">ค้นหา</div>
        <button className="search-pop-close" type="button" onClick={onClose}>×</button>
      </div>

      <div className="search-pop-body">
        <div className="search-pop-row">
          <input
            ref={inputRef}
            className="search-pop-input"
            placeholder="พิมพ์ชื่อสถานที่ หรือ 13.7563, 100.5018"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSubmit();
              if (e.key === "Escape") onClose?.();
            }}
          />
          <button className="search-pop-btn" type="button" onClick={handleSubmit}>
            ค้นหา
          </button>
        </div>

        <div className="search-pop-hint">
        </div>
      </div>
    </div>
  );
}

// src/components/map/InvestorRecommendPanel.jsx
import React, { useMemo } from "react";
import "../../css/InvestorRecommendPanel.css";

function toNum(v) {
  const n = Number(String(v ?? "").replace(/,/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function fmtMoney(v) {
  const n = toNum(v);
  return n ? n.toLocaleString("th-TH") : "0";
}

function fmtSqw(v) {
  const n = Math.max(0, Math.floor(toNum(v)));
  return n ? n.toLocaleString("th-TH") : "0";
}

export default function InvestorRecommendPanel({ lands = [], onFocus }) {
  const count = Array.isArray(lands) ? lands.length : 0;

  const items = useMemo(() => {
    return (Array.isArray(lands) ? lands : []).map((l) => ({
      id: l.id,
      title:
        l?.owner ||
        (l?.agent ? `${l.agent} (นายหน้า)` : "") ||
        l?.title ||
        "ไม่ระบุชื่อ",
      size: l?.size,
      totalPrice: l?.totalPrice,
      address: l?.address || l?.province || "",
      thumb: l?.images?.[0] || l?.image || "",
    }));
  }, [lands]);

  return (
    <aside className="inv-panel">
      <div className="inv-head">
        <div>
          <div className="inv-title">รายการแนะนำที่ดิน</div>
          <div className="inv-sub">พบ {count} แปลงที่เหมาะกับโปรไฟล์นักลงทุน</div>
        </div>
      </div>

      <div className="inv-list">
        {items.length ? (
          items.map((it) => (
            <div key={String(it.id)} className="inv-item">
              <div className="inv-thumb">
                {it.thumb ? <img src={it.thumb} alt="" /> : <div className="inv-thumb-ph" />}
              </div>

              <div className="inv-body">
                <div className="inv-name">{it.title}</div>
                {it.address ? <div className="inv-addr">{it.address}</div> : null}

                <div className="inv-meta">
                  <div><span className="m">ขนาด</span> <b>{fmtSqw(it.size)} ตร.วา</b></div>
                  <div><span className="m">ราคา</span> <b>{fmtMoney(it.totalPrice)} บ.</b></div>
                </div>

                <div className="inv-actions">
                  <button type="button" className="inv-btn" onClick={() => onFocus?.({ id: it.id })}>
                    ดูบนแผนที่
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="inv-empty">ยังไม่พบรายการแนะนำ</div>
        )}
      </div>
    </aside>
  );
}

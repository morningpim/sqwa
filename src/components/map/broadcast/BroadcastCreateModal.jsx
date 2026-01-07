// src/components/map/broadcast/BroadcastCreateModal.jsx
import React, { useMemo, useState } from "react";
import "./broadcast.css";

import { getNextMWFDates } from "./broadcastScheduler";
import { createCampaign, makeLandTitle } from "./broadcastHelpers";

export default function BroadcastCreateModal({
  open,
  onClose,
  land,
  createdByRole, // "admin" | "consignor"
  createdByUserId,
  mode, // "buy_sell" | "consignment"
  intent, // "seller" | "investor" | null
  defaultFeatured = false,
  defaultPriceTHB = 0,
}) {
  const dates = useMemo(() => getNextMWFDates(10, new Date()), []);
  const [scheduleDate, setScheduleDate] = useState(dates[0] || "");
  const [web, setWeb] = useState(true);
  const [lineAds, setLineAds] = useState(true);
  const [featured, setFeatured] = useState(!!defaultFeatured);
  const [priceTHB, setPriceTHB] = useState(defaultPriceTHB);

  const title = useMemo(() => (land ? makeLandTitle(land) : ""), [land]);

  if (!open) return null;

  const isConsignor = createdByRole === "consignor";
  const finalPrice = isConsignor ? 100 : Number(priceTHB || 0);

  return (
    <div className="bc-mask" onMouseDown={onClose}>
      <div className="bc-modal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="bc-head">
          <div>
            <div className="bc-title">
              {isConsignor ? "Broadcast 100 บาท (ขายฝาก)" : "สร้าง Broadcast (Admin)"}
            </div>
            <div className="bc-sub">{land?.id ? `เลือกที่ดิน: ${title}` : "ยังไม่ได้เลือกที่ดิน"}</div>
          </div>

          <div className="bc-head-actions">
            <button className="bc-btn" type="button" onClick={onClose}>
              ปิด
            </button>
          </div>
        </div>

        <div className="bc-body">
          <div className="bc-form">
            <div className="bc-field">
              <label>ช่องทาง</label>
              <div className="bc-checks">
                <label className="bc-check">
                  <input type="checkbox" checked={web} onChange={(e) => setWeb(e.target.checked)} />
                  Web Broadcast
                </label>
                <label className="bc-check">
                  <input type="checkbox" checked={lineAds} onChange={(e) => setLineAds(e.target.checked)} />
                  LINE Ads (Queue)
                </label>
              </div>
            </div>

            <div className="bc-field">
              <label>วันบอร์ดแคส (จ / พ / ศ)</label>
              <select value={scheduleDate} onChange={(e) => setScheduleDate(e.target.value)}>
                {dates.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
              <div className="bc-hint">ระบบจะ publish อัตโนมัติเมื่อถึงวันบอร์ดแคส</div>
            </div>

            <div className="bc-field">
              <label>ความเด่น</label>
              <div className="bc-checks">
                <label className="bc-check">
                  <input
                    type="checkbox"
                    checked={featured}
                    onChange={(e) => setFeatured(e.target.checked)}
                    disabled={isConsignor} // ผู้ขายฝากเป็น featured อยู่แล้ว
                  />
                  เด่น (Featured)
                </label>
              </div>
              {isConsignor && <div className="bc-hint">ผู้ขายฝาก: บังคับเป็น “เด่น” ราคา 100 บาท</div>}
            </div>

            {!isConsignor && (
              <div className="bc-field">
                <label>ราคา (บาท)</label>
                <input value={priceTHB} onChange={(e) => setPriceTHB(e.target.value)} placeholder="0" />
                <div className="bc-hint">Admin อาจตั้งเป็น 0 ได้</div>
              </div>
            )}

            <div className="bc-actions-row">
              <button
                className="bc-btn primary"
                type="button"
                onClick={() => {
                  if (!land?.id) {
                    alert("กรุณาเลือกที่ดินก่อน");
                    return;
                  }

                  // “จ่ายเงิน” (MVP)
                  if (isConsignor) {
                    const ok = window.confirm("ยืนยันชำระ 100 บาท เพื่อทำ Broadcast (MVP จำลองการจ่าย)?");
                    if (!ok) return;
                  }

                  const r = createCampaign({
                    land,
                    mode,
                    channels: { web, lineAds },
                    scheduleDate,
                    createdByRole: createdByRole,
                    createdByUserId,
                    highlight: isConsignor ? "featured" : featured ? "featured" : "normal",
                    priceTHB: finalPrice,
                    intent,
                  });

                  if (!r.ok) {
                    alert(`สร้างไม่สำเร็จ: ${r.reason}`);
                    return;
                  }

                  alert("สร้างแคมเปญสำเร็จ ✅");
                  onClose?.();
                }}
              >
                {isConsignor ? "ชำระ 100 บาท + สร้าง" : "สร้างแคมเปญ"}
              </button>

              <button className="bc-btn" type="button" onClick={onClose}>
                ยกเลิก
              </button>
            </div>

            <div className="bc-note">
              * LINE Ads: ระบบจะสร้าง “Queue” เพื่อให้ Admin คัดลอกลิงก์/ข้อความไปตั้งใน LINE Ads Platform
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

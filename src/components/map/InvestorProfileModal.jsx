// src/components/map/InvestorProfileModal.jsx
import React, { useEffect, useMemo, useState } from "react";
import "../../css/InvestorProfileModal.css";
import { loadInvestorProfile, saveInvestorProfile } from "../../utils/investorProfile";

function Card({ title, options, value, onChange }) {
  return (
    <div className="ip-card">
      <div className="ip-card-title">{title}</div>
      <div className="ip-options">
        {options.map((o) => {
          const active = value === o.value;
          return (
            <button
              key={o.value}
              type="button"
              className={`ip-option ${active ? "active" : ""}`}
              onClick={() => onChange(o.value)}
            >
              {o.label}
              {o.sub ? <span className="ip-sub">{o.sub}</span> : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function InvestorProfileModal({ open, onClose, onDone }) {
  const [model, setModel] = useState(() => loadInvestorProfile());

  useEffect(() => {
    if (!open) return;
    setModel(loadInvestorProfile());
  }, [open]);

  const canSubmit = useMemo(() => {
    return !!model?.goal && !!model?.gis && !!model?.budget;
  }, [model]);

  if (!open) return null;

  return (
    <div className="ip-backdrop" role="dialog" aria-modal="true">
      <div className="ip-modal">
        <div className="ip-head">
          <div>
            <div className="ip-title">แบบประเมินนักลงทุน</div>
            <div className="ip-subtitle">(SQW Investor Profile)</div>
          </div>

          <button className="ip-close" type="button" onClick={onClose} title="ปิด">
            ✕
          </button>
        </div>

        <div className="ip-grid">
          <Card
            title="ข้อที่ 1: กลยุทธ์การทำกำไรที่คุณคาดหวัง?"
            value={model.goal}
            onChange={(v) => setModel((p) => ({ ...p, goal: v }))}
            options={[
              { value: "flipping", label: "เก็งกำไรระยะสั้น (Flipping)" },
              { value: "capital_gain", label: "ถือครองระยะยาว (Capital Gain)" },
              { value: "passive_income", label: "รายได้สม่ำเสมอ (Passive Income)" },
            ]}
          />

          <Card
            title="ข้อที่ 2: ปัจจัยเชิงพื้นที่ (GIS) ใดที่คุณให้ความสำคัญที่สุด?"
            value={model.gis}
            onChange={(v) => setModel((p) => ({ ...p, gis: v }))}
            options={[
              { value: "infra", label: "โครงสร้างพื้นฐาน: ใกล้รถไฟฟ้า/ทางด่วน" },
              { value: "zoning", label: "ผังเมือง/ข้อกำหนดอสังหา (GIS ของ SQW)" },
              { value: "price_history", label: "ประวัติราคา: วิเคราะห์ราคาซื้อขายย้อนหลัง" },
            ]}
          />

          <Card
            title="ข้อที่ 3: แผนงบประมาณสำหรับการลงทุน?"
            value={model.budget}
            onChange={(v) => setModel((p) => ({ ...p, budget: v }))}
            options={[
              { value: "low", label: "รายย่อย: ไม่เกิน 5 ล้านบาท" },
              { value: "mid", label: "ระดับกลาง: 5 – 30 ล้านบาท" },
              { value: "high", label: "ระดับสถาบัน: 50 ล้านบาทขึ้นไป" },
            ]}
          />
        </div>

        <div className="ip-foot">
          <button
            type="button"
            className="ip-btn ghost"
            onClick={() => setModel(loadInvestorProfile())}
          >
            รีเซ็ตจากที่บันทึกไว้
          </button>

          <button
            type="button"
            className="ip-btn primary"
            disabled={!canSubmit}
            onClick={() => {
              saveInvestorProfile(model);
              onDone?.();
            }}
          >
            ดูผลลัพธ์
          </button>
        </div>
      </div>
    </div>
  );
}

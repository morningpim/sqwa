import React from "react";
import "../../css/FilterPanel.css";

export default function FilterPanel({
  open,
  onClose,
  value = {},
  onChange,
  onApply,
  onClear,
}) {
  if (!open) return null;

  const update = (patch) => onChange({ ...value, ...patch });

  return (
    <div className="filter-panel" role="dialog" aria-label="ตัวกรอง">
      <div className="filter-card">
        {/* Header */}
        <div className="filter-header">
          <div className="filter-title">ตัวกรอง</div>

          <button
            className="filter-close"
            type="button"
            onClick={onClose}
            aria-label="close"
          >
            ×
          </button>
        </div>

        {/* Body (scroll) */}
        <div className="filter-body">
          {/* จังหวัด */}
          <div className="filter-field span-2">
            <label className="filter-label">จังหวัด</label>
            <select
              className="filter-input"
              value={value.province || ""}
              onChange={(e) => update({ province: e.target.value })}
            >
              <option value="">ทั้งหมด</option>
              <option value="bangkok">กรุงเทพมหานคร</option>
              <option value="chiangmai">เชียงใหม่</option>
              <option value="chonburi">ชลบุรี</option>
              <option value="phuket">ภูเก็ต</option>
            </select>
          </div>

          {/* ประเภทที่ดิน */}
          <div className="filter-field span-2">
            <label className="filter-label">ประเภทที่ดิน</label>
            <select
              className="filter-input"
              value={value.landType || ""}
              onChange={(e) => update({ landType: e.target.value })}
            >
              <option value="">ทั้งหมด</option>
              <option value="chanote">โฉนด</option>
              <option value="nor_sor_3">นส.3 / นส.3ก</option>
            </select>
          </div>

          {/* ขนาดถนน */}
          <div className="filter-field span-2">
            <label className="filter-label">ขนาดถนน</label>
            <select
              className="filter-input"
              value={value.roadSize || ""}
              onChange={(e) => update({ roadSize: e.target.value })}
            >
              <option value="">ทั้งหมด</option>
              <option value="4">4 เมตร</option>
              <option value="6">6 เมตร</option>
              <option value="8">8 เมตร</option>
              <option value="10">10 เมตรขึ้นไป</option>
            </select>
          </div>

          {/* ขนาดพื้นที่ (ตร.วา) */}
          <div className="filter-field span-2">
            <label className="filter-label">ขนาดพื้นที่ (ตร.วา)</label>
            <div className="pair-row">
              <input
                type="number"
                className="filter-input"
                placeholder="ต่ำสุด"
                value={value.areaSqwMin || ""}
                onChange={(e) => update({ areaSqwMin: e.target.value })}
              />
              <input
                type="number"
                className="filter-input"
                placeholder="สูงสุด"
                value={value.areaSqwMax || ""}
                onChange={(e) => update({ areaSqwMax: e.target.value })}
              />
            </div>
          </div>

          {/* ขนาดพื้นที่ (ไร่) */}
          <div className="filter-field span-2">
            <label className="filter-label">ขนาดพื้นที่ (ไร่)</label>
            <div className="pair-row">
              <input
                type="number"
                className="filter-input"
                placeholder="ต่ำสุด"
                value={value.areaRaiMin || ""}
                onChange={(e) => update({ areaRaiMin: e.target.value })}
              />
              <input
                type="number"
                className="filter-input"
                placeholder="สูงสุด"
                value={value.areaRaiMax || ""}
                onChange={(e) => update({ areaRaiMax: e.target.value })}
              />
            </div>
          </div>

          {/* ช่วงราคา (บาท : ตร.วา) */}
          <div className="filter-field span-2">
            <label className="filter-label">ช่วงราคา (บาท : ตร.วา)</label>
            <div className="pair-row">
              <input
                type="number"
                className="filter-input"
                placeholder="ต่ำสุด"
                value={value.priceSqwMin || ""}
                onChange={(e) => update({ priceSqwMin: e.target.value })}
              />
              <input
                type="number"
                className="filter-input"
                placeholder="สูงสุด"
                value={value.priceSqwMax || ""}
                onChange={(e) => update({ priceSqwMax: e.target.value })}
              />
            </div>
          </div>

          {/* ช่วงราคา (รวมทั้งแปลง) */}
          <div className="filter-field span-2">
            <label className="filter-label">ช่วงราคา (รวมทั้งแปลง)</label>
            <div className="pair-row">
              <input
                type="number"
                className="filter-input"
                placeholder="ต่ำสุด"
                value={value.totalMin || ""}
                onChange={(e) => update({ totalMin: e.target.value })}
              />
              <input
                type="number"
                className="filter-input"
                placeholder="สูงสุด"
                value={value.totalMax || ""}
                onChange={(e) => update({ totalMax: e.target.value })}
              />
            </div>
          </div>

          {/* หน้ากว้างที่ดิน (เมตร) */}
          <div className="filter-field span-2">
            <label className="filter-label">หน้ากว้างที่ดิน (เมตร)</label>
            <div className="pair-row">
              <input
                type="number"
                className="filter-input"
                placeholder="ต่ำสุด"
                value={value.frontMin || ""}
                onChange={(e) => update({ frontMin: e.target.value })}
              />
              <input
                type="number"
                className="filter-input"
                placeholder="สูงสุด"
                value={value.frontMax || ""}
                onChange={(e) => update({ frontMax: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Footer (ไม่เลื่อน) */}
        <div className="filter-footer">
          <button className="btn-outline" type="button" onClick={onClear}>
            ล้าง
          </button>
          <button className="btn-primary" type="button" onClick={onApply}>
            ใช้ตัวกรอง
          </button>
        </div>
      </div>
    </div>
  );
}

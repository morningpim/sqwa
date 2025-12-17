import React from "react";
import "../../css/FilterPanel.css";

export default function FilterPanel({
  open,
  onClose,
  value,
  onChange,
  onApply,
  onClear,
}) {
  if (!open) return null;

  const update = (patch) => onChange({ ...value, ...patch });

  return (
    <div className="filter-panel" role="dialog" aria-label="ตัวกรอง">
      <div className="filter-card">
        <div className="filter-header">
          <div className="filter-title">ตัวกรอง</div>
          <button className="filter-close" type="button" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className="filter-body">
          {/* จังหวัด */}
          <div className="filter-field">
            <label className="filter-label">จังหวัด</label>
            <select
              className="filter-select"
              value={value.province}
              onChange={(e) => update({ province: e.target.value })}
            >
              <option value="">ทั้งหมด</option>
              <option value="กรุงเทพมหานคร">กรุงเทพมหานคร</option>
              <option value="นนทบุรี">นนทบุรี</option>
              <option value="ปทุมธานี">ปทุมธานี</option>
            </select>
          </div>

          {/* อำเภอ */}
          <div className="filter-field">
            <label className="filter-label">อำเภอ</label>
            <select
              className="filter-select"
              value={value.district}
              onChange={(e) => update({ district: e.target.value })}
            >
              <option value="">ทั้งหมด</option>
              <option value="อำเภอ 1">อำเภอ 1</option>
              <option value="อำเภอ 2">อำเภอ 2</option>
            </select>
          </div>

          {/* ประเภท */}
          <div className="filter-field">
            <label className="filter-label">ประเภท</label>
            <select
              className="filter-select"
              value={value.type}
              onChange={(e) => update({ type: e.target.value })}
            >
              <option value="">ทั้งหมด</option>
              <option value="ซื้อ">ซื้อ</option>
              <option value="เช่า">เช่า</option>
            </select>
          </div>

          {/* ราคาต่ำสุด/สูงสุด */}
          <div className="filter-grid-2">
            <div className="filter-field">
              <label className="filter-label">ช่วงราคา (รวมทั้งหมด)</label>
              <input
                className="filter-input"
                placeholder="ต่ำสุด"
                value={value.priceMin}
                onChange={(e) => update({ priceMin: e.target.value })}
              />
            </div>
            <div className="filter-field">
              <label className="filter-label">&nbsp;</label>
              <input
                className="filter-input"
                placeholder="สูงสุด"
                value={value.priceMax}
                onChange={(e) => update({ priceMax: e.target.value })}
              />
            </div>
          </div>

          {/* หน้ากว้าง/ลึก */}
          <div className="filter-grid-2">
            <div className="filter-field">
              <label className="filter-label">หน้ากว้างที่ดิน (เมตร)</label>
              <input
                className="filter-input"
                placeholder="ต่ำสุด"
                value={value.frontMin}
                onChange={(e) => update({ frontMin: e.target.value })}
              />
            </div>
            <div className="filter-field">
              <label className="filter-label">&nbsp;</label>
              <input
                className="filter-input"
                placeholder="สูงสุด"
                value={value.frontMax}
                onChange={(e) => update({ frontMax: e.target.value })}
              />
            </div>
          </div>

          <div className="filter-grid-2">
            <div className="filter-field">
              <label className="filter-label">ความลึกที่ดิน (เมตร)</label>
              <input
                className="filter-input"
                placeholder="ต่ำสุด"
                value={value.depthMin}
                onChange={(e) => update({ depthMin: e.target.value })}
              />
            </div>
            <div className="filter-field">
              <label className="filter-label">&nbsp;</label>
              <input
                className="filter-input"
                placeholder="สูงสุด"
                value={value.depthMax}
                onChange={(e) => update({ depthMax: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div className="filter-actions">
          <button className="filter-btn primary" type="button" onClick={onApply}>
            ใช้ตัวกรอง
          </button>
          <button className="filter-btn ghost" type="button" onClick={onClear}>
            ล้าง
          </button>
        </div>
      </div>
    </div>
  );
}

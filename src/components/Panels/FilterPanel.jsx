import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import "../../css/FilterPanel.css";

export default function FilterPanel({
  open,
  onClose,
  value = {},
  onChange,
  onApply,
  onClear,
  mode,
}) {
  const { t } = useTranslation("common");

  const isEia = mode === "eia";

  useEffect(() => {
    const onEsc = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [onClose]);

  if (!open) return null;

  const update = (patch) => onChange?.({ ...value, ...patch });

  return (
    <div className="filter-panel" role="dialog" aria-label={t("filter.title")}>
      <div className="filter-card">

        {/* HEADER */}
        <div className="filter-header">
          <div className="filter-title">{t("filter.title")}</div>
          <button className="filter-close" onClick={onClose}>×</button>
        </div>

        {/* BODY */}
        <div className="filter-body">

          {/* ================= LAND MODE ================= */}
          {!isEia && (
            <>
              {/* Province */}
              <Field label={t("filter.province")}>
                <select
                  value={value.province || ""}
                  onChange={(e) => update({ province: e.target.value })}
                >
                  <option value="">{t("filter.all")}</option>
                  <option value="bangkok">{t("province.bangkok")}</option>
                  <option value="chiangmai">{t("province.chiangmai")}</option>
                  <option value="chonburi">{t("province.chonburi")}</option>
                  <option value="phuket">{t("province.phuket")}</option>
                </select>
              </Field>

              {/* Land Type */}
              <Field label={t("filter.landType")}>
                <select
                  value={value.landType || ""}
                  onChange={(e) => update({ landType: e.target.value })}
                >
                  <option value="">{t("filter.all")}</option>
                  <option value="chanote">{t("landType.chanote")}</option>
                  <option value="nor_sor_3">{t("landType.norSor3")}</option>
                </select>
              </Field>

              {/* Road Size */}
              <Field label={t("filter.roadSize")}>
                <select
                  value={value.roadSize || ""}
                  onChange={(e) => update({ roadSize: e.target.value })}
                >
                  <option value="">{t("filter.all")}</option>
                  <option value="4">4 {t("unit.meter")}</option>
                  <option value="6">6 {t("unit.meter")}</option>
                  <option value="8">8 {t("unit.meter")}</option>
                  <option value="10">10+ {t("unit.meter")}</option>
                </select>
              </Field>

              {/* Area Rai */}
              <Range
                label={t("filter.areaRai")}
                min={value.areaRaiMin}
                max={value.areaRaiMax}
                onMin={(v) => update({ areaRaiMin: v })}
                onMax={(v) => update({ areaRaiMax: v })}
              />

              {/* Area Sqw */}
              <Range
                label={t("filter.areaSqw")}
                min={value.areaSqwMin}
                max={value.areaSqwMax}
                onMin={(v) => update({ areaSqwMin: v })}
                onMax={(v) => update({ areaSqwMax: v })}
              />

              {/* Price / sqw */}
              <Range
                label={t("filter.priceSqw")}
                min={value.priceSqwMin}
                max={value.priceSqwMax}
                onMin={(v) => update({ priceSqwMin: v })}
                onMax={(v) => update({ priceSqwMax: v })}
              />

              {/* Total price */}
              <Range
                label={t("filter.totalPrice")}
                min={value.totalMin}
                max={value.totalMax}
                onMin={(v) => update({ totalMin: v })}
                onMax={(v) => update({ totalMax: v })}
              />

              {/* Front width */}
              <Range
                label={t("filter.frontWidth")}
                min={value.frontMin}
                max={value.frontMax}
                onMin={(v) => update({ frontMin: v })}
                onMax={(v) => update({ frontMax: v })}
              />
            </>
          )}

          {/* ================= EIA MODE ================= */}
          {isEia && (
            <>
              <Field label="ภูมิภาค">
                <select
                  value={value.region || ""}
                  onChange={(e) => update({ region: e.target.value })}
                >
                  <option value="">ทั้งหมด</option>
                  <option value="north">เหนือ</option>
                  <option value="central">กลาง</option>
                  <option value="east">ตะวันออก</option>
                  <option value="south">ใต้</option>
                </select>
              </Field>

              <Field label="จังหวัด">
                <input
                  value={value.province || ""}
                  onChange={(e) => update({ province: e.target.value })}
                />
              </Field>

              <Field label="ประเภทโครงการ">
                <select
                  value={value.projectType || ""}
                  onChange={(e) => update({ projectType: e.target.value })}
                >
                  <option value="">ทั้งหมด</option>
                  <option value="residential">ที่อยู่อาศัย</option>
                  <option value="commercial">พาณิชยกรรม</option>
                  <option value="industrial">อุตสาหกรรม</option>
                </select>
              </Field>

              <Field label="สถานะโครงการ">
                <select
                  value={value.projectStatus || ""}
                  onChange={(e) => update({ projectStatus: e.target.value })}
                >
                  <option value="">ทั้งหมด</option>
                  <option value="planning">กำลังวางแผน</option>
                  <option value="approved">อนุมัติแล้ว</option>
                  <option value="construction">กำลังก่อสร้าง</option>
                  <option value="completed">เสร็จแล้ว</option>
                </select>
              </Field>

              <Range
                label="ขนาดที่ดิน (ไร่)"
                min={value.landRaiMin}
                max={value.landRaiMax}
                onMin={(v) => update({ landRaiMin: v })}
                onMax={(v) => update({ landRaiMax: v })}
              />

              <Range
                label="พื้นที่ใช้สอย (ตรว.)"
                min={value.usableMin}
                max={value.usableMax}
                onMin={(v) => update({ usableMin: v })}
                onMax={(v) => update({ usableMax: v })}
              />

              <Range
                label="มูลค่าโครงการ (ล้านบาท)"
                min={value.projectValueMin}
                max={value.projectValueMax}
                onMin={(v) => update({ projectValueMin: v })}
                onMax={(v) => update({ projectValueMax: v })}
              />
            </>
          )}

        </div>

        {/* FOOTER */}
        <div className="filter-footer">
          <button className="btn-outline" onClick={()=>{ onClear?.(); onClose?.(); }}>
            {t("filter.clear")}
          </button>

          <button className="btn-primary" onClick={onApply}>
            {t("filter.apply")}
          </button>
        </div>

      </div>
    </div>
  );
}


/* ================= reusable components ================= */

function Field({ label, children }) {
  return (
    <div className="filter-field span-2">
      <label className="filter-label">{label}</label>
      <div className="filter-input">{children}</div>
    </div>
  );
}

function Range({ label, min, max, onMin, onMax }) {
  return (
    <div className="filter-field span-2">
      <label className="filter-label">{label}</label>
      <div className="pair-row">
        <input type="number" placeholder="ต่ำสุด" value={min || ""} onChange={(e)=>onMin(e.target.value)} />
        <input type="number" placeholder="สูงสุด" value={max || ""} onChange={(e)=>onMax(e.target.value)} />
      </div>
    </div>
  );
}

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
}) {
  const { t } = useTranslation("common");

  useEffect(() => {
    const onEsc = (e) => {
      if (e.key === "Escape") onClose?.();
    };

    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [onClose]);

  if (!open) return null;

  const update = (patch) => onChange?.({ ...value, ...patch });

  return (
    <div className="filter-panel" role="dialog" aria-label={t("filter.title")}>
      <div className="filter-card">
        
        {/* Header */}
        <div className="filter-header">
          <div className="filter-title">{t("filter.title")}</div>

          <button
            className="filter-close"
            type="button"
            onClick={onClose}
            aria-label={t("close")}
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="filter-body">

          {/* Province */}
          <div className="filter-field span-2">
            <label className="filter-label">{t("filter.province")}</label>
            <select
              className="filter-input"
              value={value.province || ""}
              onChange={(e) => update({ province: e.target.value })}
            >
              <option value="">{t("filter.all")}</option>
              <option value="bangkok">{t("province.bangkok")}</option>
              <option value="chiangmai">{t("province.chiangmai")}</option>
              <option value="chonburi">{t("province.chonburi")}</option>
              <option value="phuket">{t("province.phuket")}</option>
            </select>
          </div>

          {/* Land Type */}
          <div className="filter-field span-2">
            <label className="filter-label">{t("filter.landType")}</label>
            <select
              className="filter-input"
              value={value.landType || ""}
              onChange={(e) => update({ landType: e.target.value })}
            >
              <option value="">{t("filter.all")}</option>
              <option value="chanote">{t("landType.chanote")}</option>
              <option value="nor_sor_3">{t("landType.norSor3")}</option>
            </select>
          </div>

          {/* Road Size */}
          <div className="filter-field span-2">
            <label className="filter-label">{t("filter.roadSize")}</label>
            <select
              className="filter-input"
              value={value.roadSize || ""}
              onChange={(e) => update({ roadSize: e.target.value })}
            >
              <option value="">{t("filter.all")}</option>
              <option value="4">4 {t("unit.meter")}</option>
              <option value="6">6 {t("unit.meter")}</option>
              <option value="8">8 {t("unit.meter")}</option>
              <option value="10">10+ {t("unit.meter")}</option>
            </select>
          </div>

          {/* Area sqw */}
          <div className="filter-field span-2">
            <label className="filter-label">{t("filter.areaSqw")}</label>
            <div className="pair-row">
              <input
                type="number"
                className="filter-input"
                placeholder={t("filter.min")}
                value={value.areaSqwMin || ""}
                onChange={(e) => update({ areaSqwMin: e.target.value })}
              />
              <input
                type="number"
                className="filter-input"
                placeholder={t("filter.max")}
                value={value.areaSqwMax || ""}
                onChange={(e) => update({ areaSqwMax: e.target.value })}
              />
            </div>
          </div>

          {/* Area rai */}
          <div className="filter-field span-2">
            <label className="filter-label">{t("filter.areaRai")}</label>
            <div className="pair-row">
              <input
                type="number"
                className="filter-input"
                placeholder={t("filter.min")}
                value={value.areaRaiMin || ""}
                onChange={(e) => update({ areaRaiMin: e.target.value })}
              />
              <input
                type="number"
                className="filter-input"
                placeholder={t("filter.max")}
                value={value.areaRaiMax || ""}
                onChange={(e) => update({ areaRaiMax: e.target.value })}
              />
            </div>
          </div>

          {/* Price / sqw */}
          <div className="filter-field span-2">
            <label className="filter-label">{t("filter.priceSqw")}</label>
            <div className="pair-row">
              <input
                type="number"
                className="filter-input"
                placeholder={t("filter.min")}
                value={value.priceSqwMin || ""}
                onChange={(e) => update({ priceSqwMin: e.target.value })}
              />
              <input
                type="number"
                className="filter-input"
                placeholder={t("filter.max")}
                value={value.priceSqwMax || ""}
                onChange={(e) => update({ priceSqwMax: e.target.value })}
              />
            </div>
          </div>

          {/* Total price */}
          <div className="filter-field span-2">
            <label className="filter-label">{t("filter.totalPrice")}</label>
            <div className="pair-row">
              <input
                type="number"
                className="filter-input"
                placeholder={t("filter.min")}
                value={value.totalMin || ""}
                onChange={(e) => update({ totalMin: e.target.value })}
              />
              <input
                type="number"
                className="filter-input"
                placeholder={t("filter.max")}
                value={value.totalMax || ""}
                onChange={(e) => update({ totalMax: e.target.value })}
              />
            </div>
          </div>

          {/* Front width */}
          <div className="filter-field span-2">
            <label className="filter-label">{t("filter.frontWidth")}</label>
            <div className="pair-row">
              <input
                type="number"
                className="filter-input"
                placeholder={t("filter.min")}
                value={value.frontMin || ""}
                onChange={(e) => update({ frontMin: e.target.value })}
              />
              <input
                type="number"
                className="filter-input"
                placeholder={t("filter.max")}
                value={value.frontMax || ""}
                onChange={(e) => update({ frontMax: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="filter-footer">
          <button
            className="ds-btn ds-btn-outline ds-btn-sm"
            type="button"
            onClick={() => {
              onClear?.();
              onClose?.();
            }}
          >
            {t("filter.clear")}
          </button>

          <button
            className="ds-btn ds-btn-primary ds-btn-sm"
            type="button"
            onClick={() => onApply?.()}
          >
            {t("filter.apply")}
          </button>
        </div>
      </div>
    </div>
  );
}

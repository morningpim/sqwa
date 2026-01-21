// src/components/map/DashboardStats.jsx
import React, { useMemo } from "react";
import "../../css/DashboardStats.css";
import { parseNum } from "../../utils/number";
import { sqwToRNW } from "../../utils/landUnit";
import { useTranslation } from "react-i18next";

function toNum(v) {
  return parseNum(v) ?? 0;
}

function formatInt(v) {
  return Math.round(v ?? 0).toLocaleString("th-TH");
}

export default function DashboardStats({ lands = [] }) {
  // ✅ bind dashboard namespace
  const { t } = useTranslation("dashboard");
  const { t: tCommon } = useTranslation("common");

  const stats = useMemo(() => {
    const list = Array.isArray(lands) ? lands : [];

    const totalListings = list.length;

    const totalSqw = list.reduce((sum, land) => {
      return sum + toNum(land?.size);
    }, 0);

    const totalValue = list.reduce((sum, land) => {
      const totalPrice = toNum(land?.totalPrice);
      if (totalPrice > 0) return sum + totalPrice;

      const sizeSqw = toNum(land?.size);
      const pricePerSqw = toNum(land?.price);
      if (sizeSqw > 0 && pricePerSqw > 0) {
        return sum + sizeSqw * pricePerSqw;
      }
      return sum;
    }, 0);

    return { totalListings, totalSqw, totalValue };
  }, [lands]);

  const rnw = sqwToRNW(stats.totalSqw);

  return (
    <div className="dashbar">
      {/* จำนวนประกาศ */}
      <div className="dashcard">
        <div className="dashlabel">{t("totalLand")}</div>
        <div className="dashvalue">{formatInt(stats.totalListings)}</div>
        <div className="dashunit">{t("unit.listing")}</div>
      </div>

      {/* จำนวนรวม (ไร่/งาน/วา) */}
      <div className="dashcard">
        <div className="dashlabel">{t("totalArea")}</div>
        <div className="dashvalue">{rnw.rai.toLocaleString("th-TH")}</div>
        <div className="dashunit">
          {rnw.ngan} {t("unit.ngan")} {rnw.wah} {t("unit.wah")}
        </div>
      </div>

      {/* มูลค่ารวม */}
      <div className="dashcard">
        <div className="dashlabel">{t("totalValue")}</div>
        <div className="dashvalue">{formatInt(stats.totalValue)}</div>
        <div className="dashunit">{tCommon("unit.baht")}</div>
      </div>
    </div>
  );
}

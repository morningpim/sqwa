// src/components/map/DashboardStats.jsx
import React, { useMemo } from "react";
import "../../css/DashboardStats.css";

function toNumberSafe(v) {
  const n = Number(String(v ?? "").replace(/,/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function formatInt(v) {
  return Math.round(toNumberSafe(v)).toLocaleString("th-TH");
}

/* =========================
   แปลง ตร.วา → ไร่/งาน/วา
========================= */
function sqwToRNW(totalSqw) {
  const sqw = Math.max(0, Math.floor(toNumberSafe(totalSqw)));

  const rai = Math.floor(sqw / 400);
  const rem1 = sqw % 400;

  const ngan = Math.floor(rem1 / 100);
  const wah = rem1 % 100;

  return { rai, ngan, wah };
}

export default function DashboardStats({ lands = [] }) {
  const stats = useMemo(() => {
    const list = Array.isArray(lands) ? lands : [];

    // จำนวนประกาศ
    const totalListings = list.length;

    // รวมพื้นที่ทั้งหมด (ตร.วา)
    const totalSqw = list.reduce((sum, land) => {
      return sum + toNumberSafe(land?.size);
    }, 0);

    // รวมมูลค่า (บาท)
    const totalValue = list.reduce((sum, land) => {
      const totalPrice = toNumberSafe(land?.totalPrice);
      if (totalPrice > 0) return sum + totalPrice;

      const sizeSqw = toNumberSafe(land?.size);
      const pricePerSqw = toNumberSafe(land?.price);
      if (sizeSqw > 0 && pricePerSqw > 0) {
        return sum + sizeSqw * pricePerSqw;
      }
      return sum;
    }, 0);

    return {
      totalListings,
      totalSqw,
      totalValue,
    };
  }, [lands]);

  const rnw = sqwToRNW(stats.totalSqw);

  return (
    <div className="dashbar">
      {/* จำนวนประกาศ */}
      <div className="dashcard">
        <div className="dashlabel">ที่ดินทั้งหมด</div>
        <div className="dashvalue">{formatInt(stats.totalListings)}</div>
        <div className="dashunit">ประกาศ</div>
      </div>

      {/* จำนวนรวม (ไร่/งาน/วา) */}
      <div className="dashcard">
        <div className="dashlabel">จำนวนรวม</div>
        <div className="dashvalue">
          {rnw.rai.toLocaleString("th-TH")}
        </div>
        <div className="dashunit">
          ไร่ {rnw.ngan} งาน {rnw.wah} วา
        </div>
      </div>

      {/* มูลค่ารวม */}
      <div className="dashcard">
        <div className="dashlabel">มูลค่าที่ดินรวม</div>
        <div className="dashvalue">{formatInt(stats.totalValue)}</div>
        <div className="dashunit">บาท</div>
      </div>
    </div>
  );
}

// src/components/map/recommend/recommendLands.js

function toNum(v) {
  const n = Number(String(v ?? "").replace(/,/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function inBudget(totalPrice, budget) {
  const p = toNum(totalPrice);

  if (budget === "low") return p > 0 && p <= 5_000_000;
  if (budget === "mid") return p >= 5_000_000 && p <= 30_000_000;
  if (budget === "high") return p >= 50_000_000;
  return true;
}

function scoreByGoal(land, goal) {
  // mock scoring (ยังไม่มี data ลึก ๆ ก็ให้คะแนนจาก “size/price” เบา ๆ)
  const size = toNum(land?.size);
  const total = toNum(land?.totalPrice);
  const perSqw = size > 0 ? total / size : 0;

  if (goal === "flipping") {
    // ชอบราคาต่อ ตร.วา ต่ำ + ขนาดไม่ใหญ่เกิน
    return (perSqw ? 1 / perSqw : 0) * 1_000_000 + (size ? 2000 / size : 0);
  }
  if (goal === "capital_gain") {
    // ชอบแปลงกลาง ๆ/ใหญ่ขึ้นมาหน่อย
    return size * 0.5 + (perSqw ? 200000 / perSqw : 0);
  }
  if (goal === "passive_income") {
    // ชอบแปลงใหญ่ขึ้นนิดและราคาไม่โหด
    return size * 0.3 + (perSqw ? 300000 / perSqw : 0);
  }
  return 0;
}

function scoreByGisPreference(land, gis) {
  // ถ้าคุณมี tag ใน land เช่น land.tags = ["near_transit","zoning_ok"] จะช่วยมาก
  const tags = Array.isArray(land?.tags) ? land.tags : [];

  const has = (t) => tags.includes(t);

  if (gis === "infra") return (has("near_transit") ? 50 : 0) + (has("near_highway") ? 30 : 0);
  if (gis === "zoning") return (has("zoning_ok") ? 60 : 0) + (has("no_restrict") ? 30 : 0);
  if (gis === "price_history") return (has("price_history_good") ? 60 : 0) + (has("undervalued") ? 40 : 0);

  return 0;
}

/**
 * recommendLands(lands, profile)
 * return: array lands sorted by (score desc)
 */
export function recommendLands(lands = [], profile) {
  const goal = profile?.goal || "flipping";
  const gis = profile?.gis || "infra";
  const budget = profile?.budget || "low";

  const filtered = (Array.isArray(lands) ? lands : [])
    .filter((l) => inBudget(l?.totalPrice, budget))
    .map((l) => {
      const s1 = scoreByGoal(l, goal);
      const s2 = scoreByGisPreference(l, gis);
      const score = s1 + s2;

      return {
        ...l,
        __score: score,
        __reason: { goal, gis, budget },
      };
    })
    .sort((a, b) => (b.__score || 0) - (a.__score || 0));

  // จำกัดจำนวนให้สวย ๆ ตาม UI
  return filtered.slice(0, 15);
}

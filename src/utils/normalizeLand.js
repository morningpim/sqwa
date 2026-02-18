// src/utils/normalizeLand.js

const normalizeDate = (v) => {
  if (!v) return null;

  if (typeof v === "string") {
    const parsed = new Date(v);
    if (!Number.isNaN(parsed.getTime())) return parsed.toLocaleDateString("th-TH");
    return v;
  }

  if (typeof v?.toDate === "function") {
    const d = v.toDate();
    return d?.toLocaleDateString?.("th-TH") ?? null;
  }

  if (typeof v?.seconds === "number") {
    const d = new Date(v.seconds * 1000);
    return d.toLocaleDateString("th-TH");
  }

  if (v instanceof Date) return v.toLocaleDateString("th-TH");
  return null;
};

export function normalizeLand(input = {}) {
  const pick = (...vals) => {
    for (const v of vals) {
      if (v !== undefined && v !== null && String(v).trim() !== "") return v;
    }
    return null;
  };

  const toNumber = (v) => {
    if (v == null) return null;
    const n = Number(String(v).replace(/,/g, ""));
    return Number.isFinite(n) ? n : null;
  };

  const fmt = (v, digits = null) => {
    const n = toNumber(v);
    if (n == null) return null;
    return n.toLocaleString("en-US", digits ? { maximumFractionDigits: digits } : undefined);
  };

  const sqwToRNW = (sqw) => {
    const n = toNumber(sqw);
    if (n == null) return null;
    const rai = Math.floor(n / 400);
    const rem = n % 400;
    const ngan = Math.floor(rem / 100);
    const wah = rem % 100;
    return `${rai}-${ngan}-${wah}`;
  };

  const id = pick(input.id, input.landId, input._id, input.docId, "");

  return {
    id,
    owner: pick(
      input.owner,
      input.ownerName,
      input.contactOwner,
      input.agent,
      "คุณปาลิส (นายหน้า)"
    ),
    updatedAt:
      normalizeDate(
        pick(input.updatedAt, input.createdAt)
      ) ?? "-",
    area:
      fmt(pick(input.area, input.size, input.sqw)) ??
      String(pick(input.area, input.size) ?? "-"),
    raw:
      pick(input.rnw, input.raiNganWah) ??
      sqwToRNW(pick(input.area, input.size)) ??
      "-",
    frontage: fmt(pick(input.frontage, input.frontWidth, input.width)) ?? "-",
    roadWidth: fmt(pick(input.roadWidth, input.road, input.roadSize)) ?? "-",
    pricePerWa: fmt(pick(input.pricePerWa, input.pricePerSqw, input.price), 2) ?? "-",
    totalPrice: fmt(pick(input.totalPrice, input.total)) ?? "-",

    contactOwner: pick(input.contactOwner, input.ownerContact, ""),
    broker: pick(input.agent, input.broker, ""),
    phone: pick(input.phone, input.tel, ""),
    line: pick(input.lineId, input.line, ""),
    frame: pick(input.landFrame, input.frame, ""),
    chanote: pick(input.deedInformation, input.deed, ""),

    lat: pick(input.lat, input.latitude),
    lng: pick(input.lng, input.longitude),

    images: Array.isArray(input.images)
    ? input.images
    : Array.isArray(input.image)
    ? input.image
    : [],
  };
}

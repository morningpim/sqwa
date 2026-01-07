// src/components/map/broadcast/broadcastHelpers.js
import { addCampaign } from "../../../utils/broadcastLocal";
import { addLineAdsQueue } from "../../../utils/lineAdsQueueLocal";
import { reserveSlot } from "./broadcastSlots";
import { getNextMWFDates } from "./broadcastScheduler";

function trim(v) {
  return String(v ?? "").trim();
}

function num(v) {
  const n = Number(String(v ?? "").replace(/,/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function rnwFromSqw(sizeSqw) {
  const total = Math.max(0, Math.floor(num(sizeSqw)));
  const rai = Math.floor(total / 400);
  const rem1 = total % 400;
  const ngan = Math.floor(rem1 / 100);
  const wah = rem1 % 100;
  return { rai, ngan, wah };
}

export function formatRNWFromSqw(sizeSqw) {
  const { rai, ngan, wah } = rnwFromSqw(sizeSqw);
  return `${rai} ไร่ ${ngan} งาน ${wah} วา`;
}

export function makeLandTitle(land) {
  const owner = trim(land?.owner);
  const agent = trim(land?.agent);
  const who = owner || (agent ? `${agent} (นายหน้า)` : "ไม่ระบุ");
  const size = formatRNWFromSqw(land?.size);
  const total = num(land?.totalPrice);
  const price = num(land?.price);
  const money = total > 0 ? total.toLocaleString("th-TH") : (price > 0 ? `~${price.toLocaleString("th-TH")}/ตร.วา` : "-");
  return `${who} • ${size} • ${money}`;
}

export function makeUtmLink({ landId, mode, intent, channel }) {
  const base = `/map?mode=${encodeURIComponent(mode || "buy")}`;
  const intentQs = intent ? `&intent=${encodeURIComponent(intent)}` : "";
  const focus = landId ? `&focus=${encodeURIComponent(landId)}` : "";
  const utm = `&utm_source=${encodeURIComponent(channel)}&utm_medium=broadcast&utm_campaign=${encodeURIComponent(mode || "buy")}`;
  return `${base}${intentQs}${focus}${utm}`;
}

/**
 * createCampaign:
 * - channels: { web: boolean, lineAds: boolean }
 * - scheduleDate: YYYY-MM-DD
 * - createdByRole: "admin" | "consignor"
 * - mode: "buy_sell" | "consignment"
 */
export function createCampaign({
  land,
  mode,
  channels,
  scheduleDate,
  createdByRole,
  createdByUserId,
  highlight,
  priceTHB,
  intent, // seller/investor
}) {
  if (!land?.id) return { ok: false, reason: "NO_LAND" };
  if (!channels?.web && !channels?.lineAds) return { ok: false, reason: "NO_CHANNEL" };
  if (!scheduleDate) return { ok: false, reason: "NO_DATE" };

  // reserve slots per channel
  const need = [];
  if (channels.web) need.push({ channel: "web", mode });
  if (channels.lineAds) need.push({ channel: "line_ads", mode });

  for (const n of need) {
    const r = reserveSlot({ date: scheduleDate, channel: n.channel, mode });
    if (!r.ok) return { ok: false, reason: `FULL_${n.channel}` };
  }

  const nowISO = new Date().toISOString();
  const id = `BC_${Date.now()}`;

  const campaign = {
    id,
    landId: String(land.id),
    landSnapshot: {
      id: String(land.id),
      owner: land?.owner ?? "",
      agent: land?.agent ?? "",
      size: String(land?.size ?? ""),
      price: String(land?.price ?? ""),
      totalPrice: String(land?.totalPrice ?? ""),
      location: land?.location ?? null,
      images: Array.isArray(land?.images) ? land.images : [],
    },

    mode, // buy_sell | consignment
    intent: intent || null,

    channels: { web: !!channels.web, lineAds: !!channels.lineAds },
    highlight: highlight || "normal", // normal | featured
    priceTHB: Number(priceTHB || 0),

    scheduleDate,
    status: createdByRole === "consignor" && Number(priceTHB || 0) > 0 ? "paid" : "scheduled",

    createdByRole,
    createdByUserId: createdByUserId || null,

    createdAt: nowISO,
    updatedAt: nowISO,
  };

  addCampaign(campaign);

  // LINE Ads queue
  if (channels.lineAds) {
    const qid = `LAP_${Date.now()}`;
    const utmLink = makeUtmLink({
      landId: land.id,
      mode: "sell", // โฆษณาควรเข้าหน้า sell/buy ตามที่คุณใช้จริง
      intent: intent || undefined,
      channel: "line_ads",
    });

    addLineAdsQueue({
      id: qid,
      campaignId: id,
      landId: String(land.id),
      mode,
      status: "queued",
      utmLink,
      creativeText: makeLandTitle(land),
      createdAt: nowISO,
    });
  }

  return { ok: true, id };
}

export function pickNextAvailableMWF({ mode, channels }) {
  const dates = getNextMWFDates(12, new Date());
  for (const d of dates) {
    // (ง่าย ๆ) ให้ createCampaign เป็นคน reserve ถ้าเต็มจะ fail
    // ตรงนี้แค่คืนวันแรก ๆ ไปก่อน
    return d;
  }
  return null;
}

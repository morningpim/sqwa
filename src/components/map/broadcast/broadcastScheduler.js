// src/components/map/broadcast/broadcastScheduler.js
import { readAllCampaigns, writeAllCampaigns } from "../../../utils/broadcastLocal";

export const BROADCAST_DAYS = ["MON", "WED", "FRI"]; // จ/พ/ศ (อิงตาม weekday)

function pad2(n) {
  return String(n).padStart(2, "0");
}

export function todayISO(d = new Date()) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

export function weekdayKey(d = new Date()) {
  const w = d.getDay(); // 0 Sun
  if (w === 1) return "MON";
  if (w === 3) return "WED";
  if (w === 5) return "FRI";
  if (w === 2) return "TUE";
  if (w === 4) return "THU";
  if (w === 6) return "SAT";
  return "SUN";
}

export function isBroadcastDay(d = new Date()) {
  return BROADCAST_DAYS.includes(weekdayKey(d));
}

export function getNextMWFDates(count = 6, from = new Date()) {
  const out = [];
  const d = new Date(from);
  d.setHours(0, 0, 0, 0);
  // เริ่มจากวันถัดไปถ้าวันนี้ผ่านแล้ว (ยังให้เลือกวันนี้ได้ถ้าเป็น MWF)
  for (let i = 0; out.length < count && i < 90; i++) {
    if (i > 0) d.setDate(d.getDate() + 1);
    if (isBroadcastDay(d)) out.push(todayISO(d));
  }
  return out;
}

/**
 * publishDueCampaigns:
 * - ถ้าวันนี้เป็น จ/พ/ศ -> campaign ที่ scheduleDate <= วันนี้ และ status=schedule/paid -> publish
 * - ถ้าไม่ใช่วัน broadcast -> ไม่ publish (คงสถานะไว้)
 */
export function publishDueCampaigns() {
  const now = new Date();
  if (!isBroadcastDay(now)) return { published: 0 };

  const today = todayISO(now);
  const all = readAllCampaigns();

  let changed = false;
  let published = 0;

  const next = all.map((c) => {
    const status = String(c?.status || "");
    const scheduleDate = String(c?.scheduleDate || "");
    if (!scheduleDate) return c;

    const due = scheduleDate <= today;
    const eligible = status === "scheduled" || status === "paid";

    if (due && eligible) {
      changed = true;
      published++;
      return { ...c, status: "published", publishedAt: new Date().toISOString() };
    }
    return c;
  });

  if (changed) writeAllCampaigns(next);
  return { published };
}

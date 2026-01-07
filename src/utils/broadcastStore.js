// src/utils/broadcastStore.js
const KEY = "sqw_broadcast_campaigns_v1";
const EVT = "sqw-broadcast-changed";

function safeParse(json, fallback) {
  try {
    const v = JSON.parse(json);
    return Array.isArray(v) ? v : fallback;
  } catch {
    return fallback;
  }
}

export function readAllBroadcasts() {
  return safeParse(localStorage.getItem(KEY) || "[]", []);
}

export function writeAllBroadcasts(list) {
  localStorage.setItem(KEY, JSON.stringify(list || []));
  window.dispatchEvent(new Event(EVT));
}

export function addBroadcastCampaign(c) {
  const all = readAllBroadcasts();
  writeAllBroadcasts([c, ...all]);
  return c;
}

export function updateBroadcastCampaign(id, patch) {
  const all = readAllBroadcasts();
  const next = all.map((x) => (String(x.id) === String(id) ? { ...x, ...patch } : x));
  writeAllBroadcasts(next);
}

export function removeBroadcastCampaign(id) {
  const all = readAllBroadcasts();
  writeAllBroadcasts(all.filter((x) => String(x.id) !== String(id)));
}

export function subscribeBroadcastChanged(cb) {
  const handler = () => cb?.();
  window.addEventListener(EVT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(EVT, handler);
    window.removeEventListener("storage", handler);
  };
}

/** helper: seed ข้อมูลตัวอย่างครั้งเดียว */
export function seedBroadcastIfEmpty() {
  const all = readAllBroadcasts();
  if (all.length) return;

  const now = new Date().toISOString();
  writeAllBroadcasts([
    {
      id: "BC_" + Date.now(),
      title: "ข่าวประชาสัมพันธ์ (ตัวอย่าง)",
      message: "ประกาศที่ดินเด่นประจำสัปดาห์",
      landIds: [],
      channel: ["SQW_WEB"],
      mode: "buy_sell", // buy_sell | consignment
      schedule: { days: ["MON", "WED", "FRI"], time: "09:00" },
      status: "scheduled", // draft | scheduled | sent | disabled
      createdByRole: "admin",
      priceTHB: 0,
      createdAt: now,
      updatedAt: now,
      sentAt: null,
    },
  ]);
}

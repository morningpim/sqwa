// src/components/map/broadcast/broadcastSlots.js
const KEY = "sqw_broadcast_slots_v1";
const EVT = "sqw-broadcast-slots-changed";

const DEFAULT_CAPACITY = {
  web: 10,
  line_ads: 5,
};

function safeParse(json, fallback) {
  try {
    const v = JSON.parse(json);
    return v && typeof v === "object" ? v : fallback;
  } catch {
    return fallback;
  }
}

function readAll() {
  return safeParse(localStorage.getItem(KEY) || "{}", {});
}

function writeAll(obj) {
  localStorage.setItem(KEY, JSON.stringify(obj || {}));
  window.dispatchEvent(new Event(EVT));
}

function slotKey({ date, channel, mode }) {
  return `${date}__${channel}__${mode}`;
}

export function getSlotInfo({ date, channel, mode }) {
  const all = readAll();
  const k = slotKey({ date, channel, mode });
  const v = all[k] || null;

  const capacity = v?.capacity ?? DEFAULT_CAPACITY[channel] ?? 5;
  const used = v?.used ?? 0;
  return { key: k, date, channel, mode, capacity, used, left: Math.max(0, capacity - used) };
}

export function canReserveSlot({ date, channel, mode }) {
  const info = getSlotInfo({ date, channel, mode });
  return info.left > 0;
}

export function reserveSlot({ date, channel, mode }) {
  const all = readAll();
  const k = slotKey({ date, channel, mode });

  const cur = all[k] || { capacity: DEFAULT_CAPACITY[channel] ?? 5, used: 0 };
  const left = (cur.capacity ?? 0) - (cur.used ?? 0);
  if (left <= 0) return { ok: false, reason: "FULL" };

  const next = { ...cur, used: (cur.used ?? 0) + 1 };
  all[k] = next;
  writeAll(all);

  return { ok: true, info: getSlotInfo({ date, channel, mode }) };
}

export function releaseSlot({ date, channel, mode }) {
  const all = readAll();
  const k = slotKey({ date, channel, mode });

  const cur = all[k];
  if (!cur) return;

  all[k] = { ...cur, used: Math.max(0, (cur.used ?? 0) - 1) };
  writeAll(all);
}

export function subscribeSlotsChanged(cb) {
  const handler = () => cb?.();
  window.addEventListener(EVT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(EVT, handler);
    window.removeEventListener("storage", handler);
  };
}

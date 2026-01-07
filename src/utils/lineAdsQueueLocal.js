// src/utils/lineAdsQueueLocal.js
const KEY = "sqw_line_ads_queue_v1";
const EVT = "sqw-line-ads-queue-changed";

function safeParse(json, fallback) {
  try {
    const v = JSON.parse(json);
    return Array.isArray(v) ? v : fallback;
  } catch {
    return fallback;
  }
}

export function readAllLineAdsQueue() {
  return safeParse(localStorage.getItem(KEY) || "[]", []);
}

export function writeAllLineAdsQueue(list) {
  localStorage.setItem(KEY, JSON.stringify(list || []));
  window.dispatchEvent(new Event(EVT));
}

export function addLineAdsQueue(item) {
  const all = readAllLineAdsQueue();
  writeAllLineAdsQueue([item, ...all]);
  return item;
}

export function updateLineAdsQueue(id, patch) {
  const all = readAllLineAdsQueue();
  const next = all.map((x) => (String(x.id) === String(id) ? { ...x, ...patch } : x));
  writeAllLineAdsQueue(next);
}

export function removeLineAdsQueue(id) {
  const all = readAllLineAdsQueue();
  writeAllLineAdsQueue(all.filter((x) => String(x.id) !== String(id)));
}

export function subscribeLineAdsQueueChanged(cb) {
  const handler = () => cb?.();
  window.addEventListener(EVT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(EVT, handler);
    window.removeEventListener("storage", handler);
  };
}

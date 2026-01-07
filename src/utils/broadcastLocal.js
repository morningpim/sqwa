// src/utils/broadcastLocal.js
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

export function readAllCampaigns() {
  return safeParse(localStorage.getItem(KEY) || "[]", []);
}

export function writeAllCampaigns(list) {
  localStorage.setItem(KEY, JSON.stringify(list || []));
  window.dispatchEvent(new Event(EVT));
}

export function addCampaign(c) {
  const all = readAllCampaigns();
  writeAllCampaigns([c, ...all]);
  return c;
}

export function updateCampaign(id, patch) {
  const all = readAllCampaigns();
  const next = all.map((x) => (String(x.id) === String(id) ? { ...x, ...patch } : x));
  writeAllCampaigns(next);
}

export function removeCampaign(id) {
  const all = readAllCampaigns();
  writeAllCampaigns(all.filter((x) => String(x.id) !== String(id)));
}

export function subscribeCampaignsChanged(cb) {
  const handler = () => cb?.();
  window.addEventListener(EVT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(EVT, handler);
    window.removeEventListener("storage", handler);
  };
}

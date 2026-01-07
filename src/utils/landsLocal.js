// src/utils/landsLocal.js
const KEY = "sqw_lands_v1";
const EVT = "sqw-lands-changed";

function safeParse(json, fallback) {
  try {
    const v = JSON.parse(json);
    return Array.isArray(v) ? v : fallback;
  } catch {
    return fallback;
  }
}

function nowISO() {
  return new Date().toISOString();
}

export function readAllLands() {
  return safeParse(localStorage.getItem(KEY) || "[]", []);
}

export function writeAllLands(list) {
  localStorage.setItem(KEY, JSON.stringify(list || []));
  window.dispatchEvent(new Event(EVT));
}

export function addLand(land) {
  const all = readAllLands();
  const t = nowISO();

  // ✅ สร้าง createdAt ครั้งแรก
  const normalized = {
    ...land,
    createdAt: land?.createdAt || t,
    updatedAt: land?.updatedAt || t,
  };

  writeAllLands([normalized, ...all]);
  return normalized;
}

export function updateLand(id, patch) {
  const all = readAllLands();
  const t = nowISO();

  const next = all.map((x) => {
    if (String(x.id) !== String(id)) return x;

    // ✅ createdAt ต้องคงเดิมเสมอ (นับ 14 วันจากวันสร้างประกาศ)
    const createdAt = x?.createdAt || patch?.createdAt || t;

    return {
      ...x,
      ...patch,
      createdAt,
      updatedAt: patch?.updatedAt || t,
    };
  });

  writeAllLands(next);
}

export function removeLand(id) {
  const all = readAllLands();
  writeAllLands(all.filter((x) => String(x.id) !== String(id)));
}

export function subscribeLandsChanged(cb) {
  const handler = () => cb?.();
  window.addEventListener(EVT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(EVT, handler);
    window.removeEventListener("storage", handler);
  };
}

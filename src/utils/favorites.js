// src/utils/favorites.js
const FAV_KEY = "sqw_favorites_v1";
const FAV_EVENT = "sqw-fav-changed";

function safeParse(json, fallback) {
  try {
    const v = JSON.parse(json);
    return v ?? fallback;
  } catch {
    return fallback;
  }
}

export function readFavorites() {
  const raw = localStorage.getItem(FAV_KEY) || "[]";
  const arr = safeParse(raw, []);
  return Array.isArray(arr) ? arr.filter(Boolean) : [];
}

export function writeFavorites(list) {
  localStorage.setItem(FAV_KEY, JSON.stringify(list || []));
  window.dispatchEvent(new Event(FAV_EVENT));
}

export function removeFavorite(id) {
  const list = readFavorites().filter((x) => String(x?.id) !== String(id));
  writeFavorites(list);
}

export function getFavoriteCount() {
  return readFavorites().length;
}

export function subscribeFavoritesChanged(cb) {
  const on = () => cb?.();
  window.addEventListener(FAV_EVENT, on);
  window.addEventListener("storage", on);
  return () => {
    window.removeEventListener(FAV_EVENT, on);
    window.removeEventListener("storage", on);
  };
}

/** ✅ เพิ่ม: เช็คว่า id นี้ถูก favorite อยู่ไหม */
export function isFavorite(id) {
  if (id == null) return false;
  return readFavorites().some((x) => String(x?.id) === String(id));
}

/**
 * ✅ เพิ่ม: toggle favorite
 * - ถ้ายังไม่มี -> add (payload จะถูกรวมเข้า object)
 * - ถ้ามีแล้ว -> remove
 * - return boolean: สถานะใหม่ (true=เป็น fav แล้ว)
 */
export function toggleFavorite(id, payload = {}) {
  if (id == null) return false;

  const list = readFavorites();
  const exists = list.some((x) => String(x?.id) === String(id));

  if (exists) {
    writeFavorites(list.filter((x) => String(x?.id) !== String(id)));
    return false;
  }

  const item = { id, ...payload };
  writeFavorites([item, ...list]);
  return true;
}

export { FAV_KEY, FAV_EVENT };

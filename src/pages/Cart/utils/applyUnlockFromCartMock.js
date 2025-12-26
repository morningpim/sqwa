// src/pages/Cart/utils/applyUnlockFromCartMock.js
import { loadAccess, saveAccess } from "./accessStorage";
import { todayKeyTH } from "./date";

/**
 * ✅ เตรียมไว้ใช้ตอน mock return (เดี๋ยว backend จะทำแทน)
 * merge unlockedFields ตาม cart และเพิ่ม quotaUsed
 */
export function applyUnlockFromCartMock(cart) {
  const cur = loadAccess();
  const unlockedFields = { ...(cur.unlockedFields || {}) };

  for (const item of cart) {
    const landId = String(item?.landId || "");
    const fields = Array.isArray(item?.selectedFields) ? item.selectedFields : [];
    if (!landId || !fields.length) continue;

    const prev = Array.isArray(unlockedFields[landId]) ? unlockedFields[landId] : [];
    unlockedFields[landId] = Array.from(new Set([...prev, ...fields]));
  }

  const landIds = Array.from(new Set(cart.map((x) => String(x?.landId || "")).filter(Boolean)));
  const used = (cur.quotaUsed || 0) + landIds.length;

  const saved = {
    ...cur,
    dateKey: todayKeyTH(),
    quotaUsed: used,
    unlockedFields,
  };

  saveAccess(saved);
}


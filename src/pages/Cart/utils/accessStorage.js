// src/pages/Cart/utils/accessStorage.js
import { ACCESS_KEY } from "../constants";
import { todayKeyTH } from "./date";

export function loadAccess() {
  try {
    const raw = localStorage.getItem(ACCESS_KEY);
    const data = raw ? JSON.parse(raw) : null;

    const dateKey = todayKeyTH();
    const savedDate = data?.dateKey ?? dateKey;
    const quotaUsed = savedDate === dateKey ? (data?.quotaUsed ?? 0) : 0;

    return {
      dateKey,
      isMember: !!data?.isMember,
      quotaUsed,
      unlockedFields: data?.unlockedFields ?? {},
    };
  } catch {
    return { dateKey: todayKeyTH(), isMember: false, quotaUsed: 0, unlockedFields: {} };
  }
}

export function saveAccess(next) {
  localStorage.setItem(ACCESS_KEY, JSON.stringify(next));
}

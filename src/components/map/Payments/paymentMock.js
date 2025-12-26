const ACCESS_KEY = "sqw_access_v1";

export function todayKeyTH() {
  return new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD
}

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
      unlockedFields: data?.unlockedFields ?? {}, // { [landId]: ["phone","line"] }
    };
  } catch {
    return { dateKey: todayKeyTH(), isMember: false, quotaUsed: 0, unlockedFields: {} };
  }
}

export function saveAccess(next) {
  localStorage.setItem(ACCESS_KEY, JSON.stringify(next));
}

export function confirmUnlockContactMock({ landId, selectedFields = [] }) {
  const cur = loadAccess();

  const unlockedFields = { ...(cur.unlockedFields ?? {}) };
  const prev = Array.isArray(unlockedFields?.[landId]) ? unlockedFields[landId] : [];

  const add = Array.isArray(selectedFields) ? selectedFields : [];
  unlockedFields[landId] = Array.from(new Set([...prev, ...add]));

  const saved = {
    ...cur,
    unlockedFields,
  };

  saveAccess(saved);
  return saved;
}

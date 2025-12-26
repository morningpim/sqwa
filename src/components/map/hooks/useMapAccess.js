import { useCallback, useMemo, useState } from "react";
import { ACCESS_KEY } from "../utils/storageKeys";
import { QUOTA_LIMIT, ALL_UNLOCK_KEYS, ALL_UNLOCK_ITEMS } from "../constants/unlock";

const todayKeyTH = () => new Date().toLocaleDateString("en-CA");

function safeJsonParse(raw, fallback) {
  try {
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function useMapAccess() {
  const loadAccess = useCallback(() => {
    const data = safeJsonParse(localStorage.getItem(ACCESS_KEY), null);

    const dateKey = todayKeyTH();
    const savedDate = data?.dateKey ?? dateKey;
    const quotaUsed = savedDate === dateKey ? (data?.quotaUsed ?? 0) : 0;

    return {
      dateKey,
      isMember: !!data?.isMember,
      quotaUsed,
      unlockedFields: data?.unlockedFields ?? {},
    };
  }, []);

  const saveAccess = useCallback((next) => {
    localStorage.setItem(ACCESS_KEY, JSON.stringify(next));
  }, []);

  const [access, setAccess] = useState(() => loadAccess());

  // ---- Unlock modal state ----
  const [unlockOpen, setUnlockOpen] = useState(false);
  const [unlockLandId, setUnlockLandId] = useState("");

  const unlockedForThisLand = useMemo(() => {
    const landId = String(unlockLandId || "");
    const arr = access?.unlockedFields?.[landId];
    return Array.isArray(arr) ? arr : [];
  }, [access, unlockLandId]);

  const unlockItems = useMemo(() => {
    const unlockedSet = new Set(unlockedForThisLand);
    return ALL_UNLOCK_ITEMS.filter((it) => !unlockedSet.has(it.k));
  }, [unlockedForThisLand]);

  const openUnlockPicker = useCallback(
    (landId) => {
      const id = String(landId || "");
      if (!id) return;

      const cur = loadAccess();
      const arr = cur?.unlockedFields?.[id];
      const unlockedSet = new Set(Array.isArray(arr) ? arr : []);

      const remaining = ALL_UNLOCK_KEYS.filter((k) => !unlockedSet.has(k));

      if (remaining.length === 0) {
        alert("ปลดล็อกข้อมูลครบแล้ว ✅");
        return;
      }

      setUnlockLandId(id);
      setUnlockOpen(true);
    },
    [loadAccess]
  );

  const unlockAllForMember = useCallback(
    (landId) => {
      const id = String(landId || "");
      if (!id) return null;

      const cur = loadAccess();
      if (!cur.isMember) return null;

      if (cur.quotaUsed >= QUOTA_LIMIT) {
        alert(`โควตาการดูข้อมูลวันนี้ครบ ${QUOTA_LIMIT} ครั้งแล้ว`);
        return null;
      }

      const used = cur.quotaUsed + 1;

      const unlockedFields = { ...(cur.unlockedFields ?? {}) };
      unlockedFields[id] = ALL_UNLOCK_KEYS;

      const saved = { dateKey: todayKeyTH(), isMember: true, quotaUsed: used, unlockedFields };
      saveAccess(saved);
      setAccess(saved);
      return saved;
    },
    [loadAccess, saveAccess]
  );

  return {
    // access
    access,
    setAccess,
    loadAccess,
    saveAccess,

    // unlock modal
    unlockOpen,
    setUnlockOpen,
    unlockLandId,
    setUnlockLandId,
    unlockItems,
    openUnlockPicker,
    unlockAllForMember,
  };
}

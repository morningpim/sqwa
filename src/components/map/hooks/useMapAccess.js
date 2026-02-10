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
      if (!id || !access) return;

      const arr = access.unlockedFields?.[id];
      const unlockedSet = new Set(Array.isArray(arr) ? arr : []);

      const remaining = ALL_UNLOCK_KEYS.filter((k) => !unlockedSet.has(k));

      if (remaining.length === 0) {
        alert("ปลดล็อกข้อมูลครบแล้ว ✅");
        return;
      }

      setUnlockLandId(id);
      setUnlockOpen(true);
    },
    [access]
  );

  const unlockAllForMember = useCallback(
    (landId) => {
      const id = String(landId || "");
      if (!id || !access) return null;

      if (!access.isMember) return null;

      if (access.quotaUsed >= QUOTA_LIMIT) {
        alert(`โควตาการดูข้อมูลวันนี้ครบ ${QUOTA_LIMIT} ครั้งแล้ว`);
        return null;
      }

      const used = access.quotaUsed + 1;

      const unlockedFields = { ...(access.unlockedFields ?? {}) };
      unlockedFields[id] = ALL_UNLOCK_KEYS;

      const saved = {
        dateKey: todayKeyTH(),
        isMember: true,
        quotaUsed: used,
        unlockedFields,
      };

      saveAccess(saved);
      setAccess(saved);
      return saved;
    },
    [access, saveAccess]
  );

  const api = useMemo(
  () => ({
    access,
    setAccess,
    loadAccess,
    saveAccess,

    unlockOpen,
    setUnlockOpen,
    unlockLandId,
    setUnlockLandId,
    unlockItems,
    openUnlockPicker,
    unlockAllForMember,
  }),
  [
    access,
    unlockOpen,
    unlockLandId,
    unlockItems,
    loadAccess,
    saveAccess,
    openUnlockPicker,
    unlockAllForMember,
  ]
);

return api;
}
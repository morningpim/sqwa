import { useMemo } from "react";

export function useSelectedLandAccess(selectedLand, access) {
  const selectedLandId = useMemo(() => {
    if (!selectedLand) return "";
    return String(selectedLand?.id ?? selectedLand?.landId ?? "");
  }, [selectedLand]);

  const unlockedFields = useMemo(() => {
    if (!selectedLandId) return [];
    const arr = access?.unlockedFields?.[selectedLandId];
    return Array.isArray(arr) ? arr : [];
  }, [access, selectedLandId]);

  return { selectedLandId, unlockedFields };
}

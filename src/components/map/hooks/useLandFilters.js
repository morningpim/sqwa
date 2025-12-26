// src/components/map/hooks/useLandFilters.js
import { useCallback, useMemo, useState } from "react";
import { parseNum } from "../../../utils/number";
import { normalizeLand } from "../../../utils/land";


/**
 * useLandFilters
 * - เก็บ state: filterOpen, filterValue, filteredLands
 * - มีฟังก์ชัน: applyFilters, resetFilter
 *
 * @param {Object[]} lands ข้อมูลที่ดินทั้งหมด
 * @param {Object} defaultFilter ค่าเริ่มต้นของฟิลเตอร์ (DEFAULT_FILTER)
 */
export function useLandFilters(lands, defaultFilter) {
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterValue, setFilterValue] = useState(() => ({ ...defaultFilter }));
  const [filteredLands, setFilteredLands] = useState(() => lands);

  const resetFilter = useCallback(() => {
    setFilterValue({ ...defaultFilter });
    setFilteredLands(lands);
  }, [defaultFilter, lands]);

  const applyFilters = useCallback(() => {
    const f = filterValue || {};

    // ปิด panel
    setFilterOpen(false);

    const priceMin = parseNum(f.priceSqwMin);
    const priceMax = parseNum(f.priceSqwMax);

    // area: รวมตร.วา + ไร่ (1 ไร่ = 400 ตร.วา)
    const areaMin =
      (parseNum(f.areaSqwMin) ?? 0) + (parseNum(f.areaRaiMin) ?? 0) * 400;

    const hasAreaMax =
      (f.areaSqwMax !== "" && f.areaSqwMax != null) ||
      (f.areaRaiMax !== "" && f.areaRaiMax != null);

    const areaMax = hasAreaMax
      ? (parseNum(f.areaSqwMax) ?? 0) + (parseNum(f.areaRaiMax) ?? 0) * 400
      : null;

    const totalMin = parseNum(f.totalMin);
    const totalMax = parseNum(f.totalMax);

    const frontMin = parseNum(f.frontMin);
    const frontMax = parseNum(f.frontMax);

    const result = lands.filter((item) => {
      const n = normalizeLand(item);

      const okProvince = !f.province || n.province === f.province;
      const okLandType = !f.landType || n.landType === f.landType;

      const okRoad =
        !f.roadSize || (n.roadSize != null && n.roadSize >= Number(f.roadSize));

      const okPrice =
        (priceMin == null || (n.priceSqw != null && n.priceSqw >= priceMin)) &&
        (priceMax == null || (n.priceSqw != null && n.priceSqw <= priceMax));

      const okArea =
        (areaMin === 0 || (n.areaSqw != null && n.areaSqw >= areaMin)) &&
        (areaMax == null || (n.areaSqw != null && n.areaSqw <= areaMax));

      const okTotal =
        (totalMin == null || (n.totalPrice != null && n.totalPrice >= totalMin)) &&
        (totalMax == null || (n.totalPrice != null && n.totalPrice <= totalMax));

      const okFront =
        (frontMin == null || (n.frontWidth != null && n.frontWidth >= frontMin)) &&
        (frontMax == null || (n.frontWidth != null && n.frontWidth <= frontMax));

      return (
        okProvince &&
        okLandType &&
        okRoad &&
        okPrice &&
        okArea &&
        okTotal &&
        okFront
      );
    });

    setFilteredLands(result);
  }, [filterValue, lands]);

  // เผื่ออนาคต lands เปลี่ยน (fetch จริง) ยังไม่ทำ auto-sync เพื่อไม่ให้ reset ทับ user
  const syncedFilteredLands = useMemo(() => filteredLands, [filteredLands]);

  return {
    filterOpen,
    filterValue,
    filteredLands: syncedFilteredLands,

    setFilterOpen,
    setFilterValue,

    applyFilters,
    resetFilter,
  };
}

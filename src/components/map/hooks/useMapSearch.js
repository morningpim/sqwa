import { useCallback } from "react";
import { parseLatLng } from "../utils/geo";

export function useMapSearch(mapObj) {
  return useCallback(
    (q) => {
      const map = mapObj;
      if (!map) {
        console.warn("map not ready");
        return;
      }

      const text = (q ?? "").trim();
      if (!text) return;

      // 1) lat,lng
      const ll = parseLatLng(text);
      if (ll) {
        map.location({ lon: ll.lon, lat: ll.lat }, true);
        map.zoom(16, true);
        return;
      }

      // 2) place name: Longdo ใช้ map.Search.search + bind event 'search'
      const searchObj = map.Search;
      const eventObj = map.Event;

      if (!searchObj || typeof searchObj.search !== "function") {
        console.warn("map.Search.search not found", map);
        alert("ระบบค้นหาไม่พร้อม (ไม่พบ map.Search.search)");
        return;
      }
      if (!eventObj || typeof eventObj.bind !== "function" || typeof eventObj.unbind !== "function") {
        console.warn("map.Event bind/unbind not found", map);
        alert("ระบบค้นหาไม่พร้อม (ไม่พบ map.Event.bind/unbind)");
        return;
      }

      const handler = (result) => {
        try {
          if (result?.meta?.keyword && result.meta.keyword !== text) return;

          const first = result?.data?.[0];
          if (!first) {
            alert("ไม่พบสถานที่");
            return;
          }

          // ✅ Longdo Search result ใช้ lat/lon เป็นหลัก
          const loc =
            (typeof first.location === "function" && first.location()) ||
            first.location ||
            (typeof first.lat === "number" && typeof first.lon === "number"
              ? { lat: first.lat, lon: first.lon }
              : null);

          if (loc) {
            map.location(loc, true);
            map.zoom(16, true);
          } else {
            console.warn("search result but no loc:", first, result);
            alert("ไม่พบสถานที่");
          }
        } finally {
          map.Event.unbind("search", handler);
        }
      };

      eventObj.bind("search", handler);

      // options ใส่ว่าง ๆ ก็ได้ หรือใส่ area/span/limit ได้ตามเอกสาร
      searchObj.search(text, { limit: 1 });
    },
    [mapObj]
  );
}

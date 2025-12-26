import { useCallback } from "react";
import { parseLatLng } from "../utils/geo";

export function useMapSearch(mapObj) {
  return useCallback(
    async (q) => {
      const map = mapObj;
      if (!map) return;

      const text = (q ?? "").trim();
      if (!text) return;

      const ll = parseLatLng(text);
      if (ll) {
        map.location({ lon: ll.lon, lat: ll.lat }, true);
        map.zoom(16, true);
        return;
      }

      try {
        const L = window.longdo;
        const res = await L?.Util?.locationSearch?.(text);
        if (Array.isArray(res) && res[0]?.location) {
          map.location(res[0].location, true);
          map.zoom(16, true);
        }
      } catch (e) {
        console.warn("search failed:", e);
      }
    },
    [mapObj]
  );
}

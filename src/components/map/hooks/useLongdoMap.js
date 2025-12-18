import { useCallback, useRef } from "react";

export function useLongdoMap({ isSatellite, isTraffic }) {
  const mapRef = useRef(null);
  const mapInitedRef = useRef(false);

  const waitForLongdo = useCallback(
    () =>
      new Promise((resolve, reject) => {
        const start = Date.now();
        const tick = () => {
          if (window.longdo && window.longdo.Map) return resolve(true);
          if (Date.now() - start > 12000) return reject(new Error("Longdo script not loaded"));
          requestAnimationFrame(tick);
        };
        tick();
      }),
    []
  );

  const pickFirstLayer = useCallback((...keys) => {
    const L = window.longdo?.Layers;
    if (!L) return null;
    for (const k of keys) if (L[k]) return L[k];
    return null;
  }, []);

  const hideLongdoUi = useCallback((map) => {
    const ui = map?.Ui;
    if (!ui) return;

    const tryHide = (key) => {
      try {
        const obj = ui[key];
        if (obj && typeof obj.visible === "function") obj.visible(false);
      } catch {}
    };

    [
      "Scale",
      "Zoombar",
      "DPad",
      "Toolbar",
      "LayerSelector",
      "Layers",
      "FullScreen",
      "Geolocation",
      "Crosshair",
      "Compass",
      "MiniMap",
    ].forEach(tryHide);
  }, []);

  const applySatellite = useCallback(
    (on) => {
      const map = mapRef.current;
      if (!map || !window.longdo) return;

      try {
        const normal = pickFirstLayer("NORMAL", "ROAD", "BASE") || window.longdo.Layers?.NORMAL;
        const satellite =
          pickFirstLayer("SATELLITE", "SAT", "GOOGLE_SATELLITE", "HYBRID", "SATELLITE_HYBRID") ||
          window.longdo.Layers?.SATELLITE;

        const baseLayer = on ? satellite : normal;
        if (!baseLayer) return;

        if (map.Layers && typeof map.Layers.setBase === "function") return map.Layers.setBase(baseLayer);
        if (map.Layers && typeof map.Layers.set === "function") return map.Layers.set(baseLayer);
      } catch (e) {
        console.warn("applySatellite failed:", e);
      }
    },
    [pickFirstLayer]
  );

  const applyTraffic = useCallback(
    (on) => {
      const map = mapRef.current;
      if (!map || !window.longdo) return;

      try {
        const traffic = pickFirstLayer("TRAFFIC", "TRAFFIC_LAYER") || window.longdo.Layers?.TRAFFIC;
        if (!traffic) return;

        if (on) map.Layers?.add?.(traffic);
        else map.Layers?.remove?.(traffic);
      } catch (e) {
        console.warn("applyTraffic failed:", e);
      }
    },
    [pickFirstLayer]
  );

  const zoomIn = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;
    try {
      map.zoom(map.zoom() + 1, true);
    } catch {}
  }, []);

  const zoomOut = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;
    try {
      map.zoom(map.zoom() - 1, true);
    } catch {}
  }, []);

  const locateMe = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;

    if (!navigator.geolocation) {
      alert("เบราว์เซอร์ไม่รองรับ Geolocation");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;

        try {
          map.location({ lon: longitude, lat: latitude }, true);
          map.zoom(14, true);

          try {
            const mk = new window.longdo.Marker({ lon: longitude, lat: latitude }, { title: "My location" });
            map.Overlays?.add?.(mk);
          } catch {}
        } catch {}
      },
      () => alert("ไม่สามารถเข้าถึงตำแหน่งได้ (ตรวจ permission)"),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  const initMap = useCallback(
    async ({ elId = "map", center = { lon: 100.5018, lat: 13.7563 }, zoom = 10 } = {}) => {
      if (mapInitedRef.current) return mapRef.current;
      mapInitedRef.current = true;

      await waitForLongdo();
      const el = document.getElementById(elId);
      if (!el) throw new Error(`Missing #${elId}`);

      const map = new window.longdo.Map({ placeholder: el });
      mapRef.current = map;

      hideLongdoUi(map);
      map.location(center, true);
      map.zoom(zoom, true);

      applySatellite(isSatellite);
      applyTraffic(isTraffic);

      return map;
    },
    [applySatellite, applyTraffic, hideLongdoUi, isSatellite, isTraffic, waitForLongdo]
  );

  return { mapRef, initMap, applySatellite, applyTraffic, zoomIn, zoomOut, locateMe };
}

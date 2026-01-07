// src/components/map/hooks/useMapBootstrap.js
import { useCallback, useEffect, useState } from "react";
import { useLongdoMap } from "./useLongdoMap";

export function useMapBootstrap({ mode }) {
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  useEffect(() => setShowDisclaimer(true), [mode]);
  const handleAcceptDisclaimer = useCallback(() => setShowDisclaimer(false), []);

  const [openLayerMenu, setOpenLayerMenu] = useState(false);
  const [isSatellite, setIsSatellite] = useState(false);
  const [isTraffic, setIsTraffic] = useState(false);
  const [dolEnabled, setDolEnabled] = useState(true);
  const [dolOpacity, setDolOpacity] = useState(0.35);

  const {
    mapRef,
    initMap,
    applySatellite,
    applyTraffic,
    applyDolVisibility,
    zoomIn,
    zoomOut,
    locateMe,
  } = useLongdoMap({
    isSatellite,
    isTraffic,
    dolEnabled,
    dolOpacity,
  });

  const [mapObj, setMapObj] = useState(null);

  useEffect(() => {
    if (showDisclaimer) {
      setMapObj(null);
      return;
    }

    initMap()
      .then(() => {
        const m = mapRef.current || null;
        setMapObj(m);
        setTimeout(() => {
          try {
            m?.resize?.();
          } catch {}
        }, 0);
      })
      .catch((e) => {
        console.error(e);
        alert("โหลดแผนที่ไม่สำเร็จ: กรุณาเช็ค longdo script/key");
      });
  }, [showDisclaimer, initMap, mapRef]);

  useEffect(() => {
    if (mapObj) applySatellite(isSatellite);
  }, [mapObj, isSatellite, applySatellite]);

  useEffect(() => {
    if (mapObj) applyTraffic(isTraffic);
  }, [mapObj, isTraffic, applyTraffic]);

  useEffect(() => {
    if (mapObj) applyDolVisibility?.(dolEnabled, dolOpacity);
  }, [mapObj, dolEnabled, dolOpacity, applyDolVisibility]);

  return {
    // disclaimer
    showDisclaimer,
    handleAcceptDisclaimer,

    // layers
    openLayerMenu,
    setOpenLayerMenu,
    isSatellite,
    setIsSatellite,
    isTraffic,
    setIsTraffic,
    dolEnabled,
    setDolEnabled,
    dolOpacity,
    setDolOpacity,

    // map
    mapRef,
    mapObj,
    zoomIn,
    zoomOut,
    locateMe,
  };
}

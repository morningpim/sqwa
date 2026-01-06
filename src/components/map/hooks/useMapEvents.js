import { useCallback, useEffect } from "react";

function resolveOverlay(payload) {
  if (!payload) return null;

  // Longdo อาจส่งมาเป็น object หลายรูปแบบ
  return (
    payload.overlay ??
    payload.object ??
    payload.target ??
    payload.data?.overlay ??
    payload.data?.object ??
    payload
  );
}

export function useMapEvents({ mapObj, onOverlayOrMarkerSelect, onMapClickClose, isDrawing }) {
  const handleSelect = useCallback(
    (overlay) => {
      if (!overlay) return;

      // ⭐ กรณี marker / polygon ใส่ __onSelect มา
      if (typeof overlay.__onSelect === "function") {
        overlay.__onSelect();
        return;
      }

      // ⭐ แตก land + loc จาก overlay
      const land = overlay.__land;
      const loc = overlay.__loc;

      if (land && loc) {
        onOverlayOrMarkerSelect?.(land, loc);
      }
    },
    [onOverlayOrMarkerSelect]
  );

  useEffect(() => {
    if (!mapObj?.Event?.bind || !mapObj?.Event?.unbind) return;

    const bind = (evt, fn) => {
      if (typeof fn !== "function") return () => {};
      try {
        mapObj.Event.bind(evt, fn);
      } catch (e) {
        console.error("bind failed:", evt, e);
        return () => {};
      }
      return () => {
        try {
          mapObj.Event.unbind(evt, fn);
        } catch {}
      };
    };

    const unsubs = [];

    // ✅ ใช้ overlayClick อย่างเดียว (markerClick บางเวอร์ชันไม่รองรับ)
    unsubs.push(
      bind("overlayClick", (payload) => {
        const ov = resolveOverlay(payload);
        handleSelect(ov);
      })
    );

    // ✅ click บนแผนที่เพื่อปิด popup (แต่ห้ามปิดตอนกำลังวาด)
    unsubs.push(
      bind("click", () => {
        if (isDrawing) return;
        onMapClickClose?.();
      })
    );

    return () => unsubs.forEach((u) => u?.());
  }, [mapObj, handleSelect, onMapClickClose, isDrawing]);
}

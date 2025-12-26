import { useCallback, useEffect } from "react";

export function useMapEvents({
  mapObj,
  onOverlayOrMarkerSelect, // (land, loc) => void
  onMapClickClose,         // () => void
}) {
  const handleSelect = useCallback(
    (overlay) => {
      if (!overlay) return;

      // ✅ ทางใหม่ (preferred)
      if (typeof overlay.__onSelect === "function") {
        overlay.__onSelect();
        return;
      }

      // fallback (ของเดิม)
      const land = overlay.__land;
      const loc = overlay.__loc;
      if (land && loc) onOverlayOrMarkerSelect?.(land, loc);
    },
    [onOverlayOrMarkerSelect]
  );

  useEffect(() => {
    if (!mapObj) return;

    const bind = (evt, fn) => {
      try {
        mapObj.Event.bind(evt, fn);
      } catch {}
      return () => {
        try {
          mapObj.Event.unbind(evt, fn);
        } catch {}
      };
    };

    const unsubs = [
      bind("overlayClick", handleSelect),
      bind("markerClick", handleSelect),
      bind("click", () => onMapClickClose?.()),
    ];

    return () => unsubs.forEach((u) => u?.());
  }, [mapObj, handleSelect, onMapClickClose]);
}

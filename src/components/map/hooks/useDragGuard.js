import { useEffect, useRef } from "react";

/**
 * กัน click หลุดหลัง drag (เช่น drag popup หรือ map)
 */
export function useDragGuard({ enabledRef, threshold = 6 }) {
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const isEnabled = () => enabledRef?.current;

    const onDown = (e) => {
      if (!isEnabled()) return;
      isDraggingRef.current = false;
      dragStartRef.current = {
        x: e.clientX ?? 0,
        y: e.clientY ?? 0,
      };
    };

    const onMove = (e) => {
      if (!isEnabled()) return;
      const dx = (e.clientX ?? 0) - dragStartRef.current.x;
      const dy = (e.clientY ?? 0) - dragStartRef.current.y;
      if (Math.hypot(dx, dy) > threshold) {
        isDraggingRef.current = true;
      }
    };

    const onUp = () => {
      setTimeout(() => {
        isDraggingRef.current = false;
      }, 0);
    };

    document.addEventListener("pointerdown", onDown, true);
    document.addEventListener("pointermove", onMove, true);
    document.addEventListener("pointerup", onUp, true);

    return () => {
      document.removeEventListener("pointerdown", onDown, true);
      document.removeEventListener("pointermove", onMove, true);
      document.removeEventListener("pointerup", onUp, true);
    };
  }, [enabledRef, threshold]);

  return { isDraggingRef };
}

import React from "react";
import { createPortal } from "react-dom";

/**
 * MapPopup
 *
 * รองรับ 2 โหมด:
 * 1) LAND  → มี pos + popupStyle + arrow
 * 2) EIA   → ไม่มี pos → popup แสดงกลางจอ
 *
 * props:
 * - open: boolean
 * - pos: { x, y } | null
 * - popupStyle: { left, top, zIndex }
 * - arrowStyle: style object (optional)
 * - popupBoxRef: ref (optional)
 * - children
 */
export default function MapPopup({
  open,
  pos,
  popupStyle = {},
  arrowStyle,
  popupBoxRef,
  children,
}) {
  if (!open) return null;

  // ===== fallback สำหรับ EIA (ไม่มี pos) =====
  const left = popupStyle.left ?? "50%";
  const top = popupStyle.top ?? "50%";
  const zIndex = popupStyle.zIndex ?? 1000;

  const isAnchored = Boolean(pos);

  return createPortal(
    <>
      {/* ===== Arrow (เฉพาะ LAND) ===== */}
      {isAnchored && arrowStyle && (
        <div
          style={{
            position: "fixed",
            left,
            top,
            zIndex,
            pointerEvents: "none",
          }}
        >
          <div style={arrowStyle} />
        </div>
      )}

      {/* ===== Popup box ===== */}
      <div
        ref={popupBoxRef}
        className="land-popup-shell land-detail-panel"
        style={{
          position: "fixed",
          left,
          top,
          transform: isAnchored ? undefined : "translate(-50%, -50%)",
          zIndex: zIndex + 1,
          pointerEvents: "auto",
        }}
      >
        {children}
      </div>
    </>,
    document.body
  );
}

// src/components/map/MapPopup.jsx
import React from "react";
import { createPortal } from "react-dom";

export default function MapPopup({
  open,
  pos,
  popupStyle,
  arrowStyle,
  popupBoxRef,
  children,
}) {
  if (!open || !pos) return null;

  return createPortal(
    <>
      {/* ชั้นที่ 1: ใช้แค่กำหนดตำแหน่ง (ไม่รับ event) */}
      <div
        style={{
          position: "fixed",
          left: popupStyle.left,
          top: popupStyle.top,
          zIndex: popupStyle.zIndex,
          pointerEvents: "none",
        }}
      >
        {/* ลูกศร */}
        <div style={arrowStyle} />
      </div>

      {/* ชั้นที่ 2: popup จริง (รับ event ได้) */}
      <div
        ref={popupBoxRef}
        className="land-popup-shell land-detail-panel"
        style={{
          position: "fixed",
          left: popupStyle.left,
          top: popupStyle.top,
          zIndex: popupStyle.zIndex + 1,
          pointerEvents: "auto",
        }}
      >
        {children}
      </div>
    </>,
    document.body
  );
}

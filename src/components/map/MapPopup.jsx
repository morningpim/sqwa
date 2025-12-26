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
    <div style={popupStyle}>
      <div ref={popupBoxRef} style={{ position: "relative", pointerEvents: "auto" }}>
        <div style={arrowStyle} />
        <div
          className="land-popup-shell"
          style={{ position: "relative", zIndex: 2, pointerEvents: "auto" }}
        >
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}

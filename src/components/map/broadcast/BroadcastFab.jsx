// src/components/map/broadcast/BroadcastFab.jsx
import React from "react";
import "./broadcast.css";

export default function BroadcastFab({ onClick }) {
  return (
    <button className="bc-fab" type="button" onClick={onClick} title="ข่าวประชาสัมพันธ์">
      📣
      <span className="bc-fab-text">ข่าว</span>
    </button>
  );
}

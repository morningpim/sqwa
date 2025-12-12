// src/pages/MapPage.jsx
import React from "react";
import "../css/MapPage.css"; // ถ้ามี

export default function MapPage() {
  return (
    <div className="map-wrapper">
      <div className="map-content">
        <div className="map-search-box">
          <input type="text" placeholder="Search location…" />
          <button>ค้นหา</button>
        </div>
      </div>
    </div>
  );
}

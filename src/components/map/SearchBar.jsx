import { useState } from "react";
import "../../css/MapPage.css";

export default function SearchBar({ onSearch }) {
  const [q, setQ] = useState("");

  const handleSearch = () => {
    onSearch?.(q);
  };

  return (
    <div className="map-topbar">
      <div className="map-search">
        <input
          className="map-search-input"
          placeholder="พิมพ์ชื่อสถานที่ หรือ 13.7563, 100.5018"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />

        <button
          type="button"
          className="map-search-btn"
          onClick={handleSearch}
        >
          <span className="material-symbols-outlined material-icon">search</span>
        </button>
      </div>
    </div>
  );
}

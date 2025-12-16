// src/components/map/SearchBar.jsx
import "../../css/MapPage.css";

export default function SearchBar({ onSearch }) {
  return (
    <div className="map-topbar">
      <div className="map-search">
        <input
          className="map-search-input"
          placeholder="Search Here"
        />
        <button
          className="map-search-btn"
          type="button"
          onClick={onSearch}
        >
          🔍
        </button>
      </div>
    </div>
  );
}

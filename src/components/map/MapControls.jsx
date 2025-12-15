import React from "react";
import "../../css/MapControls.css"; // ✅ เปลี่ยน path ให้ตรงโปรเจกต์คุณ

export default function MapControls({
  hasNewMessage = false,
  unreadCount = 0,
  onToggleSearch,
  onToggleFilters,
  onToggleP2P,
}) {
  return (
    <div className="map-controls">
      {/* Search Button */}
      <button
        className="control-btn search-btn"
        onClick={onToggleSearch}
        title="Search"
        type="button"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </button>

      {/* Filters Button */}
      <button
        className="control-btn filters-btn"
        onClick={onToggleFilters}
        title="Filters"
        type="button"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <line x1="4" y1="21" x2="4" y2="14" />
          <line x1="4" y1="10" x2="4" y2="3" />
          <line x1="12" y1="21" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12" y2="3" />
          <line x1="20" y1="21" x2="20" y2="16" />
          <line x1="20" y1="12" x2="20" y2="3" />
          <line x1="1" y1="14" x2="7" y2="14" />
          <line x1="9" y1="8" x2="15" y2="8" />
          <line x1="17" y1="16" x2="23" y2="16" />
        </svg>
      </button>

      {/* P2P / Chat Button */}
      <button
        className={`control-btn p2p-btn ${hasNewMessage ? "has-new" : ""}`}
        onClick={onToggleP2P}
        title="Chat"
        type="button"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>

        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount}</span>
        )}
      </button>
    </div>
  );
}

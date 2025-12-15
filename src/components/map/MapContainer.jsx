import React from "react";
import MapControls from "./MapControls";

export default function MapContainer({
  children,
  hasNewMessage = false,
  unreadCount = 0,
  onToggleSearch,
  onToggleFilters,
  onToggleP2P,
}) {
  return (
    <div className="map-container">
      {children}

      <MapControls
        hasNewMessage={hasNewMessage}
        unreadCount={unreadCount}
        onToggleSearch={onToggleSearch}
        onToggleFilters={onToggleFilters}
        onToggleP2P={onToggleP2P}
      />
    </div>
  );
}

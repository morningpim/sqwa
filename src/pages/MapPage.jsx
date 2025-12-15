import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ModeDisclaimerModal from "../components/Common/ModeDisclaimerModal";
import MapContainer from "../components/map/MapContainer";
import "../css/MapPage.css";

export default function MapPage() {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get("mode"); // buy | sell

  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [mapMode, setMapMode] = useState(null);

  // UI panels
  const [showSearch, setShowSearch] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showP2P, setShowP2P] = useState(false);

  useEffect(() => {
    if (!mode) return;

    if (localStorage.getItem("modeDisclaimerAccepted") === "1") {
      setMapMode(mode);
      return;
    }

    setShowDisclaimer(true);
  }, [mode]);

  const handleConfirmDisclaimer = () => {
    localStorage.setItem("modeDisclaimerAccepted", "1");
    setShowDisclaimer(false);
    setMapMode(mode);
  };

  return (
    <div className="map-wrapper">
      {/* Disclaimer */}
      {showDisclaimer && (
        <ModeDisclaimerModal onClose={handleConfirmDisclaimer} />
      )}

      <MapContainer
        hasNewMessage={true}
        unreadCount={2}
        onToggleSearch={() => setShowSearch((v) => !v)}
        onToggleFilters={() => setShowFilters((v) => !v)}
        onToggleP2P={() => setShowP2P((v) => !v)}
      >
        {/* ==== MAP CANVAS ==== */}
        <div className="map-canvas">
          MAP HERE

          {/* debug */}
          {mapMode && (
            <div className="map-mode-indicator">
              โหมดปัจจุบัน:{" "}
              <b>{mapMode === "buy" ? "ซื้อขาย" : "ฝากขาย"}</b>
            </div>
          )}
        </div>
      </MapContainer>

      {/* ==== PANELS (ตัวอย่าง) ==== */}
      {showSearch && <div className="map-panel">Search Panel</div>}
      {showFilters && <div className="map-panel">Filter Panel</div>}
      {showP2P && <div className="map-panel">Chat Panel</div>}
    </div>
  );
}

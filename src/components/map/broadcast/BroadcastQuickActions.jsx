// src/components/map/broadcast/BroadcastQuickActions.jsx
import React from "react";
import "./broadcast.css";

export default function BroadcastQuickActions({
  land,
  role,
  mode,
  sellIntent,
  onAdminClick,
  onConsignorClick,
}) {
  if (!land?.id) return null;

  const canAdmin = role === "admin";
  const isConsignment = mode === "sell" && sellIntent === "seller";

  return (
    <div className="bc-quick">
      {canAdmin && (
        <button className="bc-quick-btn" type="button" onClick={onAdminClick} title="Admin Broadcast/LINE Ads">
          📣 Admin Broadcast
        </button>
      )}

      {isConsignment && !canAdmin && (
        <button className="bc-quick-btn hot" type="button" onClick={onConsignorClick} title="Broadcast 100 บาท (ขายฝาก)">
          🔥 Broadcast 100฿
        </button>
      )}
    </div>
  );
}

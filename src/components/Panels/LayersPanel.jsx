import React from "react";
import "../../css/LayersPanel.css";

export default function LayersPanel({
  open,
  onClose,

  // tabs
  plan,
  setPlan,

  // sliders
  baseOpacity,
  setBaseOpacity,

  redRoadEnabled,
  setRedRoadEnabled,
  redRoadOpacity,
  setRedRoadOpacity,
}) {
  if (!open) return null;

  const plans = [
    { key: "bkk2556", label: "ผังเมือง กทม.\n2556" },
    { key: "bkk2570", label: "ผังเมือง กทม. 2570\n(ล่าง)" },
    { key: "sub", label: "ซ้อนผังเมือง" },
  ];

  return (
    <div className="layers-panel" role="dialog" aria-label="Layers">
      <div className="layers-card">
        <div className="layers-header">
          <div className="layers-title">Layers</div>
          <button className="layers-close" type="button" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className="layers-tabs">
          {plans.map((p) => (
            <button
              key={p.key}
              type="button"
              className={`layers-tab ${plan === p.key ? "active" : ""}`}
              onClick={() => setPlan(p.key)}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="layers-row">
          <div className="layers-label">Opacity</div>
          <input
            className="layers-range"
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={baseOpacity}
            onChange={(e) => setBaseOpacity(parseFloat(e.target.value))}
          />
          <div className="layers-value">{Number(baseOpacity).toFixed(2)}</div>
        </div>
      </div>

      <div className="layers-card">
        <div className="layers-row layers-row-top">
          <label className="layers-check">
            <input
              type="checkbox"
              checked={redRoadEnabled}
              onChange={(e) => setRedRoadEnabled(e.target.checked)}
            />
            <span className="layers-checkmark" />
            <span className="layers-checktext">ระวางรถที่ดินสีแดง</span>
          </label>
        </div>

        <div className="layers-row">
          <div className="layers-label">Opacity</div>
          <input
            className="layers-range"
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={redRoadOpacity}
            disabled={!redRoadEnabled}
            onChange={(e) => setRedRoadOpacity(parseFloat(e.target.value))}
          />
          <div className="layers-value">{Number(redRoadOpacity).toFixed(2)}</div>
        </div>
      </div>
    </div>
  );
}

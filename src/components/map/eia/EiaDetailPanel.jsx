// src/components/map/eia/EiaDetailPanel.jsx
import React from "react";
import { useTranslation } from "react-i18next";
import "./eia-popup.css";

export default function EiaDetailPanel({ data, onClose }) {
  const { t } = useTranslation("eia");
  const { t: tCommon } = useTranslation("common");

  if (!data?.item) return null;

  const eia = data.item.raw ?? data.item;

  const statusKey = eia.projectStatus || "unknown";
  const val = v => (v !== undefined && v !== null && v !== "" ? v : "-");

  /* ---------- Safe images ---------- */
  const images = Array.isArray(eia.images) ? eia.images : [];

  /* ---------- Slider State ---------- */
  const [imgIndex, setImgIndex] = React.useState(0);
  const startX = React.useRef(null);

  /* reset index when project changes */
  React.useEffect(()=>{
    setImgIndex(0);
  },[eia.id]);

  /* ---------- Swipe ---------- */
  const handleStart = e=>{
    startX.current = e.touches?.[0]?.clientX ?? e.clientX;
  };

  const handleMove = e=>{
    if(startX.current===null) return;

    const x = e.touches?.[0]?.clientX ?? e.clientX;
    const diff = startX.current - x;

    if(Math.abs(diff)>50){
      if(diff>0 && imgIndex < images.length-1)
        setImgIndex(v=>v+1);

      if(diff<0 && imgIndex>0)
        setImgIndex(v=>v-1);

      startX.current=null;
    }
  };

  const handleEnd = ()=> startX.current=null;

  return (
    <div className="eia-card" role="dialog" aria-modal="true">

      {/* Header */}
      <div className="eia-head">
        <div className="eia-title">
          <span className="eia-badge">{t("badge")}</span>
          <span className="eia-name">
            {eia.projectName || eia.name || t("projectFallback")}
          </span>
        </div>

        <button
          className="eia-close"
          onClick={onClose}
          type="button"
          aria-label={tCommon("close")}
        >
          ×
        </button>
      </div>


      {/* ---------- Image Slider ---------- */}
      {images.length > 0 && (
        <div className="eia-slider">

          <div
            className="eia-slider-track"
            style={{ transform:`translateX(-${imgIndex * 100}%)` }}
            onTouchStart={handleStart}
            onTouchMove={handleMove}
            onTouchEnd={handleEnd}
            onMouseDown={handleStart}
            onMouseMove={handleMove}
            onMouseUp={handleEnd}
            onMouseLeave={handleEnd}
          >
            {images.map((src,i)=>(
              <img key={i} src={src} alt={`img-${i}`} />
            ))}
          </div>

          {/* arrows */}
          {images.length > 1 && (
            <>
              <button
                className={`eia-nav left ${imgIndex===0?"hide":""}`}
                onClick={()=>setImgIndex(v=>Math.max(v-1,0))}
              >
                ‹
              </button>

              <button
                className={`eia-nav right ${imgIndex===images.length-1?"hide":""}`}
                onClick={()=>setImgIndex(v=>Math.min(v+1,images.length-1))}
              >
                ›
              </button>
            </>
          )}

          {/* dots */}
          {images.length > 1 && (
            <div className="eia-dots">
              {images.map((_,i)=>(
                <span
                  key={i}
                  className={i===imgIndex?"active":""}
                  onClick={()=>setImgIndex(i)}
                />
              ))}
            </div>
          )}

        </div>
      )}


      {/* Financial */}
      <div className="eia-row">
        <span>{t("field.projectValue")}</span>
        <b>{val(eia.projectValue)} {t("unit.baht")}</b>
      </div>

      <div className="eia-row">
        <span>{t("field.investment")}</span>
        <b>{val(eia.investment)} {t("unit.baht")}</b>
      </div>

      {/* Type */}
      <div className="eia-row">
        <span>{t("field.projectType")}</span>
        <b>{val(eia.projectType)}</b>
      </div>

      {/* Area */}
      <div className="eia-area">
        <div className="eia-area-box main">
          <div className="k">{t("field.usableArea")}</div>
          <div className="v">{val(eia.usableArea)}</div>
        </div>

        <div className="eia-area-box">
          <div className="k">{t("field.landArea")}</div>
          <div className="v">{val(eia.landAreaText)}</div>
        </div>
      </div>

      {/* Status */}
      <div className="eia-meta">
        <div>
          <span>{t("field.status")}</span>
          <b className={statusKey}>{t(`status.${statusKey}`, statusKey)}</b>
        </div>

        <div>
          <span>{t("field.endDate")}</span>
          <b>{val(eia.endDate)}</b>
        </div>
      </div>

      {/* Location */}
      <div className="eia-meta">
        <div><span>{t("field.region")}</span><b>{val(eia.region)}</b></div>
        <div><span>{t("field.province")}</span><b>{val(eia.province)}</b></div>
        <div><span>{t("field.district")}</span><b>{val(eia.district)}</b></div>
        <div><span>{t("field.subdistrict")}</span><b>{val(eia.subdistrict)}</b></div>
      </div>

      {/* Coordinates */}
      <div className="eia-meta">
        <div>
          <span>{t("field.location")}</span>
          <b>{eia.location?.lat ?? "-"}, {eia.location?.lon ?? "-"}</b>
        </div>
      </div>

      {/* Actions */}
      <div className="eia-actions">
        {eia.newsLink && (
          <a href={eia.newsLink} target="_blank" rel="noreferrer" className="btn ghost">
            {t("action.news")}
          </a>
        )}

        {eia.eiaLink && (
          <a href={eia.eiaLink} target="_blank" rel="noreferrer" className="btn primary">
            {t("action.detail")}
          </a>
        )}
      </div>

    </div>
  );
}
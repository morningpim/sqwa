import { useEffect, useMemo, useState, Fragment } from "react";
import "../../css/land-popup.css";
import { useTranslation } from "react-i18next";
import { normalizeLand } from "../../utils/normalizeLand";
import {
  isFavorite as isFavInStore,
  toggleFavorite as toggleFavInStore,
} from "../../utils/favorites";

import MemberActions from "./MemberActions";
import GuestActions from "./GuestActions";

// -------------------------
// contact field config
// -------------------------
const CONTACT_FIELDS = [
  { key: "contactOwner", label: "field.owner", mask: "-----" },
  { key: "broker", label: "field.agent", mask: "-----" },
  { key: "phone", label: "field.phone", mask: "**********" },
  { key: "line", label: "field.lineId", mask: "**********" },
  { key: "frame", label: "field.landFrame", mask: "-----" },
  { key: "chanote", label: "field.deed", mask: "-----" },
];

export default function LandDetailPanel({
  land,
  isMember,
  quotaUsed,
  unlockedFields = [],
  onClose,
  onOpenUnlockPicker,
  onUnlockAll,
  onChatSeller,
  isFavorite,
  onToggleFavorite,
  images,
}) {
  // ✅ main namespace ของ component
  const { t } = useTranslation("land");
  // ✅ common ใช้เฉพาะของกลาง
  const { t: tCommon, i18n } = useTranslation("common");

  const L = useMemo(() => normalizeLand(land), [land]);
  const unlockedSet = useMemo(() => new Set(unlockedFields), [unlockedFields]);

  const [favLocal, setFavLocal] = useState(() =>
    L?.id ? isFavInStore(L.id) : false
  );

  useEffect(() => {
    if (!L?.id) return;
    if (typeof isFavorite === "boolean") return;
    setFavLocal(isFavInStore(L.id));
  }, [L?.id, isFavorite]);

  const fav = typeof isFavorite === "boolean" ? isFavorite : favLocal;

  const handleFav = () => {
    if (!L?.id) return;

    const payload = {
      id: L.id,
      title: L.owner,
      owner: L.owner,
      updatedAt: L.updatedAt,
      totalPrice: L.totalPrice,
      area: L.area,
      lat: L.lat,
      lng: L.lng,
    };

    if (typeof onToggleFavorite === "function") {
      onToggleFavorite(L.id, !fav, payload);
      return;
    }

    const next = toggleFavInStore(L.id, payload);
    setFavLocal(next);
  };

  const canSeeAll = isMember && unlockedSet.size > 0;
  const canReveal = (key) => canSeeAll || unlockedSet.has(key);

  const showValue = (key, value, mask) =>
    canReveal(key) ? value ?? "-" : mask;

  const postedDate = L.updatedAt
    ? new Date(L.updatedAt).toLocaleDateString(i18n.language)
    : "-";

  return (
    <div id="sqw-popup-root">
      <div className="sqw-popup">
        {/* ---------- HEADER ---------- */}
        <div className="sqw-head">
          <button
            className={`sqw-fav ${fav ? "is-on" : ""}`}
            type="button"
            aria-label={fav ? t("favorite.off") : t("favorite.on")}
            title={fav ? t("favorite.off") : t("favorite.on")}
            onClick={handleFav}
          >
            <span
              className="material-symbols-outlined"
              aria-hidden="true"
            >
              favorite
            </span>
          </button>

          <div className="sqw-pill">
            {L.owner || t("ownerFallback")}
          </div>

          <button
            className="sqw-x"
            type="button"
            aria-label={tCommon("close")}
            onClick={onClose}
          >
            ×
          </button>
        </div>

        {/* ---------- META ---------- */}
        <div className="sqw-meta">
          🕒 {t("postedDate", { date: postedDate })}
        </div>

        {/* ---------- IMAGE ---------- */}
        {L.images?.length > 0 && (
          <ImageSlider images={L.images}/>
        )}

        {/* ---------- BASIC INFO ---------- */}
        <div className="sqw-grid">
          <InfoBox
            label={t("field.size")}
            value={`${L.area} ${t("unit.sqw")}`}
          />
          <InfoBox
            label={t("field.rnw")}
            value={L.raw}
          />
          <InfoBox
            label={t("field.frontage")}
            value={`${L.frontage ?? L.width ?? "-"} ${t("unit.meter")}`}
          />
          <InfoBox
            label={t("field.roadWidth")}
            value={`${L.roadWidth} ${t("unit.meter")}`}
          />
        </div>

        <div className="sqw-divider" />

        {/* ---------- PRICE ---------- */}
        <div className="sqw-row">
          <span>{t("price.perSqw")}</span>
          <span className="sqw-row-v">
            {L.pricePerWa ?? L.price} {tCommon("unit.baht")}
          </span>
        </div>
        <div className="sqw-row">
          <span>{t("price.total")}</span>
          <span className="sqw-row-v">
            {L.totalPrice} {tCommon("unit.baht")}
          </span>
        </div>

        <div className="sqw-divider" />

        {/* ---------- CONTACT ---------- */}
        <div className="sqw-h">{t("section.contact")}</div>

        <div className="sqw-kv">
          {CONTACT_FIELDS.map((f) => (
            <Fragment key={f.key}>
              <div className="k">{tCommon(f.label)}</div>
              <div className="v">
                {showValue(f.key, L[f.key], f.mask)}
              </div>
            </Fragment>
          ))}
        </div>

        <div className="sqw-divider" />

        {/* ---------- ACTIONS ---------- */}
        {isMember ? (
          <MemberActions
            quotaUsed={quotaUsed}
            onChatSeller={() => onChatSeller?.(land)}
            onUnlockAll={() => onUnlockAll?.(L.id)}
          />
        ) : (
          <GuestActions
            onChatSeller={() => onChatSeller?.(land)}
            onOpenUnlockPicker={() => onOpenUnlockPicker?.(L.id)}
          />
        )}
      </div>
    </div>
  );
}

function InfoBox({ label, value }) {
  return (
    <div className="sqw-box">
      <div className="sqw-box-k">{label}</div>
      <div className="sqw-box-v">{value}</div>
    </div>
  );
}

function ImageSlider({ images = [] }) {
  const [i, setI] = useState(0)
  const [startX, setStartX] = useState(null)
  const [fullscreen, setFullscreen] = useState(false)

  if (!images.length) return null

  const prev = () => setI(v => v === 0 ? images.length - 1 : v - 1)
  const next = () => setI(v => v === images.length - 1 ? 0 : v + 1)

  // swipe support
  const onTouchStart = e => setStartX(e.touches[0].clientX)

  const onTouchEnd = e => {
    if (startX == null) return
    const diff = startX - e.changedTouches[0].clientX
    if (Math.abs(diff) > 50) {
      diff > 0 ? next() : prev()
    }
    setStartX(null)
  }

  // keyboard support
  useEffect(()=>{
    const key = e=>{
      if(e.key==="ArrowRight") next()
      if(e.key==="ArrowLeft") prev()
      if(e.key==="Escape") setFullscreen(false)
    }
    window.addEventListener("keydown",key)
    return ()=>window.removeEventListener("keydown",key)
  },[])

  return (
    <>
      <div
        className="sqw-slider"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <img
          src={images[i]}
          className="sqw-slide-img"
          onClick={()=>setFullscreen(true)}
        />

        {images.length > 1 && (
          <>
            <button className="sqw-arrow left" onClick={prev}>‹</button>
            <button className="sqw-arrow right" onClick={next}>›</button>
          </>
        )}

        {/* index */}
        <div className="sqw-index">
          {i+1} / {images.length}
        </div>
      </div>
      {/* fullscreen modal */}
      {fullscreen && (
        <div className="sqw-full" onClick={()=>setFullscreen(false)}>
          <img src={images[i]}/>
        </div>
      )}
    </>
  )
}


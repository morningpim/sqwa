import { useMemo, useState } from "react";
import "../../css/land-popup.css";
import { QUOTA_LIMIT } from "./constants/unlock";

// -------------------------
// utils เดิม (ใช้ต่อได้)
// -------------------------
const normalizeDate = (v) => {
  if (!v) return null;

  if (typeof v === "string") {
    const parsed = new Date(v);
    if (!Number.isNaN(parsed.getTime())) return parsed.toLocaleDateString("th-TH");
    return v;
  }

  if (typeof v?.toDate === "function") {
    const d = v.toDate();
    return d?.toLocaleDateString?.("th-TH") ?? null;
  }

  if (typeof v?.seconds === "number") {
    const d = new Date(v.seconds * 1000);
    return d.toLocaleDateString("th-TH");
  }

  if (v instanceof Date) return v.toLocaleDateString("th-TH");
  return null;
};

function normalizeLand(input = {}) {
  const pick = (...vals) => {
    for (const v of vals) {
      if (v !== undefined && v !== null && String(v).trim() !== "") return v;
    }
    return null;
  };

  const toNumber = (v) => {
    if (v == null) return null;
    const n = Number(String(v).replace(/,/g, ""));
    return Number.isFinite(n) ? n : null;
  };

  const fmt = (v, digits = null) => {
    const n = toNumber(v);
    if (n == null) return null;
    if (typeof digits === "number") {
      return n.toLocaleString("en-US", { maximumFractionDigits: digits });
    }
    return n.toLocaleString("en-US");
  };

  const sqwToRNW = (sqw) => {
    const n = toNumber(sqw);
    if (n == null) return null;
    const rai = Math.floor(n / 400);
    const rem = n % 400;
    const ngan = Math.floor(rem / 100);
    const wah = rem % 100;
    return `${rai}-${ngan}-${wah}`;
  };

  const id = pick(input.id, input.landId, input._id, input.docId, "");

  const owner = pick(
    input.owner,
    input.ownerTitle,
    input.ownerName,
    input.contactOwner,
    input.ownerContact,
    input.contactName,
    input.brokerName,
    input.agentName,
    input.agent,
    "คุณปาลิส (นายหน้า)"
  );

  const updatedAt =
    normalizeDate(pick(input.updatedAt, input.updateAt, input.updated_date, input.createdAt, input.createAt)) ??
    pick(input.updatedAt, input.createdAt) ??
    "-";

  const areaSqw = pick(
    input.areaSqWa,
    input.areaSqW,
    input.areaSqw,
    input.areaSqWaTotal,
    input.area,
    input.size,
    input.sqw,
    input.squareWah,
    input.squarewah,
    input.sqwah
  );

  const rai = pick(input.rai, input.raiCount, input.rai_amount, input.raiValue);
  const ngan = pick(input.ngan, input.nganCount, input.ngan_amount, input.nganValue);
  const wah = pick(input.wah, input.wa, input.waCount, input.wahCount, input.wah_amount, input.wahValue);

  const rawRNW = pick(input.raw, input.rnw, input.raiNganWah, input.sizeRNW);

  const raw =
    rawRNW ??
    (rai != null || ngan != null || wah != null
      ? `${toNumber(rai) ?? 0}-${toNumber(ngan) ?? 0}-${toNumber(wah) ?? 0}`
      : sqwToRNW(areaSqw) ?? "-");

  const frontage = pick(
    input.frontage,
    input.frontWidth,
    input.front,
    input.roadFrontage,
    input.frontMeter,
    input.widthFront
  );
  const roadWidth = pick(input.roadWidth, input.roadwidth, input.road, input.roadSize, input.roadMeter);

  const pricePerWa = pick(
    input.pricePerWa,
    input.pricePerSqw,
    input.pricePerWah,
    input.price_per_wa,
    input.unitPrice,
    input.priceUnit
  );
  const totalPrice = pick(input.totalPrice, input.total, input.sumPrice, input.total_price, input.priceTotal);

  const contactOwner = pick(input.contactOwner, input.ownerContact, input.contactName, input.ownerName, "");
  const broker = pick(input.broker, input.agent, input.agentName, input.brokerName, "");
  const phone = pick(input.phone, input.tel, input.mobile, input.phoneNumber, "");
  const line = pick(input.line, input.lineId, input.line_id, input.lineID, "");
  const frame = pick(input.frame, input.landFrame, input.frameNo, input.land_frame, "");
  const chanote = pick(input.chanote, input.deedInformation, input.deed, input.chanode, input.titleDeed, "");

  return {
    id,
    owner,
    updatedAt,
    area: fmt(areaSqw) ?? (areaSqw != null ? String(areaSqw) : "-"),
    raw,
    frontage: fmt(frontage) ?? (frontage != null ? String(frontage) : "-"),
    roadWidth: fmt(roadWidth) ?? (roadWidth != null ? String(roadWidth) : "-"),
    pricePerWa: fmt(pricePerWa, 2) ?? (pricePerWa != null ? String(pricePerWa) : "-"),
    totalPrice: fmt(totalPrice) ?? (totalPrice != null ? String(totalPrice) : "-"),
    contactOwner,
    broker,
    phone,
    line,
    frame,
    chanote,
  };
}

// -------------------------
// React Component
// -------------------------
export default function LandDetailPanel({
  land,
  isMember,
  quotaUsed,
  unlockedFields = [],
  onClose,
  onOpenUnlockPicker,
  onUnlockAll,

  // (optional) ถ้าอยากให้ parent คุม favorite:
  isFavorite,
  onToggleFavorite,
}) {
  const L = useMemo(() => normalizeLand(land), [land]);
  const unlockedSet = useMemo(() => new Set(unlockedFields), [unlockedFields]);

  // favorite (local fallback)
  const [favLocal, setFavLocal] = useState(false);
  const fav = typeof isFavorite === "boolean" ? isFavorite : favLocal;

  const handleFav = () => {
    const next = !fav;
    if (typeof onToggleFavorite === "function") onToggleFavorite(L.id, next);
    else setFavLocal(next);
  };

  const canSeeAllForThisLand = isMember && unlockedSet.size > 0;
  const canReveal = (key) => canSeeAllForThisLand || unlockedSet.has(key);
  const showValue = (key, value, masked) => (canReveal(key) ? value || "-" : masked);

  return (
    <div id="sqw-popup-root">
      <div className="sqw-popup">
        {/* header */}
        <div className="sqw-head">
          {/* ✅ Favorite อยู่แค่ตรง header (ไม่ไปทับปุ่มล่าง) */}
          <button
            className={`sqw-fav ${fav ? "is-on" : ""}`}
            type="button"
            aria-label={fav ? "unfavorite" : "favorite"}
            onClick={handleFav}
            title={fav ? "เลิกถูกใจ" : "ถูกใจ"}
          >
            <span className="material-symbols-outlined">favorite</span>
          </button>

          <div className="sqw-pill">{L.owner || "คุณปาลิส (นายหน้า)"}</div>

          <button className="sqw-x" type="button" aria-label="close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="sqw-meta">🕒 วันที่ลงข้อมูล {L.updatedAt || "-"}</div>

        <div className="sqw-grid">
          <div className="sqw-box">
            <div className="sqw-box-k">ขนาดที่ดิน</div>
            <div className="sqw-box-v">{L.area} ตร.วา</div>
          </div>
          <div className="sqw-box">
            <div className="sqw-box-k">ไร่-งาน-วา</div>
            <div className="sqw-box-v">{L.raw}</div>
          </div>
          <div className="sqw-box">
            <div className="sqw-box-k">หน้ากว้างติดถนน</div>
            <div className="sqw-box-v">{L.frontage} ม.</div>
          </div>
          <div className="sqw-box">
            <div className="sqw-box-k">ขนาดถนน</div>
            <div className="sqw-box-v">{L.roadWidth} ม.</div>
          </div>
        </div>

        <div className="sqw-divider" />

        <div className="sqw-row">
          <span>ราคา/ตร.วา</span>
          <span className="sqw-row-v">{L.pricePerWa} บ.</span>
        </div>
        <div className="sqw-row">
          <span>ราคารวม</span>
          <span className="sqw-row-v">{L.totalPrice} บ.</span>
        </div>

        <div className="sqw-divider" />

        <div className="sqw-h">ข้อมูลติดต่อ</div>

        <div className="sqw-kv">
          <div className="k">เจ้าของ</div>
          <div className="v">{showValue("contactOwner", L.contactOwner, "-----")}</div>

          <div className="k">นายหน้า</div>
          <div className="v">{showValue("broker", L.broker, "-----")}</div>

          <div className="k">โทร</div>
          <div className="v">{showValue("phone", L.phone, "**********")}</div>

          <div className="k">LINE ID</div>
          <div className="v">{showValue("line", L.line, "**********")}</div>

          <div className="k">กรอบที่ดิน</div>
          <div className="v">{showValue("frame", L.frame, "-----")}</div>

          <div className="k">ข้อมูลโฉนด/ระวาง</div>
          <div className="v">{showValue("chanote", L.chanote, "-----")}</div>
        </div>

        <div className="sqw-divider" />

        {isMember ? (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div className="sqw-h" style={{ margin: 0 }}>
                สิทธิ์สมาชิก
              </div>
              <div style={{ fontSize: 12, opacity: 0.8 }}>
                โควตาวันนี้: <b>{quotaUsed}</b> / {QUOTA_LIMIT}
              </div>
            </div>

            <div style={{ fontSize: 12, opacity: 0.75, marginTop: 6 }}>
              * กด “ดูข้อมูลทั้งหมด” จะใช้โควตา 1 ครั้ง และปลดล็อกข้อมูลติดต่อทั้งหมดของแปลงนี้
            </div>

            <div className="sqw-actions" style={{ marginTop: 10 }}>
              <button className="sqw-btn" type="button">
                แชทกับผู้ขาย
              </button>
              <button
                className="sqw-btn sqw-pay-btn"
                type="button"
                disabled={quotaUsed >= QUOTA_LIMIT}
                onClick={() => onUnlockAll?.(L.id)}
              >
                ดูข้อมูลทั้งหมด (ใช้ 1 ครั้ง)
              </button>
            </div>
          </>
        ) : (
          <>
            {/* ✅ คืนปุ่มเดิมครบ 2 ปุ่ม (ไม่ให้พังอีก) */}
            <div className="sqw-actions" style={{ marginTop: 10 }}>
              <button className="sqw-btn" type="button">
                แชทกับผู้ขาย
              </button>
              <button
                className="sqw-btn sqw-pay-btn"
                type="button"
                onClick={() => onOpenUnlockPicker?.(L.id)}
              >
                คลิกเพื่อปลดล็อคข้อมูล
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

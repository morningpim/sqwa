import "../../css/land-popup.css";

// ✅ แปลงวันที่ให้เป็นรูปแบบไทย รองรับ string / Date / Firestore Timestamp / {seconds}
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
    if (typeof digits === "number") return n.toLocaleString("en-US", { maximumFractionDigits: digits });
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

/**
 * buildLandPopupHtml(land, access)
 * access:
 *  - isMember: boolean
 *  - quota: { limit:number, used:number }
 *  - unlockedFields: string[]  // fields ที่ปลดล็อกของ land นี้
 */
export default function buildLandPopupHtml(
  land = {},
  access = { isMember: false, quota: { limit: 10, used: 0 }, unlockedFields: [] }
) {
  const L = normalizeLand(land);

  const isMember = !!access?.isMember;
  const quotaLimit = Number(access?.quota?.limit ?? 10);
  const quotaUsed = Number(access?.quota?.used ?? 0);

  const unlockedSet = new Set(Array.isArray(access?.unlockedFields) ? access.unlockedFields : []);
  const canSeeAllForThisLand = isMember && unlockedSet.size > 0;

  const canReveal = (fieldKey) => canSeeAllForThisLand || unlockedSet.has(fieldKey);
  const showValue = (fieldKey, realValue, masked) => (canReveal(fieldKey) ? (realValue || "-") : masked);

  const memberUI = `
    <div class="sqw-divider"></div>

    <div style="display:flex; justify-content:space-between; align-items:center;">
      <div class="sqw-h" style="margin:0;">สิทธิ์สมาชิก</div>
      <div style="font-size:12px; opacity:.8;">
        โควตาวันนี้: <b>${quotaUsed}</b> / ${quotaLimit}
      </div>
    </div>

    <div style="font-size:12px; opacity:.75; margin-top:6px;">
      * กด “ดูข้อมูลทั้งหมด” จะใช้โควตา 1 ครั้ง และปลดล็อกข้อมูลติดต่อทั้งหมดของแปลงนี้
    </div>

    <div class="sqw-actions" style="margin-top:10px;">
      <button class="sqw-btn" type="button">แชทกับผู้ขาย</button>

      <button
        class="sqw-btn sqw-pay-btn"
        type="button"
        data-action="unlock-all"
        data-land-id="${L.id ?? ""}"
        ${quotaUsed >= quotaLimit ? "disabled" : ""}
        style="${quotaUsed >= quotaLimit ? "opacity:.5; cursor:not-allowed;" : ""}"
      >
        ดูข้อมูลทั้งหมด (ใช้ 1 ครั้ง)
      </button>
    </div>
  `;

  // ✅ non-member: กดปุ่มแล้วไปเด้ง UnlockPickerModal ใน MapPage
  const nonMemberUI = `
    <div class="sqw-divider"></div>

    <div style="font-size:12px; opacity:.75; margin-top:6px;">
      * กด “ปลดล็อกข้อมูล” แล้วเลือกฟิลด์ที่ต้องการในหน้าต่าง Pop up
    </div>

    <div class="sqw-actions" style="margin-top:10px;">
      <button class="sqw-btn" type="button">แชทกับผู้ขาย</button>

      <button
        class="sqw-btn sqw-pay-btn"
        type="button"
        data-action="open-unlock-picker"
        data-land-id="${L.id ?? ""}"
      >
        คลิกเพื่อปลดล็อคข้อมูล
      </button>
    </div>
  `;

  return `
    <div id="sqw-popup-root">
      <div class="sqw-popup">

        <div class="sqw-head">
          <div class="sqw-pill">${L.owner || "คุณปาลิส (นายหน้า)"}</div>

          <button
            class="sqw-x"
            type="button"
            data-sqw-close="1"
            aria-label="close"
          >×</button>
        </div>

        <div class="sqw-meta">🕒 วันที่ลงข้อมูล ${L.updatedAt || "-"}</div>

        <div class="sqw-grid">
          <div class="sqw-box"><div class="sqw-box-k">ขนาดที่ดิน</div><div class="sqw-box-v">${L.area ?? "-"} ตร.วา</div></div>
          <div class="sqw-box"><div class="sqw-box-k">ไร่-งาน-วา</div><div class="sqw-box-v">${L.raw ?? "-"}</div></div>
          <div class="sqw-box"><div class="sqw-box-k">หน้ากว้างติดถนน</div><div class="sqw-box-v">${L.frontage ?? "-"} ม.</div></div>
          <div class="sqw-box"><div class="sqw-box-k">ขนาดถนน</div><div class="sqw-box-v">${L.roadWidth ?? "-"} ม.</div></div>
        </div>

        <div class="sqw-divider"></div>

        <div class="sqw-row"><span>ราคา/ตร.วา</span><span class="sqw-row-v">${L.pricePerWa ?? "-"} บ.</span></div>
        <div class="sqw-row"><span>ราคารวม</span><span class="sqw-row-v">${L.totalPrice ?? "-"} บ.</span></div>

        <div class="sqw-divider"></div>

        <div class="sqw-h">ข้อมูลติดต่อ</div>

        <div class="sqw-kv">
          <div class="k">เจ้าของ</div>          <div class="v">${showValue("contactOwner", L.contactOwner, "-----")}</div>
          <div class="k">นายหน้า</div>          <div class="v">${showValue("broker", L.broker, "-----")}</div>
          <div class="k">โทร</div>              <div class="v">${showValue("phone", L.phone, "**********")}</div>
          <div class="k">LINE ID</div>          <div class="v">${showValue("line", L.line, "**********")}</div>
          <div class="k">กรอบที่ดิน</div>       <div class="v">${showValue("frame", L.frame, "-----")}</div>
          <div class="k">ข้อมูลโฉนด/ระวาง</div> <div class="v">${showValue("chanote", L.chanote, "-----")}</div>
        </div>

        ${isMember ? memberUI : nonMemberUI}

      </div>
    </div>
  `;
}

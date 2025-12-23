import "../../css/land-popup.css";

// ✅ แปลงวันที่ให้เป็นรูปแบบไทย รองรับ string / Date / Firestore Timestamp / {seconds}
const normalizeDate = (v) => {
  if (!v) return null;

  // 1) string
  if (typeof v === "string") {
    // ถ้าเป็น ISO/รูปแบบที่ Date parse ได้ จะ format ไทยให้
    const parsed = new Date(v);
    if (!Number.isNaN(parsed.getTime())) return parsed.toLocaleDateString("th-TH");
    return v; // ถ้า parse ไม่ได้ คืนเดิม
  }

  // 2) Firestore Timestamp (มี toDate)
  if (typeof v?.toDate === "function") {
    const d = v.toDate();
    return d?.toLocaleDateString?.("th-TH") ?? null;
  }

  // 3) { seconds: ... }
  if (typeof v?.seconds === "number") {
    const d = new Date(v.seconds * 1000);
    return d.toLocaleDateString("th-TH");
  }

  // 4) Date object
  if (v instanceof Date) {
    return v.toLocaleDateString("th-TH");
  }

  return null;
};

function normalizeLand(input = {}) {
  const toNumber = (v) => {
    if (v == null) return null;
    const n = Number(String(v).replace(/,/g, ""));
    return Number.isFinite(n) ? n : null;
  };

  const fmt = (v) => {
    const n = toNumber(v);
    return n == null ? null : n.toLocaleString("en-US");
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

  // รองรับชื่อฟิลด์จากหลายแหล่ง (ปรับเพิ่มได้)
  const areaSqw = input.area ?? input.size ?? input.sqw ?? null;

  return {
    // id สำคัญมาก
    id: input.id ?? input.landId ?? "",

    // header
    owner: input.owner ?? input.ownerTitle ?? input.ownerName ?? "คุณปาลิส (นายหน้า)",
    updatedAt:
      normalizeDate(input.updatedAt) ??
      normalizeDate(input.createdAt) ??
      "05/11/2025",

    // detail
    area: fmt(areaSqw) ?? input.area ?? "429",
    raw:
      input.raw ??
      (input.rai != null
        ? `${input.rai}-${input.ngan}-${input.wah}`
        : sqwToRNW(areaSqw) ?? "1-0-29"),
    frontage: fmt(input.frontage) ?? input.frontage ?? "34",
    roadWidth: fmt(input.roadWidth) ?? input.roadWidth ?? "18",

    // price
    pricePerWa:
      fmt(input.pricePerWa ?? input.pricePerSqw) ?? input.pricePerWa ?? "17,000",
    totalPrice: fmt(input.totalPrice) ?? input.totalPrice ?? "7,293,000",

    // contact (ของจริง)
    contactOwner: input.contactOwner ?? input.ownerContact ?? input.contactName ?? "",
    broker: input.broker ?? input.agent ?? input.agentName ?? "",
    phone: input.phone ?? input.tel ?? "",
    line: input.line ?? input.lineId ?? "",
    frame: input.frame ?? input.landFrame ?? "",
    chanote: input.chanote ?? input.deedInformation ?? "",
  };
}

export default function buildLandPopupHtml(land = {}, isPaid = false) {
  // ✅ normalize ตรงนี้เลย
  const L = normalizeLand(land);

  const owner = L.owner || "คุณปาลิส (นายหน้า)";
  const updatedAt = L.updatedAt || "05/11/2025";

  const area = L.area ?? "429";
  const raw = L.raw ?? "1-0-29";
  const frontage = L.frontage ?? "34";
  const roadWidth = L.roadWidth ?? "18";

  const pricePerWa = L.pricePerWa ?? "17,000";
  const totalPrice = L.totalPrice ?? "7,293,000";

  // ✅ helper: ถ้ายังไม่จ่าย ให้โชว์ค่าปิด
  const show = (realValue, masked = "-----") => (isPaid ? (realValue ?? "-") : masked);

  return `
    <div id="sqw-popup-root">
      <div class="sqw-popup">

        <div class="sqw-head">
          <div class="sqw-pill">${owner}</div>
          <button id="sqwa-close-btn" class="sqw-x" type="button">×</button>
        </div>

        <div class="sqw-meta">🕒 วันที่ลงข้อมูล ${updatedAt}</div>

        <div class="sqw-grid">
          <div class="sqw-box"><div class="sqw-box-k">ขนาดที่ดิน</div><div class="sqw-box-v">${area} ตร.วา</div></div>
          <div class="sqw-box"><div class="sqw-box-k">ไร่-งาน-วา</div><div class="sqw-box-v">${raw}</div></div>
          <div class="sqw-box"><div class="sqw-box-k">หน้ากว้างติดถนน</div><div class="sqw-box-v">${frontage} ม.</div></div>
          <div class="sqw-box"><div class="sqw-box-k">ขนาดถนน</div><div class="sqw-box-v">${roadWidth} ม.</div></div>
        </div>

        <div class="sqw-divider"></div>

        <div class="sqw-row"><span>ราคา/ตร.วา</span><span class="sqw-row-v">${pricePerWa} บ.</span></div>
        <div class="sqw-row"><span>ราคารวม</span><span class="sqw-row-v">${totalPrice} บ.</span></div>

        <div class="sqw-divider"></div>

        <div class="sqw-h">ข้อมูลติดต่อ</div>

        <div class="sqw-kv">
          <div class="k">เจ้าของ</div>          <div class="v">${show(L.contactOwner, "-----")}</div>
          <div class="k">นายหน้า</div>          <div class="v">${show(L.broker, "-----")}</div>
          <div class="k">โทร</div>              <div class="v">${show(L.phone, "**********")}</div>
          <div class="k">LINE ID</div>          <div class="v">${show(L.line, "**********")}</div>
          <div class="k">กรอบที่ดิน</div>       <div class="v">${show(L.frame, "-----")}</div>
          <div class="k">ข้อมูลโฉนด/ระวาง</div> <div class="v">${show(L.chanote, "-----")}</div>
        </div>
        
        <div class="sqw-actions">
          <button class="sqw-btn" type="button">แชทกับผู้ขาย</button>

          ${isPaid ? `` : `
            <button 
              class="sqw-btn sqw-pay-btn" 
              data-land-id="${L.id ?? ""}"
            >
              คลิกเพื่อปลดล็อคข้อมูล
            </button>
          `}
        </div>

      </div>
    </div>
  `;
}

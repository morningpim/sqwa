import { useMemo, useState } from "react";
import "../css/unlock-page.css";

const CATALOG = [
  { key: "owner", label: "เจ้าของ", price: 300, icon: "🧾" },
  { key: "line", label: "โทร/ Line id", price: 300, icon: "📞" },
  { key: "chat", label: "chat กับ เจ้าของที่ดิน", price: 100, icon: "💬" },
  { key: "pdf", label: "ไฟล์กรอบรูปที่ดิน (PDF/CDF)", price: 200, icon: "📄" },
  { key: "deed", label: "ข้อมูลโฉนดที่ดิน", price: 200, icon: "🗂️" },
  { key: "geo", label: "ข้อมูลระหว่างที่ดิน", price: 200, icon: "🗺️" },
  { key: "all", label: "ทั้งหมด", price: 1300, icon: "✅" },
];

export default function UnlockPage() {
  // ตัวอย่าง: ดึง land ที่ส่งมาจาก popup (ถ้าคุณเก็บไว้ใน sessionStorage)
  // const land = JSON.parse(sessionStorage.getItem("SQW_SELECTED_LAND") || "null");

  const [selectedKey, setSelectedKey] = useState("line"); // ค่าเริ่มต้นให้เหมือนในรูป
  const [qty, setQty] = useState(1);

  const selectedItem = useMemo(
    () => CATALOG.find((x) => x.key === selectedKey) ?? CATALOG[0],
    [selectedKey]
  );

  const subtotal = selectedItem.price * qty;
  const total = subtotal; // ในรูปไม่มีส่วนลด/ภาษี

  const onBack = () => {
    // ถ้าใช้ react-router ให้เปลี่ยนเป็น navigate(-1)
    window.history.back();
  };

  const onPay = () => {
    // ตรงนี้คุณจะเอาไปต่อ payment จริง (Stripe/Omise/PromptPay etc.)
    alert(`ชำระเงิน: ${selectedItem.label} x${qty} รวม ฿${total.toLocaleString()}`);
  };

  return (
    <div className="unlock-wrap">
      {/* header */}
      <header className="unlock-topbar">
        <div className="brand">SQW</div>

        <nav className="nav">
          <a href="/">หน้าแรก</a>
          <a href="/news">ข่าวสาร</a>
          <a href="/contact">ติดต่อadmin</a>
          <a href="/faq">แชท</a>
        </nav>

        <div className="top-actions">
          <button className="login-btn" type="button">เข้าสู่ระบบ</button>
          <button className="cart-btn" type="button" aria-label="cart">🛒</button>
        </div>
      </header>

      {/* content */}
      <main className="unlock-main">
        {/* LEFT */}
        <section className="panel left">
          <h1 className="title">ปลดล็อคข้อมูล</h1>
          <div className="sub">ข้อมูลติดต่อ</div>

          <div className="card">
            {CATALOG.map((item) => {
              const checked = item.key === selectedKey;
              return (
                <label key={item.key} className={`row ${checked ? "active" : ""}`}>
                  <span className={`chk ${checked ? "on" : ""}`}>
                    {checked ? "✓" : ""}
                  </span>

                  <span className="name">{item.label}</span>

                  <span className="ico" aria-hidden="true">{item.icon}</span>

                  <span className="price">{item.price.toLocaleString()} บาท</span>

                  <input
                    className="sr-only"
                    type="radio"
                    name="unlock"
                    checked={checked}
                    onChange={() => setSelectedKey(item.key)}
                  />
                </label>
              );
            })}
          </div>

          <div className="left-actions">
            <button className="btn ghost" type="button" onClick={onBack}>ย้อนกลับ</button>
            <button className="btn primary" type="button" onClick={onPay}>ชำระเงิน</button>
          </div>
        </section>

        {/* RIGHT */}
        <aside className="panel right">
          <h2 className="title2">คำสั่งซื้อของคุณ</h2>

          <div className="order-item">
            <div className="order-ico" aria-hidden="true">📞</div>
            <div className="order-meta">
              <div className="order-name">{selectedItem.label}</div>
              <div className="order-price">฿ {selectedItem.price.toLocaleString()}</div>
            </div>

            <div className="qty">
              <button
                className="qty-btn"
                type="button"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                aria-label="decrease"
              >
                −
              </button>
              <div className="qty-val">{qty}</div>
              <button
                className="qty-btn"
                type="button"
                onClick={() => setQty((q) => q + 1)}
                aria-label="increase"
              >
                +
              </button>
            </div>
          </div>

          <div className="sum">
            <div className="sum-row">
              <span>ยอดรวม</span>
              <span>฿ {subtotal.toLocaleString()}</span>
            </div>
            <div className="sum-row">
              <span>ยอดรวม</span>
              <span>฿ {total.toLocaleString()}</span>
            </div>
            <div className="sum-row total">
              <span>รวม</span>
              <span>฿ {total.toLocaleString()}</span>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}

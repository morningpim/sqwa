import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ShoppingCart } from "lucide-react";

const CART_KEY = "sqw_cart_v1";

function readCartCount() {
  try {
    const arr = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
    return Array.isArray(arr) ? arr.length : 0;
  } catch {
    return 0;
  }
}

export default function Navbar() {
  const location = useLocation();
  const [cartCount, setCartCount] = useState(() => readCartCount());

  useEffect(() => {
    const onChanged = () => setCartCount(readCartCount());

    window.addEventListener("sqw-cart-changed", onChanged);
    window.addEventListener("storage", onChanged); // เผื่อเปิดหลายแท็บ

    return () => {
      window.removeEventListener("sqw-cart-changed", onChanged);
      window.removeEventListener("storage", onChanged);
    };
  }, []);

  const isMap = useMemo(() => (location.pathname || "").startsWith("/map"), [location.pathname]);

  const modeLabel = useMemo(() => {
    if (!isMap) return "";
    const sp = new URLSearchParams(location.search || "");
    const mode = sp.get("mode") || "buy";
    return mode === "sell" ? "โหมดขายที่ดิน" : "โหมดซื้อขายที่ดิน";
  }, [isMap, location.search]);

  return (
    <header className="nav">
      <Link to="/" className="nav-logo">
        SQW
      </Link>

      {isMap && <div className="nav-mode-pill">{modeLabel}</div>}

      <div className="nav-right">
        <nav className="nav-menu">
          <Link to="/" className="nav-item">
            หน้าหลัก <span className="nav-caret">▾</span>
          </Link>
          <a href="#news" className="nav-item">
            ข่าวสาร <span className="nav-caret">▾</span>
          </a>
          <a href="#guide" className="nav-item">
            คู่มือการใช้งาน <span className="nav-caret">▾</span>
          </a>
          <a href="#contact" className="nav-item">
            ติดต่อเรา <span className="nav-caret">▾</span>
          </a>
        </nav>

        <Link to="/login">
          <button className="ds-btn ds-btn-outline">เข้าสู่ระบบ</button>
        </Link>

        <Link to="/cart" className="cart-btn" aria-label="cart">
          <ShoppingCart size={20} />
          {cartCount > 0 ? <span className="cart-badge">{cartCount}</span> : null}
        </Link>
      </div>
    </header>
  );
}

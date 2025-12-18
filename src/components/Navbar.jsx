import React from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { ShoppingCart } from "lucide-react";

export default function Navbar() {
  const location = useLocation();
  const [params] = useSearchParams();

  const isMap = location.pathname === "/map";
  const mode = params.get("mode") || "buy";

  const modeLabel =
    mode === "buy"
      ? "โหมดซื้อขายที่ดิน"
      : mode === "sell"
      ? "โหมดฝากขายที่ดิน"
      : "";

  return (
    <header className="nav">
      {/* ซ้าย */}
      <Link to="/" className="nav-logo">
        SQW
      </Link>

      {/* กลาง (แสดงเฉพาะหน้า map) */}
      {isMap && (
        <div className="nav-mode-pill">
          {modeLabel}
        </div>
      )}

      {/* ขวา */}
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
          <button className="ds-btn ds-btn-outline">
            เข้าสู่ระบบ
          </button>
        </Link>
        
        <Link to="/cart" className="cart-btn">
          <ShoppingCart size={20} />
          <span className="cart-badge">2</span>
        </Link>
        
      </div>
    </header>
  );
}

import React from "react";
import { Link, useLocation } from "react-router-dom";

export default function Navbar() {
  const location = useLocation();

  // อ่าน query string
  const params = new URLSearchParams(location.search);
  const mode = params.get("mode");

  const modeLabel =
    mode === "buy"
      ? "ซื้อขาย"
      : mode === "sell"
      ? "ฝากขาย"
      : null;

  return (
    <header className="nav">
      <Link to="/" className="nav-logo">SQW</Link>

      {/*แสดงโหมดเฉพาะหน้า map */}
      {location.pathname === "/map" && modeLabel && (
        <div className="nav-mode">
          โหมดปัจจุบัน: <span>{modeLabel}</span>
        </div>
      )}

      <div className="nav-right">
        <nav className="nav-menu">
          <Link to="/" className="nav-item">
            <span>หน้าหลัก</span><span className="nav-caret">▾</span>
          </Link>

          <a href="#news" className="nav-item">
            <span>ข่าวสาร</span><span className="nav-caret">▾</span>
          </a>

          <a href="#guide" className="nav-item">
            <span>คู่มือการใช้งาน</span><span className="nav-caret">▾</span>
          </a>

          <a href="#contact" className="nav-item">
            <span>ติดต่อเรา</span><span className="nav-caret">▾</span>
          </a>
        </nav>

        <Link to="/login">
          <button className="ds-btn ds-btn-outline">เข้าสู่ระบบ</button>
        </Link>
      </div>
    </header>
  );
}

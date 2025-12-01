import React from "react";
import { Link } from "react-router-dom";

export default function Navbar() {
  const styles = {
    navbar: {
      width: "100%",
      height: "64px",
      background: "#ffffff",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 40px",
      borderBottom: "1px solid #e5e7eb",
      boxSizing: "border-box",
      position: "fixed",
      top: 0,
      left: 0,
      zIndex: 50,
      fontFamily: '"Kaisei Decol", sans-serif', 
    },

    logo: {
      fontSize: "28px",
      fontWeight: "700",
      color: "#065f46", 
      fontFamily: '"Kaisei Decol"', 
      textDecoration: "none",
      letterSpacing: "1px",
    },

    menu: {
      display: "flex",
      alignItems: "center",
      gap: "40px",
      fontSize: "14px",
      color: "#111827",
    },

    menuItem: {
      display: "flex",
      alignItems: "center",
      gap: "6px",
      cursor: "pointer",
      textDecoration: "none",
      color: "#111827",
    },

    caret: {
      fontSize: "10px",
      transform: "translateY(1px)",
    },

    loginBtn: {
      padding: "8px 24px",
      borderRadius: "999px",
      border: "2px solid #FFFFFF",
      background: "linear-gradient(to right, #006838, #34C759)",
      color: "#ffffff",
      cursor: "pointer",
      fontWeight: 600,
      fontSize: "14px",
      boxShadow: "0 0 4px #00C717",
    },
  };

  return (
    <header style={styles.navbar}>
      <a href="#" style={styles.logo}>
        SQW
      </a>

      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <nav style={styles.menu}>
          <a href="#" style={styles.menuItem}>
            <span>หน้าหลัก</span>
            <span style={styles.caret}>▾</span>
          </a>
          <a href="#" style={styles.menuItem}>
            <span>ข่าวสาร</span>
            <span style={styles.caret}>▾</span>
          </a>
          <a href="#" style={styles.menuItem}>
            <span>คู่มือการใช้งาน</span>
            <span style={styles.caret}>▾</span>
          </a>
          <a href="#" style={styles.menuItem}>
            <span>ติดต่อเรา</span>
            <span style={styles.caret}>▾</span>
          </a>
        </nav>
        <Link to="/login"> 
        <button style={styles.loginBtn}>เข้าสู่ระบบ</button>
        </Link>
      </div>
    </header>
  );
}

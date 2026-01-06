import React, { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ShoppingCart, Heart } from "lucide-react";

const CART_KEY = "sqw_cart_v1";
const FAV_KEY = "sqw_favorites_v1";     // ✅ ถ้าคุณใช้ key นี้อยู่
const FAV_EVENT = "sqw-fav-changed";    // ✅ ถ้ามีการ dispatch event นี้

// mock auth (ภายหลังเปลี่ยนเป็น context / api ได้)
const MOCK_USER = {
  name: "Pimpa",
  avatarUrl: "",
};

function readCartCount() {
  try {
    const arr = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
    return Array.isArray(arr) ? arr.length : 0;
  } catch {
    return 0;
  }
}

function readFavCount() {
  try {
    const arr = JSON.parse(localStorage.getItem(FAV_KEY) || "[]");
    return Array.isArray(arr) ? arr.length : 0;
  } catch {
    return 0;
  }
}

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const [cartCount, setCartCount] = useState(() => readCartCount());

  // ✅ fav count
  const [favCount, setFavCount] = useState(() => readFavCount());

  // 🔐 auth state (ชั่วคราว)
  const [isLoggedIn] = useState(true);
  const [user] = useState(MOCK_USER);

  // dropdown
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onChanged = () => setCartCount(readCartCount());
    window.addEventListener("sqw-cart-changed", onChanged);
    window.addEventListener("storage", onChanged);
    return () => {
      window.removeEventListener("sqw-cart-changed", onChanged);
      window.removeEventListener("storage", onChanged);
    };
  }, []);

  // ✅ sync favorites (ถ้าหน้าพร้อม dispatch event นี้)
  useEffect(() => {
    const onFav = () => setFavCount(readFavCount());
    window.addEventListener(FAV_EVENT, onFav);
    window.addEventListener("storage", onFav);
    return () => {
      window.removeEventListener(FAV_EVENT, onFav);
      window.removeEventListener("storage", onFav);
    };
  }, []);

  // ปิด dropdown เมื่อคลิกข้างนอก
  useEffect(() => {
    const onClick = (e) => {
      if (!ref.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  // ✅ helper: กดเมนูแล้วปิด dropdown ด้วย
  const go = useCallback(
    (to) => {
      setOpen(false);
      navigate(to);
    },
    [navigate]
  );

  const isMap = useMemo(() => (location.pathname || "").startsWith("/map"), [location.pathname]);

  const modeLabel = useMemo(() => {
    if (!isMap) return "";
    const sp = new URLSearchParams(location.search || "");
    return sp.get("mode") === "sell" ? "โหมดขายที่ดิน" : "โหมดซื้อขายที่ดิน";
  }, [isMap, location.search]);

  const avatarLetter = (user?.name?.[0] || "U").toUpperCase();

  return (
    <header className="nav">
      <Link to="/" className="nav-logo">SQW</Link>

      {isMap && <div className="nav-mode-pill">{modeLabel}</div>}

      <div className="nav-right">
        <nav className="nav-menu">
          <Link to="/" className="nav-item">หน้าหลัก</Link>
          <a href="#news" className="nav-item">ข่าวสาร</a>
          <a href="#guide" className="nav-item">คู่มือการใช้งาน</a>
          <a href="#contact" className="nav-item">ติดต่อเรา</a>
        </nav>

        {/* 🔐 Auth section */}
        {!isLoggedIn ? (
          <Link to="/login">
            <button className="ds-btn ds-btn-outline">เข้าสู่ระบบ</button>
          </Link>
        ) : (
          <div className="nav-profile" ref={ref}>
            <button
              className="nav-avatar"
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-label="profile"
              aria-expanded={open}
            >
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt="avatar" />
              ) : (
                <span>{avatarLetter}</span>
              )}
            </button>

            {open && (
              <div className="nav-profile-menu" role="menu">
                <div className="nav-profile-name">{user.name}</div>

                <button type="button" onClick={() => go("/profile")}>
                  โปรไฟล์
                </button>

                <button type="button" onClick={() => go("/profile?tab=fav")}>
                  รายการโปรด {favCount > 0 ? `(${favCount})` : ""}
                </button>

                <div className="nav-profile-divider" />

                <button type="button" className="danger" onClick={() => { setOpen(false); /* TODO logout */ }}>
                  ออกจากระบบ
                </button>
              </div>
            )}
          </div>
        )}

        <Link to="/cart" className="cart-btn" aria-label="cart">
          <ShoppingCart size={20} />
          {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
        </Link>
      </div>
    </header>
  );
}

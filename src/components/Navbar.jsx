import React, {
  useEffect,
  useMemo,
  useState,
  useRef,
  useCallback,
} from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ShoppingCart, ShieldCheck } from "lucide-react";

import { readFavorites, subscribeFavoritesChanged } from "../utils/favorites";
import { useAuth } from "../auth/AuthProvider";

const CART_KEY = "sqw_cart_v1";

// ======================
// ✅ MODE CONFIG
// ======================
const MODE_LABEL_MAP = {
  buy: "โหมดซื้อขายที่ดิน",
  sell: "โหมดขายฝากที่ดิน",
  eia: "Future Project & EIA base map",
  //auction: "โหมดประมูลที่ดิน",
};

const DEFAULT_MODE = "buy";

// mock user
const MOCK_USER = { name: "Pimpa", avatarUrl: "" };

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
  const navigate = useNavigate();

  // ✅ role จาก auth
  const { role } = useAuth();
  const isAdmin = role === "admin";

  const [cartCount, setCartCount] = useState(() => readCartCount());
  const [favCount, setFavCount] = useState(() => readFavorites().length);

  // 🔐 auth state (ชั่วคราว)
  const [isLoggedIn] = useState(true);
  const [user] = useState(MOCK_USER);

  // dropdown
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // cart sync
  useEffect(() => {
    const onChanged = () => setCartCount(readCartCount());
    window.addEventListener("sqw-cart-changed", onChanged);
    window.addEventListener("storage", onChanged);
    return () => {
      window.removeEventListener("sqw-cart-changed", onChanged);
      window.removeEventListener("storage", onChanged);
    };
  }, []);

  // favorites sync
  useEffect(() => {
    setFavCount(readFavorites().length);
    const unsub = subscribeFavoritesChanged(() =>
      setFavCount(readFavorites().length)
    );
    return unsub;
  }, []);

  // ปิด dropdown เมื่อคลิกข้างนอก
  useEffect(() => {
    const onClick = (e) => {
      if (!ref.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const go = useCallback(
    (to) => {
      setOpen(false);
      navigate(to);
    },
    [navigate]
  );

  const isMap = useMemo(
    () => (location.pathname || "").startsWith("/map"),
    [location.pathname]
  );

  // ======================
  // ✅ MODE LABEL LOGIC
  // ======================
  const modeLabel = useMemo(() => {
    if (!isMap) return "";

    const sp = new URLSearchParams(location.search || "");
    const mode = sp.get("mode");

    return MODE_LABEL_MAP[mode] || MODE_LABEL_MAP[DEFAULT_MODE];
  }, [isMap, location.search]);

  const avatarLetter = (user?.name?.[0] || "U").toUpperCase();

  return (
    <header className="nav">
      <Link to="/" className="nav-logo">
        SQW
      </Link>

      {isMap && <div className="nav-mode-pill">{modeLabel}</div>}

      <div className="nav-right">
        <nav className="nav-menu">
          <Link to="/" className="nav-item">
            หน้าหลัก
          </Link>
          <a href="#news" className="nav-item">
            ข่าวสาร
          </a>
          <a href="#guide" className="nav-item">
            คู่มือการใช้งาน
          </a>
          <a href="#contact" className="nav-item">
            ติดต่อเรา
          </a>

          {isAdmin && (
            <button
              type="button"
              className="nav-admin-chip"
              onClick={() => navigate("/admin?tab=dashboard")}
              title="ไปหน้า Admin"
            >
              <ShieldCheck size={16} />
              Admin
            </button>
          )}
        </nav>

        {/* Auth section */}
        {!isLoggedIn ? (
          <Link to="/login">
            <button className="ds-btn ds-btn-outline" type="button">
              เข้าสู่ระบบ
            </button>
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

                <button
                  type="button"
                  onClick={() => go("/profile?tab=purchase")}
                >
                  ประวัติการซื้อ
                </button>

                {isAdmin && (
                  <>
                    <div className="nav-profile-divider" />
                    <div className="nav-profile-section">
                      <div className="nav-profile-section-title">
                        <ShieldCheck size={16} />
                        เครื่องมือแอดมิน
                      </div>

                      <button
                        type="button"
                        className="admin"
                        onClick={() => go("/admin?tab=dashboard")}
                      >
                        Admin Dashboard
                      </button>

                      <button
                        type="button"
                        className="admin"
                        onClick={() => go("/admin?tab=broadcast")}
                      >
                        Broadcast & Line ADs
                      </button>

                      <button
                        type="button"
                        className="admin"
                        onClick={() => go("/admin?tab=lands")}
                      >
                        จัดการประกาศ
                      </button>
                    </div>
                  </>
                )}

                <div className="nav-profile-divider" />

                <button
                  type="button"
                  className="danger"
                  onClick={() => {
                    setOpen(false);
                    // TODO logout
                  }}
                >
                  ออกจากระบบ
                </button>
              </div>
            )}
          </div>
        )}

        <Link to="/cart" className="cart-btn" aria-label="cart">
          <ShoppingCart size={20} />
          {cartCount > 0 && (
            <span className="cart-badge">{cartCount}</span>
          )}
        </Link>
      </div>
    </header>
  );
}

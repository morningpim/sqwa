import React, {
  useEffect,
  useMemo,
  useState,
  useRef,
  useCallback
} from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ShoppingCart, ShieldCheck } from "lucide-react";
import { useTranslation } from "react-i18next";

import { readFavorites, subscribeFavoritesChanged } from "../utils/favorites";
import { useAuth } from "../auth/AuthProvider";
import { changeLanguage, getCurrentLanguage } from "../i18n/changeLanguage";

const CART_KEY = "sqw_cart_v1";
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
  const { t, i18n } = useTranslation("common");
  const location = useLocation();
  const navigate = useNavigate();

  const { role } = useAuth();
  const isAdmin = role === "admin";

  const [cartCount, setCartCount] = useState(readCartCount);
  const [favCount, setFavCount] = useState(() => readFavorites().length);

  const [isLoggedIn] = useState(true);
  const [user] = useState(MOCK_USER);

  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const currentLang = i18n.language || getCurrentLanguage();

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

  // close dropdown on outside click
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
    () => location.pathname.startsWith("/map"),
    [location.pathname]
  );

  // MODE LABEL (i18n)
  const modeLabel = useMemo(() => {
    if (!isMap) return "";
    const sp = new URLSearchParams(location.search || "");
    const mode = sp.get("mode") || DEFAULT_MODE;
    return t(`nav.mode.${mode}`);
  }, [isMap, location.search, t]);

  const avatarLetter = (user?.name?.[0] || "U").toUpperCase();

  return (
    <header className="nav">
      <Link to="/" className="nav-logo">SQW</Link>

      {isMap && <div className="nav-mode-pill">{modeLabel}</div>}

      <div className="nav-right">
        <nav className="nav-menu">
          <Link to="/" className="nav-item">{t("nav.home")}</Link>
          <a href="#news" className="nav-item">{t("nav.news")}</a>
          <a href="#guide" className="nav-item">{t("nav.guide")}</a>
          <a href="#contact" className="nav-item">{t("nav.contact")}</a>

          {isAdmin && (
            <button
              type="button"
              className="nav-admin-chip"
              onClick={() => navigate("/admin?tab=dashboard")}
              title={t("nav.admin.go")}
            >
              <ShieldCheck size={16} />
              Admin
            </button>
          )}
        </nav>

        {/* Profile */}
        <div className="nav-profile" ref={ref}>
          <button
            className="nav-avatar"
            type="button"
            onClick={() => setOpen(v => !v)}
            aria-expanded={open}
          >
            {user.avatarUrl ? <img src={user.avatarUrl} alt="avatar" /> : <span>{avatarLetter}</span>}
          </button>

          {open && (
            <div className="nav-profile-menu">
              <div className="nav-profile-name">{user.name}</div>

              <button onClick={() => go("/profile")}>{t("nav.profile")}</button>
              <button onClick={() => go("/profile?tab=fav")}>
                {t("nav.favorites")} {favCount > 0 && `(${favCount})`}
              </button>
              <button onClick={() => go("/profile?tab=purchase")}>
                {t("nav.purchases")}
              </button>

              {isAdmin && (
                <>
                  <div className="nav-profile-divider" />
                  <div className="nav-profile-section">
                    <div className="nav-profile-section-title">
                      <ShieldCheck size={16} />
                      {t("nav.admin.section")}
                    </div>
                    <button onClick={() => go("/admin?tab=dashboard")}>
                      {t("nav.admin.dashboard")}
                    </button>
                    <button onClick={() => go("/admin?tab=broadcast")}>
                      {t("nav.admin.broadcast")}
                    </button>
                    <button onClick={() => go("/admin?tab=lands")}>
                      {t("nav.admin.lands")}
                    </button>
                  </div>
                </>
              )}

              <div className="nav-profile-divider" />
              <button className="danger">{t("nav.logout")}</button>
            </div>
          )}
        </div>

        {/* Cart */}
        <Link to="/cart" className="cart-btn">
          <ShoppingCart size={20} />
          {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
        </Link>

        {/* Language Switch */}
        <div className="nav-lang-switch">
          <button
            className={`nav-lang-btn ${currentLang === "th" ? "active" : ""}`}
            onClick={() => changeLanguage("th")}
          >
            TH
          </button>
          <span>|</span>
          <button
            className={`nav-lang-btn ${currentLang === "en" ? "active" : ""}`}
            onClick={() => changeLanguage("en")}
          >
            EN
          </button>
        </div>
      </div>
    </header>
  );
}

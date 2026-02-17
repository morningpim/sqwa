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

  const { me, logout } = useAuth();
  const role = me?.role;
  const isLoggedIn = !!me;
  const isAdmin = useMemo(()=> role === "admin",[role]);

  const [cartCount, setCartCount] = useState(readCartCount);
  const [favCount, setFavCount] = useState(() => readFavorites().length);

  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const [modeOpen, setModeOpen] = useState(false);
  const modeRef = useRef(null);

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

  // close dropdowns on outside click (merged)
  useEffect(()=>{
    const onClick = e => {
      if (!e.target) return;

      if (ref.current && !ref.current.contains(e.target))
        setOpen(false);

      if (modeRef.current && !modeRef.current.contains(e.target))
        setModeOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return ()=> document.removeEventListener("mousedown", onClick);
  },[]);

  useEffect(()=>{
    setOpen(false);
    setModeOpen(false);
  },[location.pathname]);

  useEffect(()=>{
    const esc = e=>{
      if(e.key==="Escape"){
        setOpen(false);
        setModeOpen(false);
      }
    };
    window.addEventListener("keydown",esc);
    return ()=>window.removeEventListener("keydown",esc);
  },[]);

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

  const currentMode = useMemo(() => {
    const sp = new URLSearchParams(location.search || "");
    return sp.get("mode") || DEFAULT_MODE;
  }, [location.search]);


  // MODE LABEL (i18n)
  const modeLabel = useMemo(() => {
    if (!isMap) return "";
    const sp = new URLSearchParams(location.search || "");
    const mode = sp.get("mode") || DEFAULT_MODE;
    return t(`nav.mode.${mode}`);
  }, [isMap, location.search, t]);

  const avatarLetter = useMemo(
    () => (me?.name?.charAt(0) || "U").toUpperCase(),
    [me?.name]
  );

  const changeMode = (mode) => {
    const sp = new URLSearchParams(location.search || "");
    sp.set("mode", mode);

    navigate(`${location.pathname}?${sp.toString()}`, {
      replace: true
    });

    setModeOpen(false);
  };

  return (
    <header className="nav">
      <Link to="/" className="nav-logo">SQW</Link>

      {isMap && (
        <div className="nav-mode" ref={modeRef}>
          <button
            type="button"
            className="nav-mode-pill clickable"
            onClick={() => setModeOpen(v => !v)}
            aria-expanded={modeOpen}
          >
            {modeLabel}
            <span className="chevron">▾</span>
          </button>

          {modeOpen && (
            <div className="nav-mode-menu">
              <button
                className={currentMode === "buy" ? "active" : ""}
                onClick={() => changeMode("buy")}
              >
                {t("nav.mode.buy")}
              </button>

              <button
                className={currentMode === "sell" ? "active" : ""}
                onClick={() => changeMode("sell")}
              >
                {t("nav.mode.sell")}
              </button>

              <button
                className={currentMode === "eia" ? "active" : ""}
                onClick={() => changeMode("eia")}
              >
                {t("nav.mode.eia")}
              </button>
            </div>
          )}
        </div>
      )}

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

        {/* Profile / Auth */}
          {isLoggedIn ? (
            <div className="nav-profile" ref={ref}>
              <button
                className="nav-avatar"
                aria-label="User menu"
                type="button"
                onClick={() => setOpen(v => !v)}
                aria-expanded={open}
              >
                {me?.photoURL
                  ? <img src={me.photoURL} alt="avatar" />
                  : <span>{avatarLetter}</span>
                }
              </button>

              {open && (
                <div className="nav-profile-menu">
                  <div className="nav-profile-name">{me?.name}</div>

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
                  <button
                    className="danger"
                    onClick={()=>{
                      setOpen(false);
                      setModeOpen(false);
                      logout();
                      navigate("/");
                    }}
                  >
                    {t("nav.logout")}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="nav-auth">
              <button
                className="nav-signin"
                onClick={() => navigate("/login")}
              >
                Sign In
              </button>

              <button
                className="nav-signin"
                onClick={() => navigate("/login?signup=1")}
              >
                Sign up
              </button>
            </div>
          )}

        {/* Cart */}
        {isLoggedIn && (
          <Link to="/cart" className="cart-btn">
            <ShoppingCart size={20} />
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </Link>
        )}

        {/* Language Switch */}
        <div className="nav-lang-switch">
          <button
            className={`nav-lang-flag ${currentLang === "th" ? "active" : ""}`}
            onClick={() => changeLanguage("th")}
          >
            <img src="/flags/th.png" alt="Thai" />
          </button>

          <button
            className={`nav-lang-flag ${currentLang === "en" ? "active" : ""}`}
            onClick={() => changeLanguage("en")}
          >
            <img src="/flags/en.png" alt="English" />
          </button>
        </div>
      </div>
    </header>
  );
}

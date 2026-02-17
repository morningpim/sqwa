import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "../css/profile.css";

import { readFavorites, removeFavorite, subscribeFavoritesChanged } from "../utils/favorites";
import { readPurchases, removePurchase, subscribePurchasesChanged } from "../utils/purchases";
import { readAllLands, removeLand, subscribeLandsChanged } from "../utils/landsLocal";
import { useAuth } from "../auth/AuthProvider";

/* ---------------- QUERY ---------------- */

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search || ""), [search]);
}

/* ---------------- TABS ---------------- */

const VALID_TABS = ["info", "fav", "purchase", "posts", "settings"];

/* ========================================================= */

export default function ProfilePage() {
  const navigate = useNavigate();
  const { t } = useTranslation("profile");
  const q = useQuery();
  const tab = (q.get("tab") || "info").toLowerCase();

  const { me, loading } = useAuth();

  const [favorites, setFavorites] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [posts, setPosts] = useState([]);

  /* ---------------- AUTH GUARD ---------------- */

  useEffect(() => {
    if (!loading && !me) navigate("/login");
  }, [loading, me, navigate]);

  /* ---------------- TAB GUARD ---------------- */

  useEffect(() => {
    if (!VALID_TABS.includes(tab)) {
      navigate("/profile?tab=info", { replace: true });
    }
  }, [tab, navigate]);

  /* ---------------- DATA LOADERS ---------------- */

  useEffect(() => {
    setFavorites(readFavorites());
    return subscribeFavoritesChanged(() => {
      setFavorites(readFavorites());
    });
  }, []);

  useEffect(() => {
    setPurchases(readPurchases());
    return subscribePurchasesChanged(() => {
      setPurchases(readPurchases());
    });
  }, []);

  useEffect(() => {
    const load = () =>
      setPosts(readAllLands().filter(p => p.ownerId === me?.uid));

    load();
    return subscribeLandsChanged(load);
  }, [me]);

  /* ---------------- NAV ---------------- */

  const goTab = (name) => navigate(`/profile?tab=${name}`);

  /* ---------------- DELETE ---------------- */

  const deletePost = (id) => {
    if (!window.confirm(t("posts.confirmDelete"))) return;
    removeLand(id);
  };

  /* ---------------- LOADING ---------------- */

  if (loading)
    return <div className="center-screen">Loading...</div>;

  /* ========================================================= */

  return (
    <div className="profile-page">
      <div className="profile-container">

        <ProfileHeader me={me} navigate={navigate} t={t} />

        <Stats posts={posts} favorites={favorites} purchases={purchases} t={t} />

        <div className="profile-grid">

          <Sidebar tab={tab} goTab={goTab} t={t} />

          <Content
            tab={tab}
            posts={posts}
            favorites={favorites}
            purchases={purchases}
            deletePost={deletePost}
            navigate={navigate}
            removeFavorite={removeFavorite}
            removePurchase={removePurchase}
            t={t}
            me={me}
          />

        </div>
      </div>
    </div>
  );
}

/* ========================================================= */
/* ===================== COMPONENTS ======================== */
/* ========================================================= */

function ProfileHeader({ me, navigate, t }) {
  return (
    <div className="profile-header">
      <div className="profile-avatar">
        {(me?.name?.[0] || me?.email?.[0] || "U").toUpperCase()}
      </div>

      <div className="profile-meta">
        <div className="profile-name">{me?.name || "Guest"}</div>
        <div className="profile-sub">{t("header.member")}</div>
      </div>

      <button
        className="ds-btn ds-btn-outline"
        onClick={() => navigate("/profile/edit")}
      >
        {t("header.editProfile")}
      </button>
    </div>
  );
}

/* ---------------- STATS ---------------- */

function Stats({ posts, favorites, purchases, t }) {
  return (
    <div className="profile-stats">
      <Stat value={posts.length} label={t("stats.posts")} />
      <Stat value={favorites.length} label={t("stats.favorites")} />
      <Stat value={purchases.length} label={t("stats.purchases")} />
    </div>
  );
}

const Stat = ({ value, label }) => (
  <div className="stat-card">
    <div className="stat-num">{value}</div>
    <div className="stat-label">{label}</div>
  </div>
);

/* ---------------- SIDEBAR ---------------- */

function Sidebar({ tab, goTab, t }) {
  const items = [
    ["info", t("menu.info")],
    ["fav", t("menu.favorites")],
    ["purchase", t("menu.purchases")],
    ["posts", t("menu.posts")],
    ["settings", t("menu.settings")]
  ];

  return (
    <aside className="profile-side">
      <div className="side-title">{t("menu.title")}</div>

      {items.map(([key, label]) => (
        <button
          key={key}
          className={`side-item ${tab === key ? "active" : ""}`}
          onClick={() => goTab(key)}
        >
          {label}
        </button>
      ))}
    </aside>
  );
}

/* ---------------- CONTENT SWITCH ---------------- */

function Content(props) {
  switch (props.tab) {
    case "posts":
      return <PostsTab {...props} />;
    case "fav":
      return <FavoritesTab {...props} />;
    case "purchase":
      return <PurchasesTab {...props} />;
    case "info":
      return <InfoTab {...props} />;
    default:
      return <ComingSoon t={props.t} />;
  }
}

/* ========================================================= */
/* ======================= TABS ============================ */
/* ========================================================= */

function PostsTab({ posts, t, deletePost, navigate }) {
  return (
    <section className="profile-content">
      <Header title={t("posts.title")} sub={t("posts.subtitle")} count={posts.length} />

      {posts.length === 0 ? (
        <Empty
          title={t("posts.emptyTitle")}
          sub={t("posts.emptySub")}
          btn={t("posts.goMapSell")}
          onClick={() => navigate("/map?mode=buy")}
        />
      ) : (
        <div className="purchase-grid">
          {posts.map(p => (
            <div key={p.id} className="purchase-card">

              <div className="purchase-top">
                <div className="purchase-title">
                  {p.owner || p.agent || t("common.unknown")}
                </div>
              </div>

              <Row label={t("posts.size")} value={Number(p.size || 0).toLocaleString()} />
              <Row label={t("posts.price")} value={Number(p.totalPrice || 0).toLocaleString()} />
              <Row label={t("posts.phone")} value={p.phone || "-"} />

              <div className="fav-actions fav-actions--row fav-actions--lg">
                <button className="ds-btn ds-btn-outline" onClick={()=>navigate(`/map?focus=${p.id}`)}>
                  {t("posts.viewMap")}
                </button>

                <button className="danger-btn" onClick={()=>deletePost(p.id)}>
                  {t("posts.delete")}
                </button>
              </div>

            </div>
          ))}
        </div>
      )}
    </section>
  );
}

/* ---------------- FAVORITES ---------------- */

function FavoritesTab({ favorites, removeFavorite, t }) {
  return (
    <section className="profile-content">
      <Header title={t("favorites.title")} sub={t("favorites.subtitle")} count={favorites.length} />

      {favorites.map(f => (
        <div key={f.id} className="fav-card">
          <div className="fav-top">
            <div>{f.owner}</div>

            <button
              className="fav-delete-icon"
              onClick={() => {
                if (window.confirm(t("favorites.confirmRemove")))
                  removeFavorite(f.id);
              }}
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </section>
  );
}

/* ---------------- PURCHASES ---------------- */

function PurchasesTab({ purchases, removePurchase, t }) {
  return (
    <section className="profile-content">
      <Header title={t("purchases.title")} sub={t("purchases.subtitle")} count={purchases.length} />

      {purchases.map(p => (
        <div key={p.id} className="purchase-card">
          <Row label={t("purchases.seller")} value={p.seller} />
          <Row label={t("purchases.total")} value={p.totalPrice} />

          <button
            className="ds-btn ds-btn-outline"
            onClick={()=>{
              if(window.confirm("Delete purchase?"))
                removePurchase(p.id);
            }}
          >
            {t("purchases.delete")}
          </button>
        </div>
      ))}
    </section>
  );
}

/* ---------------- INFO ---------------- */

function InfoTab({ me, t }) {
  const fields = [
    ["Name", me?.name],
    ["Email", me?.email],
    ["Phone", me?.phone],
    ["Role", me?.role],
    ["UID", me?.uid],
    ["Joined", me?.createdAt && new Date(me.createdAt).toLocaleDateString()]
  ];

  return (
    <section className="profile-content">
      <Header title={t("info.title")} sub={t("info.subtitle")} />

      <div className="info-card">
        {fields.map(([label,value])=>(
          <Row key={label} label={label} value={value}/>
        ))}
      </div>
    </section>
  );
}


/* ========================================================= */
/* ================= SHARED UI ============================= */
/* ========================================================= */

const Header = ({ title, sub, count }) => (
  <div className="content-head">
    <div>
      <div className="content-title">{title}</div>
      <div className="content-sub">{sub}</div>
    </div>
    {count !== undefined && <div className="content-pill">{count}</div>}
  </div>
);

const Row = ({ label, value }) => (
  <div className="fav-row">
    <span className="muted">{label}</span>
    <b>{value || "-"}</b>
  </div>
);

const Empty = ({ title, sub, btn, onClick }) => (
  <div className="empty-state">
    <div className="empty-title">{title}</div>
    <div className="empty-sub">{sub}</div>
    {btn && <button className="outline-btn" onClick={onClick}>{btn}</button>}
  </div>
);

const ComingSoon = ({ t }) => (
  <section className="profile-content">
    <Empty title={t("common.notReady")} sub={t("common.comingSoon")} />
  </section>
);

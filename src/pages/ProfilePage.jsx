import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "../css/profile.css";

import { readFavorites, removeFavorite, subscribeFavoritesChanged } from "../utils/favorites";
import { readPurchases, removePurchase, subscribePurchasesChanged } from "../utils/purchases";
import { readAllLands, removeLand, subscribeLandsChanged } from "../utils/landsLocal";

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search || ""), [search]);
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const { t } = useTranslation("profile");
  const q = useQuery();
  const tab = (q.get("tab") || "info").toLowerCase();

  const [favorites, setFavorites] = useState(() => readFavorites());
  const [purchases, setPurchases] = useState(() => readPurchases());
  const [posts, setPosts] = useState(() => readAllLands());

  useEffect(() => {
    setFavorites(readFavorites());
    const unsub = subscribeFavoritesChanged(() => setFavorites(readFavorites()));
    return unsub;
  }, []);

  useEffect(() => {
    setPurchases(readPurchases());
    const unsub = subscribePurchasesChanged(() => setPurchases(readPurchases()));
    return unsub;
  }, []);

  useEffect(() => {
    setPosts(readAllLands());
    const unsub = subscribeLandsChanged(() => setPosts(readAllLands()));
    return unsub;
  }, []);

  const goTab = (tname) => navigate(`/profile?tab=${tname}`);

  const onDeletePost = (id) => {
    if (!id) return;
    if (!window.confirm(t("posts.confirmDelete"))) return;
    removeLand(id);
  };

  return (
    <div className="profile-page">
      <div className="profile-container">
        {/* header */}
        <div className="profile-header">
          <div className="profile-avatar">P</div>
          <div className="profile-meta">
            <div className="profile-name">Pimpa Naree</div>
            <div className="profile-sub">{t("header.member")}</div>
          </div>
          <button className="profile-edit-btn" type="button">
            {t("header.editProfile")}
          </button>
        </div>

        {/* stats */}
        <div className="profile-stats">
          <div className="stat-card">
            <div className="stat-num">{posts.length}</div>
            <div className="stat-label">{t("stats.posts")}</div>
          </div>
          <div className="stat-card">
            <div className="stat-num">{favorites.length}</div>
            <div className="stat-label">{t("stats.favorites")}</div>
          </div>
          <div className="stat-card">
            <div className="stat-num">{purchases.length}</div>
            <div className="stat-label">{t("stats.purchases")}</div>
          </div>
        </div>

        {/* layout */}
        <div className="profile-grid">
          {/* left menu */}
          <aside className="profile-side">
            <div className="side-title">{t("menu.title")}</div>

            <button className={`side-item ${tab === "info" ? "active" : ""}`} onClick={() => goTab("info")}>
              {t("menu.info")}
            </button>

            <button className={`side-item ${tab === "fav" ? "active" : ""}`} onClick={() => goTab("fav")}>
              {t("menu.favorites")}
            </button>

            <button className={`side-item ${tab === "purchase" ? "active" : ""}`} onClick={() => goTab("purchase")}>
              {t("menu.purchases")}
            </button>

            <button className={`side-item ${tab === "posts" ? "active" : ""}`} onClick={() => goTab("posts")}>
              {t("menu.posts")}
            </button>

            <button className={`side-item ${tab === "settings" ? "active" : ""}`} onClick={() => goTab("settings")}>
              {t("menu.settings")}
            </button>
          </aside>

          {/* right content */}
          <section className="profile-content">
            {tab === "posts" ? (
              <>
                <div className="content-head">
                  <div>
                    <div className="content-title">{t("posts.title")}</div>
                    <div className="content-sub">{t("posts.subtitle")}</div>
                  </div>
                  <div className="content-pill">{posts.length}</div>
                </div>

                {posts.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-title">{t("posts.emptyTitle")}</div>
                    <div className="empty-sub">{t("posts.emptySub")}</div>
                    <button className="outline-btn" onClick={() => navigate(`/map?mode=buy`)}>
                      {t("posts.goMapSell")}
                    </button>
                  </div>
                ) : (
                  <div className="purchase-grid">
                    {posts.map((p) => (
                      <div key={p.id} className="purchase-card">
                        <div className="purchase-top">
                          <div className="purchase-title">
                            {p.owner || p.agent || t("common.unknown")}
                          </div>
                          <span className="purchase-status paid">
                            {p.updatedAt
                              ? t("posts.updated", { date: p.updatedAt })
                              : t("stats.posts")}
                          </span>
                        </div>

                        <div className="fav-row">
                          <span className="muted">{t("posts.size")}</span>
                          <b>{Number(p.size || 0).toLocaleString("th-TH")}</b>
                        </div>

                        <div className="fav-row">
                          <span className="muted">{t("posts.price")}</span>
                          <b>{Number(p.totalPrice || 0).toLocaleString("th-TH")}</b>
                        </div>

                        <div className="fav-row">
                          <span className="muted">{t("posts.phone")}</span>
                          <b>{p.phone || "-"}</b>
                        </div>

                        <div className="fav-actions">
                          <button className="outline-btn" onClick={() => navigate(`/map?mode=buy&focus=${p.id}`)}>
                            {t("posts.viewMap")}
                          </button>
                          <button className="primary-btn" onClick={() => navigate(`/map?mode=buy&focus=${p.id}`)}>
                            {t("posts.edit")}
                          </button>
                          <button className="danger-btn" onClick={() => onDeletePost(p.id)}>
                            {t("posts.delete")}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : tab === "fav" ? (
              <>
                <div className="content-head">
                  <div>
                    <div className="content-title">{t("favorites.title")}</div>
                    <div className="content-sub">{t("favorites.subtitle")}</div>
                  </div>
                  <div className="content-pill">{favorites.length}</div>
                </div>

                {favorites.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-title">{t("favorites.emptyTitle")}</div>
                    <div className="empty-sub">{t("favorites.emptySub")}</div>
                    <button className="outline-btn" onClick={() => navigate(`/map?mode=buy`)}>
                      {t("favorites.openMap")}
                    </button>
                  </div>
                ) : (
                  <div className="fav-grid">
                    {favorites.map((f) => (
                      <div key={f.id} className="fav-card">
                        <div className="fav-top">
                          <div className="fav-owner">{f.owner || "—"}</div>
                          <button
                            className="fav-remove"
                            title={t("favorites.removeTitle")}
                            onClick={() => removeFavorite(f.id)}
                          >
                            {t("favorites.remove")}
                          </button>
                        </div>

                        <div className="fav-row">
                          <span className="muted">{t("favorites.date")}</span>
                          <b>{f.updatedAt || "-"}</b>
                        </div>

                        <div className="fav-row">
                          <span className="muted">{t("favorites.area")}</span>
                          <b>{f.area || "-"}</b>
                        </div>

                        <div className="fav-row">
                          <span className="muted">{t("favorites.price")}</span>
                          <b>{f.totalPrice || "-"}</b>
                        </div>

                        <div className="fav-actions">
                          <button className="outline-btn" onClick={() => navigate(`/map?mode=buy`)}>
                            {t("favorites.openMap")}
                          </button>
                          <button className="primary-btn">{t("favorites.chat")}</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : tab === "purchase" ? (
              <>
                <div className="content-head">
                  <div>
                    <div className="content-title">{t("purchases.title")}</div>
                    <div className="content-sub">{t("purchases.subtitle")}</div>
                  </div>
                  <div className="content-pill">{purchases.length}</div>
                </div>

                {purchases.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-title">{t("purchases.emptyTitle")}</div>
                    <div className="empty-sub">{t("purchases.emptySub")}</div>
                  </div>
                ) : (
                  <div className="purchase-grid">
                    {purchases.map((p) => (
                      <div key={p.id} className="purchase-card">
                        <div className="purchase-top">
                          <div className="purchase-title">{p.title || "-"}</div>
                          <span className={`purchase-status ${p.status || "paid"}`}>
                            {t(`purchases.status.${p.status || "paid"}`)}
                          </span>
                        </div>

                        <div className="fav-row">
                          <span className="muted">{t("purchases.seller")}</span>
                          <b>{p.seller || "-"}</b>
                        </div>

                        <div className="fav-row">
                          <span className="muted">{t("purchases.paidAt")}</span>
                          <b>{p.paidAt || "-"}</b>
                        </div>

                        <div className="fav-row">
                          <span className="muted">{t("purchases.total")}</span>
                          <b>{p.totalPrice || "-"}</b>
                        </div>

                        <div className="fav-actions">
                          <button className="outline-btn" onClick={() => navigate(`/map?mode=buy`)}>
                            {t("purchases.viewLand")}
                          </button>
                          <button className="danger-btn" onClick={() => removePurchase(p.id)}>
                            {t("purchases.delete")}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : tab === "info" ? (
              <>
                <div className="content-head">
                  <div>
                    <div className="content-title">{t("info.title")}</div>
                    <div className="content-sub">{t("info.subtitle")}</div>
                  </div>
                </div>

                <div className="info-card">
                  <div className="info-row">
                    <div className="k">{t("info.name")}</div>
                    <div className="v">Pimpa Naree</div>
                  </div>
                  <div className="info-row">
                    <div className="k">{t("info.phone")}</div>
                    <div className="v">081-234-5678</div>
                  </div>
                  <div className="info-row">
                    <div className="k">{t("info.line")}</div>
                    <div className="v">bee.land</div>
                  </div>
                  <div className="info-row">
                    <div className="k">{t("info.status")}</div>
                    <div className="v">
                      <span className="badge">{t("header.member")}</span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="empty-state">
                  <div className="empty-title">{t("common.notReady")}</div>
                  <div className="empty-sub">{t("common.comingSoon")}</div>
                </div>
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

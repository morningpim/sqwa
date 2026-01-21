import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "../../css/profile.css";

import {
  readAllLands,
  removeLand,
  subscribeLandsChanged,
} from "../../utils/landsLocal";

import {
  readAllCampaigns,
  removeCampaign,
  subscribeCampaignsChanged,
} from "../../utils/broadcastLocal";

import {
  readAllApplicants,
  removeApplicant,
  subscribeApplicantsChanged,
  updateApplicantStatus,
  seedMockApplicants,
} from "../../utils/applicantsLocal";

/* ---------------- helpers ---------------- */
function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search || ""), [search]);
}

/* ================= component ================= */
export default function AdminPage() {
  const { t } = useTranslation("admin");
  const navigate = useNavigate();
  const q = useQuery();
  const tab = (q.get("tab") || "dashboard").toLowerCase();

  const [lands, setLands] = useState(() => readAllLands());
  const [broadcasts, setBroadcasts] = useState(() => readAllCampaigns());
  const [applicants, setApplicants] = useState(() => readAllApplicants());

  const pendingCount = applicants.filter((a) => a.status === "pending").length;

  /* -------- sync lands -------- */
  useEffect(() => {
    const sync = () => setLands(readAllLands());
    sync();
    const unsub = subscribeLandsChanged(sync);
    return unsub;
  }, []);

  /* -------- sync broadcasts -------- */
  useEffect(() => {
    const sync = () => setBroadcasts(readAllCampaigns());
    sync();
    const unsub = subscribeCampaignsChanged(sync);
    return unsub;
  }, []);

  /* -------- sync applicants -------- */
  useEffect(() => {
    const sync = () => setApplicants(readAllApplicants());
    sync();
    const unsub = subscribeApplicantsChanged(sync);
    return unsub;
  }, []);

  /* -------- actions -------- */
  const goTab = (tname) => navigate(`/admin?tab=${tname}`);
  const goBroadcast = () => navigate("/admin/broadcast");

  const onDeleteLand = (id) => {
    if (!id) return;
    if (!window.confirm(t("lands.confirmDelete"))) return;
    removeLand(id);
  };

  const onDeleteBroadcast = (id) => {
    if (!id) return;
    if (!window.confirm(t("broadcast.confirmDelete"))) return;
    removeCampaign(id);
  };

  const onApproveApplicant = (id) => {
    if (!id) return;
    if (!window.confirm(t("applicants.confirm.approve"))) return;
    updateApplicantStatus(id, "approved");
  };

  const onRejectApplicant = (id) => {
    if (!id) return;
    const note = window.prompt(t("applicants.confirm.rejectPrompt"), "");
    updateApplicantStatus(id, "rejected", note || "");
  };

  const onDeleteApplicant = (id) => {
    if (!id) return;
    if (!window.confirm(t("applicants.confirm.delete"))) return;
    removeApplicant(id);
  };

  const onSeedApplicants = () => {
    if (!window.confirm(t("applicants.seed"))) return;
    seedMockApplicants();
    goTab("applicants");
  };

  /* ================= render ================= */
  return (
    <div className="profile-page admin-page">
      <div className="profile-container">
        {/* ================= header ================= */}
        <div className="profile-header">
          <div className="profile-avatar">A</div>
          <div className="profile-meta">
            <div className="profile-name">{t("header.title")}</div>
            <div className="profile-sub">{t("header.subtitle")}</div>
          </div>

          <button className="profile-edit-btn" onClick={goBroadcast}>
            {t("header.manageBroadcast")}
          </button>
        </div>

        {/* ================= stats ================= */}
        <div className="profile-stats">
          <div className="stat-card">
            <div className="stat-num">{lands.length}</div>
            <div className="stat-label">{t("stats.lands")}</div>
          </div>
          <div className="stat-card">
            <div className="stat-num">{pendingCount}</div>
            <div className="stat-label">{t("stats.pendingApplicants")}</div>
          </div>
          <div className="stat-card">
            <div className="stat-num">{broadcasts.length}</div>
            <div className="stat-label">{t("stats.transactions")}</div>
          </div>
        </div>

        {/* ================= layout ================= */}
        <div className="profile-grid">
          {/* ===== left menu ===== */}
          <aside className="profile-side">
            <div className="side-title">{t("menu.title")}</div>

            {["dashboard", "broadcast", "lands", "applicants", "payments", "settings"].map(
              (k) => (
                <button
                  key={k}
                  className={`side-item ${tab === k ? "active" : ""}`}
                  onClick={() => goTab(k)}
                >
                  {t(`menu.${k}`)}
                </button>
              )
            )}
          </aside>

          {/* ===== right content ===== */}
          <section className="profile-content">
            {/* -------- dashboard -------- */}
            {tab === "dashboard" && (
              <>
                <div className="content-head">
                  <div>
                    <div className="content-title">{t("dashboard.title")}</div>
                    <div className="content-sub">{t("dashboard.subtitle")}</div>
                  </div>
                </div>

                <div className="info-card">
                  <div className="info-row">
                    <div className="k">{t("dashboard.lands")}</div>
                    <div className="v"><b>{lands.length}</b></div>
                  </div>
                  <div className="info-row">
                    <div className="k">{t("dashboard.pendingApplicants")}</div>
                    <div className="v"><b>{pendingCount}</b></div>
                  </div>
                  <div className="info-row">
                    <div className="k">{t("dashboard.transactions")}</div>
                    <div className="v"><b>{broadcasts.length}</b></div>
                  </div>
                </div>
              </>
            )}

            {/* -------- broadcast -------- */}
            {tab === "broadcast" && (
              <>
                <div className="content-head">
                  <div>
                    <div className="content-title">{t("broadcast.title")}</div>
                    <div className="content-sub">{t("broadcast.subtitle")}</div>
                  </div>
                  <div className="content-pill">
                    {t("broadcast.count", { count: broadcasts.length })}
                  </div>
                </div>

                <div className="fav-grid">
                  {broadcasts.map((b) => (
                    <div key={b.id} className="fav-card">
                      <div className="fav-top">
                        <div className="fav-owner">
                          {b.title || t("broadcast.fallbackTitle")}
                        </div>
                        <button
                          className="fav-remove"
                          onClick={() => onDeleteBroadcast(b.id)}
                        >
                          {t("broadcast.action.delete")}
                        </button>
                      </div>

                      <div className="fav-row">
                        <span className="muted">{t("broadcast.field.mode")}</span>
                        <b>{b.mode}</b>
                      </div>

                      <div className="fav-actions">
                        <button
                          className="outline-btn"
                          onClick={() =>
                            navigate(
                              `/admin/broadcast${b.landId ? `?landId=${b.landId}` : ""}`
                            )
                          }
                        >
                          {t("broadcast.action.viewEdit")}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* -------- lands -------- */}
            {tab === "lands" && (
              <>
                <div className="content-head">
                  <div>
                    <div className="content-title">{t("lands.title")}</div>
                    <div className="content-sub">{t("lands.subtitle")}</div>
                  </div>
                  <div className="content-pill">
                    {t("lands.count", { count: lands.length })}
                  </div>
                </div>

                <div className="purchase-grid">
                  {lands.map((p) => (
                    <div key={p.id} className="purchase-card">
                      <div className="purchase-top">
                        <div className="purchase-title">
                          {p.owner || t("lands.ownerFallback")}
                        </div>
                      </div>

                      <div className="fav-row">
                        <span className="muted">{t("lands.field.size")}</span>
                        <b>
                          {p.size} {t("lands.field.unitSqw")}
                        </b>
                      </div>

                      <div className="fav-actions">
                        <button
                          className="outline-btn"
                          onClick={() => navigate(`/map?mode=buy&focus=${p.id}`)}
                        >
                          {t("lands.action.viewMap")}
                        </button>

                        <button
                          className="primary-btn"
                          onClick={() => navigate(`/admin/broadcast?landId=${p.id}`)}
                        >
                          {t("lands.action.broadcast")}
                        </button>

                        <button
                          className="danger-btn"
                          onClick={() => onDeleteLand(p.id)}
                        >
                          {t("lands.action.delete")}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* -------- applicants -------- */}
            {tab === "applicants" && (
              <>
                <div className="content-head">
                  <div>
                    <div className="content-title">{t("applicants.title")}</div>
                    <div className="content-sub">{t("applicants.subtitle")}</div>
                  </div>

                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <button className="outline-btn" onClick={onSeedApplicants}>
                      {t("applicants.seed")}
                    </button>
                    <div className="content-pill">
                      {t("applicants.summary", {
                        total: applicants.length,
                        pending: pendingCount,
                      })}
                    </div>
                  </div>
                </div>

                <div className="purchase-grid">
                  {applicants.map((a) => (
                    <div key={a.id} className="purchase-card">
                      <div className="purchase-top">
                        <div className="purchase-title">
                          {a.name
                            ? `${a.name} ${a.lastname || ""}`
                            : t("lands.ownerFallback")}
                        </div>
                      </div>

                      <div className="fav-row">
                        <span className="muted">{t("applicants.field.type")}</span>
                        <b>{t(`applicants.type.${a.type || "general"}`)}</b>
                      </div>

                      <div className="fav-row">
                        <span className="muted">{t("applicants.field.status")}</span>
                        <b>{t(`applicants.status.${a.status}`)}</b>
                      </div>

                      {a.type === "seller" && a.role === "agent" && (
                        <div className="fav-row">
                          <span className="muted">{t("applicants.field.license")}</span>
                          <b>{a.agentLicense || "-"}</b>
                        </div>
                      )}

                      {a.type === "investor" && (
                        <div className="fav-row">
                          <span className="muted">{t("applicants.field.riskScore")}</span>
                          <b>{a.investorScore ?? "-"}</b>
                        </div>
                      )}

                      {a.status === "rejected" && a.statusNote && (
                        <div className="fav-row">
                          <span className="muted">{t("applicants.field.reason")}</span>
                          <b>{a.statusNote}</b>
                        </div>
                      )}

                      <div className="fav-actions">
                        <button
                          className="outline-btn"
                          onClick={() => alert(JSON.stringify(a, null, 2))}
                        >
                          {t("applicants.action.view")}
                        </button>

                        <button
                          className="primary-btn"
                          onClick={() => onApproveApplicant(a.id)}
                          disabled={a.status === "approved"}
                          title={
                            a.status === "approved"
                              ? t("applicants.tooltip.approved")
                              : ""
                          }
                        >
                          {t("applicants.action.approve")}
                        </button>

                        <button
                          className="outline-btn"
                          onClick={() => onRejectApplicant(a.id)}
                          disabled={a.status === "rejected"}
                          title={
                            a.status === "rejected"
                              ? t("applicants.tooltip.rejected")
                              : ""
                          }
                        >
                          {t("applicants.action.reject")}
                        </button>

                        <button
                          className="danger-btn"
                          onClick={() => onDeleteApplicant(a.id)}
                        >
                          {t("applicants.action.delete")}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {applicants.length === 0 && (
                  <div className="empty-state">
                    <div className="empty-title">{t("applicants.empty.title")}</div>
                    <div className="empty-sub">{t("applicants.empty.subtitle")}</div>
                  </div>
                )}
              </>
            )}

            {/* -------- payments / settings -------- */}
            {(tab === "payments" || tab === "settings") && (
              <div className="empty-state">
                <div className="empty-title">
                  {t("fallback.notReady.title")}
                </div>
                <div className="empty-sub">
                  {t("fallback.notReady.subtitle")}
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

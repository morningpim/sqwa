// src/pages/admin/AdminBroadcastPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import "../../css/admin-broadcast.css";
import { useTranslation } from "react-i18next";

import {
  readAllBroadcasts,
  removeBroadcastCampaign,
  seedBroadcastIfEmpty,
  subscribeBroadcastChanged,
  updateBroadcastCampaign,
} from "../../utils/broadcastStore";

import BroadcastCreateModal from "../../components/map/broadcast/BroadcastCreateModal";
import { useAuth } from "../../auth/AuthProvider";

export default function AdminBroadcastPage() {
  const { t } = useTranslation("adminBroadcast");
  const { role } = useAuth?.() || { role: "admin" };

  const isAdmin = role === "admin";
  const [items, setItems] = useState(() => readAllBroadcasts());

  useEffect(() => {
    seedBroadcastIfEmpty();
    const sync = () => setItems(readAllBroadcasts());
    sync();
    const unsub = subscribeBroadcastChanged(sync);
    return unsub;
  }, []);

  // Filters
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [mode, setMode] = useState("all");
  const [channel, setChannel] = useState("all");

  // Create modal
  const [createOpen, setCreateOpen] = useState(false);
  const [preview, setPreview] = useState(null);

  const filtered = useMemo(() => {
    const text = q.trim().toLowerCase();
    return (items || []).filter((x) => {
      if (status !== "all" && String(x.status) !== status) return false;
      if (mode !== "all" && String(x.mode) !== mode) return false;
      if (channel !== "all") {
        const chs = Array.isArray(x.channel) ? x.channel : [];
        if (!chs.includes(channel)) return false;
      }
      if (!text) return true;
      const hay = `${x.title || ""} ${x.message || ""}`.toLowerCase();
      return hay.includes(text) || String(x.id || "").toLowerCase().includes(text);
    });
  }, [items, q, status, mode, channel]);

  const onDisable = (id) => {
    if (!window.confirm(t("confirm.disable"))) return;
    updateBroadcastCampaign(id, { status: "disabled", updatedAt: new Date().toISOString() });
  };

  const onEnable = (id) => {
    updateBroadcastCampaign(id, { status: "scheduled", updatedAt: new Date().toISOString() });
  };

  const onMarkSent = (id) => {
    if (!window.confirm(t("adminBroadcast.confirm.markSent"))) return;
    updateBroadcastCampaign(id, {
      status: "sent",
      sentAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  };

  const onDelete = (id) => {
    if (!window.confirm(t("confirm.delete"))) return;
    removeBroadcastCampaign(id);
    if (preview?.id === id) setPreview(null);
  };

  if (!isAdmin) {
    return (
      <div className="admin-shell">
        <div className="admin-card">
          <div className="admin-title">{t("pageTitle")}</div>
          <div className="admin-muted">{t("noPermission")}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-shell">
      {/* TOPBAR */}
      <div className="admin-topbar">
        <div>
          <div className="admin-title">{t("pageTitle")}</div>
          <div className="admin-muted">{t("subtitle")}</div>
        </div>

        <div className="admin-actions">
          <button className="ds-btn ds-btn-primary" onClick={() => setCreateOpen(true)}>
            + {t("action.create")}
          </button>
        </div>
      </div>

      {/* FILTERS */}
      <div className="admin-filters">
        <input
          className="ds-input"
          placeholder={t("search")}
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />

        <select className="ds-select" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="all">{t("filter.statusAll")}</option>
          <option value="draft">{t("status.draft")}</option>
          <option value="scheduled">{t("status.scheduled")}</option>
          <option value="sent">{t("status.sent")}</option>
          <option value="disabled">{t("status.disabled")}</option>
        </select>

        <select className="ds-select" value={mode} onChange={(e) => setMode(e.target.value)}>
          <option value="all">{t("filter.modeAll")}</option>
          <option value="buy_sell">{t("mode.buy_sell")}</option>
          <option value="consignment">{t("mode.consignment")}</option>
        </select>

        <select className="ds-select" value={channel} onChange={(e) => setChannel(e.target.value)}>
          <option value="all">{t("filter.channelAll")}</option>
          <option value="SQW_WEB">{t("channel.SQW_WEB")}</option>
          <option value="LINE_ADS">{t("channel.LINE_ADS")}</option>
        </select>
      </div>

      <div className="admin-grid">
        {/* TABLE */}
        <div className="admin-card">
          <div className="card-head">
            <div className="card-title">
              {t("listTitle", { count: filtered.length })}
            </div>
          </div>

          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>{t("table.name")}</th>
                  <th>{t("table.mode")}</th>
                  <th>{t("table.channel")}</th>
                  <th>{t("table.schedule")}</th>
                  <th>{t("table.status")}</th>
                  <th style={{ textAlign: "right" }}>{t("table.action")}</th>
                </tr>
              </thead>

              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="empty">
                      {t("empty.campaign")}
                    </td>
                  </tr>
                ) : (
                  filtered.map((x) => {
                    const days = x?.schedule?.days || [];
                    const time = x?.schedule?.time || "-";
                    const chs = Array.isArray(x.channel) ? x.channel : [];

                    return (
                      <tr key={x.id}>
                        <td>
                          <div className="cell-title" onClick={() => setPreview(x)} role="button">
                            {x.title || t("fallback.noTitle")}
                          </div>
                          <div className="cell-sub">
                            ID: {x.id} • {t("landCount", { count: x.landIds?.length || 0 })}
                          </div>
                        </td>

                        <td>{t(`mode.${x.mode}`)}</td>

                        <td>
                          <div className="chips">
                            {chs.length
                              ? chs.map((c) => (
                                  <span className="chip" key={c}>
                                    {t(`channel.${c}`)}
                                  </span>
                                ))
                              : <span className="text-muted">-</span>}
                          </div>
                        </td>

                        <td>
                          <div className="chips">
                            {days.length
                              ? days.map((d) => (
                                  <span className="chip soft" key={d}>
                                    {t(`day.${d}`)}
                                  </span>
                                ))
                              : <span className="text-muted">-</span>}
                            <span className="chip soft">{time}</span>
                          </div>
                        </td>

                        <td>
                          <span className={`pill ${x.status}`}>
                            {t(`status.${x.status}`)}
                          </span>
                        </td>

                        <td style={{ textAlign: "right" }}>
                          <div className="row-actions">
                            <button className="ds-btn ds-btn-outline" onClick={() => setPreview(x)}>
                              {t("action.view")}
                            </button>

                            {x.status !== "disabled" ? (
                              <button className="ds-btn ds-btn-outline" onClick={() => onDisable(x.id)}>
                                {t("action.disable")}
                              </button>
                            ) : (
                              <button className="ds-btn ds-btn-outline" onClick={() => onEnable(x.id)}>
                                {t("action.enable")}
                              </button>
                            )}

                            {x.status !== "sent" && (
                              <button className="ds-btn ds-btn-outline" onClick={() => onMarkSent(x.id)}>
                                {t("action.markSent")}
                              </button>
                            )}

                            <button className="ds-btn ds-btn-outline" onClick={() => onDelete(x.id)}>
                              {t("action.delete")}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* PREVIEW */}
        <div className="admin-card">
          <div className="card-head">
            <div className="card-title">{t("preview.title")}</div>
            <div className="card-sub">{t("preview.subtitle")}</div>
          </div>

          {!preview ? (
            <div className="preview-empty">
              {t("empty.preview")}
            </div>
          ) : (
            <div className="preview">
              <div className="pv-title">
                {preview.title || t("fallback.noTitle")}
              </div>

              <div className="pv-msg">{preview.message || "-"}</div>

              <div className="pv-cta">
                <button className="btn" onClick={() => navigator.clipboard.writeText(preview.message || "")}>
                  {t("action.copy")}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <BroadcastCreateModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        land={null}
        createdByRole="admin"
        createdByUserId="admin"
        mode="buy_sell"
        intent={null}
        defaultFeatured={false}
        defaultPriceTHB={0}
      />
    </div>
  );
}

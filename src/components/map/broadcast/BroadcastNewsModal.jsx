// src/components/map/broadcast/BroadcastNewsModal.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import "./broadcast.css";

import { readAllCampaigns, subscribeCampaignsChanged } from "../../../utils/broadcastLocal";
import { readAllLineAdsQueue, subscribeLineAdsQueueChanged } from "../../../utils/lineAdsQueueLocal";
import { publishDueCampaigns, isBroadcastDay, weekdayKey } from "./broadcastScheduler";
import { formatRNWFromSqw, makeUtmLink } from "./broadcastHelpers";

function money(v) {
  const n = Number(String(v ?? "").replace(/,/g, ""));
  return Number.isFinite(n) && n > 0 ? n.toLocaleString("th-TH") : "-";
}

function getLandLink(c) {
  const landId = c?.landId;
  const intent = c?.intent ? `&intent=${encodeURIComponent(c.intent)}` : "";
  return `/map?mode=${c?.intent ? "sell" : "buy"}${intent}&focus=${encodeURIComponent(landId)}`;
}

export default function BroadcastNewsModal({
  open,
  onClose,
  canAdmin,
  onOpenAdminCreate, // เปิดหน้าสร้างของ admin จากใน modal ข่าว
}) {
  const [campaigns, setCampaigns] = useState(() => readAllCampaigns());
  const [queue, setQueue] = useState(() => readAllLineAdsQueue());
  const { t } = useTranslation("broadcast");
  const { t: tCommon } = useTranslation("common");

  useEffect(() => {
    if (!open) return;
    publishDueCampaigns(); // publish อัตโนมัติถ้าวันนี้เป็น จ/พ/ศ
  }, [open]);

  useEffect(() => {
    const sync = () => setCampaigns(readAllCampaigns());
    const unsub = subscribeCampaignsChanged(sync);
    sync();
    return unsub;
  }, []);

  useEffect(() => {
    const sync = () => setQueue(readAllLineAdsQueue());
    const unsub = subscribeLineAdsQueueChanged(sync);
    sync();
    return unsub;
  }, []);

  const published = useMemo(() => {
    const list = Array.isArray(campaigns) ? campaigns : [];
    return list
      .filter((c) => c?.status === "published")
      .sort((a, b) => String(b.publishedAt || b.updatedAt).localeCompare(String(a.publishedAt || a.updatedAt)));
  }, [campaigns]);

  const dayLabel = useMemo(() => {
    const w = weekdayKey(new Date());
    const map = { MON: "จันทร์", WED: "พุธ", FRI: "ศุกร์", TUE: "อังคาร", THU: "พฤหัส", SAT: "เสาร์", SUN: "อาทิตย์" };
    return `${map[w] || w} (${isBroadcastDay(new Date()) ? "วันบอร์ดแคส" : "ไม่ใช่วันบอร์ดแคส"})`;
  }, []);

  if (!open) return null;

  return (
    <div className="bc-mask" onMouseDown={onClose}>
      <div className="bc-modal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="bc-head">
          <div>
            <div className="bc-title">{t("news.title")}</div>
              {t("news.round")} • {t("news.today")}: {dayLabel}          
            </div>

          <div className="bc-head-actions">
            {canAdmin && (
              <button className="bc-btn" type="button" onClick={onOpenAdminCreate}>
                + {t("news.addAdmin")}
              </button>
            )}
            <button className="bc-btn" type="button" onClick={onClose}>
              {tCommon("close")}
            </button>
          </div>
        </div>

        <div className="bc-body">
          {published.length === 0 ? (
            <div className="bc-empty">{t("news.empty")}</div>
          ) : (
            <div className="bc-grid">
              {published.map((c) => {
                const land = c?.landSnapshot || {};
                const featured = c?.highlight === "featured";
                const link = getLandLink(c);

                return (
                  <div key={c.id} className={`bc-card ${featured ? "featured" : ""}`}>
                    <div className="bc-badges">
                      <span className="bc-badge">
                        {c.mode === "consignment" 
                        ? t("badge.consignment")
                        : t("badge.buySell")}
                      </span>
                      {featured && <span className="bc-badge hot">{t("badge.featured")}</span>}
                      {c.channels?.lineAds && <span className="bc-badge line">
                        {t("badge.lineAds")}
                      </span>}
                    </div>

                    <div className="bc-card-title">
                      <b>
                        {land.owner ||
                          (land.agent
                            ? `${land.agent} (${t("field.agent")})`
                            : tCommon("unknown"))}
                      </b>
                    </div>

                    <div className="bc-row">
                      <span className="muted">{t("field.size")}</span>
                      <b>{formatRNWFromSqw(land.size)}</b>
                    </div>

                    <div className="bc-row">
                      <span className="muted">{t("field.totalPrice")}</span>
                      <b>
                        {money(land.totalPrice)} {t("unit.baht")}
                      </b>
                    </div>

                    <div className="bc-actions">
                      <a className="bc-link" href={link}>
                        {t("action.viewMap")}
                      </a>
                      {c.channels?.lineAds && (
                        <button
                          className="bc-btn small"
                          type="button"
                          onClick={() => {
                            const utm = makeUtmLink({
                              landId: c.landId,
                              mode: c.intent ? "sell" : "buy",
                              intent: c.intent || undefined,
                              channel: "line_ads",
                            });
                            navigator.clipboard?.writeText?.(utm);
                            alert(t("alert.copyLineLink"));
                          }}
                        >
                          {t("action.copyLineAdsLink")}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* แสดง queue (แอดมินดูได้) */}
          {canAdmin && (
            <div className="bc-queue">
              <div className="bc-queue-title">{t("queue.title")}</div>
              <div className="bc-queue-sub">{t("queue.subtitle")}</div>
              <div className="bc-queue-list">
                {(Array.isArray(queue) ? queue : []).slice(0, 15).map((q) => (
                  <div key={q.id} className="bc-queue-item">
                    <div className="bc-queue-text">
                      <b>
                        {q.mode === "consignment"
                          ? t("badge.consignment")
                          : t("badge.buySell")}
                      </b>
                    </div>
                    <div className="bc-queue-actions">
                      <button
                        className="bc-btn small"
                        type="button"
                        onClick={() => {
                          navigator.clipboard?.writeText?.(q.utmLink);
                          alert(t("alert.copiedLink"));
                        }}
                      >
                        {t("action.copyLink")}
                      </button>
                      <button
                        className="bc-btn small"
                        type="button"
                        onClick={() => {
                          navigator.clipboard?.writeText?.(q.creativeText);
                          alert(t("alert.copiedText"));
                        }}
                      >
                        {t("action.copyText")}
                      </button>
                    </div>
                  </div>
                ))}
                {(!queue || queue.length === 0) && <div className="bc-empty">{t("queue.empty")}</div>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

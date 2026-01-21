// src/components/map/broadcast/BroadcastCreateModal.jsx
import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import "./broadcast.css";

import { getNextMWFDates } from "./broadcastScheduler";
import { createCampaign, makeLandTitle } from "./broadcastHelpers";

export default function BroadcastCreateModal({
  open,
  onClose,
  onSuccess,
  land,
  createdByRole, // "admin" | "consignor"
  createdByUserId,
  mode, // "buy_sell" | "consignment"
  intent, // "seller" | "investor" | null
  defaultFeatured = false,
  defaultPriceTHB = 0,
}) {
  const { t } = useTranslation("broadcast");
  const { t: tCommon } = useTranslation("common");

  const dates = useMemo(() => getNextMWFDates(10, new Date()), []);
  const [scheduleDate, setScheduleDate] = useState(dates[0] || "");
  const [web, setWeb] = useState(true);
  const [lineAds, setLineAds] = useState(true);
  const [featured, setFeatured] = useState(!!defaultFeatured);
  const [priceTHB, setPriceTHB] = useState(defaultPriceTHB);

  const title = useMemo(() => (land ? makeLandTitle(land) : ""), [land]);

  if (!open) return null;

  const isConsignor = createdByRole === "consignor";
  const finalPrice = isConsignor ? 100 : Number(priceTHB || 0);

  return (
    <div className="bc-mask" onMouseDown={onClose}>
      <div className="bc-modal" onMouseDown={(e) => e.stopPropagation()}>
        {/* ===== Header ===== */}
        <div className="bc-head">
          <div>
            <div className="bc-title">
              {isConsignor
                ? t("create.title.consignor")
                : t("create.title.admin")}
            </div>
            <div className="bc-sub">
              {land?.id
                ? t("create.land.selected", { title })
                : t("create.land.none")}
            </div>
          </div>

          <div className="bc-head-actions">
            <button className="bc-btn" type="button" onClick={onClose}>
              {tCommon("close")}
            </button>
          </div>
        </div>

        {/* ===== Body ===== */}
        <div className="bc-body">
          <div className="bc-form">
            {/* ช่องทาง */}
            <div className="bc-field">
              <label>{t("create.field.channel")}</label>
              <div className="bc-checks">
                <label className="bc-check">
                  <input
                    type="checkbox"
                    checked={web}
                    onChange={(e) => setWeb(e.target.checked)}
                  />
                  {t("create.field.web")}
                </label>
                <label className="bc-check">
                  <input
                    type="checkbox"
                    checked={lineAds}
                    onChange={(e) => setLineAds(e.target.checked)}
                  />
                  {t("create.field.lineAds")}
                </label>
              </div>
            </div>

            {/* วันบอร์ดแคส */}
            <div className="bc-field">
              <label>{t("create.field.schedule")}</label>
              <select
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
              >
                {dates.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
              <div className="bc-hint">
                {t("create.hint.autoPublish")}
              </div>
            </div>

            {/* ความเด่น */}
            <div className="bc-field">
              <label>{t("create.field.featured")}</label>
              <div className="bc-checks">
                <label className="bc-check">
                  <input
                    type="checkbox"
                    checked={featured}
                    onChange={(e) => setFeatured(e.target.checked)}
                    disabled={isConsignor}
                  />
                  {t("create.field.featuredLabel")}
                </label>
              </div>
              {isConsignor && (
                <div className="bc-hint">
                  {t("create.hint.consignorFeatured")}
                </div>
              )}
            </div>

            {/* ราคา (admin เท่านั้น) */}
            {!isConsignor && (
              <div className="bc-field">
                <label>{t("create.field.price")}</label>
                <input
                  value={priceTHB}
                  onChange={(e) => setPriceTHB(e.target.value)}
                  placeholder="0"
                />
                <div className="bc-hint">
                  {t("create.hint.adminPrice")}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="bc-actions-row">
              <button
                className="bc-btn primary"
                type="button"
                onClick={() => {
                  if (!land?.id) {
                    alert(t("create.alert.selectLand"));
                    return;
                  }

                  if (isConsignor) {
                    const ok = window.confirm(
                      t("create.alert.confirmPay")
                    );
                    if (!ok) return;
                  }

                  const r = createCampaign({
                    land,
                    mode,
                    channels: { web, lineAds },
                    scheduleDate,
                    createdByRole,
                    createdByUserId,
                    highlight: isConsignor
                      ? "featured"
                      : featured
                      ? "featured"
                      : "normal",
                    priceTHB: finalPrice,
                    intent,
                  });

                  if (!r.ok) {
                    alert(
                      t("create.alert.createFail", {
                        reason: r.reason,
                      })
                    );
                    return;
                  }

                  alert(t("create.alert.createSuccess"));

                  if (onSuccess) onSuccess(r);
                  else onClose?.();
                }}
              >
                {isConsignor
                  ? t("create.action.submitPaid")
                  : t("create.action.submit")}
              </button>

              <button className="bc-btn" type="button" onClick={onClose}>
                {tCommon("close")}
              </button>
            </div>

            {/* Note */}
            <div className="bc-note">
              {t("create.note.lineAdsQueue")}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

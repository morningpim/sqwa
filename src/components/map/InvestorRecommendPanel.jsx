// src/components/map/InvestorRecommendPanel.jsx
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import "../../css/InvestorRecommendPanel.css";

function toNum(v) {
  const n = Number(String(v ?? "").replace(/,/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function fmtMoney(v, locale = "th-TH") {
  const n = toNum(v);
  return n ? n.toLocaleString(locale) : "0";
}

function fmtSqw(v, locale = "th-TH") {
  const n = Math.max(0, Math.floor(toNum(v)));
  return n ? n.toLocaleString(locale) : "0";
}

export default function InvestorRecommendPanel({ lands = [], onFocus }) {
  // ✅ bind investor namespace
  const { t, i18n } = useTranslation("investor");
  const locale = i18n.language === "en" ? "en-US" : "th-TH";

  const items = useMemo(() => {
    return (Array.isArray(lands) ? lands : []).map((l) => ({
      id: l.id,
      title:
        l?.owner ||
        (l?.agent ? `${l.agent} ${t("item.agentSuffix")}` : "") ||
        l?.title ||
        t("item.unknown"),
      size: l?.size,
      totalPrice: l?.totalPrice,
      address: l?.address || l?.province || "",
      thumb: l?.images?.[0] || l?.image || "",
    }));
  }, [lands, t]);

  return (
    <aside className="inv-panel">
      <div className="inv-head">
        <div>
          <div className="inv-title">{t("panel.title")}</div>
          <div className="inv-sub">
            {t("panel.subtitle", { count: items.length })}
          </div>
        </div>
      </div>

      <div className="inv-list">
        {items.length ? (
          items.map((it) => (
            <div key={String(it.id)} className="inv-item">
              <div className="inv-thumb">
                {it.thumb ? <img src={it.thumb} alt="" /> : <div className="inv-thumb-ph" />}
              </div>

              <div className="inv-body">
                <div className="inv-name">{it.title}</div>
                {it.address && <div className="inv-addr">{it.address}</div>}

                <div className="inv-meta">
                  <div>
                    <span className="m">{t("field.size")}</span>{" "}
                    <b>
                      {fmtSqw(it.size, locale)} {t("unit.sqw")}
                    </b>
                  </div>
                  <div>
                    <span className="m">{t("field.price")}</span>{" "}
                    <b>
                      {fmtMoney(it.totalPrice, locale)} {t("unit.baht")}
                    </b>
                  </div>
                </div>

                <div className="inv-actions">
                  <button
                    type="button"
                    className="inv-btn"
                    onClick={() => onFocus?.({ id: it.id })}
                  >
                    {t("action.focus")}
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="inv-empty">{t("panel.empty")}</div>
        )}
      </div>
    </aside>
  );
}

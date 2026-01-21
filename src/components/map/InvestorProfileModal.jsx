// src/components/map/InvestorProfileModal.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import "../../css/InvestorProfileModal.css";
import { loadInvestorProfile, saveInvestorProfile } from "../../utils/investorProfile";

function Card({ title, options, value, onChange }) {
  return (
    <div className="ip-card">
      <div className="ip-card-title">{title}</div>
      <div className="ip-options">
        {options.map(({ value: v, label, sub }) => {
          const active = value === v;
          return (
            <button
              key={v}
              type="button"
              className={`ip-option ${active ? "active" : ""}`}
              onClick={() => onChange(v)}
            >
              {label}
              {sub && <span className="ip-sub">{sub}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}


export default function InvestorProfileModal({ open, onClose, onDone }) {
  const { t } = useTranslation("investor");
  const [model, setModel] = useState(() => loadInvestorProfile());

  useEffect(() => {
    if (open) setModel(loadInvestorProfile());
  }, [open]);

  const canSubmit = useMemo(
    () => Boolean(model?.goal && model?.gis && model?.budget),
    [model]
  );

  if (!open) return null;

  return (
    <div className="ip-backdrop" role="dialog" aria-modal="true">
      <div className="ip-modal">
        <div className="ip-head">
          <div>
            <div className="ip-title">{t("profile.title")}</div>
            <div className="ip-subtitle">{t("profile.subtitle")}</div>
          </div>

          <button
            className="ip-close"
            type="button"
            onClick={onClose}
            aria-label={t("aria.close")}
          >
            ✕
          </button>
        </div>

        <div className="ip-grid">
          <Card
            title={t("profile.question.goal")}
            value={model.goal}
            onChange={(v) => setModel((p) => ({ ...p, goal: v }))}
            options={[
              { value: "flipping", label: t("profile.goal.flipping") },
              { value: "capital_gain", label: t("profile.goal.capital_gain") },
              { value: "passive_income", label: t("profile.goal.passive_income") },
            ]}
          />

          <Card
            title={t("profile.question.gis")}
            value={model.gis}
            onChange={(v) => setModel((p) => ({ ...p, gis: v }))}
            options={[
              { value: "infra", label: t("profile.gis.infra") },
              { value: "zoning", label: t("profile.gis.zoning") },
              { value: "price_history", label: t("profile.gis.price_history") },
            ]}
          />

          <Card
            title={t("profile.question.budget")}
            value={model.budget}
            onChange={(v) => setModel((p) => ({ ...p, budget: v }))}
            options={[
              { value: "low", label: t("profile.budget.low") },
              { value: "mid", label: t("profile.budget.mid") },
              { value: "high", label: t("profile.budget.high") },
            ]}
          />
        </div>

        <div className="ip-foot">
          <button
            type="button"
            className="ip-btn ghost"
            onClick={() => setModel(loadInvestorProfile())}
          >
            {t("profile.action.reset")}
          </button>

          <button
            type="button"
            className="ip-btn primary"
            disabled={!canSubmit}
            onClick={() => {
              saveInvestorProfile(model);
              onDone?.();
            }}
          >
            {t("profile.action.submit")}
          </button>
        </div>
      </div>
    </div>
  );
}

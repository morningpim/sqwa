import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import "../css/Signup.css";

export default function InvestorRiskQuiz({ value, onChange }) {
  const { t } = useTranslation("signup");

  const score = useMemo(() => {
    return Object.values(value).reduce((sum, v) => sum + (Number(v) || 0), 0);
  }, [value]);

  const allAnswered = useMemo(() => {
    return Object.values(value).every((v) => v !== null);
  }, [value]);

  const setAnswer = (key, v) => onChange({ ...value, [key]: v });

  const questions = useMemo(
    () => t("investor.questions", { returnObjects: true }),
    [t]
  );

  const QuestionCard = ({ id, title, options }) => (
    <div
      style={{
        border: "1px solid var(--border)",
        borderRadius: "var(--r-lg)",
        padding: 16,
        background: "var(--bg-main)",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <div style={{ fontSize: 14, fontWeight: 800 }}>
        {title}
      </div>

      <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
        {options.map((opt) => {
          const active = value[id] === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => setAnswer(id, opt.value)}
              style={{
                width: "100%",
                textAlign: "left",
                padding: "12px",
                borderRadius: "var(--r-md)",
                border: active
                  ? "2px solid var(--primary)"
                  : "1px solid var(--border)",
                background: active
                  ? "rgba(22,163,74,0.06)"
                  : "var(--bg-main)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span>{opt.label}</span>
              <span
                aria-hidden
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: 999,
                  border: active
                    ? "6px solid var(--primary)"
                    : "2px solid var(--border)",
                }}
              />
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div style={{ gridColumn: "1 / -1" }}>
      {/* Header */}
      <div className="field">
        <label style={{ fontWeight: 800 }}>
          {t("investor.title")}
        </label>
        <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
          {t("investor.hint")}
        </div>

        <div
          style={{
            marginTop: 12,
            padding: "10px 12px",
            border: "1px solid var(--border)",
            borderRadius: "var(--r-md)",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <span>{t("investor.score")}</span>
          <strong>{score} / 40</strong>
        </div>

        {!allAnswered && (
          <div style={{ marginTop: 8, fontSize: 12, color: "#dc2626" }}>
            {t("investor.incomplete")}
          </div>
        )}
      </div>

      {/* Questions */}
      <div
        style={{
          marginTop: 16,
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          gap: 16,
        }}
      >
        {questions.map((q) => (
          <QuestionCard
            key={q.id}
            id={q.id}
            title={q.title}
            options={q.options}
          />
        ))}
      </div>
    </div>
  );
}

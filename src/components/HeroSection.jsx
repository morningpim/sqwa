import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "../css/HeroSection.css";

export default function HeroSection() {
  const navigate = useNavigate();
  const { t } = useTranslation("common");

  return (
    <section className="hero-section">
      <div className="hero-overlay" />

      <div className="hero-content">
        <h1 className="hero-title">
          {t("hero.title")}
        </h1>

        <p className="hero-subtitle">
          {t("hero.subtitle")}
        </p>

        <div className="hero-buttons">
          {/* ฝากขายที่ดิน */}
          <div className="hero-item">
            <button
              className="hero-circle-btn"
              onClick={() => navigate("/map?mode=sell")}
              aria-label={t("hero.sell")}
            >
              <img
                src="/sell-land.png"
                alt={t("hero.sell")}
                className="hero-img-icon"
              />
            </button>
            <span className="hero-btn-label">
              {t("hero.sell")}
            </span>
          </div>

          {/* ซื้อขายที่ดิน */}
          <div className="hero-item">
            <button
              className="hero-circle-btn"
              onClick={() => navigate("/map?mode=buy")}
              aria-label={t("hero.buy")}
            >
              <img
                src="/buy-land.png"
                alt={t("hero.buy")}
                className="hero-img-icon"
              />
            </button>
            <span className="hero-btn-label">
              {t("hero.buy")}
            </span>
          </div>

          {/* EIA */}
          <div className="hero-item">
            <button
              className="hero-circle-btn"
              onClick={() => navigate("/map?mode=eia")}
              aria-label={t("hero.eia")}
            >
              <img
                src="/eia.png"
                alt={t("hero.eia")}
                className="hero-img-icon hero-img-eia"
              />
            </button>
            {/* เพิ่ม className พิเศษเฉพาะปุ่มที่มีข้อความยาว */}
            <span className="hero-btn-label label-multiline">
              {t("hero.eia")}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

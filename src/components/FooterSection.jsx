import React from "react";
import { useTranslation } from "react-i18next";
import "../css/FooterSection.css";

export default function FooterSection() {
  const { t } = useTranslation("common");

  return (
    <footer className="footer-section">
      <div className="footer-inner">
        <h2 className="footer-logo">SQW</h2>

        <p className="footer-subtitle">
          {t("footer.subtitle")}
        </p>

        <p className="footer-text">
          {t("footer.description")}
        </p>
      </div>
    </footer>
  );
}

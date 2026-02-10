import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "../css/Login.css";

export default function ForgotPassword() {
  const { t } = useTranslation("auth");
  const navigate = useNavigate();

  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    // เรียก API จริงในอนาคต
    // await api.post("/auth/forgot-password", { email });

    // ไปหน้า OTP
    navigate(`/otp-verification?email=${encodeURIComponent(email)}`);
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">

        {/* LEFT */}
        <div className="login-left">
          <div className="login-logo">SQW</div>

          <div className="login-form-block">
            <h1 className="login-title">{t("forgot.title")}</h1>
            <p className="login-subtitle">
              {t("forgot.subtitle")}
            </p>

            <form onSubmit={handleSubmit}>
              <label className="login-label">{t("field.email")}</label>

              <input
                className="login-input"
                type="email"
                value={email}
                placeholder="example@email.com"
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <div className="forgot-actions">   {/* เพิ่ม */}
                <button className="signin-btn" type="submit">
                  {t("forgot.send")}
                </button>

                <button
                  type="button"
                  className="login-btn-secondary"
                  onClick={() => navigate("/login")}
                >
                  {t("forgot.back")}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* RIGHT */}
        <div className="login-right">
          <img src="/login-bg.jpg" alt="bg" className="login-image" />
        </div>

      </div>
    </div>
  );
}

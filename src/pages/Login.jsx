// src/pages/Login.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { FcGoogle } from "react-icons/fc";
import { useTranslation } from "react-i18next";
import "../css/Login.css";

export default function Login() {
  const [showUserTypeModal, setShowUserTypeModal] = useState(false);
  const [showSellerRoleModal, setShowSellerRoleModal] = useState(false); // ✅ เพิ่ม
  const [showTermsModal, setShowTermsModal] = useState(false);

  const [selectedType, setSelectedType] = useState(null);
  const [sellerRole, setSellerRole] = useState(null); // ✅ เพิ่ม agent | landlord
  const [showPassword, setShowPassword] = useState(false);
  const { t } = useTranslation("auth");
  const {t: tCommon} = useTranslation("common");
  const handleBackToUserType = () => {
    setShowSellerRoleModal(false);
    setShowUserTypeModal(true);
  };
  const location = useLocation();

  useEffect(() => {
    const sp = new URLSearchParams(location.search);
    if (sp.get("signup") === "1") {
      setShowUserTypeModal(true);
    }
  }, [location.search]);

  const navigate = useNavigate();

  // เลือกประเภทหลัก
  const handleSelectType = (type) => {
    setSelectedType(type);

    // reset role ทุกครั้งที่เลือก type ใหม่
    setSellerRole(null);

    setShowUserTypeModal(false);

    // ถ้าเป็น seller ให้เลือก role ต่อก่อน
    if (type === "seller") {
      setShowSellerRoleModal(true);
      return;
    }

    // general / investor ไป terms ได้เลย
    setShowTermsModal(true);
  };

  // เลือก role สำหรับ seller
  const handleSelectSellerRole = (role) => {
    setSellerRole(role); // agent | landlord
    setShowSellerRoleModal(false);
    setShowTermsModal(true);
  };

  const handleAcceptTerms = () => {
    setShowTermsModal(false);

    // สร้าง query ไปหน้า signup
    const type = selectedType || "general";

    // ถ้าเป็น seller แนบ role ไปด้วย
    if (type === "seller") {
      navigate(`/signup?type=seller&role=${sellerRole || "agent"}`);
      return;
    }

    navigate(`/signup?type=${type}`);
  };

  const handleCancelTerms = () => setShowTermsModal(false);

  const handleForgotPassword = () => {
    navigate("/forgot-password");
  };

  const getUserTypeLabel = () =>
  t(`userType.${selectedType || "general"}`);

  const getSellerRoleLabel = () =>
  sellerRole ? t(`sellerRole.${sellerRole}`) : "-";

  return (
    <div className="login-wrapper">
      <div className="login-card">
        {/* LEFT PANEL */}
        <div className="login-left">
          <div className="login-logo">SQW</div>

          <div className="login-form-block">
            <h1 className="login-title">{t("login.title")}</h1>

            <label className="login-label">{t("field.email")}</label>
            <input type="email" className="login-input" />

            <label className="login-label">{t("field.password")}</label>
            <div className="password-group">
              <input
                type={showPassword ? "text" : "password"}
                className="password-input"
                placeholder={t("field.password")}
              />
              <button
                className="password-toggle"
                type="button"
                aria-label={showPassword ? t("aria.hidePassword") : t("aria.showPassword")}
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? (
                  <AiOutlineEyeInvisible size={20} />
                ) : (
                  <AiOutlineEye size={20} />
                )}
              </button>
            </div>

            <div className="login-row">
              <label className="remember">
                <input type="checkbox" /> <span>{t("action.remember")}</span>
              </label>

              <button type="button" className="forgot" onClick={handleForgotPassword}>
                {t("action.forgotPassword")}
              </button>
            </div>

            <button
              className="login-btn-secondary"
              type="button"
              onClick={() => navigate("/map")}
            >
              {t("login.submit")}
            </button>

            <button className="google-btn" type="button">
              <FcGoogle size={22} />
              <span>{t("login.google")}</span>
            </button>

            <div className="divider">
              <span>{t("login.or")}</span>
            </div>

            <button
              className="signin-btn"
              type="button"
              onClick={() => setShowUserTypeModal(true)}
            >
              {t("login.signup")}
            </button>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="login-right">
          <img src="/login-bg.jpg" alt="Login background" className="login-image" />
        </div>
      </div>

      {/* MODAL: เลือกประเภทผู้ใช้งาน */}
      {showUserTypeModal && (
        <div className="user-type-backdrop" onClick={() => setShowUserTypeModal(false)}>
          <div className="user-type-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
            <h2 className="user-type-title">{t("userType.title")}</h2>

            <button
              className="modal-close"
              onClick={() => setShowUserTypeModal(false)}
              aria-label="close"
            >
              ×
            </button>
          </div>

          <p className="user-type-subtitle">
            {t("userType.subtitle")}
          </p>

            <div className="user-type-buttons">
              <button className="user-type-card" onClick={() => handleSelectType("general")}>
                <div className="user-type-icon-circle">
                  <span className="material-symbols-outlined user-type-icon">
                    contacts_product
                  </span>
                </div>
                <span className="user-type-label">{t("userType.general")}</span>
              </button>

              <button className="user-type-card" onClick={() => handleSelectType("seller")}>
                <div className="user-type-icon-circle">
                  <span className="material-symbols-outlined user-type-icon">store</span>
                </div>
                <span className="user-type-label">{t("userType.seller")}</span>
              </button>

              <button className="user-type-card" onClick={() => handleSelectType("investor")}>
                <div className="user-type-icon-circle">
                  <span className="material-symbols-outlined user-type-icon">
                    account_balance
                  </span>
                </div>
                <span className="user-type-label">{t("userType.investor")}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ MODAL: เลือกบทบาท Seller */}
      {showSellerRoleModal && (
      <div className="user-type-backdrop" onClick={() => setShowSellerRoleModal(false)}>
        <div className="user-type-modal" onClick={(e) => e.stopPropagation()}>

          <div className="modal-header">
            <button
              className="modal-back"
              onClick={handleBackToUserType}
              aria-label="back"
            >
              ←
            </button>

            <h2 className="user-type-title">{t("sellerRole.title")}</h2>

            <button
              className="modal-close"
              onClick={() => setShowSellerRoleModal(false)}
            >
              ×
            </button>
          </div>

          <p className="user-type-subtitle">{t("userType.subtitle")}</p>

          <div className="user-type-buttons">
              <button className="user-type-card" onClick={() => handleSelectSellerRole("agent")}>
                <div className="user-type-icon-circle">
                  <span className="material-symbols-outlined user-type-icon">support_agent</span>
                </div>
                <span className="user-type-label">{t("sellerRole.agent")}</span>
              </button>

              <button
                className="user-type-card"
                onClick={() => handleSelectSellerRole("landlord")}
              >
                <div className="user-type-icon-circle">
                  <span className="material-symbols-outlined user-type-icon">home</span>
                </div>
                <span className="user-type-label">{t("sellerRole.landlord")}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ข้อกำหนดการสมัคร */}
      {showTermsModal && (
        <div className="user-type-backdrop" onClick={handleCancelTerms}>
          <div className="terms-modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="terms-title">{t("terms.title")}</h2>
            <p className="terms-subtitle">
              {t("userType.types")} {getUserTypeLabel()}
              {selectedType === "seller" && (
                <>
                  &nbsp;|&nbsp;{t("terms.role")} {getSellerRoleLabel()}
                </>
              )}
            </p>

            <div className="terms-body">
              <p>
                {t("terms.intro")}
              </p>
              <ul>
                {t("terms.rules", { returnObjects: true }).map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
              <p>
                {t("terms.footer")}
              </p>
            </div>

            <div className="terms-actions">
              <button type="button" className="terms-btn secondary" onClick={handleCancelTerms}>
                {(t("action.cancel"))}
              </button>
              <button type="button" className="terms-btn primary" onClick={handleAcceptTerms}>
                {(t("action.accept"))}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

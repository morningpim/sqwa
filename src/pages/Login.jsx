// src/pages/Login.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import "../css/Login.css";

export default function Login() {
  const [showUserTypeModal, setShowUserTypeModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [selectedType, setSelectedType] = useState(null);

  // toggle password
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const handleSelectType = (type) => {
    setSelectedType(type);
    setShowUserTypeModal(false);
    setShowTermsModal(true);
  };

  const handleAcceptTerms = () => {
    console.log("ยอมรับข้อกำหนด — สมัครประเภท:", selectedType);
    setShowTermsModal(false);

    // ไปหน้า signup พร้อมประเภทผู้ใช้งาน
    navigate(`/signup?type=${selectedType || "general"}`);
  };

  const handleCancelTerms = () => {
    setShowTermsModal(false);
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        {/* LEFT PANEL */}
        <div className="login-left">
          <div className="login-logo">SQW</div>

          <div className="login-form-block">
            <h1 className="login-title">Log in</h1>

            {/* E-mail */}
            <label className="login-label">E-mail</label>
            <input type="email" className="login-input" />

            {/* Password */}
            <label className="login-label">Password</label>
            <div className="password-group">
              <input
                type={showPassword ? "text" : "password"}
                className="password-input"
                placeholder="Password"
              />
              <button
                className="password-toggle"
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? (
                  <AiOutlineEyeInvisible size={20} />
                ) : (
                  <AiOutlineEye size={20} />
                )}
              </button>
            </div>

            {/* Remember + Forgot */}
            <div className="login-row">
              <label className="remember">
                <input type="checkbox" /> <span>Remember me</span>
              </label>
              <a href="#" className="forgot">
                Forgot Password?
              </a>
            </div>

            {/* ✅ ปุ่มเข้าสู่ระบบ — อยู่เหนือ Google */}
            <button
              className="login-btn-secondary"
              type="button"
              onClick={() => navigate("/login")} // ตอนนี้แค่เด้งอยู่หน้าเดิมไว้ก่อน
            >
              เข้าสู่ระบบ
            </button>

            {/* Google Login */}
            <button className="google-btn" type="button">
              <img
                src="/icons8-google.svg"
                alt="Google icon"
                className="google-icon-img"
              />
              <span>Continue with Google</span>
            </button>

            {/* เส้น OR */}
            <div className="divider">
              <span>OR</span>
            </div>

            {/* Sign in → เปิด flow สมัคร (เลือกประเภท) */}
            <button
              className="signin-btn"
              type="button"
              onClick={() => setShowUserTypeModal(true)}
            >
              Sign in
            </button>
          </div>
        </div>

        {/* RIGHT PANEL (IMAGE) */}
        <div className="login-right">
          <img
            src="/login-bg.jpg"
            alt="Login background"
            className="login-image"
          />
        </div>
      </div>

      {/* MODAL: เลือกประเภทผู้ใช้งาน */}
      {showUserTypeModal && (
        <div
          className="user-type-backdrop"
          onClick={() => setShowUserTypeModal(false)}
        >
          <div
            className="user-type-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="user-type-title">เลือกประเภทการใช้งาน</h2>
            <p className="user-type-subtitle">
              กรุณาเลือกให้ตรงกับคุณมากที่สุด
              <br />
              เพื่อสมัครสมาชิกและใช้งานระบบ
            </p>

            <div className="user-type-buttons">
              <button
                className="user-type-card"
                onClick={() => handleSelectType("general")}
              >
                <div className="user-type-icon-circle">
                  <img
                    src="/user-general.png"
                    alt="บุคคลทั่วไป"
                    className="user-type-icon-img"
                  />
                </div>
                <span className="user-type-label">บุคคลทั่วไป</span>
              </button>

              <button
                className="user-type-card"
                onClick={() => handleSelectType("investor")}
              >
                <div className="user-type-icon-circle">
                  <img
                    src="/user-investor.png"
                    alt="Investor"
                    className="user-type-icon-img"
                  />
                </div>
                <span className="user-type-label">Investor</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ข้อกำหนดการสมัคร */}
      {showTermsModal && (
        <div className="user-type-backdrop" onClick={handleCancelTerms}>
          <div className="terms-modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="terms-title">ข้อกำหนดในการสมัครใช้งาน</h2>
            <p className="terms-subtitle">
              ประเภทผู้ใช้งาน:&nbsp;
              {selectedType === "investor" ? "Investor" : "บุคคลทั่วไป"}
            </p>

            <div className="terms-body">
              <p>
                ก่อนสมัครใช้งาน SQW Land Management Platform
                กรุณาอ่านและยอมรับเงื่อนไขต่อไปนี้:
              </p>
              <ul>
                <li>ข้อมูลที่ใช้ลงทะเบียนเป็นข้อมูลที่ถูกต้องและเป็นปัจจุบัน</li>
                <li>
                  ผู้ใช้งานยินยอมให้ระบบจัดเก็บและประมวลผลข้อมูล
                  ตามนโยบายความเป็นส่วนตัวของแพลตฟอร์ม
                </li>
                <li>
                  ห้ามใช้บัญชีผู้ใช้งานเพื่อกระทำการที่ผิดกฎหมาย
                  หรือขัดต่อจริยธรรม
                </li>
                <li>
                  ทางระบบสามารถระงับการใช้งานชั่วคราว
                  หรือถาวรได้ หากพบการใช้งานผิดเงื่อนไข
                </li>
              </ul>
              <p>
                หากคุณยอมรับข้อกำหนดทั้งหมด
                ให้กดปุ่ม “ยอมรับและสมัครต่อ”
                เพื่อดำเนินการในขั้นตอนถัดไป
              </p>
            </div>

            <div className="terms-actions">
              <button
                type="button"
                className="terms-btn secondary"
                onClick={handleCancelTerms}
              >
                ยกเลิก
              </button>
              <button
                type="button"
                className="terms-btn primary"
                onClick={handleAcceptTerms}
              >
                ยอมรับและสมัครต่อ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

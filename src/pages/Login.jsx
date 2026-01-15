import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { FcGoogle } from "react-icons/fc";
import "../css/Login.css";

export default function Login() {
  const [showUserTypeModal, setShowUserTypeModal] = useState(false);
  const [showSellerRoleModal, setShowSellerRoleModal] = useState(false); // ✅ เพิ่ม
  const [showTermsModal, setShowTermsModal] = useState(false);

  const [selectedType, setSelectedType] = useState(null);
  const [sellerRole, setSellerRole] = useState(null); // ✅ เพิ่ม agent | landlord
  const [showPassword, setShowPassword] = useState(false);

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
    alert("ยังไม่ได้ทำหน้า Forgot Password");
  };

  const getUserTypeLabel = () => {
    if (selectedType === "investor") return "Investor";
    if (selectedType === "seller") return "Seller";
    return "บุคคลทั่วไป";
  };

  const getSellerRoleLabel = () => {
    if (sellerRole === "agent") return "Agent";
    if (sellerRole === "landlord") return "Landlord";
    return "-";
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        {/* LEFT PANEL */}
        <div className="login-left">
          <div className="login-logo">SQW</div>

          <div className="login-form-block">
            <h1 className="login-title">Log in</h1>

            <label className="login-label">E-mail</label>
            <input type="email" className="login-input" />

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
                aria-label={showPassword ? "Hide password" : "Show password"}
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
                <input type="checkbox" /> <span>Remember me</span>
              </label>

              <button type="button" className="forgot" onClick={handleForgotPassword}>
                Forgot Password?
              </button>
            </div>

            <button
              className="login-btn-secondary"
              type="button"
              onClick={() => navigate("/map")}
            >
              เข้าสู่ระบบ
            </button>

            <button className="google-btn" type="button">
              <FcGoogle size={22} />
              <span>Continue with Google</span>
            </button>

            <div className="divider">
              <span>OR</span>
            </div>

            <button
              className="signin-btn"
              type="button"
              onClick={() => setShowUserTypeModal(true)}
            >
              Sign in
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
            <h2 className="user-type-title">เลือกประเภทการใช้งาน</h2>
            <p className="user-type-subtitle">
              กรุณาเลือกให้ตรงกับคุณมากที่สุด
              <br />
              เพื่อสมัครสมาชิกและใช้งานระบบ
            </p>

            <div className="user-type-buttons">
              <button className="user-type-card" onClick={() => handleSelectType("general")}>
                <div className="user-type-icon-circle">
                  <span className="material-symbols-outlined user-type-icon">
                    contacts_product
                  </span>
                </div>
                <span className="user-type-label">บุคคลทั่วไป</span>
              </button>

              <button className="user-type-card" onClick={() => handleSelectType("seller")}>
                <div className="user-type-icon-circle">
                  <span className="material-symbols-outlined user-type-icon">store</span>
                </div>
                <span className="user-type-label">Seller</span>
              </button>

              <button className="user-type-card" onClick={() => handleSelectType("investor")}>
                <div className="user-type-icon-circle">
                  <span className="material-symbols-outlined user-type-icon">
                    account_balance
                  </span>
                </div>
                <span className="user-type-label">Investor</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ MODAL: เลือกบทบาท Seller */}
      {showSellerRoleModal && (
        <div className="user-type-backdrop" onClick={() => setShowSellerRoleModal(false)}>
          <div className="user-type-modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="user-type-title">เลือกบทบาท Seller</h2>
            <p className="user-type-subtitle">
              กรุณาเลือกบทบาทให้ตรงกับคุณ
              <br />
              เพื่อสมัครสมาชิกและใช้งานระบบ
            </p>

            <div className="user-type-buttons">
              <button className="user-type-card" onClick={() => handleSelectSellerRole("agent")}>
                <div className="user-type-icon-circle">
                  <span className="material-symbols-outlined user-type-icon">support_agent</span>
                </div>
                <span className="user-type-label">Agent</span>
              </button>

              <button
                className="user-type-card"
                onClick={() => handleSelectSellerRole("landlord")}
              >
                <div className="user-type-icon-circle">
                  <span className="material-symbols-outlined user-type-icon">home</span>
                </div>
                <span className="user-type-label">Landlord</span>
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
              ประเภทผู้ใช้งาน:&nbsp;{getUserTypeLabel()}
              {selectedType === "seller" && (
                <>
                  &nbsp;|&nbsp;บทบาท:&nbsp;{getSellerRoleLabel()}
                </>
              )}
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
                <li>ห้ามใช้บัญชีผู้ใช้งานเพื่อกระทำการที่ผิดกฎหมาย หรือขัดต่อจริยธรรม</li>
                <li>ทางระบบสามารถระงับการใช้งานชั่วคราว หรือถาวรได้ หากพบการใช้งานผิดเงื่อนไข</li>
              </ul>
              <p>
                หากคุณยอมรับข้อกำหนดทั้งหมด ให้กดปุ่ม “ยอมรับและสมัครต่อ”
                เพื่อดำเนินการในขั้นตอนถัดไป
              </p>
            </div>

            <div className="terms-actions">
              <button type="button" className="terms-btn secondary" onClick={handleCancelTerms}>
                ยกเลิก
              </button>
              <button type="button" className="terms-btn primary" onClick={handleAcceptTerms}>
                ยอมรับและสมัครต่อ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

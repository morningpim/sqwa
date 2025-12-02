// src/pages/Signup.jsx
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import "../css/Signup.css";

export default function Signup() {
  const location = useLocation();
  const navigate = useNavigate();

  // อ่าน ?type=general หรือ ?type=investor
  const query = new URLSearchParams(location.search);
  const userType = query.get("type") || "general";

  const [step, setStep] = useState(1); // step 1 หรือ 2
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // ✅ state สำหรับ popup สำเร็จ
  const [showSuccess, setShowSuccess] = useState(false);

  const handleNextStep = (e) => {
    e.preventDefault();
    setStep(2); // ไปหน้าอัปโหลดรูป
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("ยืนยันสมัครประเภท:", userType);
    // TODO: call API สมัครสมาชิก + อัปโหลดไฟล์

    // ✅ แสดง popup สมัครสำเร็จ
    setShowSuccess(true);
  };

  const handleCancel = () => {
    navigate("/login");
  };

  // กดปุ่ม "ยืนยัน" บน popup แล้วพากลับไปหน้าแรก (หรือหน้า login ก็ได้)
  const handleSuccessConfirm = () => {
    setShowSuccess(false);
    navigate("/login");
  };

  return (
    <div className="signup-wrapper">
      <div className="signup-logo">SQW</div>

      <div className="signup-card">
        {/* step bar */}
        <div className="signup-steps">
          <div className={`step-item ${step === 1 ? "active" : ""}`}>
            <div className="step-circle">1</div>
            <span className="step-label">ข้อมูลทั่วไป</span>
          </div>
          <div className="step-line" />
          <div className={`step-item ${step === 2 ? "active" : ""}`}>
            <div className="step-circle">2</div>
            <span className="step-label">ยืนยันตัวตน</span>
          </div>
        </div>

        {/* STEP 1 : ฟอร์มข้อมูลทั่วไป */}
        {step === 1 ? (
          <>
            <h1 className="signup-title">Sign in</h1>
            <form className="signup-form" onSubmit={handleNextStep}>
              <div className="signup-grid">
                <div className="field">
                  <label>Name</label>
                  <input type="text" />
                </div>
                <div className="field">
                  <label>Lastname</label>
                  <input type="text" />
                </div>

                <div className="field">
                  <label>Phone</label>
                  <input type="tel" />
                </div>
                <div className="field">
                  <label>E-mail</label>
                  <input type="email" />
                </div>

                <div className="field">
                  <label>Line id</label>
                  <input type="text" />
                </div>
                <div className="field">
                  <label>Address</label>
                  <input type="text" />
                </div>

                {/* ฟิลด์พิเศษของ investor */}
                {userType === "investor" && (
                  <>
                    <div className="field">
                      <label>Company / Investor Name</label>
                      <input type="text" />
                    </div>
                    <div className="field">
                      <label>Expected Investment Budget</label>
                      <input type="number" />
                    </div>
                  </>
                )}

                <div className="field">
                  <label>Password</label>
                  <div className="password-group">
                    <input
                      type={showPassword ? "text" : "password"}
                      className="password-input"
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword((p) => !p)}
                    >
                      {showPassword ? (
                        <AiOutlineEyeInvisible size={18} />
                      ) : (
                        <AiOutlineEye size={18} />
                      )}
                    </button>
                  </div>
                </div>

                <div className="field">
                  <label>Confirm Password</label>
                  <div className="password-group">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      className="password-input"
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowConfirmPassword((p) => !p)}
                    >
                      {showConfirmPassword ? (
                        <AiOutlineEyeInvisible size={18} />
                      ) : (
                        <AiOutlineEye size={18} />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="signup-divider">
                <span>หรือ</span>
              </div>

              <button type="button" className="signup-google-btn">
                <img
                  src="/icons8-google.svg"
                  alt="Google"
                  className="signup-google-icon"
                />
                <span>Continue with Google</span>
              </button>

              <div className="signup-actions">
                <button
                  type="button"
                  className="btn-outline"
                  onClick={handleCancel}
                >
                  ยกเลิก
                </button>
                <button type="submit" className="btn-primary">
                  ถัดไป
                </button>
              </div>
            </form>
          </>
        ) : (
          /* STEP 2 : อัปโหลดรูปบัตร ปชช. */
          <form className="signup-form" onSubmit={handleSubmit}>
            <div className="verify-section">
              <p className="verify-heading">ถ่ายรูปบัตรปชช.</p>

              <div className="verify-row">
                <div className="upload-box">
                  <span className="upload-label">ด้านหน้า</span>
                  <div className="upload-icon">📷</div>
                  <span className="upload-hint">กดเพื่ออัปโหลดรูปด้านหน้า</span>
                </div>

                <div className="upload-box">
                  <span className="upload-label">ด้านหลัง</span>
                  <div className="upload-icon">📷</div>
                  <span className="upload-hint">กดเพื่ออัปโหลดรูปด้านหลัง</span>
                </div>
              </div>

              <p className="verify-heading">
                ถ่ายหน้าตัวเองพร้อมกับรูปบัตรปชช.
              </p>

              <div className="verify-row single">
                <div className="upload-box">
                  <div className="upload-icon">📷</div>
                  <span className="upload-hint">
                    กดเพื่ออัปโหลดรูปหน้าตัวเองคู่กับบัตรปชช.
                  </span>
                </div>
              </div>
            </div>

            <div className="signup-actions">
              <button
                type="button"
                className="btn-outline"
                onClick={() => setStep(1)}
              >
                ยกเลิก
              </button>
              <button type="submit" className="btn-primary">
                sign in
              </button>
            </div>
          </form>
        )}
      </div>

      {/* ✅ POPUP สมัครสมาชิกเสร็จสิ้น */}
      {showSuccess && (
        <div
          className="signup-success-backdrop"
          onClick={handleSuccessConfirm}
        >
          <div
            className="signup-success-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="success-title">สมัครสมาชิกเสร็จสิ้น</h2>
            <p className="success-text">
              ท่านได้สมัครสมาชิกเสร็จสิ้นแล้ว
              <br />
              ระบบจะพาไปหน้าแรกของระบบ
            </p>

            <button
              type="button"
              className="success-btn"
              onClick={handleSuccessConfirm}
            >
              ยืนยัน
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

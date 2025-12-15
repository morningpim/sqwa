// src/pages/Signup.jsx
import React, { useState } from "react";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOW_TYPES = ["image/jpeg", "image/png", "image/jpg"];

export default function Signup() {
  // ----- step / ui -----
  const [step, setStep] = useState(1);
  const [userType] = useState("general"); // ถ้าคุณดึงจาก query ก็เปลี่ยนได้
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // ----- upload states -----
  const [idFront, setIdFront] = useState(null);
  const [idBack, setIdBack] = useState(null);
  const [selfie, setSelfie] = useState(null);
  const [errors, setErrors] = useState({});

  // ----- basic handlers -----
  const handleNextStep = (e) => {
    e.preventDefault();
    setStep(2);
  };

  const handleCancel = () => {
    window.history.back();
  };

  const handleSuccessConfirm = () => {
    setShowSuccess(false);
    window.location.href = "/login";
  };

  // ----- upload logic + validation -----
  const handleFileChange = (file, type) => {
    if (!file) return;

    // type validation
    if (!ALLOW_TYPES.includes(file.type)) {
      setErrors((prev) => ({ ...prev, [type]: "รองรับเฉพาะไฟล์ JPG / PNG" }));
      return;
    }

    // size validation
    if (file.size > MAX_FILE_SIZE) {
      setErrors((prev) => ({ ...prev, [type]: "ขนาดไฟล์ต้องไม่เกิน 5MB" }));
      return;
    }

    // clear error
    setErrors((prev) => ({ ...prev, [type]: null }));

    // save file
    if (type === "front") setIdFront(file);
    if (type === "back") setIdBack(file);
    if (type === "selfie") setSelfie(file);
  };

  const canSubmit =
    idFront && idBack && selfie && !errors.front && !errors.back && !errors.selfie;

  const handleSubmit = () => {
    if (!canSubmit) {
      alert("กรุณาอัปโหลดเอกสารให้ครบถ้วน");
      return;
    }

    const formData = new FormData();
    formData.append("id_front", idFront);
    formData.append("id_back", idBack);
    formData.append("selfie", selfie);

    console.log("READY TO SUBMIT", formData);
    // TODO: ส่ง API จริง (Django/Firebase)
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

        {/* STEP 1 */}
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
                      aria-label={showPassword ? "Hide password" : "Show password"}
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
                      aria-label={
                        showConfirmPassword ? "Hide confirm password" : "Show confirm password"
                      }
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
                <button type="button" className="btn-outline" onClick={handleCancel}>
                  ยกเลิก
                </button>
                <button type="submit" className="btn-primary">
                  ถัดไป
                </button>
              </div>
            </form>
          </>
        ) : (
          /* STEP 2 */
          <form
            className="signup-form"
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
              if (canSubmit) setShowSuccess(true);
            }}
          >
            <div className="verify-section">
              <p className="verify-heading">ถ่ายรูปบัตรประชาชน</p>

              <div className="verify-row">
                {/* FRONT */}
                <label className="upload-box">
                  {idFront ? (
                    <img
                      src={URL.createObjectURL(idFront)}
                      alt="ID Front"
                      className="upload-preview"
                    />
                  ) : (
                    <>
                      <div className="upload-icon">📷</div>
                      <span className="upload-label">ด้านหน้า</span>
                      <span className="upload-hint">กดเพื่ออัปโหลด</span>
                    </>
                  )}
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={(e) => handleFileChange(e.target.files[0], "front")}
                  />
                </label>

                {/* BACK */}
                <label className="upload-box">
                  {idBack ? (
                    <img
                      src={URL.createObjectURL(idBack)}
                      alt="ID Back"
                      className="upload-preview"
                    />
                  ) : (
                    <>
                      <div className="upload-icon">📷</div>
                      <span className="upload-label">ด้านหลัง</span>
                      <span className="upload-hint">กดเพื่ออัปโหลด</span>
                    </>
                  )}
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={(e) => handleFileChange(e.target.files[0], "back")}
                  />
                </label>
              </div>

              <p className="verify-heading">ถ่ายหน้าตัวเองพร้อมกับบัตรประชาชน</p>

              <div className="verify-row single">
                <label className="upload-box">
                  {selfie ? (
                    <img
                      src={URL.createObjectURL(selfie)}
                      alt="Selfie"
                      className="upload-preview"
                    />
                  ) : (
                    <>
                      <div className="upload-icon">🤳</div>
                      <span className="upload-hint">กดเพื่ออัปโหลดรูปหน้าตัวเอง</span>
                    </>
                  )}
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={(e) => handleFileChange(e.target.files[0], "selfie")}
                  />
                </label>
              </div>

              {/* errors */}
              {Object.values(errors).map(
                (err, i) =>
                  err && (
                    <div key={i} className="upload-error">
                      {err}
                    </div>
                  )
              )}
            </div>

            <div className="signup-actions">
              <button type="button" className="btn-outline" onClick={() => setStep(1)}>
                ย้อนกลับ
              </button>
              <button type="submit" className="btn-primary" disabled={!canSubmit}>
                ยืนยันข้อมูล
              </button>
            </div>
          </form>
        )}
      </div>

      {/* POPUP สมัครสมาชิกเสร็จสิ้น */}
      {showSuccess && (
        <div className="signup-success-backdrop" onClick={handleSuccessConfirm}>
          <div className="signup-success-modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="success-title">สมัครสมาชิกเสร็จสิ้น</h2>
            <p className="success-text">
              ท่านได้สมัครสมาชิกเสร็จสิ้นแล้ว
              <br />
              ระบบจะพาไปหน้าเข้าสู่ระบบ
            </p>

            <button type="button" className="success-btn" onClick={handleSuccessConfirm}>
              ยืนยัน
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

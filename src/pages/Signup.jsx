// src/pages/Signup.jsx
import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import InvestorRiskQuiz from "../components/InvestorRiskQuiz";
import { addApplicant } from "../utils/applicantsLocal";
import "../css/Signup.css";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOW_TYPES = ["image/jpeg", "image/png", "image/jpg"];

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

export default function Signup() {
  const navigate = useNavigate();
  const query = useQuery();

  // ===== type from query =====
  const userType = (query.get("type") || "general").toLowerCase(); // general | seller | investor
  const isGeneral = userType === "general";
  const isSeller = userType === "seller";
  const isInvestor = userType === "investor";

  // ✅ seller role from query
  const role = (query.get("role") || "").toLowerCase(); // agent | landlord
  const isAgent = isSeller && role === "agent";
  const isLandlord = isSeller && role === "landlord";
  const sellerRoleLabel = isAgent ? "Agent" : isLandlord ? "Landlord" : "Seller";

  const typeLabel = isSeller
    ? `Seller (${sellerRoleLabel})`
    : isInvestor
    ? "Investor"
    : "บุคคลทั่วไป";

  // ===== steps =====
  const [step, setStep] = useState(1);

  // ===== ui =====
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // ===== investor quiz (STEP 3 for investor) =====
  const [investorQuiz, setInvestorQuiz] = useState({
    q1: null,
    q2: null,
    q3: null,
    q4: null,
    q5: null,
    q6: null,
    q7: null,
    q8: null,
    q9: null,
    q10: null,
  });

  const investorScore = Object.values(investorQuiz).reduce(
    (sum, v) => sum + (Number(v) || 0),
    0
  );

  const investorAllAnswered = Object.values(investorQuiz).every((v) => v !== null);

  // ===== form state =====
  const [form, setForm] = useState({
    // step 1
    name: "",
    lastname: "",
    phone: "",
    email: "",
    lineId: "",
    address: "",
    password: "",
    confirmPassword: "",

    // step 3 seller
    sellerRole: role || "", // ✅ เก็บ role ไว้ใน form (ส่ง backend ง่าย)
    shopName: "",
    businessType: "",
    agentLicense: "", // ✅ Agent only
    idOrTax: "",
    bankName: "",
    bankAccount: "",
  });

  const updateForm = (key) => (e) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  // ===== uploads (step 2) =====
  const [idFront, setIdFront] = useState(null);
  const [idBack, setIdBack] = useState(null);
  const [selfie, setSelfie] = useState(null);
  const [errors, setErrors] = useState({});

  // ===== basic handlers =====
  const handleCancel = () => window.history.back();

  const handleSuccessConfirm = () => {
    setShowSuccess(false);
    navigate("/login");
  };

  // ===== upload logic + validation =====
  const handleFileChange = (file, type) => {
    if (!file) return;

    if (!ALLOW_TYPES.includes(file.type)) {
      setErrors((prev) => ({ ...prev, [type]: "รองรับเฉพาะไฟล์ JPG / PNG" }));
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setErrors((prev) => ({ ...prev, [type]: "ขนาดไฟล์ต้องไม่เกิน 5MB" }));
      return;
    }

    setErrors((prev) => ({ ...prev, [type]: null }));

    if (type === "front") setIdFront(file);
    if (type === "back") setIdBack(file);
    if (type === "selfie") setSelfie(file);
  };

  const canVerify =
    idFront && idBack && selfie && !errors.front && !errors.back && !errors.selfie;

  // ===== validations =====
  const validateStep1 = () => {
    if (!form.name || !form.lastname) return "กรุณากรอกชื่อ-นามสกุล";
    if (!form.email) return "กรุณากรอกอีเมล";
    if (!form.password || !form.confirmPassword) return "กรุณากรอกรหัสผ่านให้ครบ";
    if (form.password !== form.confirmPassword)
      return "Password และ Confirm Password ไม่ตรงกัน";
    return null;
  };

  const validateStep3 = () => {
    if (isSeller) {
      if (!form.shopName) return "กรุณากรอกชื่อร้าน/ชื่อผู้ขาย";
      if (!form.bankAccount) return "กรุณากรอกเลขบัญชีธนาคาร";

      // ✅ Agent ต้องมี license
      if (isAgent && !form.agentLicense)
        return "กรุณากรอกเลขที่ใบอนุญาต (License) ของ Agent";
    }

    if (isInvestor) {
      if (!investorAllAnswered)
        return "กรุณาตอบแบบประเมินความเสี่ยงให้ครบทั้ง 10 ข้อ";
    }

    return null;
  };

  // ===== next/back =====
  const goNextFromStep1 = (e) => {
    e.preventDefault();
    const err = validateStep1();
    if (err) return alert(err);
    setStep(2);
  };

  const goNextFromStep2 = (e) => {
    e.preventDefault();
    if (!canVerify) {
      alert("กรุณาอัปโหลดเอกสารยืนยันตัวตนให้ครบถ้วน");
      return;
    }

    if (isGeneral) {
      addApplicant(payload);
      setShowSuccess(true);
      return;
    }

    setStep(3);
  };

  const goNextFromStep3 = (e) => {
    e.preventDefault();
    const err = validateStep3();
    if (err) return alert(err);

    const payload = {
      type: userType,

      // ✅ ส่ง role สำหรับ seller
      role: isSeller ? (role || form.sellerRole || "") : null,

      // form
      ...form,

      // investor
      investorQuiz: isInvestor ? investorQuiz : null,
      investorScore: isInvestor ? investorScore : null,
    };

    const formData = new FormData();
    formData.append("payload", JSON.stringify(payload));
    formData.append("id_front", idFront);
    formData.append("id_back", idBack);
    formData.append("selfie", selfie);

    console.log("READY TO SUBMIT payload:", payload);
    console.log("READY TO SUBMIT formData:", formData);

    // TODO: ส่ง API จริง (Django)
    // await fetch("/api/signup", { method:"POST", body: formData })
    addApplicant(payload);
    setShowSuccess(true);
  };

  const goBack = () => {
    if (step === 3) return setStep(2);
    if (step === 2) return setStep(1);
  };

  // ===== Step bar logic =====
  const showStep3 = !isGeneral;

  return (
    <div className="signup-wrapper">
      <div className="signup-logo">SQW</div>

      <div className="signup-card">
        {/* Steps */}
        <div className="signup-steps">
          <div className={`step-item ${step === 1 ? "active" : ""}`}>
            <div className="step-circle">1</div>
            <span className="step-label">
              ข้อมูลทั่วไป
              <br />({typeLabel})
            </span>
          </div>

          <div className="step-line" />

          <div className={`step-item ${step === 2 ? "active" : ""}`}>
            <div className="step-circle">2</div>
            <span className="step-label">ยืนยันตัวตน</span>
          </div>

          {showStep3 && (
            <>
              <div className="step-line" />
              <div className={`step-item ${step === 3 ? "active" : ""}`}>
                <div className="step-circle">3</div>
                <span className="step-label">
                  ข้อมูลเฉพาะ
                  <br />({typeLabel})
                </span>
              </div>
            </>
          )}
        </div>

        {/* ===== STEP 1: Common ===== */}
        {step === 1 && (
          <>
            <h1 className="signup-title">Sign up</h1>

            <form className="signup-form" onSubmit={goNextFromStep1}>
              <div className="signup-grid">
                <div className="field">
                  <label>Name</label>
                  <input type="text" value={form.name} onChange={updateForm("name")} />
                </div>

                <div className="field">
                  <label>Lastname</label>
                  <input
                    type="text"
                    value={form.lastname}
                    onChange={updateForm("lastname")}
                  />
                </div>

                <div className="field">
                  <label>Phone</label>
                  <input type="tel" value={form.phone} onChange={updateForm("phone")} />
                </div>

                <div className="field">
                  <label>E-mail</label>
                  <input type="email" value={form.email} onChange={updateForm("email")} />
                </div>

                <div className="field">
                  <label>Line id</label>
                  <input type="text" value={form.lineId} onChange={updateForm("lineId")} />
                </div>

                <div className="field">
                  <label>Address</label>
                  <input type="text" value={form.address} onChange={updateForm("address")} />
                </div>

                <div className="field">
                  <label>Password</label>
                  <div className="password-group">
                    <input
                      type={showPassword ? "text" : "password"}
                      className="password-input"
                      value={form.password}
                      onChange={updateForm("password")}
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
                      value={form.confirmPassword}
                      onChange={updateForm("confirmPassword")}
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowConfirmPassword((p) => !p)}
                      aria-label={
                        showConfirmPassword
                          ? "Hide confirm password"
                          : "Show confirm password"
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
        )}

        {/* ===== STEP 2: Verify ===== */}
        {step === 2 && (
          <form className="signup-form" onSubmit={goNextFromStep2}>
            <div className="verify-section">
              <p className="verify-heading">ถ่ายรูปบัตรประชาชน</p>

              <div className="verify-row">
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
              <button type="button" className="btn-outline" onClick={goBack}>
                ย้อนกลับ
              </button>
              <button type="submit" className="btn-primary" disabled={!canVerify}>
                {isGeneral ? "ยืนยันและสมัคร" : "ถัดไป"}
              </button>
            </div>
          </form>
        )}

        {/* ===== STEP 3: Type-specific ===== */}
        {step === 3 && !isGeneral && (
          <>
            <h1 className="signup-title">ข้อมูล {typeLabel}</h1>

            <form className="signup-form" onSubmit={goNextFromStep3}>
              <div className="signup-grid">
                {isSeller && (
                  <>
                    <div className="field">
                      <label>Seller Role</label>
                      <input value={sellerRoleLabel} disabled />
                    </div>

                    <div className="field">
                      <label>Shop Name</label>
                      <input value={form.shopName} onChange={updateForm("shopName")} />
                    </div>

                    <div className="field">
                      <label>Business Type</label>
                      <input
                        value={form.businessType}
                        onChange={updateForm("businessType")}
                        placeholder="เช่น นายหน้า / บริษัท / เจ้าของที่ดิน"
                      />
                    </div>

                    {/* ✅ Agent only */}
                    {isAgent && (
                      <div className="field">
                        <label>Agent License (Required)</label>
                        <input
                          value={form.agentLicense}
                          onChange={updateForm("agentLicense")}
                          placeholder="เช่น 12345/2567"
                        />
                      </div>
                    )}

                    <div className="field">
                      <label>ID / Tax ID</label>
                      <input value={form.idOrTax} onChange={updateForm("idOrTax")} />
                    </div>

                    <div className="field">
                      <label>Bank Name</label>
                      <input value={form.bankName} onChange={updateForm("bankName")} />
                    </div>

                    <div className="field">
                      <label>Bank Account</label>
                      <input value={form.bankAccount} onChange={updateForm("bankAccount")} />
                    </div>
                  </>
                )}

                {isInvestor && (
                  <InvestorRiskQuiz value={investorQuiz} onChange={setInvestorQuiz} />
                )}
              </div>

              <div className="signup-actions">
                <button type="button" className="btn-outline" onClick={goBack}>
                  ย้อนกลับ
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={isInvestor ? !investorAllAnswered : false}
                  title={
                    isInvestor && !investorAllAnswered ? "กรุณาตอบให้ครบทั้ง 10 ข้อ" : ""
                  }
                >
                  ยืนยันและสมัคร
                </button>
              </div>
            </form>
          </>
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

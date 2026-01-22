// src/pages/Signup.jsx
import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import InvestorRiskQuiz from "../components/InvestorRiskQuiz";
import { addApplicant } from "../utils/applicantsLocal";
import { useTranslation } from "react-i18next";
import "../css/Signup.css";

import StepVerify from "./Signup/steps/StepVerify";
import StepCommon from "./Signup/steps/StepCommon";
import StepSpecific from "./Signup/steps/StepSpecific";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOW_TYPES = ["image/jpeg", "image/png", "image/jpg"];

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

export default function Signup() {
  const navigate = useNavigate();
  const query = useQuery();
  const { t } = useTranslation("signup");

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
    if (!form.name || !form.lastname) return t("error.nameRequired");
    if (!form.email) return t("error.emailRequired");
    if (!form.password || !form.confirmPassword) return t("error.passwordRequired");
    if (form.password !== form.confirmPassword)
      return t("error.passwordMismatch");
    return null;
  };

  const validateStep3 = () => {
    if (isSeller) {
      if (!form.shopName) return t("error.shopNameRequired");
      if (!form.bankAccount) return t("error.bankAccountRequired");
      // ✅ Agent ต้องมี license
      if (isAgent && !form.agentLicense)
        return t("error.agentLicenseRequired");
    }

    if (isInvestor) {
      if (!investorAllAnswered)
        return t("error.investorQuizRequired");
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
      const payload = {
        type: userType,
        ...form,
      };
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
              {t("step.common")}
              <br />({typeLabel})
            </span>
          </div>

          <div className="step-line" />

          <div className={`step-item ${step === 2 ? "active" : ""}`}>
            <div className="step-circle">2</div>
            <span className="step-label">{t("step.verify")}</span>
          </div>

          {showStep3 && (
            <>
              <div className="step-line" />
              <div className={`step-item ${step === 3 ? "active" : ""}`}>
                <div className="step-circle">3</div>
                <span className="step-label">
                  {t("step.specific")}
                  <br />({typeLabel})
                </span>
              </div>
            </>
          )}
        </div>

        {/* ===== STEP 1: Common ===== */}
        {step === 1 && (
          <StepCommon
            form={form}
            updateForm={updateForm}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            showConfirmPassword={showConfirmPassword}
            setShowConfirmPassword={setShowConfirmPassword}
            onNext={goNextFromStep1}
            onCancel={handleCancel}
            t={t}
          />
        )}

        {/* ===== STEP 2: Verify ===== */}
        {step === 2 && (
          <StepVerify
            idFront={idFront}
            idBack={idBack}
            selfie={selfie}
            errors={errors}
            canVerify={canVerify}
            onFileChange={handleFileChange}
            onNext={goNextFromStep2}
            onBack={goBack}
            isGeneral={isGeneral}
            t={t}
          />
        )}

        {/* ===== STEP 3: Type-specific ===== */}
        {step === 3 && !isGeneral && (
          <StepSpecific
            isSeller={isSeller}
            isInvestor={isInvestor}
            isAgent={isAgent}
            sellerRoleLabel={sellerRoleLabel}
            form={form}
            updateForm={updateForm}
            investorQuiz={investorQuiz}
            setInvestorQuiz={setInvestorQuiz}
            investorAllAnswered={investorAllAnswered}
            onSubmit={goNextFromStep3}
            onBack={goBack}
            t={t}
          />
        )}
      </div>

      {/* POPUP สมัครสมาชิกเสร็จสิ้น */}
      {showSuccess && (
        <div className="signup-success-backdrop" onClick={handleSuccessConfirm}>
          <div className="signup-success-modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="success-title">{t("success.title")}</h2>
            <p className="success-text">{t("success.message")}</p>
            <button type="button" className="success-btn" onClick={handleSuccessConfirm}>
              {t("success.confirm")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

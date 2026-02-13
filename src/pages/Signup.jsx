// src/pages/Signup.jsx
import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import InvestorRiskQuiz from "../components/InvestorRiskQuiz";
import { ROLE_MAP } from "../constants/roles";
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
  const userType = (query.get("type") || "buyer").toLowerCase(); // general | seller | investor
  const isbuyer = userType === "buyer";
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
    firstName: "",
    lastName: "",
    idCard: "",
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

  const updateForm = (key) => (e) => {
    let value = e.target.value;

    // ถ้าเป็นช่องชื่อ → อนุญาตเฉพาะตัวอักษร
    if (key === "firstName" || key === "lastName") {
      value = value.replace(/[^A-Za-zก-๙\s]/g, "");
    }

    setForm((prev) => ({ ...prev, [key]: value }));
  };
  // ===== uploads (step 2) =====
  const [idFront, setIdFront] = useState(null);
  const [idBack, setIdBack] = useState(null);
  const [selfie, setSelfie] = useState(null);
  const [agentLicenseImage, setAgentLicenseImage] = useState(null);
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

    const isEmpty = v => !v || v.trim() === "";

    if (isEmpty(form.firstName) || isEmpty(form.lastName))
      return "กรุณากรอกชื่อและนามสกุล";

    const nameRegex = /^[A-Za-zก-๙\s]+$/;
    if (!nameRegex.test(form.firstName.trim()))
      return "ชื่อต้องเป็นตัวอักษรเท่านั้น";
    if (!nameRegex.test(form.lastName.trim()))
      return "นามสกุลต้องเป็นตัวอักษรเท่านั้น";


    const email = form.email.trim();
    if (isEmpty(email))
      return "กรุณากรอกอีเมล";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email))
      return "รูปแบบอีเมลไม่ถูกต้อง";


    if (!/^[0-9]{10}$/.test(form.phone))
      return "เบอร์โทรต้อง 10 หลัก";


    if (isEmpty(form.password))
      return "กรุณากรอกรหัสผ่าน";

    const strongPass = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!strongPass.test(form.password))
      return "รหัสผ่านต้องมีตัวเล็ก ตัวใหญ่ และตัวเลข";


    if (form.password !== form.confirmPassword)
      return "รหัสผ่านไม่ตรงกัน";

    return null;
  };

  const validateStep3 = () => {
    if (isSeller) {
      if (!form.shopName) return t("error.shopNameRequired");
      // ✅ Agent ต้องมี license
      if (isAgent && !form.agentLicense)
        return t("error.agentLicenseRequired");
      if (isAgent && !agentLicenseImage)
        return t("error.agentLicenseImageRequired");
    }

    if (isInvestor) {
      if (!investorAllAnswered)
        return t("error.investorQuizRequired");
    }

    return null;
  };

  const buildPayload = () => {

    let roleKey;

    if (isSeller)
      roleKey = role || form.sellerRole;
    else if (isInvestor)
      roleKey = "investor";
    else
      roleKey = "buyer";

    const roleToSave = String(roleKey).trim().toLowerCase();

    console.log("SEND ROLE =", roleToSave);

    return {
      role: roleToSave,
      email: form.email,
      password: form.password,
      first_name: form.firstName,
      last_name: form.lastName,
      phone: form.phone,
      line_id: form.lineId,
      address: form.address,
      number_id_card: form.idCard.replace(/-/g, "")
    };
  };


  // ===== next/back =====
  const goNextFromStep1 = (e) => {
    e.preventDefault();
    const err = validateStep1();
    if (err) return alert(err);
    setStep(2);
  };

  const goNextFromStep2 = async (e) => {
    e.preventDefault();

    if (!canVerify) {
      alert("กรุณาอัปโหลดเอกสารยืนยันตัวตนให้ครบถ้วน");
      return;
    }

    // ⭐ ถ้าต้องมี Step3 → ไป Step3 ก่อน
    if (shouldHaveStep3) {
      setStep(3);
      return;
    }

    // ⭐ ถ้าไม่มี Step3 → submit เลย
    const payload = buildPayload();

    const formData = new FormData();
    formData.append("payload", JSON.stringify(payload));
    formData.append("id_card_image_front", idFront);
    formData.append("id_card_image_back", idBack);
    formData.append("selfie", selfie);

    try {
      const res = await fetch("http://localhost:3000/api/auth/signup", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!data.success) {
        alert(data.message || "Signup failed");
        return;
      }

      setShowSuccess(true);

    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  };

  const goNextFromStep3 = async (e) => {
    e.preventDefault();

    const err = validateStep3();
    if (err) return alert(err);

    const payload = buildPayload();

    const formData = new FormData();
    formData.append("payload", JSON.stringify(payload));
    formData.append("id_card_image_front", idFront);
    formData.append("id_card_image_back", idBack);
    formData.append("selfie", selfie);

    if (isAgent && agentLicenseImage) {
      formData.append("agent_license_image", agentLicenseImage);
    }

    try {
      const res = await fetch("http://localhost:3000/api/auth/signup", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!data.success) {
        alert(data.message || "Signup failed");
        return;
      }

      setShowSuccess(true);
    } catch (err) {
      console.error(err);
      alert("Upload error");
    }
  };

  const goBack = () => {
    if (step === 3) return setStep(2);
    if (step === 2) return setStep(1);
  };

  // ===== Step bar logic =====
  const shouldHaveStep3 = isAgent || isInvestor;

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

          {shouldHaveStep3 && (
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
            isbuyer={isbuyer}
            form={form}
            updateForm={updateForm}
          />
        )}

        {/* ===== STEP 3: Type-specific ===== */}
        {step === 3 && shouldHaveStep3 && (
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
            agentLicenseImage={agentLicenseImage}
            setAgentLicenseImage={setAgentLicenseImage}
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

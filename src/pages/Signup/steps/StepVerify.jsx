// src/pages/Signup/steps/StepVerify.jsx
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { formatThaiId } from "../../../utils/thaiId";

export default function StepVerify({
  idFront,
  idBack,
  selfie,
  errors,
  canVerify,
  onFileChange,
  onNext,
  onBack,
  isGeneral,
  form,
  updateForm
}) {

  const { t } = useTranslation("signup");

  return (
    <form className="signup-form" onSubmit={onNext}>
      <div className="field verify-input">
            <label>{t("field.idCard")}</label>
            <input
              value={form.idCard}
              maxLength={17}
              onChange={(e) =>
                updateForm("idCard")({
                  target: { value: formatThaiId(e.target.value) }
                })
              }
            />
      </div>

      <div className="verify-section">
        <p className="verify-heading">{t("verify.idCard")}</p>

        <div className="verify-row">
          {["front", "back"].map((type) => (
            <label key={type} className="upload-box">
              {type === "front" && idFront && (
                <img
                  className="upload-preview"
                  src={URL.createObjectURL(idFront)}
                  alt=""
                />
              )}
              {type === "back" && idBack && (
                <img className="upload-preview" src={URL.createObjectURL(idBack)} alt="" />
              )}
              {!((type === "front" && idFront) || (type === "back" && idBack)) && (
                <>
                  <span>{t(`verify.${type}`)}</span>
                </>
              )}
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={(e) => onFileChange(e.target.files[0], type)}
              />
            </label>
          ))}
        </div>

        <p className="verify-heading">{t("verify.selfie")}</p>

        <label className="upload-box">
          {selfie ? (
            <img className="upload-preview" src={URL.createObjectURL(selfie)} alt="" />  
          ) : (
            <span>{t("verify.selfie")}</span>
          )}
          <input
            type="file"
            hidden
            accept="image/*"
            onChange={(e) => onFileChange(e.target.files[0], "selfie")}
          />
        </label>

        {Object.values(errors).map(
          (err, i) => err && <div key={i}>{err}</div>
        )}
      </div>

      <div className="signup-actions">
        <button type="button" className="btn-outline" onClick={onBack}>
          {t("action.back")}
        </button>
        <button type="submit" className="btn-primary" disabled={!canVerify}>
          {isGeneral ? t("action.submit") : t("action.next")}
        </button>
      </div>
    </form>
  );
}

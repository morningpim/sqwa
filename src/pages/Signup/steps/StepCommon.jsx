// src/pages/Signup/steps/StepCommon.jsx
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

export default function StepCommon({
  form,
  updateForm,
  showPassword,
  setShowPassword,
  showConfirmPassword,
  setShowConfirmPassword,
  onNext,
  onCancel,
  t,
}) {
  return (
    <>
      <h1 className="signup-title">{t("title")}</h1>

      <form className="signup-form" onSubmit={onNext}>
        <div className="signup-grid">
          <div className="field">
            <label>{t("field.name")}</label>
            <input value={form.name} onChange={updateForm("name")} />
          </div>

          <div className="field">
            <label>{t("field.lastname")}</label>
            <input value={form.lastname} onChange={updateForm("lastname")} />
          </div>

          <div className="field">
            <label>{t("field.phone")}</label>
            <input value={form.phone} onChange={updateForm("phone")} />
          </div>

          <div className="field">
            <label>{t("field.email")}</label>
            <input value={form.email} onChange={updateForm("email")} />
          </div>

          <div className="field">
            <label>{t("field.lineId")}</label>
            <input value={form.lineId} onChange={updateForm("lineId")} />
          </div>

          <div className="field">
            <label>{t("field.address")}</label>
            <input value={form.address} onChange={updateForm("address")} />
          </div>

          <div className="field">
            <label>{t("field.password")}</label>
            <div className="password-group">
              <input
                type={showPassword ? "text" : "password"}
                className="password-input"
                value={form.password}
                onChange={updateForm("password")}
              />
              <button type="button" className="password-toggle" 
                    onClick={() => setShowPassword((p) => !p)} 
                    aria-label={showPassword ? "Hide password" : "Show password"} > 
                    {showPassword ? ( <AiOutlineEyeInvisible size={18} /> ) : ( <AiOutlineEye size={18} /> )} 
              </button>
            </div>
          </div>

          <div className="field">
            <label>{t("field.confirmPassword")}</label>
            <div className="password-group">
              <input
                type={showConfirmPassword ? "text" : "password"}
                className="password-input"
                value={form.confirmPassword}
                onChange={updateForm("confirmPassword")}
              />
              <button type="button" className="password-toggle" onClick={() => setShowConfirmPassword((p) => !p)} 
              aria-label={ showConfirmPassword ? "Hide confirm password" : "Show confirm password" } > 
              {showConfirmPassword ? ( <AiOutlineEyeInvisible size={18} /> ) : ( <AiOutlineEye size={18} /> )} 
              </button>
            </div>
          </div>
        </div>

        <div className="signup-actions">
          <button type="button" className="btn-outline" onClick={onCancel}>
            {t("action.cancel")}
          </button>
          <button type="submit" className="btn-primary">
            {t("action.next")}
          </button>
        </div>
      </form>
    </>
  );
}

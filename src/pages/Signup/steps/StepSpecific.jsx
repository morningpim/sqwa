// src/pages/Signup/steps/StepSpecific.jsx
import InvestorRiskQuiz from "../../../components/InvestorRiskQuiz";

export default function StepSpecific({
  isSeller,
  isInvestor,
  isAgent,
  sellerRoleLabel,
  form,
  updateForm,
  investorQuiz,
  setInvestorQuiz,
  investorAllAnswered,
  onSubmit,
  onBack,
  t,
}) {
  return (
    <>
      <h1 className="signup-title">{t("step.specific")}</h1>

      <form className="signup-form" onSubmit={onSubmit}>
        <div className="signup-grid">
          {isSeller && (
            <>
              {/* Seller Role */}
              <div className="field">
                <label>{t("seller.role")}</label>
                <input value={sellerRoleLabel} disabled />
              </div>

              {/* Shop / Seller Name */}
              <div className="field">
                <label>{t("seller.shopName")}</label>
                <input
                  value={form.shopName}
                  onChange={updateForm("shopName")}
                  placeholder={t("seller.shopNamePlaceholder")}
                />
              </div>

              {/* Agent only */}
              {isAgent && (
                <div className="field">
                  <label>{t("seller.agentLicense")}</label>
                  <input
                    value={form.agentLicense}
                    onChange={updateForm("agentLicense")}
                    placeholder={t("seller.agentLicensePlaceholder")}
                  />
                </div>
              )}
            </>
          )}

          {isInvestor && (
            <InvestorRiskQuiz value={investorQuiz} onChange={setInvestorQuiz} />
          )}
        </div>

        <div className="signup-actions">
          <button type="button" className="btn-outline" onClick={onBack}>
            {t("action.back")}
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={isInvestor && !investorAllAnswered}
          >
            {t("action.submit")}
          </button>
        </div>
      </form>
    </>
  );
}

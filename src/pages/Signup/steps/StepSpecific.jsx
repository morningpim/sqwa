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
  agentLicenseImage,
  setAgentLicenseImage,
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
                <label>{t("seller.shopNamePlaceholder")}</label>
                <input
                  value={form.shopName}
                  onChange={updateForm("shopName")}
                  placeholder={t("seller.shopNamePlaceholder")}
                />
              </div>

              {isAgent && (
              <>
                <div className="field">
                  <label>{t("seller.agentLicensePlaceholder")}</label>
                  <input
                    value={form.agentLicense}
                    onChange={updateForm("agentLicense")}
                    placeholder={t("seller.agentLicensePlaceholder")}
                  />
                </div>

                <div className="field ">
                  <label className="center">{t("seller.agentLicenseImage")}</label>

                  <label className="upload-box center">
                    {agentLicenseImage ? (
                      <img src={URL.createObjectURL(agentLicenseImage)} alt="" />
                    ) : (
                      <span>{t("seller.uploadLicense")}</span>
                    )}
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={(e) => setAgentLicenseImage(e.target.files[0])}
                    />
                  </label>
                </div>
              </>
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

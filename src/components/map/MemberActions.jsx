import { QUOTA_LIMIT } from "./constants/unlock";
import { useTranslation } from "react-i18next";

export default function MemberActions({
  quotaUsed = 0,
  onChatSeller,
  onUnlockAll,
}) {
  // ✅ bind land namespace
  const { t } = useTranslation("land");

  const quotaExceeded = quotaUsed >= QUOTA_LIMIT;

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div className="sqw-h" style={{ margin: 0 }}>
          {t("section.member")}
        </div>

        <div style={{ fontSize: 12, opacity: 0.8 }}>
          {t("quota.today", {
            used: quotaUsed,
            total: QUOTA_LIMIT,
          })}
        </div>
      </div>

      <div style={{ fontSize: 12, opacity: 0.75, marginTop: 6 }}>
        {t("quota.hint")}
      </div>

      <div className="sqw-actions" style={{ marginTop: 10 }}>
        <button
          className="sqw-btn"
          type="button"
          onClick={onChatSeller}
        >
          {t("action.chatSeller")}
        </button>

        <button
          className="sqw-btn sqw-pay-btn"
          type="button"
          disabled={quotaExceeded}
          onClick={onUnlockAll}
        >
          {t("action.unlockAll")}
        </button>
      </div>
    </>
  );
}

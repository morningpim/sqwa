import { useTranslation } from "react-i18next";

export default function GuestActions({
  onChatSeller,
  onOpenUnlockPicker,
}) {
  // ✅ bind land namespace
  const { t } = useTranslation("land");

  return (
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
        onClick={onOpenUnlockPicker}
      >
        {t("action.unlock")}
      </button>
    </div>
  );
}

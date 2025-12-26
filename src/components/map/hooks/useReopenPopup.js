import { useCallback, useRef } from "react";

/**
 * เก็บ land/loc ล่าสุดไว้ เพื่อ reopen popup หลังปิด modal (unlock/pay)
 */
export function useReopenPopup({ popupApi, openPopupForWithAccess }) {
  const reopenPopupRef = useRef(null); // { land, loc }

  const rememberPopup = useCallback(() => {
    const land = popupApi.selectedLand || popupApi.lastPopupLandRef?.current;
    const loc = popupApi.lastPopupLocRef?.current || null;
    reopenPopupRef.current = land && loc ? { land, loc } : null;
  }, [popupApi.selectedLand, popupApi.lastPopupLandRef, popupApi.lastPopupLocRef]);

  const reopenPopup = useCallback(() => {
    const cur = reopenPopupRef.current;
    if (cur?.land && cur?.loc) openPopupForWithAccess(cur.land, cur.loc);
    reopenPopupRef.current = null;
  }, [openPopupForWithAccess]);

  const clearRememberedPopup = useCallback(() => {
    reopenPopupRef.current = null;
  }, []);

  return { rememberPopup, reopenPopup, clearRememberedPopup };
}

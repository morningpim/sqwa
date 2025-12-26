import { useCallback, useEffect, useRef, useState } from "react";

/**
 * รวม flow: เปิด UnlockPicker -> AddToCart/Confirm -> เปิด Pay -> Paid/Cancel -> reopen popup
 */
export function useUnlockFlow({
  accessApi,
  mode = "buy",
  addToCart,
  popupApi,
  rememberPopup,
  reopenPopup,
}) {
  // -------------------------
  // Pay modal state
  // -------------------------
  const [payOpen, setPayOpen] = useState(false);
  const [payDraft, setPayDraft] = useState(null); // { landId, selectedFields }

  // ให้ Map click close รู้ว่า payOpen อยู่ไหม
  const payOpenRef = useRef(false);
  useEffect(() => {
    payOpenRef.current = payOpen;
  }, [payOpen]);

  // ให้ Map click close รู้ว่า unlockOpen อยู่ไหม
  const unlockOpenRef = useRef(false);
  useEffect(() => {
    unlockOpenRef.current = accessApi.unlockOpen;
  }, [accessApi.unlockOpen]);

  // -------------------------
  // From popup (LandDetailPanel)
  // -------------------------
  const onOpenUnlockPicker = useCallback(
    (landId) => {
        if (!landId) return;

        // ✅ SELL mode: ไม่ต้องปลดล็อก/จ่ายเงิน
        if (mode === "sell") {
        // TODO: จะให้ไปหน้า "ลงประกาศ/แชท" ก็ได้
        alert("โหมดขาย: ไปหน้าติดต่อ/ลงประกาศ (TODO)");
        return;
        }

        // ✅ BUY mode: flow เดิม
        rememberPopup?.();
        popupApi?.setPopupOpen?.(false);
        popupApi?.setPopupPos?.(null);
        accessApi?.openUnlockPicker?.(landId);
    },
    [mode, accessApi, popupApi, rememberPopup]
    );
    
  const onUnlockAll = useCallback(
    (landId) => {
      const saved = accessApi.unlockAllForMember(landId);
      if (saved) accessApi.setAccess(saved);
    },
    [accessApi]
  );

  // -------------------------
  // UnlockPickerModal callbacks
  // -------------------------
  const onCancelUnlock = useCallback(() => {
    accessApi.setUnlockOpen(false);
    reopenPopup?.();
  }, [accessApi, reopenPopup]);

  const onAddToCartUnlock = useCallback(
    ({ selected, total }) => {
      addToCart({ landId: accessApi.unlockLandId, selectedFields: selected, total });
      accessApi.setUnlockOpen(false);
      reopenPopup?.();
    },
    [addToCart, accessApi, reopenPopup]
  );

  const onConfirmUnlock = useCallback(
    ({ selected }) => {
      if (!accessApi.unlockLandId || !selected?.length) return;

      rememberPopup?.();
      setPayDraft({ landId: accessApi.unlockLandId, selectedFields: selected });
      accessApi.setUnlockOpen(false);
      setPayOpen(true);
    },
    [accessApi, rememberPopup]
  );

  // -------------------------
  // PayModal callbacks
  // -------------------------
  const onClosePay = useCallback(() => {
    setPayOpen(false);
    reopenPopup?.();
  }, [reopenPopup]);

  const onPaid = useCallback(
    (savedAccess) => {
      accessApi.setAccess(savedAccess);
      setPayOpen(false);
      popupApi.closePopup(); // จ่ายแล้ว -> ไม่ reopen
    },
    [accessApi, popupApi]
  );

  return {
    // refs ให้ MapPage ใช้กัน click ปิด popup
    payOpenRef,
    unlockOpenRef,

    // PayModal props
    payOpen,
    payDraft,
    onClosePay,
    onPaid,

    // LandDetailPanel actions
    onOpenUnlockPicker,
    onUnlockAll,

    // UnlockPickerModal props
    onCancelUnlock,
    onAddToCartUnlock,
    onConfirmUnlock,
  };
}

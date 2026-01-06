// src/components/map/hooks/useUnlockFlow.js
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * useUnlockFlow
 * รวม flow: เปิด UnlockPicker -> AddToCart/Confirm -> เปิด Pay -> Paid/Cancel -> reopen popup
 *
 * เป้าหมาย UX (ตามที่ต้องการ):
 * - กด "ปลดล็อกข้อมูล" แล้ว "Popup ข้อมูลที่ดิน" ต้องไม่ไปบัง/ซ้อนกับ UnlockPicker/Pay
 *   => เรา "จำ" popup ไว้ก่อน แล้ว "ปิด popup" จากนั้นค่อยเปิด modal
 * - ปิด/ยกเลิก UnlockPicker หรือ Pay แล้ว "เปิด popup เดิมกลับมา"
 * - จ่ายเสร็จแล้ว "เปิด popup เดิมกลับมา" (ให้เห็นข้อมูลที่ปลดล็อกแล้ว)
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

  // refs ให้ฝั่ง Map click close / guard รู้สถานะ modal
  const payOpenRef = useRef(false);
  useEffect(() => {
    payOpenRef.current = payOpen;
  }, [payOpen]);

  const unlockOpenRef = useRef(false);
  useEffect(() => {
    unlockOpenRef.current = !!accessApi?.unlockOpen;
  }, [accessApi?.unlockOpen]);

  // -------------------------
  // helpers
  // -------------------------
  const closeLandPopupSoft = useCallback(() => {
    // ปิด popup เพื่อไม่ให้ไปบัง modal
    try {
      popupApi?.closePopup?.();
    } catch {}
  }, [popupApi]);

  // -------------------------
  // From popup (LandDetailPanel)
  // -------------------------
  const onOpenUnlockPicker = useCallback(
    (landId) => {
      if (!landId) return;

      // SELL mode: ไม่ต้องปลดล็อก/จ่ายเงิน (แล้วแต่ระบบจะพาไปทางไหน)
      if (mode === "sell") {
        alert("โหมดขาย: ไปหน้าติดต่อ/ลงประกาศ (TODO)");
        return;
      }

      // BUY / EIA (ถ้ามี): จำ popup แล้วปิด popup ก่อนเปิด modal
      rememberPopup?.();
      closeLandPopupSoft();

      // เปิด UnlockPicker
      accessApi?.openUnlockPicker?.(landId);
    },
    [mode, accessApi, rememberPopup, closeLandPopupSoft]
  );

  const onUnlockAll = useCallback(
    (landId) => {
      if (!landId) return;
      const saved = accessApi?.unlockAllForMember?.(landId);
      if (saved) accessApi?.setAccess?.(saved);
    },
    [accessApi]
  );

  // -------------------------
  // UnlockPickerModal callbacks
  // -------------------------
  const onCancelUnlock = useCallback(() => {
    accessApi?.setUnlockOpen?.(false);
    reopenPopup?.();
  }, [accessApi, reopenPopup]);

  const onAddToCartUnlock = useCallback(
    ({ selected, total }) => {
      const landId = accessApi?.unlockLandId;
      if (!landId) return;

      addToCart?.({ landId, selectedFields: selected, total });
      accessApi?.setUnlockOpen?.(false);

      // กลับไป popup เดิม (ไม่ให้ซ้อน)
      reopenPopup?.();
    },
    [addToCart, accessApi, reopenPopup]
  );

  const onConfirmUnlock = useCallback(
    ({ selected }) => {
      const landId = accessApi?.unlockLandId;
      if (!landId || !Array.isArray(selected) || selected.length === 0) return;

      // จำ popup แล้วปิด popup ก่อนเปิด Pay
      rememberPopup?.();
      closeLandPopupSoft();

      setPayDraft({ landId, selectedFields: selected });
      accessApi?.setUnlockOpen?.(false);
      setPayOpen(true);
    },
    [accessApi, rememberPopup, closeLandPopupSoft]
  );

  // -------------------------
  // PayModal callbacks
  // -------------------------
  const onClosePay = useCallback(() => {
    setPayOpen(false);
    // กลับไป popup เดิม (ไม่ให้ซ้อน)
    reopenPopup?.();
  }, [reopenPopup]);

  const onPaid = useCallback(
    (savedAccess) => {
      // บันทึกสิทธิ์ที่ปลดล็อก
      if (savedAccess) accessApi?.setAccess?.(savedAccess);

      // ปิด Pay แล้ว "เปิด popup เดิมกลับมา" เพื่อโชว์ข้อมูลที่ปลดล็อกแล้ว
      setPayOpen(false);
      reopenPopup?.();
    },
    [accessApi, reopenPopup]
  );

  return {
    // refs ให้ MapPage/useMapEvents ใช้ guard การปิดด้วยคลิกแผนที่
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

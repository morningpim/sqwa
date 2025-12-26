// src/pages/Cart/hooks/useHybridPayment.js
import { todayKeyTH } from "../utils/date";

/**
 * Hybrid Pay Handler
 * - PromptPay: show QR in page (POST /api/checkout/qr)
 * - Card/Bank: redirect (POST /api/checkout/redirect -> {redirectUrl})
 */
export function createHybridPayHandler({
  cart,
  total,
  paymentMethod,
  setLoading,
  setPayStatus,
  setQrData,
  setQrOpen,
}) {
  return async function onPayHybrid() {
    if (!cart?.length) return;
    if (!paymentMethod) return alert("กรุณาเลือกวิธีชำระเงิน");

    const orderId = `CART_${todayKeyTH()}_${cart.length}`;

    // 1) PromptPay -> QR modal
    if (paymentMethod === "promptpay") {
      try {
        setLoading(true);
        setPayStatus("PENDING");

        const res = await fetch("/api/checkout/qr", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId, amount: total, items: cart }),
        });

        if (!res.ok) {
          // fallback mock (ถ้ายังไม่มี backend) — เอาออกเมื่อมี backend จริง
          const mockQrText =
            "00020101021229370016A000000677010111011300668123456789025802TH53037645405" +
            String(total).padStart(2, "0") +
            "6304ABCD";
          setQrData({ orderId, amount: total, qrText: mockQrText });
          setQrOpen(true);
          return;
        }

        const data = await res.json();
        setQrData(data);
        setQrOpen(true);
        return;
      } catch (e) {
        alert(e?.message || "เกิดข้อผิดพลาด");
      } finally {
        setLoading(false);
      }
    }

    // 2) Card/Bank -> Redirect
    try {
      setLoading(true);

      const res = await fetch("/api/checkout/redirect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, amount: total, items: cart, method: paymentMethod }),
      });

      if (!res.ok) {
        // fallback mock redirect (เอาออกเมื่อมี backend จริง)
        return alert("ยังไม่มี backend สำหรับ redirectUrl (mock)");
      }

      const data = await res.json();
      if (!data?.redirectUrl) throw new Error("redirectUrl ไม่ถูกต้อง");

      window.location.href = data.redirectUrl;
    } catch (e) {
      alert(e?.message || "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  };
}

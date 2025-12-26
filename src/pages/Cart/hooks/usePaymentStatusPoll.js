// src/pages/Cart/hooks/usePaymentStatusPoll.js
import React from "react";

/**
 * Poll payment status when qrOpen = true
 * Backend: GET /api/payment/status?orderId=...
 */
export function usePaymentStatusPoll({ qrOpen, orderId, onPaid, setPayStatus, intervalMs = 3000 }) {
  React.useEffect(() => {
    if (!qrOpen || !orderId) return;

    let alive = true;

    const tick = async () => {
      try {
        const res = await fetch(`/api/payment/status?orderId=${encodeURIComponent(orderId)}`);
        if (!res.ok) return;

        const s = await res.json();
        if (!alive) return;

        const status = String(s?.status || "PENDING").toUpperCase();
        setPayStatus(status);

        if (status === "PAID") onPaid?.();
      } catch {
        // เงียบไว้ (ยังไม่มี backend ก็ไม่พัง)
      }
    };

    const id = setInterval(tick, intervalMs);
    tick();

    return () => {
      alive = false;
      clearInterval(id);
    };
  }, [qrOpen, orderId, onPaid, setPayStatus, intervalMs]);
}

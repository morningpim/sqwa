import { useCallback } from "react";
import { CART_KEY } from "../utils/storageKeys";

function safeJsonParse(raw, fallback) {
  try {
    const v = raw ? JSON.parse(raw) : fallback;
    return v;
  } catch {
    return fallback;
  }
}

export function useMapCart(navigate) {
  const addToCart = useCallback(
    ({ landId, selectedFields, total }) => {
      if (!landId || !Array.isArray(selectedFields) || selectedFields.length === 0) return;

      const item = {
        id: `${landId}:${selectedFields.slice().sort().join(",")}:${Date.now()}`,
        landId: String(landId),
        selectedFields: selectedFields.slice(),
        total: Number(total || 0),
        createdAt: Date.now(),
      };

      let cart = safeJsonParse(localStorage.getItem(CART_KEY), []);
      if (!Array.isArray(cart)) cart = [];
      cart.push(item);

      localStorage.setItem(CART_KEY, JSON.stringify(cart));
      window.dispatchEvent(new Event("sqw-cart-changed"));
      navigate("/cart");
    },
    [navigate]
  );

  return { addToCart };
}

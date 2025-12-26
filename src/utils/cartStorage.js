// src/utils/cartStorage.js
const CART_KEY = "sqw_cart_v1";

// โครงสร้าง item ใน cart:
// { landId: string, selectedFields: string[], createdAt: number }

export function readCart() {
  try {
    const raw = localStorage.getItem(CART_KEY) || "[]";
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export function writeCart(nextArr) {
  const arr = Array.isArray(nextArr) ? nextArr : [];
  localStorage.setItem(CART_KEY, JSON.stringify(arr));

  // ให้ Navbar อัปเดต badge
  window.dispatchEvent(new Event("sqw-cart-changed"));
}

export function clearCart() {
  localStorage.setItem(CART_KEY, "[]");
  window.dispatchEvent(new Event("sqw-cart-changed"));
}

export function removeCartItem(landId) {
  const id = String(landId || "");
  if (!id) return;

  const cur = readCart();
  const next = cur.filter((x) => String(x?.landId || "") !== id);
  writeCart(next);
}

// ✅ เพิ่ม/อัปเดตรายการในตะกร้า
// - ถ้ามี landId เดิมอยู่แล้ว จะ merge fields เข้าไป (กันซ้ำ)
// - ถ้าไม่มี จะเพิ่มใหม่พร้อม createdAt
export function addToCart({ landId, selectedFields }) {
  const id = String(landId || "");
  const fields = Array.isArray(selectedFields) ? selectedFields.filter(Boolean) : [];
  if (!id || fields.length === 0) return;

  const cur = readCart();
  const idx = cur.findIndex((x) => String(x?.landId || "") === id);

  if (idx >= 0) {
    const prev = Array.isArray(cur[idx]?.selectedFields) ? cur[idx].selectedFields : [];
    const merged = Array.from(new Set([...prev, ...fields]));
    const next = [...cur];
    next[idx] = { ...next[idx], selectedFields: merged };
    writeCart(next);
  } else {
    const next = [
      ...cur,
      {
        landId: id,
        selectedFields: Array.from(new Set(fields)),
        createdAt: Date.now(),
      },
    ];
    writeCart(next);
  }
}

export function getCartCount() {
  return readCart().length; // นับเป็นจำนวนรายการ (land) ในตะกร้า
}

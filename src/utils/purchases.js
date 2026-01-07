// src/utils/purchases.js
const KEY = "purchases_v1";
const EVT = "purchases:changed";

function safeParse(json, fallback) {
  try {
    const v = JSON.parse(json);
    return Array.isArray(v) ? v : fallback;
  } catch {
    return fallback;
  }
}

export function readPurchases() {
  return safeParse(localStorage.getItem(KEY) || "[]", []);
}

export function writePurchases(list) {
  localStorage.setItem(KEY, JSON.stringify(list || []));
  window.dispatchEvent(new Event(EVT));
}

export function addPurchase(purchase) {
  const list = readPurchases();

  const item = {
    id: purchase?.id ?? `po_${Date.now()}`,
    landId: purchase?.landId ?? "",
    title: purchase?.title ?? "รายการสั่งซื้อ",
    seller: purchase?.seller ?? "-",
    // แนะนำเก็บเป็น number เพื่อเอาไปคำนวณต่อได้ง่าย
    totalPrice: typeof purchase?.totalPrice === "number" ? purchase.totalPrice : Number(purchase?.totalPrice || 0),
    status: purchase?.status ?? "paid", // pending | paid | cancelled | refunded
    paidAt: purchase?.paidAt ?? new Date().toISOString().slice(0, 10),
    note: purchase?.note ?? "",
    paymentMethod: purchase?.paymentMethod ?? "",
  };

  writePurchases([item, ...list]);
  return item;
}

export function removePurchase(id) {
  const list = readPurchases().filter((x) => x.id !== id);
  writePurchases(list);
}

export function subscribePurchasesChanged(cb) {
  const handler = () => cb?.();
  window.addEventListener(EVT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(EVT, handler);
    window.removeEventListener("storage", handler);
  };
}

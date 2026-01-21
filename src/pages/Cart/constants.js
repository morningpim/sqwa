export const ACCESS_KEY = "sqw_access_v1";

/** Pricing only (logic) */
export const PRICE = {
  contactOwner: 50,
  broker: 50,
  phone: 200,
  line: 150,
  frame: 100,
  chanote: 200,
};

/**
 * Field key → i18n key
 * แทน LABEL เดิม (ห้ามใส่ภาษาในนี้)
 */
export const FIELD_I18N_KEY = {
  // ตัด common. ออก เพราะ namespace ถูกระบุแยกไว้แล้วใน i18n.js
  contactOwner: "field.owner", 
  broker: "field.agent",
  phone: "field.phone",
  line: "field.lineId",
  frame: "field.landFrame",
  chanote: "field.deed",
};
/**
 * Payment methods (logic only)
 * UI จะไปเรียก i18n เอง
 */
export const PAYMENT_METHODS = [
  { key: "promptpay" },
  { key: "card" },
  { key: "bank" },
];


export const PRICE = {
  contactOwner: 50,
  broker: 50,
  phone: 200,
  line: 150,
  frame: 100,
  chanote: 200,
};

export const LABEL = {
  contactOwner: "เจ้าของ",
  broker: "นายหน้า",
  phone: "เบอร์โทร",
  line: "LINE ID",
  frame: "กรอบที่ดิน",
  chanote: "โฉนด/ระวาง",
};

export const PAYMENT_METHODS = [
  { key: "promptpay", title: "PromptPay / QR", desc: "สแกนเพื่อชำระเงิน" },
  { key: "card", title: "บัตรเครดิต/เดบิต", desc: "Visa / MasterCard" },
  { key: "bank", title: "โอนผ่านธนาคาร", desc: "Redirect ไปผู้ให้บริการ" },
];

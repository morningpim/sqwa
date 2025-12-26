// src/pages/PayModal/utils.js

export function todayKeyTH() {
  return new Date().toLocaleDateString("en-CA");
}

export function buildPromptPayMockQr(amount) {
  return (
    "00020101021229370016A000000677010111011300668123456789025802TH53037645405" +
    String(amount).padStart(2, "0") +
    "6304ABCD"
  );
}

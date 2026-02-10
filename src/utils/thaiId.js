// format 1234567890123 -> 1-2345-67890-12-3
export function formatThaiId(value) {
  const digits = value.replace(/\D/g, "").slice(0, 13);

  const parts = [
    digits.slice(0, 1),
    digits.slice(1, 5),
    digits.slice(5, 10),
    digits.slice(10, 12),
    digits.slice(12, 13),
  ].filter(Boolean);

  return parts.join("-");
}

// checksum validation
export function isValidThaiId(id) {
  const digits = id.replace(/\D/g, "");
  if (digits.length !== 13) return false;

  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(digits[i]) * (13 - i);
  }

  const check = (11 - (sum % 11)) % 10;
  return check === parseInt(digits[12]);
}

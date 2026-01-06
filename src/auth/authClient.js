// src/auth/authClient.js
const MOCK_DELAY_MS = 100;

// ตอนนี้ใช้ mock ก่อน (ยังไม่ทำ backend)
const AUTH_MODE = "mock"; // "mock" | "api"

export async function getMe() {
  if (AUTH_MODE === "api") {
    throw new Error("API mode not enabled yet");
  }

  // ===== mock =====
  await new Promise((r) => setTimeout(r, MOCK_DELAY_MS));

  const role = localStorage.getItem("role") || "buyer";
  const username = localStorage.getItem("username") || "guest";

  return {
    id: 1,
    username,
    role, // buyer|seller|staff|admin
  };
}

export async function setMockRole(role) {
  localStorage.setItem("role", role);
  return true;
}

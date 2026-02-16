// src/mocks/signupService.js
const mockDB = JSON.parse(localStorage.getItem("mockUsers") || "[]");

export const mockSignup = async (formData) => {
  const data = Object.fromEntries(formData);
  console.log("MOCK PAYLOAD =", data);

  await new Promise((res) => setTimeout(res, 800));

  /* ---------------- VALIDATION ---------------- */

  if (!data.email || !data.password) {
    return {
      success: false,
      message: "Missing required fields",
    };
  }

  if (data.password.length < 6) {
    return {
      success: false,
      message: "Password must be at least 6 characters",
    };
  }

  const emailExists = mockDB.find((u) => u.email === data.email);
  if (emailExists) {
    return {
      success: false,
      message: "Email already registered",
    };
  }

  /* ---------------- CREATE USER ---------------- */

  const newUser = {
    id: Date.now(),
    email: data.email,
    password: data.password,
    type: data.type || "buyer",
    role: data.role || null,
  };

  mockDB.push(newUser);
  localStorage.setItem("mockUsers", JSON.stringify(mockDB));

  /* ---------------- RESPONSE ---------------- */

  return {
    success: true,
    message: "Signup success",
    user: newUser,
  };
};

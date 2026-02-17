const KEY = "auth_user";

export function saveAuth(user) {
  localStorage.setItem(KEY, JSON.stringify(user));
}

export function loadAuth() {
  return JSON.parse(localStorage.getItem(KEY) || "null");
}

export function clearAuth() {
  localStorage.removeItem(KEY);
}

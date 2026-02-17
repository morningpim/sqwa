// src/mocks/authStorage.js

const KEY_USER = "auth_user";
const KEY_TOKEN = "auth_token";
const KEY_REFRESH = "auth_refresh";

// --------------------------------------------------
// utils
// --------------------------------------------------
function safeParse(v) {
  try {
    return JSON.parse(v);
  } catch {
    return null;
  }
}

function set(storage, key, value) {
  storage.setItem(key, value);
}

function removeAll(key) {
  localStorage.removeItem(key);
  sessionStorage.removeItem(key);
}

// --------------------------------------------------
// SAVE AUTH
// remember = true -> localStorage
// remember = false -> sessionStorage
// --------------------------------------------------
export function saveAuth(
  { user, accessToken, refreshToken },
  remember = true
) {
  const store = remember ? localStorage : sessionStorage;

  if (user) set(store, KEY_USER, JSON.stringify(user));
  if (accessToken) set(store, KEY_TOKEN, accessToken);
  if (refreshToken) set(store, KEY_REFRESH, refreshToken);
}

// --------------------------------------------------
// GET USER
// --------------------------------------------------
export function getUser() {
  const raw =
    localStorage.getItem(KEY_USER) ||
    sessionStorage.getItem(KEY_USER);

  return raw ? safeParse(raw) : null;
}

// --------------------------------------------------
// GET TOKENS
// --------------------------------------------------
export function getTokens() {
  const access =
    localStorage.getItem(KEY_TOKEN) ||
    sessionStorage.getItem(KEY_TOKEN);

  const refresh =
    localStorage.getItem(KEY_REFRESH) ||
    sessionStorage.getItem(KEY_REFRESH);

  if (!access && !refresh) return null;

  return { access, refresh };
}

// --------------------------------------------------
// UPDATE USER FIELD (no logout)
// --------------------------------------------------
export function updateStoredUser(patch) {
  const user = getUser();
  if (!user) return;

  const updated = { ...user, ...patch };

  saveAuth({
    user: updated,
    accessToken: getTokens()?.access,
    refreshToken: getTokens()?.refresh,
  });
}

// --------------------------------------------------
// LOGOUT / CLEAR
// --------------------------------------------------
export function clearAuth() {
  removeAll(KEY_USER);
  removeAll(KEY_TOKEN);
  removeAll(KEY_REFRESH);
}

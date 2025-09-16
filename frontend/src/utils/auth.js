// src/utils/auth.js
const USER_KEY = "agri_user";
const TOKEN_KEY = "agri_token";

// --- migration from older keys (if you previously used "user"/"token") ---
function migrateIfNeeded() {
  try {
    // token
    const legacyToken = localStorage.getItem("token");
    if (legacyToken && !localStorage.getItem(TOKEN_KEY)) {
      localStorage.setItem(TOKEN_KEY, legacyToken);
    }
    // user
    const legacyUserRaw = localStorage.getItem("user");
    if (legacyUserRaw && !localStorage.getItem(USER_KEY)) {
      localStorage.setItem(USER_KEY, legacyUserRaw);
    }
  } catch {}
}

export function getUser() {
  migrateIfNeeded();
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function getToken() {
  migrateIfNeeded();
  return localStorage.getItem(TOKEN_KEY) || null;
}

export function isAuthenticated() {
  return !!(getUser() && getToken());
}

export function setUser(user, token) {
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
  if (token) localStorage.setItem(TOKEN_KEY, token);
  window.dispatchEvent(new Event("auth-changed"));
}

export function clearUser() {
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(TOKEN_KEY);
  window.dispatchEvent(new Event("auth-changed"));
}

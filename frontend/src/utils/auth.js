// src/utils/auth.js
const KEY = "agri_user"; // change if you already use a different key

export function getUser() {
  const raw = localStorage.getItem(KEY);
  return raw ? JSON.parse(raw) : null;
}

export function setUser(user) {
  localStorage.setItem(KEY, JSON.stringify(user));
  window.dispatchEvent(new Event("auth-changed"));
}

export function clearUser() {
  localStorage.removeItem(KEY);
  window.dispatchEvent(new Event("auth-changed"));
}

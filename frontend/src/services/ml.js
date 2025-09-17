// src/services/ml.js
import axios from "axios";

// Normalize base pieces
const ROOT = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");   // trim trailing /
const API_BASE = (import.meta.env.VITE_API_BASE || "/api").replace(/^\/?/, "/"); // ensure single leading /

const api = axios.create({ baseURL: ROOT.replace(/\/api$/, "") }); // strip trailing /api if present

export async function predictYield(sampleOrArray) {
  const { data } = await api.post(`${API_BASE}/ml/predict`, sampleOrArray, {
    headers: { "Content-Type": "application/json" },
  });
  return data;
}

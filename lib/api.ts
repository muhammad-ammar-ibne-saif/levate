import axios from "axios";
import * as SecureStore from "expo-secure-store";

// ─── API URL is set here at build time ───────────────────────────────────────
// NEVER expose this in any UI screen. Change this before deploying.
const API_BASE_URL = "http://192.168.1.8:4000"; 

// ─────────────────────────────────────────────────────────────────────────────

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach JWT token to every request automatically
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync("auth_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally — clear token and redirect to login
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await SecureStore.deleteItemAsync("auth_token");
      await SecureStore.deleteItemAsync("user_data");
    }
    return Promise.reject(error);
  }
);

export default api;

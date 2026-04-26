import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

// In-memory access token — never written to localStorage
let _accessToken = null;
export const setAccessToken = (token) => { _accessToken = token; };
export const getAccessToken = () => _accessToken;

const API = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true, // Required for httpOnly refresh-token cookie
});

// Attach access token from memory on every request
API.interceptors.request.use(
  (config) => {
    if (_accessToken) {
      config.headers.Authorization = `Bearer ${_accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Silently refresh on 401 then retry once
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry && !original.url?.includes('/auth/refresh')) {
      original._retry = true;
      try {
        // Cookie is sent automatically — no body needed
        const { data } = await axios.post(`${BASE_URL}/auth/refresh`, {}, { withCredentials: true });
        const newToken = data.data.accessToken;
        setAccessToken(newToken);
        original.headers.Authorization = `Bearer ${newToken}`;
        return API(original);
      } catch {
        // Refresh failed — clear state and redirect to landing
        setAccessToken(null);
        localStorage.removeItem("user");
        window.location.href = "/";
      }
    }
    return Promise.reject(error);
  }
);

// ==========================================
// AUTH ENDPOINTS
// ==========================================
export const authAPI = {
  register: (userData) => API.post("/auth/register", userData),
  login: (credentials) => API.post("/auth/login", credentials),
  logout: () => API.post("/auth/logout"),
  getMe: () => API.get("/auth/me"),
  refreshToken: () => API.post("/auth/refresh"),
  changePassword: (data) => API.post("/auth/change-password", data),
  forgotPassword: (email) => API.post("/auth/forgot-password", { email }),
  resetPassword: (token, password) => API.post(`/auth/reset-password/${token}`, { password }),
};

// ==========================================
// USER ENDPOINTS
// ==========================================
export const userAPI = {
  getUser: (userId) => API.get(`/users/${userId}`),
  updateBudget: (userId, budget) => API.put(`/users/${userId}/budget`, { budget }),
  updateProfile: (userId, data) => API.put(`/users/${userId}`, data),
  getHealthScore: () => API.get("/users/health-score"),
  deleteAccount: (userId) => API.delete(`/users/${userId}`),
};

// ==========================================
// TRANSACTION ENDPOINTS
// ==========================================
export const transactionAPI = {
  getAll: () => API.get("/transactions"),
  getOne: (id) => API.get(`/transactions/${id}`),
  create: (data) => API.post("/transactions", data),
  update: (id, data) => API.patch(`/transactions/${id}`, data),
  delete: (id) => API.delete(`/transactions/${id}`),
};

// ==========================================
// PLAID ENDPOINTS
// ==========================================
export const plaidAPI = {
  createLinkToken: () => API.post("/plaid/create_link_token"),
  exchangePublicToken: (publicToken) =>
    API.post("/plaid/exchange_public_token", { public_token: publicToken }),
  getBalance: () => API.get("/plaid/balance"),
  getInstitution: (institutionId) =>
    API.post("/plaid/institution", { institution_id: institutionId }),
  syncTransactions: (reset = false) => API.post("/plaid/sync", { reset }),
  unlinkBank: () => API.delete("/plaid/unlink"),
};

export default API;

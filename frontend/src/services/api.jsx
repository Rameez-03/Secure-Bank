import axios from "axios";

// Create axios instance with base configuration
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5001/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - Add auth token to requests
API.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle token refresh
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (refreshToken) {
          // Try to refresh the access token
          const { data } = await axios.post(
            `${process.env.REACT_APP_API_URL || "http://localhost:5001/api"}/auth/refresh`,
            { refreshToken }
          );

          // Save new access token
          localStorage.setItem("accessToken", data.data.accessToken);

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${data.data.accessToken}`;
          return API(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, logout user
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        window.location.href = "/";
        return Promise.reject(refreshError);
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
  refreshToken: (refreshToken) => API.post("/auth/refresh", { refreshToken }),
};

// ==========================================
// USER ENDPOINTS
// ==========================================

export const userAPI = {
  getUser: (userId) => API.get(`/users/${userId}`),
  updateBudget: (userId, budget) => API.put(`/users/${userId}/budget`, { budget }),
  updateProfile: (userId, data) => API.put(`/users/${userId}`, data),
  getHealthScore: () => API.get('/users/health-score'),
};

// ==========================================
// TRANSACTION ENDPOINTS
// ==========================================

export const transactionAPI = {
  getAll: () => API.get("/transactions"),
  getOne: (id) => API.get(`/transactions/${id}`),
  create: (transactionData) => API.post("/transactions", transactionData),
  update: (id, transactionData) => API.patch(`/transactions/${id}`, transactionData),
  delete: (id) => API.delete(`/transactions/${id}`),
};

// ==========================================
// PLAID ENDPOINTS
// ==========================================

export const plaidAPI = {
  createLinkToken: () => API.post("/plaid/create_link_token"),
  exchangePublicToken: (publicToken) =>
    API.post("/plaid/exchange_public_token", { public_token: publicToken }),
  getAuth: (accessToken) => API.post("/plaid/auth", { access_token: accessToken }),
  getBalance: () => API.get("/plaid/balance"),
  getInstitution: (institutionId) =>
    API.post("/plaid/institution", { institution_id: institutionId }),
  getTransactions: (accessToken, startDate, endDate) =>
    API.post("/plaid/transactions", {
      access_token: accessToken,
      start_date: startDate,
      end_date: endDate,
    }),
  syncTransactions: (reset = false) => API.post("/plaid/sync", { reset }),
  unlinkBank: () => API.delete("/plaid/unlink"),
};

export default API;
import axios from "axios";

// Primary API client
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/",
});

// Request interceptor: attach Bearer token from localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

let cachedUserId = localStorage.getItem("userId") || null;

// Response interceptor: automatically handles backward-compatible fallback for remote servers
api.interceptors.response.use(
  (response) => {
    if (response.data?.user?._id) {
      cachedUserId = response.data.user._id;
      localStorage.setItem("userId", cachedUserId);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // If 404 (route not yet deployed on remote server) and not already retried
    if (error.response?.status === 404 && !originalRequest._retry) {
      originalRequest._retry = true;
      const url = originalRequest.url || "";
      const method = (originalRequest.method || "get").toLowerCase();

      // 1. /auth/me -> /auth/verify
      if (url.includes("/auth/me")) {
        originalRequest.url = url.replace("/auth/me", "/auth/verify");
        return api(originalRequest);
      }

      // 2. /auth/register -> /auth/signup
      if (url.includes("/auth/register")) {
        originalRequest.url = url.replace("/auth/register", "/auth/signup");
        return api(originalRequest);
      }

      // 3. /auth/logout -> resolved locally
      if (url.includes("/auth/logout")) {
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        return Promise.resolve({
          status: 200,
          data: { success: true, message: "Logged out successfully" },
        });
      }

      // 4. /userStats -> /dashboard
      if (url.includes("/userStats")) {
        originalRequest.url = url.replace("/userStats", "/dashboard");
        const res = await api(originalRequest);
        if (res.data?.user?._id) {
          cachedUserId = res.data.user._id;
          localStorage.setItem("userId", cachedUserId);
        }
        return res;
      }

      // 5. GET /transactions -> /dashboard/expense/:userId
      if (url.endsWith("/transactions") && method === "get") {
        if (!cachedUserId) {
          try {
            const dashRes = await api.get("/dashboard");
            cachedUserId = dashRes.data?.user?._id;
            if (cachedUserId) localStorage.setItem("userId", cachedUserId);
          } catch (e) { }
        }
        if (cachedUserId) {
          originalRequest.url = `/dashboard/expense/${cachedUserId}`;
          const res = await api(originalRequest);
          const list = res.data?.allExpense || res.data?.transactions || [];
          return {
            ...res,
            data: {
              success: true,
              transactions: list,
              allExpense: list,
            },
          };
        }
      }

      // 6. POST /transactions -> /dashboard/expense
      if (url.endsWith("/transactions") && method === "post") {
        originalRequest.url = "/dashboard/expense";
        return api(originalRequest);
      }

      // 7. PUT / DELETE /transactions/:id -> /dashboard/expense/:id
      if (url.includes("/transactions/")) {
        originalRequest.url = url.replace("/transactions/", "/dashboard/expense/");
        return api(originalRequest);
      }
    }

    return Promise.reject(error);
  }
);

export default api;

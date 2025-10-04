import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "/api";

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor to add token if available (skip auth endpoints)
api.interceptors.request.use((config) => {
  const isAuthEndpoint = config.url?.startsWith("/auth");
  if (!isAuthEndpoint) {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// ----------- AUTH ----------- //
export const authAPI = {
  signup: (data, role) => {
    // Hit different endpoints based on role
    const url = role === "vendor" ? "/auth/signup/vendor" : "/auth/signup/customer";
    return api.post(url, data);
  },
  login: (data) => {
    console.log("API_BASE_URL:", API_BASE_URL);
    return api.post("/auth/login", data);
  },
  refresh: (data) => api.post("/auth/refresh", data),
  googleLogin: (data) => api.post("/auth/google-login", data),
};

// // ----------- SERVICES ----------- //
// export const serviceAPI = {
//   getAll: (params = {}) => api.get("/services/get-all", { params }), 
//   getByUser: (userId, params = {}) => api.get("/services/get-by-user", { params: { user_id: userId, ...params } }),
//   getByType: (type, params = {}) => api.get("/services/get-by-type", { params: { type, ...params } }),
//   create: (data) => api.post("/services/create", data,{
//     headers: { "Content-Type": "multipart/form-data" }
//   }),
//   update: (id, data) => api.put(`/services/update/${id}`, data,{
//     headers: { "Content-Type": "multipart/form-data" }
//   }),
//   delete: (id) => api.delete(`/services/delete/${id}`),
// };

const endpoints = {
  VENUE: "/api/services/venue",
  CATERING: "/api/services/catering",
  DJ: "/api/services/dj",
  PHOTOGRAPHER: "/api/services/photographer",
  EVENT_MANAGEMENT: "/api/services/event-management",
};

export const serviceAPI = {
  getAll: (params = {}) => api.get("/services/get-all", { params }),
  getByUser: (userId, params = {}) =>
    api.get("/services/get-by-user", { params: { user_id: userId, ...params } }),
  getByType: (type, params = {}) =>
    api.get("/services/get-by-type", { params: { type, ...params } }),
  create: (data) => {
    const endpoint = endpoints[data.category.toUpperCase()];
    if (!endpoint) {
      throw new Error("Invalid category provided");
    }
    return api.post(endpoint, data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  update: (id, data) => {
    const endpoint = endpoints[data.category.toUpperCase()];
    if (!endpoint) {
      throw new Error("Invalid category provided");
    }
    return api.put(`${endpoint}/${id}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  delete: (id, category) => {
    const endpoint = endpoints[category.toUpperCase()];
    if (!endpoint) {
      throw new Error("Invalid category provided");
    }
    return api.delete(`${endpoint}/${id}`);
  },
};

export const vendorAPI = {
  onboarding: (data) => api.post("/vendors/onboarding", data),
  status: () => api.get("/vendors/status"),
};

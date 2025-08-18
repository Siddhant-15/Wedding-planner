import axios from "axios";

// const API_BASE_URL = import.meta.env.VITE_API_URL;
const API_BASE_URL = "http://127.0.0.1:8000";

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor to add token if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ----------- AUTH ----------- //
export const authAPI = {
  signup: (data) => api.post("/auth/signup", data),
  login: (data) => {
    console.log("API_BASE_URL:", API_BASE_URL);
    return api.post("/auth/login", data);
  },
  refresh: (data) => api.post("/auth/refresh", data),
};

// ----------- VENUES ----------- //
export const venueAPI = {
  getAll: () => api.get("/venues"),
  getById: (id) => api.get(`/venues/${id}`),
  create: (data) => api.post("/venues", data),
  update: (id, data) => api.put(`/venues/${id}`, data),
  remove: (id) => api.delete(`/venues/${id}`),
};

// ----------- VENDORS ----------- //
export const vendorAPI = {
  getAll: () => api.get("/vendors"),
  getById: (id) => api.get(`/vendors/${id}`),
  create: (data) => api.post("/vendors", data),
  update: (id, data) => api.put(`/vendors/${id}`, data),
  remove: (id) => api.delete(`/vendors/${id}`),
};

// ----------- BOOKINGS ----------- //
export const bookingAPI = {
  getAll: () => api.get("/bookings"),
  getById: (id) => api.get(`/bookings/${id}`),
  create: (data) => api.post("/bookings", data),
  update: (id, data) => api.put(`/bookings/${id}`, data),
  remove: (id) => api.delete(`/bookings/${id}`),
};

// ----------- PAYMENTS ----------- //
export const paymentAPI = {
  getAll: () => api.get("/payments"),
  getById: (id) => api.get(`/payments/${id}`),
  create: (data) => api.post("/payments", data),
};

// ----------- REVIEWS ----------- //
export const reviewAPI = {
  getAll: () => api.get("/reviews"),
  getById: (id) => api.get(`/reviews/${id}`),
  create: (data) => api.post("/reviews", data),
  update: (id, data) => api.put(`/reviews/${id}`, data),
  remove: (id) => api.delete(`/reviews/${id}`),
};

// ----------- AVAILABILITY ----------- //
export const availabilityAPI = {
  check: (params) => api.get("/availability", { params }),
  update: (data) => api.post("/availability", data),
};

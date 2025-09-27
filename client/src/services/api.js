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
  signup: (data) => api.post("/auth/signup", data),
  login: (data) => {
    console.log("API_BASE_URL:", API_BASE_URL);
    return api.post("/auth/login", data);
  },
  refresh: (data) => api.post("/auth/refresh", data),
  googleLogin: (data) => api.post("/auth/google-login", data),
};
// ----------- SERVICES ----------- //
export const serviceAPI = {
  getAll: (params = {}) => api.get("/services/get-all", { params }), 
  getByUser: (userId, params = {}) => api.get("/services/get-by-user", { params: { user_id: userId, ...params } }),
  getByType: (type, params = {}) => api.get("/services/get-by-type", { params: { type, ...params } }),
  create: (data) => api.post("/services/create", data,{
    headers: { "Content-Type": "multipart/form-data" }
  }),
  update: (id, data) => api.put(`/services/update/${id}`, data,{
    headers: { "Content-Type": "multipart/form-data" }
  }),
  delete: (id) => api.delete(`/services/delete/${id}`),
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
  // Get availability for a specific venue
  getByVenue: (venueId) => api.get(`/availability/${venueId}`),
  // Bulk upsert availability slots
  bulkUpsert: (data) => api.post("/availability/bulk-upsert", data),
  // Delete availability for a venue by date (YYYY-MM-DD)
  removeForDate: (venueId, slotDate) => api.delete(`/availability/${venueId}/${slotDate}`),
};

// ----------- IMAGES ----------- //
export const imageAPI = {
  // Upload an image
  upload: (file, venueId = null, serviceId = null) => {
    const formData = new FormData();
    formData.append('file', file);
    if (venueId) formData.append('venue_id', venueId);
    if (serviceId) formData.append('service_id', serviceId);
    
    return api.post("/images/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
  
  // Get transformed image URL
  getTransformedUrl: (path, width = null, height = null, quality = null) => {
    const params = new URLSearchParams();
    params.append('path', path);
    if (width) params.append('w', width);
    if (height) params.append('h', height);
    if (quality) params.append('q', quality);
    
    return api.get(`/images/img-url?${params.toString()}`);
  },
  
  // Get images for a venue
  getByVenue: (venueId) => api.get(`/images/venue/${venueId}`),
  
  // Get images for a service
  getByService: (serviceId) => api.get(`/images/service/${serviceId}`),
};

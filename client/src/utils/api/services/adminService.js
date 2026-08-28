import adminApi from "../adminApi";
import { ENDPOINTS } from "../endpoints";
import { handleApiError } from "../utils/errorHandler";

export const adminService = {
  // =========================
  // AUTH
  // =========================
login: async (data) => {
  try {
    const res = await adminApi.post(
      ENDPOINTS.ADMIN.AUTH.LOGIN,
      data
    );

    const token = res.data?.access_token;

    if (!token) {
      throw new Error("Access token not found");
    }

    localStorage.setItem("admin_token", token);

    return res.data;
  } catch (error) {
    throw await handleApiError(error);
  }
},

  logout: () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
  },

  // =========================
  // DASHBOARD
  // =========================
  getMetrics: async () => {
    try {
      const res = await adminApi.get(ENDPOINTS.ADMIN.METRICS);
      return res.data;
    } catch (error) {
      throw await handleApiError(error);
    }
  },

  getActivity: async () => {
    try {
      const res = await adminApi.get(ENDPOINTS.ADMIN.ACTIVITY);
      return res.data;
    } catch (error) {
      throw await handleApiError(error);
    }
  },

  // =========================
  // VENDORS
  // =========================
  getVendors: async (params = {}) => {
    try {
      const res = await adminApi.get(
        ENDPOINTS.ADMIN.VENDORS,
        { params }
      );
      return res.data;
    } catch (error) {
      throw await handleApiError(error);
    }
  },

  getVendorById: async (id) => {
    try {
      const res = await adminApi.get(
        `${ENDPOINTS.ADMIN.VENDORS}/${id}`
      );
      return res.data;
    } catch (error) {
      throw await handleApiError(error);
    }
  },

  updateVendor: async (id, payload) => {
    try {
      const res = await adminApi.patch(
        `${ENDPOINTS.ADMIN.VENDORS}/${id}`,
        payload
      );
      return res.data;
    } catch (error) {
      throw await handleApiError(error);
    }
  },

  // =========================
  // SERVICES
  // =========================
  getServices: async (params = {}) => {
    try {
      const res = await adminApi.get(
        ENDPOINTS.ADMIN.SERVICES,
        { params }
      );
      return res.data;
    } catch (error) {
      throw await handleApiError(error);
    }
  },

  getServiceById: async (id) => {
    try {
      const res = await adminApi.get(
        `${ENDPOINTS.ADMIN.SERVICES}/${id}`
      );
      return res.data;
    } catch (error) {
      throw await handleApiError(error);
    }
  },

  reviewService: async (serviceId, data) => {
    try {
      const res = await adminApi.post(
        `/admin/services/${serviceId}/review`,
        data
      );
      return res.data;
    } catch (error) {
      throw await handleApiError(error);
    }
  },
// =========================
// SERVICE REVIEW WORKFLOW
// =========================

// Get the detailed review for the current service version
getServiceReview: async (serviceId) => {
  try {
    const res = await adminApi.get(
      `/admin/services/${serviceId}/review`
    );
    return res.data;
  } catch (error) {
    throw await handleApiError(error);
  }
},

// Update a specific review section
// payload: { status: "approved" | "changes_requested", comment?: string }
updateReviewSection: async (serviceId, section, payload) => {
  try {
    const res = await adminApi.put(
      `/admin/services/${serviceId}/review/sections/${section}`,
      payload
    );
    return res.data;
  } catch (error) {
    throw await handleApiError(error);
  }
},

// Finalize the complete service review
// payload: {
//   action: "approve" | "request_changes" | "reject",
//   final_comment?: string
// }
finalizeServiceReview: async (serviceId, payload) => {
  try {
    const res = await adminApi.post(
      `/admin/services/${serviceId}/review/finalize`,
      payload
    );
    return res.data;
  } catch (error) {
    throw await handleApiError(error);
  }
},

// Get review history
getReviewHistory: async (serviceId) => {
  try {
    const res = await adminApi.get(
      `/admin/services/${serviceId}/review/history`
    );
    return res.data;
  } catch (error) {
    throw await handleApiError(error);
  }
},
  updateService: async (id, payload) => {
    try {
      const res = await adminApi.patch(
        `${ENDPOINTS.ADMIN.SERVICES}/${id}`,
        payload
      );
      return res.data;
    } catch (error) {
      throw await handleApiError(error);
    }
  },

  approveService: async (id) => {
    try {
      const res = await adminApi.post(
        `${ENDPOINTS.ADMIN.SERVICES}/${id}/approve`
      );
      return res.data;
    } catch (error) {
      throw await handleApiError(error);
    }
  },

  rejectService: async (id, reason) => {
    try {
      const res = await adminApi.post(
        `${ENDPOINTS.ADMIN.SERVICES}/${id}/reject`,
        { reason }
      );
      return res.data;
    } catch (error) {
      throw await handleApiError(error);
    }
  },

  // =========================
  // BOOKINGS
  // =========================
  getBookings: async (params = {}) => {
    try {
      const res = await adminApi.get(
        ENDPOINTS.ADMIN.BOOKINGS,
        { params }
      );
      return res.data;
    } catch (error) {
      throw await handleApiError(error);
    }
  },

  updateBooking: async (id, payload) => {
    try {
      const res = await adminApi.patch(
        `${ENDPOINTS.ADMIN.BOOKINGS}/${id}`,
        payload
      );
      return res.data;
    } catch (error) {
      throw await handleApiError(error);
    }
  },

  // =========================
  // REVIEWS
  // =========================
  getReviews: async (params = {}) => {
    try {
      const res = await adminApi.get(
        ENDPOINTS.ADMIN.REVIEWS,
        { params }
      );
      return res.data;
    } catch (error) {
      throw await handleApiError(error);
    }
  },

  updateReview: async (id, payload) => {
    try {
      const res = await adminApi.patch(
        `${ENDPOINTS.ADMIN.REVIEWS}/${id}`,
        payload
      );
      return res.data;
    } catch (error) {
      throw await handleApiError(error);
    }
  },

  deleteReview: async (id) => {
    try {
      const res = await adminApi.delete(
        `${ENDPOINTS.ADMIN.REVIEWS}/${id}`
      );
      return res.data;
    } catch (error) {
      throw await handleApiError(error);
    }
  },

  // =========================
  // REPORTS
  // =========================
  getReports: async () => {
    try {
      const res = await adminApi.get(
        ENDPOINTS.ADMIN.REPORTS
      );
      return res.data;
    } catch (error) {
      throw await handleApiError(error);
    }
  },

  updateReport: async (id, payload) => {
    try {
      const res = await adminApi.patch(
        `${ENDPOINTS.ADMIN.REPORTS}/${id}`,
        payload
      );
      return res.data;
    } catch (error) {
      throw await handleApiError(error);
    }
  },

  // =========================
  // CATEGORIES
  // =========================
  getCategories: async () => {
    try {
      const res = await adminApi.get(
        ENDPOINTS.ADMIN.CATEGORIES
      );
      return res.data;
    } catch (error) {
      throw await handleApiError(error);
    }
  },

  createCategory: async (payload) => {
    try {
      const res = await adminApi.post(
        ENDPOINTS.ADMIN.CATEGORIES,
        payload
      );
      return res.data;
    } catch (error) {
      throw await handleApiError(error);
    }
  },

  updateCategory: async (id, payload) => {
    try {
      const res = await adminApi.patch(
        `${ENDPOINTS.ADMIN.CATEGORIES}/${id}`,
        payload
      );
      return res.data;
    } catch (error) {
      throw await handleApiError(error);
    }
  },

  deleteCategory: async (id) => {
    try {
      const res = await adminApi.delete(
        `${ENDPOINTS.ADMIN.CATEGORIES}/${id}`
      );
      return res.data;
    } catch (error) {
      throw await handleApiError(error);
    }
  },

  // =========================
  // SETTINGS
  // =========================
  getSettings: async () => {
    try {
      const res = await adminApi.get(
        ENDPOINTS.ADMIN.SETTINGS
      );
      return res.data;
    } catch (error) {
      throw await handleApiError(error);
    }
  },

  saveSettings: async (payload) => {
    try {
      const res = await adminApi.patch(
        ENDPOINTS.ADMIN.SETTINGS,
        payload
      );
      return res.data;
    } catch (error) {
      throw await handleApiError(error);
    }
  },

  // =========================
  // ANALYTIC
  // =========================
  getAnalytics: async () => {
    try {
      const res = await adminApi.get(
        ENDPOINTS.ADMIN.ANALYTICS
      );
      return res.data;
    } catch (error) {
      throw await handleApiError(error);
    }
  },
};
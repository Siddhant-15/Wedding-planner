import api from "../client";
import { ENDPOINTS } from "../endpoints";
import { handleApiError } from "../utils/errorHandler";

/**
 * Review Service (Production Ready)
 * Handles fetching, user status, creating, editing, and soft-deleting reviews
 */
export const reviewService = {
  /**
   * Get all reviews for a service
   * @param {string | number} serviceId
   * @param {object} [params] - { skip, limit, sort }
   */
  getAll: async (serviceId, params = {}) => {
    if (!serviceId) {
      throw new Error("serviceId is required");
    }

    try {
      const res = await api.get(ENDPOINTS.REVIEWS.GET(serviceId), {
        params: {
          skip: params.skip ?? 0,
          limit: params.limit ?? 50,
          sort: params.sort ?? "recent",
        },
      });

      return res.data;
    } catch (error) {
      throw await handleApiError(error);
    }
  },

  /**
   * Get authenticated user's review for a service
   * @param {string | number} serviceId
   */
  getMyReview: async (serviceId) => {
    if (!serviceId) return null;
    try {
      const res = await api.get(ENDPOINTS.REVIEWS.MY_REVIEW(serviceId));
      return res.data;
    } catch (error) {
      return null;
    }
  },

  /**
   * Add a new review (supports images via FormData)
   * @param {FormData | object} data
   */
  add: async (data) => {
    if (!data) {
      throw new Error("Review data is required");
    }

    try {
      const isFormData = data instanceof FormData;

      const res = await api.post(ENDPOINTS.REVIEWS.CREATE, data, {
        headers: isFormData
          ? { "Content-Type": "multipart/form-data" }
          : { "Content-Type": "application/json" },
      });

      return res.data;
    } catch (error) {
      throw await handleApiError(error);
    }
  },

  /**
   * Update an existing review
   * @param {string | number} reviewId
   * @param {object} patch
   */
  update: async (reviewId, patch) => {
    if (!reviewId) {
      throw new Error("reviewId is required");
    }

    try {
      const res = await api.patch(ENDPOINTS.REVIEWS.UPDATE(reviewId), patch);
      return res.data;
    } catch (error) {
      throw await handleApiError(error);
    }
  },

  /**
   * Soft-delete a review
   * @param {string | number} reviewId
   */
  remove: async (reviewId) => {
    if (!reviewId) {
      throw new Error("reviewId is required");
    }

    try {
      const res = await api.delete(ENDPOINTS.REVIEWS.DELETE(reviewId));
      return res.data;
    } catch (error) {
      throw await handleApiError(error);
    }
  },
};
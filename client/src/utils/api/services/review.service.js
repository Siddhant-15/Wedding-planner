import api from "../client";
import { ENDPOINTS } from "../endpoints";
import { handleApiError } from "../utils/errorHandler";

/**
 * Review Service
 * Handles fetching and creating reviews
 */
export const reviewService = {
    /**
     * Get all reviews for a service
     * @param {string | number} serviceId
     */
    getAll: async (serviceId) => {
        if (!serviceId) {
            throw new Error("serviceId is required");
        }

        try {
            const res = await api.get(
                ENDPOINTS.REVIEWS.GET(serviceId)
            );

            return res.data;
        } catch (error) {
            throw await handleApiError(error);
        }
    },

    /**
     * Add a new review (supports images/videos via FormData)
     * @param {FormData | Object} data
     */
    add: async (data) => {
        if (!data) {
            throw new Error("Review data is required");
        }

        try {
            const isFormData = data instanceof FormData;

            const res = await api.post(
                ENDPOINTS.REVIEWS.CREATE,
                data,
                {
                    headers: isFormData
                        ? { "Content-Type": "multipart/form-data" }
                        : { "Content-Type": "application/json" },
                }
            );

            return res.data;
        } catch (error) {
            throw await handleApiError(error);
        }
    },

    /**
     * Update a review
     * @param {string | number} reviewId
     * @param {FormData | Object} data
     */
    update: async (reviewId, data) => {
        if (!reviewId) {
            throw new Error("reviewId is required");
        }
        if (!data) {
            throw new Error("Review data is required");
        }

        try {
            const isFormData = data instanceof FormData;

            const res = await api.put(
                ENDPOINTS.REVIEWS.UPDATE(reviewId),
                data,
                {
                    headers: isFormData
                        ? { "Content-Type": "multipart/form-data" }
                        : { "Content-Type": "application/json" },
                }
            );

            return res.data;
        } catch (error) {
            throw await handleApiError(error);
        }
    },

    /**
     * Delete a review
     * @param {string | number} reviewId
     */
    remove: async (reviewId) => {
        if (!reviewId) {
            throw new Error("reviewId is required");
        }

        try {
            const res = await api.delete(
                ENDPOINTS.REVIEWS.DELETE(reviewId)
            );

            return res.data;
        } catch (error) {
            throw await handleApiError(error);
        }
    },
};
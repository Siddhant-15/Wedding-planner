import api from "../client";
import { ENDPOINTS } from "../endpoints";
import { handleApiError } from "../utils/errorHandler";

/**
 * Wishlist Service
 * Handles wishlist CRUD operations
 */
export const wishlistService = {
    /**
     * Get all wishlist items
     */
    getAll: async () => {
        try {
            const res = await api.get(ENDPOINTS.WISHLIST.BASE);

            return res.data;
        } catch (error) {
            throw await handleApiError(error);
        }
    },

    /**
     * Add item to wishlist
     * @param {string | number} serviceId
     */
    add: async (serviceId) => {
        if (!serviceId) {
            throw new Error("serviceId is required");
        }

        try {
            const res = await api.post(
                ENDPOINTS.WISHLIST.ITEM(serviceId)
            );

            return res.data;
        } catch (error) {
            throw await handleApiError(error);
        }
    },

    /**
     * Remove item from wishlist
     * @param {string | number} serviceId
     */
    remove: async (serviceId) => {
        if (!serviceId) {
            throw new Error("serviceId is required");
        }

        try {
            const res = await api.delete(
                ENDPOINTS.WISHLIST.ITEM(serviceId)
            );

            return res.data;
        } catch (error) {
            throw await handleApiError(error);
        }
    },

    /**
     * Clear entire wishlist
     */
    clear: async () => {
        try {
            const res = await api.delete(ENDPOINTS.WISHLIST.BASE);

            return res.data;
        } catch (error) {
            throw await handleApiError(error);
        }
    },
};
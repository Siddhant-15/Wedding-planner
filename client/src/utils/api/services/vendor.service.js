import api from "../client";
import { ENDPOINTS } from "../endpoints";
import { handleApiError } from "../utils/errorHandler";

/**
 * Vendor Service
 * Handles onboarding, draft saving, and status APIs
 */
export const vendorService = {
    /**
     * Submit vendor onboarding form (final submit)
     * @param {FormData | Object} data
     */
    onboarding: async (data) => {
        if (!data) {
            throw new Error("Onboarding data is required");
        }

        try {
            const isFormData = data instanceof FormData;

            const response = await api.post(
                ENDPOINTS.VENDOR.ONBOARDING,
                data,
                {
                    headers: isFormData
                        ? { "Content-Type": "multipart/form-data" }
                        : { "Content-Type": "application/json" },
                }
            );

            return response.data;
        } catch (error) {
            throw await handleApiError(error);
        }
    },

    /**
     * Save onboarding draft (multi-step forms)
     * @param {FormData | Object} data
     */
    saveDraft: async (data) => {
        if (!data) {
            throw new Error("Draft data is required");
        }

        try {
            const isFormData = data instanceof FormData;

            const response = await api.post(
                ENDPOINTS.VENDOR.SAVE_DRAFT || "/vendors/save-draft",
                data,
                {
                    headers: isFormData
                        ? { "Content-Type": "multipart/form-data" }
                        : { "Content-Type": "application/json" },
                }
            );

            return response.data;
        } catch (error) {
            throw await handleApiError(error);
        }
    },

    /**
     * Get vendor onboarding/status
     */
    getStatus: async () => {
        try {
            const response = await api.get(ENDPOINTS.VENDOR.STATUS);
            console.log("Vendor Status", response.data);
            return response?.data?.onboarding_completed;
        } catch (error) {
            throw await handleApiError(error);
        }
    },
};
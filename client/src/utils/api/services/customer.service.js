import api from "../client";
import { ENDPOINTS } from "../endpoints";
import { handleApiError } from "../utils/errorHandler";

export const customerService = {
    getByType: (type, params = {}) =>
        api.get(`/${type}/list`, { params }).catch(handleApiError),

    getDetail: async (id) => {
        if (!id) {
            throw new Error("Valid serviceId is required");
        }

        try {
            const res = await api.get(
                ENDPOINTS.SERVICES.DETAIL(id)
            );

            return res.data;
        } catch (error) {
            if (error.response?.status === 404) {
                throw new Error("Service not found");
            }

            throw await handleApiError(error);
        }
    },

    getServiceMedia: async (
        serviceId,
        skip = 0,
        limit = 12
    ) => {
        if (!serviceId) {
            throw new Error(
                "Valid serviceId is required"
            );
        }

        try {
            const res = await api.get(
                `/services/${serviceId}/media`,
                {
                    params: {
                        skip,
                        limit,
                    },
                }
            );

            return res.data;
        } catch (error) {
            throw await handleApiError(error);
        }
    },
};
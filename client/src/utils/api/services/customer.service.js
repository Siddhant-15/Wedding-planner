import api from "../client";
import { ENDPOINTS } from "../endpoints";
import { handleApiError } from "../utils/errorHandler";


const getVisitorId = () => {
    const STORAGE_KEY = "service_visitor_id";

    let visitorId = localStorage.getItem(STORAGE_KEY);

    if (!visitorId) {
        visitorId = crypto.randomUUID();
        localStorage.setItem(STORAGE_KEY, visitorId);
    }

    return visitorId;
};


export const customerService = {
    getByType: (type, params = {}) =>
        api.get(`/${type}/list`, { params }).catch(handleApiError),

    getDetail: async (id) => {
        if (!id || typeof id !== "string") {
            throw new Error("Valid serviceId is required");
        }

        try {
            const res = await api.get(ENDPOINTS.SERVICES.DETAIL(id));
            return res.data;
        } catch (error) {
            if (error.response?.status === 404) {
                throw new Error("Service not found");
            }

            throw await handleApiError(error);
        }
    },

    trackView: async (id) => {
        if (!id) {
            return;
        }

        try {
            // Always send visitor_id.
            // Backend will ignore it for authenticated customers
            // and use the JWT customer identity instead.
            await api.post(
                ENDPOINTS.SERVICES.TRACK_VIEW(id),
                {
                    visitor_id: getVisitorId(),
                }
            );
        } catch (error) {
            // Analytics should NEVER break the service detail page.
            console.warn("Failed to track service view", error);
        }
    },
};
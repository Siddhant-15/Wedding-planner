import api from "../client";
import { ENDPOINTS } from "../endpoints";
import { handleApiError } from "../utils/errorHandler";

export const notificationService = {
    getAll: async () => {
        try {
            const res = await api.get(ENDPOINTS.NOTIFICATIONS.GET_ALL);
            return res.data;
        } catch (error) {
            throw await handleApiError(error);
        }
    },

    getUnreadCount: async () => {
        try {
            const res = await api.get(ENDPOINTS.NOTIFICATIONS.UNREAD_COUNT);
            return res.data;
        } catch (error) {
            throw await handleApiError(error);
        }
    },

    markAsRead: async (id) => {
        try {
            const res = await api.post(ENDPOINTS.NOTIFICATIONS.MARK_READ(id));
            return res.data;
        } catch (error) {
            throw await handleApiError(error);
        }
    },

    markAllRead: async () => {
        try {
            const res = await api.post(ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ);
            return res.data;
        } catch (error) {
            throw await handleApiError(error);
        }
    },
};
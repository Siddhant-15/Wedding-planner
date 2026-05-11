import api from "../client";
import { ENDPOINTS } from "../endpoints";
import { handleApiError } from "../utils/errorHandler";

export const leadsService = {
    createLead: async (data) => {
        try {
            const res = await api.post(ENDPOINTS.LEADS.CREATE, data);
            return res.data;
        } catch (error) {
            throw await handleApiError(error);
        }
    },

    getMyRequests: async () => {
        try {
            const res = await api.get(ENDPOINTS.LEADS.GET_MY_REQUESTS);
            return res.data;
        } catch (error) {
            throw await handleApiError(error);
        }
    },

    getAllLeads: async () => {
        try {
            const res = await api.get(ENDPOINTS.LEADS.GET_ALL);
            return res.data;
        } catch (error) {
            throw await handleApiError(error);
        }
    },

    getUserLeads: async () => {
        try {
            const res = await api.get(ENDPOINTS.LEADS.GET_BY_USER);
            return res.data;
        } catch (error) {
            throw await handleApiError(error);
        }
    },

    getLeadById: async (id) => {
        try {
            const res = await api.get(`${ENDPOINTS.LEADS.GET_BY_ID}/${id}`);
            return res.data;
        } catch (error) {
            throw await handleApiError(error);
        }
    },

    getLeadsByType: async (type) => {
        try {
            const res = await api.get(`${ENDPOINTS.LEADS.GET_BY_TYPE}?type=${type}`);
            return res.data;
        } catch (error) {
            throw await handleApiError(error);
        }
    },
};
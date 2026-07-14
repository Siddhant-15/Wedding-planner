import api from "../client";
import { ENDPOINTS } from "../endpoints";
import { handleApiError } from "../utils/errorHandler";

export const serviceService = {
    getAll: (params = {}) =>
        api.get(ENDPOINTS.SERVICES.GET_ALL, { params }).catch(handleApiError),

    getByUser: (userId, params = {}) =>
        api
            .get(ENDPOINTS.SERVICES.GET_BY_USER, {
                params: { user_id: userId, ...params },
            })
            .catch(handleApiError),

    getByType: (type, params = {}) =>
        api
            .get(ENDPOINTS.SERVICES.GET_BY_TYPE, {
                params: { type, ...params },
            })
            .catch(handleApiError),

    create: (data) =>
        api
            .post(ENDPOINTS.SERVICES.CREATE, data, {
                headers: { "Content-Type": "multipart/form-data" },
            })
            .catch(handleApiError),

    update: (id, data) =>
        api
            .put(ENDPOINTS.SERVICES.UPDATE(id), data, {
                headers: { "Content-Type": "multipart/form-data" },
            })
            .catch(handleApiError),

    delete: (id) =>
        api.delete(ENDPOINTS.SERVICES.DELETE(id)).catch(handleApiError),
};
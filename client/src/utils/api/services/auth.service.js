import api from "../client";
import { ENDPOINTS } from "../endpoints";
import { handleApiError } from "../utils/errorHandler";

export const authService = {
    signup: (data, role) => {
        const url =
            role === "vendor"
                ? ENDPOINTS.AUTH.SIGNUP_VENDOR
                : ENDPOINTS.AUTH.SIGNUP_CUSTOMER;

        return api.post(url, data).catch(handleApiError);
    },

    login: async (data) => {
        try {
            const res = await api.post(ENDPOINTS.AUTH.LOGIN, data);

            const token = res.data?.access_token;

            if (!token) {
                throw new Error("Access token not found in response");
            }

            localStorage.setItem("access_token", token);

            return {
                token,
                raw: res.data,
            };
        } catch (error) {
            throw await handleApiError(error);
        }
    },

    refresh: () => api.post(ENDPOINTS.AUTH.REFRESH).catch(handleApiError),

    googleLogin: (data) =>
        api.post(ENDPOINTS.AUTH.GOOGLE_LOGIN, data).catch(handleApiError),
};
import api from "../client";
import { ENDPOINTS } from "../endpoints";
import { handleApiError } from "../utils/errorHandler";

export const userService = {
    getProfile: () =>
        api.get(ENDPOINTS.USER.PROFILE).catch(handleApiError),

    updateProfile: (data) =>
        api.put(ENDPOINTS.USER.PROFILE, data, {
            headers: { "Content-Type": "multipart/form-data" },
        }).catch(handleApiError),

    sendVerification: () =>
        api.post(ENDPOINTS.USER.SEND_VERIFICATION).catch(handleApiError),

    verify: (data) =>
        api.post(ENDPOINTS.USER.VERIFY, data).catch(handleApiError),
};
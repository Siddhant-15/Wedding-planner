import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "/api";

const adminApi = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});


// REQUEST INTERCEPTOR
adminApi.interceptors.request.use(
    (config) => {
        const isAdminAuthEndpoint = config.url?.startsWith("/admin/auth");

        if (!isAdminAuthEndpoint) {
            const adminToken = localStorage.getItem("admin_token");

            if (adminToken) {
                config.headers.Authorization = `Bearer ${adminToken}`;
            }
        }

        return config;
    },
    (error) => Promise.reject(error)
);


// RESPONSE INTERCEPTOR
adminApi.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (
            error.response?.status === 401 &&
            !originalRequest?._retry &&
            !originalRequest.url?.startsWith("/admin/auth")
        ) {
            originalRequest._retry = true;

            try {
                // Change this endpoint to match your backend
                const res = await adminApi.post("/admin/auth/refresh");

                const newToken = res.data?.access_token;

                if (!newToken) {
                    throw new Error("No admin access token returned");
                }

                localStorage.setItem("admin_token", newToken);

                originalRequest.headers.Authorization =
                    `Bearer ${newToken}`;

                return adminApi(originalRequest);
            } catch (refreshError) {
                localStorage.removeItem("admin_token");
                window.location.href = "/admin/login";

                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default adminApi;
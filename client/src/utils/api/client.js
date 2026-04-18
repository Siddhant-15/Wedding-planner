import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "/api";

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true,
});

// REQUEST INTERCEPTOR
api.interceptors.request.use(
    (config) => {
        const isAuthEndpoint = config.url?.startsWith("/auth");

        if (!isAuthEndpoint) {
            const token = localStorage.getItem("access_token");
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// RESPONSE INTERCEPTOR
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (
            error.response?.status === 401 &&
            !originalRequest._retry &&
            !originalRequest.url?.startsWith("/auth")
        ) {
            originalRequest._retry = true;

            try {
                const res = await api.post("/auth/refresh");
                const newToken = res.data?.access_token;

                localStorage.setItem("access_token", newToken);

                originalRequest.headers.Authorization = `Bearer ${newToken}`;

                return api(originalRequest);
            } catch (refreshError) {
                localStorage.removeItem("access_token");

                // Optional: redirect to login
                window.location.href = "/login";

                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;
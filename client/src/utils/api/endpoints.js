export const ENDPOINTS = {
    AUTH: {
        LOGIN: "/auth/login",
        SIGNUP_VENDOR: "/auth/signup/vendor",
        SIGNUP_CUSTOMER: "/auth/signup/customer",
        REFRESH: "/auth/refresh",
        GOOGLE_LOGIN: "/auth/google-login",
    },

    SERVICES: {
        GET_ALL: "/services/get-all",
        GET_BY_USER: "/services/get-by-user",
        GET_BY_TYPE: "/services/get-by-type",
        CREATE: "/services/create",
        UPDATE: (id) => `/services/update/${id}`,
        DELETE: (id) => `/services/delete/${id}`,
        DETAIL: (id) => `/services/detail/${id}`,
    },

    LEADS: {
        CREATE: "/leads/create",
        GET_ALL: "/leads/vendor",
        GET_BY_USER: "/leads/get-by-user",
        GET_BY_TYPE: "/leads/get-by-type",
        GET_BY_ID: "/leads/get-by-id",
    },

    USER: {
        PROFILE: "/users/me",
        VERIFY: "/users/verify",
        SEND_VERIFICATION: "/users/send-verification",
    },

    VENDOR: {
        ONBOARDING: "/vendors/onboarding",
        STATUS: "/vendors/status",
        SAVE_DRAFT: "/vendors/save-draft",
    },

    WISHLIST: {
        BASE: "/wishlists",
        ITEMS: "/wishlists/items",
        ITEM: (itemId) => `/wishlists/items/${itemId}`,
    },

    REVIEWS: {
        GET: (serviceId) => `/reviews/${serviceId}`,
        CREATE: "/reviews/create-customer-review",
        UPDATE: (id) => `/reviews/update/${id}`,
        DELETE: (id) => `/reviews/delete/${id}`,
    },

    NOTIFICATIONS: {
        GET_ALL: "/notification/get-all",
        UNREAD_COUNT: "/notification/unread-count",
        MARK_READ: (id) => `/notification/mark-read/${id}`,
    },
};
export const handleApiError = (error) => {
    if (error.response) {
        const message =
            error.response.data?.message ||
            error.response.data?.detail ||
            "Something went wrong";

        return Promise.reject({
            status: error.response.status,
            message,
        });
    }

    if (error.request) {
        return Promise.reject({
            status: 0,
            message: "No response from server",
        });
    }

    return Promise.reject({
        status: -1,
        message: error.message,
    });
};
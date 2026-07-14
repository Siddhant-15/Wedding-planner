import api from "../client";
import { ENDPOINTS } from "../endpoints";
import { handleApiError } from "../utils/errorHandler";

/**
 * Wishlist Service (Production Ready)
 * - No mock
 * - Uses backend APIs directly
 * - Proper error handling
 */
export const wishlistService = {
    /**
     * Get all wishlists for user
     */
    getAll: async () => {
        try {
            const res = await api.get(`${ENDPOINTS.WISHLIST.BASE}/`);
            return res.data;
        } catch (error) {
            throw await handleApiError(error);
        }
    },

    /**
     * Get all wishlist items (FLAT - IMPORTANT for frontend performance)
     */
    // getItems: async (wishlist_id) => {
    //     if (!wishlist_id) {
    //         throw new Error("wishlist_id is required");
    //     }

    //     try {
    //         const res = await api.get(`${ENDPOINTS.WISHLIST.BASE}/${wishlist_id}`);
    //         return res.data;
    //     } catch (error) {
    //         throw await handleApiError(error);
    //     }
    // },

    /**
     * Create wishlist
     */
    create: async ({ name, description = "", is_public = false }) => {
        try {
            const res = await api.post(`${ENDPOINTS.WISHLIST.BASE}/`, {
                name,
                description,
                is_public,
            });

            return res.data;
        } catch (error) {
            throw await handleApiError(error);
        }
    },

    /**
     * Update wishlist
     */
    update: async (wishlistId, patch) => {
        if (!wishlistId) throw new Error("wishlistId is required");

        try {
            const res = await api.patch(
                `${ENDPOINTS.WISHLIST.BASE}/${wishlistId}`,
                patch
            );

            return res.data;
        } catch (error) {
            throw await handleApiError(error);
        }
    },

    /**
     * Delete wishlist
     */
    remove: async (wishlistId) => {
        if (!wishlistId) throw new Error("wishlistId is required");

        try {
            const res = await api.delete(
                `${ENDPOINTS.WISHLIST.BASE}/${wishlistId}`
            );

            return res.data;
        } catch (error) {
            throw await handleApiError(error);
        }
    },

    /**
     * Get wishlist detail with items
     */
    getDetail: async (wishlistId) => {
        if (!wishlistId) throw new Error("wishlistId is required");

        try {
            const res = await api.get(
                `${ENDPOINTS.WISHLIST.BASE}/${wishlistId}`
            );

            return res.data;
        } catch (error) {
            throw await handleApiError(error);
        }
    },

    // ------------------------
    // ITEMS
    // ------------------------

    /**
     * Add item to wishlist
     */
    addItem: async ({ wishlist_id, service_id }) => {
        if (!wishlist_id || !service_id) {
            throw new Error("wishlist_id and service_id are required");
        }

        try {
            const res = await api.post(ENDPOINTS.WISHLIST.ITEMS, {
                wishlist_id,
                service_id,
            });

            return res.data;
        } catch (error) {
            throw await handleApiError(error);
        }
    },

    /**
     * Remove item from wishlist
     */
    removeItem: async (itemId) => {
        if (!itemId) throw new Error("itemId is required");

        try {
            const res = await api.delete(
                ENDPOINTS.WISHLIST.ITEM(itemId)
            );

            return res.data;
        } catch (error) {
            throw await handleApiError(error);
        }
    },

    /**
     * Update item (note, priority, wishlist move, etc.)
     */
    updateItem: async (itemId, patch) => {
        if (!itemId) throw new Error("itemId is required");

        try {
            const res = await api.patch(
                ENDPOINTS.WISHLIST.ITEM(itemId),
                patch
            );

            return res.data;
        } catch (error) {
            throw await handleApiError(error);
        }
    },

    /**
     * Move item between wishlists
     */
    moveItem: async (itemId, target_wishlist_id) => {
        const res = await api.post(
            `/wishlists/items/${itemId}/move?target_wishlist_id=${target_wishlist_id}`
        );
        return res.data;
    },

    /**
     * Check if service is in wishlist
     */
    findByService: async (serviceId) => {
        if (!serviceId) throw new Error("serviceId is required");

        try {
            const res = await api.get(
                `/wishlists/items/by-service/${serviceId}`
            );

            return res.data;
        } catch (error) {
            throw await handleApiError(error);
        }
    },
};


export const suggestNameForService = (service) => {
    const t = (service?.service_type || service?.type || "").toLowerCase();

    if (t.includes("venue")) return "Venues";
    if (t.includes("cater")) return "Catering";
    if (t.includes("photo")) return "Photography";
    if (t.includes("dj") || t.includes("music")) return "Music & DJ";
    if (t.includes("decor")) return "Decoration";
    if (t.includes("makeup")) return "Makeup Artists";
    if (t.includes("plan") || t.includes("event")) return "Event Planners";

    return "My Wishlist";
};
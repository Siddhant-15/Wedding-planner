// utils/normalizeService.js

export const normalizeService = (s) => {
    const variant = s.variants?.[0];
    const pricing = variant?.pricing || {};

    // ================= PRICING LOGIC =================

    let normalizedPricing = {
        isCatering: false,
        isPhotography: false,
        isVenue: false,
        price: "Price on request",
        label: "",
    };

    // 🍽️ CATERING
    if (s.service_type === "catering") {
        normalizedPricing = {
            isCatering: true,
            veg: pricing.veg_price != null ? `₹${pricing.veg_price}` : "—",
            nonVeg: pricing.non_veg_price != null ? `₹${pricing.non_veg_price}` : "—",
        };
    }

    // 📸 PHOTOGRAPHY
    else if (s.service_type === "photography") {
        const base = pricing.base_price;

        normalizedPricing = {
            isPhotography: true,
            photo: base != null ? `₹${base}` : null,
            photoVideo: pricing.price_with_video
                ? `₹${pricing.price_with_video}`
                : null,
        };
    }

    // 🏛️ VENUE
    else if (s.service_type === "venue") {
        normalizedPricing = {
            isVenue: true,
            veg: pricing.veg_price != null ? `₹${pricing.veg_price}` : null,
            nonVeg: pricing.non_veg_price != null ? `₹${pricing.non_veg_price}` : null,
            rental: pricing.rental_price != null ? `₹${pricing.rental_price}` : null,
        };
    }

    // 💰 DEFAULT
    else {
        const base = pricing.base_price || pricing.veg_price;

        normalizedPricing = {
            price: base != null ? `₹${base}` : "Price on request",
            label: variant?.pricing_type?.replace("_", " ")?.toLowerCase() || "",
        };
    }

    return {
        id: s.id,
        service_name: s.service_name,
        service_type: s.service_type,
        city: s.city,
        state: s.state,
        is_active: s.is_active,
        rating: s.rating,

        media: s.media?.map((m) => m.media_url) || [],
        amenities: s.metadata?.amenities || [],

        pricing: normalizedPricing,

        raw: s,
    };
};
// src/components/services/ServiceFormModal/formHelper.js

// Helper functions for dynamic list fields
export const handleAddListItem = (handleInputChange, field, value, clearInputFn) => {
    const trimmed = value?.trim();
    if (trimmed && trimmed.length > 0) {
        handleInputChange(field, (prev = []) => [...prev, trimmed]);
        if (clearInputFn) clearInputFn("");
    }
};

export const handleRemoveListItem = (handleInputChange, field, itemToRemove) => {
    handleInputChange(field, (prev = []) =>
        prev.filter(item => item !== itemToRemove)
    );
};

export const transformPayload = (formData) => {
    const payload = {
        service_name: formData.title,
        service_type: formData.category,
        description: formData.description || "",

        add_line1: formData.address_line1 || null,
        add_line2: formData.address_line2 || null,
        area: formData.area || null,
        city: formData.city,
        state: formData.state,
        country: formData.country,
        pincode: formData.pincode,

        latitude: formData.geo_point.lat !== "" ? parseFloat(formData.geo_point.lat) : null,
        longitude: formData.geo_point.lon !== "" ? parseFloat(formData.geo_point.lon) : null,

        metadata: {
            tags: formData.tags || [],
            amenities: formData.amenities || []
        },

        variants: formData.variants.map(v => {
            const variantBase = {
                variant_name: v.variant_name?.trim() || "Untitled Package",
                pricing_type: v.pricing_type || "BASE_PRICE",
                currency: "INR",
                is_default: !!v.is_default,
                inclusions: v.inclusions
                    ? v.inclusions.split(",").map(i => i.trim()).filter(Boolean)
                    : []
            };

            // ================= CATEGORY BASED PRICING =================

            // 🥗 CATERING
            if (formData.category === 'catering') {
                variantBase.pricing = {
                    veg_price: parseFloat(v.veg_price) || 0,
                    ...(!v.is_veg_only && {
                        non_veg_price: parseFloat(v.non_veg_price) || 0
                    })
                };
            }

            // 🏛️ VENUE
            else if (formData.category === 'venue') {
                variantBase.pricing = {
                    pricing_mode: v.pricing_mode || null,

                    ...((v.pricing_mode === "per_plate" || v.pricing_mode === "both") && {
                        veg_price: parseFloat(v.veg_price) || 0,
                        ...(!v.is_veg_only && {
                            non_veg_price: parseFloat(v.non_veg_price) || 0
                        })
                    }),

                    ...((v.pricing_mode === "rental" || v.pricing_mode === "both") && {
                        rental_price: parseFloat(v.rental_price) || 0
                    })
                };
            }

            // 📸 PHOTOGRAPHY
            else if (formData.category === 'photography') {
                variantBase.pricing = {
                    base_price: parseFloat(v.price) || 0,

                    ...(formData.videography_available && {
                        price_with_video: parseFloat(v.price_with_video) || 0
                    })
                };
            }

            // 🎧 DEFAULT (DJ, Makeup, Event etc.)
            else {
                variantBase.pricing = {
                    base_price: parseFloat(v.price) || 0
                };
            }

            return variantBase;
        })
    };

    // ================= VENUE =================
    if (formData.category === "venue") {
        payload.venue = {
            min_capacity: parseInt(formData.capacity_min) || 0,
            max_capacity: parseInt(formData.capacity_max) || 0,
            venue_type: formData.hall_type || "",
            venue_nature: formData.indoor_outdoor || "",
            square_feet: parseFloat(formData.square_feet) || 0,
            parking_capacity: parseInt(formData.parking_capacity) || 0,
            venue_policies: formData.venue_policies || {}
        };
    }

    // ================= CATERING =================
    if (formData.category === "catering") {
        payload.catering = {
            cuisine_types: formData.cuisine_types || [],
            special_diets_supported: formData.special_diets_supported || [],
            min_order: parseInt(formData.min_order) || 1,
            max_order: parseInt(formData.max_order) || null,
            service_styles: formData.service_styles_multi || [],
            staff_included: !!formData.staff_included,
            crockery_cutlery_included: !!formData.crockery_cutlery_included,
            tasting_available: !!formData.tasting_available,
        };
    }

    // ================= DJ =================
    if (formData.category === "dj") {
        payload.dj = {
            genres_supported: formData.genres_supported || [],
            duration_hours: parseFloat(formData.duration_hours) || 0,
            equipment: formData.equipment || [],
            lighting_included: !!formData.lighting_included,
            mc_host_available: !!formData.mc_host_available,
            setup_time_required: parseFloat(formData.setup_time_required) || 0,
        };
    }

    // ================= PHOTOGRAPHY =================
    if (formData.category === "photography") {
        payload.photography = {
            photography_types: formData.photography_types || [],
            editing_styles: formData.editing_styles || [],

            videography_available: !!formData.videography_available,
            drone_shoot_available: !!formData.drone_shoot_available,

            photo_delivery_count: parseInt(formData.photo_delivery_count) || null,
            video_delivery_duration_minutes: formData.videography_available
                ? parseInt(formData.video_delivery_duration_minutes) || null
                : null,

            edited_photos_included: !!formData.edited_photos_included,
            raw_photos_provided: !!formData.raw_photos_provided,
            album_included: !!formData.album_included,
            album_pages: formData.album_included
                ? parseInt(formData.album_pages) || null
                : null,

            coverage_hours: parseFloat(formData.coverage_hours) || null,
            overtime_rate_per_hour: parseFloat(formData.overtime_rate_per_hour) || null,

            team_size: parseInt(formData.team_size) || 1,
            second_shooter_included: !!formData.second_shooter_included,
        };
    }

    // ================= EVENT MANAGEMENT =================
    if (formData.category === "event_management") {
        payload.event_management = {
            event_types: formData.event_types || [],
            team_size: parseInt(formData.team_size) || 0,
            experience_years: parseInt(formData.experience_years) || 0,
        };
    }

    // ================= MAKEUP ARTIST =================
    if (formData.category === "makeup_artist") {
        payload.makeup_artist = {
            makeup_types: formData.makeup_types || [],
            specialization: formData.specialization || null,
            brands_used: formData.brands_used || [],
            premium_products_used: !!formData.premium_products_used,
            service_duration_minutes: parseInt(formData.service_duration_minutes) || null,
            travel_to_client: !!formData.travel_to_client,
            travel_cost_per_km: formData.travel_cost_per_km
                ? parseFloat(formData.travel_cost_per_km)
                : null,
            base_city: formData.base_city || null,
            hairstyling_included: !!formData.hairstyling_included,
            draping_included: !!formData.draping_included,
            trial_available: !!formData.trial_available,
        };
    }

    return payload;
};
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

export const transformPayload = (formData, initialData) => {
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

        variants: formData.variants.map(v => ({
            variant_name: v.variant_name,
            pricing_type: v.pricing_type,
            currency: "INR",
            pricing: { base_price: parseFloat(v.price) || 0 },
            is_default: v.is_default,
            inclusions: v.inclusions
                ? v.inclusions.split(",").map(i => i.trim()).filter(Boolean)
                : [],
            metadata: {}
        }))
    };

    // ================= VENUE =================
    if (formData.category === "venue") {
        payload.venue = {
            venue_type: formData.hall_type || "banquet",
            venue_nature: formData.indoor_outdoor || "indoor",

            min_capacity: parseInt(formData.capacity_min) || 10,
            max_capacity: parseInt(formData.capacity_max) || 1000,

            square_feet: parseFloat(formData.square_feet) || 0,
            parking_capacity: parseInt(formData.parking_capacity) || 0,

            catering_options: {
                policy: formData.catering_policy || "allowed"
            },

            amenities: formData.amenities || [],

            venue_rules: [
                ...(formData.decoration_policy
                    ? [`Decoration: ${formData.decoration_policy}`]
                    : []),
                ...(formData.alcohol_policy
                    ? [`Alcohol: ${formData.alcohol_policy}`]
                    : [])
            ]
        };
    }

    // ================= CATERING =================
    else if (formData.category === "catering") {
        payload.catering = {
            cuisine_types: formData.cuisine_types || [],
            special_diets_supported: formData.special_diets_supported || [],

            veg_price_per_head: parseFloat(formData.veg_price_per_head) || 0,
            non_veg_price_per_head: parseFloat(formData.nonveg_price_per_head) || 0,

            min_order: parseInt(formData.min_order) || 1,
            max_order: parseInt(formData.max_order) || null,

            service_styles: formData.service_styles_multi || [],

            staff_included: !!formData.staff_included,
            crockery_cutlery_included: !!formData.crockery_cutlery_included,
            tasting_available: !!formData.tasting_available,

            customizable_menu: true
        };
    }

    // ================= DJ =================
    else if (formData.category === "dj") {
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
    else if (formData.category === "photography") {
        payload.photography = {
            photography_types: formData.photography_types || [],
            hours_covered: parseFloat(formData.hours_covered) || 0,
            videography_included: !!formData.videography_included,
            drone_available: !!formData.drone_available,
            album_included: !!formData.album_included,
        };
    }

    // ================= EVENT MANAGEMENT =================
    else if (formData.category === "event_management") {
        payload.event_management = {
            event_types: formData.event_types || [],
            team_size: parseInt(formData.team_size) || 0,
            experience_years: parseInt(formData.experience_years) || 0,
        };
    }

    return payload;
};
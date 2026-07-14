// src/utils/buildServiceFormData.js

export const buildServiceFormData = (formValues) => {
    const formData = new FormData();

    // 🔥 Normalize service_type fallback (prevents missing field 422)
    const serviceType =
        formValues.service_type || formValues.category || "";

    // ================= CORE PAYLOAD =================
    const payload = {
        service_type: serviceType,
        service_name: formValues.title,
        description: formValues.description || "",

        add_line1: formValues.address_line1 || null,
        add_line2: formValues.address_line2 || null,
        area: formValues.area || null,
        city: formValues.city,
        state: formValues.state,
        country: formValues.country || "India",
        pincode: formValues.pincode,

        latitude:
            formValues.geo_point?.lat !== ""
                ? Number(formValues.geo_point?.lat)
                : null,

        longitude:
            formValues.geo_point?.lon !== ""
                ? Number(formValues.geo_point?.lon)
                : null,

        // ⚠️ MUST MATCH BACKEND: metadata_ (not metadata)
        metadata_: {
            tags: formValues.tags || [],
            amenities: formValues.amenities || [],
        },
    };

    // ================= VARIANTS =================
    payload.variants = (formValues.variants || []).map((v, i) => {
        const base = {
            variant_name: v.variant_name?.trim() || "Basic Package",
            pricing_type: v.pricing_type || "BASE_PRICE",
            currency: "INR",
            is_default: v.is_default ?? i === 0,

            // 🔥 FIX: ALWAYS ENSURE ARRAY (Pydantic error fix)
            inclusions: Array.isArray(v.inclusions)
                ? v.inclusions
                : typeof v.inclusions === "string"
                    ? v.inclusions
                        .split(",")
                        .map((i) => i.trim())
                        .filter(Boolean)
                    : [],

            exclusions: [],
            menu: [],
            deliverables: [],
            policies: {},
            metadata_: {},
        };

        // ================= PRICING RULES =================

        if (serviceType === "catering") {
            base.pricing = {
                veg_price: v.veg_price ? Number(v.veg_price) : null,
                non_veg_price: v.non_veg_price ? Number(v.non_veg_price) : null,
            };
        }

        else if (serviceType === "venue") {
            base.pricing = {
                pricing_mode: v.pricing_mode || null,

                ...(v.pricing_mode === "per_plate" ||
                    v.pricing_mode === "both"
                    ? {
                        veg_price: v.veg_price ? Number(v.veg_price) : null,
                        non_veg_price: v.non_veg_price
                            ? Number(v.non_veg_price)
                            : null,
                    }
                    : {}),

                ...(v.pricing_mode === "rental" ||
                    v.pricing_mode === "both"
                    ? {
                        rental_price: v.rental_price
                            ? Number(v.rental_price)
                            : null,
                    }
                    : {}),
            };
        }

        else if (serviceType === "photography") {
            base.pricing = {
                base_price: v.price ? Number(v.price) : null,
                ...(formValues.videography_available && {
                    price_with_video: v.price_with_video
                        ? Number(v.price_with_video)
                        : null,
                }),
            };
        }

        else {
            base.pricing = {
                base_price: v.price ? Number(v.price) : null,
            };
        }

        return base;
    });

    // ================= TYPE-SPECIFIC BLOCKS =================

    if (serviceType === "event_management") {
        payload.event_management = {
            event_types: formValues.event_types || [],
            services_offered: formValues.services_offered || [],
            themes_supported: formValues.themes_supported || [],
            team_size: Number(formValues.team_size) || null,
            on_site_managers: Number(formValues.on_site_managers) || 1,
            decoration_included: !!formValues.decoration_included,
            catering_management: !!formValues.catering_management,
            entertainment_management: !!formValues.entertainment_management,
            planning_duration_days: Number(formValues.planning_duration_days) || null,
            setup_time_hours: Number(formValues.setup_time_hours) || null,
            min_budget: Number(formValues.min_budget) || null,
            max_budget: Number(formValues.max_budget) || null,
            travel_cost_per_km: Number(formValues.travel_cost_per_km) || null,
            base_city: formValues.base_city || "",
            experience_years: Number(formValues.experience_years) || 0,
        };
    }

    if (serviceType === "makeup_artist") {
        payload.makeup_artist = {
            makeup_types: formValues.makeup_types || [],
            specialization: formValues.specialization || [],
            brands_used: formValues.brands_used || [],
            premium_products_used: !!formValues.premium_products_used,
            team_size: Number(formValues.team_size) || 1,
            service_duration_minutes: Number(formValues.service_duration_minutes) || null,
            travel_to_client: !!formValues.travel_to_client,
            travel_cost_per_km: Number(formValues.travel_cost_per_km) || null,
            base_city: formValues.base_city || "",
            hairstyling_included: !!formValues.hairstyling_included,
            draping_included: !!formValues.draping_included,
            trial_available: !!formValues.trial_available,
            experience_years: Number(formValues.experience_years) || 0,
        };
    }

    if (serviceType === "venue") {
        payload.venue = {
            min_capacity: Number(formValues.capacity_min) || 0,
            max_capacity: Number(formValues.capacity_max) || 0,
            venue_type: formValues.venue_type || "",
            venue_nature: formValues.venue_nature || "",
            square_feet: Number(formValues.square_feet) || 0,
            parking_capacity: Number(formValues.parking_capacity) || 0,

            venue_policies: {
                decoration_policy:
                    formValues.venue_policies?.decoration_policy || "",
                catering_policy:
                    formValues.venue_policies?.catering_policy || "",
                alcohol_policy:
                    formValues.venue_policies?.alcohol_policy || "",
                other_policies:
                    formValues.venue_policies?.other_policies || [],
            },
        };
    }

    if (serviceType === "catering") {
        payload.catering = {
            cuisine_types: formValues.cuisine_types || [],
            special_diets_supported:
                formValues.special_diets_supported || [],
            min_order: Number(formValues.min_order) || 1,
            max_order: Number(formValues.max_order) || null,
            service_styles: formValues.service_styles_multi || [],
            staff_included: !!formValues.staff_included,
            crockery_cutlery_included:
                !!formValues.crockery_cutlery_included,
            tasting_available: !!formValues.tasting_available,
        };
    }

    if (serviceType === "photography") {
        payload.photography = {
            photography_types: formValues.photography_types || [],
            editing_styles: formValues.editing_styles || [],

            videography_available: !!formValues.videography_available,
            drone_shoot_available: !!formValues.drone_shoot_available,

            photo_delivery_count: Number(formValues.photo_delivery_count) || null,
            video_delivery_duration_minutes:
                formValues.videography_available
                    ? Number(formValues.video_delivery_duration_minutes) || null
                    : null,

            edited_photos_included: !!formValues.edited_photos_included,
            raw_photos_provided: !!formValues.raw_photos_provided,
            album_included: !!formValues.album_included,

            album_pages: formValues.album_included
                ? Number(formValues.album_pages) || null
                : null,

            coverage_hours: Number(formValues.coverage_hours) || null,
            overtime_rate_per_hour:
                Number(formValues.overtime_rate_per_hour) || null,

            team_size: Number(formValues.team_size) || 1,
            second_shooter_included:
                !!formValues.second_shooter_included,
        };
    }

    if (serviceType === "dj") {
        payload.dj = {
            genres_supported: formValues.genres_supported || [],
            languages_supported: formValues.languages_supported || [],
            event_types_supported:
                formValues.event_types_supported || [],

            performance_duration_hours:
                Number(formValues.performance_duration_hours) || 0,

            equipments_provided: formValues.equipment || [],
            sound_system_included: !!formValues.sound_system_included,
            lighting_included: !!formValues.lighting_included,
            mc_host_available: !!formValues.mc_host_available,
        };
    }

    // ================= FINAL WRAP =================
    formData.append("data", JSON.stringify(payload));

    const existingImages = [];

    (formValues.images || []).forEach((img) => {
        if (img instanceof File || img instanceof Blob) {
            formData.append("images", img, img.name || "image.jpg");
        } else if (img && img.file && (img.file instanceof File || img.file instanceof Blob)) {
            formData.append("images", img.file, img.file.name || "image.jpg");
        } else if (typeof img === "string") {
            existingImages.push(img);
        }
    });

    formData.append("existing_images", JSON.stringify(existingImages));

    // ================= EXTERNAL MEDIA =================

    const externalMedia = (formValues.media_links || []).map((item) => ({
        media_url: item.url,

        media_type:
            item.type === "youtube" ||
                item.type === "video"
                ? "video"
                : "image",

        source_type: item.type || "external",

        metadata: {
            label: item.type,
        },
    }));

    formData.append(
        "external_media",
        JSON.stringify(externalMedia)
    );

    return formData;
};
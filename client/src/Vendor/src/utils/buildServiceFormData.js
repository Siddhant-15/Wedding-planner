// src/utils/buildServiceFormData.js

/**
 * @param {object} formValues
 * @param {{ saveAsDraft?: boolean }} [options]
 */
export const buildServiceFormData = (formValues, options = {}) => {
    const { saveAsDraft = false } = options;
    const formData = new FormData();

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
        city: formValues.city || null,
        state: formValues.state || null,
        country: formValues.country || "India",
        pincode: formValues.pincode || null,

        latitude:
            formValues.geo_point?.lat !== "" && formValues.geo_point?.lat != null
                ? Number(formValues.geo_point.lat)
                : null,

        longitude:
            formValues.geo_point?.lon !== "" && formValues.geo_point?.lon != null
                ? Number(formValues.geo_point.lon)
                : null,

        // Backend accepts alias "metadata" → metadata_
        metadata: {
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
            inclusions: Array.isArray(v.inclusions)
                ? v.inclusions
                : typeof v.inclusions === "string"
                    ? v.inclusions
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean)
                    : [],
            exclusions: [],
            menu: [],
            deliverables: [],
            policies: {},
            metadata: {},
        };

        if (serviceType === "catering") {
            base.pricing = {
                veg_price: v.veg_price ? Number(v.veg_price) : null,
                non_veg_price: v.non_veg_price ? Number(v.non_veg_price) : null,
                is_veg_only: v.is_veg_only === true,
            };
        } else if (serviceType === "venue") {
            base.pricing = {
                pricing_mode: v.pricing_mode || null,
                ...(v.pricing_mode === "per_plate" || v.pricing_mode === "both"
                    ? {
                        veg_price: v.veg_price ? Number(v.veg_price) : null,
                        non_veg_price: v.non_veg_price ? Number(v.non_veg_price) : null,
                    }
                    : {}),
                ...(v.pricing_mode === "rental" || v.pricing_mode === "both"
                    ? {
                        rental_price: v.rental_price ? Number(v.rental_price) : null,
                    }
                    : {}),
                is_veg_only: v.is_veg_only === true,
            };
        } else if (serviceType === "photography") {
            base.pricing = {
                base_price: v.price ? Number(v.price) : null,
                ...(formValues.videography_available && {
                    price_with_video: v.price_with_video
                        ? Number(v.price_with_video)
                        : null,
                }),
            };
        } else {
            base.pricing = {
                base_price: v.price ? Number(v.price) : null,
            };
        }

        return base;
    });

    // ================= TYPE-SPECIFIC =================
    // (same as yours — venue / catering / photography / dj / etc.)
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
            service_duration_minutes:
                Number(formValues.service_duration_minutes) || null,
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
            min_capacity:
                formValues.min_capacity !== "" && formValues.min_capacity != null
                    ? Number(formValues.min_capacity)
                    : null,
            max_capacity:
                formValues.max_capacity !== "" && formValues.max_capacity != null
                    ? Number(formValues.max_capacity)
                    : null,
            venue_type: formValues.venue_type || "",
            venue_nature: formValues.venue_nature || "",
            square_feet:
                formValues.square_feet !== "" && formValues.square_feet != null
                    ? Number(formValues.square_feet)
                    : null,
            parking_capacity:
                formValues.parking_capacity !== "" &&
                    formValues.parking_capacity != null
                    ? Number(formValues.parking_capacity)
                    : null,
            venue_policies: {
                decoration_policy:
                    formValues.venue_policies?.decoration_policy || "",
                catering_policy: formValues.venue_policies?.catering_policy || "",
                alcohol_policy: formValues.venue_policies?.alcohol_policy || "",
                other_policies: formValues.venue_policies?.other_policies || [],
            },
        };
    }

    if (serviceType === "catering") {
        payload.catering = {
            cuisine_types: formValues.cuisine_types || [],
            special_diets_supported: formValues.special_diets_supported || [],
            min_order: Number(formValues.min_order) || 1,
            max_order: Number(formValues.max_order) || null,
            service_styles: formValues.service_styles_multi || [],
            staff_included: !!formValues.staff_included,
            crockery_cutlery_included: !!formValues.crockery_cutlery_included,
            tasting_available: !!formValues.tasting_available,
        };
    }

    if (serviceType === "photography") {
        payload.photography = {
            photography_types: formValues.photography_types || [],
            editing_styles: formValues.editing_styles || [],
            videography_included: !!formValues.videography_available,
            drone_available: !!formValues.drone_shoot_available,
            photo_delivery_count: Number(formValues.photo_delivery_count) || null,
            video_delivery_duration_minutes: formValues.videography_available
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
            second_shooter_included: !!formValues.second_shooter_included,
        };
    }

    if (serviceType === "dj") {
        payload.dj = {
            genres_supported: formValues.genres_supported || [],
            languages_supported: formValues.languages_supported || [],
            event_types_supported: formValues.event_types_supported || [],
            performance_duration_hours:
                Number(formValues.performance_duration_hours) || 4,
            equipments_provided: formValues.equipment || [],
            sound_system_included: !!formValues.sound_system_included,
            lighting_included: !!formValues.lighting_included,
            mc_host_available: !!formValues.mc_host_available,
        };
    }

    // ================= FINAL WRAP =================
    formData.append("data", JSON.stringify(payload));

    // 🔑 THIS is what was missing — sibling Form field, not inside JSON
    formData.append("save_as_draft", saveAsDraft ? "true" : "false");

    // Existing server media IDs (for update retention)
    const keepIds = [];
    const existingMedia = [];

    (formValues.images || []).forEach((img) => {
        // New uploaded image
        if (
            img instanceof File ||
            img instanceof Blob
        ) {
            formData.append(
                "images",
                img,
                img.name || "image.jpg"
            );

            formData.append(
                "image_is_cover",
                String(img.is_cover === true)
            );

            return;
        }

        // New uploaded image wrapped in object
        if (
            img?.file instanceof File ||
            img?.file instanceof Blob
        ) {
            formData.append(
                "images",
                img.file,
                img.file.name || "image.jpg"
            );

            formData.append(
                "image_is_cover",
                String(img.is_cover === true)
            );

            return;
        }

        // Existing backend media
        if (typeof img?.id === "number") {
            keepIds.push(img.id);

            existingMedia.push({
                id: img.id,
                is_cover: img.is_cover === true,
            });

            return;
        }
    });

    // Prefer explicit list from form state
    const existingMediaIds = Array.isArray(formValues.existing_media_ids)
        ? formValues.existing_media_ids
        : keepIds;

    if (formValues.id) {
        // Editing: always send existing_media so backend knows retention intent
        if (formValues.id) {
            formData.append(
                "existing_media",
                JSON.stringify(existingMedia)
            );
        }
    }
    // New create: omit existing_media

    const externalMedia = (formValues.media_links || []).map((item) => ({
        media_url: item.url,
        media_type:
            item.type === "youtube" || item.type === "video" ? "video" : "image",
        metadata: { label: item.type },
    }));

    formData.append("external_media", JSON.stringify(externalMedia));

    return formData;
};
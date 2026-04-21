export const initialFormData = {
    title: "",
    description: "",
    tags: [],
    address_line1: "",
    address_line2: "",
    area: "",
    city: "",
    state: "",
    country: "India",
    pincode: "",
    geo_point: { lat: "", lon: "" },
    category: "",

    // ================= VARIANTS =================
    variants: [
        {
            variant_name: "Basic Package",

            // Common
            pricing_type: "BASE_PRICE", // used for non-venue
            pricing_mode: "",          // used for venue

            // Default pricing
            price: "",
            price_with_video: "",

            // Catering / Venue (per plate)
            veg_price: "",
            non_veg_price: "",
            is_veg_only: false,

            // Venue rental
            rental_price: "",

            is_default: true,
            inclusions: ""
        }
    ],

    amenities: [],

    // ================= VENUE =================
    capacity_min: "",
    capacity_max: "",
    hall_type: "",
    indoor_outdoor: "",
    square_feet: "",
    parking_capacity: "",
    venue_policies: {
        decoration_policy: "",
        catering_policy: "",
        alcohol_policy: "",
        other_policies: []
    },

    // ================= CATERING =================
    cuisine_types: [],
    special_diets_supported: [],
    min_order: "",
    max_order: "",
    service_styles_multi: [],
    staff_included: false,
    crockery_cutlery_included: false,
    tasting_available: false,

    // ================= DJ =================
    genres_supported: [],
    duration_hours: "",
    equipment: [],
    lighting_included: false,
    mc_host_available: false,
    setup_time_required: "",

    // ================= PHOTOGRAPHY =================
    photography_types: [],
    videography_available: false,

    coverage_hours: "",
    overtime_rate_per_hour: "",

    photo_delivery_count: "",
    video_delivery_duration_minutes: "",
    edited_photos_included: true,
    raw_photos_provided: false,
    album_included: false,
    album_pages: "",

    drone_shoot_available: false,

    team_size: "",
    second_shooter_included: false,

    editing_styles: [],

    // ================= EVENT MANAGEMENT =================
    event_types: [],

    // ================= MAKEUP ARTIST =================
    makeup_types: [],
    specialization: "",
    brands_used: [],
    premium_products_used: true,
    service_duration_minutes: "",
    travel_to_client: true,
    travel_cost_per_km: "",
    base_city: "",
    hairstyling_included: true,
    draping_included: false,
    trial_available: false,

    // ================= SHARED =================
    experience_years: "",

    // ================= LEGACY =================
    veg_price_per_head: "",
    nonveg_price_per_head: "",
};
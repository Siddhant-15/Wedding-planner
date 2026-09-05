// src/utils/apiServiceToFormData.js

export const apiServiceToFormData = (raw) => {
  if (!raw) return null;

  const category = raw.service_type || "";

  return {
    // ==========================================
    // BASIC
    // ==========================================
    id: raw.id,

    category,

    // Some of your code calls this service_type.
    // Keep it as well if other parts of the form use it.
    service_type: raw.service_type || "",

    title: raw.service_name || "",
    description: raw.description || "",

    // ==========================================
    // LOCATION
    // ==========================================
    address_line1: raw.add_line1 || "",
    address_line2: raw.add_line2 || "",
    area: raw.area || "",
    city: raw.city || "",
    state: raw.state || "",
    country: raw.country || "India",
    pincode: raw.pincode || "",

    geo_point: {
      lat: raw.latitude ?? "",
      lon: raw.longitude ?? "",
    },

    // ==========================================
    // TAGS / AMENITIES
    // ==========================================
    tags: Array.isArray(raw.metadata?.tags)
      ? raw.metadata.tags
      : [],

    amenities: Array.isArray(raw.metadata?.amenities)
      ? raw.metadata.amenities
      : [],

    // ==========================================
    // VARIANTS
    // ==========================================
    variants: (raw.variants || []).map((v, index) => ({
      id: v.id ?? `${raw.id}-${index}`,

      variant_name: v.variant_name || "",

      description: v.description || "",

      is_default: v.is_default ?? index === 0,

      pricing_type: v.pricing_type || "",

      // IMPORTANT:
      // pricing_mode lives inside v.pricing
      pricing_mode: v.pricing?.pricing_mode || "",

      // Pricing fields
      price: v.pricing?.base_price ?? "",
      veg_price: v.pricing?.veg_price ?? "",
      non_veg_price: v.pricing?.non_veg_price ?? "",
      rental_price: v.pricing?.rental_price ?? "",
      price_with_video: v.pricing?.price_with_video ?? "",

      is_veg_only: v.pricing?.is_veg_only ?? false,

      // Form currently uses a text input for this.
      inclusions: Array.isArray(v.inclusions)
        ? v.inclusions.join(", ")
        : v.inclusions || "",

      exclusions: Array.isArray(v.exclusions)
        ? v.exclusions.join(", ")
        : v.exclusions || "",

      min_quantity: v.min_quantity ?? "",
      max_quantity: v.max_quantity ?? "",

      currency: v.currency || "INR",
    })),

    // ==========================================
    // VENUE
    // ==========================================
    min_capacity: raw.venue?.min_capacity ?? "",
    max_capacity: raw.venue?.max_capacity ?? "",
    square_feet: raw.venue?.square_feet ?? "",
    parking_capacity: raw.venue?.parking_capacity ?? "",

    venue_type: raw.venue?.venue_type || "",
    venue_nature: raw.venue?.venue_nature || "",

    venue_policies: {
      decoration_policy:
        raw.venue?.venue_policies?.decoration_policy || "",

      catering_policy:
        raw.venue?.venue_policies?.catering_policy || "",

      alcohol_policy:
        raw.venue?.venue_policies?.alcohol_policy || "",

      other_policies:
        Array.isArray(
          raw.venue?.venue_policies?.other_policies
        )
          ? raw.venue.venue_policies.other_policies.map((p) => ({
              title: p.title || "",
              description: p.description || "",
            }))
          : [],
    },

    // ==========================================
    // CATERING
    // ==========================================
    cuisine_types: raw.catering?.cuisine_types || [],
    special_diets_supported:
      raw.catering?.special_diets_supported || [],
    service_styles_multi:
      raw.catering?.service_styles_multi || [],

    min_order: raw.catering?.min_order ?? "",
    max_order: raw.catering?.max_order ?? "",

    staff_included:
      raw.catering?.staff_included ?? false,

    crockery_cutlery_included:
      raw.catering?.crockery_cutlery_included ?? false,

    tasting_available:
      raw.catering?.tasting_available ?? false,

    // ==========================================
    // DJ
    // ==========================================
    genres_supported:
      raw.dj?.genres_supported || [],

    languages_supported:
      raw.dj?.languages_supported || [],

    equipment:
      raw.dj?.equipment || [],

    performance_duration_hours:
      raw.dj?.performance_duration_hours ?? "",

    setup_time_minutes:
      raw.dj?.setup_time_minutes ?? "",

    sound_system_included:
      raw.dj?.sound_system_included ?? false,

    lighting_included:
      raw.dj?.lighting_included ?? false,

    mc_host_available:
      raw.dj?.mc_host_available ?? false,

    // ==========================================
    // PHOTOGRAPHY
    // ==========================================
    photography_types:
      raw.photography?.photography_types || [],

    editing_styles:
      raw.photography?.editing_styles || [],

    coverage_hours:
      raw.photography?.coverage_hours ?? "",

    overtime_rate_per_hour:
      raw.photography?.overtime_rate_per_hour ?? "",

    team_size:
      raw.photography?.team_size ?? "",

    photo_delivery_count:
      raw.photography?.photo_delivery_count ?? "",

    video_delivery_duration_minutes:
      raw.photography?.video_delivery_duration_minutes ?? "",

    album_pages:
      raw.photography?.album_pages ?? "",

    second_shooter_included:
      raw.photography?.second_shooter_included ?? false,

    videography_available:
      raw.photography?.videography_available ?? false,

    drone_shoot_available:
      raw.photography?.drone_shoot_available ?? false,

    edited_photos_included:
      raw.photography?.edited_photos_included ?? false,

    raw_photos_provided:
      raw.photography?.raw_photos_provided ?? false,

    album_included:
      raw.photography?.album_included ?? false,

    // ==========================================
    // EVENT MANAGEMENT
    // ==========================================
    event_types:
      raw.event_management?.event_types || [],

    themes_supported:
      raw.event_management?.themes_supported || [],

    services_offered:
      raw.event_management?.services_offered || [],

    experience_years:
      raw.event_management?.experience_years ?? "",

    team_size:
      raw.event_management?.team_size ?? "",

    decoration_included:
      raw.event_management?.decoration_included ?? false,

    catering_management:
      raw.event_management?.catering_management ?? false,

    entertainment_management:
      raw.event_management?.entertainment_management ?? false,

    // ==========================================
    // MAKEUP ARTIST
    // ==========================================
    makeup_types:
      raw.makeup_artist?.makeup_types || [],

    brands_used:
      raw.makeup_artist?.brands_used || [],

    specialization:
      raw.makeup_artist?.specialization || [],

    service_duration_minutes:
      raw.makeup_artist?.service_duration_minutes ?? "",

    travel_cost_per_km:
      raw.makeup_artist?.travel_cost_per_km ?? "",

    base_city:
      raw.makeup_artist?.base_city || "",

    premium_products_used:
      raw.makeup_artist?.premium_products_used ?? false,

    travel_to_client:
      raw.makeup_artist?.travel_to_client ?? false,

    hairstyling_included:
      raw.makeup_artist?.hairstyling_included ?? false,

    draping_included:
      raw.makeup_artist?.draping_included ?? false,

    trial_available:
      raw.makeup_artist?.trial_available ?? false,

    // ==========================================
    // IMAGES
    // ==========================================
    images: (raw.media || [])
      .filter((m) => m.media_type === "image")
      .sort(
        (a, b) =>
          (a.display_order ?? 0) -
          (b.display_order ?? 0)
      )
      .map((m) => m.media_url),

    // ==========================================
    // EXTERNAL MEDIA
    // ==========================================
    media_links: (raw.media || [])
      .filter((m) => m.media_type !== "image")
      .sort(
        (a, b) =>
          (a.display_order ?? 0) -
          (b.display_order ?? 0)
      )
      .map((m) => ({
        id: String(m.id),
        type: m.metadata?.label || m.media_type || "other",
        url: m.media_url,
      })),
  };
};
/**
 * Maps API ServiceResponse → form state for ServiceFormModal.
 * CRITICAL: preserve media row IDs so update can send existing_media correctly.
 */

function mapVariant(v, category) {
  const pricing = v.pricing || {};
  return {
    id: v.id, // numeric server id — keep for reference; rebuild still uses name
    variant_name: v.variant_name || '',
    is_default: !!v.is_default,
    pricing_type: v.pricing_type || '',
    pricing_mode: pricing.pricing_mode || v.pricing_mode || '',
    is_veg_only: pricing.is_veg_only === true,
    veg_price: pricing.veg_price ?? '',
    non_veg_price: pricing.non_veg_price ?? '',
    rental_price: pricing.rental_price ?? '',
    price: pricing.base_price ?? pricing.price ?? '',
    price_with_video: pricing.price_with_video ?? '',
    inclusions: Array.isArray(v.inclusions)
      ? v.inclusions.join(', ')
      : v.inclusions || '',
  };
}

export function apiServiceToFormData(raw) {
  if (!raw) return null;

  const media = raw.media || [];
  // Images as objects with server id + url so we can retain by ID
  const images = media
    .filter((m) => m.media_type === 'image' || !m.media_type)
    .map((m) => ({
      id: m.id, // ServiceMedia PK
      preview: m.media_url,
      url: m.media_url,
      is_cover: m.is_cover,
      // not a File — existing server media
    }));

  const media_links = media
    .filter((m) => m.metadata?.source || m.media_type === 'video')
    .filter((m) => {
      // Prefer links that look external; still keep video entries
      return true;
    })
    .map((m) => ({
      id: m.id,
      type: m.metadata?.source || (m.media_type === 'video' ? 'video' : 'other'),
      url: m.media_url,
    }));

  const existing_media_ids = media.map((m) => m.id).filter((id) => id != null);

  const venue = raw.venue || {};
  const catering = raw.catering || {};
  const dj = raw.dj || {};
  const photography = raw.photography || {};
  const event_management = raw.event_management || {};
  const makeup = raw.makeup_artist || {};

  const category = raw.service_type;

  return {
    id: raw.id,
    status: raw.status,
    version_id: raw.version_id,
    version_status: raw.version_status,
    title: raw.service_name || '',
    description: raw.description || '',
    category,
    tags: raw.metadata?.tags || [],
    amenities: raw.metadata?.amenities || [],
    address_line1: raw.add_line1 || '',
    address_line2: raw.add_line2 || '',
    area: raw.area || '',
    city: raw.city || '',
    state: raw.state || '',
    country: raw.country || 'India',
    pincode: raw.pincode || '',
    geo_point: {
      lat: raw.latitude != null ? String(raw.latitude) : '',
      lon: raw.longitude != null ? String(raw.longitude) : '',
    },
    variants: (raw.variants || []).map((v) => mapVariant(v, category)),
    images,
    media_links,
    existing_media_ids, // always known when loading from API
    revision_feedback: raw.revision_feedback || [],

    // venue
    venue_type: venue.venue_type || '',
    venue_nature: venue.venue_nature || '',
    min_capacity: venue.min_capacity ?? '',
    max_capacity: venue.max_capacity ?? '',
    square_feet: venue.square_feet ?? '',
    parking_capacity: venue.parking_capacity ?? '',
    venue_policies: venue.venue_policies || {},

    // catering
    cuisine_types: catering.cuisine_types || [],
    special_diets_supported: catering.special_diets_supported || [],
    service_styles_multi: catering.service_styles || [],
    min_order: catering.min_order ?? '',
    max_order: catering.max_order ?? '',
    staff_included: !!catering.staff_included,
    crockery_cutlery_included: !!catering.crockery_cutlery_included,
    tasting_available: !!catering.tasting_available,

    // dj
    genres_supported: dj.genres_supported || [],
    languages_supported: dj.languages_supported || [],
    equipment: dj.equipments_provided || [],
    performance_duration_hours: dj.performance_duration_hours ?? '',
    setup_time_minutes: dj.setup_time_minutes ?? '',
    sound_system_included: !!dj.sound_system_included,
    lighting_included: !!dj.lighting_included,
    mc_host_available: !!dj.mc_host_available,

    // photography
    photography_types: photography.photography_types || [],
    editing_styles: photography.editing_styles || [],
    coverage_hours: photography.coverage_hours ?? '',
    overtime_rate_per_hour: photography.overtime_rate_per_hour ?? '',
    team_size: photography.team_size ?? '',
    photo_delivery_count: photography.photo_delivery_count ?? '',
    video_delivery_duration_minutes:
      photography.video_delivery_duration_minutes ?? '',
    album_pages: photography.album_pages ?? '',
    videography_available: !!photography.videography_available,
    drone_shoot_available: !!photography.drone_shoot_available,
    edited_photos_included: !!photography.edited_photos_included,
    raw_photos_provided: !!photography.raw_photos_provided,
    album_included: !!photography.album_included,
    second_shooter_included: !!photography.second_shooter_included,

    // event management
    event_types: event_management.event_types_supported || event_management.event_types || [],
    themes_supported: event_management.themes_supported || [],
    services_offered: event_management.services_offered || [],
    experience_years: event_management.experience_years ?? '',
    decoration_included: !!event_management.decoration_included,
    catering_management: !!event_management.catering_management,
    entertainment_management: !!event_management.entertainment_management,

    // makeup
    makeup_types: makeup.makeup_types || [],
    brands_used: makeup.brands_used || [],
    specialization: makeup.specialization || [],
    service_duration_minutes: makeup.service_duration_minutes ?? '',
    travel_cost_per_km: makeup.travel_cost_per_km ?? '',
    base_city: makeup.base_city || '',
    premium_products_used: !!makeup.premium_products_used,
    travel_to_client: !!makeup.travel_to_client,
    hairstyling_included: !!makeup.hairstyling_included,
    draping_included: !!makeup.draping_included,
    trial_available: !!makeup.trial_available,
  };
}
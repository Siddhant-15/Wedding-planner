// src/constants/fieldDescriptions.js
// Centralized help text shown by the InfoTooltip "i" badge
// Use getFieldDescription(fieldKey, serviceType) to get the right text per category.

const COMMON = {
  service_name: 'Public name of your service as customers will see it (e.g., "Royal Wedding Palace").',
  description: 'Short pitch — what makes this service unique. 2–4 sentences works best.',
  tags: 'Searchable keywords (e.g., "outdoor", "luxury"). Press Enter to add each tag.',
  add_line1: 'Building / plot / flat number with street.',
  add_line2: 'Landmark, sector, or any extra address detail (optional).',
  area: 'Locality or neighbourhood (e.g., "Manish Nagar").',
  city: 'City where the service is delivered.',
  state: 'State / province.',
  country: 'Country.',
  pincode: 'Postal / ZIP code — used for distance & delivery filters.',
  latitude: 'Map latitude. Used to show your service on map results.',
  longitude: 'Map longitude. Used to show your service on map results.',

  category: 'The type of service you offer. This decides which extra fields you fill next.',
  variant_name: 'Package label customers will see (e.g., "Basic", "Premium", "Gold").',
  is_default: 'The default package shown first on your service card.',
  pricing_type: 'How this package is priced — per day, per hour, per head, or as a fixed package.',
  price: 'Price for this package in INR.',
  inclusions: 'What is included in this package — comma separated.',

  amenities: 'Facilities you offer (e.g., Parking, AC, Wi-Fi). Customers filter by these.',
  images: 'Upload high-quality photos. First image is used as the cover. Recommended 1200×800.',
};

const VENUE = {
  description: 'Describe the venue — ambience, indoor/outdoor, best events it hosts.',
  pricing_mode: 'Per Plate (with catering), Rental Only, or both.',
  veg_price: 'Per-plate veg price (used when pricing mode is per plate or both).',
  non_veg_price: 'Per-plate non-veg price (used when pricing mode is per plate or both).',
  rental_price: 'Daily rental price for the venue (used when pricing mode is rental or both).',
  capacity_min: 'Minimum guests the venue comfortably hosts.',
  capacity_max: 'Maximum guests the venue can host.',
  square_feet: 'Total usable area in square feet.',
  parking_capacity: 'Number of vehicles your parking can hold.',
  hall_type: 'Banquet hall, lawn, resort, hotel, farmhouse, rooftop etc.',
  indoor_outdoor: 'Whether the venue is indoor, outdoor, or both.',
  decoration_policy: 'Allowed / In-house only / Not allowed for outside decorators.',
  catering_policy: 'Allowed / In-house only / Not allowed for outside caterers.',
  alcohol_policy: 'Whether alcohol is allowed on the premises.',
  amenities: 'Venue facilities — Pool, Bridal room, AC hall, Generator, etc.',
};

const CATERING = {
  description: 'Describe your cuisines, signature dishes, and the kind of events you cater.',
  pricing_type: 'Usually "per head" for catering — total = price × guest count.',
  is_veg_only: 'Tick if you serve only vegetarian food.',
  veg_price: 'Per-head price for the veg menu in this package.',
  non_veg_price: 'Per-head price for the non-veg menu in this package.',
  inclusions: 'Items included — e.g., Welcome drinks, Buffet, Live counters, Dessert.',
  amenities: 'Service add-ons — Staff, Crockery, Live counters, Tasting session.',
  cuisine_types: 'Specify the cuisines you specialize in (e.g., North Indian, Continental).',
  special_diets_supported: 'List specific diets (e.g., Jain, Vegan, Gluten-free).',
  min_order: 'Minimum number of plates required to book your service.',
  max_order: 'Maximum number of plates you can cater for a single event.',
  service_styles_multi: 'E.g., Buffet, Live Counters, Plated Service.',
};

const PHOTOGRAPHY = {
  description: 'Tell couples about your style — candid, traditional, cinematic.',
  pricing_type: 'Usually "package" for photography — fixed deliverables for a fixed price.',
  price: 'Total package price in INR.',
  inclusions: 'E.g., 1000+ edited photos, 5-min teaser, album, drone shot.',
  experience_years: 'How many years you have been shooting weddings/events.',
  team_size: 'Number of photographers + videographers on shoot day.',
  amenities: 'Add-ons — Drone, Same-day edit, Pre-wedding shoot, Album.',
  photography_types: 'Types of shoots you do (e.g., Candid, Traditional, Drone).',
  editing_styles: 'Your post-processing style (e.g., Cinematic, Moody, Vibrant).',
  coverage_hours: 'Number of hours covered in your base package.',
  overtime_rate_per_hour: 'Extra charges per hour beyond the agreed coverage.',
  photo_delivery_count: 'Minimum number of edited photos delivered.',
  video_delivery_duration_minutes: 'Duration of the final cinematic video (in minutes).',
  album_pages: 'Number of pages in the included photo album.',
};

const DJ = {
  description: 'Style of music, languages, signature performances, equipment owned.',
  pricing_type: 'Per hour, per day, or fixed package.',
  price: 'Price for the chosen pricing type.',
  inclusions: 'Sound system, lights, MC, smoke effects, etc.',
  experience_years: 'Years of experience as a DJ.',
  team_size: 'DJ + assistants + technicians on event day.',
  amenities: 'Equipment offered — Speakers, LED wall, Smoke, MC.',
  genres_supported: 'Music genres you specialize in (e.g., Bollywood, EDM).',
  languages_supported: 'Languages for hosting or music selection.',
  equipment: 'Sound and lighting systems you bring along.',
  performance_duration_hours: 'Standard duration of your live performance.',
  setup_time_minutes: 'Minutes needed to install and check equipment before the event.',
};

const EVENT_MANAGEMENT = {
  description: 'Types of events you handle and your end-to-end planning process.',
  pricing_type: 'Per day or fixed package depending on the event scope.',
  price: 'Planning fee for this package.',
  inclusions: 'Vendor coordination, on-day execution, decor, RSVP, etc.',
  experience_years: 'Years running events.',
  team_size: 'Planners + on-ground crew assigned per event.',
  amenities: 'Services offered — Decor, Coordination, Logistics, RSVP.',
  event_types: 'Scale and types of events managed (e.g., Destination Weddings).',
  themes_supported: 'Specialized decor themes (e.g., Royal, Vintage).',
  services_offered: 'Core services handled by your team directly.',
};

const MAKEUP_ARTIST = {
  description: 'Your makeup style, products used (HD/airbrush), and bridal experience.',
  pricing_type: 'Per head, per day, or per package (e.g., Bridal package).',
  price: 'Price for this package.',
  inclusions: 'Trial session, hair styling, draping, touch-up kit, travel.',
  experience_years: 'Years as a professional makeup artist.',
  team_size: 'Artists + assistants on event day.',
  amenities: 'Add-ons — Hair styling, Draping, Trial, Travel kit.',
  makeup_types: 'Styles of makeup you perform (e.g., HD, Airbrush).',
  brands_used: 'List of premium or standard cosmetic brands used.',
  specialization: 'Your core expertise (e.g., Bridal, Editorial).',
  service_duration_minutes: 'Average time taken per client.',
  travel_cost_per_km: 'Travel charges for out-station or away-from-studio bookings.',
  base_city: 'Your primary operating city.',
};

const BY_TYPE = {
  venue: VENUE,
  catering: CATERING,
  photography: PHOTOGRAPHY,
  dj: DJ,
  event_management: EVENT_MANAGEMENT,
  makeup_artist: MAKEUP_ARTIST,
};

export const getFieldDescription = (fieldKey, serviceType) => {
  const typeMap = (serviceType && BY_TYPE[serviceType]) || {};
  return typeMap[fieldKey] || COMMON[fieldKey] || '';
};

export default getFieldDescription;

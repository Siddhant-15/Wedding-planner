// src/constants/serviceConstants.js
export const SERVICE_CATEGORIES = [
  { value: 'venue', label: 'Venue' },
  { value: 'catering', label: 'Catering' },
  { value: 'photography', label: 'Photography' },
  { value: 'dj', label: 'DJ' },
  { value: 'event_management', label: 'Event Management' },
  { value: 'makeup_artist', label: 'Makeup Artist' },
];

export const PRICING_TYPES = [
  { value: 'per_day', label: 'Per Day' },
  { value: 'per_hour', label: 'Per Hour' },
  { value: 'per_head', label: 'Per Head' },
  { value: 'package', label: 'Package' },
  { value: 'half_day', label: 'Half Day' },
];

export const VENUE_PRICING_MODES = [
  { value: 'per_plate', label: 'Per Plate (with Catering)' },
  { value: 'rental', label: 'Rental Only' },
  { value: 'both', label: 'Rental + Catering' },
];

export const HALL_TYPES = ['Banquet Hall', 'Lawn', 'Resort', 'Hotel', 'Farmhouse', 'Rooftop'];
export const INDOOR_OUTDOOR = ['Indoor', 'Outdoor', 'Both'];
export const POLICY_OPTIONS = ['allowed', 'in-house-only', 'not-allowed'];

export const FORM_STEPS = ['Basic Info', 'Packages', 'Details', 'Amenities & Images', 'Review'];

export const createEmptyVariant = (isDefault = false) => ({
  id: (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : String(Date.now() + Math.random()),
  variant_name: '',
  is_default: isDefault,
  pricing_type: '',
  pricing_mode: '',
  is_veg_only: false,
  veg_price: '',
  non_veg_price: '',
  rental_price: '',
  price: '',
  inclusions: '',
});

export const createEmptyForm = () => ({
  title: '',
  description: '',
  category: '',
  tags: [],
  address_line1: '',
  address_line2: '',
  area: '',
  city: '',
  state: '',
  country: 'India',
  pincode: '',
  geo_point: { lat: '', lon: '' },
  variants: [createEmptyVariant(true)],
  amenities: [],
  images: [],
});

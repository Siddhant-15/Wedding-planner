/**
 * Centralized service form validation.
 *
 * Supports two modes:
 *   - "draft"  : only reject objectively invalid values (malformed numbers, bad URLs, etc.)
 *   - "submit" : full business validation required before under_review
 *
 * Field paths use dot notation consistent with formData shape, e.g.:
 *   "title", "geo_point.lat", "variants.0.price", "variants.0.veg_price"
 */

import {
  SERVICE_CATEGORIES,
  PRICING_TYPES,
  VENUE_PRICING_MODES,
} from '../constants/serviceConstants';

// ── Limits (reuse / align with existing frontend + known backend) ──────────

export const LIMITS = {
  TITLE_MIN: 3,
  TITLE_MAX: 120,
  DESCRIPTION_MIN: 20,
  DESCRIPTION_MAX: 5000,
  MAX_IMAGES: 5,
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  SUPPORTED_IMAGE_TYPES: [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
  ],
  PINCODE_REGEX: /^[1-9][0-9]{5}$/,
};

const VALID_CATEGORIES = new Set(
  SERVICE_CATEGORIES.map((c) => c.value)
);

const VALID_PRICING_TYPES = new Set(
  PRICING_TYPES.map((p) => p.value)
);

const VALID_VENUE_MODES = new Set(
  VENUE_PRICING_MODES.map((m) => m.value)
);

// ── Helpers ────────────────────────────────────────────────────────────────

function isBlank(v) {
  return (
    v === null ||
    v === undefined ||
    (typeof v === 'string' && v.trim() === '')
  );
}

function toNumber(v) {
  if (v === '' || v === null || v === undefined) return null;

  if (typeof v === 'number') {
    return Number.isFinite(v) ? v : NaN;
  }

  const n = Number(String(v).trim());
  return Number.isFinite(n) ? n : NaN;
}

/**
 * Empty is OK for draft;
 * non-empty must be a valid finite number in range (optional).
 */
function validateOptionalNumber(
  value,
  { min, max, fieldLabel } = {}
) {
  if (isBlank(value)) return null;

  const n = toNumber(value);

  if (Number.isNaN(n)) {
    return `${fieldLabel || 'Value'} must be a number`;
  }

  if (min !== undefined && n < min) {
    return `${fieldLabel || 'Value'} must be at least ${min}`;
  }

  if (max !== undefined && n > max) {
    return `${fieldLabel || 'Value'} must be at most ${max}`;
  }

  return null;
}

/**
 * For submit: required positive price (> 0).
 */
function validateRequiredPositivePrice(value, label) {
  if (isBlank(value)) return `${label} is required`;

  const n = toNumber(value);

  if (Number.isNaN(n)) {
    return `${label} must be a number`;
  }

  if (n <= 0) {
    return `${label} must be greater than ₹0`;
  }

  return null;
}

function isValidUrl(str) {
  if (isBlank(str)) return true;

  try {
    const u = new URL(String(str).trim());
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

function countImages(formData) {
  const images = formData.images || [];

  // Existing server URLs (strings) + new File objects
  return images.length;
}

// Map field path → step index (for stepErrors + auto-navigate)
const FIELD_TO_STEP = {
  title: 0,
  description: 0,
  category: 1, // category lives on Packages step in current UI
  tags: 0,

  address_line1: 0,
  address_line2: 0,
  area: 0,
  city: 0,
  state: 0,
  country: 0,
  pincode: 0,

  'geo_point.lat': 0,
  'geo_point.lon': 0,

  variants: 1,
  amenities: 3,
  images: 3,
  media_links: 3,
};

function stepForPath(path) {
  if (!path) return 0;

  if (path.startsWith('variants.')) return 1;
  if (path.startsWith('geo_point.')) return 0;

  if (
    path.startsWith('venue_policies.') ||
    path.startsWith('min_capacity') ||
    path.startsWith('max_capacity') ||
    path.startsWith('square_feet') ||
    path.startsWith('parking_capacity') ||
    path.startsWith('venue_type') ||
    path.startsWith('venue_nature') ||
    path.startsWith('cuisine_') ||
    path.startsWith('special_diets') ||
    path.startsWith('service_styles') ||
    path.startsWith('min_order') ||
    path.startsWith('max_order') ||
    path.startsWith('genres_') ||
    path.startsWith('languages_') ||
    path.startsWith('equipment') ||
    path.startsWith('performance_') ||
    path.startsWith('setup_time') ||
    path.startsWith('photography_') ||
    path.startsWith('editing_') ||
    path.startsWith('coverage_') ||
    path.startsWith('overtime_') ||
    path.startsWith('team_size') ||
    path.startsWith('photo_delivery') ||
    path.startsWith('video_delivery') ||
    path.startsWith('album_') ||
    path.startsWith('event_types') ||
    path.startsWith('themes_') ||
    path.startsWith('services_offered') ||
    path.startsWith('experience_') ||
    path.startsWith('makeup_') ||
    path.startsWith('brands_') ||
    path.startsWith('specialization') ||
    path.startsWith('service_duration') ||
    path.startsWith('travel_') ||
    path.startsWith('base_city')
  ) {
    return 2;
  }

  if (
    path.startsWith('amenities') ||
    path.startsWith('images') ||
    path.startsWith('media_links')
  ) {
    return 3;
  }

  return FIELD_TO_STEP[path] ?? 0;
}

function buildStepErrors(errors) {
  const stepErrors = {
    0: 0,
    1: 0,
    2: 0,
    3: 0,
    4: 0,
  };

  Object.keys(errors).forEach((path) => {
    const s = stepForPath(path);
    stepErrors[s] = (stepErrors[s] || 0) + 1;
  });

  return stepErrors;
}

// ── Draft validation (permissive) ──────────────────────────────────────────

function validateDraft(formData) {
  const errors = {};

  // Geo: only if provided
  const lat = formData.geo_point?.lat;
  const lon = formData.geo_point?.lon;

  const latErr = validateOptionalNumber(lat, {
    min: -90,
    max: 90,
    fieldLabel: 'Latitude',
  });

  if (latErr) {
    errors['geo_point.lat'] = latErr;
  }

  const lonErr = validateOptionalNumber(lon, {
    min: -180,
    max: 180,
    fieldLabel: 'Longitude',
  });

  if (lonErr) {
    errors['geo_point.lon'] = lonErr;
  }

  // Pincode: if provided, must match Indian format
  if (!isBlank(formData.pincode)) {
    if (!LIMITS.PINCODE_REGEX.test(String(formData.pincode).trim())) {
      errors.pincode = 'Enter a valid 6-digit Indian pincode';
    }
  }

  // service_type is NOT NULL + PG enum.
  // Empty string → 500 on create.
  if (
    isBlank(formData.category) ||
    !VALID_CATEGORIES.has(formData.category)
  ) {
    errors.category = 'Please select a service category before saving';
  }

  // Variants: only reject malformed prices / invalid numbers
  (formData.variants || []).forEach((v, i) => {
    const prefix = `variants.${i}`;

    [
      'price',
      'veg_price',
      'non_veg_price',
      'rental_price',
      'price_with_video',
    ].forEach((key) => {
      const val = v[key];

      if (isBlank(val)) return;

      const n = toNumber(val);

      if (Number.isNaN(n)) {
        errors[`${prefix}.${key}`] = 'Must be a valid number';
      } else if (n < 0) {
        errors[`${prefix}.${key}`] = 'Cannot be negative';
      }
    });
  });

  // Category-specific numeric fields
  // (optional but must be valid if present)
  const numericFields = [
    'min_capacity',
    'max_capacity',
    'square_feet',
    'parking_capacity',
    'min_order',
    'max_order',
    'performance_duration_hours',
    'setup_time_minutes',
    'coverage_hours',
    'overtime_rate_per_hour',
    'team_size',
    'photo_delivery_count',
    'video_delivery_duration_minutes',
    'album_pages',
    'experience_years',
    'service_duration_minutes',
    'travel_cost_per_km',
  ];

  numericFields.forEach((f) => {
    const err = validateOptionalNumber(formData[f], {
      min: 0,
      fieldLabel: f.replace(/_/g, ' '),
    });

    if (err) {
      errors[f] = err;
    }
  });

  // Capacity relationship if both present
  if (
    !isBlank(formData.min_capacity) &&
    !isBlank(formData.max_capacity)
  ) {
    const minC = toNumber(formData.min_capacity);
    const maxC = toNumber(formData.max_capacity);

    if (
      !Number.isNaN(minC) &&
      !Number.isNaN(maxC) &&
      minC > maxC
    ) {
      errors.max_capacity = 'Max capacity must be ≥ min capacity';
    }
  }

  // Order relationship if both present
  if (
    !isBlank(formData.min_order) &&
    !isBlank(formData.max_order)
  ) {
    const minO = toNumber(formData.min_order);
    const maxO = toNumber(formData.max_order);

    if (
      !Number.isNaN(minO) &&
      !Number.isNaN(maxO) &&
      minO > maxO
    ) {
      errors.max_order =
        'Maximum order must be ≥ minimum order';
    }
  }

  // Images: type / size only for new File entries
  (formData.images || []).forEach((img, i) => {
    if (typeof img === 'string') return;

    const file = img?.file || img;

    if (!(file instanceof File) && !(file?.type)) return;

    if (
      file.type &&
      !LIMITS.SUPPORTED_IMAGE_TYPES.includes(file.type) &&
      !file.type.startsWith('image/')
    ) {
      errors[`images.${i}`] = 'Unsupported image format';
    }

    if (
      file.size != null &&
      file.size > LIMITS.MAX_FILE_SIZE
    ) {
      errors[`images.${i}`] = 'Image exceeds 5MB limit';
    }
  });

  if (countImages(formData) > LIMITS.MAX_IMAGES) {
    errors.images =
      `Maximum ${LIMITS.MAX_IMAGES} images allowed`;
  }

  // Media links: non-empty URLs must be valid
  (formData.media_links || []).forEach((link, i) => {
    if (link?.url && !isValidUrl(link.url)) {
      errors[`media_links.${i}.url`] = 'Invalid URL';
    }
  });

  return errors;
}

// ── Submit validation (strict) ─────────────────────────────────────────────

function validateSubmit(formData) {
  const errors = {
    ...validateDraft(formData),
  };

  // IMPORTANT:
  // Keep category at function scope because it is also used by
  // category-specific validation below the variants block.
  const category = formData.category;

  // ── Basic info ──

  const title = (formData.title || '').trim();

  if (!title) {
    errors.title = 'Service title is required';
  } else if (title.length < LIMITS.TITLE_MIN) {
    errors.title =
      `Title must be at least ${LIMITS.TITLE_MIN} characters`;
  } else if (title.length > LIMITS.TITLE_MAX) {
    errors.title =
      `Title must be at most ${LIMITS.TITLE_MAX} characters`;
  }

  const desc = (formData.description || '').trim();

  if (!desc) {
    errors.description = 'Description is required';
  } else if (desc.length < LIMITS.DESCRIPTION_MIN) {
    errors.description =
      `Description must be at least ${LIMITS.DESCRIPTION_MIN} characters`;
  } else if (desc.length > LIMITS.DESCRIPTION_MAX) {
    errors.description =
      `Description must be at most ${LIMITS.DESCRIPTION_MAX} characters`;
  }

  if (
    isBlank(formData.category) ||
    !VALID_CATEGORIES.has(formData.category)
  ) {
    errors.category = 'Please select a service category';
  }

  // ── Location ──

  if (isBlank(formData.address_line1)) {
    errors.address_line1 = 'Address line 1 is required';
  }

  if (isBlank(formData.city)) {
    errors.city = 'City is required';
  }

  if (isBlank(formData.state)) {
    errors.state = 'State is required';
  }

  if (isBlank(formData.country)) {
    errors.country = 'Country is required';
  }

  if (isBlank(formData.pincode)) {
    errors.pincode = 'Pincode is required';
  } else if (
    !LIMITS.PINCODE_REGEX.test(
      String(formData.pincode).trim()
    )
  ) {
    errors.pincode =
      'Enter a valid 6-digit Indian pincode';
  }

  // Latitude & longitude required for review
  const lat = formData.geo_point?.lat;
  const lon = formData.geo_point?.lon;

  if (isBlank(lat)) {
    errors['geo_point.lat'] = 'Latitude is required';
  } else {
    const n = toNumber(lat);

    if (
      Number.isNaN(n) ||
      n < -90 ||
      n > 90
    ) {
      errors['geo_point.lat'] =
        'Latitude must be a number between -90 and 90';
    }
  }

  if (isBlank(lon)) {
    errors['geo_point.lon'] = 'Longitude is required';
  } else {
    const n = toNumber(lon);

    if (
      Number.isNaN(n) ||
      n < -180 ||
      n > 180
    ) {
      errors['geo_point.lon'] =
        'Longitude must be a number between -180 and 180';
    }
  }

  // ── Packages ──

  const variants = formData.variants || [];

  if (variants.length === 0) {
    errors.variants =
      'At least one package is required';
  } else {
    const defaults = variants.filter(
      (v) => v.is_default
    );

    if (defaults.length === 0) {
      errors.variants =
        'Exactly one package must be marked as default';
    } else if (defaults.length > 1) {
      errors.variants =
        'Only one package can be the default';
    }

    const isCatering = category === 'catering';
    const isVenue = category === 'venue';

    variants.forEach((v, i) => {
      const prefix = `variants.${i}`;
      const name = (v.variant_name || '').trim();

      if (!name) {
        errors[`${prefix}.variant_name`] =
          'Package name is required';
      }

      if (isVenue) {
        if (
          isBlank(v.pricing_mode) ||
          !VALID_VENUE_MODES.has(v.pricing_mode)
        ) {
          errors[`${prefix}.pricing_mode`] =
            'Pricing mode is required';
        } else {
          const mode = v.pricing_mode;
          const vegOnly = v.is_veg_only === true;

          if (
            mode === 'per_plate' ||
            mode === 'both'
          ) {
            const e = validateRequiredPositivePrice(
              v.veg_price,
              'Veg price'
            );

            if (e) {
              errors[`${prefix}.veg_price`] = e;
            }

            if (!vegOnly) {
              const e2 =
                validateRequiredPositivePrice(
                  v.non_veg_price,
                  'Non-veg price'
                );

              if (e2) {
                errors[`${prefix}.non_veg_price`] = e2;
              }
            }
          }

          if (
            mode === 'rental' ||
            mode === 'both'
          ) {
            const e =
              validateRequiredPositivePrice(
                v.rental_price,
                'Rental price'
              );

            if (e) {
              errors[`${prefix}.rental_price`] = e;
            }
          }
        }
      } else if (isCatering) {
        const e =
          validateRequiredPositivePrice(
            v.veg_price,
            'Veg price'
          );

        if (e) {
          errors[`${prefix}.veg_price`] = e;
        }

        if (v.is_veg_only !== true) {
          const e2 =
            validateRequiredPositivePrice(
              v.non_veg_price,
              'Non-veg price'
            );

          if (e2) {
            errors[`${prefix}.non_veg_price`] = e2;
          }
        }
      } else {
        // photography, dj, event_management, makeup_artist

        if (
          isBlank(v.pricing_type) ||
          !VALID_PRICING_TYPES.has(v.pricing_type)
        ) {
          errors[`${prefix}.pricing_type`] =
            'Pricing type is required';
        }

        const e =
          validateRequiredPositivePrice(
            v.price,
            'Price'
          );

        if (e) {
          errors[`${prefix}.price`] = e;
        }
      }
    });
  }

  // ── Category-specific required fields (submit only) ──

  if (category === 'venue') {
    if (isBlank(formData.min_capacity)) {
      errors.min_capacity =
        'Min capacity is required';
    }

    if (isBlank(formData.max_capacity)) {
      errors.max_capacity =
        'Max capacity is required';
    }

    if (isBlank(formData.venue_type)) {
      errors.venue_type =
        'Venue type is required';
    }

    if (isBlank(formData.venue_nature)) {
      errors.venue_nature =
        'Indoor / Outdoor is required';
    }

    if (isBlank(formData.square_feet)) {
      errors.square_feet =
        'Square feet is required';
    }
  } else if (category === 'catering') {
    if (!(formData.cuisine_types || []).length) {
      errors.cuisine_types =
        'Add at least one cuisine type';
    }

    if (isBlank(formData.min_order)) {
      errors.min_order =
        'Minimum order is required';
    }
  } else if (category === 'dj') {
    if (!(formData.genres_supported || []).length) {
      errors.genres_supported =
        'Add at least one genre';
    }

    if (
      isBlank(
        formData.performance_duration_hours
      )
    ) {
      errors.performance_duration_hours =
        'Performance duration is required';
    }
  } else if (category === 'photography') {
    if (!(formData.photography_types || []).length) {
      errors.photography_types =
        'Add at least one photography type';
    }

    if (isBlank(formData.coverage_hours)) {
      errors.coverage_hours =
        'Coverage hours is required';
    }
  } else if (category === 'event_management') {
    if (!(formData.event_types || []).length) {
      errors.event_types =
        'Add at least one event type';
    }

    if (!(formData.services_offered || []).length) {
      errors.services_offered =
        'Add at least one service offered';
    }
  } else if (category === 'makeup_artist') {
    if (!(formData.makeup_types || []).length) {
      errors.makeup_types =
        'Add at least one makeup type';
    }
  }

  // ── Category-specific soft checks ──
  // Relationships are already handled by draft validation.
  // No additional required fields are invented here.

  // ── Media ──
  // Cover image required before sending to admin review.
  const imageCount = countImages(formData);

if (imageCount < 1) {
  errors.images =
    'At least one image is required';
}

if (imageCount > LIMITS.MAX_IMAGES) {
  errors.images =
    `Maximum ${LIMITS.MAX_IMAGES} images allowed`;
}

const coverCount = (formData.images || []).filter(
  (img) =>
    typeof img !== 'string' &&
    img?.is_cover === true
).length;

if (imageCount > 0 && coverCount === 0) {
  errors.images =
    'At least one image must be selected as a cover image';
}

if (coverCount > LIMITS.MAX_IMAGES) {
  errors.images =
    `Maximum ${LIMITS.MAX_IMAGES} cover images allowed`;
}

  return errors;
}

/**
 * Central validation entry point.
 *
 * @param {object} formData
 * @param {{ mode: 'draft' | 'submit' }} options
 * @returns {{
 *   isValid: boolean,
 *   errors: Record<string,string>,
 *   stepErrors: Record<number,number>,
 *   firstErrorPath: string|null,
 *   firstErrorStep: number|null
 * }}
 */
export function validateService(
  formData,
  { mode = 'submit' } = {}
) {
  const errors =
    mode === 'draft'
      ? validateDraft(formData || {})
      : validateSubmit(formData || {});

  const paths = Object.keys(errors);
  const isValid = paths.length === 0;

  const stepErrors = buildStepErrors(errors);

  const firstErrorPath =
    paths.length ? paths[0] : null;

  const firstErrorStep =
    firstErrorPath != null
      ? stepForPath(firstErrorPath)
      : null;

  return {
    isValid,
    errors,
    stepErrors,
    firstErrorPath,
    firstErrorStep,
  };
}

export { stepForPath };

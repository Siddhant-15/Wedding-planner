import React, { useMemo } from 'react';
import { SERVICE_CATEGORIES } from '../../../constants/serviceConstants';
import { validateService } from '../../../utils/serviceValidation';
import styles from '../../../styles/StepReview.module.css';

const Row = ({ label, value, missing, onFix, step }) => (
  <div className={`${styles.row} ${missing ? styles.rowMissing : ''}`}>
    <span className={styles.k}>{label}</span>
    <span className={styles.v}>
      {missing ? (
        <button
          type="button"
          className={styles.missingBtn}
          onClick={() => onFix && onFix(step)}
        >
          Missing
        </button>
      ) : value !== undefined && value !== null && value !== '' ? (
        value
      ) : (
        '—'
      )}
    </span>
  </div>
);

const Section = ({ title, children }) => (
  <div className={styles.card}>
    <div className={styles.cardHead}>
      <h4>{title}</h4>
    </div>
    <div className={styles.cardBody}>{children}</div>
  </div>
);

const formatBoolean = (value) => (value ? 'Yes' : 'No');

const StepReview = ({ formData, goToStep, errors = {}, submitAttempted = false }) => {
  const category =
    SERVICE_CATEGORIES.find((c) => c.value === formData.category)?.label || '—';

  const location = [
    formData.address_line1,
    formData.address_line2,
    formData.area,
    formData.city,
    formData.state,
    formData.country,
    formData.pincode,
  ]
    .filter(Boolean)
    .join(', ');

  const mediaLinks = formData.media_links || [];

  // Consume centralized validation for missing required fields on review
  const validation = useMemo(
    () => validateService(formData, { mode: 'submit' }),
    [formData]
  );

  const missingCount = Object.keys(validation.errors).length;
  const isMissing = (path) => !!(errors[path] || (submitAttempted && validation.errors[path]));

  const go = (step) => {
    if (typeof goToStep === 'function') goToStep(step);
  };

  return (
    <div className={styles.wrap}>
      {missingCount > 0 && (
        <div className={styles.summaryBanner} role="status">
          <strong>
            {missingCount} required field{missingCount === 1 ? ' is' : 's are'} missing or
            invalid.
          </strong>
          <span> Click any “Missing” label to jump to that step.</span>
        </div>
      )}

      {/* ================= BASIC INFO ================= */}
      <Section title="Basic Information">
        <Row
          label="Service Title"
          value={formData.title}
          missing={isMissing('title')}
          onFix={go}
          step={0}
        />
        <Row
          label="Category"
          value={category}
          missing={isMissing('category')}
          onFix={go}
          step={1}
        />
        <Row
          label="Description"
          value={formData.description}
          missing={isMissing('description')}
          onFix={go}
          step={0}
        />
        <Row label="Tags" value={formData.tags?.join(', ')} />
        <Row
          label="Location"
          value={location}
          missing={
            isMissing('address_line1') ||
            isMissing('city') ||
            isMissing('state') ||
            isMissing('country') ||
            isMissing('pincode')
          }
          onFix={go}
          step={0}
        />
        <Row label="Latitude" value={formData.geo_point?.lat} />
        <Row label="Longitude" value={formData.geo_point?.lon} />
      </Section>

      {/* ================= PACKAGES ================= */}
      <Section title="Packages & Pricing">
        {formData.variants?.length > 0 ? (
          formData.variants.map((v, index) => (
            <div key={v.id || index} className={styles.variant}>
              <h5>
                {v.variant_name || 'Untitled Package'}
                {v.is_default && ' ⭐'}
              </h5>
              <div className={styles.variantRows}>
                <Row
                  label="Package Name"
                  value={v.variant_name}
                  missing={isMissing(`variants.${index}.variant_name`)}
                  onFix={go}
                  step={1}
                />
                <Row label="Pricing Type" value={v.pricing_type} />
                {v.pricing_mode && <Row label="Pricing Mode" value={v.pricing_mode} />}
                {v.is_veg_only && <Row label="Veg Only" value="Yes" />}
                {v.veg_price !== undefined && v.veg_price !== '' && (
                  <Row label="Veg Price" value={`₹${v.veg_price}`} />
                )}
                {v.non_veg_price !== undefined && v.non_veg_price !== '' && (
                  <Row label="Non-Veg Price" value={`₹${v.non_veg_price}`} />
                )}
                {v.rental_price !== undefined && v.rental_price !== '' && (
                  <Row label="Rental Price" value={`₹${v.rental_price}`} />
                )}
                {v.price !== undefined && v.price !== '' && (
                  <Row label="Base Price" value={`₹${v.price}`} />
                )}
                {v.price_with_video && (
                  <Row label="Price with Video" value={`₹${v.price_with_video}`} />
                )}
                <Row
                  label="Inclusions"
                  value={
                    Array.isArray(v.inclusions) ? v.inclusions.join(', ') : v.inclusions
                  }
                />
              </div>
            </div>
          ))
        ) : (
          <p className={styles.empty}>
            No packages added.{' '}
            <button type="button" className={styles.missingBtn} onClick={() => go(1)}>
              Add packages
            </button>
          </p>
        )}
        {(isMissing('variants') ||
          Object.keys(validation.errors).some((k) => k.startsWith('variants.'))) && (
          <p className={styles.errorHint}>
            One or more packages have pricing or default issues.{' '}
            <button type="button" className={styles.missingBtn} onClick={() => go(1)}>
              Fix packages
            </button>
          </p>
        )}
      </Section>

      {/* ================= CATEGORY DETAILS ================= */}
      <Section title="Category Details">
        {formData.category === 'venue' && (
          <>
            <Row label="Min Capacity" value={formData.min_capacity} />
            <Row label="Max Capacity" value={formData.max_capacity} />
            <Row label="Square Feet" value={formData.square_feet} />
            <Row label="Parking Capacity" value={formData.parking_capacity} />
            <Row label="Venue Type" value={formData.venue_type} />
            <Row label="Venue Nature" value={formData.venue_nature} />
            <Row
              label="Decoration Policy"
              value={formData.venue_policies?.decoration_policy}
            />
            <Row
              label="Catering Policy"
              value={formData.venue_policies?.catering_policy}
            />
            <Row
              label="Alcohol Policy"
              value={formData.venue_policies?.alcohol_policy}
            />
            <Row
              label="Other Rules"
              value={formData.venue_policies?.other_policies
                ?.map((p) => `${p.title}: ${p.description}`)
                .join(' | ')}
            />
          </>
        )}

        {formData.category === 'catering' && (
          <>
            <Row label="Cuisine Types" value={formData.cuisine_types?.join(', ')} />
            <Row
              label="Special Diets"
              value={formData.special_diets_supported?.join(', ')}
            />
            <Row
              label="Service Styles"
              value={formData.service_styles_multi?.join(', ')}
            />
            <Row label="Minimum Order" value={formData.min_order} />
            <Row label="Maximum Order" value={formData.max_order} />
            <Row label="Staff Included" value={formatBoolean(formData.staff_included)} />
            <Row
              label="Crockery Included"
              value={formatBoolean(formData.crockery_cutlery_included)}
            />
            <Row
              label="Tasting Available"
              value={formatBoolean(formData.tasting_available)}
            />
          </>
        )}

        {formData.category === 'dj' && (
          <>
            <Row label="Genres" value={formData.genres_supported?.join(', ')} />
            <Row label="Languages" value={formData.languages_supported?.join(', ')} />
            <Row label="Equipment" value={formData.equipment?.join(', ')} />
            <Row
              label="Performance Duration"
              value={
                formData.performance_duration_hours &&
                `${formData.performance_duration_hours} hrs`
              }
            />
            <Row
              label="Setup Time"
              value={
                formData.setup_time_minutes && `${formData.setup_time_minutes} mins`
              }
            />
            <Row
              label="Sound System"
              value={formatBoolean(formData.sound_system_included)}
            />
            <Row label="Lighting" value={formatBoolean(formData.lighting_included)} />
            <Row label="MC / Host" value={formatBoolean(formData.mc_host_available)} />
          </>
        )}

        {formData.category === 'photography' && (
          <>
            <Row
              label="Photography Types"
              value={formData.photography_types?.join(', ')}
            />
            <Row label="Editing Styles" value={formData.editing_styles?.join(', ')} />
            <Row label="Coverage Hours" value={formData.coverage_hours} />
            <Row
              label="Overtime Rate"
              value={
                formData.overtime_rate_per_hour &&
                `₹${formData.overtime_rate_per_hour}`
              }
            />
            <Row label="Team Size" value={formData.team_size} />
            <Row label="Photos Delivered" value={formData.photo_delivery_count} />
            <Row
              label="Video Duration"
              value={formData.video_delivery_duration_minutes}
            />
            <Row label="Album Pages" value={formData.album_pages} />
            <Row
              label="Videography"
              value={formatBoolean(formData.videography_available)}
            />
            <Row
              label="Drone Shoot"
              value={formatBoolean(formData.drone_shoot_available)}
            />
            <Row
              label="Edited Photos"
              value={formatBoolean(formData.edited_photos_included)}
            />
            <Row
              label="RAW Files"
              value={formatBoolean(formData.raw_photos_provided)}
            />
            <Row label="Album Included" value={formatBoolean(formData.album_included)} />
            <Row
              label="Second Shooter"
              value={formatBoolean(formData.second_shooter_included)}
            />
          </>
        )}

        {formData.category === 'event_management' && (
          <>
            <Row label="Event Types" value={formData.event_types?.join(', ')} />
            <Row label="Themes Supported" value={formData.themes_supported?.join(', ')} />
            <Row label="Services Offered" value={formData.services_offered?.join(', ')} />
            <Row label="Team Size" value={formData.team_size} />
            <Row
              label="Experience"
              value={
                formData.experience_years && `${formData.experience_years} years`
              }
            />
            <Row
              label="Decoration Included"
              value={formatBoolean(formData.decoration_included)}
            />
            <Row
              label="Catering Management"
              value={formatBoolean(formData.catering_management)}
            />
            <Row
              label="Entertainment Management"
              value={formatBoolean(formData.entertainment_management)}
            />
          </>
        )}

        {formData.category === 'makeup_artist' && (
          <>
            <Row label="Makeup Types" value={formData.makeup_types?.join(', ')} />
            <Row label="Brands Used" value={formData.brands_used?.join(', ')} />
            <Row label="Specialization" value={formData.specialization?.join(', ')} />
            <Row
              label="Service Duration"
              value={
                formData.service_duration_minutes &&
                `${formData.service_duration_minutes} mins`
              }
            />
            <Row
              label="Travel Cost / Km"
              value={
                formData.travel_cost_per_km && `₹${formData.travel_cost_per_km}`
              }
            />
            <Row label="Base City" value={formData.base_city} />
            <Row
              label="Premium Products"
              value={formatBoolean(formData.premium_products_used)}
            />
            <Row
              label="Travel To Client"
              value={formatBoolean(formData.travel_to_client)}
            />
            <Row
              label="Hairstyling"
              value={formatBoolean(formData.hairstyling_included)}
            />
            <Row label="Draping" value={formatBoolean(formData.draping_included)} />
            <Row
              label="Trial Available"
              value={formatBoolean(formData.trial_available)}
            />
          </>
        )}
      </Section>

      {/* ================= MEDIA ================= */}
      <Section title="Amenities & Media">
        <Row label="Amenities" value={formData.amenities?.join(', ')} />
        <Row
          label="Uploaded Images"
          value={`${formData.images?.length || 0} image(s)`}
        />
        <Row
          label="External Media Links"
          value={
            mediaLinks.length > 0 ? `${mediaLinks.length} link(s) added` : '—'
          }
        />
        {mediaLinks.length > 0 && (
          <div className={styles.mediaList}>
            {mediaLinks.map((item) => (
              <div key={item.id} className={styles.mediaItem}>
                <strong>{item.type}:</strong>{' '}
                <a href={item.url} target="_blank" rel="noreferrer">
                  {item.url}
                </a>
              </div>
            ))}
          </div>
        )}
      </Section>
    </div>
  );
};

export default StepReview;
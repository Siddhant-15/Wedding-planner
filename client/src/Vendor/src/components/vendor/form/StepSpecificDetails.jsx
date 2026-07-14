import React from 'react';
import FieldLabel from '../../Common/FieldLabel';
import TagInput from './TagInput';
import { getFieldDescription } from '../../../constants/fieldDescriptions';
import { HALL_TYPES, INDOOR_OUTDOOR, POLICY_OPTIONS } from '../../../constants/serviceConstants';
import styles from '../../../styles/FormStep.module.css';

const StepSpecificDetails = ({ formData, updateField }) => {
  const t = (k) => getFieldDescription(k, formData.category);

  // helper for nested updates
  const updateVenuePolicy = (key, value) => {
    updateField("venue_policies", {
      ...(formData.venue_policies || {}),
      [key]: value,
    });
  };

  if (!formData.category) {
    return <p className={styles.empty}>Please select a service category first.</p>;
  }

  // ================= VENUE =================
  if (formData.category === 'venue') {
    return (
      <div className={styles.step}>
        <div className={styles.grid2}>

          <div className={styles.field}>
            <FieldLabel tooltip={t('min_capacity')}>Min capacity</FieldLabel>
            <input
              type="number"
              className={styles.input}
              value={formData.min_capacity || ''}
              onChange={(e) => updateField('min_capacity', e.target.value)}
            />
          </div>

          <div className={styles.field}>
            <FieldLabel tooltip={t('max_capacity')}>Max capacity</FieldLabel>
            <input
              type="number"
              className={styles.input}
              value={formData.max_capacity || ''}
              onChange={(e) => updateField('max_capacity', e.target.value)}
            />
          </div>

          <div className={styles.field}>
            <FieldLabel tooltip={t('square_feet')}>Square feet</FieldLabel>
            <input
              type="number"
              className={styles.input}
              value={formData.square_feet || ''}
              onChange={(e) => updateField('square_feet', e.target.value)}
            />
          </div>

          <div className={styles.field}>
            <FieldLabel tooltip={t('parking_capacity')}>Parking capacity</FieldLabel>
            <input
              type="number"
              className={styles.input}
              value={formData.parking_capacity || ''}
              onChange={(e) => updateField('parking_capacity', e.target.value)}
            />
          </div>

          <div className={styles.field}>
            <FieldLabel tooltip={t('venue_type')}>Venue type</FieldLabel>
            <select
              className={styles.select}
              value={formData.venue_type || ''}
              onChange={(e) => updateField('venue_type', e.target.value)}
            >
              <option value="">Select</option>
              {HALL_TYPES.map((h) => (
                <option key={h} value={h}>{h}</option>
              ))}
            </select>
          </div>

          <div className={styles.field}>
            <FieldLabel tooltip={t('venue_nature')}>Indoor / Outdoor</FieldLabel>
            <select
              className={styles.select}
              value={formData.venue_nature || ''}
              onChange={(e) => updateField('venue_nature', e.target.value)}
            >
              <option value="">Select</option>
              {INDOOR_OUTDOOR.map((h) => (
                <option key={h} value={h}>{h}</option>
              ))}
            </select>
          </div>
        </div>

        {/* POLICIES */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Policies</h3>

          <div className={styles.grid3}>
            <div className={styles.field}>
              <FieldLabel tooltip={t('decoration_policy')}>Decoration</FieldLabel>
              <select
                className={styles.select}
                value={formData.venue_policies?.decoration_policy || ''}
                onChange={(e) => updateVenuePolicy('decoration_policy', e.target.value)}
              >
                <option value="">Select</option>
                {POLICY_OPTIONS.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <div className={styles.field}>
              <FieldLabel tooltip={t('catering_policy')}>Catering</FieldLabel>
              <select
                className={styles.select}
                value={formData.venue_policies?.catering_policy || ''}
                onChange={(e) => updateVenuePolicy('catering_policy', e.target.value)}
              >
                <option value="">Select</option>
                {POLICY_OPTIONS.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <div className={styles.field}>
              <FieldLabel tooltip={t('alcohol_policy')}>Alcohol</FieldLabel>
              <select
                className={styles.select}
                value={formData.venue_policies?.alcohol_policy || ''}
                onChange={(e) => updateVenuePolicy('alcohol_policy', e.target.value)}
              >
                <option value="">Select</option>
                {POLICY_OPTIONS.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            {/* OTHER POLICIES */}
            <div className={styles.section} style={{ gridColumn: '1 / -1' }}>
              <FieldLabel tooltip="Add custom rules like music timing, restrictions, etc.">
                Other Policies / Rules
              </FieldLabel>

              {(formData.venue_policies?.other_policies || []).map((rule, index) => (
                <div key={index} style={{ display: 'flex', gap: 12, marginBottom: 8, alignItems: 'center' }}>

                  <input
                    type="text"
                    placeholder="Title (e.g., Music)"
                    className={styles.input}
                    value={rule.title || ''}
                    onChange={(e) => {
                      const updated = [...(formData.venue_policies?.other_policies || [])];
                      updated[index] = { ...updated[index], title: e.target.value };
                      updateVenuePolicy("other_policies", updated);
                    }}
                  />

                  <input
                    type="text"
                    placeholder="Description (e.g., Not allowed after 10pm)"
                    className={styles.input}
                    value={rule.description || ''}
                    onChange={(e) => {
                      const updated = [...(formData.venue_policies?.other_policies || [])];
                      updated[index] = { ...updated[index], description: e.target.value };
                      updateVenuePolicy("other_policies", updated);
                    }}
                  />

                  <button
                    type="button"
                    style={{ background: 'none', border: 'none', color: '#ff4d4f', cursor: 'pointer', outline: 'none' }}
                    onClick={() => {
                      const updated = (formData.venue_policies?.other_policies || []).filter((_, i) => i !== index);
                      updateVenuePolicy("other_policies", updated);
                    }}
                  >
                    ✕
                  </button>
                </div>
              ))}

              <button
                type="button"
                className={styles.btn}
                style={{ marginTop: 8 }}
                onClick={() => {
                  const updated = [
                    ...(formData.venue_policies?.other_policies || []),
                    { title: '', description: '' }
                  ];
                  updateVenuePolicy("other_policies", updated);
                }}
              >
                + Add Rule
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ================= CATERING =================
  if (formData.category === 'catering') {
    return (
      <div className={styles.grid2}>

        <div className={styles.field}>
          <FieldLabel tooltip={t('cuisine_types')}>Cuisine Types</FieldLabel>
          <TagInput
            values={formData.cuisine_types || []}
            onChange={(v) => updateField('cuisine_types', v)}
            placeholder="e.g., Indian, Chinese, Continental"
          />
        </div>

        <div className={styles.field}>
          <FieldLabel tooltip={t('special_diets_supported')}>Special Diets Supported</FieldLabel>
          <TagInput
            values={formData.special_diets_supported || []}
            onChange={(v) => updateField('special_diets_supported', v)}
            placeholder="e.g., Jain, Vegan, Gluten Free"
          />
        </div>

        <div className={styles.field}>
          <FieldLabel tooltip={t('service_styles_multi')}>Service Styles</FieldLabel>
          <TagInput
            values={formData.service_styles_multi || []}
            onChange={(v) => updateField('service_styles_multi', v)}
            placeholder="e.g., Buffet, Live Counters"
          />
        </div>

        <div className={styles.field}>
          <FieldLabel tooltip={t('min_order')}>Minimum Order</FieldLabel>
          <input
            type="number"
            className={styles.input}
            value={formData.min_order || ''}
            onChange={(e) => updateField('min_order', e.target.value)}
          />
        </div>

        <div className={styles.field}>
          <FieldLabel tooltip={t('max_order')}>Maximum Order</FieldLabel>
          <input
            type="number"
            className={styles.input}
            value={formData.max_order || ''}
            onChange={(e) => updateField('max_order', e.target.value)}
          />
        </div>

        <div className={styles.field} style={{ gridColumn: '1 / -1', display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14 }}>
            <input
              type="checkbox"
              checked={!!formData.staff_included}
              onChange={(e) => updateField('staff_included', e.target.checked)}
            />
            Staff Included
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14 }}>
            <input
              type="checkbox"
              checked={!!formData.crockery_cutlery_included}
              onChange={(e) => updateField('crockery_cutlery_included', e.target.checked)}
            />
            Crockery & Cutlery Included
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14 }}>
            <input
              type="checkbox"
              checked={!!formData.tasting_available}
              onChange={(e) => updateField('tasting_available', e.target.checked)}
            />
            Tasting Available
          </label>
        </div>

      </div>
    );
  }

  // ================= DJ =================
  if (formData.category === 'dj') {
    return (
      <div className={styles.grid2}>
        <div className={styles.field}>
          <FieldLabel tooltip={t('genres_supported')}>Genres Supported</FieldLabel>
          <TagInput
            values={formData.genres_supported || []}
            onChange={(v) => updateField('genres_supported', v)}
            placeholder="e.g., Bollywood, EDM, Punjabi"
          />
        </div>

        <div className={styles.field}>
          <FieldLabel tooltip={t('languages_supported')}>Languages Supported</FieldLabel>
          <TagInput
            values={formData.languages_supported || []}
            onChange={(v) => updateField('languages_supported', v)}
            placeholder="e.g., English, Hindi"
          />
        </div>

        <div className={styles.field}>
          <FieldLabel tooltip={t('equipment')}>Equipment Provided</FieldLabel>
          <TagInput
            values={formData.equipment || []}
            onChange={(v) => updateField('equipment', v)}
            placeholder="e.g., Turntables, Speakers"
          />
        </div>

        <div className={styles.field}>
          <FieldLabel tooltip={t('performance_duration_hours')}>Performance Duration (Hours)</FieldLabel>
          <input
            type="number"
            className={styles.input}
            value={formData.performance_duration_hours || ''}
            onChange={(e) => updateField('performance_duration_hours', e.target.value)}
          />
        </div>

        <div className={styles.field}>
          <FieldLabel tooltip={t('setup_time_minutes')}>Setup Time (minutes)</FieldLabel>
          <input
            type="number"
            className={styles.input}
            value={formData.setup_time_minutes || ''}
            onChange={(e) => updateField('setup_time_minutes', e.target.value)}
          />
        </div>

        <div className={styles.field} style={{ gridColumn: '1 / -1', display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14 }}>
            <input
              type="checkbox"
              checked={!!formData.sound_system_included}
              onChange={(e) => updateField('sound_system_included', e.target.checked)}
            />
            Sound System Included
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14 }}>
            <input
              type="checkbox"
              checked={!!formData.lighting_included}
              onChange={(e) => updateField('lighting_included', e.target.checked)}
            />
            Lighting Included
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14 }}>
            <input
              type="checkbox"
              checked={!!formData.mc_host_available}
              onChange={(e) => updateField('mc_host_available', e.target.checked)}
            />
            MC/Host Available
          </label>
        </div>
      </div>
    );
  }

  // ================= PHOTOGRAPHY =================
  if (formData.category === 'photography') {
    return (
      <div className={styles.grid2}>
        <div className={styles.field}>
          <FieldLabel tooltip={t('photography_types')}>Photography Types</FieldLabel>
          <TagInput
            values={formData.photography_types || []}
            onChange={(v) => updateField('photography_types', v)}
            placeholder="e.g., Wedding, Pre-Wedding, Candid"
          />
        </div>

        <div className={styles.field}>
          <FieldLabel tooltip={t('editing_styles')}>Editing Styles</FieldLabel>
          <TagInput
            values={formData.editing_styles || []}
            onChange={(v) => updateField('editing_styles', v)}
            placeholder="e.g., Cinematic, Traditional"
          />
        </div>

        <div className={styles.field}>
          <FieldLabel tooltip={t('coverage_hours')}>Coverage Hours</FieldLabel>
          <input
            type="number"
            className={styles.input}
            value={formData.coverage_hours || ''}
            onChange={(e) => updateField('coverage_hours', e.target.value)}
          />
        </div>

        <div className={styles.field}>
          <FieldLabel tooltip={t('overtime_rate_per_hour')}>Overtime Rate per Hour (₹)</FieldLabel>
          <input
            type="number"
            className={styles.input}
            value={formData.overtime_rate_per_hour || ''}
            onChange={(e) => updateField('overtime_rate_per_hour', e.target.value)}
          />
        </div>

        <div className={styles.field}>
          <FieldLabel tooltip={t('team_size')}>Team Size</FieldLabel>
          <input
            type="number"
            className={styles.input}
            value={formData.team_size || ''}
            onChange={(e) => updateField('team_size', e.target.value)}
          />
        </div>

        <div className={styles.field}>
          <FieldLabel tooltip={t('photo_delivery_count')}>Photos Delivered (Count)</FieldLabel>
          <input
            type="number"
            className={styles.input}
            value={formData.photo_delivery_count || ''}
            onChange={(e) => updateField('photo_delivery_count', e.target.value)}
          />
        </div>

        {formData.videography_available && (
          <div className={styles.field}>
            <FieldLabel tooltip={t('video_delivery_duration_minutes')}>Video Duration (Minutes)</FieldLabel>
            <input
              type="number"
              className={styles.input}
              value={formData.video_delivery_duration_minutes || ''}
              onChange={(e) => updateField('video_delivery_duration_minutes', e.target.value)}
            />
          </div>
        )}

        {formData.album_included && (
          <div className={styles.field}>
            <FieldLabel tooltip={t('album_pages')}>Album Pages</FieldLabel>
            <input
              type="number"
              className={styles.input}
              value={formData.album_pages || ''}
              onChange={(e) => updateField('album_pages', e.target.value)}
            />
          </div>
        )}

        <div className={styles.field} style={{ gridColumn: '1 / -1', display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14 }}>
            <input type="checkbox" checked={!!formData.second_shooter_included} onChange={(e) => updateField('second_shooter_included', e.target.checked)} />
            Second Shooter
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14 }}>
            <input type="checkbox" checked={!!formData.videography_available} onChange={(e) => updateField('videography_available', e.target.checked)} />
            Videography Included
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14 }}>
            <input type="checkbox" checked={!!formData.drone_shoot_available} onChange={(e) => updateField('drone_shoot_available', e.target.checked)} />
            Drone Shoot
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14 }}>
            <input type="checkbox" checked={!!formData.edited_photos_included} onChange={(e) => updateField('edited_photos_included', e.target.checked)} />
            Edited Photos
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14 }}>
            <input type="checkbox" checked={!!formData.raw_photos_provided} onChange={(e) => updateField('raw_photos_provided', e.target.checked)} />
            RAW Files Provided
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14 }}>
            <input type="checkbox" checked={!!formData.album_included} onChange={(e) => updateField('album_included', e.target.checked)} />
            Album Included
          </label>
        </div>
      </div>
    );
  }

  // ================= EVENT MANAGEMENT =================
  if (formData.category === 'event_management') {
    return (
      <div className={styles.grid2}>
        <div className={styles.field}>
          <FieldLabel tooltip={t('event_types')}>Event Types</FieldLabel>
          <TagInput
            values={formData.event_types || []}
            onChange={(v) => updateField('event_types', v)}
            placeholder="e.g., Wedding, Corporate"
          />
        </div>

        <div className={styles.field}>
          <FieldLabel tooltip={t('themes_supported')}>Themes Supported</FieldLabel>
          <TagInput
            values={formData.themes_supported || []}
            onChange={(v) => updateField('themes_supported', v)}
            placeholder="e.g., Royal, Vintage"
          />
        </div>

        <div className={styles.field}>
          <FieldLabel tooltip={t('services_offered')}>Services Offered</FieldLabel>
          <TagInput
            values={formData.services_offered || []}
            onChange={(v) => updateField('services_offered', v)}
            placeholder="e.g., Decor, Planning"
          />
        </div>

        <div className={styles.field}>
          <FieldLabel tooltip={t('team_size')}>Team Size</FieldLabel>
          <input
            type="number"
            className={styles.input}
            value={formData.team_size || ''}
            onChange={(e) => updateField('team_size', e.target.value)}
          />
        </div>

        <div className={styles.field}>
          <FieldLabel tooltip={t('experience_years')}>Experience (Years)</FieldLabel>
          <input
            type="number"
            className={styles.input}
            value={formData.experience_years || ''}
            onChange={(e) => updateField('experience_years', e.target.value)}
          />
        </div>

        <div className={styles.field} style={{ gridColumn: '1 / -1', display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14 }}>
            <input type="checkbox" checked={!!formData.decoration_included} onChange={(e) => updateField('decoration_included', e.target.checked)} />
            Decoration
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14 }}>
            <input type="checkbox" checked={!!formData.catering_management} onChange={(e) => updateField('catering_management', e.target.checked)} />
            Catering Management
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14 }}>
            <input type="checkbox" checked={!!formData.entertainment_management} onChange={(e) => updateField('entertainment_management', e.target.checked)} />
            Entertainment Management
          </label>
        </div>
      </div>
    );
  }

  // ================= MAKEUP ARTIST =================
  if (formData.category === 'makeup_artist') {
    return (
      <div className={styles.grid2}>
        <div className={styles.field}>
          <FieldLabel tooltip={t('makeup_types')}>Makeup Types</FieldLabel>
          <TagInput
            values={formData.makeup_types || []}
            onChange={(v) => updateField('makeup_types', v)}
            placeholder="e.g., Bridal, Party"
          />
        </div>

        <div className={styles.field}>
          <FieldLabel tooltip={t('brands_used')}>Brands Used</FieldLabel>
          <TagInput
            values={formData.brands_used || []}
            onChange={(v) => updateField('brands_used', v)}
            placeholder="e.g., MAC, Huda Beauty"
          />
        </div>

        <div className={styles.field}>
          <FieldLabel tooltip={t('specialization')}>Specialization</FieldLabel>
          <TagInput
            values={formData.specialization || []}
            onChange={(v) => updateField('specialization', v)}
            placeholder="e.g., Bridal, Fashion"
          />
        </div>

        <div className={styles.field}>
          <FieldLabel tooltip={t('service_duration_minutes')}>Service Duration (minutes)</FieldLabel>
          <input
            type="number"
            className={styles.input}
            value={formData.service_duration_minutes || ''}
            onChange={(e) => updateField('service_duration_minutes', e.target.value)}
          />
        </div>

        <div className={styles.field}>
          <FieldLabel tooltip={t('travel_cost_per_km')}>Travel Cost per Km (₹)</FieldLabel>
          <input
            type="number"
            className={styles.input}
            value={formData.travel_cost_per_km || ''}
            onChange={(e) => updateField('travel_cost_per_km', e.target.value)}
          />
        </div>

        <div className={styles.field}>
          <FieldLabel tooltip={t('base_city')}>Base City</FieldLabel>
          <input
            type="text"
            className={styles.input}
            value={formData.base_city || ''}
            onChange={(e) => updateField('base_city', e.target.value)}
          />
        </div>

        <div className={styles.field} style={{ gridColumn: '1 / -1', display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14 }}>
            <input type="checkbox" checked={!!formData.premium_products_used} onChange={(e) => updateField('premium_products_used', e.target.checked)} />
            Uses Premium Products
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14 }}>
            <input type="checkbox" checked={!!formData.travel_to_client} onChange={(e) => updateField('travel_to_client', e.target.checked)} />
            Travel To Client
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14 }}>
            <input type="checkbox" checked={!!formData.hairstyling_included} onChange={(e) => updateField('hairstyling_included', e.target.checked)} />
            Hairstyling Included
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14 }}>
            <input type="checkbox" checked={!!formData.draping_included} onChange={(e) => updateField('draping_included', e.target.checked)} />
            Draping Included
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14 }}>
            <input type="checkbox" checked={!!formData.trial_available} onChange={(e) => updateField('trial_available', e.target.checked)} />
            Trial Available
          </label>
        </div>
      </div>
    );
  }

  // DEFAULT
  return (
    <div className={styles.grid2}>
      <div className={styles.field}>
        <FieldLabel tooltip={t('experience_years')}>Years of experience</FieldLabel>
        <input
          type="number"
          className={styles.input}
          value={formData.experience_years || ''}
          onChange={(e) => updateField('experience_years', e.target.value)}
        />
      </div>

      <div className={styles.field}>
        <FieldLabel tooltip={t('team_size')}>Team size</FieldLabel>
        <input
          type="number"
          className={styles.input}
          value={formData.team_size || ''}
          onChange={(e) => updateField('team_size', e.target.value)}
        />
      </div>
    </div>
  );
};

export default StepSpecificDetails;
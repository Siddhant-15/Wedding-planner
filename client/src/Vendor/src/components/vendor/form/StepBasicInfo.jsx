import React, { useState } from 'react';
import { MapPin, Tag } from 'lucide-react';
import FieldLabel from '../../Common/FieldLabel';
import TagInput from './TagInput';
import { getFieldDescription } from '../../../constants/fieldDescriptions';
import styles from '../../../styles/FormStep.module.css';

const InputField = ({ label, field, required, value, onChange, error, id }) => {
  const fieldId = id || `field-${field}`;
  const errorId = `${fieldId}-error`;
  return (
    <div className={styles.field}>
      <FieldLabel required={required} htmlFor={fieldId}>{label}</FieldLabel>
      <input
        id={fieldId}
        className={`${styles.input} ${error ? styles.inputError : ''}`}
        value={value ?? ''}
        onChange={(e) => onChange(field, e.target.value)}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? errorId : undefined}
      />
      {error && (
        <p id={errorId} className={styles.error} role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

const StepBasicInfo = ({ formData, updateField, updateGeo, errors = {} }) => {
  const t = (key) => getFieldDescription(key, formData.category);

  const [latError, setLatError] = useState('');
  const [lonError, setLonError] = useState('');

  const handleLatChange = (value) => {
    updateGeo('lat', value);

    if (value === '' || value === '-' || value === '.' || value === '-.') {
      setLatError('');
      return;
    }

    const num = Number(value);

    if (isNaN(num)) {
      setLatError('Latitude must be a number');
    } else if (num < -90 || num > 90) {
      setLatError('Latitude must be between -90 and 90');
    } else {
      setLatError('');
    }
  };

  const handleLonChange = (value) => {
    updateGeo('lon', value);

    if (value === '' || value === '-' || value === '.' || value === '-.') {
      setLonError('');
      return;
    }

    const num = Number(value);

    if (isNaN(num)) {
      setLonError('Longitude must be a number');
    } else if (num < -180 || num > 180) {
      setLonError('Longitude must be between -180 and 180');
    } else {
      setLonError('');
    }
  };

  const latDisplayError = errors['geo_point.lat'] || latError;
  const lonDisplayError = errors['geo_point.lon'] || lonError;

  return (
    <div className={styles.step}>
      {/* TITLE */}
      <div className={styles.field}>
        <FieldLabel required tooltip={t('service_name')}>Service Title</FieldLabel>
        <input
          className={`${styles.input} ${errors.title ? styles.inputError : ''}`}
          value={formData.title ?? ''}
          onChange={(e) => updateField('title', e.target.value)}
          placeholder="e.g., Royal Wedding Palace"
          aria-invalid={errors.title ? 'true' : undefined}
          aria-describedby={errors.title ? 'title-error' : undefined}
        />
        {errors.title && (
          <p id="title-error" className={styles.error} role="alert">{errors.title}</p>
        )}
      </div>

      {/* DESCRIPTION */}
      <div className={styles.field}>
        <FieldLabel required tooltip={t('description')}>Description</FieldLabel>
        <textarea
          rows={4}
          className={`${styles.textarea} ${errors.description ? styles.inputError : ''}`}
          value={formData.description ?? ''}
          onChange={(e) => updateField('description', e.target.value)}
          aria-invalid={errors.description ? 'true' : undefined}
          aria-describedby={errors.description ? 'description-error' : undefined}
        />
        {errors.description && (
          <p id="description-error" className={styles.error} role="alert">{errors.description}</p>
        )}
      </div>

      {/* TAGS */}
      <div className={styles.field}>
        <FieldLabel tooltip={t('tags')}>
          <Tag size={13} style={{ marginRight: 4 }} /> Tags
        </FieldLabel>

        <TagInput
          values={formData.tags || []}
          onChange={(v) => updateField('tags', v)}
        />
      </div>

      {/* LOCATION */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>
          <MapPin size={16} /> Location
        </h3>

        <div className={styles.grid2}>
          <InputField
            label="Address Line 1"
            field="address_line1"
            required
            value={formData.address_line1}
            onChange={updateField}
            error={errors.address_line1}
          />
          <InputField
            label="Address Line 2"
            field="address_line2"
            value={formData.address_line2}
            onChange={updateField}
            error={errors.address_line2}
          />
          <InputField
            label="Area"
            field="area"
            value={formData.area}
            onChange={updateField}
            error={errors.area}
          />
          <InputField
            label="City"
            field="city"
            required
            value={formData.city}
            onChange={updateField}
            error={errors.city}
          />
          <InputField
            label="State"
            field="state"
            required
            value={formData.state}
            onChange={updateField}
            error={errors.state}
          />
          <InputField
            label="Country"
            field="country"
            required
            value={formData.country}
            onChange={updateField}
            error={errors.country}
          />
          <InputField
            label="Pincode"
            field="pincode"
            required
            value={formData.pincode}
            onChange={updateField}
            error={errors.pincode}
          />
        </div>

        {/* GEO */}
        <div className={styles.grid2}>
          <div className={styles.field}>
            <FieldLabel required tooltip={t('latitude')}>
              Latitude
            </FieldLabel>
            <input
              type="text"
              className={`${styles.input} ${latDisplayError ? styles.inputError : ''}`}
              value={formData.geo_point?.lat ?? ''}
              onChange={(e) => handleLatChange(e.target.value)}
              placeholder="e.g. 28.61"
              aria-invalid={latDisplayError ? 'true' : undefined}
              aria-describedby={latDisplayError ? 'lat-error' : undefined}
            />
            {latDisplayError && (
              <p id="lat-error" className={styles.error} role="alert">
                {latDisplayError}
              </p>
            )}
          </div>

          <div className={styles.field}>
            <FieldLabel required tooltip={t('longitude')}>
              Longitude
            </FieldLabel>
            <input
              type="text"
              className={`${styles.input} ${lonDisplayError ? styles.inputError : ''}`}
              value={formData.geo_point?.lon ?? ''}
              onChange={(e) => handleLonChange(e.target.value)}
              placeholder="e.g. 77.20"
              aria-invalid={lonDisplayError ? 'true' : undefined}
              aria-describedby={lonDisplayError ? 'lon-error' : undefined}
            />
            {lonDisplayError && (
              <p id="lon-error" className={styles.error} role="alert">
                {lonDisplayError}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StepBasicInfo;
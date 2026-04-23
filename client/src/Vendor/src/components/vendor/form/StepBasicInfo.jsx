import React, { useState } from 'react';
import { MapPin, Tag } from 'lucide-react';
import FieldLabel from '../../Common/FieldLabel';
import TagInput from './TagInput';
import { getFieldDescription } from '../../../constants/fieldDescriptions';
import styles from '../../../styles/FormStep.module.css';

const InputField = ({ label, field, required, value, onChange }) => {
  return (
    <div className={styles.field}>
      <FieldLabel required={required}>{label}</FieldLabel>
      <input
        className={styles.input}
        value={value}
        onChange={(e) => onChange(field, e.target.value)}
      />
    </div>
  );
};

const StepBasicInfo = ({ formData, updateField, updateGeo }) => {
  const t = (key) => getFieldDescription(key, formData.category);

  const [latError, setLatError] = useState("");
  const [lonError, setLonError] = useState("");

  const handleLatChange = (value) => {
    updateGeo("lat", value);

    if (value === "" || value === "-" || value === "." || value === "-.") {
      setLatError("");
      return;
    }

    const num = Number(value);

    if (isNaN(num)) {
      setLatError("Latitude must be a number");
    } else if (num < -90 || num > 90) {
      setLatError("Latitude must be between -90 and 90");
    } else {
      setLatError("");
    }
  };

  const handleLonChange = (value) => {
    updateGeo("lon", value);

    if (value === "" || value === "-" || value === "." || value === "-.") {
      setLonError("");
      return;
    }

    const num = Number(value);

    if (isNaN(num)) {
      setLonError("Longitude must be a number");
    } else if (num < -180 || num > 180) {
      setLonError("Longitude must be between -180 and 180");
    } else {
      setLonError("");
    }
  };

  return (
    <div className={styles.step}>
      {/* TITLE */}
      <div className={styles.field}>
        <FieldLabel required tooltip={t('service_name')}>Service Title</FieldLabel>
        <input
          className={styles.input}
          value={formData.title}
          onChange={(e) => updateField('title', e.target.value)}
          placeholder="e.g., Royal Wedding Palace"
        />
      </div>

      {/* DESCRIPTION */}
      <div className={styles.field}>
        <FieldLabel required tooltip={t('description')}>Description</FieldLabel>
        <textarea
          rows={4}
          className={styles.textarea}
          value={formData.description}
          onChange={(e) => updateField('description', e.target.value)}
        />
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
          <InputField label="Address Line 1" field="address_line1" value={formData.address_line1} onChange={updateField} />
          <InputField label="Address Line 2" field="address_line2" value={formData.address_line2} onChange={updateField} />
          <InputField label="Area" field="area" value={formData.area} onChange={updateField} />
          <InputField label="City" field="city" required value={formData.city} onChange={updateField} />
          <InputField label="State" field="state" required value={formData.state} onChange={updateField} />
          <InputField label="Country" field="country" required value={formData.country} onChange={updateField} />
          <InputField label="Pincode" field="pincode" required value={formData.pincode} onChange={updateField} />
        </div>

        {/* GEO */}
        <div className={styles.grid2}>
          <div className={styles.field}>
            <FieldLabel tooltip={t('latitude')}>Latitude</FieldLabel>
            <input
              type="text"
              className={styles.input}
              value={formData.geo_point?.lat || ""}
              onChange={(e) => handleLatChange(e.target.value)}
              placeholder="e.g. 28.61"
            />
            {latError && <p className={styles.error}>{latError}</p>}
          </div>

          <div className={styles.field}>
            <FieldLabel tooltip={t('longitude')}>Longitude</FieldLabel>
            <input
              type="text"
              className={styles.input}
              value={formData.geo_point?.lon || ""}
              onChange={(e) => handleLonChange(e.target.value)}
              placeholder="e.g. 77.20"
            />
            {lonError && <p className={styles.error}>{lonError}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StepBasicInfo;
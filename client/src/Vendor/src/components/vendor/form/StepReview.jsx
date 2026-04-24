// src/components/vendor/form/StepReview.jsx
import React from 'react';
import { Pencil } from 'lucide-react';
import { SERVICE_CATEGORIES } from '../../../constants/serviceConstants';
import styles from "../../../styles/StepReview.module.css";

const Row = ({ label, value }) => (
  <div className={styles.row}>
    <span className={styles.k}>{label}</span>
    <span className={styles.v}>{value || '—'}</span>
  </div>
);

const Section = ({ title, onEdit, children }) => (
  <div className={styles.card}>
    <div className={styles.cardHead}>
      <h4>{title}</h4>
      {onEdit && (
        <button type="button" className={styles.editBtn} onClick={onEdit}>
          <Pencil size={12} /> Edit
        </button>
      )}
    </div>
    <div className={styles.cardBody}>{children}</div>
  </div>
);

const StepReview = ({ formData, goToStep }) => {
  const cat = SERVICE_CATEGORIES.find((c) => c.value === formData.category)?.label || '—';
  const location = [formData.address_line1, formData.area, formData.city, formData.state, formData.pincode]
    .filter(Boolean).join(', ');

  console.log(formData)

  return (
    <div className={styles.wrap}>
      <Section title="Basic Info" onEdit={() => goToStep(0)}>
        <Row label="Title" value={formData.title} />
        <Row label="Description" value={formData.description} />
        <Row label="Tags" value={formData.tags?.join(', ')} />
        <Row label="Location" value={location} />
      </Section>

      <Section title="Packages" onEdit={() => goToStep(1)}>
        <Row label="Category" value={cat} />
        {formData.variants?.map((v) => (
          <div key={v.id} className={styles.variant}>
            <strong>{v.variant_name || 'Untitled package'}</strong>
            <span>
              {v.is_veg_only ? 'Veg only · ' : ''}
              {v.veg_price ? `Veg ₹${v.veg_price} ` : ''}
              {v.non_veg_price ? `Non-veg ₹${v.non_veg_price} ` : ''}
              {v.rental_price ? `Rental ₹${v.rental_price} ` : ''}
              {v.price ? `₹${v.price} ` : ''}
              {v.pricing_type ? `· ${v.pricing_type}` : ''}
            </span>
          </div>
        ))}
      </Section>

      <Section title="Details" onEdit={() => goToStep(2)}>
        {formData.category === 'venue' ? (
          <>
            <Row label="Capacity" value={`${formData.min_capacity || '—'} – ${formData.max_capacity || '—'}`} />
            <Row label="Square feet" value={formData.square_feet} />
            <Row label="Hall type" value={formData.venue_type} />
            <Row label="Indoor / Outdoor" value={formData.venue_nature} />
          </>
        ) : (
          <>
            <Row label="Experience" value={formData.experience_years && `${formData.experience_years} yrs`} />
            <Row label="Team size" value={formData.team_size} />
          </>
        )}
      </Section>

      <Section title="Amenities & Images" onEdit={() => goToStep(3)}>
        <Row label="Amenities" value={formData.amenities?.join(', ')} />
        <Row label="Images" value={`${formData.images?.length || 0} uploaded`} />
      </Section>
    </div>
  );
};

export default StepReview;

import React from "react";
import { Edit2 } from "lucide-react";
import styles from "../ServiceFormModal.module.css";

const StepReview = ({ data, onEdit, onBack, onSubmit }) => {
  const { title, description, location, tags, images, category, rating, amenities, variants } = data;

  return (
    <div className={styles.stepForm}>
      <h2 className={styles.reviewHeader}>Review Your Service</h2>

      {/* Basic Info */}
      <section className={styles.reviewSection}>
        <div className={styles.sectionHeader}>
          <h3>Basic Info</h3>
          <button className={styles.editBtn} onClick={() => onEdit(0)}>
            <Edit2 size={16} /> Edit
          </button>
        </div>
        <p><strong>Title:</strong> {title}</p>
        <p><strong>Description:</strong> {description}</p>
        <p><strong>Location:</strong> {location}</p>
        <div className={styles.tagList}>
          {tags.map((tag, i) => (
            <span key={i} className={styles.tag}>{tag}</span>
          ))}
        </div>
        <div className={styles.imagePreview}>
          {images.map((img, i) => (
            <img key={i} src={img} alt={`preview-${i}`} width={100} height={100} />
          ))}
        </div>
      </section>

      {/* Category & Amenities */}
      <section className={styles.reviewSection}>
        <div className={styles.sectionHeader}>
          <h3>Category & Amenities</h3>
          <button className={styles.editBtn} onClick={() => onEdit(1)}>
            <Edit2 size={16} /> Edit
          </button>
        </div>
        <p><strong>Category:</strong> {category}</p>
        <p><strong>Rating:</strong> {rating} ⭐</p>
        <div className={styles.tagList}>
          {amenities.map((a, i) => (
            <span key={i} className={styles.tag}>{a}</span>
          ))}
        </div>
      </section>

      {/* Variants / Packages */}
      <section className={styles.reviewSection}>
        <div className={styles.sectionHeader}>
          <h3>Packages</h3>
          <button className={styles.editBtn} onClick={() => onEdit(2)}>
            <Edit2 size={16} /> Edit
          </button>
        </div>
        <div className={styles.variantsList}>
          {variants.map((v, i) => (
            <div key={i} className={styles.variantCard}>
              <p><strong>{v.name}</strong></p>
              <p>${v.price}</p>
            </div>
          ))}
        </div>
      </section>

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "2rem" }}>
        <button className={styles.backBtn} onClick={onBack}>Back</button>
        <button className={styles.submitBtn} onClick={onSubmit}>Submit Service</button>
      </div>
    </div>
  );
};

export default StepReview;

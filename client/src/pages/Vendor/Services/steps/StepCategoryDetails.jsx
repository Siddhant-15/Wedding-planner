import React, { useState } from "react";
import { Star } from "lucide-react";
import styles from "../ServiceFormModal.module.css";

const categories = ["VENUE", "CATERING", "DJ", "PHOTOGRAPHER", "EVENT_MANAGEMENT"];

const StepCategoryDetails = ({ onNext, onBack, data }) => {
  const [category, setCategory] = useState(data?.category || "");
  const [rating, setRating] = useState(data?.rating || 0);
  const [amenities, setAmenities] = useState(data?.amenities || []);
  const [newAmenity, setNewAmenity] = useState("");

  const handleAddAmenity = () => {
    if (newAmenity.trim() && !amenities.includes(newAmenity)) {
      setAmenities([...amenities, newAmenity.trim()]);
      setNewAmenity("");
    }
  };

  const handleNextClick = () => {
    if (!category) {
      alert("Please select a category");
      return;
    }
    onNext({ category, rating, amenities });
  };

  return (
    <div className={styles.stepForm}>
      <div className={styles.formGroup}>
        <label>Category</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
        >
          <option value="" disabled>Select a category</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.formGroup}>
        <label>Rating <Star size={18} /></label>
        <input
          type="number"
          min="0"
          max="5"
          step="0.1"
          value={rating}
          onChange={(e) => setRating(e.target.value)}
        />
      </div>

      <div className={styles.formGroup}>
        <label>Amenities</label>
        <div className={styles.amenitiesList}>
          {amenities.map((a, i) => (
            <div key={i} className={styles.amenity}>{a}</div>
          ))}
        </div>
        <div style={{ display: "flex", marginTop: "0.5rem" }}>
          <input
            type="text"
            placeholder="Add amenity"
            value={newAmenity}
            onChange={(e) => setNewAmenity(e.target.value)}
          />
          <button type="button" onClick={handleAddAmenity}>Add</button>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <button className={styles.backBtn} onClick={onBack}>
          Back
        </button>
        <button onClick={handleNextClick}>Next</button>
      </div>
    </div>
  );
};

export default StepCategoryDetails;
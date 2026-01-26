import React, { useState } from "react";
import { Star, Camera, X, Loader2, Send } from "lucide-react";
import styles from "../styles/WriteReviewForm.module.css";

// API
import { reviewAPI } from "../utils/api";
import { useAuth } from "../context/AuthContext";

const RatingCriteria = ({ label, value, onChange }) => {
  const [hovered, setHovered] = useState(0);

  return (
    <div className={styles.criteriaRow}>
      <span className={styles.criteriaLabel}>{label}</span>
      <div className={styles.stars}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => onChange(star)}
            className={styles.starButton}
          >
            <Star
              size={24}
              className={
                (hovered || value) >= star
                  ? styles.starActive
                  : styles.starInactive
              }
            />
          </button>
        ))}
      </div>
    </div>
  );
};

export default function WriteReviewForm({ serviceName, serviceId, onReviewSubmitted }) {
  const { user } = useAuth();

  const [form, setForm] = useState({
    overallRating: 0,
    foodBeverageRating: 0,
    serviceQualityRating: 0,
    ambianceRating: 0,
    valueForMoneyRating: 0,
    title: "",
    text: "",
    event_type: "General",
    event_date: new Date().toISOString().split("T")[0],
  });

  const [files, setFiles] = useState([]); // actual File objects for upload
  const [previews, setPreviews] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const handlePhotoChange = (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (files.length + selectedFiles.length > 5) {
      alert("Maximum 5 photos allowed");
      return;
    }

    const newFiles = [...files, ...selectedFiles].slice(0, 5);
    setFiles(newFiles);

    selectedFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews((prev) => [...prev, reader.result].slice(0, 5));
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user?.id) {
      setSubmitError("Please log in to submit a review.");
      return;
    }

    if (form.overallRating === 0) {
      setSubmitError("Please provide an overall rating.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    const formData = new FormData();

    formData.append("service_id", String(serviceId));
    formData.append("user_id", String(user.id));
    formData.append("overall_rating", String(form.overallRating));
    formData.append("food_beverage_rating", String(form.foodBeverageRating));
    formData.append("service_quality_rating", String(form.serviceQualityRating));
    formData.append("ambiance_rating", String(form.ambianceRating));
    formData.append("value_for_money_rating", String(form.valueForMoneyRating));
    formData.append("title", form.title.trim() || "");
    formData.append("review_text", form.text.trim() || "");
    formData.append("event_type", form.event_type || "General");

    let eventDateStr = form.event_date;
    if (!eventDateStr) {
      eventDateStr = new Date().toISOString().split("T")[0];
    }
    formData.append("event_date", eventDateStr);   // must be "YYYY-MM-DD"

    files.forEach((file) => {
      formData.append("photos", file);
    });

    files.forEach((file) => {
      formData.append("photos", file);
    });

    try {
      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }
      const response = await reviewAPI.add(formData);

      const newReview = response.data || {
        ...form,
        id: "temp-" + Date.now(),
        createdAt: new Date().toISOString(),
        user: { name: "You", avatar: "", location: "" },
        ratings: {
          overall: form.overallRating,
          foodBeverage: form.foodBeverageRating,
          serviceQuality: form.serviceQualityRating,
          ambiance: form.ambianceRating,
          valueForMoney: form.valueForMoneyRating,
        },
        text: form.text.trim(),
        photos: previews,
        isVerified: false,
        helpfulCount: 0,
      };

      if (onReviewSubmitted) {
        onReviewSubmitted(newReview);
      }

      // Reset form
      setForm({
        overallRating: 0,
        foodBeverageRating: 0,
        serviceQualityRating: 0,
        ambianceRating: 0,
        valueForMoneyRating: 0,
        title: "",
        text: "",
        event_type: "General",
        event_date: new Date().toISOString().split("T")[0],
      });
      setFiles([]);
      setPreviews([]);
    } catch (err) {
      console.error(err);
      const errorMsg =
        err.response?.data?.detail?.[0]?.msg ||
        err.response?.data?.detail ||
        "Failed to submit review. Please try again.";
      setSubmitError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.card}>
      <h3 className={styles.title}>Write Your Review</h3>
      <p className={styles.subtitle}>
        Share your honest experience at <span className={styles.serviceName}>{serviceName}</span>
      </p>

      {submitError && <div className={styles.errorMessage}>{submitError}</div>}

      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Overall Rating */}
        <div className={styles.overallRatingContainer}>
          <p className={styles.overallLabel}>Overall Rating *</p>
          <div className={styles.overallStars}>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setForm({ ...form, overallRating: star })}
                className={`${styles.starButtonLarge} ${form.overallRating === star ? styles.selected : ""
                  }`}
              >
                <Star
                  size={48}
                  className={
                    form.overallRating >= star
                      ? styles.starActiveLarge
                      : styles.starInactiveLarge
                  }
                />
              </button>
            ))}
          </div>
          {form.overallRating > 0 && (
            <p className={styles.ratingText}>
              {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][form.overallRating]}
            </p>
          )}
        </div>

        {/* Criteria */}
        <div className={styles.criteriaContainer}>
          <RatingCriteria
            label="Food & Beverage"
            value={form.foodBeverageRating}
            onChange={(v) => setForm({ ...form, foodBeverageRating: v })}
          />
          <RatingCriteria
            label="Service Quality"
            value={form.serviceQualityRating}
            onChange={(v) => setForm({ ...form, serviceQualityRating: v })}
          />
          <RatingCriteria
            label="Ambiance & Decor"
            value={form.ambianceRating}
            onChange={(v) => setForm({ ...form, ambianceRating: v })}
          />
          <RatingCriteria
            label="Value for Money"
            value={form.valueForMoneyRating}
            onChange={(v) => setForm({ ...form, valueForMoneyRating: v })}
          />
        </div>

        {/* Event Type & Date */}
        <div className={styles.eventRow}>
          <div className={styles.eventField}>
            <label className={styles.fieldLabel}>Occasion (optional)</label>
            <select
              value={form.event_type}
              onChange={(e) => setForm({ ...form, event_type: e.target.value })}
              className={styles.select}
            >
              <option value="General">General Visit</option>
              <option value="Birthday">Birthday</option>
              <option value="Anniversary">Anniversary</option>
              <option value="Date Night">Date Night / Romantic</option>
              <option value="Wedding">Wedding / Reception</option>
              <option value="Engagement">Engagement Party</option>
              <option value="Family Gathering">Family Gathering</option>
              <option value="Baby Shower">Baby Shower</option>
              <option value="Bridal Shower">Bridal Shower</option>
              <option value="Corporate">Corporate / Business</option>
              <option value="Graduation">Graduation</option>
              <option value="Holiday">Holiday Celebration</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className={styles.eventField}>
            <label className={styles.fieldLabel}>Date of Visit</label>
            <input
              type="date"
              value={form.event_date}
              onChange={(e) => setForm({ ...form, event_date: e.target.value })}
              className={styles.dateInput}
            />
          </div>
        </div>

        {/* Title */}
        <input
          className={styles.input}
          placeholder="Review Title (optional)"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />

        {/* Text */}
        <div className={styles.textareaWrapper}>
          <textarea
            className={styles.textarea}
            placeholder="Tell us about your experience... Be as detailed as you'd like."
            value={form.text}
            onChange={(e) => setForm({ ...form, text: e.target.value })}
            maxLength={1000}
          />
          <span className={`${styles.counter} ${form.text.length > 900 ? styles.counterWarning : ""}`}>
            {form.text.length}/1000
          </span>
        </div>

        {/* Photos */}
        <div className={styles.photoSection}>
          <label className={styles.photoLabel}>Add Photos (up to 5)</label>
          <div className={styles.photosContainer}>
            {previews.map((src, i) => (
              <div key={i} className={styles.photoPreview}>
                <img src={src} alt="preview" className={styles.previewImage} />
                <button
                  type="button"
                  onClick={() => removePhoto(i)}
                  className={styles.removePhoto}
                >
                  <X size={16} />
                </button>
              </div>
            ))}

            {files.length < 5 && (
              <label className={styles.uploadBox}>
                <Camera size={28} className={styles.cameraIcon} />
                <span className={styles.uploadText}>Add Photo</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  hidden
                  onChange={handlePhotoChange}
                />
              </label>
            )}
          </div>
          <p className={styles.photoHint}>JPG, PNG • Maximum 5 photos</p>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting || form.overallRating === 0}
          className={`${styles.submitButton} ${isSubmitting ? styles.submitting : ""}`}
        >
          {isSubmitting ? (
            <>
              <Loader2 className={styles.spinner} />
              Submitting...
            </>
          ) : (
            <>
              <Send size={18} />
              Submit Review
            </>
          )}
        </button>
      </form>
    </div>
  );
}
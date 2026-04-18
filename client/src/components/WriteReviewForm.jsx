import React, { useState } from "react";
import { Star, Camera, X, Loader2, Send } from "lucide-react";
import styles from "../styles/WriteReviewForm.module.css";

import { reviewService } from "../utils/api/services/review.service";
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

  const [files, setFiles] = useState([]); // File objects
  const [previews, setPreviews] = useState([]); // data URLs for display
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

    // Generate previews
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
    console.log("1");
    e.preventDefault();

    if (!user?.id) {
      setSubmitError("Please log in to submit a review.");
      return;
    }

    if (form.overallRating === 0) {
      setSubmitError("Please provide an overall rating.");
      return;
    }
    console.log("2");
    setIsSubmitting(true);
    setSubmitError(null);

    const formData = new FormData();
    console.log("3");
    formData.append("service_id", serviceId);
    formData.append("user_id", user.id.toString());

    formData.append("overall_rating", form.overallRating.toString());

    // Optional ratings — only send if user actually rated them
    if (form.foodBeverageRating > 0)
      formData.append("food_beverage_rating", form.foodBeverageRating.toString());
    if (form.serviceQualityRating > 0)
      formData.append("service_quality_rating", form.serviceQualityRating.toString());
    if (form.ambianceRating > 0)
      formData.append("ambiance_rating", form.ambianceRating.toString());
    if (form.valueForMoneyRating > 0)
      formData.append("value_for_money_rating", form.valueForMoneyRating.toString());
    console.log("4");
    formData.append("title", form.title.trim());
    formData.append("review_text", form.text.trim());
    formData.append("event_type", form.event_type || "General");

    if (form.event_date) {
      formData.append("event_date", form.event_date);
    }

    // Attach photos (only once!)
    files.forEach((file) => {
      formData.append("photos", file);
    });

    try {
      console.log("formData:", formData);
      const response = await reviewService.add(formData);

      // Prefer real data from backend when available
      const createdReview = response.data ?? {};

      const optimisticReview = {
        id: createdReview.id || `temp-${Date.now()}`,
        service_id: serviceId,
        user_id: user.id,
        overall_rating: form.overallRating,
        food_beverage_rating: form.foodBeverageRating,
        service_quality_rating: form.serviceQualityRating,
        ambiance_rating: form.ambianceRating,
        value_for_money_rating: form.valueForMoneyRating,
        title: form.title.trim(),
        review_text: form.text.trim(),
        event_type: form.event_type,
        event_date: form.event_date,
        photos: createdReview.photos || previews, // ← real URLs if returned
        created_at: createdReview.created_at || new Date().toISOString(),
        user: {
          name: user.name || user.username || "You",
          avatar: user.avatar || "",
        },
        helpful_count: 0,
        is_verified: false,
      };

      onReviewSubmitted?.(optimisticReview);

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

      // You can replace alert with a toast notification library
      alert("Thank you! Your review has been submitted.");
    } catch (err) {
      console.error("Review submission error:", err);

      let errorMsg = "Failed to submit review. Please try again later.";

      if (err.response?.data?.detail) {
        if (typeof err.response.data.detail === "string") {
          errorMsg = err.response.data.detail;
        } else if (Array.isArray(err.response.data.detail)) {
          errorMsg = err.response.data.detail.map((d) => d.msg || d).join("\n");
        }
      } else if (err.response?.status === 413) {
        errorMsg = "Files are too large. Please use smaller photos.";
      } else if (err.response?.status === 422) {
        errorMsg = "Invalid input. Please check your ratings and fields.";
      }

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

        <input
          className={styles.input}
          placeholder="Review Title (optional)"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          maxLength={100}
        />

        <div className={styles.textareaWrapper}>
          <textarea
            className={styles.textarea}
            placeholder="Tell us about your experience... Be as detailed as you'd like."
            value={form.text}
            onChange={(e) => setForm({ ...form, text: e.target.value })}
            maxLength={1000}
          />
          <span
            className={`${styles.counter} ${form.text.length > 900 ? styles.counterWarning : ""}`}
          >
            {form.text.length}/1000
          </span>
        </div>

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
          <p className={styles.photoHint}>JPG, PNG • Maximum 5 photos • &lt; 5MB each recommended</p>
        </div>

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
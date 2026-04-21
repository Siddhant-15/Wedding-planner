import React, { useState, useRef } from "react";
import {
  Star,
  Camera,
  X,
  Loader2,
  Send,
  ShieldCheck,
  Sparkles,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import styles from "../styles/WriteReviewForm.module.css";

import { reviewService } from "../utils/api/services/review.service";
import { useAuth } from "../context/AuthContext";

const RATING_LABELS = ["", "Poor", "Fair", "Good", "Very Good", "Excellent"];
const MAX_TEXT = 1000;
const MAX_TITLE = 100;
const MAX_PHOTOS = 5;

/* ---------- Sub-criteria row ---------- */
const RatingCriteria = ({ label, value, onChange, hint }) => {
  const [hovered, setHovered] = useState(0);
  const active = hovered || value;

  return (
    <div className={styles.criteriaRow}>
      <div className={styles.criteriaText}>
        <span className={styles.criteriaLabel}>{label}</span>
        {hint && <span className={styles.criteriaHint}>{hint}</span>}
      </div>
      <div
        className={styles.stars}
        onMouseLeave={() => setHovered(0)}
        role="radiogroup"
        aria-label={label}
      >
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onMouseEnter={() => setHovered(star)}
            onClick={() => onChange(star)}
            className={styles.starButton}
            aria-label={`${star} star${star > 1 ? "s" : ""}`}
            aria-checked={value === star}
            role="radio"
          >
            <Star
              size={20}
              className={active >= star ? styles.starActive : styles.starInactive}
              fill={active >= star ? "currentColor" : "none"}
            />
          </button>
        ))}
        <span className={styles.starsValue}>
          {value > 0 ? `${value}.0` : ""}
        </span>
      </div>
    </div>
  );
};

export default function WriteReviewForm({
  serviceName,
  serviceId,
  onReviewSubmitted,
}) {
  const { user } = useAuth();
  const fileInputRef = useRef(null);

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

  const [hoveredOverall, setHoveredOverall] = useState(0);
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  /* ---------- Photo handling ---------- */
  const handlePhotoChange = (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (files.length + selectedFiles.length > MAX_PHOTOS) {
      setSubmitError(`Maximum ${MAX_PHOTOS} photos allowed.`);
      return;
    }
    setSubmitError(null);

    const newFiles = [...files, ...selectedFiles].slice(0, MAX_PHOTOS);
    setFiles(newFiles);

    selectedFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews((prev) => [...prev, reader.result].slice(0, MAX_PHOTOS));
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  /* ---------- Submit ---------- */
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
    formData.append("service_id", serviceId);
    formData.append("user_id", user.id.toString());
    formData.append("overall_rating", form.overallRating.toString());

    if (form.foodBeverageRating > 0)
      formData.append("food_beverage_rating", form.foodBeverageRating.toString());
    if (form.serviceQualityRating > 0)
      formData.append("service_quality_rating", form.serviceQualityRating.toString());
    if (form.ambianceRating > 0)
      formData.append("ambiance_rating", form.ambianceRating.toString());
    if (form.valueForMoneyRating > 0)
      formData.append("value_for_money_rating", form.valueForMoneyRating.toString());

    formData.append("title", form.title.trim());
    formData.append("review_text", form.text.trim());
    formData.append("event_type", form.event_type || "General");
    if (form.event_date) formData.append("event_date", form.event_date);

    files.forEach((file) => formData.append("photos", file));

    try {
      const response = await reviewService.add(formData);
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
        photos: createdReview.photos || previews,
        created_at: createdReview.created_at || new Date().toISOString(),
        user: {
          name: user.name || user.username || "You",
          avatar: user.avatar || "",
        },
        helpful_count: 0,
        is_verified: false,
      };

      onReviewSubmitted?.(optimisticReview);

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

  const overallActive = hoveredOverall || form.overallRating;

  return (
    <div className={styles.card}>
      {/* Header */}
      <div className={styles.header}>
        <span className={styles.eyebrow}>
          <Sparkles size={12} /> Share your experience
        </span>
        <h3 className={styles.title}>Write a review</h3>
        <p className={styles.subtitle}>
          Help others by sharing your honest experience at{" "}
          <span className={styles.serviceName}>{serviceName}</span>
        </p>
        <div className={styles.trustRow}>
          <span className={styles.trustItem}>
            <ShieldCheck size={14} /> Verified review
          </span>
          <span className={styles.trustDot} />
          <span className={styles.trustItem}>Takes ~2 minutes</span>
        </div>
      </div>

      {submitError && (
        <div className={styles.errorMessage} role="alert">
          <AlertCircle size={16} />
          <span>{submitError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className={styles.form} noValidate>
        {/* Overall Rating */}
        <div className={styles.overallRatingContainer}>
          <p className={styles.overallLabel}>Overall rating *</p>
          <div
            className={styles.overallStars}
            onMouseLeave={() => setHoveredOverall(0)}
            role="radiogroup"
            aria-label="Overall rating"
          >
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onMouseEnter={() => setHoveredOverall(star)}
                onClick={() => setForm({ ...form, overallRating: star })}
                className={styles.starButtonLarge}
                aria-label={`${star} star${star > 1 ? "s" : ""}`}
                aria-checked={form.overallRating === star}
                role="radio"
              >
                <Star
                  size={40}
                  className={
                    overallActive >= star
                      ? styles.starActiveLarge
                      : styles.starInactiveLarge
                  }
                  fill={overallActive >= star ? "currentColor" : "none"}
                />
              </button>
            ))}
          </div>
          <p className={styles.ratingText}>
            {overallActive > 0
              ? RATING_LABELS[overallActive]
              : "Tap a star to rate"}
          </p>
        </div>

        {/* Sub-criteria */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h4 className={styles.sectionTitle}>Rate by category</h4>
            <span className={styles.sectionHint}>Optional</span>
          </div>
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
        </div>

        {/* Event details */}
        <div className={styles.eventRow}>
          <div className={styles.field}>
            <label className={styles.fieldLabel} htmlFor="rv-occasion">
              Occasion <span className={styles.optional}>(optional)</span>
            </label>
            <select
              id="rv-occasion"
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

          <div className={styles.field}>
            <label className={styles.fieldLabel} htmlFor="rv-date">
              Date of visit
            </label>
            <input
              id="rv-date"
              type="date"
              value={form.event_date}
              onChange={(e) => setForm({ ...form, event_date: e.target.value })}
              className={styles.input}
              max={new Date().toISOString().split("T")[0]}
            />
          </div>
        </div>

        {/* Title */}
        <div className={styles.field}>
          <div className={styles.labelRow}>
            <label className={styles.fieldLabel} htmlFor="rv-title">
              Review title <span className={styles.optional}>(optional)</span>
            </label>
            <span className={styles.counter}>
              {form.title.length}/{MAX_TITLE}
            </span>
          </div>
          <input
            id="rv-title"
            className={styles.input}
            placeholder="Sum up your experience in one line"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            maxLength={MAX_TITLE}
          />
        </div>

        {/* Review text */}
        <div className={styles.field}>
          <div className={styles.labelRow}>
            <label className={styles.fieldLabel} htmlFor="rv-text">
              Your review
            </label>
            <span
              className={`${styles.counter} ${form.text.length > MAX_TEXT - 100 ? styles.counterWarning : ""
                }`}
            >
              {form.text.length}/{MAX_TEXT}
            </span>
          </div>
          <textarea
            id="rv-text"
            className={styles.textarea}
            placeholder="What did you love? What could be better? Share details about food, service, ambiance and the overall experience…"
            value={form.text}
            onChange={(e) =>
              setForm({ ...form, text: e.target.value.slice(0, MAX_TEXT) })
            }
          />
        </div>

        {/* Photos */}
        <div className={styles.field}>
          <div className={styles.labelRow}>
            <label className={styles.fieldLabel}>
              Add photos <span className={styles.optional}>(optional)</span>
            </label>
            <span className={styles.counter}>
              {files.length}/{MAX_PHOTOS}
            </span>
          </div>

          <div className={styles.photosContainer}>
            {previews.map((src, i) => (
              <div key={i} className={styles.photoPreview}>
                <img src={src} alt={`Upload ${i + 1}`} className={styles.previewImage} />
                <button
                  type="button"
                  onClick={() => removePhoto(i)}
                  className={styles.removePhoto}
                  aria-label="Remove photo"
                >
                  <X size={14} />
                </button>
              </div>
            ))}

            {files.length < MAX_PHOTOS && (
              <label className={styles.uploadBox}>
                <Camera size={22} className={styles.cameraIcon} />
                <span className={styles.uploadText}>Upload</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  hidden
                  onChange={handlePhotoChange}
                />
              </label>
            )}
          </div>
          <p className={styles.photoHint}>
            JPG or PNG • Up to {MAX_PHOTOS} photos • Recommended &lt; 5MB each
          </p>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting || form.overallRating === 0}
          className={styles.submitButton}
        >
          {isSubmitting ? (
            <>
              <Loader2 className={styles.spinner} size={18} />
              Submitting…
            </>
          ) : (
            <>
              <Send size={18} />
              Submit review
            </>
          )}
        </button>

        {form.overallRating === 0 && !isSubmitting && (
          <p className={styles.hintText}>
            <CheckCircle2 size={12} /> Add an overall rating to continue
          </p>
        )}
      </form>
    </div>
  );
}

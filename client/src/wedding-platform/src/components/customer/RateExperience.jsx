import React, { useState } from "react";
import { Star, CheckCircle2 } from "lucide-react";
import styles from "./RateExperience.module.css";

const RateExperience = ({ vendor, eventType = "Wedding", onSubmit }) => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [text, setText] = useState("");
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    if (!rating) return;
    setSubmitting(true);
    setTimeout(() => { setDone(true); setSubmitting(false); onSubmit?.({ rating, text }); }, 900);
  };

  if (done) {
    return (
      <div className={styles.wrap}>
        <div className={styles.card}>
          <div className={styles.successIcon}><CheckCircle2 size={48} /></div>
          <h2>Thanks for your feedback</h2>
          <p>Your review helps other customers make better decisions.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wrap}>
      <form className={styles.card} onSubmit={submit}>
        <div className={styles.head}>
          <Star size={26} className={styles.titleIcon} />
          <h2>Rate Your Experience</h2>
          <p>Your feedback helps other customers.</p>
        </div>

        {vendor && (
          <div className={styles.vendor}>
            <img src={vendor.image} alt={vendor.name} />
            <div>
              <h4>{vendor.name}</h4>
              <p>{eventType} <span>•</span> {vendor.category}</p>
            </div>
          </div>
        )}

        <div className={styles.stars}>
          {[1, 2, 3, 4, 5].map((i) => (
            <button key={i} type="button"
              onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(0)}
              onClick={() => setRating(i)} aria-label={`${i} star${i > 1 ? "s" : ""}`}
              className={styles.starBtn}>
              <Star size={36} fill={(hover || rating) >= i ? "currentColor" : "none"}
                className={(hover || rating) >= i ? styles.starOn : styles.starOff} />
            </button>
          ))}
        </div>
        {rating > 0 && <p className={styles.ratingLabel}>{["Poor","Fair","Good","Great","Excellent"][rating-1]}</p>}

        <label className={styles.field}>
          <span>Write a review</span>
          <textarea rows={4} value={text} onChange={(e) => setText(e.target.value)}
            placeholder="Share details about your experience..." />
        </label>

        <button type="submit" className={styles.primary} disabled={!rating || submitting}>
          {submitting ? "Submitting..." : "Submit Review"}
        </button>
      </form>
    </div>
  );
};

export default RateExperience;

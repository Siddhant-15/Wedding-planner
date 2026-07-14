import React, { useEffect, useState } from "react";
import { X, Star, CheckCircle2 } from "lucide-react";
import styles from "./FeedbackModal.module.css";

export default function FeedbackModal({
  isOpen = false,
  vendorName = "this vendor",
  onClose,
  onSubmit,
}) {
  const [contacted, setContacted] = useState(null);
  const [booked, setBooked] = useState(null);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [review, setReview] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) {
      setContacted(null);
      setBooked(null);
      setRating(0);
      setReview("");
      setDone(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const canSubmit =
    contacted !== null &&
    booked !== null &&
    (booked === false || (booked === true && review.trim().length >= 5));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    onSubmit?.({ contacted, booked, rating: booked ? rating : null, review: booked ? review.trim() : "" });
    setDone(true);
  };

  return (
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-labelledby="feedback-title"
      onMouseDown={(e) => e.target === e.currentTarget && onClose?.()}
    >
      <div className={styles.modal}>
        <button
          type="button"
          className={styles.close}
          onClick={onClose}
          aria-label="Close feedback"
        >
          <X size={18} />
        </button>

        {done ? (
          <div className={styles.success}>
            <span className={styles.successIcon}>
              <CheckCircle2 size={32} />
            </span>
            <h3 className={styles.title}>Thanks for your feedback!</h3>
            <p className={styles.subtitle}>
              Your response helps couples find better vendors.
            </p>
            <button
              type="button"
              className={`${styles.btn} ${styles.btnPrimary}`}
              onClick={onClose}
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <header className={styles.header}>
              <h3 id="feedback-title" className={styles.title}>
                How did it go?
              </h3>
              <p className={styles.subtitle}>
                Quick feedback about <strong>{vendorName}</strong>
              </p>
            </header>

            <div className={styles.body}>
              <Question label="Did the vendor contact you?">
                <Choice
                  active={contacted === true}
                  onClick={() => setContacted(true)}
                >
                  Yes
                </Choice>
                <Choice
                  active={contacted === false}
                  onClick={() => setContacted(false)}
                >
                  No
                </Choice>
              </Question>

              <Question label="Did you book this vendor?">
                <Choice active={booked === true} onClick={() => setBooked(true)}>
                  Yes
                </Choice>
                <Choice
                  active={booked === false}
                  onClick={() => setBooked(false)}
                >
                  No
                </Choice>
              </Question>

              {booked === true && (
                <div className={styles.reviewBlock}>
                  <span className={styles.qLabel}>Rate your experience</span>
                  <div className={styles.stars} role="radiogroup" aria-label="Rating">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        type="button"
                        className={styles.starBtn}
                        onMouseEnter={() => setHover(n)}
                        onMouseLeave={() => setHover(0)}
                        onClick={() => setRating(n)}
                        aria-label={`${n} star${n > 1 ? "s" : ""}`}
                      >
                        <Star
                          size={26}
                          fill={(hover || rating) >= n ? "currentColor" : "none"}
                          className={
                            (hover || rating) >= n ? styles.starActive : styles.star
                          }
                        />
                      </button>
                    ))}
                  </div>

                  <span className={styles.qLabel}>Write your review</span>
                  <textarea
                    className={styles.textarea}
                    placeholder="Share what went well, what could be better…"
                    rows={4}
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                    maxLength={1000}
                  />
                  <span className={styles.counter}>{review.length}/1000</span>
                </div>
              )}
            </div>

            <footer className={styles.footer}>
              <button
                type="button"
                className={`${styles.btn} ${styles.btnGhost}`}
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`${styles.btn} ${styles.btnPrimary}`}
                disabled={!canSubmit}
              >
                Submit Feedback
              </button>
            </footer>
          </form>
        )}
      </div>
    </div>
  );
}

function Question({ label, children }) {
  return (
    <div className={styles.question}>
      <span className={styles.qLabel}>{label}</span>
      <div className={styles.choices}>{children}</div>
    </div>
  );
}

function Choice({ active, onClick, children }) {
  return (
    <button
      type="button"
      className={`${styles.choice} ${active ? styles.choiceActive : ""}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

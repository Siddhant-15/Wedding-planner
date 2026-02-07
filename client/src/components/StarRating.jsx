import React from "react";
import { Star } from "lucide-react";
import styles from "../styles/StarRating.module.css";

export default function StarRating({
  rating,
  maxRating = 5,
  size = "md",
  interactive = false,
  onChange,
  showValue = false,
}) {
  const sizes = {
    sm: 14,
    md: 18,
    lg: 24,
  };

  const iconSize = sizes[size];

  const handleClick = (index) => {
    if (interactive && onChange) {
      onChange(index + 1);
    }
  };

  return (
    <div className={styles.wrapper}>
      {Array.from({ length: maxRating }).map((_, index) => {
        const filled = index < Math.floor(rating);
        const halfFilled = !filled && index < rating;

        return (
          <button
            key={index}
            type="button"
            disabled={!interactive}
            onClick={() => handleClick(index)}
            className={`${styles.starButton} ${
              interactive ? styles.interactive : styles.disabled
            }`}
          >
            <Star
              size={iconSize}
              className={`${styles.star} ${
                filled || halfFilled ? styles.filled : styles.muted
              }`}
              fill={filled ? "currentColor" : "none"}
            />
          </button>
        );
      })}

      {showValue && (
        <span className={styles.value}>{rating.toFixed(1)}</span>
      )}
    </div>
  );
}

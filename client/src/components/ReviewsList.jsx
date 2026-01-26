import React, { useState } from "react";
import {
  Star,
  CheckCircle2,
  ThumbsUp,
  ChevronDown,
  Image as ImageIcon,
  Filter,
} from "lucide-react";
import { format } from "date-fns";
import styles from "../styles/ReviewsList.module.css";

/* ---------- Rating Bar ---------- */
const RatingBar = ({ rating, count, total }) => {
  const percentage = total ? (count / total) * 100 : 0;

  return (
    <div className={styles.ratingBar}>
      <span className={styles.ratingLabel}>{rating}</span>
      <Star size={14} className={styles.starSmallGold} />
      <div className={styles.barTrack}>
        <div className={styles.barFill} style={{ width: `${percentage}%` }} />
      </div>
      <span className={styles.countLabel}>{count}</span>
    </div>
  );
};

/* ---------- Review Card ---------- */
const ReviewCard = ({ review }) => {
  const [expanded, setExpanded] = useState(false);
  const [helpful, setHelpful] = useState(false);

  const shouldTruncate = (review.text?.length ?? 0) > 320;
  const displayText =
    shouldTruncate && !expanded
      ? review.text.slice(0, 320) + "..."
      : review.text || "No review text provided.";

  return (
    <div className={`${styles.reviewCard} ${expanded ? styles.expanded : ""}`}>
      {/* Header */}
      <div className={styles.cardHeader}>
        <div className={styles.avatarWrapper}>
          <img
            src={review.user?.avatar || "/default-avatar.png"}
            alt={review.user?.name || "User"}
            className={styles.avatar}
          />
          {review.isVerified && (
            <CheckCircle2 className={styles.verifiedIcon} size={16} />
          )}
        </div>

        <div className={styles.userInfo}>
          <div className={styles.nameRow}>
            <span className={styles.userName}>
              {review.user?.name || "Anonymous"}
            </span>
            {review.isVerified && (
              <span className={styles.verifiedBadge}>Verified Guest</span>
            )}
          </div>
          <span className={styles.userLocation}>
            {review.user?.location || "—"}
          </span>
        </div>

        <div className={styles.metaRight}>
          <div className={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                size={16}
                className={
                  s <= (review.ratings?.overall || 0)
                    ? styles.starGold
                    : styles.starInactive
                }
              />
            ))}
          </div>
          <time className={styles.date}>
            {review.createdAt
              ? format(new Date(review.createdAt), "MMM d, yyyy")
              : "—"}
          </time>
        </div>
      </div>

      {/* Event info */}
      {(review.eventType || review.event_type) && (
        <div className={styles.eventTag}>
          <span className={styles.eventBadge}>
            {review.eventType || review.event_type}
          </span>
          <span className={styles.eventDate}>
            {review.eventDate || review.event_date
              ? format(new Date(review.eventDate || review.event_date), "MMMM yyyy")
              : ""}
          </span>
        </div>
      )}

      {/* Title & Text */}
      {review.title && <h3 className={styles.reviewTitle}>{review.title}</h3>}
      <p className={styles.reviewText}>{displayText}</p>

      {shouldTruncate && (
        <button
          onClick={() => setExpanded(!expanded)}
          className={styles.readMoreBtn}
        >
          {expanded ? "Show less" : "Read more"}
        </button>
      )}

      {/* Criteria */}
      {review.ratings && (
        <div className={styles.criteriaRow}>
          <div>
            Food & Beverage <strong>{review.ratings.foodBeverage ?? review.ratings.food_beverage ?? "—"}/5</strong>
          </div>
          <div>
            Service <strong>{review.ratings.serviceQuality ?? review.ratings.service_quality ?? "—"}/5</strong>
          </div>
          <div>
            Ambiance <strong>{review.ratings.ambiance ?? review.ratings.ambiance_rating ?? "—"}/5</strong>
          </div>
          <div>
            Value <strong>{review.ratings.valueForMoney ?? review.ratings.value_for_money ?? "—"}/5</strong>
          </div>
        </div>
      )}

      {/* Photos */}
      {review.photos?.length > 0 && (
        <div className={styles.photoGrid}>
          {review.photos.map((photo, i) => (
            <div key={i} className={styles.photoItem}>
              <img src={photo} alt={`Review photo ${i + 1}`} />
            </div>
          ))}
        </div>
      )}

      {/* Vendor Response */}
      {review.response && (
        <div className={styles.vendorResponse}>
          <div className={styles.responseHeader}>Vendor Response</div>
          <p>{review.response.text}</p>
          <time>
            {review.response.date
              ? format(new Date(review.response.date), "MMM d, yyyy")
              : "—"}
          </time>
        </div>
      )}

      {/* Helpful */}
      <button
        className={`${styles.helpfulBtn} ${helpful ? styles.helpfulActive : ""}`}
        onClick={() => setHelpful(!helpful)}
      >
        <ThumbsUp size={18} />
        Helpful
        <span>{(review.helpfulCount || 0) + (helpful ? 1 : 0)}</span>
      </button>
    </div>
  );
};

/* ---------- Main Reviews List ---------- */
export default function ReviewsList({ reviews = [], overallRating, totalReviews }) {
  const [sortBy, setSortBy] = useState("recent");
  const [photosOnly, setPhotosOnly] = useState(false);
  const [showAll, setShowAll] = useState(false);

  // Safeguard: always use array (handles axios response shape)
  const safeReviews = Array.isArray(reviews?.data) 
    ? reviews.data 
    : Array.isArray(reviews) 
      ? reviews 
      : [];

  // Calculate rating distribution for breakdown bars
  const ratingCounts = [0, 0, 0, 0, 0];
  safeReviews.forEach((r) => {
    const overall = r.ratings?.overall || 0;
    if (overall >= 1 && overall <= 5) {
      ratingCounts[overall - 1]++;
    }
  });

  const filteredReviews = safeReviews
    .filter((r) => !photosOnly || (r.photos?.length ?? 0) > 0)
    .sort((a, b) => {
      if (sortBy === "highest") return (b.ratings?.overall ?? 0) - (a.ratings?.overall ?? 0);
      if (sortBy === "lowest") return (a.ratings?.overall ?? 0) - (b.ratings?.overall ?? 0);
      if (sortBy === "helpful") return (b.helpfulCount ?? 0) - (a.helpfulCount ?? 0);
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

  const displayed = showAll ? filteredReviews : filteredReviews.slice(0, 4);

  return (
    <div className={styles.reviewsContainer}>
      {/* Summary */}
      <div className={styles.summaryHeader}>
        <div className={styles.overallScore}>
          <h2 className={styles.scoreValue}>
            {overallRating != null ? overallRating.toFixed(1) : "—"}
          </h2>
          <div className={styles.scoreStars}>
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                size={28}
                className={
                  s <= Math.round(overallRating || 0)
                    ? styles.starGoldLarge
                    : styles.starMutedLarge
                }
              />
            ))}
          </div>
          <p className={styles.reviewCount}>
            Based on {totalReviews || safeReviews.length} reviews
          </p>
        </div>

        {/* Rating Breakdown Bars */}
        <div className={styles.ratingBreakdown}>
          {[5, 4, 3, 2, 1].map((rating) => (
            <RatingBar
              key={rating}
              rating={rating}
              count={ratingCounts[rating - 1]}
              total={safeReviews.length}
            />
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filtersBar}>
        <div className={styles.filterLeft}>
          <Filter size={18} />
          <span>Sort by</span>
        </div>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className={styles.sortSelect}
        >
          <option value="recent">Most Recent</option>
          <option value="highest">Highest Rated</option>
          <option value="lowest">Lowest Rated</option>
          <option value="helpful">Most Helpful</option>
        </select>

        <button
          className={`${styles.photoFilterBtn} ${photosOnly ? styles.active : ""}`}
          onClick={() => setPhotosOnly(!photosOnly)}
        >
          <ImageIcon size={18} />
          With Photos
        </button>
      </div>

      {/* Reviews */}
      {displayed.length === 0 ? (
        <div className={styles.emptyState}>
          <p>No reviews yet. Be the first to share your experience!</p>
        </div>
      ) : (
        <div className={styles.reviewsGrid}>
          {displayed.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      )}

      {!showAll && filteredReviews.length > 4 && (
        <div className={styles.showMoreWrapper}>
          <button
            className={styles.showMoreBtn}
            onClick={() => setShowAll(true)}
          >
            Show All {filteredReviews.length} Reviews
            <ChevronDown size={18} />
          </button>
        </div>
      )}
    </div>
  );
}
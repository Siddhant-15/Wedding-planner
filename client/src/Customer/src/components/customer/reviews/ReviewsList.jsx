import React, { useState } from "react";
import {
  Star,
  CheckCircle2,
  ThumbsUp,
  ChevronDown,
  Image as ImageIcon,
  SlidersHorizontal,
  MessageSquareQuote,
  Pencil,
  Trash2,
} from "lucide-react";
import { format } from "date-fns";
import styles from "../styles/ReviewsList.module.css";

const avatar = "data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 64 64%22><rect width=%2264%22 height=%2264%22 fill=%22%23e5e7eb%22/><circle cx=%2232%22 cy=%2226%22 r=%2212%22 fill=%22%239ca3af%22/><path d=%22M10 60c4-12 12-18 22-18s18 6 22 18z%22 fill=%22%239ca3af%22/></svg>";

/* ---------- Rating Bar ---------- */
const RatingBar = ({ rating, count, total }) => {
  const percentage = total ? (count / total) * 100 : 0;
  return (
    <div className={styles.ratingBar}>
      <span className={styles.ratingLabel}>{rating}</span>
      <Star size={12} className={styles.starSmallGold} fill="currentColor" />
      <div className={styles.barTrack}>
        <div className={styles.barFill} style={{ width: `${percentage}%` }} />
      </div>
      <span className={styles.countLabel}>{count}</span>
    </div>
  );
};

/* ---------- Review Card ---------- */
const ReviewCard = ({ review, currentUserId, onEdit, onDelete }) => {
  const [expanded, setExpanded] = useState(false);
  const [helpful, setHelpful] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const text = review.text || review.review_text || "";
  const shouldTruncate = text.length > 320;
  const displayText =
    shouldTruncate && !expanded
      ? text.slice(0, 320) + "…"
      : text || "No review text provided.";

  const overall =
    review.ratings?.overall ?? review.overall_rating ?? 0;

  const eventType = review.eventType || review.event_type;
  const eventDate = review.eventDate || review.event_date;
  const createdAt = review.createdAt || review.created_at;
  const isVerified = review.isVerified ?? review.is_verified;

  const ratings = review.ratings || {
    foodBeverage: review.food_beverage_rating,
    serviceQuality: review.service_quality_rating,
    ambiance: review.ambiance_rating,
    valueForMoney: review.value_for_money_rating,
  };

  const isOwner =
    currentUserId &&
    (String(review.user_id) === String(currentUserId) ||
      String(review.user?.id) === String(currentUserId));

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete your review?")) {
      setIsDeleting(true);
      try {
        await onDelete(review.id);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <article className={styles.reviewCard}>
      {/* Header */}
      <header className={styles.cardHeader}>
        <div className={styles.avatarWrapper}>
          <img
            src={review.user?.avatar || avatar}
            alt={review.user?.name || "User"}
            className={styles.avatar}
          />
          {isVerified && (
            <CheckCircle2 className={styles.verifiedIcon} size={14} fill="currentColor" />
          )}
        </div>

        <div className={styles.userInfo}>
          <div className={styles.nameRow}>
            <span className={styles.userName}>
              {review.user?.name || "Anonymous"}
            </span>
            {isVerified && (
              <span className={styles.verifiedBadge}>
                <CheckCircle2 size={10} /> Verified
              </span>
            )}
          </div>
          <div className={styles.subRow}>
            <div className={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  size={13}
                  className={s <= overall ? styles.starGold : styles.starInactive}
                  fill={s <= overall ? "currentColor" : "none"}
                />
              ))}
              <span className={styles.scoreInline}>{overall.toFixed(1)}</span>
            </div>
            <span className={styles.metaDot} />
            <time className={styles.date}>
              {createdAt ? format(new Date(createdAt), "MMM d, yyyy") : "—"}
            </time>
          </div>
        </div>

        {isOwner && (
          <div className={styles.ownerActions} style={{ marginLeft: "auto", display: "flex", gap: "8px" }}>
            <button
              type="button"
              onClick={() => onEdit(review)}
              title="Edit review"
              style={{ background: "none", border: "none", cursor: "pointer", color: "#4f46e5", padding: "4px" }}
            >
              <Pencil size={15} />
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              title="Delete review"
              style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", padding: "4px" }}
            >
              <Trash2 size={15} />
            </button>
          </div>
        )}
      </header>

      {/* Event tag */}
      {eventType && (
        <div className={styles.eventTag}>
          <span className={styles.eventBadge}>{eventType}</span>
          {eventDate && (
            <span className={styles.eventDate}>
              {format(new Date(eventDate), "MMMM yyyy")}
            </span>
          )}
        </div>
      )}

      {/* Title & body */}
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

      {/* Sub-criteria */}
      {(ratings.foodBeverage || ratings.serviceQuality ||
        ratings.ambiance || ratings.valueForMoney) && (
          <div className={styles.criteriaRow}>
            {ratings.foodBeverage > 0 && (
              <div className={styles.criteriaPill}>
                <span>Food</span>
                <strong>{ratings.foodBeverage}/5</strong>
              </div>
            )}
            {ratings.serviceQuality > 0 && (
              <div className={styles.criteriaPill}>
                <span>Service</span>
                <strong>{ratings.serviceQuality}/5</strong>
              </div>
            )}
            {ratings.ambiance > 0 && (
              <div className={styles.criteriaPill}>
                <span>Ambiance</span>
                <strong>{ratings.ambiance}/5</strong>
              </div>
            )}
            {ratings.valueForMoney > 0 && (
              <div className={styles.criteriaPill}>
                <span>Value</span>
                <strong>{ratings.valueForMoney}/5</strong>
              </div>
            )}
          </div>
        )}

      {/* Photos */}
      {review.photos?.length > 0 && (
        <div className={styles.photoGrid}>
          {review.photos.map((photo, i) => (
            <div key={i} className={styles.photoItem}>
              <img src={photo} alt={`Review ${i + 1}`} />
            </div>
          ))}
        </div>
      )}

      {/* Vendor response */}
      {review.response && (
        <div className={styles.vendorResponse}>
          <div className={styles.responseHeader}>
            <MessageSquareQuote size={14} />
            <span>Response from owner</span>
          </div>
          <p>{review.response.text}</p>
          {review.response.date && (
            <time>{format(new Date(review.response.date), "MMM d, yyyy")}</time>
          )}
        </div>
      )}

      {/* Helpful */}
      <div className={styles.cardFooter}>
        <button
          className={`${styles.helpfulBtn} ${helpful ? styles.helpfulActive : ""}`}
          onClick={() => setHelpful(!helpful)}
        >
          <ThumbsUp size={14} fill={helpful ? "currentColor" : "none"} />
          Helpful
          <span className={styles.helpfulCount}>
            {(review.helpfulCount || review.helpful_count || 0) + (helpful ? 1 : 0)}
          </span>
        </button>
      </div>
    </article>
  );
};

/* ---------- Main ---------- */
export default function ReviewsList({
  reviews = [],
  overallRating,
  totalReviews,
  ratingBreakdown = null,
  currentUserId = null,
  onEditReview = () => {},
  onDeleteReview = () => {},
}) {
  const [sortBy, setSortBy] = useState("recent");
  const [photosOnly, setPhotosOnly] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const safeReviews = Array.isArray(reviews?.reviews)
    ? reviews.reviews
    : Array.isArray(reviews?.data)
      ? reviews.data
      : Array.isArray(reviews)
        ? reviews
        : [];

  const ratingCounts = [0, 0, 0, 0, 0];
  if (ratingBreakdown && typeof ratingBreakdown === "object") {
    [1, 2, 3, 4, 5].forEach((num) => {
      ratingCounts[num - 1] = ratingBreakdown[String(num)] || ratingBreakdown[num] || 0;
    });
  } else {
    safeReviews.forEach((r) => {
      const overall = r.ratings?.overall || r.overall_rating || 0;
      if (overall >= 1 && overall <= 5) ratingCounts[overall - 1]++;
    });
  }

  const filteredReviews = safeReviews
    .filter((r) => !photosOnly || (r.photos?.length ?? 0) > 0)
    .sort((a, b) => {
      const ao = a.ratings?.overall ?? a.overall_rating ?? 0;
      const bo = b.ratings?.overall ?? b.overall_rating ?? 0;
      if (sortBy === "highest") return bo - ao;
      if (sortBy === "lowest") return ao - bo;
      if (sortBy === "helpful")
        return (b.helpfulCount ?? b.helpful_count ?? 0) -
          (a.helpfulCount ?? a.helpful_count ?? 0);
      return new Date(b.createdAt || b.created_at) -
        new Date(a.createdAt || a.created_at);
    });

  const displayed = showAll ? filteredReviews : filteredReviews.slice(0, 4);
  const score = overallRating != null ? Number(overallRating) : 0;
  const totalCount = totalReviews != null ? Number(totalReviews) : safeReviews.length;

  return (
    <section className={styles.reviewsContainer}>
      {/* Summary */}
      <div className={styles.summaryHeader}>
        <div className={styles.overallScore}>
          <div className={styles.scoreTop}>
            <h2 className={styles.scoreValue}>
              {score ? score.toFixed(1) : "—"}
            </h2>
            <span className={styles.scoreOutOf}>/ 5</span>
          </div>
          <div className={styles.scoreStars}>
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                size={20}
                className={
                  s <= Math.round(score)
                    ? styles.starGoldLarge
                    : styles.starMutedLarge
                }
                fill={s <= Math.round(score) ? "currentColor" : "none"}
              />
            ))}
          </div>
          <p className={styles.reviewCount}>
            Based on <strong>{totalCount}</strong> review
            {totalCount !== 1 ? "s" : ""}
          </p>
        </div>

        <div className={styles.ratingBreakdown}>
          {[5, 4, 3, 2, 1].map((rating) => (
            <RatingBar
              key={rating}
              rating={rating}
              count={ratingCounts[rating - 1]}
              total={totalCount}
            />
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filtersBar}>
        <div className={styles.filterLeft}>
          <SlidersHorizontal size={14} />
          <span>Filter</span>
        </div>

        <div className={styles.filterControls}>
          <div className={styles.selectWrapper}>
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
            <ChevronDown size={14} className={styles.selectChevron} />
          </div>

          <button
            className={`${styles.photoFilterBtn} ${photosOnly ? styles.active : ""}`}
            onClick={() => setPhotosOnly(!photosOnly)}
          >
            <ImageIcon size={14} />
            With photos
          </button>
        </div>
      </div>

      {/* Reviews */}
      {displayed.length === 0 ? (
        <div className={styles.emptyState}>
          <MessageSquareQuote size={28} />
          <p>No reviews yet.</p>
          <span>Be the first to share your experience.</span>
        </div>
      ) : (
        <div className={styles.reviewsGrid}>
          {displayed.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              currentUserId={currentUserId}
              onEdit={onEditReview}
              onDelete={onDeleteReview}
            />
          ))}
        </div>
      )}

      {!showAll && filteredReviews.length > 4 && (
        <div className={styles.showMoreWrapper}>
          <button
            className={styles.showMoreBtn}
            onClick={() => setShowAll(true)}
          >
            Show all {filteredReviews.length} reviews
            <ChevronDown size={16} />
          </button>
        </div>
      )}
    </section>
  );
}

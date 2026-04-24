import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Star, Heart } from "lucide-react";
import styles from "./ServiceCard.module.css";

const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=900&q=80";

const formatINR = (value) => {
  if (value == null) return "On request";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
};

export default function ServiceCard({ service }) {
  const navigate = useNavigate();
  const [imgError, setImgError] = useState(false);
  const [wished, setWished] = useState(false);

  const {
    id,
    name,
    images = [],
    area,
    city,
    rating,
    starting_price,
    service_type,
  } = service;

  const cover = !imgError && images[0] ? images[0] : FALLBACK_IMG;
  const location = [area, city].filter(Boolean).join(", ");

  const goToDetail = () => navigate(`/service/${id}`);

  const toggleWish = (e) => {
    e.stopPropagation();
    setWished((w) => !w);
  };

  return (
    <article
      className={styles.card}
      onClick={goToDetail}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter") goToDetail();
      }}
    >
      <div className={styles.imageWrap}>
        <img
          src={cover}
          alt={name}
          loading="lazy"
          onError={() => setImgError(true)}
        />
        {service_type && (
          <span className={styles.badge}>{service_type.replace("_", " ")}</span>
        )}
        <button
          type="button"
          aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
          className={`${styles.wish} ${wished ? styles.wishActive : ""}`}
          onClick={toggleWish}
        >
          <Heart size={16} fill={wished ? "currentColor" : "none"} />
        </button>
      </div>

      <div className={styles.body}>
        <h3 className={styles.name} title={name}>
          {name}
        </h3>

        {location && (
          <p className={styles.meta}>
            <MapPin size={14} />
            <span>{location}</span>
          </p>
        )}

        <div className={styles.row}>
          <span className={styles.price}>
            {starting_price != null ? (
              <>
                <small>Starts at</small>
                <strong>{formatINR(starting_price)}</strong>
              </>
            ) : (
              <strong>Price on request</strong>
            )}
          </span>

          {rating != null && (
            <span className={styles.rating} aria-label={`Rating ${rating}`}>
              <Star size={14} fill="currentColor" />
              {Number(rating).toFixed(1)}
            </span>
          )}
        </div>

        <button
          type="button"
          className={styles.cta}
          onClick={(e) => {
            e.stopPropagation();
            goToDetail();
          }}
        >
          View Details
        </button>
      </div>
    </article>
  );
}

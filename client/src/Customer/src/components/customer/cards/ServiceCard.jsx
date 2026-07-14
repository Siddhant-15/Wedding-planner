import React, { useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, Star, Heart, ChevronLeft, ChevronRight, BadgeCheck } from "lucide-react";
import styles from "../styles/ServiceCard.module.css";
import WishlistButton from "../../../../../Wishlist/src/components/customer/wishlist/WishlistButton";
import { formatCurrency, formatAddress, getStartingPrice, getAllImages, titleCase } from "../../../utils/format";

export default function ServiceCard({ service }) {
  const [imgIndex, setImgIndex] = useState(0);
  const [imgError, setImgError] = useState(false);

  const images = getAllImages(service);
  const startingPrice = getStartingPrice(service);
  const rating = Number(service?.rating || 0);
  const reviews = Number(service?.total_reviews || 0);

  const next = (e) => { e.preventDefault(); e.stopPropagation(); setImgIndex((i) => (i + 1) % images.length); };
  const prev = (e) => { e.preventDefault(); e.stopPropagation(); setImgIndex((i) => (i - 1 + images.length) % images.length); };
  // const handleWishlist = (e) => { e.preventDefault(); e.stopPropagation(); onWishlistToggle?.(service); };

  return (
    <Link to={`/customer/services/${service.service_type}/${service.id}`} className={styles.card} aria-label={service.name}>
      <div className={styles.imageWrap}>
        {images.length > 0 && !imgError ? (
          <img
            src={images[imgIndex]}
            alt={service.name}
            className={styles.image}
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className={styles.imageFallback}>No image</div>
        )}

        {images.length > 1 && (
          <>
            <button className={`${styles.navBtn} ${styles.navLeft}`} onClick={prev} aria-label="Previous image">
              <ChevronLeft size={18} />
            </button>
            <button className={`${styles.navBtn} ${styles.navRight}`} onClick={next} aria-label="Next image">
              <ChevronRight size={18} />
            </button>
            <div className={styles.dots} aria-hidden>
              {images.map((_, i) => <span key={i} className={i === imgIndex ? styles.dotActive : styles.dot} />)}
            </div>
          </>
        )}

        {/* <button
          type="button"
          onClick={handleWishlist}
          className={`${styles.heart} ${isWishlisted ? styles.heartActive : ""}`}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart size={18} fill={isWishlisted ? "currentColor" : "none"} />
        </button> */}
        <div
          // className={styles.heart}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <WishlistButton
            service={service}
            size="sm"
            variant="floating"
          />
        </div>

        {service.service_type && (
          <span className={styles.typeBadge}>{titleCase(service.service_type)}</span>
        )}
      </div>

      <div className={styles.body}>
        <div className={styles.headerRow}>
          <h3 className={styles.name}>{service.name}</h3>
          {service.is_verified && (
            <span className={styles.verified} title="Verified vendor">
              <BadgeCheck size={14} /> Verified
            </span>
          )}
        </div>

        <p className={styles.location}>
          <MapPin size={14} /> {formatAddress(service)}
        </p>

        {rating > 0 && (
          <div className={styles.ratingRow}>
            <Star size={14} className={styles.starIcon} fill="currentColor" />
            <span className={styles.ratingValue}>{rating.toFixed(1)}</span>
            <span className={styles.ratingCount}>({reviews})</span>
          </div>
        )}

        <div className={styles.footer}>
          {startingPrice ? (
            <>
              <span className={styles.priceLabel}>Starting from</span>
              <span className={styles.price}>{formatCurrency(startingPrice)}</span>
            </>
          ) : (
            <span className={styles.priceLabel}>Price on request</span>
          )}
        </div>
      </div>
    </Link>
  );
}

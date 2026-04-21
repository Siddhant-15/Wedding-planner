import React, { useState, useLayoutEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapPin,
  Heart,
  Building2,
  Star,
  Users,
} from "lucide-react";

import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";
import { showInfo } from "../../utils/toast";
import styles from "../../styles/ServicePage.module.css";

const ServiceCard = ({ service, showCapacity = false }) => {
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const extrasRef = useRef(null);

  // ✅ Correctly calling the hooks
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();

  const inWishlist = isInWishlist?.(service?.id) || false;
  const serviceType = service.service_type?.toLowerCase() || "";

  const handleNext = () =>
    setCurrentImageIndex((prev) =>
      prev === (service.images?.length || 1) - 1 ? 0 : prev + 1
    );

  const handlePrev = () =>
    setCurrentImageIndex((prev) =>
      prev === 0 ? (service.images?.length || 1) - 1 : prev - 1
    );

  const handleNavigateToLogin = () =>
    navigate("/login", { state: { from: window.location.pathname } });

  const handleWishlistToggle = async (e) => {
    e.stopPropagation();

    if (!isAuthenticated) {
      handleNavigateToLogin();
      showInfo("Please log in to use wishlist", "Login Required");
      return;
    }

    try {
      if (inWishlist) {
        await removeFromWishlist(service.id);
      } else {
        await addToWishlist(service.id);
      }
    } catch (err) {
      console.error("Wishlist error:", err);
    }
  };

  const handleCardClick = () => navigate(`/service/${service.id}`);

  // Formatters
  const formatPrice = (price) => {
    if (price === null || price === undefined) return "Price on request";
    return `₹${Number(price).toLocaleString("en-IN")}`;
  };

  const formatAddress = () => {
    const parts = [service.area, service.city, service.state].filter(Boolean);
    return parts.length > 0 ? parts.join(", ") : "Location not specified";
  };

  const capitalize = (str) =>
    typeof str === "string" ? str.charAt(0).toUpperCase() + str.slice(1) : "";

  // Dynamic Price Logic (from variants if top-level price not present)
  let displayPrice = service.price;
  if (!displayPrice && service.variants?.length > 0) {
    const prices = service.variants
      .map((v) => v.pricing?.base_price || v.pricing?.per_plate)
      .filter((p) => p > 0);
    if (prices.length > 0) displayPrice = Math.min(...prices);
  }

  // Get Extras (especially good for venues)
  const getExtras = () => {
    const extras = [];

    // Venue Specific
    if (serviceType === "venue" && service.venue) {
      const v = service.venue;

      if (showCapacity && v.max_capacity) {
        extras.push(`Up to ${v.max_capacity} Guests`);
      } else if (v.max_capacity) {
        extras.push(`${v.max_capacity} Capacity`);
      }

      if (v.venue_type) extras.push(capitalize(v.venue_type));
      if (v.venue_nature) extras.push(capitalize(v.venue_nature));

      if (v.parking_capacity > 0) {
        extras.push(`Parking: ${v.parking_capacity}`);
      }

      if (v.amenities && Array.isArray(v.amenities) && v.amenities.length > 0) {
        extras.push(...v.amenities.slice(0, 3).map(capitalize));
      }

      // Policies
      if (v.venue_policies?.alcohol_policy === "allowed") {
        extras.push("Alcohol Allowed");
      }
      if (v.venue_policies?.catering_policy === "in-house-only") {
        extras.push("In-House Catering");
      }
      if (v.venue_policies?.decoration_policy === "allowed") {
        extras.push("Decoration Allowed");
      }
    }

    // Fallback for other services or when no extras
    if (extras.length === 0 && service.variants?.length > 0) {
      const firstVariant = service.variants[0];
      extras.push(`${service.variants.length} Package${service.variants.length > 1 ? "s" : ""}`);
      if (firstVariant.inclusions?.length > 0) {
        extras.push(...firstVariant.inclusions.slice(0, 2).map(capitalize));
      }
    }

    return [...new Set(extras.filter(Boolean))];
  };

  const extras = getExtras();
  const [visibleCount, setVisibleCount] = useState(extras.length);
  const visibleExtras = extras.slice(0, visibleCount);
  const hiddenExtras = extras.slice(visibleCount);

  // Responsive extras chips
  useLayoutEffect(() => {
    if (!extrasRef.current || extras.length === 0) return;

    const containerWidth = extrasRef.current.offsetWidth;
    const children = Array.from(extrasRef.current.children);
    let usedWidth = 0;
    let count = 0;

    for (let child of children) {
      const style = window.getComputedStyle(child);
      const margin = parseFloat(style.marginLeft) + parseFloat(style.marginRight);
      const totalWidth = child.offsetWidth + margin;

      if (usedWidth + totalWidth > containerWidth) break;
      usedWidth += totalWidth;
      count++;
    }

    setVisibleCount(Math.max(1, count - 1));
  }, [extras.length]);

  return (
    <div className={styles.card} onClick={handleCardClick} style={{ cursor: "pointer" }}>
      <div className={styles.imageWrapper}>
        {service.images?.length > 0 ? (
          <div className={styles.carousel}>
            <img
              src={service.images[currentImageIndex]}
              alt={service.name}
              className={styles.cardImage}
            />
            {service.images.length > 1 && (
              <>
                <button
                  className={styles.prevButton}
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrev();
                  }}
                >
                  ❮
                </button>
                <button
                  className={styles.nextButton}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNext();
                  }}
                >
                  ❯
                </button>
                <div className={styles.carouselDots}>
                  {service.images.map((_, i) => (
                    <span
                      key={i}
                      className={`${styles.dot} ${i === currentImageIndex ? styles.active : ""}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentImageIndex(i);
                      }}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        ) : (
          <img
            src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&q=80"
            alt="Fallback"
            className={styles.cardImage}
          />
        )}

        {/* Wishlist Button */}
        <button
          className={`${styles.wishlistButton} ${inWishlist ? styles.active : ""}`}
          onClick={handleWishlistToggle}
          aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart size={18} fill={inWishlist ? "currentColor" : "none"} />
        </button>

        {/* Info Button */}
        <span className={styles.infoWrapper}>
          <button
            className={styles.infoBtn}
            onClick={(e) => e.stopPropagation()}
            aria-label="Service info"
          >
            i
          </button>
          <div className={styles.infoPopover}>
            <div className={styles.infoHeader}>Description</div>
            <div className={styles.infoContent}>
              {service.description || "No description available."}
            </div>
          </div>
        </span>
      </div>

      <div className={styles.cardContent}>
        <div className={styles.titleRatingRow}>
          <h3 className={styles.cardTitle}>{service.name}</h3>
          {(service.rating || service.total_reviews > 0) && (
            <div className={styles.ratingInline}>
              <Star size={16} fill="currentColor" style={{ color: "#fbbf24" }} />
              <span>
                {service.rating?.toFixed(1) || "N/A"}
                {service.total_reviews > 0 && ` (${service.total_reviews})`}
              </span>
            </div>
          )}
        </div>

        <div className={styles.cardLocation}>
          <MapPin size={14} />
          {formatAddress()}
        </div>

        <div className={styles.priceHallRow}>
          {serviceType === "venue" && service.venue && (
            <div className={styles.venueHighlights}>
              {service.venue.venue_nature && (
                <div className={styles.highlightItem}>
                  <Building2 size={15} />
                  <span>{capitalize(service.venue.venue_nature)}</span>
                </div>
              )}
              {showCapacity && service.venue.max_capacity && (
                <div className={styles.highlightItem}>
                  <Users size={15} />
                  <span>Up to {service.venue.max_capacity}</span>
                </div>
              )}
            </div>
          )}

          <div className={styles.priceBlock}>
            <span className={styles.cardPrice}>
              {formatPrice(displayPrice)}
            </span>

            {serviceType === "venue" && service.venue?.venue_nature && (
              <div className={styles.hallTypeBadge}>
                <Building2 size={15} strokeWidth={2.1} />
                <span>{capitalize(service.venue.venue_nature)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Extras Chips */}
        <div className={styles.extrasRow}>
          <div className={styles.extrasLeft} ref={extrasRef}>
            {visibleExtras.map((item, idx) => (
              <span key={idx} className={styles.extraChip}>
                {item}
              </span>
            ))}
          </div>

          {hiddenExtras.length > 0 && (
            <div className={styles.moreWrapper}>
              <span className={styles.moreText}>+{hiddenExtras.length} more</span>
              <div className={styles.morePopover}>
                {hiddenExtras.map((item, idx) => (
                  <div key={idx} className={styles.popoverItem}>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServiceCard;
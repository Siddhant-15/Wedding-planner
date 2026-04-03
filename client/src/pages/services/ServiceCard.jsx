import React, { useState, useLayoutEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapPin, Heart, Building2, Star, Camera, Video,
  Music4, Clock, Mic2, CalendarHeart, Briefcase
} from "lucide-react";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";
import { showInfo } from "../../utils/toast";
import styles from "../../styles/ServicePage.module.css";

const ServiceCard = ({ service }) => {
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const extrasRef = useRef(null);

  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();

  const inWishlist = isInWishlist(service.id);
  const serviceType = service.service_type?.toLowerCase() || "";

  const handleNext = () => setCurrentImageIndex((prev) => prev === (service.images?.length || 1) - 1 ? 0 : prev + 1);
  const handlePrev = () => setCurrentImageIndex((prev) => prev === 0 ? (service.images?.length || 1) - 1 : prev - 1);
  const handleNavigateToLogin = () => navigate('/login', { state: { from: window.location.pathname } });
  
  const handleWishlistToggle = async (e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      handleNavigateToLogin();
      showInfo("Please log in to use wishlist", "Login Required");
      return;
    }
    try {
      if (inWishlist) await removeFromWishlist(service.id);
      else await addToWishlist(service.id);
    } catch (err) { console.error("Wishlist error", err); }
  };

  const handleCardClick = () => navigate(`/service/${service.id}`);

  // Base utilities
  const formatPrice = (price) => {
    if (price === null || price === undefined) return "Price on request";
    return `₹${Number(price).toLocaleString("en-IN")}`;
  };

  const formatAddress = () => {
    const parts = [service.area, service.city, service.state].filter(Boolean);
    return parts.length > 0 ? parts.join(", ") : "Location not specified";
  };
  const capitalize = (str) => typeof str === "string" ? str.charAt(0).toUpperCase() + str.slice(1) : "";

  // Dynamic Extractors from the new variants/venue DB structure
  const meta = service.metadata || {};
  const firstVariant = service.variants?.[0] || {};
  
  // Base Price Logic (Find min price in variants if not provided top-level)
  let displayPrice = service.price;
  if (!displayPrice && service.variants?.length > 0) {
    const prices = service.variants.map(v => v.pricing?.base_price || v.pricing?.per_plate || 0).filter(p => p > 0);
    if (prices.length > 0) displayPrice = Math.min(...prices);
  }

  const getExtras = () => {
    const extras = [];
    
    // Process venue Data
    if (serviceType === "venue" && service.venue) {
      const v = service.venue;
      if (v.max_capacity) extras.push(`Up to ${v.max_capacity} Guests`);
      if (v.venue_type) extras.push(capitalize(v.venue_type));
      if (v.parking_capacity > 0) extras.push(`Parking for ${v.parking_capacity}`);
      if (v.amenities && v.amenities.length > 0) extras.push(...v.amenities.slice(0, 3).map(capitalize));
    }
    
    // Process Variants/Metadata Data (For other categories)
    if (serviceType === "catering") {
      const v = firstVariant;
      if (v.pricing?.veg) extras.push(`Veg: ₹${v.pricing.veg}/plate`);
      if (v.pricing?.nonveg) extras.push(`Non-Veg: ₹${v.pricing.nonveg}/plate`);
      if (v.menu?.cuisines) extras.push(...(Array.isArray(v.menu.cuisines) ? v.menu.cuisines : [v.menu.cuisines]));
    }
    
    if (serviceType === "dj") {
      if (meta.genres) extras.push(...(Array.isArray(meta.genres) ? meta.genres : []).map(capitalize));
      if (meta.equipment) extras.push("Premium Audio");
    }
    
    if (serviceType === "photographer") {
      if (firstVariant.deliverables?.photos) extras.push(`${firstVariant.deliverables.photos}+ Photos`);
      if (firstVariant.inclusions?.includes("drone") || meta.drone) extras.push("Drone Included");
      if (firstVariant.inclusions?.includes("album") || meta.album) extras.push("Album Included");
    }
    
    if (serviceType === "event_management") {
      if (meta.experience_years) extras.push(`${meta.experience_years} Yrs Exp`);
      if (firstVariant.inclusions) extras.push(...firstVariant.inclusions.slice(0, 2).map(capitalize));
    }
    
    // Fallback tagging logic
    if (service.variants?.length > 0 && extras.length === 0) {
      extras.push(`${service.variants.length} Packages Available`);
      service.variants[0].inclusions?.slice(0, 2).forEach(inc => extras.push(capitalize(inc)));
    }

    return [...new Set(extras.filter(Boolean))];
  };

  const extras = getExtras();
  const [visibleCount, setVisibleCount] = useState(extras.length);
  const visibleExtras = extras.slice(0, visibleCount);
  const hiddenExtras = extras.slice(visibleCount);

  // Resize Listener logic for chips
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
    <div className={styles.card} onClick={handleCardClick} style={{ cursor: 'pointer' }}>
      <div className={styles.imageWrapper}>
        {service.images && service.images.length > 0 ? (
          <div className={styles.carousel}>
            <img src={service.images[currentImageIndex]} alt={service.name} className={styles.cardImage} />
            {service.images.length > 1 && (
              <>
                <button className={styles.prevButton} onClick={(e) => { e.stopPropagation(); handlePrev(); }}>❮</button>
                <button className={styles.nextButton} onClick={(e) => { e.stopPropagation(); handleNext(); }}>❯</button>
                <div className={styles.carouselDots}>
                  {service.images.map((_, i) => (
                    <span
                      key={i}
                      className={`${styles.dot} ${i === currentImageIndex ? styles.active : ""}`}
                      onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(i); }}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        ) : (
          <img src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&q=80" alt="Fallback" className={styles.cardImage} />
        )}

        <button
          className={`${styles.wishlistButton} ${inWishlist ? styles.active : ''}`}
          onClick={handleWishlistToggle}
          aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart size={18} fill={inWishlist ? "currentColor" : "none"} />
        </button>
        <span className={styles.infoWrapper}>
          <button className={styles.infoBtn} onClick={(e) => e.stopPropagation()} aria-label="Service info">i</button>
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
              <Star size={16} fill="currentColor" style={{ color: '#fbbf24' }} />
              <span>
                {service.rating?.toFixed(1) || 'N/A'}
                <span className={styles.totalreviews}>
                  {service.total_reviews > 0 && ` (${service.total_reviews})`}
                </span>
              </span>
            </div>
          )}
        </div>

        <div className={styles.cardLocation}>
          <MapPin size={14} />
          {formatAddress()}
        </div>

        <div className={styles.priceHallRow}>
          {serviceType === "dj" && (
            <div className={styles.djHighlights}>
              {meta.genres && (
                <div className={styles.highlightItem}>
                  <Music4 size={15} />
                  <span>{Array.isArray(meta.genres) ? meta.genres.slice(0,3).join(" • ") : meta.genres}</span>
                </div>
              )}
            </div>
          )}
          {serviceType === "event_management" && (
            <div className={styles.eventMgmtHighlights}>
              {meta.experience_years && (
                <div className={styles.highlightItem}>
                  <Briefcase size={15} />
                  <span>{meta.experience_years}+ yrs exp</span>
                </div>
              )}
            </div>
          )}

          {serviceType === "photographer" && (
            <div className={styles.photographerHighlights}>
              {firstVariant.deliverables?.photos && (
                <div className={styles.highlightItem}>
                  <Camera size={15} />
                  <span>~{firstVariant.deliverables.photos} photos</span>
                </div>
              )}
              <div className={styles.photoTypeBadge}>
                {firstVariant.inclusions?.includes("video") || meta.video ? (
                  <><Video size={14} /> Photos + Videos</>
                ) : (
                  <><Camera size={14} /> Photography</>
                )}
              </div>
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

        <div className={styles.extrasRow}>
          <div className={styles.extrasLeft} ref={extrasRef}>
            {visibleExtras.map((item, idx) => (
              <span key={idx} className={styles.extraChip}>{item}</span>
            ))}
          </div>
          {hiddenExtras.length > 0 && (
            <div className={styles.moreWrapper}>
              <span className={styles.moreText}>+{hiddenExtras.length} more</span>
              <div className={styles.morePopover}>
                {hiddenExtras.map((item, idx) => (
                  <div key={idx} className={styles.popoverItem}>{item}</div>
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
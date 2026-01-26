import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapPin, Home, Car, Utensils, Music,
  Heart, ShoppingCart, ChevronDown, ChevronUp, Star
} from "lucide-react";
import { Camera, Video } from "lucide-react";
import { Building2 } from "lucide-react";
import { Music4, Clock, Mic2, Speaker, Lightbulb, Zap } from "lucide-react";
import { CalendarHeart, Users, Briefcase, Sparkles } from "lucide-react";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";
import { showSuccess, showInfo } from '../../utils/toast';
import styles from "../../styles/ServicePage.module.css";
import { useLayoutEffect, useRef } from "react";

const ServiceCard = ({ service }) => {
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const extrasRef = useRef(null);


  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();

  const inWishlist = isInWishlist(service.id);
  const serviceType = service.service_type?.toLowerCase();



  const handleNext = () => {
    setCurrentImageIndex((prev) =>
      prev === service.images.length - 1 ? 0 : prev + 1
    );
  };

  const handlePrev = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? service.images.length - 1 : prev - 1
    );
  };

  const handleNavigateToLogin = () => {
    navigate('/login', { state: { from: window.location.pathname } });
  };

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
    } catch (err) { }
  };

  const handleCardClick = () => {
    navigate(`/service/${service.id}`);
  };

  // Price formatting
  const formatPrice = (price) => {
    if (price === null || price === undefined) return "Price on request";
    return `₹${Number(price).toLocaleString("en-IN")}`;
  };

  // Address formatting
  const formatAddress = () => {
    const parts = [
      service.area,
      service.city,
      service.state
    ].filter(Boolean);
    return parts.length > 0 ? parts.join(", ") : "Location not specified";
  };

  const capitalize = (str) =>
    typeof str === "string"
      ? str.charAt(0).toUpperCase() + str.slice(1)
      : "";


  const formatYesNo = (value, yesText, noText) =>
    value === "allowed" || value === true
      ? yesText
      : value === "not_allowed" || value === false
        ? noText
        : null;

  const getExtras = () => {
    const extras = [];

    switch (serviceType) {
      /* ===================== VENUE ===================== */
      case "venue": {
        const v = service.venue;

        if (v?.capacity_max) {
          extras.push(
            `Guest Capacity: ${v.capacity_min ? `${v.capacity_min}–` : ""
            }${v.capacity_max}`
          );
        }

        if (v?.hall_type) {
          extras.push(`${capitalize(v.hall_type)} Hall`);
        }

        if (v?.indoor_outdoor) {
          extras.push(
            v.indoor_outdoor === "indoor"
              ? "Indoor Venue"
              : v.indoor_outdoor === "outdoor"
                ? "Outdoor Venue"
                : "Indoor & Outdoor Venue"
          );
        }

        if (v?.parking_capacity) {
          extras.push(`Parking Available (${v.parking_capacity} cars)`);
        }

        const decoration = formatYesNo(
          v?.decoration_policy,
          "Decoration Allowed",
          "Outside Decoration Not Allowed"
        );
        if (decoration) extras.push(decoration);

        const catering = formatYesNo(
          v?.catering_policy,
          "Outside Catering Allowed",
          "In-house Catering Only"
        );
        if (catering) extras.push(catering);

        const alcohol = formatYesNo(
          v?.alcohol_policy,
          "Alcohol Allowed",
          "Alcohol Not Allowed"
        );
        if (alcohol) extras.push(alcohol);

        if (Array.isArray(service.amenities)) {
          extras.push(
            ...service.amenities.map((a) => capitalize(a))
          );
        }

        break;
      }

      /* ===================== CATERING ===================== */
      case "catering": {
        const c = service.catering;

        if (c?.veg_price_per_head)
          extras.push(`Veg: ₹${c.veg_price_per_head.toLocaleString()}/plate`);

        if (c?.nonveg_price_per_head)
          extras.push(`Non-Veg: ₹${c.nonveg_price_per_head.toLocaleString()}/plate`);

        if (c?.cuisine_types?.length)
          extras.push(
            ...c.cuisine_types.map((cuisine) => capitalize(cuisine))
          );

        if (c?.service_style)
          extras.push(`${capitalize(c.service_style)} Service`);

        if (c?.tasting_available)
          extras.push("Food Tasting Available");

        break;
      }

      /* ===================== DJ ===================== */
      case "dj": {
        const d = service.dj;
        const extras = [];

        // 1. Genres – most important, always show
        if (d?.genres_supported?.length) {
          extras.push(...d.genres_supported.map(g => capitalize(g)));
        }

        // 2. Duration – show in more natural way
        if (d?.duration_hours) {
          const hours = Math.round(d.duration_hours);
          if (hours >= 6) {
            extras.push("Full Night Coverage");
          } else if (hours >= 4) {
            extras.push(`Up to ${hours} hrs`);
          } else {
            extras.push(`${hours} hrs Performance`);
          }
        }

        // 3. Equipment highlights (selective – don't show everything)
        if (d?.equipment?.length >= 4 || d.equipment?.includes("Subwoofer")) {
          extras.push("Premium Sound + Bass");
        }

        // 4. Lighting – very important for DJ perception
        if (d?.lighting_included === true) {
          extras.push("Party Lighting Included");
        } else if (d?.lighting_included === false) {
          extras.push("Lighting on Request");
        }

        // 5. MC – strong selling point
        if (d?.mc_host_available === true) {
          extras.push("Energetic MC Option");
        }

        // 6. Long setup time – better to warn
        if (d?.setup_time_required >= 3) {
          extras.push(`Setup: ~${Math.round(d.setup_time_required)} hrs`);
        }

        return extras;
      }

      /* ===================== PHOTOGRAPHER ===================== */
      case "photographer": {
        const p = service.photographer;

        // Package types (very important for users)
        if (Array.isArray(p?.package_type) && p.package_type.length > 0) {
          extras.push(...p.package_type.map(type => capitalize(type)));
        }

        // Hours – already in highlights, but can repeat in chip if needed
        // (usually not necessary)

        // Photos delivered – already in highlights, optional chip
        if (p?.photos_delivered >= 400) {
          extras.push(`High Volume (~${p.photos_delivered}+)`);
        } else if (p?.photos_delivered) {
          extras.push(`${p.photos_delivered}+ Photos`);
        }

        // Edited photos (strong quality signal)
        if (p?.edited_photos_count) {
          extras.push(`Edited: ${p.edited_photos_count}+`);
        }

        // Delivery time (very important!)
        if (p?.delivery_time_days) {
          const days = Math.round(p.delivery_time_days);
          if (days <= 10) {
            extras.push(`Fast Delivery (~${days} days)`);
          } else if (days <= 21) {
            extras.push(`Standard Delivery (${days} days)`);
          } else {
            extras.push(`Delivery in ${days} days`);
          }
        }

        // Drone – very attractive feature
        if (p?.drone_available === true) {
          extras.push("Drone Shots Included");
        }

        // Album – strong selling point
        if (p?.album_included === true) {
          extras.push("Premium Album Included");
        }

        // Videography – already shown in badge, but can add chip too if you want
        // if (p?.videography_included) {
        //   extras.push("Videography Included");
        // }

        break;
      }

      /* ===================== EVENT MANAGEMENT ===================== */
      case "event_management": {
        const e = service.event_management;

        // Event types — still good to have as chips too (people love seeing them)
        if (e?.event_types?.length) {
          extras.push(...e.event_types.map(type => capitalize(type)));
        }

        // Experience (also good as chip for longer visibility)
        if (e?.experience_years) {
          extras.push(
            e.experience_years >= 10
              ? `${e.experience_years}+ Years Experience`
              : `${e.experience_years} Years Experience`
          );
        }

        // Team size - very important trust signal
        if (e?.team_size) {
          extras.push(
            e.team_size >= 12
              ? `Large Team (${e.team_size} members)`
              : `Team of ${e.team_size}`
          );
        }

        // Selective inclusions (most attractive ones)
        if (Array.isArray(e?.includes)) {
          const important = ["Decoration", "Vendor Coordination", "Logistics", "Entertainment", "Planning"];
          const matched = e.includes.filter(item => important.includes(item));
          if (matched.length > 0) {
            extras.push(...matched.map(item => capitalize(item)));
          } else if (e.includes.length >= 3) {
            extras.push("Full-Service Planning");
          }
        }

        // Vendor network — strong premium signal
        if (e?.vendor_network_size >= 30) {
          extras.push("Extensive Vendor Network");
        } else if (e?.vendor_network_size >= 15) {
          extras.push("Strong Vendor Network");
        }

        break;
      }

      /* ===================== FALLBACK ===================== */
      default:
        // Safety: show generic tags if backend adds new data
        if (Array.isArray(service.extras)) {
          extras.push(...service.extras);
        }
        break;
    }

    // Remove duplicates & empty values
    return [...new Set(extras.filter(Boolean))];
  };


  const extras = getExtras();
  const [visibleCount, setVisibleCount] = useState(extras.length);
  const visibleExtras = extras.slice(0, visibleCount);
  const hiddenExtras = extras.slice(visibleCount);

  useLayoutEffect(() => {
    if (!extrasRef.current) return;

    const containerWidth = extrasRef.current.offsetWidth;
    const children = Array.from(extrasRef.current.children);

    let usedWidth = 0;
    let count = 0;

    for (let child of children) {
      const style = window.getComputedStyle(child);
      const margin =
        parseFloat(style.marginLeft) + parseFloat(style.marginRight);

      const totalWidth = child.offsetWidth + margin;

      if (usedWidth + totalWidth > containerWidth) break;

      usedWidth += totalWidth;
      count++;
    }

    setVisibleCount(Math.max(1, count - 1)); // leave space for "+X more"
  }, [extras]);




  return (
    <div className={styles.card} onClick={handleCardClick} style={{ cursor: 'pointer' }}>
      <div className={styles.imageWrapper}>
        {service.images && service.images.length > 0 ? (
          <div className={styles.carousel}>
            <img
              src={service.images[currentImageIndex]}
              alt={service.name}
              className={styles.cardImage}
            />
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
          <img src="https://via.placeholder.com/340x220" alt="No image" className={styles.cardImage} />
        )}

        <button
          className={`${styles.wishlistButton} ${inWishlist ? styles.active : ''}`}
          onClick={handleWishlistToggle}
          aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart size={18} fill={inWishlist ? "currentColor" : "none"} />
        </button>
        <span className={styles.infoWrapper}>
          <button
            className={styles.infoBtn}
            onClick={(e) => e.stopPropagation()}
            aria-label="Service information"
          >
            i
          </button>

          <div className={styles.infoPopover}>
            <div className={styles.infoHeader}>About Vendor</div>
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
                  {service.total_reviews > 0 && ` (${service.total_reviews} reviews)`}
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
          {serviceType === "dj" && service.dj && (
            <div className={styles.djHighlights}>
              {service.dj.genres_supported?.length > 0 && (
                <div className={styles.highlightItem}>
                  <Music4 size={15} />
                  <span>{service.dj.genres_supported.slice(0, 4).join(" • ")}</span>
                </div>
              )}

              {service.dj.duration_hours && (
                <div className={styles.highlightItem}>
                  <Clock size={15} />
                  <span>{Math.floor(service.dj.duration_hours)} hrs performance</span>
                </div>
              )}

              {service.dj.mc_host_available && (
                <div className={styles.highlightItem}>
                  <Mic2 size={15} />
                  <span>Live MC Available</span>
                </div>
              )}
            </div>
          )}
          {serviceType === "event_management" && service.event_management && (
            <div className={styles.eventMgmtHighlights}>
              {/* Most important: event types */}
              {service.event_management.event_types?.length > 0 && (
                <div className={styles.highlightItem}>
                  <CalendarHeart size={15} />
                  <span>
                    {service.event_management.event_types.slice(0, 3).join(" • ")}
                    {service.event_management.event_types.length > 3 ? " + more" : ""}
                  </span>
                </div>
              )}
             
              {/* Second most important: experience */}
              {service.event_management.experience_years && (
                <div className={styles.highlightItem}>
                  <Briefcase size={15} />
                  <span>{service.event_management.experience_years}+ yrs exp</span>
                </div>
              )}
            </div>
          )}

          {serviceType === "photographer" && service.photographer && (
    <div className={styles.photographerHighlights}>
      {service.photographer.hours_covered && (
        <div className={styles.highlightItem}>
          <Clock size={15} />
          <span>{Math.round(service.photographer.hours_covered)} hrs coverage</span>
        </div>
      )}

      {service.photographer.photos_delivered && (
        <div className={styles.highlightItem}>
          <Camera size={15} />
          <span>~{service.photographer.photos_delivered} photos</span>
        </div>
      )}

      {/* Photo/Video status badge */}
      <div className={styles.photoTypeBadge}>
        {service.photographer.videography_included ? (
          <>
            <Video size={14} /> Photos + Videos
          </>
        ) : (
          <>
            <Camera size={14} /> Photography Only
          </>
        )}
      </div>
    </div>
  )}
          <div className={styles.priceBlock}>
            <span className={styles.cardPrice}>
              {formatPrice(service.price)}
            </span>
            {serviceType === "venue" && service.venue?.hall_type && (
              <div className={styles.hallTypeBadge}>
                <Building2 size={15} strokeWidth={2.1} />
                <span>{capitalize(service.venue.hall_type)} Hall</span>
              </div>
            )}
          </div>
        </div>

        <div className={styles.extrasRow}>
          <div className={styles.extrasLeft} ref={extrasRef}>
            {extras.map((item, idx) => (
              <span key={idx} className={styles.extraChip}>
                {item}
              </span>
            ))}
          </div>

          {hiddenExtras.length > 0 && (
            <div className={styles.moreWrapper}>
              <span className={styles.moreText}>
                +{hiddenExtras.length} more
              </span>

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
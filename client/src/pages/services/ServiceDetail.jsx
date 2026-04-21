import React, { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  Heart,
  Home,
  Users,
} from "lucide-react";

import { showSuccess } from "../../utils/toast";
import styles from "../../styles/ServiceDetail.module.css";
import Navbar from "../../components/Navbar";

// API
import { customerService } from "../../utils/api/services/customer.service";
import { reviewService } from "../../utils/api/services/review.service";

// Components
import ImageGallery from "../../components/ImageGallery";
import StarRating from "../../components/StarRating";
import AvailabilityForm from "../../components/AvailabilityForm";
import VendorCard from "../../components/VendorCard";
import VenueSpecsCard from "../../components/VenueSpecsCard";
import CateringSpecsCard from "../../components/CateringSpecsCard";
import AddressCard from "../../components/AdddressCard";
import WriteReviewForm from "../../components/WriteReviewForm";
import ReviewsList from "../../components/ReviewsList";
import AmenitiesCard from "../../components/AmenitiesCard";
import TagsCard from "../../components/TagsCard";
import MobileBottomBar from "../../components/MobileBottomBar";

const formatPrice = (price) => {
  if (!price) return "Price on request";
  if (price >= 100000) return `₹${(price / 100000).toFixed(1)} Lakh onwards`;
  if (price >= 1000) return `₹${(price / 1000).toFixed(0)}K onwards`;
  return `₹${price} onwards`;
};

export default function ServiceDetail() {
  const { id } = useParams();

  const [service, setService] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [inWishlist, setInWishlist] = useState(false);

  const availabilityRef = useRef(null);

  useEffect(() => {
    const fetchService = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await customerService.getDetail(id);
        setService(data);

        try {
          const reviewRes = await reviewService.getAll(id);
          const reviewList = reviewRes?.data || [];
          setReviews(Array.isArray(reviewList) ? reviewList : []);
        } catch (reviewErr) {
          console.warn("Reviews fetch failed:", reviewErr);
          setReviews([]);
        }
      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to load service details");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchService();
  }, [id]);

  // ==================== IMPROVED PRICING LOGIC ====================
  const getStartingPrice = (service) => {
    if (!service) return null;

    const type = service.service_type?.toLowerCase();

    // Special handling for Catering
    if (type === "catering") {
      const { catering } = service;

      if (catering?.veg_price_per_head) {
        return catering.veg_price_per_head;
      }
      if (catering?.non_veg_price_per_head) {
        return catering.non_veg_price_per_head;
      }
      if (catering?.min_order) {
        // Fallback: show min order size
        return `Min ${catering.min_order} guests`;
      }
    }

    // For other services: Try to get price from variants
    if (service.variants?.length > 0) {
      const prices = [];

      service.variants.forEach((v) => {
        const p = v.pricing;
        if (p?.base_price) prices.push(p.base_price);
        if (p?.per_plate) prices.push(p.per_plate);
        if (p?.per_head) prices.push(p.per_head);
        if (p?.veg_price) prices.push(p.veg_price);
        if (p?.non_veg_price) prices.push(p.non_veg_price);
      });

      if (prices.length > 0) {
        return Math.min(...prices);
      }
    }

    return null;
  };

  // Get display price text for main price block
  const getPriceDisplay = (service) => {
    const type = service.service_type?.toLowerCase();

    if (type === "catering") {
      const c = service.catering;
      if (c?.veg_price_per_head || c?.non_veg_price_per_head) {
        let text = "";
        if (c.veg_price_per_head) text += `Veg: ₹${c.veg_price_per_head}`;
        if (c.non_veg_price_per_head) {
          text += text ? " | " : "";
          text += `Non-Veg: ₹${c.non_veg_price_per_head}`;
        }
        return text || "Price on request";
      }
    }

    // Default for other services
    const starting = getStartingPrice(service);
    return formatPrice(starting);
  };

  const handleReviewSubmitted = (newReview) => {
    setReviews((prev) => [newReview, ...prev]);
    showSuccess({
      title: "Review Submitted!",
      description: "Thank you for sharing your experience!",
    });
  };

  const toggleWishlist = () => {
    setInWishlist(!inWishlist);
    showSuccess({
      title: inWishlist ? "Removed from Wishlist" : "Added to Wishlist",
    });
  };

  if (loading) {
    return (
      <div className={styles.loader}>
        <div className={styles.loaderSpinner} />
        <p>Loading beautiful details...</p>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className={styles.notFound}>
        <h2>Oops!</h2>
        <p>{error || "We couldn't find this service."}</p>
        <Link to="/" className={styles.backHome}>
          Back to Home
        </Link>
      </div>
    );
  }

  const renderServiceSpecificCard = () => {
    const type = service.service_type?.toLowerCase();

    switch (type) {
      case "venue":
        return service.venue && <VenueSpecsCard venue={service.venue} />;
      case "catering":
        return service.catering && <CateringSpecsCard catering={service.catering} />;
      case "dj":
        return service.dj && <DjSpecsCard dj={service.dj} />;        // TODO: Create later
      case "photography":
        return service.photography && <PhotographySpecsCard photography={service.photography} />;
      default:
        return null;
    }
  };

  return (
    <div className={styles.page}>
      <Navbar />

      <div className={styles.container}>
        <Link to="/" className={styles.backLink}>
          <ArrowLeft size={18} />
          Back to Services
        </Link>

        <div className={styles.mainGrid}>
          {/* Left Column – Main Content */}
          <div className={styles.leftColumn}>
            <div className={styles.galleryWrapper}>
              <ImageGallery images={service.images || []} />
            </div>

            <div className={styles.contentCard}>
              <div className={styles.badges}>
                <span className={styles.badge}>
                  <Home size={14} /> {service.service_type || "Service"}
                </span>
                {service.verified && <span className={styles.verifiedBadge}>Verified</span>}
                {service.featured && <span className={styles.featuredBadge}>Featured</span>}
              </div>

              <h1 className={styles.serviceTitle}>{service.name}</h1>

              <div className={styles.metaRow}>
                <StarRating rating={service.rating || 0} size={20} />
                <span className={styles.location}>
                  <MapPin size={16} />
                  {service.city}, {service.state}
                </span>
              </div>

              <div className={styles.description}>
                <p>{service.long_description || service.description}</p>
              </div>

              {/* ==================== UPDATED PRICE BLOCK ==================== */}
              <div className={styles.priceBlock}>
                <div className={styles.price}>
                  {getPriceDisplay(service)}
                </div>
                <span className={styles.priceNote}>
                  {service.service_type?.toLowerCase() === "catering"
                    ? "Per head • Taxes extra"
                    : "Starting price • Taxes extra"}
                </span>
              </div>

              <div className={styles.actionButtons}>
                <button
                  className={`${styles.wishlistBtn} ${inWishlist ? styles.wishlisted : ""}`}
                  onClick={toggleWishlist}
                >
                  <Heart size={20} fill={inWishlist ? "currentColor" : "none"} />
                  {inWishlist ? "Wishlisted" : "Add to Wishlist"}
                </button>
              </div>
            </div>

            {/* Service Type Specific Card */}
            {renderServiceSpecificCard()}

            {/* Variants / Packages Section */}
            {service.variants?.length > 0 && (
              <div className={styles.variantsSection} style={{ marginTop: "2rem" }}>
                <h2 className={styles.sectionTitle}>
                  Available Packages & Pricing
                </h2>
                <div className={styles.variantsGrid}>
                  {service.variants.map((v) => (
                    <div key={v.id || v.variant_name} className={styles.variantCard}>
                      <div className={styles.variantHeader}>
                        <h3>{v.variant_name}</h3>
                        <span className={styles.pricingTypeBadge}>
                          {v.pricing_type}
                        </span>
                      </div>

                      <p className={styles.variantDesc}>{v.description}</p>

                      {/* Dynamic Pricing Display */}
                      <div className={styles.variantPrice}>
                        {v.pricing?.base_price && `₹${v.pricing.base_price.toLocaleString()}`}
                        {v.pricing?.per_plate && `₹${v.pricing.per_plate.toLocaleString()}/plate`}
                        {v.pricing?.veg_price && `Veg: ₹${v.pricing.veg_price}`}
                        {v.pricing?.non_veg_price &&
                          ` | Non-Veg: ₹${v.pricing.non_veg_price}`}
                        {!v.pricing?.base_price &&
                          !v.pricing?.per_plate &&
                          !v.pricing?.veg_price &&
                          "Custom Pricing"}
                      </div>

                      {v.inclusions?.length > 0 && (
                        <div className={styles.inclusions}>
                          <p>Includes:</p>
                          <ul>
                            {v.inclusions.slice(0, 5).map((inc, i) => (
                              <li key={i}>{inc}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <AddressCard {...service} />

            {service.amenities?.length > 0 && <AmenitiesCard amenities={service.amenities} />}
            {service.tags?.length > 0 && <TagsCard tags={service.tags} />}

            {/* Reviews Section */}
            <div className={styles.reviewsSection}>
              <h2 className={styles.sectionTitle}>Guest Reviews</h2>
              <ReviewsList
                reviews={reviews}
                overallRating={service.rating}
                totalReviews={service.review_count || reviews.length}
              />

              <WriteReviewForm
                serviceName={service.name}
                serviceId={service.id}
                onReviewSubmitted={handleReviewSubmitted}
              />
            </div>
          </div>

          {/* Right Column – Sticky Sidebar */}
          <div className={styles.rightColumn} ref={availabilityRef}>
            <div className={styles.stickySidebar}>
              <AvailabilityForm
                serviceName={service.name}
                unavailableDates={service.unavailable_dates || []}
              />
              {service.vendor && <VendorCard vendor={service.vendor} />}
            </div>
          </div>
        </div>
      </div>

      <MobileBottomBar
        price={getStartingPrice(service)}
        onCheckAvailability={() =>
          availabilityRef.current?.scrollIntoView({ behavior: "smooth" })
        }
      />
    </div>
  );
}
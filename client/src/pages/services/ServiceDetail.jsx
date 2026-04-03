import React, { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  Heart,
  Home,
  Calendar,
  Users,
  Utensils,
} from "lucide-react";

import { showSuccess, showInfo } from "../../utils/toast";
import styles from "../../styles/ServiceDetail.module.css";
import Navbar from "../../components/Navbar";

// API
import { CustomerServiceAPI, reviewAPI } from "../../utils/api";

// Components
import ImageGallery from "../../components/ImageGallery";
import StarRating from "../../components/StarRating";
import AvailabilityForm from "../../components/AvailabilityForm";
import VendorCard from "../../components/VendorCard";
import VenueSpecsCard from "../../components/VenueSpecsCard";
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
  const [reviews, setReviews] = useState([]); // always array
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [inWishlist, setInWishlist] = useState(false);

  const availabilityRef = useRef(null);

  useEffect(() => {
    const fetchService = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await CustomerServiceAPI.getDetail(id);
        setService(data);

        // Fetch reviews – safely extract .data
        try {
          const reviewRes = await reviewAPI.getAll(id);
          const reviewList = reviewRes?.data || []; // ← Extract .data here

          // Extra safety: ensure it's always an array
          setReviews(Array.isArray(reviewList) ? reviewList : []);
        } catch (reviewErr) {
          console.warn("Reviews fetch failed:", reviewErr);
          setReviews([]); // fallback
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

  const getStartingPrice = (service) => {
    if (service.price) return service.price;

    if (service.variants?.length > 0) {
      const prices = service.variants
        .map(v => v.pricing?.base_price)
        .filter(Boolean);

      return prices.length ? Math.min(...prices) : null;
    }

    return null;
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
                  <Home size={14} /> {service.service_type || "Venue"}
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
                {service.capacity && (
                  <span className={styles.metaItem}>
                    <Users size={16} /> Up to {service.capacity} guests
                  </span>
                )}
              </div>

              <div className={styles.description}>
                <p>{service.long_description || service.description}</p>
              </div>

              <div className={styles.priceBlock}>
                <div className={styles.price}>
                  {formatPrice(service.price)}
                </div>
                <span className={styles.priceNote}>Starting price • Taxes extra</span>
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

            {/* Venue Specs, Address, Amenities, Tags */}
            {service.service_type?.toLowerCase() === "venue" && service.venue && (
              <VenueSpecsCard venue={service.venue} />
            )}

            {service.variants?.length > 0 && (
              <div className={styles.variantsSection} style={{ marginTop: '2rem' }}>
                <h2 className={styles.sectionTitle} style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem', color: '#1f2937' }}>Available Packages & Pricing</h2>
                <div className={styles.variantsGrid} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                  {service.variants.map((v) => (
                    <div key={v.id || v.variant_name} style={{ padding: '1.25rem', border: '1px solid #e5e7eb', borderRadius: '12px', background: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#111827' }}>{v.variant_name}</h3>
                        <span style={{ background: '#fef3c7', color: '#d97706', padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 500 }}>
                          {v.pricing_type}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.9rem', color: '#6b7280', marginBottom: '1rem' }}>{v.description}</p>

                      <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#4f46e5', marginBottom: '1rem' }}>
                        {v.pricing?.base_price ? `₹${v.pricing.base_price.toLocaleString()}` : v.pricing?.per_plate ? `₹${v.pricing.per_plate.toLocaleString()}/plate` : 'Custom Pricing'}
                      </div>

                      {v.inclusions && v.inclusions.length > 0 && (
                        <div>
                          <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#374151', paddingBottom: '0.2rem' }}>Includes:</p>
                          <ul style={{ fontSize: '0.85rem', color: '#4b5563', paddingLeft: '1rem', margin: 0 }}>
                            {v.inclusions.slice(0, 4).map((inc, i) => <li key={i}>{inc}</li>)}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <AddressCard {...service} />

            {service.amenities?.length > 0 && (
              <AmenitiesCard amenities={service.amenities} />
            )}

            {service.tags?.length > 0 && (
              <TagsCard tags={service.tags} />
            )}

            {/* Reviews Section */}
            <div className={styles.reviewsSection}>
              <h2 className={styles.sectionTitle}>Guest Reviews</h2>
              <ReviewsList
                reviews={reviews}
                overallRating={service.rating}
                totalReviews={service.review_count || reviews.length}
              />

              <div className={styles.writeReviewWrapper}>
                <WriteReviewForm
                  serviceName={service.name}
                  serviceId={service.id}
                  onReviewSubmitted={handleReviewSubmitted}
                />
              </div>
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
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
              <AvailabilityForm serviceName={service.name} />
              {service.vendor && <VendorCard vendor={service.vendor} />}
            </div>
          </div>
        </div>
      </div>

      <MobileBottomBar
        price={service.price}
        onCheckAvailability={() =>
          availabilityRef.current?.scrollIntoView({ behavior: "smooth" })
        }
      />
    </div>
  );
}
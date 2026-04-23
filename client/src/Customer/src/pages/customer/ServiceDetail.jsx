import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, AlertTriangle, Loader2, Tag, Music, Sparkles, ClipboardList, PenSquare, CalendarRange } from "lucide-react";

import ImageGallery from "../../components/customer/gallery/ImageGallery";
import VendorCard from "../../components/customer/cards/VendorCard";
import VariantsCard from "../../components/customer/cards/VariantsCard";
import AddressCard from "../../components/customer/cards/AddressCard";
import AmenitiesCard from "../../components/customer/cards/AmenitiesCard";
import VenueSpecsCard from "../../components/customer/specs/VenueSpecsCard";
import CateringSpecsCard from "../../components/customer/specs/CateringSpecsCard";
import PhotographySpecsCard from "../../components/customer/specs/PhotographySpecsCard";
import GenericSpecsCard from "../../components/customer/specs/GenericSpecsCard";
import AvailabilityForm from "../../components/customer/forms/AvailabilityForm";
import ReviewsList from "../../components/customer/reviews/ReviewsList";
import WriteReviewForm from "../../components/customer/reviews/WriteReviewForm";
import Navbar from "../../../../navbar/components/Navbar";
import Modal from "../../../../components/ui/Modal";

import { customerService } from "../../../../utils/api/services/customer.service";
import { reviewService } from "../../../../utils/api/services/review.service";
import { titleCase } from "../../utils/format";
import styles from "../../styles/ServiceDetail.module.css";

export default function ServiceDetail() {
  const { id } = useParams();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isAvailabilityModalOpen, setIsAvailabilityModalOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadService = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await customerService.getDetail(id);

        if (!cancelled) {
          setService(res); // 👈 IMPORTANT (not res.data)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err?.message || "Failed to load");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    if (id) loadService();

    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    let cancelled = false;

    const loadReviews = async () => {
      try {
        setReviewsLoading(true);

        const res = await reviewService.getAll(id);

        if (!cancelled) {
          // adjust depending on API shape
          setReviews(res?.reviews || res || []);
        }
      } catch (err) {
        console.error("Failed to load reviews", err);
      } finally {
        if (!cancelled) setReviewsLoading(false);
      }
    };

    if (id) loadReviews();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const renderSpecs = useMemo(() => {
    if (!service) return null;
    switch (service.service_type) {
      case "venue":
        return <VenueSpecsCard venue={service.venue} />;
      case "catering":
        return <CateringSpecsCard catering={service.catering} />;
      case "photography":
        return <PhotographySpecsCard photography={service.photography} />;
      case "dj":
        return <GenericSpecsCard title="DJ Specifications" data={service.dj} icon={Music} />;
      case "makeup_artist":
        return <GenericSpecsCard title="Makeup Specifications" data={service.makeup_artist} icon={Sparkles} />;
      case "event_management":
        return <GenericSpecsCard title="Event Management" data={service.event_management} icon={ClipboardList} />;
      default:
        return null;
    }
  }, [service]);

  if (loading) {
    return (
      <div className={styles.stateWrap} role="status" aria-live="polite">
        <Loader2 className={styles.spinner} size={28} />
        <p>Loading service…</p>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className={styles.stateWrap} role="alert">
        <AlertTriangle size={28} className={styles.errorIcon} />
        <h2>Service unavailable</h2>
        <p>{error || "We couldn't find this service."}</p>
        <Link to={`/services/${service.service_type}`} className={styles.backLink}><ArrowLeft size={16} /> Back to services</Link>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <Navbar />
        <Link to={`/services/${service.service_type}`} className={styles.back}><ArrowLeft size={16} /> Back</Link>

        <header className={styles.header}>
          <div className={styles.headerText}>
            <span className={styles.eyebrow}>{titleCase(service.service_type)}</span>
            <h1 className={styles.title}>{service.name}</h1>
            <p className={styles.subtitle}>
              {[service.area, service.city, service.state].filter(Boolean).join(" • ")}
            </p>
          </div>
        </header>

        <ImageGallery images={service.images} serviceName={service.name} />

        <div className={styles.layout}>
          <div className={styles.main}>
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>About this service</h2>
              <p className={styles.description}>{service.description}</p>

              {!!service.tags?.length && (
                <div className={styles.tags}>
                  {service.tags.map((t) => (
                    <span key={t} className={styles.tag}><Tag size={12} /> {t}</span>
                  ))}
                </div>
              )}
            </section>

            {renderSpecs}

            <VariantsCard variants={service.variants} />

            <AmenitiesCard amenities={service.amenities} />

            <AddressCard
              addressLine1={service.add_line1 || service.area}
              addressLine2={service.add_line2}
              city={service.city}
              state={service.state}
              pincode={service.pincode}
            />
            <div className={styles.reviewsHeader}>
              <h2 className={styles.sectionTitle}>Reviews & Ratings</h2>
              <button
                onClick={() => setIsReviewModalOpen(true)}
                className={styles.writeReviewBtn}
              >
                <PenSquare size={16} /> Write a Review
              </button>
            </div>

            <ReviewsList
              reviews={reviews}
              overallRating={service.rating}
              totalReviews={service.total_reviews}
              loading={reviewsLoading}
            />

            <Modal
              isOpen={isReviewModalOpen}
              onClose={() => setIsReviewModalOpen(false)}
            >
              <WriteReviewForm
                serviceName={service.name}
                serviceId={id}
                serviceType={service.service_type}
                vendorId={service.vendor?.id || ""}
                onReviewSubmitted={(newReview) => {
                  setReviews(prev => [newReview, ...prev]);
                  setIsReviewModalOpen(false);
                }}
              />
            </Modal>
          </div>

          <aside className={styles.sidebar}>
            <div className={styles.stickyWrap}>
              <VendorCard vendor={service.vendor} />
              <button
                onClick={() => setIsAvailabilityModalOpen(true)}
                className={styles.checkAvailabilityBtn}
              >
                <CalendarRange size={18} /> Check Availability
              </button>

              <Modal
                isOpen={isAvailabilityModalOpen}
                onClose={() => setIsAvailabilityModalOpen(false)}
              >
                <AvailabilityForm
                  serviceName={service.name}
                  contactPhone={service.vendor?.phone || "+91 98765 43210"}
                  unavailableDates={service.unavailable_dates || []}
                  onSubmit={async (data) => {
                    // TODO: hook up to real API
                    console.log("Inquiry submitted", data);
                  }}
                />
              </Modal>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

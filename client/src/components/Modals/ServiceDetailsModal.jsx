import React, { useEffect, useState } from "react";
import { X, MapPin, DollarSign, Tag, Image as ImageIcon } from "lucide-react";
import styles from "../../styles/Modals/VendorServiceDetailsModal.module.css";

const serviceTypes = [
  { value: "venue", label: "Wedding Venue" },
  { value: "dj", label: "DJ" },
  { value: "event_management", label: "Event Management" },
  { value: "catering", label: "Catering" },
  { value: "photographer", label: "Photography" },
];

const pricingTypes = [
  { value: "per_day", label: "Per Day" },
  { value: "per_hour", label: "Per Hour" },
  { value: "per_head", label: "Per Head" },
  { value: "package", label: "Package" },
];

const policyOptions = [
  { value: "allowed", label: "Allowed" },
  { value: "in-house-only", label: "In-House Only" },
];

const alcoholOptions = [
  { value: "allowed", label: "Allowed" },
  { value: "not-allowed", label: "Not Allowed" },
];

const getRuleValue = (rules, key) => {
  return rules?.find(r => r.toLowerCase().includes(key))?.split(":")[1]?.trim();
};

const VendorServiceDetailsModal = ({ isOpen, onClose, service }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  if (!isOpen || !service) return null;

  const images = service.media?.map(m => m.media_url) || [];
  const tags = service.metadata?.tags || [];
  const amenities = service.metadata?.amenities || [];
  const venueDetails = service.venue || {};

  const locationText = [
    service.add_line1,
    service.add_line2,
    service.area,
    service.city,
    service.state,
    service.country,
    service.pincode,
  ].filter(Boolean).join(", ");

  const status = service.is_active ? "active" : "inactive";

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>

        {/* Image Slider */}
        <div className={styles.imageWrapper}>
          {images.length > 0 ? (
            <>
              <img
                src={images[currentIndex]}
                alt="service"
                className={styles.sliderImg}
              />
              {images.length > 1 && (
                <>
                  <button onClick={() => setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)} className={styles.prevBtn}>‹</button>
                  <button onClick={() => setCurrentIndex((prev) => (prev + 1) % images.length)} className={styles.nextBtn}>›</button>
                </>
              )}
              <div className={styles.imageCount}>{currentIndex + 1} / {images.length}</div>
            </>
          ) : (
            <div className={styles.noImage}><ImageIcon /> No Images</div>
          )}
        </div>

        {/* Details */}
        <div className={styles.details}>
          <button className={styles.closeBtn} onClick={onClose}><X /></button>

          <h2 className={styles.title}>{service.service_name}</h2>

          {/* Top badges */}
          <div className={styles.topBadges}>
            <span className={styles.badge}>{status}</span>
            <span className={styles.badgeVerified}>{service.is_verified ? "Verified" : "Not Verified"}</span>
          </div>

          <p className={styles.description}>{service.description}</p>

          {/* Meta */}
          <div className={styles.metaInfo}>
            <span>Created: {new Date(service.created_at).toLocaleDateString()}</span>
            <span>Updated: {new Date(service.updated_at).toLocaleDateString()}</span>
          </div>

          {/* Basic Info */}
          <div className={styles.section}>
            <h3><Tag /> Basic Info</h3>
            <p><b>Category:</b> {serviceTypes.find(t => t.value === service.service_type)?.label}</p>
            <p><b>Location:</b> {locationText}</p>
            <p><b>Coordinates:</b> {service.latitude}, {service.longitude}</p>
            <p><b>Tags:</b> {tags.join(", ") || "None"}</p>
          </div>

          {/* Packages */}
          <div className={styles.section}>
            <h3><DollarSign /> Packages</h3>
            {service.variants?.map((v, i) => (
              <div key={i} className={styles.packageCard}>
                <h4>{v.variant_name}</h4>
                <p>₹{v.pricing?.base_price} / {pricingTypes.find(t => t.value === v.pricing_type)?.label}</p>
                {v.description && <p>{v.description}</p>}

                {v.inclusions?.length > 0 && (
                  <ul>
                    {v.inclusions.map((inc, i) => <li key={i}>✓ {inc}</li>)}
                  </ul>
                )}

                {v.exclusions?.length > 0 && (
                  <ul>
                    {v.exclusions.map((exc, i) => <li key={i}>✗ {exc}</li>)}
                  </ul>
                )}
              </div>
            ))}
          </div>

          {/* Venue Details */}
          {service.service_type === "venue" && (
            <div className={styles.section}>
              <h3><MapPin /> Venue Details</h3>
              <p><b>Capacity:</b> {venueDetails.min_capacity} - {venueDetails.max_capacity}</p>
              <p><b>Square Feet:</b> {venueDetails.square_feet}</p>
              <p><b>Parking:</b> {venueDetails.parking_capacity}</p>
              <p><b>Catering:</b> {policyOptions.find(p => p.value === venueDetails.catering_options?.policy)?.label}</p>
              <p><b>Decoration:</b> {policyOptions.find(p => p.value === getRuleValue(venueDetails.venue_rules, "decoration"))?.label}</p>
              <p><b>Alcohol:</b> {alcoholOptions.find(a => a.value === getRuleValue(venueDetails.venue_rules, "alcohol"))?.label}</p>

              {venueDetails.amenities?.length > 0 && (
                <p><b>Venue Amenities:</b> {venueDetails.amenities.join(", ")}</p>
              )}
            </div>
          )}

          {/* Amenities */}
          {amenities.length > 0 && (
            <div className={styles.section}>
              <h3>Amenities</h3>
              <div className={styles.amenitiesGrid}>
                {amenities.map((a, i) => (
                  <span key={i} className={styles.amenityCard}>{a}</span>
                ))}
              </div>
            </div>
          )}

          {/* Unavailable Dates */}
          {service.unavailable_dates?.length > 0 && (
            <div className={styles.section}>
              <h3>Unavailable Dates</h3>
              {service.unavailable_dates.map((d, i) => (
                <span key={i}>{d}</span>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default VendorServiceDetailsModal;

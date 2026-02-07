import React, { useEffect, useState } from "react";
import { X, MapPin, DollarSign, Tag, Image as ImageIcon } from "lucide-react";
import styles from "../../styles/Modals/VendorServiceDetailsModal.module.css"

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

const hallTypes = [
  { value: "banquet", label: "Banquet" },
  { value: "lawn", label: "Lawn" },
  { value: "farmhouse", label: "Farmhouse" },
  { value: "resort", label: "Resort" },
];

const indoorOutdoorOptions = [
  { value: "indoor", label: "Indoor" },
  { value: "outdoor", label: "Outdoor" },
  { value: "both", label: "Both" },
];

const policyOptions = [
  { value: "allowed", label: "Allowed" },
  { value: "in-house-only", label: "In-House Only" },
];

const alcoholOptions = [
  { value: "allowed", label: "Allowed" },
  { value: "not-allowed", label: "Not Allowed" },
];

const serviceStyles = [
  { value: "buffet", label: "Buffet" },
  { value: "plated", label: "Plated" },
  { value: "live_counter", label: "Live Counter" },
];

const packageModals = [
  { value: "package_based", label: "Package Based" },
  { value: "hourly", label: "Hourly" },
  { value: "fixed", label: "Fixed" },
];

const VendorServiceDetailsModal = ({ isOpen, onClose, service }) => {
  console.log("Services", service);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  if (!isOpen || !service) return null;

  const images = service.images || [];
  const handleNext = () => {
    if (images.length > 0) {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }
  };

  const handlePrev = () => {
    if (images.length > 0) {
      setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    }
  };

  const locationText = [
    service.address_line1,
    service.address_line2,
    service.area,
    service.city,
    service.state,
    service.country,
    service.pincode,
  ].filter(Boolean).join(", ");

  const status = service.is_active ? "active" : "inactive";

  const renderSpecificDetails = () => {
    switch (service.category) {
      case "venue":
        const venueDetails = service.venue_details || {};
        return (
          <div className={styles.specificDetails}>
            <div className={styles.detailCard}>
              <span className={styles.detailLabel}>Capacity</span>
              <span className={styles.detailValue}>{venueDetails.capacity_min || "N/A"} - {venueDetails.capacity_max || "N/A"} guests</span>
            </div>
            <div className={styles.detailCard}>
              <span className={styles.detailLabel}>Hall Type</span>
              <span className={styles.detailValue}>{hallTypes.find(h => h.value === venueDetails.hall_type)?.label || "N/A"}</span>
            </div>
            <div className={styles.detailCard}>
              <span className={styles.detailLabel}>Indoor/Outdoor</span>
              <span className={styles.detailValue}>{indoorOutdoorOptions.find(o => o.value === venueDetails.indoor_outdoor)?.label || "N/A"}</span>
            </div>
            <div className={styles.detailCard}>
              <span className={styles.detailLabel}>Square Feet</span>
              <span className={styles.detailValue}>{venueDetails.square_feet || "N/A"} sq.ft.</span>
            </div>
            <div className={styles.detailCard}>
              <span className={styles.detailLabel}>Parking Capacity</span>
              <span className={styles.detailValue}>{venueDetails.parking_capacity || "N/A"} vehicles</span>
            </div>
            <div className={styles.detailCard}>
              <span className={styles.detailLabel}>Decoration Policy</span>
              <span className={styles.detailValue}>{policyOptions.find(p => p.value === venueDetails.decoration_policy)?.label || "N/A"}</span>
            </div>
            <div className={styles.detailCard}>
              <span className={styles.detailLabel}>Catering Policy</span>
              <span className={styles.detailValue}>{policyOptions.find(p => p.value === venueDetails.catering_policy)?.label || "N/A"}</span>
            </div>
            <div className={styles.detailCard}>
              <span className={styles.detailLabel}>Alcohol Policy</span>
              <span className={styles.detailValue}>{alcoholOptions.find(a => a.value === venueDetails.alcohol_policy)?.label || "N/A"}</span>
            </div>
          </div>
        );
      case "catering":
        const cateringDetails = service.catering_details || {};
        return (
          <div className={styles.specificDetails}>
            <div className={styles.detailCard}>
              <span className={styles.detailLabel}>Cuisine Types</span>
              <span className={styles.detailValue}>{cateringDetails.cuisine_types?.join(", ") || "None"}</span>
            </div>
            <div className={styles.detailCard}>
              <span className={styles.detailLabel}>Veg Price per Head</span>
              <span className={styles.detailValue}>₹{cateringDetails.veg_price_per_head || "N/A"}</span>
            </div>
            <div className={styles.detailCard}>
              <span className={styles.detailLabel}>Non-Veg Price per Head</span>
              <span className={styles.detailValue}>₹{cateringDetails.nonveg_price_per_head || "N/A"}</span>
            </div>
            <div className={styles.detailCard}>
              <span className={styles.detailLabel}>Order Range</span>
              <span className={styles.detailValue}>{cateringDetails.min_order || "N/A"} - {cateringDetails.max_order || "N/A"} guests</span>
            </div>
            <div className={styles.detailCard}>
              <span className={styles.detailLabel}>Service Style</span>
              <span className={styles.detailValue}>{serviceStyles.find(s => s.value === cateringDetails.service_style)?.label || "N/A"}</span>
            </div>
            <div className={styles.detailCard}>
              <span className={styles.detailLabel}>Staff Included</span>
              <span className={styles.detailValue}>{cateringDetails.staff_included ? "Yes" : "No"}</span>
            </div>
            <div className={styles.detailCard}>
              <span className={styles.detailLabel}>Crockery & Cutlery</span>
              <span className={styles.detailValue}>{cateringDetails.crockery_cutlery_included ? "Included" : "Not Included"}</span>
            </div>
            <div className={styles.detailCard}>
              <span className={styles.detailLabel}>Tasting Available</span>
              <span className={styles.detailValue}>{cateringDetails.tasting_available ? "Yes" : "No"}</span>
            </div>
          </div>
        );
      case "dj":
        const djDetails = service.dj_details || {};
        return (
          <div className={styles.specificDetails}>
            <div className={styles.detailCard}>
              <span className={styles.detailLabel}>Genres Supported</span>
              <span className={styles.detailValue}>{djDetails.genres_supported?.join(", ") || "None"}</span>
            </div>
            <div className={styles.detailCard}>
              <span className={styles.detailLabel}>Duration</span>
              <span className={styles.detailValue}>{djDetails.duration_hours || "N/A"} hours</span>
            </div>
            <div className={styles.detailCard}>
              <span className={styles.detailLabel}>Equipment</span>
              <span className={styles.detailValue}>{djDetails.equipment?.join(", ") || "None"}</span>
            </div>
            <div className={styles.detailCard}>
              <span className={styles.detailLabel}>Lighting Included</span>
              <span className={styles.detailValue}>{djDetails.lighting_included ? "Yes" : "No"}</span>
            </div>
            <div className={styles.detailCard}>
              <span className={styles.detailLabel}>MC/Host Available</span>
              <span className={styles.detailValue}>{djDetails.mc_host_available ? "Yes" : "No"}</span>
            </div>
            <div className={styles.detailCard}>
              <span className={styles.detailLabel}>Setup Time</span>
              <span className={styles.detailValue}>{djDetails.setup_time_required || "N/A"} hours</span>
            </div>
          </div>
        );
      case "photographer":
        const photographerDetails = service.photographer_details || {};
        return (
          <div className={styles.specificDetails}>
            <div className={styles.detailCard}>
              <span className={styles.detailLabel}>Package Types</span>
              <span className={styles.detailValue}>{photographerDetails.package_type?.join(", ") || "None"}</span>
            </div>
            <div className={styles.detailCard}>
              <span className={styles.detailLabel}>Hours Covered</span>
              <span className={styles.detailValue}>{photographerDetails.hours_covered || "N/A"} hours</span>
            </div>
            <div className={styles.detailCard}>
              <span className={styles.detailLabel}>Photos Delivered</span>
              <span className={styles.detailValue}>{photographerDetails.photos_delivered || "N/A"}</span>
            </div>
            <div className={styles.detailCard}>
              <span className={styles.detailLabel}>Edited Photos</span>
              <span className={styles.detailValue}>{photographerDetails.edited_photos_count || "N/A"}</span>
            </div>
            <div className={styles.detailCard}>
              <span className={styles.detailLabel}>Delivery Time</span>
              <span className={styles.detailValue}>{photographerDetails.delivery_time_days || "N/A"} days</span>
            </div>
            <div className={styles.detailCard}>
              <span className={styles.detailLabel}>Videography Included</span>
              <span className={styles.detailValue}>{photographerDetails.videography_included ? "Yes" : "No"}</span>
            </div>
            <div className={styles.detailCard}>
              <span className={styles.detailLabel}>Drone Available</span>
              <span className={styles.detailValue}>{photographerDetails.drone_available ? "Yes" : "No"}</span>
            </div>
            <div className={styles.detailCard}>
              <span className={styles.detailLabel}>Album Included</span>
              <span className={styles.detailValue}>{photographerDetails.album_included ? "Yes" : "No"}</span>
            </div>
          </div>
        );
      case "event_management":
        const eventDetails = service.event_management_details || {};
        return (
          <div className={styles.specificDetails}>
            <div className={styles.detailCard}>
              <span className={styles.detailLabel}>Event Types</span>
              <span className={styles.detailValue}>{eventDetails.event_types?.join(", ") || "None"}</span>
            </div>
            <div className={styles.detailCard}>
              <span className={styles.detailLabel}>Team Size</span>
              <span className={styles.detailValue}>{eventDetails.team_size || "N/A"} members</span>
            </div>
            <div className={styles.detailCard}>
              <span className={styles.detailLabel}>Services Included</span>
              <span className={styles.detailValue}>{eventDetails.includes?.join(", ") || "None"}</span>
            </div>
            <div className={styles.detailCard}>
              <span className={styles.detailLabel}>Package Modal</span>
              <span className={styles.detailValue}>{packageModals.find(m => m.value === eventDetails.package_modal)?.label || "N/A"}</span>
            </div>
            <div className={styles.detailCard}>
              <span className={styles.detailLabel}>Vendor Network Size</span>
              <span className={styles.detailValue}>{eventDetails.vendor_network_size || "N/A"} vendors</span>
            </div>
            <div className={styles.detailCard}>
              <span className={styles.detailLabel}>Experience</span>
              <span className={styles.detailValue}>{eventDetails.experience_years || "N/A"} years</span>
            </div>
          </div>
        );
      default:
        return <p className={styles.noDetails}>No specific details available.</p>;
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Image Slider */}
        <div className={styles.imageWrapper}>
          {images.length > 0 ? (
            <div className={styles.slider}>
              <div
                className={styles.sliderInner}
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
              >
                {images.map((img, index) => (
                  <img
                    key={index}
                    src={typeof img === "string" ? img : img.image_url}
                    alt={service.title}
                    className={styles.sliderImg}
                  />
                ))}
              </div>
              {images.length > 1 && (
                <>
                  <button className={styles.prevBtn} onClick={handlePrev}>
                    ‹
                  </button>
                  <button className={styles.nextBtn} onClick={handleNext}>
                    ›
                  </button>
                  <div className={styles.sliderDots}>
                    {images.map((_, index) => (
                      <span
                        key={index}
                        className={`${styles.dot} ${index === currentIndex ? styles.activeDot : ""}`}
                        onClick={() => setCurrentIndex(index)}
                      />
                    ))}
                  </div>
                </>
              )}
              <span
                className={`${styles.status} ${status === "active" ? styles.active : styles.inactive}`}
              >
                {status}
              </span>
            </div>
          ) : (
            <div className={styles.noImage}>
              <ImageIcon className={styles.noImageIcon} />
              <span>No images available</span>
            </div>
          )}
        </div>

        {/* Details */}
        <div className={styles.details}>
          <button className={styles.closeBtn} onClick={onClose}>
            <X className={styles.closeIcon} />
          </button>
          <h2 className={styles.title}>{service.title || "Service Title"}</h2>
          <p className={styles.description}>{service.description || "No description provided."}</p>

          <div className={styles.infoGroup}>
            {/* Basic Info */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>
                <Tag className={styles.sectionIcon} /> Basic Information
              </h3>
              <div className={styles.detailCard}>
                <span className={styles.detailLabel}>Category</span>
                <span className={styles.detailValue}>{serviceTypes.find(t => t.value === service.category)?.label || "N/A"}</span>
              </div>
              <div className={styles.detailCard}>
                <span className={styles.detailLabel}>Location</span>
                <span className={styles.detailValue}>{locationText || "Not specified"}</span>
              </div>
              <div className={styles.detailCard}>
                <span className={styles.detailLabel}>Geo Coordinates</span>
                <span className={styles.detailValue}>{service.geo_point?.lat != null ? service.geo_point.lat : "N/A"},
                  {service.geo_point?.lon != null ? service.geo_point.lon : "N/A"}</span>
              </div>
              <div className={styles.detailCard}>
                <span className={styles.detailLabel}>Tags</span>
                <span className={styles.detailValue}>{service.tags?.join(", ") || "None"}</span>
              </div>
            </div>

            {/* Pricing */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>
                <DollarSign className={styles.sectionIcon} /> Pricing
              </h3>
              <div className={styles.detailCard}>
                <span className={styles.detailLabel}>Base Price</span>
                <span className={styles.detailValue}>₹{service.base_price || "N/A"}</span>
              </div>
              <div className={styles.detailCard}>
                <span className={styles.detailLabel}>Pricing Type</span>
                <span className={styles.detailValue}>{pricingTypes.find(t => t.value === service.pricing_type)?.label || "N/A"}</span>
              </div>
            </div>

            {/* Specific Details */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>
                <MapPin className={styles.sectionIcon} /> Specific Details
              </h3>
              {renderSpecificDetails()}
            </div>

            {/* Amenities */}
            {service.amenities?.length > 0 && (
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>
                  <ImageIcon className={styles.sectionIcon} /> Amenities
                </h3>
                <div className={styles.amenitiesGrid}>
                  {service.amenities.map((amenity, idx) => (
                    <div key={idx} className={styles.amenityCard}>
                      {amenity}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorServiceDetailsModal;
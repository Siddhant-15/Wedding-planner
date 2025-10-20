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
  console.log("Services",service)
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

  const renderSpecificDetails = () => {
    switch (service.category) {
      case "venue":
        return (
          <div className={styles.specificDetails}>
            <p><span className={styles.label}>Capacity:</span> {service.capacity_min || "N/A"} - {service.capacity_max || "N/A"} guests</p>
            <p><span className={styles.label}>Hall Type:</span> {hallTypes.find(h => h.value === service.hall_type)?.label || "N/A"}</p>
            <p><span className={styles.label}>Indoor/Outdoor:</span> {indoorOutdoorOptions.find(o => o.value === service.indoor_outdoor)?.label || "N/A"}</p>
            <p><span className={styles.label}>Square Feet:</span> {service.square_feet || "N/A"} sq.ft.</p>
            <p><span className={styles.label}>Parking Capacity:</span> {service.parking_capacity || "N/A"} vehicles</p>
            <p><span className={styles.label}>Decoration Policy:</span> {policyOptions.find(p => p.value === service.decoration_policy)?.label || "N/A"}</p>
            <p><span className={styles.label}>Catering Policy:</span> {policyOptions.find(p => p.value === service.catering_policy)?.label || "N/A"}</p>
            <p><span className={styles.label}>Alcohol Policy:</span> {alcoholOptions.find(a => a.value === service.alcohol_policy)?.label || "N/A"}</p>
          </div>
        );
      case "catering":
        return (
          <div className={styles.specificDetails}>
            <p><span className={styles.label}>Cuisine Types:</span> {service.cuisine_types?.join(", ") || "None"}</p>
            <p><span className={styles.label}>Veg Price per Head:</span> ₹{service.veg_price_per_head || "N/A"}</p>
            <p><span className={styles.label}>Non-Veg Price per Head:</span> ₹{service.nonveg_price_per_head || "N/A"}</p>
            <p><span className={styles.label}>Order Range:</span> {service.min_order || "N/A"} - {service.max_order || "N/A"} guests</p>
            <p><span className={styles.label}>Service Style:</span> {serviceStyles.find(s => s.value === service.service_style)?.label || "N/A"}</p>
            <p><span className={styles.label}>Staff Included:</span> {service.staff_included ? "Yes" : "No"}</p>
            <p><span className={styles.label}>Crockery & Cutlery:</span> {service.crockery_cutlery_included ? "Included" : "Not Included"}</p>
            <p><span className={styles.label}>Tasting Available:</span> {service.tasting_available ? "Yes" : "No"}</p>
          </div>
        );
      case "dj":
        return (
          <div className={styles.specificDetails}>
            <p><span className={styles.label}>Genres Supported:</span> {service.genres_supported?.join(", ") || "None"}</p>
            <p><span className={styles.label}>Duration:</span> {service.duration_hours || "N/A"} hours</p>
            <p><span className={styles.label}>Equipment:</span> {service.equipment?.join(", ") || "None"}</p>
            <p><span className={styles.label}>Lighting Included:</span> {service.lighting_included ? "Yes" : "No"}</p>
            <p><span className={styles.label}>MC/Host Available:</span> {service.mc_host_available ? "Yes" : "No"}</p>
            <p><span className={styles.label}>Setup Time:</span> {service.setup_time_required || "N/A"} hours</p>
          </div>
        );
      case "photographer":
        return (
          <div className={styles.specificDetails}>
            <p><span className={styles.label}>Package Types:</span> {service.package_type?.join(", ") || "None"}</p>
            <p><span className={styles.label}>Hours Covered:</span> {service.hours_covered || "N/A"} hours</p>
            <p><span className={styles.label}>Photos Delivered:</span> {service.photos_delivered || "N/A"}</p>
            <p><span className={styles.label}>Edited Photos:</span> {service.edited_photos_count || "N/A"}</p>
            <p><span className={styles.label}>Delivery Time:</span> {service.delivery_time_days || "N/A"} days</p>
            <p><span className={styles.label}>Videography Included:</span> {service.videography_included ? "Yes" : "No"}</p>
            <p><span className={styles.label}>Drone Available:</span> {service.drone_available ? "Yes" : "No"}</p>
            <p><span className={styles.label}>Album Included:</span> {service.album_included ? "Yes" : "No"}</p>
          </div>
        );
      case "event_management":
        return (
          <div className={styles.specificDetails}>
            <p><span className={styles.label}>Event Types:</span> {service.event_types?.join(", ") || "None"}</p>
            <p><span className={styles.label}>Team Size:</span> {service.team_size || "N/A"} members</p>
            <p><span className={styles.label}>Services Included:</span> {service.includes?.join(", ") || "None"}</p>
            <p><span className={styles.label}>Package Modal:</span> {packageModals.find(m => m.value === service.package_modal)?.label || "N/A"}</p>
            <p><span className={styles.label}>Vendor Network Size:</span> {service.vendor_network_size || "N/A"} vendors</p>
            <p><span className={styles.label}>Experience:</span> {service.experience_years || "N/A"} years</p>
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
                className={`${styles.status} ${service.status === "active" ? styles.active : styles.inactive}`}
              >
                {service.status || "Unknown"}
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
              <p><span className={styles.label}>Category:</span> {serviceTypes.find(t => t.value === service.category)?.label || "N/A"}</p>
              <p><span className={styles.label}>Location:</span> {locationText || "Not specified"}</p>
              <p><span className={styles.label}>Geo Coordinates:</span> {service.geo_point?.lat || "N/A"}, {service.geo_point?.lon || "N/A"}</p>
              <p><span className={styles.label}>Tags:</span> {service.tags?.join(", ") || "None"}</p>
            </div>

            {/* Pricing */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>
                <DollarSign className={styles.sectionIcon} /> Pricing
              </h3>
              <p><span className={styles.label}>Base Price:</span> ₹{service.base_price || "N/A"}</p>
              <p><span className={styles.label}>Pricing Type:</span> {pricingTypes.find(t => t.value === service.pricing_type)?.label || "N/A"}</p>
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
                <ul className={styles.amenities}>
                  {service.amenities.map((amenity, idx) => (
                    <li key={idx}>{amenity}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorServiceDetailsModal;
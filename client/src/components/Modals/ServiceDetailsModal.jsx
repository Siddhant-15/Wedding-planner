import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import styles from "../../styles/Modals/VendorServiceDetailsModal.module.css";

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

  const locationText = [service.venue, service.city, service.state, service.country]
    .filter(Boolean)
    .join(", ");

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
      >
        {/* Close Button */}
        <button className={styles.closeBtn} onClick={onClose}>
          <X size={24} />
        </button>

        {/* Left: Image Slider */}
        <div className={styles.imageWrapper}>
          {images.length > 0 ? (
            <div className={styles.slider}>
              <button className={styles.prevBtn} onClick={handlePrev}>
                ‹
              </button>

              <div
                className={styles.sliderInner}
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
              >
                {images.map((img, index) => (
                  <img
                    key={index}
                    src={img.image_url || img}
                    alt={service.name}
                    className={styles.sliderImg}
                  />
                ))}
              </div>

              <button className={styles.nextBtn} onClick={handleNext}>
                ›
              </button>

              <div className={styles.sliderDots}>
                {images.map((_, index) => (
                  <span
                    key={index}
                    className={`${styles.dot} ${
                      index === currentIndex ? styles.activeDot : ""
                    }`}
                    onClick={() => setCurrentIndex(index)}
                  />
                ))}
              </div>
            </div>
          ) : (
            <img
              src="/placeholder.svg"
              alt={service.name}
              className={styles.sliderImg}
            />
          )}
          <span className={`${styles.status} ${styles[service.status]}`}>
            {service.status}
          </span>
        </div>

        {/* Right: Details */}
        <div className={styles.details}>
          <h2 className={styles.title}>{service.name}</h2>
          <p className={styles.description}>{service.description}</p>

          <div className={styles.infoGroup}>
            <div>
              <span className={styles.label}>Type: </span>
              {service.type}
            </div>
            <div>
              <span className={styles.label}>Location: </span>
              {locationText || "Not specified"}
            </div>
            <div>
              <span className={styles.label}>Price: </span>
              ₹{service.price}
            </div>
            {service.capacity && (
              <div>
                <span className={styles.label}>Capacity: </span>
                {service.capacity}
              </div>
            )}
            <div>
              <span className={styles.label}>Status: </span>
              <span
                className={`${styles.status} ${
                  service.status === "active" ? styles.active : styles.inactive
                }`}
              >
                {service.status}
              </span>
            </div>

            {/* Amenities */}
            {service.amenities && service.amenities.length > 0 && (
              <div>
                <span className={styles.label}>Amenities: </span>
                <ul className={styles.amenities}>
                  {service.amenities.map((a, idx) => (
                    <li key={idx}>{a}</li>
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

import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";
import styles from "../styles/ImageGallery.module.css";

export default function ImageGallery({ images = [], serviceName = "Service" }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Fallback if no images
  const imgs = images.length > 0 ? images : ["/placeholder.svg?text=No+Images"];

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % imgs.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + imgs.length) % imgs.length);
  };

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKey = (e) => {
      if (!isLightboxOpen) return;
      if (e.key === "ArrowLeft") prevImage();
      if (e.key === "ArrowRight") nextImage();
      if (e.key === "Escape") setIsLightboxOpen(false);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isLightboxOpen]);

  return (
    <>
      {/* Main Gallery */}
      <div className={styles.galleryContainer}>
        {/* Hero / Main Image */}
        <div className={styles.heroWrapper}>
          <div className={styles.heroImageBox}>
            <img
              src={imgs[currentIndex]}
              alt={`${serviceName} - Image ${currentIndex + 1}`}
              className={styles.heroImage}
              loading="lazy"
            />

            {/* Overlays */}
            <div className={styles.imageOverlay}>
              <div className={styles.overlayTop}>
                <span className={styles.counter}>
                  {currentIndex + 1} / {imgs.length}
                </span>

                <button
                  className={styles.zoomButton}
                  onClick={() => setIsLightboxOpen(true)}
                  aria-label="View in fullscreen"
                >
                  <ZoomIn size={20} />
                </button>
              </div>

              {imgs.length > 1 && (
                <>
                  <button
                    className={`${styles.navButton} ${styles.navLeft}`}
                    onClick={prevImage}
                    aria-label="Previous image"
                  >
                    <ChevronLeft size={28} />
                  </button>
                  <button
                    className={`${styles.navButton} ${styles.navRight}`}
                    onClick={nextImage}
                    aria-label="Next image"
                  >
                    <ChevronRight size={28} />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Thumbnails (horizontal scrollable) */}
        {imgs.length > 1 && (
          <div className={styles.thumbnailsContainer}>
            <div className={styles.thumbnailsScroll}>
              {imgs.map((src, i) => (
                <button
                  key={i}
                  className={`${styles.thumbnail} ${
                    i === currentIndex ? styles.thumbnailActive : ""
                  }`}
                  onClick={() => setCurrentIndex(i)}
                  aria-label={`View image ${i + 1}`}
                >
                  <img src={src} alt={`Thumbnail ${i + 1}`} loading="lazy" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {isLightboxOpen && (
        <div
          className={styles.lightboxOverlay}
          onClick={() => setIsLightboxOpen(false)}
        >
          <div className={styles.lightboxContent} onClick={(e) => e.stopPropagation()}>
            {/* Close button */}
            <button
              className={styles.lightboxClose}
              onClick={() => setIsLightboxOpen(false)}
              aria-label="Close lightbox"
            >
              <X size={32} />
            </button>

            {/* Counter */}
            <div className={styles.lightboxCounter}>
              {currentIndex + 1} / {imgs.length}
            </div>

            {/* Main lightbox image */}
            <img
              src={imgs[currentIndex]}
              alt={`${serviceName} - Fullscreen ${currentIndex + 1}`}
              className={styles.lightboxImage}
            />

            {/* Navigation */}
            {imgs.length > 1 && (
              <>
                <button
                  className={`${styles.lightboxNav} ${styles.lightboxNavLeft}`}
                  onClick={prevImage}
                  aria-label="Previous"
                >
                  <ChevronLeft size={40} />
                </button>
                <button
                  className={`${styles.lightboxNav} ${styles.lightboxNavRight}`}
                  onClick={nextImage}
                  aria-label="Next"
                >
                  <ChevronRight size={40} />
                </button>
              </>
            )}

            {/* Thumbnails in lightbox */}
            {imgs.length > 1 && (
              <div className={styles.lightboxThumbnails}>
                {imgs.map((src, i) => (
                  <button
                    key={i}
                    className={`${styles.lightboxThumb} ${
                      i === currentIndex ? styles.lightboxThumbActive : ""
                    }`}
                    onClick={() => setCurrentIndex(i)}
                  >
                    <img src={src} alt={`Thumbnail ${i + 1}`} loading="lazy" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
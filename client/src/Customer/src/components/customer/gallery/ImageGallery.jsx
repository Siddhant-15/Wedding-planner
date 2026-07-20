import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";
import styles from "../styles/ImageGallery.module.css";

export default function ImageGallery({ media = [], serviceName = "Service" }) {
  // Filter only cover images
  const coverImages = media
    .filter(item => item.type === "image" && item.is_cover)
    .map(item => item.url);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const imgs = coverImages.length > 0 ? coverImages : ["/placeholder.svg?text=No+Images"];

  const nextImage = () => setCurrentIndex((prev) => (prev + 1) % imgs.length);
  const prevImage = () => setCurrentIndex((prev) => (prev - 1 + imgs.length) % imgs.length);

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

  if (imgs.length === 0) return null;

  return (
    <>
      <div className={styles.galleryContainer}>
        <div className={styles.heroWrapper}>
          <div className={styles.heroImageBox}>
            <img
              src={imgs[currentIndex]}
              alt={`${serviceName} - Image ${currentIndex + 1}`}
              className={styles.heroImage}
              loading="lazy"
            />

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
                  <button className={`${styles.navButton} ${styles.navLeft}`} onClick={prevImage}>
                    <ChevronLeft size={28} />
                  </button>
                  <button className={`${styles.navButton} ${styles.navRight}`} onClick={nextImage}>
                    <ChevronRight size={28} />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {imgs.length > 1 && (
          <div className={styles.thumbnailsContainer}>
            <div className={styles.thumbnailsScroll}>
              {imgs.map((src, i) => (
                <button
                  key={i}
                  className={`${styles.thumbnail} ${i === currentIndex ? styles.thumbnailActive : ""}`}
                  onClick={() => setCurrentIndex(i)}
                >
                  <img src={src} alt={`Thumbnail ${i + 1}`} loading="lazy" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Lightbox - same as before */}
      {isLightboxOpen && (
        <div className={styles.lightboxOverlay} onClick={() => setIsLightboxOpen(false)}>
          <div className={styles.lightboxContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.lightboxClose} onClick={() => setIsLightboxOpen(false)}>
              <X size={32} />
            </button>

            <div className={styles.lightboxCounter}>
              {currentIndex + 1} / {imgs.length}
            </div>

            <img
              src={imgs[currentIndex]}
              alt={`${serviceName} - Fullscreen ${currentIndex + 1}`}
              className={styles.lightboxImage}
            />

            {imgs.length > 1 && (
              <>
                <button className={`${styles.lightboxNav} ${styles.lightboxNavLeft}`} onClick={prevImage}>
                  <ChevronLeft size={40} />
                </button>
                <button className={`${styles.lightboxNav} ${styles.lightboxNavRight}`} onClick={nextImage}>
                  <ChevronRight size={40} />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
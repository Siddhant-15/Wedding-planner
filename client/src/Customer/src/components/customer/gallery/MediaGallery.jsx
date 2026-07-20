import React, { useState, useEffect } from "react";
import { Play, X, ChevronLeft, ChevronRight } from "lucide-react";
import styles from "../styles/MediaGallery.module.css";

export default function MediaGallery({ media = [], serviceName = "Service" }) {
  const [activeTab, setActiveTab] = useState("images");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentModalIndex, setCurrentModalIndex] = useState(0);

  const images = media.filter(item => item.type === "image");
  const videos = media.filter(item => item.type === "video");

  const currentItems = activeTab === "images" ? images : videos;
  const currentItem = currentItems[currentModalIndex];

  const openModal = (index) => {
    setCurrentModalIndex(index);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const nextModal = () => {
    setCurrentModalIndex((prev) => (prev + 1) % currentItems.length);
  };

  const prevModal = () => {
    setCurrentModalIndex((prev) => (prev - 1 + currentItems.length) % currentItems.length);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e) => {
      if (!isModalOpen) return;
      if (e.key === "ArrowLeft") prevModal();
      if (e.key === "ArrowRight") nextModal();
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isModalOpen, currentItems.length]);

  if (media.length === 0) return null;

  return (
    <div className={styles.mediaGallery}>
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === "images" ? styles.active : ""}`}
          onClick={() => setActiveTab("images")}
        >
          Images ({images.length})
        </button>
        <button
          className={`${styles.tab} ${activeTab === "videos" ? styles.active : ""}`}
          onClick={() => setActiveTab("videos")}
        >
          Videos ({videos.length})
        </button>
      </div>

      <div className={styles.grid}>
        {currentItems.map((item, index) => (
          <button
            key={index}
            className={styles.mediaCard}
            onClick={() => openModal(index)}
          >
            {item.type === "image" ? (
              <img src={item.url} alt={`Media ${index + 1}`} loading="lazy" />
            ) : (
              <div className={styles.videoThumb}>
                <img
                  src={`https://img.youtube.com/vi/${new URL(item.url).searchParams.get("v")}/hqdefault.jpg`}
                  alt="Video thumbnail"
                  loading="lazy"
                />
                <div className={styles.playOverlay}>
                  <Play size={32} />
                </div>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Modal / Lightbox */}
      {isModalOpen && currentItem && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.modalClose} onClick={closeModal}>
              <X size={32} />
            </button>

            <div className={styles.modalCounter}>
              {currentModalIndex + 1} / {currentItems.length}
            </div>

            <div className={styles.modalMedia}>
              {currentItem.type === "image" ? (
                <img src={currentItem.url} alt="Fullscreen" />
              ) : (
                <iframe
                  src={currentItem.url.replace("watch?v=", "embed/")}
                  title="Video"
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                />
              )}
            </div>

            {currentItems.length > 1 && (
              <>
                <button className={`${styles.modalNav} ${styles.modalNavLeft}`} onClick={prevModal}>
                  <ChevronLeft size={40} />
                </button>
                <button className={`${styles.modalNav} ${styles.modalNavRight}`} onClick={nextModal}>
                  <ChevronRight size={40} />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
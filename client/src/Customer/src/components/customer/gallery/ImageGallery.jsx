import React, {
  useState,
  useMemo,
  useEffect,
  useCallback,
  memo,
} from "react";

import {
  X,
  ChevronLeft,
  ChevronRight,
  Play,
  Images,
  Film,
  ZoomIn,
} from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";

import styles from "../styles/ImageGallery.module.css";

/**
 * media = [
 *  {
 *    media_url,
 *    media_type, // image | video | youtube | vimeo
 *    is_cover
 *  }
 * ]
 */

const TABS = [
  {
    id: "images",
    label: "Images",
    icon: Images,
  },
  {
    id: "videos",
    label: "Videos",
    icon: Film,
  },
];

function ImageGallery({
  media = [],
  serviceName = "Service",
}) {
  const [tab, setTab] = useState("images");

  const [activeIndex, setActiveIndex] =
    useState(0);

  const [lightbox, setLightbox] =
    useState(null);

  // remove cover media
  const galleryMedia = useMemo(() => {
    return media.filter((m) => !m?.is_cover);
  }, [media]);

  const images = useMemo(() => {
    return galleryMedia.filter(
      (m) => m.media_type === "image"
    );
  }, [galleryMedia]);

  const videos = useMemo(() => {
    return galleryMedia.filter((m) =>
      ["video", "youtube", "vimeo"].includes(
        m.media_type
      )
    );
  }, [galleryMedia]);

  const filteredMedia = useMemo(() => {
    return tab === "images"
      ? images
      : videos;
  }, [tab, images, videos]);

  useEffect(() => {
    setActiveIndex(0);
  }, [tab]);

  // =========================
  // Helpers
  // =========================

  const getYoutubeId = (url = "") => {
    const match = url.match(
      /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{6,})/
    );

    return match ? match[1] : null;
  };

  const getVimeoId = (url = "") => {
    const match = url.match(
      /vimeo\.com\/(?:video\/)?(\d+)/
    );

    return match ? match[1] : null;
  };

  const getThumbnail = useCallback((item) => {
    if (item.media_type === "image") {
      return item.media_url;
    }

    if (item.media_type === "youtube") {
      const id = getYoutubeId(
        item.media_url
      );

      return id
        ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg`
        : "";
    }

    return "";
  }, []);

  const getEmbedUrl = (item) => {
    if (item.media_type === "youtube") {
      const id = getYoutubeId(
        item.media_url
      );

      return `https://www.youtube.com/embed/${id}?autoplay=1&rel=0`;
    }

    if (item.media_type === "vimeo") {
      const id = getVimeoId(
        item.media_url
      );

      return `https://player.vimeo.com/video/${id}?autoplay=1`;
    }

    return item.media_url;
  };

  // =========================
  // Navigation
  // =========================

  const next = useCallback(() => {
    setActiveIndex((prev) =>
      (prev + 1) % filteredMedia.length
    );
  }, [filteredMedia.length]);

  const prev = useCallback(() => {
    setActiveIndex((prev) =>
      (prev - 1 + filteredMedia.length) %
      filteredMedia.length
    );
  }, [filteredMedia.length]);

  const openLightbox = (
    item,
    index
  ) => {
    setLightbox({
      item,
      index,
    });

    setActiveIndex(index);
  };

  // =========================
  // Keyboard Support
  // =========================

  useEffect(() => {
    const handler = (e) => {
      if (!lightbox) return;

      if (e.key === "Escape") {
        setLightbox(null);
      }

      if (e.key === "ArrowRight") {
        const nextIndex =
          (lightbox.index + 1) %
          filteredMedia.length;

        openLightbox(
          filteredMedia[nextIndex],
          nextIndex
        );
      }

      if (e.key === "ArrowLeft") {
        const prevIndex =
          (lightbox.index -
            1 +
            filteredMedia.length) %
          filteredMedia.length;

        openLightbox(
          filteredMedia[prevIndex],
          prevIndex
        );
      }
    };

    window.addEventListener(
      "keydown",
      handler
    );

    return () =>
      window.removeEventListener(
        "keydown",
        handler
      );
  }, [lightbox, filteredMedia]);

  // body scroll lock
  useEffect(() => {
    if (lightbox) {
      document.body.style.overflow =
        "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [lightbox]);

  if (!galleryMedia.length) return null;

  return (
    <div className={styles.wrapper}>
      {/* ========================= */}
      {/* Header */}
      {/* ========================= */}

      <div className={styles.topBar}>
        <div className={styles.headingWrap}>
          <span className={styles.badge}>
            Gallery
          </span>

          <h2 className={styles.heading}>
            Visual Experience
          </h2>

          <p className={styles.subheading}>
            Explore premium moments from{" "}
            {serviceName}
          </p>
        </div>

        <div className={styles.tabs}>
          {TABS.map((tabItem) => {
            const Icon = tabItem.icon;

            const active =
              tab === tabItem.id;

            return (
              <button
                key={tabItem.id}
                className={`${styles.tab} ${active
                    ? styles.activeTab
                    : ""
                  }`}
                onClick={() =>
                  setTab(tabItem.id)
                }
              >
                <Icon size={16} />

                {tabItem.label}

                <span
                  className={
                    styles.count
                  }
                >
                  {tabItem.id ===
                    "images"
                    ? images.length
                    : videos.length}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================= */}
      {/* Main Slider */}
      {/* ========================= */}

      {!!filteredMedia.length && (
        <div className={styles.heroSlider}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              className={styles.heroMedia}
              initial={{
                opacity: 0,
                scale: 1.04,
              }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
              exit={{
                opacity: 0,
              }}
              transition={{
                duration: 0.5,
              }}
            >
              {filteredMedia[
                activeIndex
              ]?.media_type ===
                "image" ? (
                <>
                  <img
                    src={
                      filteredMedia[
                        activeIndex
                      ]?.media_url
                    }
                    alt={serviceName}
                    loading="lazy"
                    className={
                      styles.heroImage
                    }
                  />

                  <button
                    className={
                      styles.zoomBtn
                    }
                    onClick={() =>
                      openLightbox(
                        filteredMedia[
                        activeIndex
                        ],
                        activeIndex
                      )
                    }
                  >
                    <ZoomIn size={18} />
                  </button>
                </>
              ) : (
                <div
                  className={
                    styles.videoHero
                  }
                  onClick={() =>
                    openLightbox(
                      filteredMedia[
                      activeIndex
                      ],
                      activeIndex
                    )
                  }
                >
                  {getThumbnail(
                    filteredMedia[
                    activeIndex
                    ]
                  ) ? (
                    <img
                      src={getThumbnail(
                        filteredMedia[
                        activeIndex
                        ]
                      )}
                      alt="Video"
                      className={
                        styles.heroImage
                      }
                    />
                  ) : (
                    <div
                      className={
                        styles.videoPlaceholder
                      }
                    />
                  )}

                  <div
                    className={
                      styles.playButton
                    }
                  >
                    <Play
                      size={28}
                      fill="currentColor"
                    />
                  </div>
                </div>
              )}

              <div
                className={
                  styles.heroOverlay
                }
              />

              {filteredMedia.length >
                1 && (
                  <>
                    <button
                      className={`${styles.navBtn} ${styles.leftBtn}`}
                      onClick={prev}
                    >
                      <ChevronLeft
                        size={22}
                      />
                    </button>

                    <button
                      className={`${styles.navBtn} ${styles.rightBtn}`}
                      onClick={next}
                    >
                      <ChevronRight
                        size={22}
                      />
                    </button>
                  </>
                )}
            </motion.div>
          </AnimatePresence>
        </div>
      )}

      {/* ========================= */}
      {/* Gallery Grid */}
      {/* ========================= */}

      <motion.div
        className={styles.grid}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        variants={{
          hidden: {},
          show: {
            transition: {
              staggerChildren: 0.08,
            },
          },
        }}
      >
        {filteredMedia.map(
          (item, index) => {
            const isVideo =
              item.media_type !==
              "image";

            return (
              <motion.button
                key={`${item.media_url}-${index}`}
                className={`${styles.card} ${index ===
                    activeIndex
                    ? styles.activeCard
                    : ""
                  }`}
                variants={{
                  hidden: {
                    opacity: 0,
                    y: 20,
                  },
                  show: {
                    opacity: 1,
                    y: 0,
                  },
                }}
                whileHover={{
                  y: -6,
                  scale: 1.02,
                }}
                transition={{
                  duration: 0.3,
                }}
                onClick={() =>
                  openLightbox(
                    item,
                    index
                  )
                }
              >
                {getThumbnail(item) ? (
                  <img
                    src={getThumbnail(
                      item
                    )}
                    alt={`${serviceName}-${index}`}
                    loading="lazy"
                    className={
                      styles.cardImage
                    }
                  />
                ) : (
                  <div
                    className={
                      styles.videoPlaceholder
                    }
                  />
                )}

                <div
                  className={
                    styles.cardOverlay
                  }
                />

                {isVideo && (
                  <div
                    className={
                      styles.cardPlay
                    }
                  >
                    <Play
                      size={18}
                      fill="currentColor"
                    />
                  </div>
                )}
              </motion.button>
            );
          }
        )}
      </motion.div>

      {/* ========================= */}
      {/* Fullscreen Modal */}
      {/* ========================= */}

      <AnimatePresence>
        {lightbox && (
          <motion.div
            className={styles.modal}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() =>
              setLightbox(null)
            }
          >
            <button
              className={
                styles.closeBtn
              }
              onClick={() =>
                setLightbox(null)
              }
            >
              <X size={24} />
            </button>

            <div
              className={
                styles.modalContent
              }
              onClick={(e) =>
                e.stopPropagation()
              }
            >
              {lightbox.item
                .media_type ===
                "image" ? (
                <motion.img
                  src={
                    lightbox.item
                      .media_url
                  }
                  alt="Preview"
                  className={
                    styles.modalImage
                  }
                  initial={{
                    scale: 0.94,
                    opacity: 0,
                  }}
                  animate={{
                    scale: 1,
                    opacity: 1,
                  }}
                />
              ) : lightbox.item
                .media_type ===
                "video" ? (
                <video
                  src={
                    lightbox.item
                      .media_url
                  }
                  controls
                  autoPlay
                  playsInline
                  className={
                    styles.modalVideo
                  }
                />
              ) : (
                <div
                  className={
                    styles.iframeWrap
                  }
                >
                  <iframe
                    src={getEmbedUrl(
                      lightbox.item
                    )}
                    title="Video"
                    allow="autoplay; encrypted-media"
                    allowFullScreen
                  />
                </div>
              )}
            </div>

            {filteredMedia.length >
              1 && (
                <>
                  <button
                    className={`${styles.modalNav} ${styles.modalLeft}`}
                    onClick={(e) => {
                      e.stopPropagation();

                      const prevIndex =
                        (lightbox.index -
                          1 +
                          filteredMedia.length) %
                        filteredMedia.length;

                      openLightbox(
                        filteredMedia[
                        prevIndex
                        ],
                        prevIndex
                      );
                    }}
                  >
                    <ChevronLeft
                      size={28}
                    />
                  </button>

                  <button
                    className={`${styles.modalNav} ${styles.modalRight}`}
                    onClick={(e) => {
                      e.stopPropagation();

                      const nextIndex =
                        (lightbox.index +
                          1) %
                        filteredMedia.length;

                      openLightbox(
                        filteredMedia[
                        nextIndex
                        ],
                        nextIndex
                      );
                    }}
                  >
                    <ChevronRight
                      size={28}
                    />
                  </button>
                </>
              )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default memo(ImageGallery);
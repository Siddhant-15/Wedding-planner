import React, { useEffect, useState, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import styles from "./FullscreenMediaModal.module.css";

const getYouTubeId = (url = "") => {
    const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{6,})/);
    return m ? m[1] : null;
};
const getVimeoId = (url = "") => {
    const m = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
    return m ? m[1] : null;
};

const getEmbed = (item) => {
    if (item.media_type === "youtube") {
        const id = getYouTubeId(item.media_url);
        return id ? `https://www.youtube.com/embed/${id}?autoplay=1&modestbranding=1&rel=0` : "";
    }
    if (item.media_type === "vimeo") {
        const id = getVimeoId(item.media_url);
        return id ? `https://player.vimeo.com/video/${id}?autoplay=1` : "";
    }
    return "";
};

export default function FullscreenMediaModal({ media = [], startIndex = 0, onClose }) {
    const [index, setIndex] = useState(startIndex);
    const touchX = useRef(null);

    const next = useCallback(
        () => setIndex((i) => (i + 1) % media.length),
        [media.length]
    );
    const prev = useCallback(
        () => setIndex((i) => (i - 1 + media.length) % media.length),
        [media.length]
    );

    useEffect(() => {
        const onKey = (e) => {
            if (e.key === "Escape") onClose?.();
            if (e.key === "ArrowRight") next();
            if (e.key === "ArrowLeft") prev();
        };
        window.addEventListener("keydown", onKey);
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            window.removeEventListener("keydown", onKey);
            document.body.style.overflow = prevOverflow;
        };
    }, [next, prev, onClose]);

    if (!media.length) return null;
    const item = media[index];

    const onTouchStart = (e) => { touchX.current = e.touches[0].clientX; };
    const onTouchEnd = (e) => {
        if (touchX.current == null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        if (Math.abs(dx) > 50) (dx < 0 ? next() : prev());
        touchX.current = null;
    };

    const node = (
        <motion.div
            className={styles.backdrop}
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
            role="dialog"
            aria-modal="true"
        >
            <button className={styles.close} onClick={onClose} aria-label="Close">
                <X size={20} />
            </button>

            {media.length > 1 && (
                <>
                    <button
                        className={`${styles.nav} ${styles.prev}`}
                        onClick={(e) => { e.stopPropagation(); prev(); }}
                        aria-label="Previous"
                    >
                        <ChevronLeft size={22} />
                    </button>
                    <button
                        className={`${styles.nav} ${styles.next}`}
                        onClick={(e) => { e.stopPropagation(); next(); }}
                        aria-label="Next"
                    >
                        <ChevronRight size={22} />
                    </button>
                </>
            )}

            <AnimatePresence mode="wait">
                <motion.div
                    key={index}
                    className={styles.stage}
                    onClick={(e) => e.stopPropagation()}
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                >
                    {item.media_type === "image" && (
                        <img src={item.media_url} alt={`Media ${index + 1}`} className={styles.media} />
                    )}
                    {item.media_type === "video" && (
                        <video src={item.media_url} className={styles.video} controls autoPlay />
                    )}
                    {(item.media_type === "youtube" || item.media_type === "vimeo") && (
                        <iframe
                            className={styles.video}
                            src={getEmbed(item)}
                            title={`Video ${index + 1}`}
                            allow="autoplay; encrypted-media; picture-in-picture"
                            allowFullScreen
                        />
                    )}
                </motion.div>
            </AnimatePresence>

            {media.length > 1 && (
                <div className={styles.counter}>{index + 1} / {media.length}</div>
            )}
        </motion.div>
    );

    return createPortal(<AnimatePresence>{node}</AnimatePresence>, document.body);
}
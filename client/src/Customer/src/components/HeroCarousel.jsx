import React, { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./HeroCarousel.module.css";

export default function HeroCarousel({ media = [], serviceName = "" }) {
    const slides = useMemo(
        () => media.filter((m) => m?.media_type === "image" && m?.is_cover),
        [media]
    );

    const [index, setIndex] = useState(0);
    const touchX = useRef(null);

    const next = useCallback(
        () => setIndex((i) => (slides.length ? (i + 1) % slides.length : 0)),
        [slides.length]
    );
    const prev = useCallback(
        () => setIndex((i) => (slides.length ? (i - 1 + slides.length) % slides.length : 0)),
        [slides.length]
    );

    useEffect(() => {
        if (slides.length <= 1) return;
        const id = setInterval(next, 6000);
        return () => clearInterval(id);
    }, [next, slides.length]);

    const onTouchStart = (e) => { touchX.current = e.touches[0].clientX; };
    const onTouchEnd = (e) => {
        if (touchX.current == null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        if (Math.abs(dx) > 50) (dx < 0 ? next() : prev());
        touchX.current = null;
    };

    if (!slides.length) {
        return (
            <div className={styles.wrap}>
                <div className={styles.empty}>No cover images available</div>
            </div>
        );
    }

    return (
        <div
            className={styles.wrap}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
            role="region"
            aria-label={`${serviceName} cover gallery`}
        >
            <AnimatePresence mode="wait">
                <motion.div
                    key={index}
                    className={styles.slide}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                >
                    <img
                        src={slides[index].media_url}
                        alt={`${serviceName} cover ${index + 1}`}
                        className={styles.img}
                        loading="lazy"
                        decoding="async"
                    />
                </motion.div>
            </AnimatePresence>

            <div className={styles.gradient} />

            {slides.length > 1 && (
                <>
                    <button onClick={prev} className={`${styles.nav} ${styles.prev}`} aria-label="Previous">
                        <ChevronLeft size={20} />
                    </button>
                    <button onClick={next} className={`${styles.nav} ${styles.next}`} aria-label="Next">
                        <ChevronRight size={20} />
                    </button>

                    <div className={styles.counter}>{index + 1} / {slides.length}</div>

                    <div className={styles.dots}>
                        {slides.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setIndex(i)}
                                className={`${styles.dot} ${i === index ? styles.dotActive : ""}`}
                                aria-label={`Go to slide ${i + 1}`}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
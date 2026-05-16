import React from "react";
import { motion } from "framer-motion";
import { MapPin, Star, Heart, Share2, PenSquare, BadgeCheck } from "lucide-react";
import styles from "./ServiceInfoCard.module.css";

export default function ServiceInfoCard({
    serviceType,
    serviceName,
    location,
    rating = 0,
    reviewCount = 0,
    verified = false,
    inWishlist = false,
    onWishlist,
    onShare,
    onWriteReview,
}) {
    return (
        <motion.section
            className={styles.card}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
            <div className={styles.left}>
                <div className={styles.badges}>
                    {serviceType && <span className={styles.badge}>{serviceType}</span>}
                    {verified && (
                        <span className={`${styles.badge} ${styles.badgeMuted}`}>
                            <BadgeCheck size={12} /> Verified
                        </span>
                    )}
                </div>

                <h1 className={styles.title}>{serviceName}</h1>

                <div className={styles.meta}>
                    {rating > 0 && (
                        <span className={styles.metaItem}>
                            <Star size={15} className={styles.rating} fill="currentColor" />
                            <span className={styles.rating}>{rating.toFixed(1)}</span>
                            <span>({reviewCount} reviews)</span>
                        </span>
                    )}
                    {location && (
                        <>
                            <span className={styles.dot} />
                            <span className={styles.metaItem}><MapPin size={15} /> {location}</span>
                        </>
                    )}
                </div>
            </div>

            <div className={styles.actions}>
                <button
                    className={`${styles.btn} ${styles.btnIcon}`}
                    onClick={onWishlist}
                    aria-label="Add to wishlist"
                >
                    <Heart size={18} className={`${styles.heart} ${inWishlist ? styles.heartActive : ""}`} />
                </button>
                <button className={`${styles.btn} ${styles.btnIcon}`} onClick={onShare} aria-label="Share">
                    <Share2 size={18} />
                </button>
                <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={onWriteReview}>
                    <PenSquare size={16} /> Write Review
                </button>
            </div>
        </motion.section>
    );
}
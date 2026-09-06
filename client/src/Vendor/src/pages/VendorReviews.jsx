import React from "react";
import { Star } from "lucide-react";

import { reviewsSummaryMock, reviewsListMock } from "../mock/Vendordashboardmock";
import styles from "../styles/Vendorreview.module.css";

function Stars({ count, size = 14 }) {
    return (
        <span className={styles.stars}>
            {Array.from({ length: 5 }).map((_, i) => (
                <Star
                    key={i}
                    size={size}
                    className={i < count ? styles.starFilled : styles.starEmpty}
                    fill={i < count ? "currentColor" : "none"}
                />
            ))}
        </span>
    );
}

export default function VendorReviews() {
    const { overall, totalReviews, breakdown } = reviewsSummaryMock;

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <h1>Reviews</h1>
                <p>What customers are saying about your services.</p>
            </header>

            <div className={styles.summaryRow}>
                <div className={styles.overallCard}>
                    <h2>{overall.toFixed(1)}</h2>
                    <Stars count={Math.round(overall)} size={18} />
                    <p>{totalReviews} Reviews</p>
                </div>

                <div className={styles.breakdownCard}>
                    {Object.entries(breakdown).map(([label, value]) => (
                        <div key={label} className={styles.breakdownRow}>
                            <span className={styles.breakdownLabel}>{label}</span>
                            <div className={styles.breakdownTrack}>
                                <div
                                    className={styles.breakdownFill}
                                    style={{ width: `${(value / 5) * 100}%` }}
                                />
                            </div>
                            <span className={styles.breakdownValue}>{value.toFixed(1)}</span>
                        </div>
                    ))}
                </div>
            </div>

            <p className={styles.mockNote}>
                Review data shown below is placeholder content until the reviews API is connected.
            </p>

            {reviewsListMock.length === 0 ? (
                <div className={styles.empty}>
                    <h3>No reviews yet</h3>
                    <p>Reviews from customers will appear here after completed events.</p>
                </div>
            ) : (
                <div className={styles.list}>
                    {reviewsListMock.map((r) => (
                        <article key={r.id} className={styles.reviewCard}>
                            <div className={styles.reviewHead}>
                                <Stars count={r.rating} />
                                <span className={styles.reviewDate}>{r.date}</span>
                            </div>
                            <p className={styles.reviewText}>{r.text}</p>
                            <div className={styles.reviewFooter}>
                                <strong>{r.author}</strong>
                                <span>{r.event}</span>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </div>
    );
}
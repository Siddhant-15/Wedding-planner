import React from "react";
import WishlistCard from "./WishlistCard";
import styles from "../../../styles/WishlistGrid.module.css";

const SkeletonCard = () => (
  <div className={styles.skeleton}>
    <div className={styles.skCover} />
    <div className={styles.skBody}>
      <div className={styles.skLine} style={{ width: "60%" }} />
      <div className={styles.skLine} style={{ width: "40%" }} />
    </div>
  </div>
);

const WishlistGrid = ({
  wishlists = [],
  loading = false,
  emptyMessage = "No wishlists yet.",
  onOpen, onRename, onDelete, onShare,
  emptyAction = null,
}) => {
  if (loading) {
    return (
      <div className={styles.grid}>
        {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    );
  }
  if (!wishlists.length) {
    return (
      <div className={styles.empty}>
        <div className={styles.emptyIcon}>
          <svg viewBox="0 0 24 24" width="48" height="48" aria-hidden="true">
            <path d="M12 21s-7.5-4.6-10-9.2C.4 8.6 2 5 5.5 5c2 0 3.5 1.1 4.5 2.6C11 6.1 12.5 5 14.5 5 18 5 19.6 8.6 22 11.8 19.5 16.4 12 21 12 21z" fill="none" stroke="currentColor" strokeWidth="1.6" />
          </svg>
        </div>
        <h3>{emptyMessage}</h3>
        <p>Save services you love and organize them into beautiful collections.</p>
        {emptyAction}
      </div>
    );
  }
  return (
    <div className={styles.grid}>
      {wishlists.map((w) => (
        <WishlistCard
          key={w.id}
          wishlist={w}
          onOpen={onOpen}
          onRename={onRename}
          onDelete={onDelete}
          onShare={onShare}
        />
      ))}
    </div>
  );
};

export default WishlistGrid;

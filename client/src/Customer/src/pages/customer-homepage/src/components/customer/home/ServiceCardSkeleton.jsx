import React from "react";
import styles from "./ServiceCardSkeleton.module.css";

export default function ServiceCardSkeleton() {
  return (
    <div className={styles.card} aria-hidden="true">
      <div className={styles.image} />
      <div className={styles.body}>
        <div className={`${styles.line} ${styles.lineLg}`} />
        <div className={`${styles.line} ${styles.lineMd}`} />
        <div className={styles.row}>
          <div className={`${styles.line} ${styles.lineSm}`} />
          <div className={`${styles.line} ${styles.linePill}`} />
        </div>
        <div className={styles.btn} />
      </div>
    </div>
  );
}

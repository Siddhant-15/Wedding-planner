import React from "react";
import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import styles from "../styles/MobileBottomBar.module.css";

const formatPrice = (price) => {
  if (!price) return "Price on request"; // ✅ FIX

  if (price >= 100000) {
    return `₹${(price / 100000).toFixed(1)}L`;
  }
  if (price >= 1000) {
    return `₹${(price / 1000).toFixed(0)}K`;
  }
  return `₹${price.toLocaleString()}`;
};

export default function MobileBottomBar({ price, onCheckAvailability }) {
  return (
    <div className={styles.bar}>
      <div className={styles.container}>
        <div className={styles.priceBlock}>
          <p className={styles.label}>Starting from</p>
          <p className={styles.price}>{formatPrice(price)}</p>
        </div>

        <Button
          onClick={onCheckAvailability}
          className={styles.actionBtn}
        >
          <Calendar className={styles.icon} />
          Check Availability
        </Button>
      </div>
    </div>
  );
}

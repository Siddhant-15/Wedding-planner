import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "./CTASection.module.css";

export default function CTASection() {
  const navigate = useNavigate();
  return (
    <section className={styles.wrap} aria-label="Start booking">
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.copy}>
            <h2 className={styles.title}>Ready to plan your event?</h2>
            <p className={styles.sub}>
              Discover trusted vendors, compare quotes and book — all in a few clicks.
            </p>
          </div>
          <button
            type="button"
            className={styles.btn}
            onClick={() => navigate("/services")}
          >
            Start Booking
          </button>
        </div>
      </div>
    </section>
  );
}

import React from "react";
import { Link } from "react-router-dom";
import logo from "@/assets/logo.png";
import styles from "../styles/Brand.module.css";

function Brand({ tagline = "Weddings & Celebrations" }) {
  return (
    <Link to="/" className={styles.brand} aria-label="Mangalam home">
      <img src={logo} alt="Mangalam" className={styles.logo} />
      <span className={styles.brandTextWrap}>
        <span className={styles.brandText}>Mangalam</span>
        <span className={styles.brandTagline}>{tagline}</span>
      </span>
    </Link>
  );
}

export default Brand;

import React from "react";
import styles from "../../styles/Loader.module.css"
import logo from "@/assets/logo.png"; // adjust path if needed

export function Loader({ className = "", size = "md", text }) {
  const sizeClasses = {
    sm: styles.small,
    md: styles.medium,
    lg: styles.large
  };

  const logoSizes = {
    sm: styles.logoSmall,
    md: styles.logoMedium,
    lg: styles.logoLarge
  };

  return (
    <div className={`${styles.container}`}>
      <div className={`${styles.spinnerWrapper} ${sizeClasses[size]}`}>
        {/* Outer ethereal ring */}
        <div className={styles.outerRing}></div>

        {/* Middle floating ring */}
        <div className={styles.middleRing}></div>

        {/* Inner shimmer ring */}
        <div className={styles.innerRing}></div>

        {/* Floating particles */}
        <div className={styles.particles}>
          <div className={`${styles.particle} ${styles.orbit1}`}></div>
          <div className={`${styles.particle} ${styles.orbit2}`}></div>
          <div className={`${styles.particle} ${styles.orbit3}`}></div>
        </div>

        {/* Central glow */}
        <div className={styles.centralGlow}></div>

        {/* Logo container */}
        <div className={styles.logoWrapper}>
          <div className={styles.logoBg}></div>
          <img
            src={logo}
            alt="Mangalutsav"
            className={`${styles.logo} ${logoSizes[size]}`}
          />
        </div>

        {/* Ethereal overlay */}
        <div className={styles.overlay}></div>
      </div>

      {text && (
        <div className={styles.textWrapper}>
          <p className={styles.text}>{text}</p>
          <div className={styles.dots}>
            <div className={styles.dot}></div>
            <div className={styles.dot}></div>
            <div className={styles.dot}></div>
          </div>
        </div>
      )}
    </div>
  );
}

export function PageLoader() {
  return (
    <div className={styles.pageLoader}>
      <div className={styles.pageOverlay}></div>
      <Loader size="lg" text="Crafting your experience..." />
    </div>
  );
}

export function InlineLoader({ text = "Loading..." }) {
  return (
    <div className={styles.inlineLoader}>
      <Loader size="md" text={text} />
    </div>
  );
}

export function MiniLoader() {
  return (
    <div className={styles.miniLoader}>
      <div className={styles.miniOuter}></div>
      <div className={styles.miniInner}></div>
    </div>
  );
}

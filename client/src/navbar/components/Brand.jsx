import { Link } from "react-router-dom";
import logo from "@/assets/logo.png";

import styles from "../styles/Brand.module.css";

function Brand() {
  return (
    <Link
      to="/"
      className={styles.brand}
      aria-label="Celebration Basket Home"
    >
      <img
        src={logo}
        alt="Celebration Basket Logo"
        className={styles.logo}
      />

      <span className={styles.divider} />

      <div className={styles.textWrapper}>
        <span className={styles.title}>Celebration Basket</span>
        <span className={styles.tagline}>
          Weddings • Events • Celebrations
        </span>
      </div>
    </Link>
  );
}

export default Brand;
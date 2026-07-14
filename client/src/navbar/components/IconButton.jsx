import React, { forwardRef } from "react";
import styles from "../styles/IconButton.module.css";

/** Square icon button with optional notification badge. */
const IconButton = forwardRef(function IconButton(
  { children, badge, ariaLabel, onClick, className, ...rest },
  ref
) {
  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={`${styles.iconBtn} ${className || ""}`}
      {...rest}
    >
      {children}
      {badge ? <span className={styles.badge}>{badge > 99 ? "99+" : badge}</span> : null}
    </button>
  );
});

export default IconButton;
